import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, FileText, Users, AlertCircle, LogOut, Menu, MapPin, ExternalLink, ChevronLeft, Bell, Check, Trash2, UserPlus, FilePlus, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { adminService, type Notification } from '@/services/admin.service';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const navItems = [
    { path: '/admin', icon: BarChart3, label: 'Dashboard' },
    { path: '/admin/announcements', icon: FileText, label: 'Annonces' },
    { path: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { path: '/admin/reports', icon: AlertCircle, label: 'Signalements' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Charger les notifications
  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await adminService.getNotifications({ limit: 20 });
      if (response.success) {
        setNotifications(response.notifications);
        setUnreadCount(response.unreadCount);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Charger le nombre de notifications non lues
  const loadUnreadCount = async () => {
    try {
      const response = await adminService.getUnreadNotificationsCount();
      if (response.success) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du nombre de notifications:', error);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    try {
      await adminService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  // Marquer toutes comme lues
  const markAllAsRead = async () => {
    try {
      await adminService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast({
        title: 'Notifications',
        description: 'Toutes les notifications ont été marquées comme lues',
      });
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
    }
  };

  // Supprimer une notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await adminService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
    }
  };

  // Naviguer vers le lien de la notification
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
      setNotificationsOpen(false);
    }
  };

  // Obtenir l'icône selon le type de notification
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <UserPlus className="w-4 h-4" />;
      case 'announcement_created':
        return <FilePlus className="w-4 h-4" />;
      case 'announcement_reported':
      case 'announcement_deleted':
      case 'user_deleted':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  // Obtenir la couleur selon la priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Charger les notifications au montage
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex fixed lg:static top-0 left-0 h-screen z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-card border-r border-border/50 flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border/50">
          <Link to="/" className={`flex items-center gap-2 group ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md flex-shrink-0">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            {sidebarOpen && <span className="font-bold text-sm">Feñ Na</span>}
          </Link>
          
          {/* Bouton Notifications (Desktop) */}
          <div className="flex items-center gap-2">
            <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <SheetTrigger asChild>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors relative">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-96 p-0">
                <SheetHeader className="h-16 border-b border-border/50 px-6 flex items-center justify-between">
                  <SheetTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                    disabled={unreadCount === 0}
                  >
                    <Check className="w-4 h-4" />
                    Tout marquer comme lu
                  </button>
                  <button
                    onClick={() => loadNotifications()}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Rafraîchir
                  </button>
                </div>
                
                <div className="overflow-y-auto h-[calc(100vh-140px)]">
                  {loadingNotifications ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="divide-y divide-border/50">
                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                            !notification.isRead ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)} text-white`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground">
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.createdAt).toLocaleString('fr-FR')}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              {!notification.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification._id);
                                  }}
                                  className="p-1 hover:bg-muted rounded"
                                  title="Marquer comme lu"
                                >
                                  <Check className="w-4 h-4 text-primary" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification._id);
                                }}
                                className="p-1 hover:bg-muted rounded"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">Aucune notification</p>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors hidden lg:block"
            >
              <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${!sidebarOpen && 'rotate-180'}`} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                } ${!sidebarOpen && 'justify-center'}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-border/50 p-4 space-y-3">
          {sidebarOpen && (
            <div className="px-3 py-2 bg-muted/50 rounded-xl">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Admin
              </p>
              <p className="text-sm font-medium text-foreground truncate">{user?.username}</p>
            </div>
          )}
          
          {/* Retour au site */}
          <Link
            to="/"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${
              sidebarOpen ? 'justify-start' : 'justify-center'
            }`}
            title="Retourner au site"
          >
            <ExternalLink className="w-4 h-4" />
            {sidebarOpen && <span>Voir le site</span>}
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className={`w-full rounded-xl gap-2 ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Déconnexion</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Header avec Sheet Menu */}
        <div className="lg:hidden h-16 border-b border-border/50 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="h-16 border-b border-border/50 px-6 flex items-center">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
                      <MapPin className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-sm">Feñ Na Admin</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="p-4 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          active
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 p-4 space-y-3">
                  <div className="px-3 py-2 bg-muted/50 rounded-xl">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Admin
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">{user?.username}</p>
                  </div>
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Voir le site</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full rounded-xl gap-2 justify-start"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Titre mobile */}
          <h1 className="font-bold text-sm text-foreground">
            {navItems.find(item => isActive(item.path))?.label || 'Admin'}
          </h1>
          
          {/* Avatar utilisateur mobile */}
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">{children}</div>
        </div>
      </main>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 lg:hidden z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
