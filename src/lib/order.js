// Fairness: one random candidate order per browser tab, kept in sessionStorage so reloads,
// back / forward and moves between pages show the same order. Plain JS on purpose: pages
// inline it (via ?raw, with the export stripped) to reorder the DOM before first paint.
export function sessionOrder(slugs, create = true) {
  const KEY = 'ls-order';
  let stored = null;
  try { stored = JSON.parse(sessionStorage.getItem(KEY)); } catch {}
  if (!Array.isArray(stored)) {
    if (!create) return [...slugs];
    stored = [];
  }
  // Drop unknown or duplicate slugs, then append new candidates in random order.
  const known = new Set(slugs);
  const order = [...new Set(stored)].filter((s) => known.has(s));
  const fresh = slugs.filter((s) => !order.includes(s));
  const rand = new Uint32Array(fresh.length);
  crypto.getRandomValues(rand);
  for (let i = fresh.length - 1; i > 0; i--) { // Fisher–Yates, crypto RNG
    const j = rand[i] % (i + 1);
    [fresh[i], fresh[j]] = [fresh[j], fresh[i]];
  }
  order.push(...fresh);
  try { sessionStorage.setItem(KEY, JSON.stringify(order)); } catch {}
  return order;
}
