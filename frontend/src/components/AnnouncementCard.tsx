import { Link } from 'react-router-dom';
import { MapPin, Calendar, User, Package, PawPrint, Share2, BadgeCheck } from 'lucide-react';

// Configuration des icônes par catégorie (aligné avec le backend)
const categoryIcons = {
  documents: Package,
  objets: Package,
  animaux: PawPrint,
  personnes: User,
  autres: Package,
};

const AnnouncementCard = ({ announcement }: { announcement: any }) => {
  const Icon = categoryIcons[announcement.category as keyof typeof categoryIcons] || Package;

  // Configuration du partage WhatsApp
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `🔍 ${announcement.status === 'perdu' ? 'PERDU' : 'TROUVÉ'}: ${announcement.title} à ${announcement.location}. Voir sur Feñ Na Sénégal.`
  )}`;

  const handleWhatsappShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(whatsappShareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="group relative">
      <Link to={`/annonce/${announcement.id}`} className="block">
        <div className="bg-card rounded-2xl overflow-hidden shadow-md border border-border/40 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1.5">
          
          {/* SECTION IMAGE : Gestion de l'imageUrl de Cloudinary */}
          <div className="relative h-52 bg-muted flex items-center justify-center overflow-hidden">
            {announcement.images && announcement.images.length > 0 ? (
              <img 
                src={announcement.images[0]} 
                alt={announcement.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                // Fallback si l'URL de l'image est morte ou mal chargée
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Icon className="w-12 h-12 text-muted-foreground/30 group-hover:scale-110 transition-transform" />
            )}
            
            {/* Badge de statut (Perdu / Trouvé) */}
            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg text-white ${
                announcement.status === 'perdu' ? 'bg-red-500' : 'bg-green-600'
              }`}>
                {announcement.status}
              </span>
            </div>

            {/* Badge de Type (Optionnel pour plus de clarté) */}
            <div className="absolute top-3 right-3">
               <span className="bg-black/40 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tighter">
                 {announcement.category}
               </span>
            </div>
          </div>

          {/* CONTENU DE L'ANNONCE */}
          <div className="p-5 space-y-3">
            <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {announcement.title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2 h-10">
              {announcement.description}
            </p>

            {/* Auteur avec badge certifié */}
            {announcement.user && (
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  announcement.user.verified
                    ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {announcement.user.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-xs font-medium text-foreground truncate">
                    {announcement.user.name || announcement.user.username}
                  </span>
                  {announcement.user.verified && (
                    <span title="Utilisateur certifié">
                      <BadgeCheck className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground max-w-[60%]">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span className="truncate text-foreground font-semibold">{announcement.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>
                  {announcement.date 
                    ? new Date(announcement.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) 
                    : 'Récemment'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Bouton de partage WhatsApp flottant */}
      <button
        onClick={handleWhatsappShare}
        title="Partager sur WhatsApp"
        className="absolute bottom-20 right-4 w-9 h-9 rounded-full bg-green-500 text-white shadow-xl hover:bg-green-600 hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-10"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AnnouncementCard;