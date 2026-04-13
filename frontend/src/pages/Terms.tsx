import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';

const Terms = () => {
  const navigate = useNavigate();

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
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            Conditions légales
          </span>
          <h1 className="font-display text-4xl font-bold text-foreground mb-6">
            Termes et Conditions d'Utilisation
          </h1>
          <p className="text-muted-foreground mb-2">Dernière mise à jour : 5 avril 2026</p>
          <p className="text-sm text-muted-foreground">
            Veuillez lire attentivement ces conditions avant d'utiliser Feñ Na Sénégal.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12 prose prose-invert max-w-none">
          {/* Section 1 */}
          <section className="bg-card border border-input rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              1. Acceptation des Conditions
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              En accédant et en utilisant Feñ Na Sénégal, vous acceptez d'être lié par ces Termes et Conditions d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications seront effectives dès leur publication. Votre utilisation continue du site constitue votre acceptation des modifications.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-card border border-input rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              2. Conditions d'Utilisation
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">2.1 Compte Utilisateur</h3>
                <p className="text-muted-foreground">
                  Pour utiliser certains services, vous devez créer un compte. Vous êtes responsable de maintenir la confidentialité de vos identifiants de connexion et de toutes les activités qui se produisent sous votre compte.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">2.2 Contenu Utilisateur</h3>
                <p className="text-muted-foreground">
                  Vous êtes entièrement responsable du contenu que vous publiez, incluant les déclarations, images et descriptions. Vous garantissez que votre contenu est légal, exact et ne viole pas les droits d'autrui.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">2.3 Restrictions d'Utilisation</h3>
                <p className="text-muted-foreground">
                  Vous vous engagez à ne pas :
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1 ml-2">
                  <li>Publier du contenu diffamatoire, offensant ou illégal</li>
                  <li>Usurper l'identité d'une autre personne</li>
                  <li>Harceler ou menacer d'autres utilisateurs</li>
                  <li>Spammer ou publier des annonces trompeuses</li>
                  <li>Utiliser des bots ou scripts automatisés</li>
                  <li>Violer les droits de propriété intellectuelle</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-card border border-input rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              3. Contenu et Propriété Intellectuelle
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Vous conservez tous les droits sur le contenu que vous publiez. En postant sur Feñ Na Sénégal, vous nous accordez une licence mondiale, non exclusive et gratuite d'utiliser ce contenu pour promouvoir la plateforme.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Le contenu, les logos, les marques et le matériel de Feñ Na Sénégal sont protégés par les droits d'auteur et autres lois sur la propriété intellectuelle. Vous n'avez pas la permission de reproduire ou de réutiliser ce contenu sans autorisation écrite.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-card border border-input rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              4. Responsabilité Limitée
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Feñ Na Sénégal est fourni "tel quel" sans garantie d'aucune sorte. Nous ne garantissons pas que :
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>Le service sera ininterrompu ou exempt d'erreurs</li>
              <li>Tous les annonces seront retrouvées ou reconnectées</li>
              <li>Les informations des utilisateurs sont exactes</li>
              <li>Le service sera compatible avec vos appareils</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              En aucun cas, Feñ Na Sénégal ne sera responsable des dommages directs, indirects ou consécutifs résultant de l'utilisation ou de l'incapacité à utiliser le service.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-card border border-input rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              5. Modération et Suppression de Contenu
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Nous nous réservons le droit de modérer, éditer ou supprimer tout contenu qui :
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>Viole ces conditions d'utilisation</li>
              <li>Contient du matériel illégal ou mal intentionné</li>
              <li>Est considéré comme spam ou contenu dupliqué</li>
              <li>Menace la sécurité ou la vie privée d'autres utilisateurs</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Nous pouvons suspendre ou résilier votre compte en cas de violation grave ou répétée de ces conditions.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-card border border-input rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              6. Confidentialité et Protection des Données
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Votre confidentialité est importante pour nous. Consultez notre Politique de Confidentialité pour comprendre comment nous collectons, utilisons et protégeons vos données personnelles.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              En utilisant Feñ Na Sénégal, vous consentez à la collecte et au traitement de vos informations personnelles conformément à notre Politique de Confidentialité.
            </p>
          </section>

          {/* Section 7 */}
          <section className="bg-card border border-input rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              7. Contacts entre Utilisateurs
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Feñ Na Sénégal facilite les contacts entre utilisateurs mais n'est pas responsable de :
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>La qualité ou l'exactitude des informations partagées</li>
              <li>Les disputes ou conflits entre utilisateurs</li>
              <li>Les transactions ou échanges entre utilisateurs</li>
              <li>Les promesses ou engagements non tenus</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Nous vous recommandons de vérifier les informations partagées et de prendre des précautions de sécurité appropriées lors de rencontres en personne.
            </p>
          </section>

          {/* Section 8 */}
          <section className="bg-card border border-input rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              8. Modification du Service
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Feñ Na Sénégal se réserve le droit de modifier, suspendre ou cesser le service (ou n'importe quelle partie de celui-ci) à tout moment et sans préavis. Nous ne serons pas responsables envers vous ou toute tierce partie pour toute modification ou interruption du service.
            </p>
          </section>

          {/* Section 9 */}
          <section className="bg-card border border-input rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              9. Signalements et Modération
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Si vous rencontrez du contenu ou un comportement qui viole ces conditions, veuillez utiliser la fonction de signalement. Notre équipe de modération examinera les rapports et prendra les mesures appropriées.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Les signalements malveillants ou faux peuvent entraîner des sanctions, notamment la suspension de votre compte.
            </p>
          </section>

          {/* Section 10 */}
          <section className="bg-card border border-input rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              10. Droit Applicable
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Ces Termes et Conditions sont régis par les lois du Sénégal et vous acceptez la juridiction exclusive des tribunaux du Sénégal.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Si vous avez des questions ou des préoccupations concernant ces conditions, veuillez nous contacter par email à{' '}
              <a href="mailto:dioufmohametousmane@gmail.com" className="text-primary hover:underline font-medium">
                dioufmohametousmane@gmail.com
              </a>
              {' '}ou par téléphone au{' '}
              <a href="tel:+221774649835" className="text-primary hover:underline font-medium">
                +221 77 464 98 35
              </a>.
            </p>
          </section>

          {/* Section 11 */}
          <section className="bg-card border border-input rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              11. Contact et Support
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Pour toute question concernant ces Termes et Conditions :
            </p>
            <div className="bg-muted/50 rounded-xl p-4 border border-input">
              <p className="text-foreground font-semibold mb-3">Feñ Na Sénégal</p>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  <span className="font-medium">Email :</span>{' '}
                  <a href="mailto:dioufmohametousmane@gmail.com" className="text-primary hover:underline">
                    dioufmohametousmane@gmail.com
                  </a>
                </p>
                <p className="text-muted-foreground text-sm">
                  <span className="font-medium">Téléphone :</span>{' '}
                  <a href="tel:+221774649835" className="text-primary hover:underline">
                    +221 77 464 98 35
                  </a>
                </p>
                <p className="text-muted-foreground text-sm">
                  <span className="font-medium">Adresse :</span> Dakar, Sénégal
                </p>
              </div>
            </div>
          </section>

          {/* Final Note */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8">
            <p className="text-sm text-muted-foreground">
              En utilisant Feñ Na Sénégal, vous reconnaissez avoir lu, compris et accepté l'intégralité de ces Termes et Conditions d'Utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
