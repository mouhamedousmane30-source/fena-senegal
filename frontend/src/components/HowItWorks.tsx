import { Search, FileText, MessageCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const steps: Step[] = [
  {
    icon: <Search className="w-6 h-6" />,
    title: "Recherchez",
    description: "Parcourez les annonces de biens perdus ou trouvés près de chez vous",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Déclarez",
    description: "Publiez une annonce avec photos et détails pour signaler un objet",
    color: "from-primary to-purple-600"
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Contactez",
    description: "Communiquez directement avec le propriétaire ou le trouveur",
    color: "from-purple-500 to-pink-600"
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Récupérez",
    description: "Retrouvez votre bien ou rendez-le à son propriétaire",
    color: "from-green-500 to-emerald-600"
  }
];

export const HowItWorksIllustration = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Desktop Horizontal Layout */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="relative group">
              {/* Animated background pulse */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${step.color} opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500 animate-pulse`} />
              
              {/* Card */}
              <div className={`relative w-40 h-48 rounded-2xl bg-gradient-to-br ${step.color} p-0.5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className="w-full h-full rounded-2xl bg-card flex flex-col items-center justify-center p-4 text-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-3 shadow-md`}>
                    {step.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
              
              {/* Step number */}
              <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                {index + 1}
              </div>
            </div>
            
            {/* Arrow between steps */}
            {index < steps.length - 1 && (
              <ArrowRight className="w-6 h-6 text-muted-foreground/30 flex-shrink-0 animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* Mobile Vertical Layout */}
      <div className="md:hidden space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
              {step.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                  Étape {index + 1}
                </span>
              </div>
              <h3 className="font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Connection Lines (Desktop) */}
      <svg className="hidden md:block absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none" style={{ zIndex: -1 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export const ContactIllustration = () => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl blur-2xl" />
      
      {/* Main illustration container */}
      <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-xl">
        {/* Envelope animation */}
        <div className="relative w-32 h-24 mx-auto mb-6">
          {/* Envelope body */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-lg shadow-lg">
            {/* Envelope flap */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-primary/80 to-primary rounded-t-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            {/* Envelope bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-primary/60 to-transparent rounded-b-lg" />
            {/* Center line */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-white/30 rounded-full" />
          </div>
          
          {/* Floating notification dot */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-bounce">
            1
          </div>
        </div>

        {/* Text content */}
        <div className="text-center">
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            Contactez-nous
          </h3>
          <p className="text-sm text-muted-foreground">
            Notre équipe vous répond sous 24h
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" />
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary/20 rounded-full blur-xl animate-pulse [animation-delay:0.5s]" />
    </div>
  );
};

export default HowItWorksIllustration;
