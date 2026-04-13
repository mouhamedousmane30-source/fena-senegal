import { AlertCircle, XCircle, CheckCircle, InfoIcon } from 'lucide-react';

export type ErrorType = 'error' | 'warning' | 'info' | 'success';

interface ErrorMessageProps {
  type?: ErrorType;
  title: string;
  message: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  fullWidth?: boolean;
}

const typeStyles = {
  error: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    icon: 'text-destructive',
    title: 'text-destructive',
    Icon: AlertCircle,
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-600',
    title: 'text-yellow-700',
    Icon: AlertCircle,
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-600',
    title: 'text-blue-700',
    Icon: InfoIcon,
  },
  success: {
    bg: 'bg-found/10',
    border: 'border-found/30',
    icon: 'text-found',
    title: 'text-found',
    Icon: CheckCircle,
  },
};

/**
 * Message d'erreur/alerte stylisé
 */
export const ErrorMessage = ({
  type = 'error',
  title,
  message,
  onDismiss,
  action,
  fullWidth = true,
}: ErrorMessageProps) => {
  const style = typeStyles[type];
  const Icon = style.Icon;

  return (
    <div
      className={`
        rounded-2xl border p-4 flex gap-3
        ${style.bg} ${style.border}
        ${fullWidth ? 'w-full' : ''}
      `}
    >
      <Icon className={`${style.icon} w-5 h-5 flex-shrink-0 mt-0.5`} />

      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold mb-1 ${style.title}`}>{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>

        {action && (
          <button
            onClick={action.onClick}
            className="mt-3 text-sm font-medium text-primary hover:underline transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 ${style.icon} hover:opacity-70 transition-opacity`}
        >
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

/**
 * Composant d'erreur pour les formulaires
 */
export const FormError = ({ message }: { message?: string }) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-destructive mt-2">
      <AlertCircle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
