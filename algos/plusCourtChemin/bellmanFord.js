import { detecteCycleNegatif } from '../utils/detecteCycleAbsorbant.js';

export function bellmanFord(g, source) {
  const dist = new Array(g.n + 1).fill(Infinity);
  const pred = new Array(g.n + 1).fill(null);
  dist[source] = 0;

  // Construire une liste de toutes les arêtes du graphe
  const aretes = [];
  for (let u = 1; u <= g.n; u++) {
    for (const { v, w } of (g.adj[u] || [])) {
      aretes.push({ u, v, w });
    }
  }

  // Phase 1 : n-1 relaxations
  for (let i = 1; i < g.n; i++) {
    let changement = false;
    for (const { u, v, w } of aretes) {
      if (dist[u] !== Infinity && dist[v] > dist[u] + w) {
        dist[v] = dist[u] + w;
        pred[v] = u;
        changement = true;
      }
    }
    // Si aucune amélioration, on peut s'arrêter
    if (!changement) break;
  }

  // Phase 2 : détection de cycle négatif 
  if (detecteCycleAbsorbant(g, dist)) {
    return {
      success: false,
      error: "Cycle absorbant détecté"
    };
  }

  return {
    success: true,
    result: {
      distances: dist.slice(1),
      predecesseurs: pred.slice(1)
    }
  };
}