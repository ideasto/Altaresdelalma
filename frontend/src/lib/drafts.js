import { downloadFile, todayLocal } from "./storage";

const PREFIX = "altares_draft_";

export function loadDraft(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ ...value, savedAt: new Date().toISOString() }));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft(key) {
  try { localStorage.removeItem(PREFIX + key); } catch { /* noop */ }
}

export function downloadText(text, name = "texto") {
  downloadFile(text, `${name}-${todayLocal()}.txt`, "text/plain;charset=utf-8");
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export async function shareText(title, text) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      return "shared";
    } catch (e) {
      return e && e.name === "AbortError" ? "cancelled" : "error";
    }
  }
  return (await copyText(text)) ? "copied" : "error";
}
