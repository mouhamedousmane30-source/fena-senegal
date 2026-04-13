import { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, SearchX, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import AnnouncementCard from '@/components/AnnouncementCard';
import { announcementService, type AnnouncementResponse } from '@/services/announcement.service';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const Annonces = () => {
  const [annonces, setAnnonces] = useState<AnnouncementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Filter states
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch annonces from API
  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        setLoading(true);
        const data = await announcementService.getAnnouncements();
        setAnnonces(data);
        setError(false);
      } catch (err) {
        console.error("Erreur lors de la récupération :", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnonces();
  }, []);

  // Filter annonces based on search and filters
  const filtered = useMemo(() => {
    return annonces.filter(a => {
      if (query && !a.title.toLowerCase().includes(query.toLowerCase()) && !a.description.toLowerCase().includes(query.toLowerCase())) return false;
      if (typeFilter && a.category !== typeFilter) return false;
      if (statusFilter && a.status !== statusFilter) return false;
      return true;
    });
  }, [annonces, query, typeFilter, statusFilter]);

  // Live search suggestions
  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    return annonces
      .filter(a => a.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 4)
      .map(a => a.title);
  }, [query, annonces]);

  const hasFilters = typeFilter || statusFilter;

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse">Récupération des annonces...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <AlertCircle className="w-16 h-16 text-destructive/50" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Erreur de chargement</h2>
              <p className="text-muted-foreground max-w-xs">
                Impossible de récupérer les annonces. Vérifiez votre connexion ou réessayez plus tard.
              </p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Réessayer
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-10">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3">Annonces</h1>
          <p className="text-muted-foreground text-lg">Recherchez parmi toutes les déclarations au Sénégal</p>
        </motion.div>

        {/* Search bar */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="relative flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher une annonce..."
              className="pl-12 h-13 rounded-2xl bg-card border-border/50 text-base shadow-sm focus:shadow-md transition-shadow duration-300"
            />
            {/* Live suggestions */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl border border-border/50 shadow-lg z-20"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setQuery(s); }}
                      className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-3"
                    >
                      <Search className="w-3.5 h-3.5 text-muted-foreground" />
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-13 rounded-2xl gap-2 transition-all duration-300 ${showFilters ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20' : 'hover:border-primary/30'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtres</span>
          </Button>
        </motion.div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="mb-8 overflow-visible"
            >
              <div className="p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-3 block">Type</label>
                    <div className="flex gap-2 flex-wrap">
                      {['documents', 'objets', 'animaux', 'personnes', 'autres'].map(t => (
                        <button
                          key={t}
                          onClick={() => setTypeFilter(typeFilter === t ? '' : t)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            typeFilter === t
                              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                          }`}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-3 block">Statut</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setStatusFilter(statusFilter === 'perdu' ? '' : 'perdu')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          statusFilter === 'perdu' ? 'bg-red-500 text-white shadow-sm shadow-red-500/20' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        Perdu
                      </button>
                      <button
                        onClick={() => setStatusFilter(statusFilter === 'trouvé' ? '' : 'trouvé')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          statusFilter === 'trouvé' ? 'bg-green-500 text-white shadow-sm shadow-green-500/20' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        Trouvé
                      </button>
                    </div>
                  </div>
                </div>
                {hasFilters && (
                  <button
                    onClick={() => { setTypeFilter(''); setStatusFilter(''); }}
                    className="mt-4 text-xs font-medium text-primary flex items-center gap-1.5 hover:underline transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Réinitialiser les filtres
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-6">
              <SearchX className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="font-display font-bold text-xl text-foreground mb-3">Aucun résultat trouvé</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
              Essayez de modifier vos filtres ou votre recherche pour trouver ce que vous cherchez.
            </p>
            {hasFilters && (
              <Button
                variant="outline"
                onClick={() => { setTypeFilter(''); setStatusFilter(''); setQuery(''); }}
                className="mt-6 rounded-xl gap-2"
              >
                <X className="w-4 h-4" /> Réinitialiser
              </Button>
            )}
          </motion.div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">{filtered.length} annonce{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={i}
                >
                  <AnnouncementCard announcement={a} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Annonces;