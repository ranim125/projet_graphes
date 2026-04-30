import { listeAretes } from '../utils/construireListeAretes.js';
import { detecteCycleAbsorbant } from '../utils/detecteCycleAbsorbant.js';

export function bellmanFord(g, source) {
  const dist = new Array(g.n + 1).fill(Infinity);
  const pred = new Array(g.n + 1).fill(null);
  dist[source] = 0;

  const aretes = listeAretes(g);   

//n-1 itérations de relaxation
  for (let i = 1; i < g.n; i++) {
    let changement = false;
    for (const { u, v, w } of aretes) {
      if (dist[u] !== Infinity && dist[v] > dist[u] + w) {
        dist[v] = dist[u] + w;
        pred[v] = u;
        changement = true;
      }
    }
    // si aucune amélioration, on s'arrete
    if (!changement) break;
  }
//
  if (detecteCycleAbsorbant(g, dist)) {
    return { success: false, error: "Cycle absorbant détecté" };
  }

  return {
    success: true,
    result: { distances: dist.slice(1), predecesseurs: pred.slice(1) }
  };
}