import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import ErrorAlert from '@/components/ErrorAlert';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [isReset, setIsReset] = useState(false);

  // Vérifier la validité du token au chargement
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Token de réinitialisation manquant');
        setTokenValid(false);
        return;
      }

      try {
        await authService.verifyResetToken(token);
        setTokenValid(true);
      } catch (error) {
        setError('Token invalide ou expiré');
        setTokenValid(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({ 
        token: token!, 
        password, 
        passwordConfirm: confirmPassword 
      });

      setIsReset(true);
      toast({
        title: 'Mot de passe réinitialisé !',
        description: 'Votre mot de passe a été mis à jour avec succès.',
      });

      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Une erreur est survenue.';
      setError(errorMsg);
      toast({
        title: 'Erreur',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Vérification du token...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (tokenValid === false) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Lien invalide
            </h1>
            <p className="text-muted-foreground">
              {error || 'Ce lien de réinitialisation est invalide ou a expiré.'}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/auth')}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl py-6"
              >
                Retour à la connexion
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/auth?forgot=true')}
                className="w-full rounded-2xl py-6"
              >
                Demander un nouveau lien
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isReset) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Mot de passe réinitialisé !
            </h1>
            <p className="text-muted-foreground">
              Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl py-6"
            >
              Se connecter maintenant
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <button onClick={() => navigate('/auth')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à la connexion
          </button>

          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Réinitialiser le mot de passe
            </h1>
            <p className="text-muted-foreground">
              Choisissez votre nouveau mot de passe
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 h-12 rounded-2xl pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 h-12 rounded-2xl pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  {password.length >= 6 ? (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className={password.length >= 6 ? 'text-green-600' : 'text-muted-foreground'}>
                    Au moins 6 caractères
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {password === confirmPassword && confirmPassword ? (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className={password === confirmPassword && confirmPassword ? 'text-green-600' : 'text-muted-foreground'}>
                    Les mots de passe correspondent
                  </span>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {error && (
                <ErrorAlert 
                  message={error} 
                  onClose={() => setError('')}
                  type="error"
                />
              )}
            </AnimatePresence>

            <Button 
              type="submit" 
              size="lg" 
              disabled={isLoading || password.length < 6 || password !== confirmPassword}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl py-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
