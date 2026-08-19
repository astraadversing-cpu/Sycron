const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

type SupabaseSession = { access_token: string; user: { id: string; email?: string; user_metadata?: Record<string, string> } };
type AuthListener = (event: string, session: SupabaseSession | null) => void;

const sessionKey = 'sycron.supabase.session';
const listeners = new Set<AuthListener>();

const restoreOAuthSessionFromUrl = () => {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = hash.get('access_token');
  if (!accessToken) return;

  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const session: SupabaseSession = {
      access_token: accessToken,
      user: {
        id: payload.sub,
        email: payload.email,
        user_metadata: payload.user_metadata || {},
      },
    };
    localStorage.setItem(sessionKey, JSON.stringify(session));
    window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
  } catch {
    // Invalid OAuth callback data is ignored and the user remains signed out.
  }
};

const request = async (path: string, options: RequestInit = {}) => {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Configure o Supabase no arquivo .env.');
  const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, {
    ...options,
    headers: {
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error_description || body.msg || body.message || 'Falha na autenticação Supabase.');
  return body as SupabaseSession;
};

const saveSession = (session: SupabaseSession | null) => {
  if (session) localStorage.setItem(sessionKey, JSON.stringify(session));
  else localStorage.removeItem(sessionKey);
  listeners.forEach((listener) => listener(session ? 'SIGNED_IN' : 'SIGNED_OUT', session));
};

export const supabase = isSupabaseConfigured
  ? {
      auth: {
        getSession: async () => ({ data: { session: JSON.parse(localStorage.getItem(sessionKey) || 'null') as SupabaseSession | null } }),
        onAuthStateChange: (listener: AuthListener) => {
          listeners.add(listener);
          return { data: { subscription: { unsubscribe: () => listeners.delete(listener) } } };
        },
        signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
          const session = await request('token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
          saveSession(session);
          return { data: { session }, error: null };
        },
        signUp: async ({ email, password, options }: { email: string; password: string; options?: { data?: Record<string, string> } }) => {
          const session = await request('signup', { method: 'POST', body: JSON.stringify({ email, password, data: options?.data || {} }) });
          if (session.access_token) saveSession(session);
          return { data: { session }, error: null };
        },
        signInWithOAuth: async ({ provider, options }: { provider: string; options: { redirectTo: string } }) => {
          const redirect = encodeURIComponent(options.redirectTo);
          window.location.assign(`${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${redirect}`);
          return { error: null };
        },
      },
    }
  : null;

if (isSupabaseConfigured && typeof window !== 'undefined') restoreOAuthSessionFromUrl();
