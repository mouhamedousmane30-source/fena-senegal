import { useState, useCallback } from 'react';
import { ApiError } from '@/services';

/**
 * Hook personnalisé pour les appels API
 * Gère loading, error, success
 */

export interface UseApiOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
  showErrorToast?: boolean;
}

export const useApi = <T = any, D = any>(
  apiCall: (data?: D) => Promise<T>,
  options: UseApiOptions = {}
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (payload?: D) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiCall(payload);
        setData(result);
        options.onSuccess?.();
        return result;
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError('UNKNOWN' as any, 0, String(err));
        setError(apiError);
        options.onError?.(apiError);
        throw apiError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    execute,
    isLoading,
    error,
    data,
    reset,
  };
};
