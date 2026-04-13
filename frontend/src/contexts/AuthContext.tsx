import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { apiClient } from '@/services/api.client';
import { TOKEN_KEY, USER_KEY, REMEMBERED_EMAIL_KEY, REMEMBERED_PASSWORD_KEY } from '@/services/api.config';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string, rememberMe: boolean) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  updateUser: (data: Record<string, unknown>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  // ✅ isLoading est à true par défaut pour bloquer les redirections hâtives
  const [isLoading, setIsLoading] = useState(true);

  const persistUser = (nextUser: any | null) => {
    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  };

  useEffect(() => {
    const recoverSession = async () => {
      const localToken = localStorage.getItem(TOKEN_KEY);
      const sessionToken = sessionStorage.getItem(TOKEN_KEY);
      const savedToken = localToken || sessionToken;
      const storage = localToken ? 'local' : 'session';
      const savedUser = localStorage.getItem(USER_KEY);
      const savedExtras = savedUser ? JSON.parse(savedUser) : null;

      console.log('[Auth] Récupération session:', { 
        hasLocalToken: !!localToken, 
        hasSessionToken: !!sessionToken,
        storage 
      });

      if (savedToken) {
        // ✅ On informe immédiatement le client API pour les appels suivants
        apiClient.setTokens(savedToken, undefined, storage);

        try {
          // ✅ Appel vers /me pour récupérer le profil réel
          const userData = await authService.getCurrentUser();
          console.log('[Auth] Profil récupéré:', userData);
          const mergedUser = savedExtras ? { ...userData, ...savedExtras } : userData;
          setUser(mergedUser);
          persistUser(mergedUser);
        } catch (error: any) {
          console.error('[Auth] Erreur récupération profil:', error);
          // Ne pas effacer les tokens en cas d'erreur réseau, seulement si 401
          if (error.status === 401) {
            console.log('[Auth] Token invalide ou expiré, nettoyage...');
            apiClient.clearTokens();
            persistUser(null);
            setUser(null);
          } else {
            // Garder l'utilisateur en cache si c'est juste une erreur réseau
            if (savedExtras) {
              console.log('[Auth] Utilisation du cache utilisateur');
              setUser(savedExtras);
            }
          }
        }
      } else {
        console.log('[Auth] Aucun token trouvé');
      }

      // ✅ La vérification est terminée (succès ou échec)
      setIsLoading(false);
    };

    recoverSession();
  }, []);

  const login = async (email: string, pass: string, rememberMe: boolean) => {
    try {
      const data = await authService.login({ email, password: pass, rememberMe });

      apiClient.setTokens(data.token, data.refreshToken, rememberMe ? 'local' : 'session');
      setUser(data.user);
      persistUser(data.user);
      
      // Sauvegarder les identifiants si rememberMe est activé
      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        localStorage.setItem(REMEMBERED_PASSWORD_KEY, pass);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const data = await authService.register({ username, email, password });

      // Après inscription, on garde la session active par défaut.
      apiClient.setTokens(data.token, data.refreshToken, 'local');
      setUser(data.user);
      persistUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (data: Record<string, unknown>) => {
    setUser((prev: any) => {
      const nextUser = prev ? { ...prev, ...data } : prev;
      persistUser(nextUser);
      return nextUser;
    });
  };

  const logout = () => {
    apiClient.clearTokens();
    persistUser(null);
    setUser(null);
    // Ne PAS effacer les identifiants sauvegardés - ils servent pour le pré-remplissage
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};