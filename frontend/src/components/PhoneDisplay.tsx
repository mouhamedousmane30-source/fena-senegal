import { Phone } from 'lucide-react';

// Mapping des indicatifs vers les pays
const countryData: Record<string, { flag: string; name: string }> = {
  '+221': { flag: '🇸🇳', name: 'Sénégal' },
  '+225': { flag: '🇨🇮', name: "Côte d'Ivoire" },
  '+223': { flag: '🇲🇱', name: 'Mali' },
  '+226': { flag: '🇧🇫', name: 'Burkina Faso' },
  '+224': { flag: '🇬🇳', name: 'Guinée' },
  '+220': { flag: '🇬🇲', name: 'Gambie' },
  '+245': { flag: '🇬🇼', name: 'Guinée-Bissau' },
  '+222': { flag: '🇲🇷', name: 'Mauritanie' },
  '+227': { flag: '🇳🇪', name: 'Niger' },
  '+228': { flag: '🇹🇬', name: 'Togo' },
  '+229': { flag: '🇧🇯', name: 'Bénin' },
  '+233': { flag: '🇬🇭', name: 'Ghana' },
  '+33': { flag: '🇫🇷', name: 'France' },
  '+1': { flag: '🇺🇸', name: 'États-Unis/Canada' },
  '+44': { flag: '🇬🇧', name: 'Royaume-Uni' },
  '+49': { flag: '🇩🇪', name: 'Allemagne' },
  '+39': { flag: '🇮🇹', name: 'Italie' },
  '+34': { flag: '🇪🇸', name: 'Espagne' },
  '+351': { flag: '🇵🇹', name: 'Portugal' },
};

interface PhoneDisplayProps {
  phoneNumber: string;
  showIcon?: boolean;
  className?: string;
}

export const PhoneDisplay = ({ phoneNumber, showIcon = true, className = "" }: PhoneDisplayProps) => {
  if (!phoneNumber) return null;

  // Détecter le pays basé sur l'indicatif
  let country = { flag: '🌍', name: 'International' };
  let cleanNumber = phoneNumber;

  // Chercher l'indicatif dans le numéro
  for (const [dialCode, data] of Object.entries(countryData)) {
    if (phoneNumber.startsWith(dialCode)) {
      country = data;
      cleanNumber = phoneNumber.substring(dialCode.length);
      break;
    }
  }

  // Formater le numéro pour l'affichage
  const formattedNumber = cleanNumber.replace(/(\d{2})(?=\d)/g, '$1 ');

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <Phone className="w-4 h-4 text-muted-foreground" />}
      <span className="text-lg">{country.flag}</span>
      <span className="font-medium">
        {country.name !== 'International' && '+'}
        {formattedNumber}
      </span>
    </div>
  );
};

export default PhoneDisplay;
