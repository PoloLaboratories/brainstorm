'use client';

import { signUpWithEmail, signInWithGoogle } from '@/app/actions/auth';
import Link from 'next/link';
import { useState } from 'react';
import * as motion from 'motion/react-client';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Compass,
  Brain,
  Zap,
} from 'lucide-react';

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleEmailSignup(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await signUpWithEmail(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setSuccess(result.success);
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setLoading(true);
    setError(null);

    const result = await signInWithGoogle();

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — dark branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] relative bg-[oklch(0.22_0.015_55)] overflow-hidden">
        {/* Ambient gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--node-concept)]/10 via-transparent to-[var(--amber)]/8" />

        {/* Floating decorative nodes */}
        <div className="absolute top-[20%] right-[18%] h-3 w-3 rounded-full bg-[var(--node-concept)] opacity-25 animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-[40%] left-[15%] h-2.5 w-2.5 rounded-full bg-[var(--amber)] opacity-20 animate-float" style={{ animationDelay: '0.7s' }} />
        <div className="absolute bottom-[30%] right-[25%] h-2 w-2 rounded-full bg-[var(--node-idea)] opacity-20 animate-float" style={{ animationDelay: '1.3s' }} />
        <div className="absolute bottom-[15%] left-[25%] h-3.5 w-3.5 rounded-full bg-[var(--node-project)] opacity-15 animate-float" style={{ animationDelay: '2.1s' }} />

        {/* Dashed connection lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <line x1="82%" y1="20%" x2="15%" y2="40%" stroke="white" strokeWidth="0.5" strokeDasharray="4 6" />
          <line x1="25%" y1="85%" x2="75%" y2="70%" stroke="white" strokeWidth="0.5" strokeDasharray="4 6" />
        </svg>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-warm shadow-[0_2px_10px_oklch(0.72_0.15_60/0.35)]">
                <Sparkles className="h-[18px] w-[18px] text-white" />
              </div>
              <span className="text-lg font-display font-bold text-white tracking-tight">
                Brainstorm
              </span>
            </div>
            <p className="text-[oklch(0.65_0.01_70)] text-sm mt-1">
              The Infinite University
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-white leading-tight">
                Begin your journey as<br />
                <span className="text-gradient-warm">an explorer.</span>
              </h2>
              <p className="text-[oklch(0.60_0.01_70)] text-sm mt-3 max-w-[320px]">
                Brainstorm helps you discover what you don&apos;t know you don&apos;t know — through AI-guided learning paths and a growing knowledge graph.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: Compass, text: 'AI co-designs learning paths with you' },
                { icon: Brain, text: 'Build a living knowledge graph' },
                { icon: Zap, text: 'Discover unexpected connections' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-[oklch(0.70_0.01_70)] text-sm">
                  <item.icon className="h-4 w-4 text-[var(--amber)] shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[oklch(0.45_0.01_70)] text-xs">
            No deadlines. No failure states. Just curiosity.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center gap-2.5 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-warm shadow-warm">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-display font-bold">Brainstorm</span>
            </div>
            <p className="text-muted-foreground text-sm">The Infinite University</p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold">
              Start your <span className="text-gradient-warm">exploration</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              Create an account to begin your learning journey
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3.5 bg-[var(--sage-light)] border border-[var(--sage)]/20 rounded-xl text-[var(--sage)] text-sm font-medium">
              {success}
            </div>
          )}

          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl font-medium hover:bg-accent hover:shadow-warm transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-3 shadow-warm"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-foreground text-sm">Continue with Google</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-background text-muted-foreground">or sign up with email</span>
            </div>
          </div>

          <form action={handleEmailSignup} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring bg-card shadow-warm text-sm transition-all duration-150"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring bg-card shadow-warm text-sm transition-all duration-150"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                At least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 gradient-warm text-white rounded-xl font-semibold shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
