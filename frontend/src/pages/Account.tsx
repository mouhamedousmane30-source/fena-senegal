import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, Shield, FileText, Trash2, Camera, Info, Pencil, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/api.client';
import { userService } from '@/services/user.service';

const Account = () => {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'declarations' | 'security' | 'privacy'>('declarations');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | undefined>(user?.profileImage);

  // États pour la sécurité
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // États pour la confidentialité
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    emailVisible: false,
    phoneVisible: false,
    allowMessages: true,
    dataRetention: '12',
  });
  const [declarations, setDeclarations] = useState<Array<{ id: string; title: string; status: 'perdu' | 'trouvé'; location: string; date: string; views: number }>>([]);
  const [isLoadingDeclarations, setIsLoadingDeclarations] = useState(false);
  
  // État pour le modal de confirmation de suppression
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    announcementId: string | null;
    announcementTitle: string;
  }>({
    isOpen: false,
    announcementId: null,
    announcementTitle: '',
  });

  // État pour le modal d'édition
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    announcement: any | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    announcement: null,
    isLoading: false,
  });

  // État pour les données de l'annonce en cours d'édition
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    location: '',
    status: 'perdu' as 'perdu' | 'trouvé',
  });

  // État pour le modal de complétion du profil (utilisateurs existants)
  const [completeProfileModal, setCompleteProfileModal] = useState({
    isOpen: false,
    isLoading: false,
  });
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
  });

  const displayName = user?.username || user?.name || 'Utilisateur';

  useEffect(() => {
    setProfileImage(user?.profileImage);
    if (user?.privacy) {
      setPrivacySettings((prev) => ({ ...prev, ...user.privacy }));
    }
    // Vérifier si l'utilisateur doit compléter son profil (pas de prénom/nom)
    if (user && !user.firstName && !user.lastName && !user.name?.includes(' ')) {
      setCompleteProfileModal({ isOpen: true, isLoading: false });
    }
  }, [user]);

  // Charger les annonces de l'utilisateur
  useEffect(() => {
    const loadUserDeclarations = async () => {
      console.log('loadUserDeclarations appelé', { user: !!user, isAuthenticated });
      if (!user || !isAuthenticated) {
        console.log('Pas de user ou pas authentifié, retour');
        return;
      }
      
      setIsLoadingDeclarations(true);
      try {
        console.log('Appel API /announcements/my');
        const response = await apiClient.get('/announcements/my') as { success: boolean; announcements: Array<{ id: string; title: string; status: 'perdu' | 'trouvé'; location: string; date: string; views: number }> };
        console.log('Réponse API:', response);
        
        if (response.success) {
          console.log('Annonces reçues:', response.announcements);
          console.log('Type des annonces:', typeof response.announcements);
          console.log('Longueur des annonces:', response.announcements?.length);
          setDeclarations(response.announcements);
        } else {
          console.log('Réponse API sans success');
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des annonces:', error);
        
        // Gérer spécifiquement les erreurs d'authentification
        if (error.message?.includes('Session expirée') || error.status === 401) {
          toast({
            title: 'Session expirée',
            description: 'Veuillez vous reconnecter pour accéder à vos annonces',
            variant: 'destructive',
          });
          // Rediriger vers la page de connexion après un court délai
          setTimeout(() => {
            logout();
            navigate('/auth');
          }, 2000);
        } else {
          toast({
            title: 'Erreur',
            description: 'Impossible de charger vos annonces',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoadingDeclarations(false);
      }
    };

    loadUserDeclarations();
  }, [user, isAuthenticated]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (securityData.newPassword !== securityData.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }

    if (securityData.newPassword.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères',
        variant: 'destructive',
      });
      return;
    }

    try {
      await userService.changePassword({
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword,
      });

      toast({
        title: 'Succès',
        description: 'Votre mot de passe a été mis à jour avec succès',
      });

      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Une erreur est survenue.';
      toast({
        title: 'Erreur',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  };

  const handlePrivacyUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ privacy: privacySettings });
    toast({
      title: 'Succès',
      description: 'Vos préférences ont été enregistrées sur cet appareil.',
    });
  };

  const openDeleteModal = (announcementId: string, announcementTitle: string) => {
    setDeleteModal({
      isOpen: true,
      announcementId,
      announcementTitle,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      announcementId: null,
      announcementTitle: '',
    });
  };

  // Fonctions pour le modal d'édition
  const openEditModal = (announcement: any) => {
    setEditModal({
      isOpen: true,
      announcement,
      isLoading: false,
    });
    setEditData({
      title: announcement.title || '',
      description: announcement.description || '',
      location: announcement.location || '',
      status: announcement.status || 'perdu',
    });
  };

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      announcement: null,
      isLoading: false,
    });
    setEditData({
      title: '',
      description: '',
      location: '',
      status: 'perdu',
    });
  };

  const handleUpdateAnnouncement = async () => {
    if (!editModal.announcement) return;

    setEditModal((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await apiClient.put(`/announcements/${editModal.announcement.id}`, editData);

      // Mettre à jour localement la liste
      setDeclarations((prev) =>
        prev.map((decl) =>
          decl.id === editModal.announcement.id
            ? { ...decl, ...editData }
            : decl
        )
      );

      toast({
        title: 'Annonce modifiée',
        description: `"${editData.title}" a été mise à jour avec succès.`,
      });

      closeEditModal();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Une erreur est survenue.';
      toast({
        title: 'Erreur',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setEditModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!deleteModal.announcementId) return;
    
    const announcementId = deleteModal.announcementId;
    
    try {
      await apiClient.delete(`/announcements/${announcementId}`);
      
      // Supprimer localement de la liste sans recharger
      setDeclarations((prev) => prev.filter((decl) => decl.id !== announcementId));
      
      toast({
        title: 'Annonce supprimée',
        description: `"${deleteModal.announcementTitle}" a été supprimée avec succès.`,
      });

      closeDeleteModal();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Une erreur est survenue.';
      toast({
        title: 'Erreur',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        'Êtes-vous sûr ? Cette action est irréversible et supprimera toutes vos données.'
      )
    ) {
      try {
        await userService.deleteAccount();
        
        toast({
          title: 'Compte supprimé',
          description: 'Votre compte a été supprimé avec succès.',
        });

        // Déconnecter l'utilisateur et rediriger vers l'accueil
        logout();
        navigate('/');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Une erreur est survenue.';
        toast({
          title: 'Erreur',
          description: errorMsg,
          variant: 'destructive',
        });
      }
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Erreur',
          description: 'Veuillez sélectionner une image',
          variant: 'destructive',
        });
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Erreur',
          description: 'La taille du fichier ne doit pas dépasser 5MB',
          variant: 'destructive',
        });
        return;
      }

      // Convertir en base64 pour stocker localement
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setProfileImage(imageData);
        updateUser({ profileImage: imageData });
        toast({
          title: 'Succès',
          description: 'Votre photo de profil a été mise à jour',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Mon Account</h1>
              <p className="text-muted-foreground">
                Gérez votre profil, vos déclarations et vos paramètres de sécurité
              </p>
            </div>
            <div className="relative">
              <button
                onClick={handleProfileImageClick}
                className="group relative w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                title="Cliquer pour changer la photo de profil"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profil"
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                    <span className="text-xl font-bold text-primary-foreground">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-2xl background-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />
            </div>
          </div>

          {/* User Info */}
          <div className="bg-muted/50 border border-input rounded-2xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Nom
                </p>
                <p className="text-lg font-semibold text-foreground">{displayName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Email
                </p>
                <p className="text-lg font-semibold text-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-3 border-b border-border/50">
          {[
            { id: 'declarations', label: '📝 Mes Déclarations', icon: FileText },
            { id: 'security', label: '🔒 Sécurité', icon: Lock },
            { id: 'privacy', label: '👁️ Confidentialité', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary border-b-primary'
                  : 'text-muted-foreground border-b-transparent hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}

        {/* Déclarations */}
        {activeTab === 'declarations' && (
          <div className="space-y-4">
            {isLoadingDeclarations ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement de vos annonces...</p>
              </div>
            ) : declarations.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Vous avez {declarations.length} déclaration{declarations.length > 1 ? 's' : ''}
                </p>
                <div className="space-y-3">
                  {declarations.map((decl) => (
                    <div
                      key={decl.id}
                      className="bg-card border border-input rounded-2xl p-4 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">{decl.title}</h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                decl.status === 'perdu'
                                  ? 'bg-lost/20 text-lost'
                                  : 'bg-found/20 text-found'
                              }`}
                            >
                              {decl.status === 'perdu' ? '🔴 Perdu' : '🟢 Trouvé'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>📍 {decl.location}</span>
                            <span>📅 {new Date(decl.date).toLocaleDateString('fr-FR')}</span>
                            <span>👁️ {decl.views} vues</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/annonce/${decl.id}`)}
                            className="rounded-lg"
                          >
                            Voir
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(decl)}
                            className="rounded-lg text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(decl.id, decl.title)}
                            className="rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground mb-2">Aucune déclaration personnelle disponible pour le moment</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  Commencez par créer votre première déclaration pour la voir apparaître ici.
                </p>
                <Button
                  onClick={() => navigate('/declarer')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl"
                >
                  Créer une déclaration
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Sécurité */}
        {activeTab === 'security' && (
          <div className="max-w-2xl space-y-6">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" /> Changer le mot de passe
              </h3>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={securityData.currentPassword}
                    onChange={(e) =>
                      setSecurityData({ ...securityData, currentPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="h-12 rounded-2xl pr-10"
                    required
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
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={securityData.newPassword}
                    onChange={(e) =>
                      setSecurityData({ ...securityData, newPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="h-12 rounded-2xl pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={securityData.confirmPassword}
                    onChange={(e) =>
                      setSecurityData({ ...securityData, confirmPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="h-12 rounded-2xl pr-10"
                    required
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

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl py-6 text-base font-semibold"
              >
                Mettre à jour le mot de passe
              </Button>
            </form>

            <hr className="border-border/50" />

            {/* Suppression du compte */}
            <div className="space-y-4 p-4 bg-destructive/10 border border-destructive/30 rounded-2xl">
              <h3 className="font-semibold text-destructive flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Zone de danger
              </h3>
              <p className="text-sm text-destructive/80">
                Supprimer votre compte est irréversible et supprimera toutes vos données.
              </p>
              <Button
                onClick={handleDeleteAccount}
                variant="destructive"
                className="w-full rounded-2xl py-6 text-base font-semibold"
              >
                Supprimer mon compte
              </Button>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        <Dialog open={deleteModal.isOpen} onOpenChange={closeDeleteModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription className="pt-2">
              Êtes-vous sûr de vouloir supprimer <strong>"{deleteModal.announcementTitle}"</strong> ?
              <br /><br />
              Cette action est <span className="text-destructive font-semibold">irréversible</span>.
            </DialogDescription>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={closeDeleteModal}
                className="rounded-xl"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAnnouncement}
                className="rounded-xl"
              >
                Supprimer définitivement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal d'édition */}
        <Dialog open={editModal.isOpen} onOpenChange={closeEditModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              Modifier l'annonce
            </DialogTitle>
            <DialogDescription className="pt-2">
              Modifiez les informations de votre annonce ci-dessous.
            </DialogDescription>
            
            <div className="space-y-4 py-4">
              {/* Titre */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Titre
                </label>
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  placeholder="Titre de l'annonce"
                  className="h-12 rounded-2xl"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Description
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  placeholder="Description détaillée..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border border-input bg-card text-foreground resize-none"
                />
              </div>

              {/* Localisation */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Localisation
                </label>
                <Input
                  value={editData.location}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  placeholder="Lieu (ex: Dakar, Médina...)"
                  className="h-12 rounded-2xl"
                />
              </div>

              {/* Statut */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Statut
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditData({ ...editData, status: 'perdu' })}
                    className={`flex-1 px-4 py-3 rounded-2xl font-medium transition-colors ${
                      editData.status === 'perdu'
                        ? 'bg-lost/20 text-lost border-2 border-lost'
                        : 'bg-muted text-muted-foreground border-2 border-transparent hover:bg-muted/80'
                    }`}
                  >
                    🔴 Perdu
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditData({ ...editData, status: 'trouvé' })}
                    className={`flex-1 px-4 py-3 rounded-2xl font-medium transition-colors ${
                      editData.status === 'trouvé'
                        ? 'bg-found/20 text-found border-2 border-found'
                        : 'bg-muted text-muted-foreground border-2 border-transparent hover:bg-muted/80'
                    }`}
                  >
                    🟢 Trouvé
                  </button>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={closeEditModal}
                className="rounded-xl"
                disabled={editModal.isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleUpdateAnnouncement}
                className="rounded-xl bg-primary hover:bg-primary/90"
                disabled={editModal.isLoading}
              >
                {editModal.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confidentialité */}
        {activeTab === 'privacy' && (
          <form onSubmit={handlePrivacyUpdate} className="max-w-2xl space-y-6">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" /> Paramètres de confidentialité
            </h3>

            {/* Toggle Settings */}
            <div className="space-y-4">
              {[
                {
                  key: 'profilePublic',
                  label: 'Profil public',
                  description: 'Permettre aux autres utilisateurs de voir mon profil',
                },
                {
                  key: 'emailVisible',
                  label: 'Email visible',
                  description: 'Afficher mon email sur mes déclarations',
                },
                {
                  key: 'phoneVisible',
                  label: 'Téléphone visible',
                  description: 'Afficher mon numéro de téléphone sur mes déclarations',
                },
                {
                  key: 'allowMessages',
                  label: 'Accepter les messages',
                  description: 'Permettre aux autres utilisateurs de m\'envoyer des messages',
                },
              ].map((setting) => (
                <div
                  key={setting.key}
                  className="flex items-start justify-between gap-4 p-4 bg-muted/50 rounded-2xl border border-input"
                >
                  <div>
                    <p className="font-medium text-foreground">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPrivacySettings({
                        ...privacySettings,
                        [setting.key]: !privacySettings[setting.key as keyof typeof privacySettings],
                      })
                    }
                    className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                      privacySettings[setting.key as keyof typeof privacySettings]
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {privacySettings[setting.key as keyof typeof privacySettings] ? 'Activé' : 'Désactivé'}
                  </button>
                </div>
              ))}
            </div>

            {/* Data Retention */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-2xl border border-input">
              <label className="text-sm font-medium text-foreground">
                Conserver les données supprimées (en mois)
              </label>
              <select
                value={privacySettings.dataRetention}
                onChange={(e) =>
                  setPrivacySettings({ ...privacySettings, dataRetention: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground"
              >
                <option value="1">1 mois</option>
                <option value="3">3 mois</option>
                <option value="6">6 mois</option>
                <option value="12">12 mois</option>
                <option value="36">Indéfini</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Les données supprimées seront conservées pendant cette durée avant suppression définitive.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl py-6 text-base font-semibold"
            >
              Enregistrer les paramètres
            </Button>
          </form>
        )}
      </div>

      {/* Modal pour compléter le profil (utilisateurs existants) */}
      <Dialog open={completeProfileModal.isOpen} onOpenChange={(open) => setCompleteProfileModal({ ...completeProfileModal, isOpen: open })}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogTitle className="text-xl font-bold">Complétez votre profil</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Pour améliorer votre expérience, veuillez ajouter votre nom complet.
          </DialogDescription>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Prénom *</label>
                <Input
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  placeholder="Votre prénom"
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Nom *</label>
                <Input
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  placeholder="Votre nom"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCompleteProfileModal({ ...completeProfileModal, isOpen: false })}
              className="rounded-xl"
            >
              Plus tard
            </Button>
            <Button
              onClick={async () => {
                if (!profileData.firstName || !profileData.lastName) {
                  toast({
                    title: 'Champs requis',
                    description: 'Veuillez entrer votre prénom et votre nom',
                    variant: 'destructive',
                  });
                  return;
                }
                
                setCompleteProfileModal({ ...completeProfileModal, isLoading: true });
                try {
                  const fullName = `${profileData.firstName.trim()} ${profileData.lastName.trim()}`;
                  await userService.updateProfile({
                    firstName: profileData.firstName.trim(),
                    lastName: profileData.lastName.trim(),
                    name: fullName,
                    username: fullName,
                  });
                  updateUser({
                    firstName: profileData.firstName.trim(),
                    lastName: profileData.lastName.trim(),
                    name: fullName,
                    username: fullName,
                  });
                  toast({
                    title: 'Profil mis à jour',
                    description: 'Votre nom complet a été enregistré avec succès.',
                  });
                  setCompleteProfileModal({ isOpen: false, isLoading: false });
                } catch (error) {
                  toast({
                    title: 'Erreur',
                    description: 'Impossible de mettre à jour votre profil',
                    variant: 'destructive',
                  });
                  setCompleteProfileModal({ ...completeProfileModal, isLoading: false });
                }
              }}
              disabled={completeProfileModal.isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
            >
              {completeProfileModal.isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Account;
