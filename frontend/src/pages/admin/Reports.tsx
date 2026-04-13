import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, FileText, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { adminService, type AdminReports } from '@/services/admin.service';

const AdminReports = () => {
  const [reports, setReports] = useState<AdminReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const { toast } = useToast();

  // Charger les rapports
  useEffect(() => {
    loadReports();
  }, [period]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await adminService.getReports(period);
      if (response.success) {
        setReports(response.reports);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les rapports',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const periodOptions = [
    { value: 7, label: '7 derniers jours' },
    { value: 30, label: '30 derniers jours' },
    { value: 90, label: '90 derniers jours' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Rapports et Analyse</h1>
          <p className="text-muted-foreground">
            Analyse détaillée de l'activité de la plateforme
          </p>
        </div>

        {/* Period Selector */}
        <div className="bg-card border border-border/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Période d'analyse</h3>
          <div className="grid grid-cols-3 gap-4">
            {periodOptions.map((option) => (
              <Button
                key={option.value}
                variant={period === option.value ? 'default' : 'outline'}
                onClick={() => setPeriod(option.value)}
                className="h-12"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Reports Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : reports ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overview Stats */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Vue d'ensemble</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Nouveaux utilisateurs</p>
                  <p className="text-3xl font-bold text-green-600">
                    {reports.newUsers}
                    <span className="text-sm text-muted-foreground ml-2">
                      {reports.newUsers > 0 ? (
                        <TrendingUp className="w-4 h-4 inline" />
                      ) : (
                        <TrendingDown className="w-4 h-4 inline" />
                      )}
                    </span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Nouvelles annonces</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {reports.newAnnouncements}
                    <span className="text-sm text-muted-foreground ml-2">
                      {reports.newAnnouncements > 0 ? (
                        <TrendingUp className="w-4 h-4 inline" />
                      ) : (
                        <TrendingDown className="w-4 h-4 inline" />
                      )}
                    </span>
                  </p>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-foreground mb-3">Répartition par statut</h4>
                <div className="space-y-3">
                  {reports.announcementsByStatus.map((status) => (
                    <div key={status._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          status._id === 'perdu' ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                        <span className="text-sm font-medium capitalize">
                          {status._id === 'perdu' ? 'Perdu' : 'Trouvé'}
                        </span>
                      </div>
                      <span className="text-2xl font-bold">{status.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Répartition par catégorie</h3>
              <div className="space-y-3">
                {reports.announcementsByCategory.map((category) => (
                  <div key={category._id} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {category._id === 'personnes' ? 'Personnes' :
                       category._id === 'objets' ? 'Objets' : 'Animaux'}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            category._id === 'personnes' ? 'bg-blue-500' :
                            category._id === 'objets' ? 'bg-green-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${(category.count / reports.newAnnouncements) * 100}%` }}
                        />
                      </div>
                      <span className="text-2xl font-bold ml-2">{category.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Users */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Utilisateurs les plus actifs</h3>
              <div className="space-y-4">
                {reports.topUsers.map((user, index) => (
                  <div key={user.username} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-lg font-bold text-primary">{user.count} annonces</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune donnée disponible</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
