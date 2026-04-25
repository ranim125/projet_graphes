export function triTopologique(g) {
  const etat = new Array(g.n + 1).fill(0); // 0 = blanc, 1 = gris, 2 = noir
  const ordre = [];
  let cycleDetecte = false;

  function dfs(u) {
    if (cycleDetecte) return;               // stopper la récursion si cycle déjà trouvé
    etat[u] = 1;                             // sommet en cours de visite
    for (const { v } of (g.adj[u] || [])) {
      if (etat[v] === 1) {
        cycleDetecte = true;                 // arc arrière → cycle
        return;
      }
      if (etat[v] === 0) dfs(v);
    }
    etat[u] = 2;                             // visite terminée
    ordre.push(u);                           // empilement dans l'ordre post‑visit
  }

  for (let i = 1; i <= g.n; i++) {
    if (etat[i] === 0) dfs(i);
    if (cycleDetecte) return null;
  }

  return ordre;  // l'ordre inverse (post‑order) sera utilisé dans l'algorithme
}