import { Announcement } from './data';

/**
 * Normalise un texte pour la comparaison
 * Convertit en minuscules et supprime les accents
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Supprime les accents
}

/**
 * Calcule la distance de Levenshtein entre deux chaînes
 * Mesure la différence minimale entre deux chaînes de caractères
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calcule la similarité entre deux chaînes (0-1)
 * Basé sur la distance de Levenshtein
 */
function stringSimilarity(a: string, b: string): number {
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1;
  const distance = levenshteinDistance(a, b);
  return 1 - distance / maxLength;
}

/**
 * Extrait les mots-clés importants d'un texte
 */
function extractKeywords(text: string): string[] {
  const normalized = normalizeText(text);
  const words = normalized
    .split(/\s+/)
    .filter(word => word.length > 2); // Exclure les mots très courts

  // Enlever les mots vides courants
  const stopwords = ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'avec', 'sans', 'dans', 'sur', 'pour', 'du', 'de'];
  return words.filter(word => !stopwords.includes(word));
}

/**
 * Calcule la similarité entre deux annonces
 * Retourne un score entre 0 et 1
 */
function calculateAnnouncementSimilarity(
  newAnnouncement: {
    title: string;
    description: string;
    type: string;
    location: string;
  },
  existingAnnouncement: Announcement
): number {
  const normTitle1 = normalizeText(newAnnouncement.title);
  const normTitle2 = normalizeText(existingAnnouncement.title);
  const normDesc1 = normalizeText(newAnnouncement.description);
  const normDesc2 = normalizeText(existingAnnouncement.description);
  const normLoc1 = normalizeText(newAnnouncement.location);
  const normLoc2 = normalizeText(existingAnnouncement.location);

  // Similarité du titre (poids: 40%)
  const titleSimilarity = stringSimilarity(normTitle1, normTitle2);

  // Similarité de la description (poids: 30%)
  const descSimilarity = stringSimilarity(normDesc1, normDesc2);

  // Correspondance exacte de type (poids: 20%)
  const typeMatch = newAnnouncement.type === existingAnnouncement.type ? 1 : 0.3;

  // Correspondance exacte de localisation (poids: 10%)
  const locationMatch = normLoc1 === normLoc2 ? 1 : 0.3;

  // Calcul du score pondéré
  const score = 
    titleSimilarity * 0.4 +
    descSimilarity * 0.3 +
    typeMatch * 0.2 +
    locationMatch * 0.1;

  return score;
}

/**
 * Trouve les annonces similaires
 * @param newAnnouncement - La nouvelle annonce en cours de création
 * @param allAnnouncements - Liste de toutes les annonces existantes
 * @param maxResults - Nombre maximum de résultats (par défaut 5)
 * @param minSimilarity - Score minimum de similarité (par défaut 0.3)
 * @returns Liste des annonces similaires triées par pertinence
 */
export function findSimilarAnnouncements(
  newAnnouncement: {
    title: string;
    description: string;
    type: string;
    status: 'perdu' | 'trouvé';
    location: string;
  },
  allAnnouncements: Announcement[],
  maxResults: number = 5,
  minSimilarity: number = 0.3
): Array<Announcement & { similarity: number }> {
  // Filtrer les annonces avec le statut inverse
  const inverseStatus = newAnnouncement.status === 'perdu' ? 'trouvé' : 'perdu';
  
  const filteredAnnouncements = allAnnouncements.filter(
    ann => ann.status === inverseStatus
  );

  // Calculer la similarité pour chaque annonce
  const similaritiesScores = filteredAnnouncements
    .map(announcement => ({
      announcement,
      similarity: calculateAnnouncementSimilarity(newAnnouncement, announcement),
    }))
    .filter(item => item.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxResults);

  return similaritiesScores.map(item => ({
    ...item.announcement,
    similarity: item.similarity,
  }));
}

/**
 * Génère un message en fonction du type et statut
 */
export function getMatchedMessage(
  newStatus: 'perdu' | 'trouvé',
  count: number
): string {
  if (count === 1) {
    return newStatus === 'perdu'
      ? '✨ Une annonce de quelque chose de trouvé peut correspondre à votre recherche!'
      : '🔍 Une personne qui cherche pourrait être intéressée par cet objet!';
  }
  return newStatus === 'perdu'
    ? `✨ ${count} annonces de choses trouvées pourraient correspondre à votre recherche!`
    : `🔍 ${count} personnes qui cherchent pourraient être intéressées par cet objet!`;
}
