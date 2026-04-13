import { AlertCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ErrorAlertProps {
  /** Titre court au-dessus du message (ex. « Connexion impossible ») */
  title?: string;
  message: string;
  onClose?: () => void;
  type?: 'error' | 'warning' | 'info';
}

const ErrorAlert = ({ title, message, onClose, type = 'error' }: ErrorAlertProps) => {
  const colors = {
    error: {
      bg: 'from-red-500/10 to-red-500/5',
      border: 'border-red-500/30',
      icon: 'text-red-500',
      text: 'text-red-900',
      badge: 'bg-red-500/20 text-red-700',
    },
    warning: {
      bg: 'from-amber-500/10 to-amber-500/5',
      border: 'border-amber-500/30',
      icon: 'text-amber-500',
      text: 'text-amber-900',
      badge: 'bg-amber-500/20 text-amber-700',
    },
    info: {
      bg: 'from-blue-500/10 to-blue-500/5',
      border: 'border-blue-500/30',
      icon: 'text-blue-500',
      text: 'text-blue-900',
      badge: 'bg-blue-500/20 text-blue-700',
    },
  };

  const config = colors[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl border ${config.border} bg-gradient-to-r ${config.bg} p-4 backdrop-blur-sm`}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 opacity-40">
        <div className={`absolute -right-20 -top-20 h-40 w-40 rounded-full blur-3xl ${type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
      </div>

      <div className="relative flex items-start gap-3">
        {/* Icon */}
        <div className={`mt-0.5 flex-shrink-0 ${config.icon}`}>
          <AlertCircle className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title ? (
            <>
              <p className={`text-sm font-bold ${config.text} mb-1`}>{title}</p>
              <p className={`text-sm font-medium ${config.text}/90 leading-relaxed break-words`}>
                {message}
              </p>
            </>
          ) : (
            <p className={`text-sm font-semibold ${config.text} leading-relaxed break-words`}>
              {message}
            </p>
          )}
        </div>

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 text-muted-foreground hover:${config.icon} transition-colors p-1 hover:bg-white/20 rounded-lg`}
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ErrorAlert;
