import { Loader2, MapPin } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  fullScreen?: boolean;
  variant?: 'spinner' | 'pulse' | 'dots' | 'skeleton';
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const dotSizes = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
  xl: 'w-5 h-5',
};

/**
 * Animation Pulse moderne avec gradient
 */
const PulseLoader = ({ size = 'md', label }: { size?: 'sm' | 'md' | 'lg' | 'xl'; label?: string }) => (
  <div className="flex flex-col items-center justify-center gap-4">
    <div className={`${sizeClasses[size]} relative`}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-purple-500 to-primary opacity-30 animate-ping" />
      <div className="absolute inset-2 rounded-full bg-gradient-to-r from-primary via-purple-500 to-primary opacity-50 animate-pulse" />
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/30">
        <MapPin className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
      </div>
    </div>
    {label && (
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    )}
  </div>
);

/**
 * Animation Dots moderne
 */
const DotsLoader = ({ size = 'md', label }: { size?: 'sm' | 'md' | 'lg' | 'xl'; label?: string }) => (
  <div className="flex flex-col items-center justify-center gap-3">
    <div className="flex items-center gap-2">
      <div className={`${dotSizes[size]} rounded-full bg-primary animate-bounce [animation-delay:-0.3s]`} />
      <div className={`${dotSizes[size]} rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]`} />
      <div className={`${dotSizes[size]} rounded-full bg-pink-500 animate-bounce`} />
    </div>
    {label && <p className="text-sm text-muted-foreground">{label}</p>}
  </div>
);

/**
 * Spinner classique amélioré avec gradient
 */
const SpinnerLoader = ({ size = 'md', label }: { size?: 'sm' | 'md' | 'lg' | 'xl'; label?: string }) => (
  <div className="flex flex-col items-center justify-center gap-3">
    <div className={`${sizeClasses[size]} relative`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-transparent`} 
        style={{ 
          background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.3))',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text'
        }} 
      />
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: '1.5s' }}>
        <Loader2 className={`${sizeClasses[size]} text-primary/30`} />
      </div>
    </div>
    {label && <p className="text-sm text-muted-foreground animate-pulse">{label}</p>}
  </div>
);

/**
 * Composant de chargement principal - Modernisé
 */
export const LoadingSpinner = ({
  size = 'md',
  label = 'Chargement...',
  fullScreen = false,
  variant = 'pulse',
}: LoadingSpinnerProps) => {
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader size={size} label={label} />;
      case 'spinner':
        return <SpinnerLoader size={size} label={label} />;
      case 'pulse':
      default:
        return <PulseLoader size={size} label={label} />;
    }
  };

  const content = renderLoader();

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300">
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl px-12 py-10 shadow-2xl shadow-primary/5">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

/**
 * Variante en ligne - Modernisée
 */
export const InlineLoader = ({ 
  label = 'Chargement...',
  variant = 'dots'
}: { 
  label?: string;
  variant?: 'dots' | 'spinner'
}) => (
  <div className="flex items-center justify-center gap-3 py-8">
    {variant === 'dots' ? (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" />
      </div>
    ) : (
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
    )}
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

/**
 * Skeleton Loader pour les cartes
 */
export const SkeletonCard = () => (
  <div className="bg-card rounded-xl border border-border/50 p-4 space-y-4 animate-pulse">
    <div className="h-48 bg-muted rounded-lg" />
    <div className="space-y-2">
      <div className="h-5 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-1/2" />
    </div>
    <div className="flex gap-2">
      <div className="h-8 bg-muted rounded w-20" />
      <div className="h-8 bg-muted rounded w-20" />
    </div>
  </div>
);

/**
 * Skeleton Loader pour texte
 */
export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2 animate-pulse">
    {Array.from({ length: lines }).map((_, i) => (
      <div 
        key={i} 
        className="h-4 bg-muted rounded" 
        style={{ width: `${Math.random() * 30 + 70}%` }}
      />
    ))}
  </div>
);

/**
 * Page Loader avec progress indication
 */
export const PageLoader = ({ 
  label = 'Chargement de la page...',
  progress = 0 
}: { 
  label?: string;
  progress?: number;
}) => (
  <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
    <PulseLoader size="xl" />
    {progress > 0 && (
      <div className="mt-8 w-64">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">{progress}%</p>
      </div>
    )}
  </div>
);

export default LoadingSpinner;
