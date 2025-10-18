// HttpOnly Cookies: Tokens are stored in HttpOnly cookies (not accessible via JavaScript)
// We only store user info in localStorage to track authentication state
interface AuthState {
  user: {
    userId: string;
    email: string;
    name?: string;
    roles: string[];
    permissions: string[];
  } | null;
}

class AuthStore {
  private state: AuthState = {
    user: null,
  };

  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    const userStr = localStorage.getItem('user');

    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        // Map 'id' to 'userId' for backwards compatibility
        this.state = {
          user: {
            userId: userData.id || userData.userId,
            email: userData.email,
            name: userData.name,
            roles: userData.roles,
            permissions: userData.permissions,
          },
        };
      } catch (error) {
        // Invalid user data, clear it
        localStorage.removeItem('user');
      }
    }
  }

  getState() {
    return this.state;
  }

  // Update: No longer stores tokens in localStorage (they're in HttpOnly cookies)
  setUser(user: AuthState['user']) {
    // Map 'id' to 'userId' for backwards compatibility
    const normalizedUser = user ? {
      userId: (user as any).id || user.userId,
      email: user.email,
      name: user.name,
      roles: user.roles,
      permissions: user.permissions,
    } : null;

    this.state = { user: normalizedUser };

    if (typeof window !== 'undefined' && normalizedUser) {
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    }

    this.notifyListeners();
  }

  clearAuth() {
    this.state = { user: null };

    if (typeof window !== 'undefined') {
      // Clear user info (tokens are cleared by backend via Set-Cookie with maxAge=0)
      localStorage.removeItem('user');
      localStorage.removeItem('csrfToken');
    }

    this.notifyListeners();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }
}

export const authStore = new AuthStore();
