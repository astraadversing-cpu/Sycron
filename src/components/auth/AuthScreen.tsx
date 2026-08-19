import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Radio,
  Sparkles,
} from 'lucide-react';
import { useSycron } from '../../context/SycronContext';

export const AuthScreen: React.FC = () => {
  const { login, register, loginWithGoogle } = useSycron();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Error feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      setErrorMsg('Informe um endereço de e-mail corporativo válido.');
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMsg('Informe sua senha de acesso.');
      return;
    }

    setIsLoading(true);
    const result = await login(loginEmail, loginPassword);
    setIsLoading(false);
    if (!result.success) setErrorMsg(result.error || 'Credenciais inválidas. Verifique os dados informados.');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim()) {
      setErrorMsg('Informe seu nome completo ou indicativo operacional.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('Informe um endereço de e-mail válido.');
      return;
    }
    if (!regPhone.trim()) {
      setErrorMsg('Informe seu telefone com DDD para 2FA.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }
    if (!acceptTerms) {
      setErrorMsg('Você precisa aceitar os termos de sigilo operacional.');
      return;
    }

    setIsLoading(true);
    const result = await register(regName, regEmail, regPhone, regPassword, acceptTerms);
    setIsLoading(false);
    if (!result.success) setErrorMsg(result.error || 'Falha ao cadastrar na rede SYCRON.');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setErrorMsg('Informe o e-mail cadastrado na plataforma.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotSuccess(true);
    }, 500);
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Não foi possível entrar com o Google.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto relative select-none">
      {/* Top Brand Area */}
      <div className="pt-4 sm:pt-8 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-sm bg-[#111111] border border-[#252525] mx-auto shadow-xl">
          <Shield size={28} className="text-white" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-mono tracking-tighter text-white">
            SYCRON
          </h1>
          <p className="text-[10px] text-[#666666] uppercase tracking-[0.25em] font-mono">
            Intelligence Network Platform
          </p>
          <p className="text-xs text-[#BDBDBD] font-mono italic pt-1">
            "Connect intelligence. Detect what matters."
          </p>
        </div>

        {/* Security protocol tag */}
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-sm bg-[#050505] border border-[#252525] text-[9px] font-mono text-[#BDBDBD]">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[#666666]">GATE:</span>
          <span className="text-white font-bold">ZERO-TRUST 256-BIT</span>
        </div>
      </div>

      {/* Main Authentication Box */}
      <div className="my-6 bg-[#050505] border border-[#252525] rounded-sm p-4 sm:p-5 shadow-2xl space-y-4">
        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#000000] border border-[#252525] rounded-sm">
          <button
            id="tab-btn-login"
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-mono font-bold rounded-sm transition-colors cursor-pointer min-h-[38px] ${
              mode === 'LOGIN'
                ? 'bg-[#FFFFFF] text-[#000000]'
                : 'text-[#666666] hover:text-[#BDBDBD]'
            }`}
          >
            ENTRAR
          </button>
          <button
            id="tab-btn-register"
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-mono font-bold rounded-sm transition-colors cursor-pointer min-h-[38px] ${
              mode === 'REGISTER'
                ? 'bg-[#FFFFFF] text-[#000000]'
                : 'text-[#666666] hover:text-[#BDBDBD]'
            }`}
          >
            CRIAR CONTA
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-[#111111] border border-[#666666] rounded-sm flex items-start space-x-2 text-xs text-[#FFFFFF]">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-white" />
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}

        {/* 1. LOGIN MODE */}
        {mode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-[#666666]">
                E-mail Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#666666]">
                  <Mail size={14} />
                </div>
                <input
                  id="input-login-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="analista@sycron.net"
                  className="w-full bg-[#000000] border border-[#252525] rounded-sm py-2.5 pl-9 pr-3 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white font-mono min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-mono tracking-wider text-[#666666]">
                  Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('FORGOT');
                    setErrorMsg(null);
                    setForgotSuccess(false);
                  }}
                  className="text-[10px] text-[#BDBDBD] hover:text-white font-mono transition-colors cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#666666]">
                  <Lock size={14} />
                </div>
                <input
                  id="input-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#000000] border border-[#252525] rounded-sm py-2.5 pl-9 pr-9 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white font-mono min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#666666] hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-[#BDBDBD] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#252525] bg-[#000000] text-white focus:ring-0"
                />
                <span className="text-[11px]">Lembrar sessão segura</span>
              </label>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#FFFFFF] hover:bg-[#E0E0E0] text-[#000000] font-bold text-xs uppercase tracking-widest rounded-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer min-h-[44px] shadow-lg disabled:opacity-50"
            >
              <span>{isLoading ? 'AUTENTICANDO...' : 'ACESSAR PLATAFORMA'}</span>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 bg-[#111111] hover:bg-[#1a1a1a] border border-[#252525] hover:border-[#666666] text-white text-[11px] font-mono rounded-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer min-h-[40px] disabled:opacity-50"
            >
              <span className="font-bold text-sm">G</span>
              <span>Entrar com Google</span>
            </button>

          </form>
        )}

        {/* 2. REGISTER MODE */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-[#666666]">
                Nome / Indicativo Operacional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#666666]">
                  <UserIcon size={14} />
                </div>
                <input
                  id="input-reg-name"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Carlos Drumond"
                  className="w-full bg-[#000000] border border-[#252525] rounded-sm py-2.5 pl-9 pr-3 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white font-mono min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-[#666666]">
                E-mail Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#666666]">
                  <Mail size={14} />
                </div>
                <input
                  id="input-reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="carlos@empresa.com.br"
                  className="w-full bg-[#000000] border border-[#252525] rounded-sm py-2.5 pl-9 pr-3 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white font-mono min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-[#666666]">
                Telefone (Canal 2FA)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#666666]">
                  <Phone size={14} />
                </div>
                <input
                  id="input-reg-phone"
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+55 (11) 98765-4321"
                  className="w-full bg-[#000000] border border-[#252525] rounded-sm py-2.5 pl-9 pr-3 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white font-mono min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-[#666666]">
                  Senha
                </label>
                <input
                  id="input-reg-pass"
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#000000] border border-[#252525] rounded-sm py-2.5 px-3 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white font-mono min-h-[44px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-[#666666]">
                  Confirmar
                </label>
                <input
                  id="input-reg-confirm-pass"
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#000000] border border-[#252525] rounded-sm py-2.5 px-3 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white font-mono min-h-[44px]"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start space-x-2 text-xs text-[#BDBDBD] cursor-pointer">
                <input
                  id="checkbox-accept-terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#252525] bg-[#000000] text-white focus:ring-0"
                />
                <span className="text-[10px] leading-tight">
                  Aceito os termos de sigilo operacional e código de ética da rede SYCRON.
                </span>
              </label>
            </div>

            <button
              id="btn-submit-register"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#FFFFFF] hover:bg-[#E0E0E0] text-[#000000] font-bold text-xs uppercase tracking-widest rounded-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer min-h-[44px] shadow-lg disabled:opacity-50"
            >
              <span>{isLoading ? 'CRIANDO CONTA...' : 'REGISTRAR PARTICIPANTE'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD MODE */}
        {mode === 'FORGOT' && (
          <div className="space-y-3.5">
            {forgotSuccess ? (
              <div className="p-4 bg-[#111111] border border-[#252525] rounded-sm text-center space-y-2">
                <CheckCircle2 size={24} className="text-white mx-auto" />
                <h3 className="text-xs font-bold text-white font-mono">LINK ENVIADO</h3>
                <p className="text-[11px] text-[#BDBDBD]">
                  As instruções de redefinição de chave e código OTP foram enviadas para{' '}
                  <strong className="text-white">{forgotEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('LOGIN');
                    setForgotSuccess(false);
                  }}
                  className="w-full py-2.5 bg-white text-black font-bold text-xs uppercase rounded-sm mt-2"
                >
                  VOLTAR AO LOGIN
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-[#666666]">
                    E-mail Cadastrado
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#666666]">
                      <Mail size={14} />
                    </div>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="seu.email@empresa.com"
                      className="w-full bg-[#000000] border border-[#252525] rounded-sm py-2.5 pl-9 pr-3 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white font-mono min-h-[44px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#FFFFFF] hover:bg-[#E0E0E0] text-[#000000] font-bold text-xs uppercase tracking-widest rounded-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer min-h-[44px]"
                >
                  <span>{isLoading ? 'ENVIANDO...' : 'ENVIAR INSTRUÇÕES'}</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('LOGIN');
                    setErrorMsg(null);
                  }}
                  className="w-full py-2 text-xs text-[#666666] hover:text-white font-mono text-center block cursor-pointer"
                >
                  ← Voltar para o Login
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer Details */}
      <div className="pb-4 text-center space-y-1.5 font-mono text-[10px] text-[#666666]">
        <div className="flex items-center justify-center space-x-2">
          <Radio size={11} className="text-white" />
          <span>SYCRON CORE // VERSION 4.2.0</span>
        </div>
        <p className="text-[9px] uppercase tracking-wider">
          &copy; 2026 SYCRON. TODOS OS DIREITOS RESERVADOS.
        </p>
      </div>
    </div>
  );
};
