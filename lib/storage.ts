const KEY = "sp_quote_wip";
export const loadForm = <T>(): T | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as T) : null;
};
export const saveForm = <T>(data: T) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
};
export const clearForm = () => { if (typeof window !== "undefined") localStorage.removeItem(KEY); };
