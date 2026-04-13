import { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// TomTom Maps SDK
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface MapPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  apiKey?: string;
}

const MapPicker = ({ onLocationSelect, initialLocation }: MapPickerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<tt.Map | null>(null);
  const markerRef = useRef<tt.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(initialLocation?.address || '');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY || '';
  const defaultLocation = initialLocation || { lat: 14.6928, lng: -14.6788, address: 'Sénégal' };

  // Fonction pour rechercher des adresses
  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&countrycodes=sn&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Feñ-Na-App'
          }
        }
      );

      if (!response.ok) throw new Error('Erreur');
      const data = await response.json();
      setSearchResults(data || []);
    } catch (error) {
      console.error('Erreur recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce pour la recherche
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(value);
    }, 300);
  };

  // Fonction pour sélectionner une adresse
  const handleSelectLocation = useCallback((result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const address = result.display_name;

    setSelectedAddress(address);
    setSearchValue(address);
    setSearchResults([]);

    // Mettre à jour la carte
    if (mapRef.current && markerRef.current) {
      mapRef.current.setCenter([lng, lat]);
      mapRef.current.setZoom(15);
      markerRef.current.setLngLat([lng, lat]);
    }

    // Callback
    onLocationSelect({ lat, lng, address });
  }, [onLocationSelect]);

  // Initialiser la carte
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      if (!TOMTOM_API_KEY) {
        setMapError("Clé API TomTom manquante dans le fichier .env");
        setIsLoading(false);
        return;
      }

      const map = tt.map({
        key: TOMTOM_API_KEY,
        container: mapContainerRef.current,
        center: [defaultLocation.lng, defaultLocation.lat],
        zoom: 13
      });

      map.on('error', (e) => {
        console.error("Erreur SDK TomTom:", e);
        if (e.error?.status === 403) {
          setMapError("Accès refusé (403). Vérifiez votre clé API et les restrictions de domaine sur le portail TomTom.");
        }
      });

      const marker = new tt.Marker()
        .setLngLat([defaultLocation.lng, defaultLocation.lat])
        .addTo(map);

      mapRef.current = map;
      markerRef.current = marker;

      // Charger l'adresse initiale
      if (initialLocation?.address) {
        setSelectedAddress(initialLocation.address);
        setSearchValue(initialLocation.address);
      }

      setIsLoading(false);

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
          markerRef.current = null;
        }
      };
    } catch (error) {
      console.error('Erreur initialisation carte:', error);
      setMapError("Impossible de charger la carte interactive.");
      setIsLoading(false);
    }
  }, [defaultLocation, initialLocation]);

  return (
    <div className="space-y-3 w-full">
      {/* Barre de recherche */}
      <div className="relative z-10">
        <div className="absolute left-0 top-0 h-12 w-11 flex items-center justify-center text-muted-foreground">
          {isSearching ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </div>
        <Input
          type="text"
          placeholder="Chercher une adresse au Sénégal..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-11 h-12 rounded-2xl pr-10"
        />
        {searchValue && (
          <button
            onClick={() => {
              setSearchValue('');
              setSearchResults([]);
            }}
            className="absolute right-0 top-0 h-12 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Résultats de recherche */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto"
            >
              <div className="p-2 space-y-1">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectLocation(result)}
                    className="w-full text-left px-4 py-3 hover:bg-primary/10 rounded-xl transition-all duration-200 flex items-start gap-4 group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {result.display_name.split(',')[0]} {/* Le quartier/lieu */}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {result.display_name.split(',').slice(1, 4).join(',').trim()} {/* Ville et région */}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Carte - Réduite pour ne pas déborder */}
      <div className="relative">
        <div
          ref={mapContainerRef}
          className="w-full rounded-2xl overflow-hidden border border-input bg-muted"
          style={{ minHeight: '300px', height: '300px', maxHeight: '300px' }}
        />
        
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-2xl p-6 text-center">
            <div className="text-sm text-destructive font-medium">
              {mapError}
            </div>
          </div>
        )}
      </div>

      {/* Adresse sélectionnée */}
      {!isLoading && selectedAddress && (
        <div className="bg-found/10 border border-found/30 rounded-2xl p-3">
          <p className="text-xs font-semibold text-found uppercase tracking-wider mb-1">
            ✓ Localisation sélectionnée
          </p>
          <p className="text-sm text-foreground break-words">{selectedAddress}</p>
        </div>
      )}

      {isLoading && (
        <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
      )}
    </div>
  );
};

export default MapPicker;
