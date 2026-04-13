import { Announcement } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SimilarAnnouncementsSuggestionProps {
  announcements: Array<Announcement & { similarity: number }>;
  message: string;
  newStatus: 'perdu' | 'trouvé';
  onContactClick?: (announcement: Announcement) => void;
}

const SimilarAnnouncementsSuggestion = ({
  announcements,
  message,
  newStatus,
  onContactClick,
}: SimilarAnnouncementsSuggestionProps) => {
  const navigate = useNavigate();

  if (announcements.length === 0) {
    return null;
  }

  const bgColor = newStatus === 'perdu' ? 'bg-found/5 border-found/20' : 'bg-lost/5 border-lost/20';
  const borderColor = newStatus === 'perdu' ? 'border-found' : 'border-lost';
  const textColor = newStatus === 'perdu' ? 'text-found' : 'text-lost';

  const getRelevancePercentage = (similarity: number): number => {
    return Math.round(similarity * 100);
  };

  const getIconEmoji = (type: string): string => {
    switch (type) {
      case 'personne':
        return '👤';
      case 'animal':
        return '🐾';
      case 'objet':
        return '📦';
      default:
        return '📌';
    }
  };

  return (
    <div className={`rounded-3xl border-2 ${bgColor} ${borderColor} p-6 lg:p-8`}>
      {/* Header */}
      <div className="flex gap-3 items-start mb-6">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${textColor} bg-white/20`}>
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h3 className={`font-semibold text-lg ${textColor} mb-1`}>Suggestions intelligentes</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {announcements.map((announcement, index) => (
          <div
            key={announcement.id}
            className="bg-card border border-input rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-200 hover:shadow-md group"
          >
            <div className="p-4 flex gap-4">
              {/* Image */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted">
                  <img
                    src={announcement.image}
                    alt={announcement.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Type badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getIconEmoji(announcement.type)}</span>
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                    announcement.status === 'perdu'
                      ? 'bg-lost/20 text-lost'
                      : 'bg-found/20 text-found'
                  }`}>
                    {announcement.status === 'perdu' ? '🔴 Perdu' : '🟢 Trouvé'}
                  </span>
                  {/* Relevance Badge */}
                  <span className={`ml-auto inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${textColor} bg-white/30`}>
                    {getRelevancePercentage(announcement.similarity)}% pertinent
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                  {announcement.title}
                </h4>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {announcement.description}
                </p>

                {/* Location & Date */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{announcement.location}</span>
                  </div>
                  <div>
                    {new Date(announcement.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex flex-col gap-2 ml-4">
                {/* Contact Button */}
                <button
                  onClick={() => onContactClick?.(announcement)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground rounded-xl font-medium transition-all duration-200 text-sm whitespace-nowrap"
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">Contacter</span>
                </button>

                {/* View Button */}
                <button
                  onClick={() => navigate(`/annonce/${announcement.id}`)}
                  className="flex items-center justify-center gap-1 px-3 py-2 border border-input hover:bg-muted rounded-xl font-medium transition-colors text-sm whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Voir</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info message */}
      <div className="mt-6 p-4 bg-black/5 rounded-2xl">
        <p className="text-xs text-muted-foreground leading-relaxed">
          💡 <strong>Conseil :</strong> Ces annonces suggérées ont été trouvées automatiquement. 
          N'hésitez pas à contacter les utilisateurs pour clarifier les détails !
        </p>
      </div>
    </div>
  );
};

export default SimilarAnnouncementsSuggestion;
