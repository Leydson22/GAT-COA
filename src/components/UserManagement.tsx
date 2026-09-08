import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Shield, User, Trash2, RefreshCw } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'operator';
  approved: boolean;
  created_at: string;
}

export const UserManagement: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  };

  const toggleApproval = async (profile: Profile) => {
    const newApproval = !profile.approved;
    if (!window.confirm(`${newApproval ? 'Aprovar acesso de' : 'Bloquear acesso de'} ${profile.email}?`)) return;

    setIsProcessing(true);
    const { error } = await supabase
      .from('profiles')
      .update({ approved: newApproval })
      .eq('id', profile.id);

    if (!error) {
      fetchProfiles();
    } else {
      alert('Erro ao atualizar aprovação: ' + error.message);
    }
    setIsProcessing(false);
  };

  const toggleRole = async (profile: Profile) => {
    const newRole = profile.role === 'admin' ? 'operator' : 'admin';

    // SAFETY CHECK: Prevent demoting the last admin
    if (profile.role === 'admin' && newRole === 'operator') {
      const adminCount = profiles.filter(p => p.role === 'admin').length;
      if (adminCount <= 1) {
        alert('⚠️ Atenção: É necessário manter pelo menos 1 administrador no sistema para evitar bloqueio.');
        return;
      }
    }

    if (!window.confirm(`Mudar o nível de acesso de ${profile.email} para ${newRole.toUpperCase()}?`)) return;

    setIsProcessing(true);
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profile.id);

    if (!error) {
      fetchProfiles();
    } else {
      alert('Erro ao atualizar papel: ' + error.message);
    }
    setIsProcessing(false);
  };

  const deleteUser = async (profile: Profile) => {
    // SAFETY CHECK: Prevent deleting the last admin
    if (profile.role === 'admin') {
      const adminCount = profiles.filter(p => p.role === 'admin').length;
      if (adminCount <= 1) {
        alert('⚠️ Atenção: Não é permitido excluir o único administrador restante do sistema!');
        return;
      }
    }

    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${profile.email}?`)) return;

    setIsProcessing(true);
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profile.id);

    if (!error) {
      fetchProfiles();
    } else {
      alert('Erro ao excluir usuário: ' + error.message);
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-300 pb-20">
      {/* Header Card */}
      <div className="bg-sky-900 text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
               <div className="p-2.5 bg-amber-400 text-sky-950 rounded-xl"><Users className="w-6 h-6" /></div>
               <h2 className="text-xl font-black uppercase tracking-tight">Administração de Usuários</h2>
            </div>
            <p className="text-sky-300 text-xs font-bold uppercase tracking-widest pl-1">Aprovação de acessos e permissões da equipe</p>
          </div>
          <button
            onClick={fetchProfiles}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      </div>

      {/* Admin Notice */}
      <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-black text-amber-900 uppercase">Fluxo de Aprovação de Novos Cadastros</h4>
          <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
            Novos usuários que se cadastrarem ficarão com acesso pendente até que um Administrador clique em <strong>"Aprovar"</strong> nesta tela.
            <br />🔒 <em>O sistema protege contra a exclusão ou rebaixamento do último administrador restante.</em>
          </p>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-[32px] border-2 border-slate-100 overflow-hidden shadow-sm">
        <div className="p-2 border-b border-slate-50 bg-slate-50/50">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-2 px-4">Usuários Registrados</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-sky-200 animate-spin" />
              <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Carregando Usuários...</span>
            </div>
          ) : profiles.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-bold uppercase text-[10px]">Nenhum usuário encontrado</div>
          ) : (
            profiles.map((profile) => (
              <div key={profile.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${profile.role === 'admin' ? 'bg-sky-100 text-sky-700 border-sky-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {profile.role === 'admin' ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
                  </div>
                  <div className="overflow-hidden space-y-0.5">
                    <span className="block text-sm font-black text-slate-800 truncate uppercase leading-tight">{profile.email}</span>
                    <div className="flex items-center gap-2 flex-wrap">
                       <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border ${profile.role === 'admin' ? 'bg-sky-600 text-white border-sky-700' : 'bg-white text-slate-500 border-slate-300'}`}>
                         {profile.role}
                       </span>
                       <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border ${profile.approved ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                         {profile.approved ? 'Aprovado' : 'Pendente'}
                       </span>
                       <span className="text-[9px] text-slate-400 font-mono">Entrou: {new Date(profile.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <button
                    disabled={isProcessing}
                    onClick={() => toggleApproval(profile)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-xs border ${profile.approved ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'}`}
                  >
                    {profile.approved ? 'Bloquear' : 'Aprovar'}
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={() => toggleRole(profile)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-xs border ${profile.role === 'admin' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-400 text-sky-950 border-amber-500'}`}
                  >
                    {profile.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={() => deleteUser(profile)}
                    className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all border border-rose-100 shadow-xs"
                    title="Excluir usuário"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
