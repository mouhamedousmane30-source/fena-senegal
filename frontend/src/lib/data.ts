export type AnnouncementType = 'personne' | 'objet' | 'animal';
export type AnnouncementStatus = 'perdu' | 'trouvé';

export interface Announcement {
  id: string;
  type: AnnouncementType;
  status: AnnouncementStatus;
  title: string;
  description: string;
  image: string;
  location: string;
  latitude?: number;
  longitude?: number;
  date: string;
  contact: string;
  verified: boolean;
}

export const LOCATIONS = [
  'Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor',
  'Touba', 'Rufisque', 'Mbour', 'Diourbel', 'Tambacounda',
  'Louga', 'Fatick', 'Kédougou', 'Matam', 'Sédhiou', 'Kaffrine'
];

// Quartiers par région pour recherche avancée
export const DISTRICTS_BY_REGION: Record<string, string[]> = {
  'Dakar': ['Médina', 'Plateau', 'Maristes', 'Mermoz', 'Ouakam', 'Fann', 'Niary Tally', 'Sacré-Cœur', 'Yoff', 'Almadies', 'Liberté', 'Parcelles Assainies', 'Rufisque', 'Guediawaye'],
  'Thiès': ['Thiès Ville', 'Thiès Nord', 'Thiès Ouest', 'Thiès Est', 'Mbour', 'Joal', 'Kaolack'],
  'Saint-Louis': ['Saint-Louis Ville', 'Sor', 'Ndar', 'Gueyt Ndar', 'Fass', 'Fass Boundir'],
  'Kaolack': ['Kaolack Ville', 'Kaolack Est', 'Kaolack Ouest', 'Koungheul', 'Guinguinéo'],
  'Ziguinchor': ['Ziguinchor Ville', 'Ziguinchor Nord', 'Ziguinchor Sud', 'Bignona', 'Oussouye'],
  'Touba': ['Touba Ville', 'Mbacké', 'Gassane'],
  'Rufisque': ['Rufisque Ville', 'Rufisque Est', 'Rufisque Ouest', 'Bargny'],
  'Mbour': ['Mbour Ville', 'Mbour Nord', 'Mbour Sud', 'Khimara'],
  'Diourbel': ['Diourbel Ville', 'Diourbel Nord', 'Diourbel Sud', 'Bambey'],
  'Tambacounda': ['Tambacounda Ville', 'Tambacounda Nord', 'Tambacounda Sud'],
  'Louga': ['Louga Ville', 'Louga Nord', 'Louga Sud'],
  'Fatick': ['Fatick Ville', 'Fatick Est', 'Fatick Ouest', 'Foundiougne'],
  'Kédougou': ['Kédougou Ville', 'Kédougou Est', 'Saraya'],
  'Matam': ['Matam Ville', 'Matam Nord', 'Matam Sud'],
  'Sédhiou': ['Sédhiou Ville', 'Sédhiou Est', 'Sédhiou Ouest'],
  'Kaffrine': ['Kaffrine Ville', 'Kaffrine Nord', 'Kaffrine Sud'],
};

// Helper function to get region from district
export const getRegionFromDistrict = (district: string): string | null => {
  for (const [region, districts] of Object.entries(DISTRICTS_BY_REGION)) {
    if (districts.includes(district)) {
      return region;
    }
  }
  return null;
};

export const MOCK_ANNOUNCEMENTS: Announcement[] = [];
