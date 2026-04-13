import { useState, useEffect } from 'react';
import { Trash2, CheckCircle, Shield, Search, Users, Calendar, Mail, ChevronLeft, ChevronRight, User } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { adminService, type AdminUser } from '@/services/admin.service';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const { toast } = useToast();

  // Charger les utilisateurs
  useEffect(() => {
    loadUsers();
  }, [searchTerm, pagination.page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm
      });
      setUsers(response.users);
      setPagination(prev => ({ ...prev, ...response.pagination }));
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les utilisateurs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerify = async (userId: string, currentVerified: boolean) => {
    try {
      const response = await adminService.verifyUser(userId, !currentVerified);
      if (response.success) {
        toast({
          title: 'Succès',
          description: `Utilisateur ${!currentVerified ? 'vérifié' : 'non vérifié'}`,
        });
        loadUsers(); // Recharger la liste
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la vérification',
        variant: 'destructive'
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const response = await adminService.updateUserRole(userId, newRole);
      if (response.success) {
        toast({
          title: 'Succès',
          description: `Rôle de l'utilisateur mis à jour: ${newRole}`,
        });
        loadUsers(); // Recharger la liste
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le rôle',
        variant: 'destructive'
      });
    }
  };

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: '',
  });

  const openDeleteModal = (userId: string, userName: string) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      userId: null,
      userName: '',
    });
  };

  const handleDeleteUser = async () => {
    if (!deleteModal.userId) return;

    try {
      const response = await adminService.deleteUser(deleteModal.userId);
      if (response.success) {
        toast({
          title: 'Succès',
          description: `"${deleteModal.userName}" a été supprimé`,
        });
        loadUsers();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'utilisateur',
        variant: 'destructive'
      });
    } finally {
      closeDeleteModal();
    }
  };


  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez les {users.length} utilisateurs enregistrés
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
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
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">Aucun utilisateur trouvé</p>
              <p className="text-sm text-muted-foreground/70">
                {searchTerm ? 'Essayez une autre recherche' : 'Aucun utilisateur dans la base de données'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/80 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Utilisateur</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rôle</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inscription</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[120px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                        {/* Utilisateur */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                              user.verified
                                ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white'
                                : 'bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 text-primary'
                            }`}>
                              <span className="text-sm font-semibold">
                                {user.username?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {user.name || user.username}
                                </p>
                                {user.verified && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-sm" title="Utilisateur certifié">
                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    CERTIFIÉ
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span className="truncate">{user.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Rôle */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleRoleChange(user._id, user.role === 'admin' ? 'user' : 'admin')}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                              user.role === 'admin'
                                ? 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {user.role === 'admin' ? (
                              <><Shield className="w-3 h-3" /> Admin</>
                            ) : (
                              <><User className="w-3 h-3" /> User</>
                            )}
                          </button>
                        </td>

                        {/* Date d'inscription */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: '2-digit'
                            } as Intl.DateTimeFormatOptions)}
                          </div>
                        </td>

                        {/* Statut de vérification */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleVerify(user._id, user.verified)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                              user.verified
                                ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                                : 'bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200'
                            }`}
                          >
                            <CheckCircle className="w-3 h-3" />
                            {user.verified ? 'Vérifié' : 'En attente'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => openDeleteModal(user._id, user.username)}
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
                    {pagination.total} utilisateurs au total
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
              Êtes-vous sûr de vouloir supprimer <strong>"{deleteModal.userName}"</strong> ?
              <br /><br />
              Cette action est <span className="text-destructive font-semibold">irréversible</span> et supprimera toutes les données de cet utilisateur.
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
                onClick={handleDeleteUser}
                className="rounded-xl"
              >
                Supprimer définitivement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stats Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Total Utilisateurs
            </p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Vérifiés
            </p>
            <p className="text-2xl font-bold">{users.filter((u) => u.verified).length}</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Administrateurs
            </p>
            <p className="text-2xl font-bold">{users.filter((u) => u.role === 'admin').length}</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Actifs Maintenant
            </p>
            <p className="text-2xl font-bold">{users.filter((u) => u.isActive).length}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
