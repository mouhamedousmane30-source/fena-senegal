/**
 * GUIDE D'INTÉGRATION - BACKEND READY
 * 
 * Ce fichier montre comment intégrer les nouveaux services API et hooks
 * dans votre application.
 */

// ============================================================================
// 1. CONFIGURATION API
// ============================================================================
// Dans votre .env ou .env.local, ajouter :
/*
VITE_API_URL=http://localhost:3000/api
*/

// Ou pour la production :
/*
VITE_API_URL=https://api.fena-senegal.com/api
*/

// ============================================================================
// 2. EXEMPLE DE LOGIN AVEC API RÉELLE
// ============================================================================

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { announcementService, authService, ApiError } from '@/services';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input'; // Assurez-vous que Input est importé
import { Button } from '@/components/ui/button'; // Assurez-vous que Button est importé
import { Checkbox } from '@/components/ui/checkbox'; // Importez Checkbox
import { Label } from '@/components/ui/label'; // Importez Label

// Exemple composant Login amélioré
export function LoginExample() {
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('user@example.com'); // Valeurs par défaut pour l'exemple
  const [password, setPassword] = useState('password123'); // Valeurs par défaut pour l'exemple
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // Nouvel état pour "Se souvenir de moi"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password, rememberMe); // Passez l'état rememberMe
      
      // ✅ Afficher le toast et rediriger après un court délai pour que l'utilisateur puisse voir le message
      toast({
        title: 'Connexion réussie !',
        description: 'Bienvenue sur Feñ Na Sénégal.',
      });

      // Redirection après un court délai pour permettre au toast d'être visible
      setTimeout(() => navigate('/declarer'), 500); // Redirige vers la page /declarer après 0.5 seconde
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('UNKNOWN' as any, 0, String(err));
      setError(apiError.message);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 p-4 border rounded-lg shadow-sm">
      {error && <ErrorMessage type="error" title="Erreur" message={error} />}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={isLoading}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={setRememberMe} disabled={isLoading} />
        <Label htmlFor="rememberMe">Se souvenir de moi</Label>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <LoadingSpinner size="sm" /> : 'Se connecter'}
      </Button>
    </form>
  );
}

// ============================================================================
// 3. EXEMPLE D'APPEL API AVEC useApi HOOK
// ============================================================================

export function AnnouncementsListExample() {
  const { execute: fetchAnnouncements, isLoading, error, data } = useApi(
    () => announcementService.getAnnouncements({ page: 1, limit: 10 })
  );

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage type="error" title="Erreur" message={error.message} />;

  return (
    <div className="space-y-4">
      {data?.data.map(announcement => (
        <div key={announcement.id} className="p-4 border rounded">
          {announcement.title}
          {/* ... */}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 4. EXEMPLE DE CRÉATION D'ANNONCE AVEC UPLOAD
// ============================================================================

import { announcementService } from '@/services';

export function CreateAnnouncementExample() {
  const { execute: createAnnouncement, isLoading, error } = useApi(
    (formData) => announcementService.createAnnouncement(formData)
  );

  const handleSubmit = async (formData: any) => {
    try {
      await createAnnouncement(formData);
      
      toast({
        title: 'Annonce créée !',
        description: 'Votre annonce est maintenant visible.',
      });
    } catch (err) {
      // Error est déjà dans le hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage type="error" title="Erreur" message={error.message} />}
      {isLoading && <LoadingSpinner />}
      {/* ... formulaire ... */}
    </form>
  );
}

// ============================================================================
// 5. EXEMPLE DE ROUTE PROTÉGÉE
// ============================================================================

// Dans votre App.tsx :
/*
import ProtectedRoute from '@/components/ProtectedRoute';

<Route element={<ProtectedRoute><Declare /></ProtectedRoute>} path="declarer" />

// Avec contrôle de rôle (admin seulement) :
<Route 
  element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} 
  path="admin" 
/>
*/

// ============================================================================
// 6. STRUCTURE DES APPELS API
// ============================================================================

/*
AUTHENTIFICATION:
- POST /auth/login           -> { token, refreshToken, user }
- POST /auth/register        -> { token, refreshToken, user }
- POST /auth/logout          -> {}
- GET  /auth/me              -> user
- POST /auth/forgot-password -> { message }
- POST /auth/reset-password  -> { message }

ANNONCES:
- GET    /announcements                -> { data: [], total, page, limit }
- GET    /announcements/:id            -> announcement
- POST   /announcements                -> announcement (avec FormData pour images)
- PUT    /announcements/:id            -> announcement
- DELETE /announcements/:id            -> { message }
- GET    /announcements/user/mine      -> { data: [] }
- GET    /announcements/:id/similar    -> []
- POST   /announcements/:id/report     -> { message }

UTILISATEURS:
- PUT    /users/profile                -> user
- POST   /users/change-password        -> { message }
- GET    /users/security               -> { twoFactorEnabled, ... }
- POST   /users/2fa/enable             -> { qrCode, secret }
- GET    /users/preferences            -> { notifications, privacy }
- PUT    /users/preferences            -> { notifications, privacy }
*/

// ============================================================================
// 7. GESTION D'ERREURS GLOBALE
// ============================================================================

/*
Les erreurs API retournent des ApiError avec:
- type: NETWORK, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, VALIDATION, SERVER, UNKNOWN
- status: HTTP status code
- message: Message d'erreur localisé
- data: Données additionnelles (ex: validation errors)

Exemple gestion 401 (unauthorized):
*/

async function handleApiCall() {
  try {
    await apiClient.get('/protected-endpoint');
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.type === ApiErrorType.UNAUTHORIZED) {
        // Rediriger vers login
        window.location.href = '/auth';
      } else if (error.type === ApiErrorType.VALIDATION) {
        // Afficher erreurs de validation
        console.log(error.data);
      }
    }
  }
}

// ============================================================================
// 8. ENVIRONNEMENT & CONFIGURATION
// ============================================================================

// .env.development
/*
VITE_API_URL=http://localhost:3000/api
*/

// .env.production
/*
VITE_API_URL=https://api.fena-senegal.com/api
*/

// ============================================================================
// 9. TOKENS & SÉCURITÉ
// ============================================================================

/*
Les tokens sont stockés dans localStorage:
- feñ_na_token: JWT main token
- feñ_na_refresh_token: JWT refresh token (optionnel)

Le token est automatiquement ajouté à chaque requête:
Authorization: Bearer <token>

Si le serveur retourne 401:
1. Le client utilise le refresh token pour obtenir un nouveau token
2. La requête est retentée avec le nouveau token
3. Si le refresh échoue, l'utilisateur est déconnecté

IMPORTANT: En production, utiliser httpOnly cookies si possible pour plus de sécurité
*/
