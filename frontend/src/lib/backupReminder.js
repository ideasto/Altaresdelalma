// Recordatorio discreto de respaldo: solo cuando hay cambios posteriores al último respaldo.
const K = { change: "ecos_last_change", backup: "ecos_last_backup", dismissed: "ecos_backup_dismissed" };
const get = (k) => { try { return Number(localStorage.getItem(k) || 0); } catch { return 0; } };
const set = (k) => { try { localStorage.setItem(k, String(Date.now())); } catch { /* noop */ } };

export const markChange = () => set(K.change);
export const markBackup = () => set(K.backup);
export const dismissReminder = () => set(K.dismissed);

export function shouldRemind() {
  const change = get(K.change);
  return change > get(K.backup) && change > get(K.dismissed);
}
