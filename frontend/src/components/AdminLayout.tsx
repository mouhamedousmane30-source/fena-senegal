import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, FileText, Users, AlertCircle, LogOut, Menu, X, MapPin, ExternalLink, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/admin', icon: BarChart3, label: 'Dashboard' },
    { path: '/admin/announcements', icon: FileText, label: 'Annonces' },
    { path: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { path: '/admin/reports', icon: AlertCircle, label: 'Signalements' },
  ];

  const isActive = (path: string) => location.pathname === path;

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
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${!sidebarOpen && 'rotate-180'}`} />
          </button>
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
