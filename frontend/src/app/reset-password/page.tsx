'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Lock, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isValidToken, setIsValidToken] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  useEffect(() => {
    const parseHashParams = () => {
      if (typeof window === 'undefined') return {};
      const hash = window.location.hash.substring(1);
      if (!hash) return {};
      return Object.fromEntries(new URLSearchParams(hash));
    };

    const verifyToken = async () => {
      // Try to get tokens from query params first, then from hash
      const hashParams = parseHashParams();
      const accessToken = searchParams.get('access_token') || (hashParams as any).access_token;
      const type = searchParams.get('type') || (hashParams as any).type;
      const refreshToken = searchParams.get('refresh_token') || (hashParams as any).refresh_token;

      console.log('Reset password - tokens found:', { 
        hasAccessToken: !!accessToken, 
        type,
        fromHash: !!hashParams.access_token,
        fromQuery: !!searchParams.get('access_token')
      });

      if (!accessToken || type !== 'recovery') {
        setError('Lien de réinitialisation invalide ou expiré');
        setLoading(false);
        return;
      }

      try {
        // Set the session with the recovery token
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || accessToken,
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Lien de réinitialisation invalide ou expiré');
        } else if (!data?.session) {
          setError('Impossible d\'établir la session de récupération');
        } else {
          setIsValidToken(true);
          
          // Clean URL to remove tokens
          if (typeof window !== 'undefined') {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }
      } catch (err) {
        console.error('Verify token error:', err);
        setError('Une erreur est survenue lors de la vérification du lien');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  const validatePassword = () => {
    if (!password) {
      setPasswordError('Le mot de passe est requis');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setConfirmPasswordError('Veuillez confirmer le mot de passe');
      return false;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError('Les mots de passe ne correspondent pas');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (!isPasswordValid || !isConfirmPasswordValid || !isValidToken) {
      return;
    }

    try {
      setLoading(true);
      
      // Update password using Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message || 'Une erreur est survenue');
      } else {
        setSuccess(true);
        
        // Sign out after password reset
        await supabase.auth.signOut();
        
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while verifying token
  if (loading && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="shadow-xl w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Vérification du lien...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl">
            <CardHeader className="space-y-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center mb-4"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-2xl font-bold text-center">
                Mot de passe réinitialisé !
              </CardTitle>
              <CardDescription className="text-center">
                Redirection vers la page de connexion...
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary-foreground" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-center">
              Nouveau mot de passe
            </CardTitle>
            <CardDescription className="text-center">
              Choisissez un nouveau mot de passe sécurisé
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm"
                >
                  {error}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    onBlur={validatePassword}
                    disabled={loading || !isValidToken}
                    className={passwordError ? 'border-destructive pr-10' : 'pr-10'}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading || !isValidToken}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordError) setConfirmPasswordError('');
                    }}
                    onBlur={validateConfirmPassword}
                    disabled={loading || !isValidToken}
                    className={confirmPasswordError ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading || !isValidToken}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-sm text-destructive">{confirmPasswordError}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !isValidToken}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Réinitialisation...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Réinitialiser le mot de passe
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </form>

          <CardFooter className="flex flex-col space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-sm text-muted-foreground"
            >
              Vous vous souvenez de votre mot de passe ?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Se connecter
              </Link>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
