import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Shield, User, Trash2, RefreshCw, UserCheck, UserX, ShieldCheck, ShieldAlert } from 'lucide-react';

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

    if (profile.role === 'admin' && newRole === 'operator') {
      const adminCount = profiles.filter(p => p.role === 'admin').length;
      if (adminCount <= 1) {
        alert('⚠️ Atenção: É necessário manter pelo menos 1 administrador no sistema.');
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
    if (profile.role === 'admin') {
      const adminCount = profiles.filter(p => p.role === 'admin').length;
      if (adminCount <= 1) {
        alert('⚠️ Atenção: Não é permitido excluir o único administrador restante!');
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
    <div className="space-y-6 max-w-5xl mx-auto w-full animate-in fade-in duration-300 pb-20 px-2 sm:px-0">
      {/* Header Card */}
      <div className="bg-sky-950 text-white p-6 sm:p-8 rounded-[32px] shadow-xl relative overflow-hidden border border-sky-900">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-amber-400 text-sky-950 rounded-2xl shadow-md"><Users className="w-6 h-6" /></div>
               <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Gestão de Equipe & Usuários</h2>
            </div>
            <p className="text-sky-300 text-xs font-bold uppercase tracking-widest pl-1">Aprovação de acessos e permissões do aeroporto</p>
          </div>
          <button
            onClick={fetchProfiles}
            className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-95 text-xs font-black uppercase tracking-wider border border-white/10 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
      </div>

      {/* Admin Notice */}
      <div className="bg-amber-50 border-2 border-amber-200/80 p-4 sm:p-5 rounded-3xl flex items-start gap-3.5 shadow-xs">
        <div className="p-2 bg-amber-400 text-amber-950 rounded-xl shrink-0 mt-0.5"><Shield className="w-5 h-5" /></div>
        <div className="space-y-1">
          <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">Diretrizes de Segurança & Aprovação</h4>
          <p className="text-[11px] text-amber-800/90 font-medium leading-relaxed">
            Novos cadastros exigem aprovação prévia de um Administrador. Toque nos ícones de ação para aprovar/bloquear acessos, alternar privilégios de administrador ou remover usuários.
          </p>
        </div>
      </div>

      {/* Users List Container */}
      <div className="bg-white rounded-[32px] border-2 border-slate-100 overflow-hidden shadow-sm">
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Usuários Cadastrados ({profiles.length})</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Sincronizado com Supabase</span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando usuários...</span>
            </div>
          ) : profiles.length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-bold uppercase text-xs">Nenhum usuário cadastrado</div>
          ) : (
            profiles.map((profile) => (
              <div key={profile.id} className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors group">
                {/* User Info */}
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${profile.role === 'admin' ? 'bg-sky-100 text-sky-700 border-sky-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {profile.role === 'admin' ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
                  </div>
                  <div className="overflow-hidden space-y-1">
                    <span className="block text-sm sm:text-base font-black text-slate-900 truncate tracking-tight">{profile.email}</span>
                    <div className="flex items-center gap-2 flex-wrap">
                       <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest border ${profile.role === 'admin' ? 'bg-sky-600 text-white border-sky-700 shadow-2xs' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                         {profile.role === 'admin' ? 'Administrador' : 'Operador'}
                       </span>
                       <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest border ${profile.approved ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                         {profile.approved ? 'Aprovado' : 'Pendente'}
                       </span>
                       <span className="text-[10px] text-slate-400 font-mono">Cadastrado em: {new Date(profile.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Icon Group - Compact & Intuitive */}
                <div className="flex items-center gap-2.5 justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {/* Toggle Approval Button (Icon-based) */}
                  <button
                    disabled={isProcessing}
                    onClick={() => toggleApproval(profile)}
                    className={`p-3 rounded-2xl transition-all shadow-xs border cursor-pointer active:scale-95 ${
                      profile.approved
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    }`}
                    title={profile.approved ? 'Acesso Aprovado (Clique para bloquear)' : 'Acesso Pendente (Clique para aprovar)'}
                  >
                    {profile.approved ? <UserCheck className="w-5 h-5 stroke-[2.5]" /> : <UserX className="w-5 h-5 stroke-[2.5]" />}
                  </button>

                  {/* Toggle Admin Role Button (Icon-based) */}
                  <button
                    disabled={isProcessing}
                    onClick={() => toggleRole(profile)}
                    className={`p-3 rounded-2xl transition-all shadow-xs border cursor-pointer active:scale-95 ${
                      profile.role === 'admin'
                        ? 'bg-sky-600 text-white border-sky-700 hover:bg-sky-700'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                    title={profile.role === 'admin' ? 'Administrador (Clique para remover privilégio)' : 'Operador (Clique para tornar Administrador)'}
                  >
                    {profile.role === 'admin' ? <ShieldCheck className="w-5 h-5 stroke-[2.5]" /> : <ShieldAlert className="w-5 h-5 stroke-[2.5]" />}
                  </button>

                  {/* Delete User Button (Icon-based) */}
                  <button
                    disabled={isProcessing}
                    onClick={() => deleteUser(profile)}
                    className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl transition-all border border-rose-200 shadow-xs cursor-pointer active:scale-95"
                    title="Excluir usuário permanentemente"
                  >
                    <Trash2 className="w-5 h-5 stroke-[2.5]" />
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
