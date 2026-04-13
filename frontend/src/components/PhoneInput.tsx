import { useState, useEffect } from 'react';
import { Phone, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Liste des pays avec leurs indicateurs et drapeaux (emoji)
const countries = [
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮' },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫' },
  { code: 'GN', name: 'Guinée', dialCode: '+224', flag: '🇬🇳' },
  { code: 'GM', name: 'Gambie', dialCode: '+220', flag: '🇬🇲' },
  { code: 'GW', name: 'Guinée-Bissau', dialCode: '+245', flag: '🇬🇼' },
  { code: 'MR', name: 'Mauritanie', dialCode: '+222', flag: '🇲🇷' },
  { code: 'NE', name: 'Niger', dialCode: '+227', flag: '🇳🇪' },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬' },
  { code: 'BJ', name: 'Bénin', dialCode: '+229', flag: '🇧🇯' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'US', name: 'États-Unis', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'Royaume-Uni', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'DE', name: 'Allemagne', dialCode: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Italie', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Espagne', dialCode: '+34', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const PhoneInput = ({ value, onChange, placeholder = "Numéro WhatsApp", className = "", required = false }: PhoneInputProps) => {
  // Détecter le pays par défaut basé sur le numéro ou utiliser le Sénégal
  const detectCountry = (phoneValue: string) => {
    if (!phoneValue) return countries[0]; // Sénégal par défaut
    
    // Chercher si le numéro commence par un indicatif
    const country = countries.find(c => phoneValue.startsWith(c.dialCode));
    return country || countries[0];
  };

  const [selectedCountry, setSelectedCountry] = useState(() => detectCountry(value));
  const [localNumber, setLocalNumber] = useState(() => {
    if (!value) return '';
    // Retirer l'indicatif du numéro pour l'affichage local
    if (value.startsWith(selectedCountry.dialCode)) {
      return value.substring(selectedCountry.dialCode.length);
    }
    return value;
  });

  // Mettre à jour le numéro complet quand le pays ou le numéro local change
  useEffect(() => {
    const fullNumber = localNumber ? `${selectedCountry.dialCode}${localNumber}` : '';
    onChange(fullNumber);
  }, [selectedCountry, localNumber]);

  const handleCountryChange = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    // Convertir le numéro existant vers le nouveau format si possible
    if (localNumber) {
      const cleanNumber = localNumber.replace(/\D/g, '');
      onChange(`${country.dialCode}${cleanNumber}`);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ''); // Ne garder que les chiffres
    setLocalNumber(input);
  };

  return (
    <div className={`flex items-center gap-2 border border-input rounded-2xl bg-background px-3 h-12 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${className}`}>
      {/* Sélecteur de pays avec drapeau */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-1 px-2 py-1 h-8 hover:bg-muted"
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-muted-foreground">
              {selectedCountry.dialCode}
            </span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
          {countries.map((country) => (
            <DropdownMenuItem
              key={country.code}
              onClick={() => handleCountryChange(country)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <span className="text-lg">{country.flag}</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{country.name}</span>
                <span className="text-xs text-muted-foreground">{country.dialCode}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Champ de saisie du numéro */}
      <div className="flex-1 flex items-center gap-2">
        <Phone className="w-4 h-4 text-muted-foreground" />
        <input
          type="tel"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder={placeholder}
          required={required}
          className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
};

export default PhoneInput;
