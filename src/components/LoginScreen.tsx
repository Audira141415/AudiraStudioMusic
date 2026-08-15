import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Music, ShieldCheck, Key, LogIn, Disc, AlertTriangle } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate credentials: Username: Admin, Password: Audira
    const isUserValid = username.trim().toLowerCase() === 'admin';
    const isPassValid = password.trim() === 'Audira';

    if (isUserValid && isPassValid) {
      setErrorMsg(null);
      if (rememberMe) {
        localStorage.setItem('audira_authenticated', 'true');
      } else {
        sessionStorage.setItem('audira_authenticated', 'true');
      }
      onLoginSuccess();
    } else {
      setErrorMsg('Username atau Password salah! (Default: Admin / Audira)');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF6ED] p-4 select-none overflow-hidden">
      {/* Background Decorative Neo-Brutalist Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:24px_24px]" />
      
      {/* Decorative Floating Badges */}
      <div className="absolute top-10 left-10 hidden md:flex items-center gap-2 px-4 py-2 bg-[#FFDE4D] border-3 border-black rounded-xl shadow-[4px_4px_0px_#000] rotate-[-4deg]">
        <Disc className="w-5 h-5 text-black animate-spin" style={{ animationDuration: '6s' }} />
        <span className="font-black text-xs uppercase tracking-wider text-black">Audira Music Studio v2.0</span>
      </div>

      <div className="absolute bottom-10 right-10 hidden md:flex items-center gap-2 px-4 py-2 bg-[#06B6D4] border-3 border-black rounded-xl shadow-[4px_4px_0px_#000] rotate-[3deg] text-white">
        <ShieldCheck className="w-5 h-5 text-white" />
        <span className="font-black text-xs uppercase tracking-wider">Secured Access</span>
      </div>

      {/* Main Login Card */}
      <div className={`w-full max-w-md bg-white border-[4px] border-black rounded-2xl p-8 shadow-[10px_10px_0px_#000] relative z-10 transition-all ${
        isShaking ? 'animate-bounce' : ''
      }`}>
        
        {/* Header Branding */}
        <div className="text-center space-y-3 mb-6">
          <div className="w-16 h-16 bg-[#8B5CF6] border-3 border-black rounded-2xl mx-auto flex items-center justify-center shadow-[4px_4px_0px_#000] rotate-[-2deg]">
            <Music className="w-8 h-8 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider text-black flex items-center justify-center gap-2">
              <span>AUDIRA STUDIO</span>
            </h1>
            <p className="text-xs font-bold text-black/60 mt-1">
              Silakan login untuk mengakses Studio Musik & Offline Renderer
            </p>
          </div>
        </div>

        {/* Error Alert Badge */}
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-100 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center gap-2 text-red-700 font-black text-xs animate-pulse">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <User className="w-4 h-4 text-black" />
              <span>Username</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan Username (Admin)..."
              className="w-full neo-input text-sm p-3 font-bold"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <Key className="w-4 h-4 text-black" />
              <span>Password</span>
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password (Audira)..."
                className="w-full neo-input text-sm p-3 pr-12 font-bold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-black hover:text-[#8B5CF6] p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs font-black uppercase text-black cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-[#8B5CF6] border-2 border-black rounded cursor-pointer"
              />
              <span>Ingat Sesi Login</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-3 border-black rounded-xl font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5 text-white" />
            <span>MASUK KE STUDIO</span>
          </button>
        </form>

        {/* Credentials & License Info Footer Badge */}
        <div className="mt-6 pt-4 border-t-2 border-black/10 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF8EC] border-2 border-black rounded-lg text-[10px] font-black uppercase text-black shadow-[2px_2px_0px_#000]">
            <Lock className="w-3 h-3 text-amber-600" />
            <span>Kredensial Login: <strong>Username: Admin</strong> | <strong>Password: Audira</strong></span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-wider text-black/60">
            Official License & Copyright © 2026 by <strong>AUDIRA (Agus Dwi R)</strong>
          </p>
        </div>

      </div>
    </div>
  );
}
