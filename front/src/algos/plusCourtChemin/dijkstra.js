import { aDesPoidsNegatifs } from '../utils/aDesPoidsNegatifs.js';

export function dijkstra(g, source) {
  // vérification poids <0
  if (aDesPoidsNegatifs(g)) {
    return {
      success: false,
      error: "Dijkstra ne supporte pas les poids négatifs"
    };
  }

  // init
  const dist = new Array(g.n + 1).fill(Infinity);
  const pred = new Array(g.n + 1).fill(null);
  const visite = new Array(g.n + 1).fill(false);
  dist[source] = 0;

  // boucle principale
  for (let i = 1; i <= g.n; i++) {
    // sélection du sommet non visité de distance min
    let u = -1;
    let minDist = Infinity;
    for (let j = 1; j <= g.n; j++) {
      if (!visite[j] && dist[j] < minDist) {
        minDist = dist[j];
        u = j;
      }
    }
    // si aucun sommet atteignable restant, on sort
    if (u === -1) break;

    visite[u] = true;

    // relaxation des arcs sortants
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