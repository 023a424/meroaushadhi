'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/language';

const content = {
  en: {
    title: {
      signIn: "Sign in to your account",
      signUp: "Create a new account"
    },
    description: {
      signIn: "Enter your email and password to access your account",
      signUp: "Enter your details to create your account"
    },
    emailLabel: "Email address",
    passwordLabel: "Password",
    submit: {
      signIn: "Sign in",
      signUp: "Sign up"
    },
    toggle: {
      signIn: "Don't have an account? Sign up",
      signUp: "Already have an account? Sign in"
    }
  },
  np: {
    title: {
      signIn: "आफ्नो खातामा साइन इन गर्नुहोस्",
      signUp: "नयाँ खाता सिर्जना गर्नुहोस्"
    },
    description: {
      signIn: "आफ्नो खातामा पहुँच गर्न आफ्नो इमेल र पासवर्ड प्रविष्ट गर्नुहोस्",
      signUp: "आफ्नो खाता सिर्जना गर्न आफ्नो विवरणहरू प्रविष्ट गर्नुहोस्"
    },
    emailLabel: "इमेल ठेगाना",
    passwordLabel: "पासवर्ड",
    submit: {
      signIn: "साइन इन",
      signUp: "साइन अप"
    },
    toggle: {
      signIn: "खाता छैन? साइन अप गर्नुहोस्",
      signUp: "पहिले नै खाता छ? साइन इन गर्नुहोस्"
    }
  }
} as const;

export const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { lang } = useLanguage();
  const t = content[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (signUpError) throw signUpError;
        
        alert('Account created successfully! Please sign in.');
        setIsSignUp(false);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;

        if (!data.session) {
          throw new Error('No session after sign in');
        }
        
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          router.push('/app');
          router.refresh();
        } else {
          throw new Error('Session not established after sign in');
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo width={64} height={64} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {isSignUp ? t.title.signUp : t.title.signIn}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignUp ? t.description.signUp : t.description.signIn}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-6 py-8 shadow-lg sm:rounded-xl sm:px-12 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t.emailLabel}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#10b5f1] focus:outline-none focus:ring-[#10b5f1] sm:text-sm transition-colors text-black"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t.passwordLabel}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#10b5f1] focus:outline-none focus:ring-[#10b5f1] sm:text-sm transition-colors text-black"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-[#0ea0d9] hover:bg-[#0990c5] text-white shadow-lg"
                isLoading={loading}
              >
                {isSignUp ? t.submit.signUp : t.submit.signIn}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-6 w-full text-center text-sm text-[#0ea0d9] hover:text-[#0990c5] font-medium transition-colors"
            >
              {isSignUp ? t.toggle.signUp : t.toggle.signIn}
            </button>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl">
        <svg
          className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
          viewBox="0 0 1155 678"
        >
          <path
            fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
            fillOpacity=".2"
            d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
          />
          <defs>
            <linearGradient
              id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
              x1="1155.49"
              x2="-78.208"
              y1=".177"
              y2="474.645"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#10b5f1" />
              <stop offset={1} stopColor="#10b5f1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};