const STORAGE_KEY = "adminToken";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function clearAdminToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function promptAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = window.prompt("Wprowadź token admina:");
  if (token?.trim()) {
    localStorage.setItem(STORAGE_KEY, token.trim());
    return token.trim();
  }
  return null;
}

/** Bierze token z localStorage albo pyta o niego. */
export function ensureAdminToken(): string | null {
  return getAdminToken() ?? promptAdminToken();
}

/** Po 401: czyści stary token i pyta ponownie. */
export function recoverAdminToken(): string | null {
  clearAdminToken();
  return promptAdminToken();
}
