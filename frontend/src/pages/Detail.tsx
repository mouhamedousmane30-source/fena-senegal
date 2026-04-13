import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Phone, 
  ArrowLeft, 
  MessageCircle, 
  Package, 
  User, 
  PawPrint,
  AlertCircle,
  Loader2,
  BadgeCheck
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Layout from '@/components/Layout';
import { announcementService, type AnnouncementResponse } from '@/services/announcement.service';
import PhoneDisplay from '@/components/PhoneDisplay';
import AnnouncementCard from '@/components/AnnouncementCard';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // États pour gérer les données et l'affichage
  const [annonce, setAnnonce] = useState<AnnouncementResponse | null>(null);
  const [similarAnnouncements, setSimilarAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [error, setError] = useState(false);
  const [imageLightboxOpen, setImageLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        setLoading(true);
        // Valider l'ID avant l'appel API
        if (!id || id === 'undefined' || id === undefined) {
          throw new Error('ID d\'annonce invalide');
        }
        const data = await announcementService.getAnnouncement(id);
        setAnnonce(data);
        setError(false);
        
        // Charger les annonces similaires
        if (data.category) {
          setLoadingSimilar(true);
          try {
            const similar = await announcementService.getSimilarAnnouncements(data.category, data.id, 4);
            setSimilarAnnouncements(similar);
          } catch (simErr) {
            console.error("Erreur lors du chargement des annonces similaires:", simErr);
          } finally {
            setLoadingSimilar(false);
          }
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de l'annonce:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id && id !== 'undefined' && id !== undefined) {
      fetchAnnonce();
    } else {
      setLoading(false);
      setError(true);
    }
  }, [id]);

  // État de chargement
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse">Récupération des détails...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // État d'erreur ou annonce introuvable
  if (error || !annonce) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <AlertCircle className="w-16 h-16 text-destructive/50" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Annonce introuvable</h2>
              <p className="text-muted-foreground max-w-xs">
                Cette annonce a peut-être été supprimée ou le lien est incorrect.
              </p>
            </div>
            <Button onClick={() => navigate('/annonces')} variant="outline">
              Retour à la liste
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Configuration dynamique de l'icône selon la catégorie
  const Icon = annonce.category === 'personnes' ? User : annonce.category === 'animaux' ? PawPrint : Package;

  // Préparation des liens de contact
  const purePhone = annonce.contactInfo?.phone?.replace(/\s/g, '') || ''; // Nettoie les espaces
  const whatsappMsg = encodeURIComponent(`Bonjour, je vous contacte via Feñ Na Sénégal concernant votre annonce : "${annonce.title}".`);
  const whatsappUrl = `https://wa.me/${purePhone}?text=${whatsappMsg}`;

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Back Button */}
        <motion.button
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Retour aux annonces</span>
        </motion.button>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start"
        >
          
          {/* Colonne Gauche : photo en grand ou illustration */}
          <div className="lg:col-span-5">
            <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-3xl flex items-center justify-center border border-border/30 relative overflow-hidden group shadow-sm">
              {annonce.images && annonce.images.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setImageLightboxOpen(true)}
                  className="absolute inset-0 z-0 flex h-full w-full items-center justify-center border-0 bg-muted p-0 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background"
                  aria-label={`Agrandir la photo : ${annonce.title}`}
                >
                  <img
                    src={annonce.images[0]}
                    alt={annonce.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </button>
              ) : (
                <Icon className="relative z-0 w-32 h-32 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="pointer-events-none absolute top-4 left-4 z-10"
              >
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg ${
                  annonce.status === 'perdu' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                }`}>
                  {annonce.status === 'perdu' ? 'Perdu' : 'Trouvé'}
                </span>
              </motion.div>
            </div>
            {annonce.images && annonce.images.length > 0 ? (
              <Dialog open={imageLightboxOpen} onOpenChange={setImageLightboxOpen}>
                <DialogContent className="max-w-[min(96vw,56rem)] w-full gap-0 border-0 bg-zinc-950/95 p-2 sm:p-4 shadow-2xl [&>button]:right-3 [&>button]:top-3 [&>button]:text-white [&>button]:hover:bg-white/10 [&>button]:hover:opacity-100">
                  <DialogTitle className="sr-only">Photo — {annonce.title}</DialogTitle>
                  <img
                    src={annonce.images[0]}
                    alt={annonce.title}
                    className="max-h-[85vh] w-full rounded-lg object-contain"
                  />
                </DialogContent>
              </Dialog>
            ) : null}
          </div>

          {/* Colonne Droite : Informations */}
          <div className="lg:col-span-7 space-y-8">
            {/* Titre et infos principales */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight leading-tight">
                {annonce.title}
              </h1>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-muted/60 px-4 py-2 rounded-xl border border-border/30 hover:border-primary/30 transition-colors">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold text-foreground">{annonce.location}</span>
                </div>
                <div className="flex items-center gap-2 bg-muted/60 px-4 py-2 rounded-xl border border-border/30 hover:border-primary/30 transition-colors">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold text-foreground">
                    {new Date(annonce.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                
                {/* Auteur avec badge certifié */}
                {annonce.user && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 px-4 py-2 rounded-xl border border-yellow-200/50">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      annonce.user.verified
                        ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {annonce.user.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-foreground">
                        {annonce.user.name || annonce.user.username}
                      </span>
                      {annonce.user.verified && (
                        <span title="Utilisateur certifié">
                          <BadgeCheck className="w-4 h-4 text-amber-500" />
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3 py-4 border-y border-border/30">
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">Description</h3>
              <p className="text-foreground text-lg leading-relaxed">
                {annonce.description || "Aucune description supplémentaire fournie pour ce signalement."}
              </p>
            </div>

            {/* Section Action / Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 lg:p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/10 space-y-6"
            >
              <div>
                <h3 className="font-bold text-xl text-foreground mb-2">Vous avez des informations ?</h3>
                <p className="text-sm text-muted-foreground">
                  Contactez directement la personne ayant publié cette annonce. Soyez prudent lors de vos échanges.
                </p>
              </div>

              {/* Affichage du numéro avec drapeau */}
              {annonce.contactInfo?.phone && (
                <div className="flex items-center justify-center p-3 bg-background rounded-xl border border-border">
                  <PhoneDisplay 
                    phoneNumber={annonce.contactInfo.phone} 
                    className="text-lg"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    asChild
                    className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-6 rounded-2xl shadow-lg shadow-green-500/20 transition-all text-base font-bold"
                  >
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp
                    </a>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    asChild
                    variant="outline"
                    className="w-full py-6 rounded-2xl border-2 transition-all shadow-sm text-base font-bold"
                  >
                    <a href={`tel:${purePhone}`} className="flex items-center justify-center gap-3">
                      <Phone className="w-5 h-5" />
                      Appeler
                    </a>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Section Annonces Similaires */}
        {similarAnnouncements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-16 pt-10 border-t border-border/30"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h2 className="text-2xl font-bold text-foreground">
                Annonces similaires
              </h2>
              <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground capitalize">
                {annonce.category}
              </span>
            </div>
            
            {loadingSimilar ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarAnnouncements.map((similarAnn) => (
                  <AnnouncementCard key={similarAnn.id} announcement={similarAnn} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Detail;