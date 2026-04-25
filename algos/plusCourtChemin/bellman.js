import { detecteCycle } from '../utils/detecteCycle.js';

export function bellman(g, source) {
  // Étape 1 : vérifier l'absence de circuit 
  if (detecteCycle(g)) {
    return {
      success: false,
      error: "Le graphe contient un circuit, Bellman simplifié non applicable"
    };
  }

  // Étape 2 : tri topologique par DFS
  const etat = new Array(g.n + 1).fill(0); // 0=blanc, 1=gris, 2=noir
  const ordre = [];

  function dfs(u) {
    etat[u] = 1;
    for (const { v } of (g.adj[u] || [])) {
      if (etat[v] === 0) dfs(v);
    }
    etat[u] = 2;
    ordre.push(u);
  }

  for (let i = 1; i <= g.n; i++) {
    if (etat[i] === 0) dfs(i);
  }

  // Étape 3 : initialisation des distances
  const dist = new Array(g.n + 1).fill(Infinity);
  const pred = new Array(g.n + 1).fill(null);
  dist[source] = 0;

  // Parcours dans l'ordre topologique inverse
  for (let i = ordre.length - 1; i >= 0; i--) {
    const u = ordre[i];
    if (dist[u] === Infinity) continue; // sommet non atteignable
    for (const { v, w } of (g.adj[u] || [])) {
      if (dist[v] > dist[u] + w) {
        dist[v] = dist[u] + w;
        pred[v] = u;
      }
    }
  }

  return {
    success: true,
    result: {
      distances: dist.slice(1),
      predecesseurs: pred.slice(1)
    }
  };
}