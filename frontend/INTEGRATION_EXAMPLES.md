/**
 * EXEMPLES D'INTÉGRATION API
 * 
 * Montre comment utiliser les nouveaux services dans les composants
 * Peut être utilisé comme template pour migrer les pages existantes
 */

// ============================================================================
// EXEMPLE 1: Page de connexion avec API
// ============================================================================

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { ApiError } from '@/services';

export const AuthPageExample = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Utiliser le contexte d'auth amélioré
  const { login, register, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
        
        toast({
          title: 'Connexion réussie !',
          description: 'Bienvenue sur Feñ Na Sénégal.',
        });
      } else {
        if (!name) return;
        await register(name, email, password, password);

        toast({
          title: 'Inscription réussie !',
          description: 'Bienvenue ! Votre compte a été créé.',
        });
      }

      // Rediriger (le contexte le fait automatiquement)
      const redirect = searchParams.get('redirect') || 'declarer';
      navigate(`/${redirect}`);
    } catch (err) {
      // L'erreur est déjà dans le contexte
      // Optionnel: toast personnalisé
      if (err instanceof ApiError) {
        toast({
          title: 'Erreur',
          description: err.message,
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <button 
        type="button"
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <h1 className="text-3xl font-bold">
        {isLogin ? 'Connexion' : 'Inscription'}
      </h1>

      {/* État d'erreur global */}
      {error && (
        <ErrorMessage
          type="error"
          title="Erreur"
          message={error.message}
          onDismiss={clearError}
        />
      )}

      {/* Champs d'entrée */}
      {!isLogin && (
        <div>
          <label className="text-xs font-semibold uppercase">Nom</label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Votre nom"
            className="h-12 rounded-2xl"
            disabled={isLoading}
          />
        </div>
      )}

      <div>
        <label className="text-xs font-semibold uppercase">Email</label>
        <Input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="vous@email.com"
          className="h-12 rounded-2xl"
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase">Mot de passe</label>
        <Input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="h-12 rounded-2xl"
          disabled={isLoading}
          required
        />
      </div>

      {/* Bouton avec loading */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-2xl text-base font-semibold"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            En cours...
          </span>
        ) : (
          isLogin ? 'Se connecter' : 'S\'inscrire'
        )}
      </Button>

      {/* Toggle login/register */}
      <button
        type="button"
        onClick={() => setIsLogin(!isLogin)}
        className="w-full text-primary font-medium"
      >
        {isLogin ? 'Créer un compte' : 'Se connecter'}
      </button>
    </form>
  );
};

// ============================================================================
// EXEMPLE 2: Liste d'annonces avec API et pagination
// ============================================================================

import { useEffect, useState } from 'react';
import { announcementService } from '@/services';
import { useApi } from '@/hooks/useApi';

interface Announcement {
  id: string;
  title: string;
  description: string;
  // ...
}

export const AnnouncementsListExample = () => {
  const [page, setPage] = useState(1);
  
  // Hook useApi pour l'appel API
  const {
    execute: fetchAnnouncements,
    isLoading,
    error,
    data: response,
    reset,
  } = useApi(() =>
    announcementService.getAnnouncements({
      page,
      limit: 10,
      status: 'perdu',
      q: searchQuery, // ✅ Envoi de la recherche par quartier au backend
    })
  );

  // ✅ Recharger les annonces quand la page ou la recherche change
  useEffect(() => {
    fetchAnnouncements();
  }, [page, searchQuery]);

  // ✅ Debounce : attend 500ms après la frappe avant de lancer la recherche
  const [displaySearch, setDisplaySearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(displaySearch);
      setPage(1); // Retour à la page 1 lors d'une nouvelle recherche
    }, 500);
    return () => clearTimeout(timer);
  }, [displaySearch]);

  if (isLoading) {
    return <LoadingSpinner label="Chargement des annonces..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        type="error"
        title="Erreur"
        message={error.message}
        action={{
          label: 'Réessayer',
          onClick: () => fetchAnnouncements(),
        }}
      />
    );
  }

  const announcements = response?.data || [];
  const total = response?.total || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Annonces ({total})</h1>
        
        {/* ✅ Barre de recherche par quartier */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Quartier (ex: Médina, Almadies)..."
            value={displaySearch}
            onChange={(e) => setDisplaySearch(e.target.value)}
            className="pl-9 h-11 rounded-2xl border-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          Aucune annonce trouvée
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map(announcement => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              disabled={page === i + 1}
              className={`px-4 py-2 rounded-lg ${
                page === i + 1
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXEMPLE 3: Formulaire de création d'annonce avec upload image
// ============================================================================

import { FormEvent, ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { announcementService } from '@/services';

export const CreateAnnouncementExample = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'objet' as const,
    status: 'perdu' as const,
    title: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    contact: '',
    images: [] as File[],
  });

  const {
    execute: submitForm,
    isLoading,
    error,
  } = useApi((data) => announcementService.createAnnouncement(data));

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setFormData(prev => ({ ...prev, images: files }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await submitForm(formData);

      toast({
        title: 'Succès !',
        description: 'Votre annonce a été créée avec succès.',
      });

      navigate('/annonces');
    } catch (err) {
      // Erreur gérée par le hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <ErrorMessage
          type="error"
          title="Erreur"
          message={error.message}
        />
      )}

      <div>
        <label className="text-xs font-semibold uppercase">Type</label>
        <select
          value={formData.type}
          onChange={e => setFormData(prev => ({
            ...prev,
            type: e.target.value as any
          }))}
          disabled={isLoading}
          className="w-full h-12 rounded-2xl border px-4"
        >
          <option value="objet">Objet</option>
          <option value="animal">Animal</option>
          <option value="personne">Personne</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase">Statut</label>
        <div className="grid grid-cols-2 gap-3">
          {['perdu', 'trouvé'].map(status => (
            <button
              key={status}
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                status: status as any
              }))}
              disabled={isLoading}
              className={`p-3 rounded-2xl font-semibold transition ${
                formData.status === status
                  ? 'bg-primary text-white'
                  : 'bg-muted'
              }`}
            >
              {status === 'perdu' ? '🔴 Perdu' : '🟢 Trouvé'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase">Titre</label>
        <Input
          value={formData.title}
          onChange={e => setFormData(prev => ({
            ...prev,
            title: e.target.value
          }))}
          placeholder="Ex: Téléphone Samsung Galaxy"
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase">Description</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData(prev => ({
            ...prev,
            description: e.target.value
          }))}
          placeholder="Décrivez l'objet..."
          disabled={isLoading}
          required
          className="w-full p-3 rounded-2xl border min-h-[120px]"
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase">Photos</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading}
          className="w-full"
        />
        {formData.images.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            {formData.images.length} image(s) sélectionnée(s)
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase">Localisation</label>
          <Input
            value={formData.location}
            onChange={e => setFormData(prev => ({
              ...prev,
              location: e.target.value
            }))}
            placeholder="Dakar"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase">Date</label>
          <Input
            type="date"
            value={formData.date}
            onChange={e => setFormData(prev => ({
              ...prev,
              date: e.target.value
            }))}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase">Contact</label>
        <Input
          type="tel"
          value={formData.contact}
          onChange={e => setFormData(prev => ({
            ...prev,
            contact: e.target.value
          }))}
          placeholder="+221 77 123 45 67"
          disabled={isLoading}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading ? 'Création en cours...' : 'Créer l\'annonce'}
      </Button>
    </form>
  );
};

// ============================================================================
// EXEMPLE 4: Mise à jour du profil utilisateur
// ============================================================================

import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services';

export const UpdateProfileExample = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: '',
    phone: '',
    profileImage: null as File | null,
  });

  const {
    execute: submitUpdate,
    isLoading,
    error,
  } = useApi(() => userService.updateProfile(formData));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const updated = await submitUpdate();
      
      // Mettre à jour le contexte local
      updateUser({
        name: updated.name,
        profileImage: updated.profileImage,
      });

      toast({
        title: 'Profil mis à jour !',
      });
    } catch (err) {
      // Erreur gérée
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && <ErrorMessage type="error" title="Erreur" message={error.message} />}

      <div>
        <Input
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Nom"
          disabled={isLoading}
        />
      </div>

      <div>
        <textarea
          value={formData.bio}
          onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Bio"
          disabled={isLoading}
          className="w-full p-3 rounded-xl border"
        />
      </div>

      <div>
        <Input
          type="tel"
          value={formData.phone}
          onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="Téléphone"
          disabled={isLoading}
        />
      </div>

      <div>
        <label>Photo de profil</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setFormData(prev => ({
            ...prev,
            profileImage: e.target.files?.[0] || null
          }))}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
      </Button>
    </form>
  );
};

// ============================================================================
// TIPS & TRICKS
// ============================================================================

/*
1. GESTION DES ERREURS
   - Toujours utiliser ErrorMessage component
   - Afficher error.message pour utilisateur
   - Log error.data pour debug

2. LOADING STATES
   - Désactiver les inputs/buttons quand isLoading
   - Afficher spinner au lieu de texte
   - Empêcher submit multiple

3. OPTIMISTIC UPDATES
   - Retours utilisateur immédiat
   - Rollback si erreur serveur

4. CACHING
   - useApi hook supporte query keys
   - Besoin de réimplement setI pour vrai caching

5. RETRY LOGIC
   - API client retry auto 401 (refresh token)
   - Pour autre erreur, laisser choix utilisateur

6. VALIDATION CLIENT
   - Vérifier avant appel API
   - Réduire requêtes inutiles

7. FILE UPLOADS
   - Utiliser FormData
   - Progress bar optionnel
   - Limiter taille/type fichier

8. PAGINATION
   - Stocker page dans state
   - Réfetch quand page change
   - Optional: infinite scroll

9. SEARCH/FILTER
   - Debounce input
   - Reset page à 1 quand filter change
   - Afficher count résultats

10. LOGOUT
    - Appeler authService.logout()
    - apiClient.clearTokens auto
    - Rediriger vers login

*/
