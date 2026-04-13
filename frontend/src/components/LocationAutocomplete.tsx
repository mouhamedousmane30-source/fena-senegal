import { useState, useRef, useEffect } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Liste des localisations au Sénégal et régions voisines
const senegalLocations = [
  // Régions du Sénégal
  'Dakar', 'Pikine', 'Guédiawaye', 'Rufisque', 'Keur Massar',
  'Thiès', 'Mbour', 'Tivaouane', 'Khombole', 'Mékhé',
  'Saint-Louis', 'Richard-Toll', 'Dagana', 'Podor', 'Matam',
  'Louga', 'Linguère', 'Kébémer', 'Saint-Louis', 'Tambacounda',
  'Kédougou', 'Kolda', 'Sédhiou', 'Ziguinchor', 'Bignona',
  'Oussouye', 'Kolda', 'Vélingara', 'Tambacounda', 'Bakel',
  'Kaolack', 'Fatick', 'Foundiougne', 'Gossas', 'Nioro du Rip',
  'Kaffrine', 'Bambey', 'Diourbel', 'Mbacké', 'Touba',
  'Kaolack', 'Koungheul', 'Guinguinéo', 'Nioro du Rip',
  'Fatick', 'Foundiougne', 'Gossas', 'Passy', 'Sokone',
  'Kolda', 'Sédhiou', 'Ziguinchor', 'Bignona', 'Oussouye',
  'Cap Skirring', 'Kafountine', 'Karabane', 'Kolda',
  'Kédougou', 'Saraya', 'Salémata', 'Tambacounda', 'Bakel',
  'Matam', 'Kanel', 'Ranérou', 'Semmé', 'Thilogne',
  'Louga', 'Linguère', 'Kébémer', 'Ndiagne', 'Coki',
  'Thiès', 'Mbour', 'Joal-Fadiouth', 'Saly Portudal', 'Ngaparou',
  'Somone', 'Popenguine', 'Tivaouane', 'Mékhé', 'Khombole',
  'Diourbel', 'Mbacké', 'Touba', 'Bambey',
  
  // Villes et communes populaires
  'Almadies', 'Ngor', 'Yoff', 'Ouakam', 'Liberté', 'Fann',
  'Point E', 'Mermoz', 'Les Parcelles Assainies', 'Grand Yoff',
  'Medina', 'Plateau', 'Colobane', 'Fass', 'Gorée',
  'Bargny', 'Boukote', 'Cambérène', 'Malika', 'Sebkha',
  'Thiaroye', 'Yeumbeul', 'Diamniadio', 'Sangalkam', 'Bambilor',
  'Toubab Dialaw', 'Yène', 'Popenguine', 'Ndayane', 'Pout',
  'Kéniaba', 'Diamniadio', 'Sindia', 'Nguekhokh', 'Thilor',
  
  // Autres pays de l'Afrique de l'Ouest
  'Bamako', 'Ségou', 'Mopti', 'Kayes', 'Sikasso', 'Gao', 'Tombouctou',
  'Ouagadougou', 'Bobo-Dioulasso', 'Bananfora', 'Koudougou', 'Ouahigouya',
  'Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Daloa', 'Korhogo',
  'Conakry', 'Nzérékoré', 'Kankan', 'Kindia', 'Boké', 'Labé',
  'Bissau', 'Bafatá', 'Gabu', 'Bolama',
  'Nouakchott', 'Nouadhibou', 'Rosso', 'Kaédi', 'Zouérat',
  'Niamey', 'Zinder', 'Maradi', 'Tahoua', 'Agadez',
  'Lomé', 'Sokodé', 'Kpalimé', 'Atakpamé', 'Kara',
  'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey', 'Bohicon',
  'Accra', 'Kumasi', 'Tamale', 'Sekondi-Takoradi', 'Cape Coast',
  'Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt',
  
  // Quartiers spécifiques de Dakar
  'Dakar-Plateau', 'Médina', 'Fann', 'Mermoz-Sacré-Coeur', 'Ouakam',
  'Yoff', 'Ngor', 'Liberté', 'Grand-Yoff', 'Almadies',
  'Point E', 'Fass', 'Colobane', 'Gueule Tapée', 'Cambérène',
  'HLM', 'Biscuiterie', 'Grand Dakar', 'Dieuppeul-Derklé', 'Hann Bel-Air',
  'Sicap', 'Liberté', 'Parcelles Assainies', 'Patte d\'Oie', 'Dalifort',
  'Castors', 'Dermech', 'Gorée', 'Bél-air', 'Soprim',
  'Hann-Maristes', 'Keur Massar', 'Yeumbeul Nord', 'Yeumbeul Sud',
  'Thiaroye Gare', 'Thiaroye sur Mer', 'Tivaouane Peulh', 'Mbao',
  'Pikine Ouest', 'Pikine Est', 'Pikine Nord', 'Pikine Sud',
];

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const LocationAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Rechercher un lieu (ex: Dakar, Thiès...)",
  className = "",
  required = false 
}: LocationAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fermer les suggestions quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrer les suggestions
  const filterSuggestions = (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    
    const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    const filtered = senegalLocations
      .filter(location => {
        const normalizedLocation = location.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return normalizedLocation.includes(normalizedQuery);
      })
      .slice(0, 8); // Limiter à 8 suggestions
    
    setSuggestions(filtered);
    setIsOpen(filtered.length > 0);
    setHighlightedIndex(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    filterSuggestions(newValue);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestions[highlightedIndex]) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const clearInput = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className="pl-10 pr-10 h-12 rounded-2xl"
        />
        {inputValue && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Liste de suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-xl shadow-lg max-h-[300px] overflow-y-auto">
          <div className="py-2">
            <div className="px-3 py-1 text-xs text-muted-foreground uppercase tracking-wider">
              Suggestions
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className={`w-full px-3 py-2.5 text-left flex items-center gap-3 transition-colors ${
                  index === highlightedIndex 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted'
                }`}
              >
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">
                  {suggestion}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message si aucune suggestion */}
      {isOpen && inputValue && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-xl shadow-lg">
          <div className="px-4 py-3 text-sm text-muted-foreground">
            Aucun lieu trouvé. Vous pouvez entrer un lieu personnalisé.
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
