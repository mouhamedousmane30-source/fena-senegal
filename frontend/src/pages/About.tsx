import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Globe, Users, Target, Award, TrendingUp } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

const About = () => {
  const navigate = useNavigate();

  const team = [
    {
      name: 'Mamadou Diallo',
      role: 'Fondateur & CEO',
      description: 'Visionnaire social avec 10 ans d\'expérience',
      icon: '👨‍💼',
    },
    {
      name: 'Aminata Sow',
      role: 'Directrice Technique',
      description: 'Experte en développement web moderne',
      icon: '👩‍💻',
    },
    {
      name: 'Ousmane Ba',
      role: 'Responsable Communauté',
      description: 'Passionné par l\'impact social',
      icon: '👨‍🤝‍👨',
    },
    {
      name: 'Fatou Ndiaye',
      role: 'Responsable Marketing',
      description: 'Spécialiste en engagement digital',
      icon: '📱',
    },
  ];

  const stats = [
    { number: '50K+', label: 'Utilisateurs actifs', icon: Users },
    { number: '15K+', label: 'Déclarations résolues', icon: Target },
    { number: '92%', label: 'Taux de réussite', icon: TrendingUp },
    { number: '2K+', label: 'Familles réunies', icon: Heart },
  ];

  const values = [
    {
      title: 'Communauté',
      description: 'Nous croyons à la puissance de la solidarité. Ensemble, nous retrouvons ce qui compte.',
      icon: Users,
    },
    {
      title: 'Intégrité',
      description: 'Transparence totale et confiance mutuelle. Chaque annonce est traitée avec respect.',
      icon: Award,
    },
    {
      title: 'Impact',
      description: 'Notre mission est simple : réunir les gens avec ce qui leur manque, une personne à la fois.',
      icon: Heart,
    },
    {
      title: 'Innovation',
      description: 'Technologie moderne au service d\'une cause humaine. Accessible à tous.',
      icon: Globe,
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        {/* Hero */}
        <div className="mb-20 max-w-3xl">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
              Notre histoire
            </span>
          </div>
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Retrouver ce qui compte au Sénégal
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Feñ Na Sénégal est plus qu'une plateforme. C'est une communauté unie pour retrouver les personnes et objets perdus. Chaque annonce est une histoire, chaque reconnexion est une victoire.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-card border border-input rounded-2xl p-6 text-center hover:border-primary/30 transition-colors"
              >
                <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-display text-3xl font-bold text-foreground mb-2">{stat.number}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-8 lg:p-10">
            <Target className="w-12 h-12 text-primary mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">Notre Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              Créer une plateforme accessible et intuitive qui connecte les Sénégalais pour retrouver les personnes et biens perdus. Nous transformons le désespoir en espoir, une annonce à la fois.
            </p>
          </div>

          <div className="bg-gradient-to-br from-found/10 to-found/5 border border-found/20 rounded-3xl p-8 lg:p-10">
            <Globe className="w-12 h-12 text-found mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">Notre Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              Un Sénégal où personne ne reste seul face à la perte. Où la technologie et la solidarité humaine se rencontrent pour créer des miracles quotidiens.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Nos valeurs
            </span>
            <h2 className="font-display text-3xl font-bold text-foreground">Ce qui nous anime</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <div
                  key={idx}
                  className="bg-card border border-input rounded-2xl p-6 lg:p-8 hover:border-primary/30 transition-colors"
                >
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-semibold text-xl text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <div className="mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              L'équipe
            </span>
            <h2 className="font-display text-3xl font-bold text-foreground">
              Les personnes derrière Feñ Na Sénégal
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, idx) => (
              <div
                key={idx}
                className="bg-card border border-input rounded-2xl p-6 text-center hover:border-primary/30 transition-colors group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {member.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{member.name}</h3>
                <p className="text-sm text-primary font-medium mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary/10 to-found/10 border border-primary/20 rounded-3xl p-8 lg:p-12 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Rejoignez notre mission
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Que vous ayez perdu quelque chose ou trouvé un article, vous êtes au bon endroit. Ensemble, nous pouvons changer des vies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/declarer')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-8 py-6 font-semibold"
            >
              Créer une déclaration
            </Button>
            <Button
              onClick={() => navigate('/annonces')}
              variant="outline"
              className="rounded-2xl px-8 py-6 font-semibold"
            >
              Voir les annonces
            </Button>
          </div>
        </div>

        {/* History Timeline */}
        <div className="mt-20 pt-20 border-t border-border/50">
          <div className="mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Notre évolution
            </span>
            <h2 className="font-display text-3xl font-bold text-foreground">Notre parcours</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                year: '2024',
                title: 'Lancement de Feñ Na Sénégal',
                description: 'Notre plateforme est lancée avec une mission simple : aider les Sénégalais à retrouver.',
              },
              {
                year: '2025',
                title: 'Premier bilan positif',
                description: '500 personnes retrouvées et 2000 objets rendus à leurs propriétaires.',
              },
              {
                year: '2026',
                title: 'Expansion nationale',
                description: 'Nous sommes maintenant dans toutes les régions du Sénégal avec 50K utilisateurs actifs.',
              },
            ].map((milestone, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  {idx < 2 && <div className="w-1 h-16 bg-primary/20 mt-2" />}
                </div>
                <div className="pb-8">
                  <p className="text-sm text-primary font-semibold mb-1">{milestone.year}</p>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
