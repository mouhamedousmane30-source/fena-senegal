import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import ErrorAlert from '@/components/ErrorAlert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/services/api.config';
import { REMEMBERED_EMAIL_KEY, REMEMBERED_PASSWORD_KEY } from '@/services/api.config';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  /** Connexion refusée (401) : message clair au lieu de « Erreur API » */
  const [invalidLogin, setInvalidLogin] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { login, register } = useAuth();

  // Charger les identifiants sauvegardés au chargement
  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    const savedPassword = localStorage.getItem(REMEMBERED_PASSWORD_KEY);
    
    if (savedEmail) {
      setEmail(savedEmail);
    }
    if (savedPassword) {
      setPassword(savedPassword);
    }
    if (savedEmail || savedPassword) {
      setRememberMe(true);
      console.log('[Auth] Identifiants chargés depuis le stockage');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInvalidLogin(false);

    // Validation pour l'inscription: vérifier que les mots de passe correspondent
    if (!isLogin && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password, rememberMe);
      } else {
        if (!firstName || !lastName) {
          setError('Veuillez entrer votre prénom et votre nom');
          setIsLoading(false);
          return;
        }
        await register(firstName, lastName, email, password);
      }
      
      toast({
        title: isLogin ? 'Connexion réussie !' : 'Inscription réussie !',
        description: 'Bienvenue sur Feñ Na Sénégal.',
      });

      // Rediriger vers la page d'où l'utilisateur venait, ou vers /declarer
      const redirect = searchParams.get('redirect') || 'declarer';
      navigate(`/${redirect}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Une erreur est survenue.';
      const isLoginDenied =
        isLogin && error instanceof ApiError && error.status === 401;
      setInvalidLogin(!!isLoginDenied);
      setError(errorMsg);
      toast({
        title: isLoginDenied ? 'Connexion impossible' : 'Erreur',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implémenter la fonction de mot de passe oublié
      console.log('Mot de passe oublié pour:', email);

      toast({
        title: 'Email envoyé !',
        description: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
      });

      setIsForgotPassword(false);
      setEmail('');
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

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </button>

          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {isForgotPassword ? 'Réinitialiser le mot de passe' : isLogin ? 'Connexion' : 'Inscription'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isForgotPassword ? 'Entrez votre email pour réinitialiser votre mot de passe' : isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte Feñ Na'}
            </p>
          </div>

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="pl-11 h-12 rounded-2xl"
                    required
                  />
                </div>
              </div>

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
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl py-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setEmail('');
                  setError('');
                }}
                className="w-full text-primary font-medium hover:underline py-2"
              >
                Retour à la connexion
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Prénom *</label>
                      <Input
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        placeholder="Prénom"
                        className="h-12 rounded-2xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Nom *</label>
                      <Input
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        placeholder="Nom"
                        className="h-12 rounded-2xl"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="pl-11 h-12 rounded-2xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="•••••"
                      className="pl-11 pr-11 h-12 rounded-2xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setRememberMe(checked);
                        // Si on décoche, effacer les identifiants sauvegardés
                        if (!checked) {
                          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
                          localStorage.removeItem(REMEMBERED_PASSWORD_KEY);
                          console.log('[Auth] Identifiants sauvegardés effacés');
                        }
                      }}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    Se souvenir de moi
                  </label>
                )}

                {!isLogin && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Confirmer le mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="•••••"
                        className="pl-11 pr-11 h-12 rounded-2xl"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {error && (
                    <ErrorAlert
                      title={invalidLogin ? 'Mot de passe ou e-mail incorrect' : undefined}
                      message={error}
                      onClose={() => {
                        setError('');
                        setInvalidLogin(false);
                      }}
                      type={invalidLogin ? 'warning' : 'error'}
                    />
                  )}
                </AnimatePresence>

                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl py-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Chargement...' : isLogin ? 'Se connecter' : "S'inscrire"}
                </Button>
              </form>

              {isLogin && (
                <div className="text-right">
                  <button
                    onClick={() => {
                      setIsForgotPassword(true);
                      setEmail('');
                      setError('');
                    }}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              <p className="text-center text-sm text-muted-foreground">
                {isLogin ? "Pas encore de compte ?" : 'Déjà un compte ?'}{' '}
                <button
                  onClick={() => {
                    const newIsLogin = !isLogin;
                    setIsLogin(newIsLogin);
                    setError('');
                    setInvalidLogin(false);
                    setPassword('');
                    setConfirmPassword('');
                    setFirstName('');
                    setLastName('');
                    
                    // Si on revient en mode login, restaurer les identifiants sauvegardés
                    if (newIsLogin) {
                      const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
                      const savedPassword = localStorage.getItem(REMEMBERED_PASSWORD_KEY);
                      if (savedEmail) setEmail(savedEmail);
                      if (savedPassword) setPassword(savedPassword);
                      setRememberMe(!!(savedEmail || savedPassword));
                    } else {
                      // Si on passe en mode inscription, vider l'email sauf s'il était sauvegardé
                      setEmail('');
                      setRememberMe(true);
                    }
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  {isLogin ? "S'inscrire" : 'Se connecter'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
