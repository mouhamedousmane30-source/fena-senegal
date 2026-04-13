import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Eye, MessageCircle, ArrowRight, MapPin, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import AnnouncementCard from '@/components/AnnouncementCard';
import { announcementService, type AnnouncementResponse } from '@/services/announcement.service';
import heroImage from '@/assets/hero-senegal.jpg';
import reunionImage from '@/assets/reunion.jpg';
import phoneImage from '@/assets/phone-user.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const RECENT_COUNT = 6;

const Index = () => {
  const [annonces, setAnnonces] = useState<AnnouncementResponse[]>([]);
  const [loadingAnnonces, setLoadingAnnonces] = useState(true);
  const [annoncesError, setAnnoncesError] = useState(false);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        setLoadingAnnonces(true);
        const data = await announcementService.getAnnouncements();
        setAnnonces(Array.isArray(data) ? data : []);
        setAnnoncesError(false);
      } catch {
        setAnnoncesError(true);
        setAnnonces([]);
      } finally {
        setLoadingAnnonces(false);
      }
    };
    fetchRecent();
  }, []);

  const recentAnnouncements = useMemo(
    () => annonces.slice(0, RECENT_COUNT),
    [annonces],
  );

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Plage du Sénégal" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/65 to-foreground/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl space-y-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-primary-foreground/90">Plateforme communautaire du Sénégal</span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05]"
              style={{ color: 'hsl(0 0% 100%)' }}
            >
              Retrouvons
              <br />
              ce qui{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-accent">compte</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.5, ease: 'easeOut' }}
                  className="absolute bottom-1 left-0 right-0 h-3 bg-accent/25 rounded-sm origin-left"
                />
              </span>
              .
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
              className="text-lg sm:text-xl leading-relaxed max-w-lg"
              style={{ color: 'hsl(0 0% 100% / 0.8)' }}
            >
              Feñ Na — la première plateforme sénégalaise pour signaler et retrouver les personnes, objets et animaux perdus.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/declarer?status=perdu">
                <Button size="lg" className="w-full sm:w-auto bg-lost hover:bg-lost/90 text-lost-foreground rounded-2xl px-8 py-6 text-base font-semibold shadow-lg shadow-lost/25 hover:shadow-xl hover:shadow-lost/30 hover:-translate-y-0.5 transition-all duration-300 gap-2">
                  <Search className="w-4.5 h-4.5" />
                  J'ai perdu
                </Button>
              </Link>
              <Link to="/declarer?status=trouvé">
                <Button size="lg" className="w-full sm:w-auto bg-found hover:bg-found/90 text-found-foreground rounded-2xl px-8 py-6 text-base font-semibold shadow-lg shadow-found/25 hover:shadow-xl hover:shadow-found/30 hover:-translate-y-0.5 transition-all duration-300 gap-2">
                  <CheckCircle className="w-4.5 h-4.5" />
                  J'ai trouvé
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={4}
              className="flex items-center gap-8 pt-4"
              style={{ color: 'hsl(0 0% 100% / 0.6)' }}
            >
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4" />
                <span>100% gratuit</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Tout le Sénégal</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">
              Simple & rapide
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Comment ça marche ?
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                icon: Search,
                title: 'Déclarez',
                desc: 'Signalez un objet, un animal ou une personne perdue ou trouvée en quelques clics.',
                image: phoneImage,
              },
              {
                icon: Eye,
                title: 'Recherchez',
                desc: 'Parcourez les annonces par ville, type ou date. La barre de recherche vous aide à trouver vite.',
                image: reunionImage,
              },
              {
                icon: MessageCircle,
                title: 'Contactez',
                desc: 'Entrez en contact directement via WhatsApp ou téléphone. Retrouvez ce qui compte.',
                image: 'https://images.unsplash.com/photo-1534531688091-a458257992cb?w=800&q=80',
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={i % 2 === 0 ? fadeUp : slideInLeft}
                custom={i}
                className="group relative bg-card rounded-3xl overflow-hidden card-shadow border border-border/40 hover:border-primary/25 hover:card-shadow-hover transition-all duration-500 hover:-translate-y-1"
              >
                {step.image ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                      width={800}
                      height={600}
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary/8 via-muted to-accent/8 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <step.icon className="w-10 h-10 text-primary/40" />
                    </div>
                  </div>
                )}
                <div className="p-7 lg:p-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-sm shadow-md shadow-primary/20">
                      0{i + 1}
                    </span>
                    <h3 className="font-display font-bold text-xl text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent announcements */}
      <section className="py-24 lg:py-32 bg-muted/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-14"
          >
            <div>
              <motion.p variants={fadeUp} custom={0} className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">
                Annonces récentes
              </motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                Dernières déclarations
              </motion.h2>
            </div>
            <motion.div variants={fadeUp} custom={2}>
              <Link to="/annonces">
                <Button variant="outline" className="rounded-xl gap-2 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                  Voir tout <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {loadingAnnonces ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Chargement des annonces…</p>
            </div>
          ) : annoncesError ? (
            <div className="rounded-2xl border border-border/50 bg-card/50 px-6 py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Impossible de charger les annonces. Vérifiez que le serveur est démarré.
              </p>
              <Link to="/annonces">
                <Button variant="outline" className="rounded-xl">
                  Réessayer depuis la page Annonces
                </Button>
              </Link>
            </div>
          ) : recentAnnouncements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 px-6 py-14 text-center">
              <p className="text-foreground font-medium mb-2">Aucune annonce pour le moment</p>
              <p className="text-sm text-muted-foreground mb-6">Soyez le premier à publier une déclaration.</p>
              <Link to="/declarer">
                <Button className="rounded-xl">Créer une annonce</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentAnnouncements.map((a, i) => (
                <motion.div
                  key={a._id ?? a.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                >
                  <AnnouncementCard announcement={a} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative rounded-[2rem] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />
            <div className="absolute inset-0 opacity-[0.06]">
              <div className="absolute top-10 left-10 w-48 h-48 rounded-full border-2 border-primary-foreground" />
              <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full border border-primary-foreground" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-primary-foreground" />
            </div>
            <div className="relative px-8 py-20 sm:px-16 sm:py-24 text-center">
              <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-5">
                Chaque déclaration compte
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-primary-foreground/80 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                Aidez votre communauté. Signalez ce que vous avez perdu ou trouvé — c'est gratuit et rapide.
              </motion.p>
              <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/declarer">
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    Créer une annonce
                  </Button>
                </Link>
                <Link to="/annonces">
                  <Button size="lg" variant="outline" className="rounded-2xl px-8 py-6 text-base font-semibold border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300">
                    Explorer les annonces
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
