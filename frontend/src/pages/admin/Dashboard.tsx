import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, FileText, AlertCircle, TrendingUp, Activity, Eye } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { adminService, type AdminStats } from '@/services/admin.service';

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Charger les statistiques
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les statistiques',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Bienvenue dans le panneau d'administration Feñ Na Sénégal</p>
          </div>
          
          {/* Boutons de navigation rapide */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/admin')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === '/admin'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/admin/announcements')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === '/admin/announcements'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              Annonces
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === '/admin/users'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              Utilisateurs
            </button>
            <button
              onClick={() => navigate('/admin/reports')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === '/admin/reports'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              Signalements
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Utilisateurs */}
            <div 
              onClick={() => navigate('/admin/users')}
              className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Total Utilisateurs
                  </p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{stats.newUsers || 0} ce mois
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Annonces */}
            <div 
              onClick={() => navigate('/admin/announcements')}
              className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Total Annonces
                  </p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalAnnouncements}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.activeAnnouncements || 0} actives
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Taux d'activité */}
            <div 
              onClick={() => navigate('/admin/announcements')}
              className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Taux d'Activité
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.totalAnnouncements > 0 
                      ? Math.round((stats.activeAnnouncements / stats.totalAnnouncements) * 100) 
                      : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Annonces visibles
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/20">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Vues */}
            <div 
              onClick={() => navigate('/admin/announcements')}
              className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Total Vues
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.totalViews?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Toutes annonces
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-orange-500/20">
                  <Eye className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/50 rounded-2xl border border-border/50">
            <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">Impossible de charger les statistiques</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
