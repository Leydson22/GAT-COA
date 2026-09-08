import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plane, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isRegistering) {
      // Pré-verificação na tabela profiles para negar criação se já existir
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (existingUser) {
        setError('Este e-mail já está cadastrado no sistema.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        let msg = error.message;
        if (msg.includes('User already registered') || msg.includes('already registered')) {
          msg = 'Este e-mail já está cadastrado no sistema.';
        } else if (msg.includes('Password should be at least')) {
          msg = 'A senha deve ter pelo menos 6 caracteres.';
        }
        setError(msg);
        setLoading(false);
      } else {
        alert('Conta criada com sucesso! Você já pode entrar.');
        setIsRegistering(false);
        setLoading(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-sky-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-sky-900 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-900 rounded-full blur-3xl opacity-30"></div>

      <div className="max-w-md w-full space-y-8 z-10">
        <div className="text-center animate-in slide-in-from-top-4 duration-500">
          <div className="w-20 h-20 bg-amber-400 text-sky-950 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3">
            <Plane className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
            Gestão de Pátio
          </h1>
          <p className="text-sky-300 font-bold text-xs uppercase tracking-widest mt-1">
            Aeroporto de Cuiabá • COA
          </p>
        </div>

        <form onSubmit={handleAuth} className="bg-white p-8 rounded-[40px] shadow-2xl space-y-5 border border-white/20 animate-in fade-in zoom-in-95 duration-300">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
              {isRegistering ? 'Nova Conta' : 'Acesso Restrito'}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-sky-600 outline-none font-bold text-slate-800 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-sky-600 outline-none font-bold text-slate-800 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-xs font-bold animate-in fade-in zoom-in-95">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50 ${isRegistering ? 'bg-emerald-600 shadow-emerald-900/20' : 'bg-sky-900 shadow-sky-900/20'}`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isRegistering ? (
                'Criar minha Conta'
              ) : (
                'Entrar no Sistema'
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="w-full py-2 text-[10px] font-black text-sky-700 uppercase tracking-widest hover:text-sky-900 transition-colors"
            >
              {isRegistering ? 'Já tenho uma conta? Entrar' : 'Não tem acesso? Cadastre-se'}
            </button>
          </div>
        </form>

        <p className="text-center text-sky-400/60 text-[10px] font-bold uppercase tracking-widest">
          v1.6.0 • © 2026 COA Operações
        </p>
      </div>
    </div>
  );
};
