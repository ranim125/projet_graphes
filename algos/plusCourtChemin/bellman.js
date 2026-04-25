import { triTopologique } from '../utils/triTopologique.js';

export function bellman(g, source) {
  // 1) : obtention de l'ordre topologique + détection de cycle
  const ordre = triTopologique(g);

  if (ordre === null) {
    return {
      success: false,
      error: "Le graphe contient un circuit, Bellman simplifié non applicable"
    };
  }

  // 2) : inversion pour parcourir du début vers la fin du DAG
  ordre.reverse();

  // initialisation des distances
  const dist = new Array(g.n + 1).fill(Infinity);
  const pred = new Array(g.n + 1).fill(null);
  dist[source] = 0;

  // parcours en ordre topologique
  for (const u of ordre) {
    if (dist[u] === Infinity) continue; // sommet non encore accessible
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
      distances: dist.slice(1),        // indices 0 à n-1
      predecesseurs: pred.slice(1)
    }
  };
}