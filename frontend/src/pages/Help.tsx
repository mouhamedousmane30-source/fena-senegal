import { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronUp, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { HowItWorksIllustration, ContactIllustration } from '@/components/HowItWorks';

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      id: 1,
      category: 'Déclarations',
      question: 'Comment créer une nouvelle déclaration ?',
      answer: 'Pour créer une déclaration, cliquez sur le bouton "Déclarer" en haut de la page. Remplissez le formulaire avec les informations du bien/personne/animal perdu(e) ou trouvé(e), ajoutez des photos et indiquez la localisation sur la carte. Votre déclaration sera publiée immédiatement après submission.',
    },
    {
      id: 2,
      category: 'Déclarations',
      question: 'Comment modifier une déclaration existante ?',
      answer: 'Allez sur votre page de compte (profil), sélectionnez l\'onglet "Mes Déclarations" et cliquez sur la déclaration à modifier. Mettez à jour les informations nécessaires et sauvegardez les modifications.',
    },
    {
      id: 3,
      category: 'Déclarations',
      question: 'Comment supprimer une déclaration ?',
      answer: 'Accédez à votre compte, allez dans l\'onglet "Mes Déclarations" et cliquez sur le bouton poubelle à côté de la déclaration à supprimer. Confirmez la suppression. Cette action est irréversible.',
    },
    {
      id: 4,
      category: 'Annonces',
      question: 'Comment chercher une annonce spécifique ?',
      answer: 'Utilisez la page "Annonces" pour lister tous les articles. Vous pouvez filtrer par type (Personne, Objet, Animal), par statut (Perdu/Trouvé), ou utiliser la barre de recherche pour trouver des mots clés spécifiques.',
    },
    {
      id: 5,
      category: 'Annonces',
      question: 'Comment contacter quelqu\'un pour une annonce ?',
      answer: 'Cliquez sur l\'annonce qui vous intéresse pour voir les détails. Les informations de contact du déclarant (téléphone, email) s\'affichent en bas. Vous pouvez les appeler ou les envoyer un message directement.',
    },
    {
      id: 6,
      category: 'Compte & Profil',
      question: 'Comment mettre à jour mon profil et ma photo ?',
      answer: 'Allez sur votre page de compte. Vous pouvez modifier votre photo de profil en cliquant sur votre avatar en haut de la page. Votre nom, email et autres informations peuvent être mises à jour depuis votre profil.',
    },
    {
      id: 7,
      category: 'Compte & Profil',
      question: 'Comment changer mon mot de passe ?',
      answer: 'Allez sur votre page de compte et sélectionnez l\'onglet "Sécurité". Entrez votre mot de passe actuel et votre nouveau mot de passe (confirmez-le). Cliquez sur "Changer le mot de passe" pour enregistrer les modifications.',
    },
    {
      id: 8,
      category: 'Compte & Profil',
      question: 'Comment supprimer mon compte ?',
      answer: 'Allez sur votre page de compte, onglet "Sécurité", et trouvez l\'option "Supprimer mon compte" en bas de page. Confirmez cette action. Attention : Cette action est définitive et entraîne la suppression de tous vos données et déclarations.',
    },
    {
      id: 9,
      category: 'Sécurité & Confidentialité',
      question: 'Mes informations sont-elles sécurisées ?',
      answer: 'Oui, nous utilisons le chiffrement SSL pour sécuriser toutes les connexions. Vos informations personnelles ne sont jamais partagées sans votre consentement. Vous pouvez contrôler vos paramètres de confidentialité dans votre compte.',
    },
    {
      id: 10,
      category: 'Sécurité & Confidentialité',
      question: 'Puis-je rendre mon profil privé ?',
      answer: 'Oui, allez dans votre compte, onglet "Confidentialité", et désactivez l\'option "Profil public". Vous pouvez également contrôler si votre email et téléphone sont visibles par les autres utilisateurs.',
    },
    {
      id: 11,
      category: 'Problèmes Techniques',
      question: 'L\'application plante ou ne fonctionne pas correctement',
      answer: 'Essayez d\'abord de rafraîchir la page (F5 ou Ctrl+R). Si le problème persiste, videz le cache de votre navigateur. Si le problème continue, contactez-nous à dioufmohametousmane@gmail.com ou au +221 77 464 98 35 en décrivant le problème détaillé.',
    },
    {
      id: 12,
      category: 'Problèmes Techniques',
      question: 'Comment signaler un problème ou un bug ?',
      answer: 'Accédez à cette page d\'aide et utilisez le formulaire de contact en bas pour envoyer un rapport. Décrivez le problème en détail et incluez des captures d\'écran si possible. Notre équipe vous répondra dans les 24 heures.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        {/* Header */}
        <div className="mb-12">
          <div className="mb-2">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Centre d'aide
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Trouvez des réponses à vos questions les plus fréquentes ou contactez notre équipe pour plus d'aide.
          </p>
        </div>

        {/* How It Works Illustration */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Comment ça marche ?
            </h2>
            <p className="text-muted-foreground">
              4 étapes simples pour retrouver ou rendre un objet
            </p>
          </div>
          <HowItWorksIllustration />
        </div>

        {/* Search Bar */}
        <div className="mb-12 relative">
          <Search className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher dans la FAQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-11 rounded-2xl border-2 border-input hover:border-primary/30 focus:border-primary transition-colors"
          />
        </div>

        {/* FAQ by Category */}
        <div className="space-y-12 mb-16">
          {categories.map((category) => {
            const categoryFaqs = filteredFaqs.filter((f) => f.category === category);
            if (categoryFaqs.length === 0) return null;

            return (
              <div key={category}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-1 w-8 bg-primary rounded-full" />
                  <h2 className="font-display text-2xl font-bold text-foreground">{category}</h2>
                </div>

                <div className="space-y-3">
                  {categoryFaqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-card border border-input rounded-2xl overflow-hidden hover:border-primary/30 transition-colors"
                    >
                      <button
                        onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                      >
                        <h3 className="font-semibold text-foreground pr-4">{faq.question}</h3>
                        {expandedId === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </button>

                      {expandedId === faq.id && (
                        <div className="border-t border-input px-6 py-4 bg-muted/30">
                          <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Aucune réponse trouvée pour "{searchQuery}". Essayez une autre recherche.
              </p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Contact Info */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Vous n'avez pas trouvé l'aide ?</h2>
              <p className="text-muted-foreground mb-8">
                Nous sommes toujours prêts à vous aider. Contactez-nous par l'un de ces moyens.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Email */}
                <a href="mailto:dioufmohametousmane@gmail.com" className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">dioufmohametousmane@gmail.com</p>
                    <p className="text-xs text-muted-foreground mt-1">Réponse sous 24h</p>
                  </div>
                </a>

                {/* Phone */}
                <a href="tel:+221774649835" className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Téléphone</h3>
                    <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">+221 77 464 98 35</p>
                    <p className="text-xs text-muted-foreground mt-1">Disponible 24/7</p>
                  </div>
                </a>

                {/* Location */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Localisation</h3>
                    <p className="text-sm text-muted-foreground">Dakar, Sénégal</p>
                    <p className="text-xs text-muted-foreground mt-1">Sénégal</p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Horaires</h3>
                    <p className="text-sm text-muted-foreground">9h - 17h (GMT+1)</p>
                    <p className="text-xs text-muted-foreground mt-1">Tous les jours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Illustration */}
            <div className="hidden lg:flex justify-center">
              <ContactIllustration />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Help;
