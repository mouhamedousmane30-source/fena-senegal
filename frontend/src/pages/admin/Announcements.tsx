import { useState, useEffect } from 'react';
import { Trash2, Eye, Search, ChevronLeft, ChevronRight, Power, PowerOff, MapPin, Calendar, User, FileText } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { adminService, type AdminAnnouncement } from '@/services/admin.service';

const AdminAnnouncements = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const { toast } = useToast();

  // Charger les annonces
  useEffect(() => {
    loadAnnouncements();
  }, [searchTerm, pagination.page]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAnnouncements({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm
      });
      setAnnouncements(response.announcements);
      setPagination(prev => ({ ...prev, ...response.pagination }));
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les annonces',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (announcementId: string, currentStatus: string, isActive: boolean) => {
    try {
      const response = await adminService.updateAnnouncementStatus(announcementId, currentStatus, isActive);
      if (response.success) {
        toast({
          title: 'Succès',
          description: `Annonce ${isActive ? 'activée' : 'désactivée'}`,
        });
        loadAnnouncements();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!deleteModal.announcementId) return;

    try {
      const response = await adminService.deleteAnnouncement(deleteModal.announcementId);
      if (response.success) {
        toast({
          title: 'Succès',
          description: `"${deleteModal.announcementTitle}" a été supprimée`,
        });
        loadAnnouncements();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'annonce',
        variant: 'destructive'
      });
    } finally {
      closeDeleteModal();
    }
  };

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    announcementId: string | null;
    announcementTitle: string;
  }>({
    isOpen: false,
    announcementId: null,
    announcementTitle: '',
  });

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

  const categoryLabels: Record<string, string> = {
    personnes: 'Personne',
    objets: 'Objet',
    animaux: 'Animal',
    documents: 'Document',
    autres: 'Autre',
  };

  const categoryColors: Record<string, string> = {
    personnes: 'bg-blue-100 text-blue-800 border-blue-200',
    objets: 'bg-green-100 text-green-800 border-green-200',
    animaux: 'bg-purple-100 text-purple-800 border-purple-200',
    documents: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    autres: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des Annonces</h1>
          <p className="text-muted-foreground">
            Gérez et modérez les {announcements.length} annonces publiées
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre ou auteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 rounded-xl"
          />
        </div>

        {/* Table */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">Aucune annonce trouvée</p>
              <p className="text-sm text-muted-foreground/70">
                {searchTerm ? 'Essayez une autre recherche' : 'Aucune annonce dans la base de données'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/80 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[35%]">Annonce</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catégorie</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lieu & Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Auteur</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">État</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[120px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredAnnouncements.map((announcement) => (
                      <tr key={announcement._id} className="hover:bg-muted/30 transition-colors">
                        {/* Annonce */}
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <h4 className="font-medium text-foreground text-sm truncate" title={announcement.title}>
                              {announcement.title}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {announcement.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                              <Eye className="w-3 h-3" />
                              {announcement.views || 0} vues
                            </div>
                          </div>
                        </td>

                        {/* Catégorie */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                            categoryColors[announcement.category] || categoryColors.autres
                          }`}>
                            {categoryLabels[announcement.category] || 'Autre'}
                          </span>
                        </td>

                        {/* Statut */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                            announcement.status === 'perdu' 
                              ? 'bg-red-100 text-red-700 border border-red-200' 
                              : 'bg-green-100 text-green-700 border border-green-200'
                          }`}>
                            {announcement.status === 'perdu' ? '🔴 Perdu' : '🟢 Trouvé'}
                          </span>
                        </td>

                        {/* Lieu & Date */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-xs">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-[100px]" title={announcement.location}>
                                {announcement.location}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground mt-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(announcement.createdAt).toLocaleDateString('fr-FR', { 
                                day: 'numeric', 
                                month: 'short',
                                year: undefined
                              } as Intl.DateTimeFormatOptions)}
                            </div>
                          </div>
                        </td>

                        {/* Auteur */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                              announcement.user.verified 
                                ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' 
                                : 'bg-primary/10 text-primary'
                            }`}>
                              <span className="text-xs font-medium">
                                {announcement.user.username?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <p className="text-xs font-medium truncate">
                                  {announcement.user.name || announcement.user.username}
                                </p>
                                {announcement.user.verified && (
                                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500" title="Utilisateur certifié">
                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground truncate">{announcement.user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* État (Actif/Inactif) */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleStatusChange(announcement._id, announcement.status, !announcement.isActive)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                              announcement.isActive 
                                ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' 
                                : 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20'
                            }`}
                          >
                            {announcement.isActive ? (
                              <><Power className="w-3 h-3" /> Actif</>
                            ) : (
                              <><PowerOff className="w-3 h-3" /> Inactif</>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(`/annonce/${announcement._id}`, '_blank')}
                              title="Voir l'annonce"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => openDeleteModal(announcement._id, announcement.title)}
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                  <div className="text-xs text-muted-foreground">
                    Page {pagination.page} sur {pagination.pages}
                    <span className="mx-2">•</span>
                    {pagination.total} annonces au total
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page >= pagination.pages}
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal de suppression */}
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

        {/* Stats Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Annonces Perdues
            </p>
            <p className="text-2xl font-bold">
              {announcements.filter((a) => a.status === 'perdu').length}
            </p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Annonces Trouvées
            </p>
            <p className="text-2xl font-bold">
              {announcements.filter((a) => a.status === 'trouvé').length}
            </p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Total Vues
            </p>
            <p className="text-2xl font-bold">
              {announcements.reduce((sum, a) => sum + (a.views || 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
