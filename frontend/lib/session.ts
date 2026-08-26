export type ClarifySession = {
  threadId: string;
  userQuery: string;
  message: string;
  questions: string[];
  round: number;
};

const KEY = "design-session";

export function saveClarifySession(session: ClarifySession) {
  sessionStorage.setItem(KEY, JSON.stringify(session));
}

export function loadClarifySession(): ClarifySession | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ClarifySession;
  } catch {
    return null;
  }
}

export function clearClarifySession() {
  sessionStorage.removeItem(KEY);
}

export type RunSession = {
  threadId: string;
  userQuery: string;
};

const RUN_KEY = "design-run";

export function saveRunSession(session: RunSession) {
  sessionStorage.setItem(RUN_KEY, JSON.stringify(session));
}

export function loadRunSession(): RunSession | null {
  const raw = sessionStorage.getItem(RUN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RunSession;
  } catch {
    return null;
  }
}
