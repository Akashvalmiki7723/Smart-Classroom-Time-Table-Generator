'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

// ─── Eyeball character with mouse tracking ────────────────────────────────────
function EyeBall({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = 'white',
  pupilColor = 'black', isBlinking = false, forceLookX, forceLookY }: {
  size?: number; pupilSize?: number; maxDistance?: number; eyeColor?: string;
  pupilColor?: string; isBlinking?: boolean; forceLookX?: number; forceLookY?: number;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const eyeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  const pos = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    const rect = eyeRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const dx = mousePos.x - cx, dy = mousePos.y - cy;
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };
  const p = pos();
  return (
    <div ref={eyeRef} className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{ width: size, height: isBlinking ? 2 : size, backgroundColor: eyeColor, overflow: 'hidden' }}>
      {!isBlinking && (
        <div className="rounded-full" style={{
          width: pupilSize, height: pupilSize, backgroundColor: pupilColor,
          transform: `translate(${p.x}px, ${p.y}px)`, transition: 'transform 0.1s ease-out',
        }} />
      )}
    </div>
  );
}

// ─── Animated Characters Panel ────────────────────────────────────────────────
function CharactersPanel({ isTypingPassword, showPassword }: { isTypingPassword: boolean; showPassword: boolean }) {
  const [blinkPurple, setBlinkPurple] = useState(false);
  const [blinkBlack, setBlinkBlack] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  useEffect(() => {
    const schedule = (setFn: (v: boolean) => void) => {
      const t = setTimeout(() => { setFn(true); setTimeout(() => { setFn(false); schedule(setFn); }, 150); }, Math.random() * 4000 + 2500);
      return t;
    };
    const t1 = schedule(setBlinkPurple);
    const t2 = schedule(setBlinkBlack);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const bodySkew = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return 0;
    const rect = ref.current.getBoundingClientRect();
    return Math.max(-6, Math.min(6, -(mousePos.x - (rect.left + rect.width/2)) / 120));
  };
  const faceOffset = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { x: 0, y: 0 };
    const rect = ref.current.getBoundingClientRect();
    return {
      x: Math.max(-15, Math.min(15, (mousePos.x - (rect.left + rect.width/2)) / 20)),
      y: Math.max(-10, Math.min(10, (mousePos.y - (rect.top + rect.height/3)) / 30)),
    };
  };
  const pFace = faceOffset(purpleRef);
  const bFace = faceOffset(blackRef);

  // When password is visible, characters look away (shy)
  const purpleEyeX = showPassword && isTypingPassword ? -4 : undefined;
  const purpleEyeY = showPassword && isTypingPassword ? -4 : undefined;
  const blackEyeX  = showPassword && isTypingPassword ? -4 : undefined;
  const blackEyeY  = showPassword && isTypingPassword ? -4 : undefined;

  return (
    <div className="relative flex items-end justify-center" style={{ width: 400, height: 320 }}>
      {/* Purple tall character */}
      <div ref={purpleRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{ left: 60, width: 140, height: isTypingPassword ? 360 : 310,
          backgroundColor: '#9B8EC7', borderRadius: '8px 8px 0 0', zIndex: 1,
          transform: `skewX(${bodySkew(purpleRef)}deg)`, transformOrigin: 'bottom center' }}>
        <div className="absolute flex gap-6 transition-all duration-700 ease-in-out"
          style={{ left: 35 + pFace.x, top: 40 + pFace.y }}>
          <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D"
            isBlinking={blinkPurple} forceLookX={purpleEyeX} forceLookY={purpleEyeY} />
          <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D"
            isBlinking={blinkPurple} forceLookX={purpleEyeX} forceLookY={purpleEyeY} />
        </div>
      </div>
      {/* Black narrow character */}
      <div ref={blackRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{ left: 195, width: 90, height: 230, backgroundColor: '#4B3D6E',
          borderRadius: '6px 6px 0 0', zIndex: 2,
          transform: `skewX(${bodySkew(blackRef)}deg)`, transformOrigin: 'bottom center' }}>
        <div className="absolute flex gap-4 transition-all duration-700 ease-in-out"
          style={{ left: 18 + bFace.x, top: 30 + bFace.y }}>
          <EyeBall size={14} pupilSize={5} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D"
            isBlinking={blinkBlack} forceLookX={blackEyeX} forceLookY={blackEyeY} />
          <EyeBall size={14} pupilSize={5} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D"
            isBlinking={blinkBlack} forceLookX={blackEyeX} forceLookY={blackEyeY} />
        </div>
      </div>
      {/* Teal semicircle */}
      <div className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{ left: 0, width: 200, height: 160, backgroundColor: '#B4D3D9',
          borderRadius: '100px 100px 0 0', zIndex: 3 }}>
        <div className="absolute flex gap-6" style={{ left: 70, top: 75 }}>
          <div className="rounded-full" style={{ width: 10, height: 10, backgroundColor: '#2D2D2D' }} />
          <div className="rounded-full" style={{ width: 10, height: 10, backgroundColor: '#2D2D2D' }} />
        </div>
      </div>
      {/* Lavender rounded character */}
      <div className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{ left: 258, width: 110, height: 185, backgroundColor: '#BDA6CE',
          borderRadius: '55px 55px 0 0', zIndex: 4 }}>
        <div className="absolute flex gap-4" style={{ left: 38, top: 45 }}>
          <div className="rounded-full" style={{ width: 10, height: 10, backgroundColor: '#2D2D2D' }} />
          <div className="rounded-full" style={{ width: 10, height: 10, backgroundColor: '#2D2D2D' }} />
        </div>
        <div className="absolute rounded-full" style={{ left: 35, top: 78, width: 40, height: 3, backgroundColor: '#4B3D6E' }} />
      </div>
    </div>
  );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingPassword, setTypingPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) { setError('Invalid email or password. Please try again.'); setLoading(false); return; }
      router.push('/dashboard');
      router.refresh();
    } catch { setError('An error occurred. Please try again.'); setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left – Brand + Characters */}
      <div className="relative hidden lg:flex flex-col justify-between p-12"
        style={{ background: 'linear-gradient(145deg, #9B8EC7 0%, #BDA6CE 50%, #B4D3D9 100%)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Presidency University" width={48} height={48} className="rounded-xl" />
          <div>
            <p className="text-white font-bold text-lg leading-none">Presidency</p>
            <p className="text-white/70 text-sm">University</p>
          </div>
        </div>

        {/* Characters */}
        <div className="flex flex-col items-center gap-6">
          <CharactersPanel isTypingPassword={typingPassword} showPassword={showPassword} />
          <div className="text-center">
            <h2 className="text-white text-2xl font-bold">Smart Classroom System</h2>
            <p className="text-white/70 mt-1 text-sm">Achieving Excellence Together</p>
          </div>
        </div>

        <div className="flex gap-6 text-sm text-white/50">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'white' }} />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'white' }} />
      </div>

      {/* Right – Form */}
      <div className="flex items-center justify-center p-8" style={{ background: 'var(--cream-light)' }}>
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-10">
            <Image src="/logo.png" alt="Presidency University" width={40} height={40} className="rounded-xl" />
            <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Presidency University</p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: '#FFF0F2', color: '#C0445A', border: '1px solid #FFCCD5' }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@presidencyuniversity.in" required
                className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                style={{ border: '1.5px solid var(--border)', background: '#fff', color: 'var(--text-primary)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--purple)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setTypingPassword(true)}
                  onBlur={() => setTypingPassword(false)}
                  placeholder="Enter your password" required
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm transition-all"
                  style={{ border: '1.5px solid var(--border)', background: '#fff', color: 'var(--text-primary)', outline: 'none' }}
                  onFocusCapture={e => (e.target as HTMLInputElement).style.borderColor = 'var(--purple)'}
                  onBlurCapture={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all mt-2"
              style={{
                background: loading ? 'var(--lavender)' : 'linear-gradient(135deg, var(--purple), var(--lavender))',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(155,142,199,0.4)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
            Presidency University Smart Classroom Timetable System
          </p>
        </div>
      </div>
    </div>
  );
}
