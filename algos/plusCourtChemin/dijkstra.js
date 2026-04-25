import { aDesPoidsNegatifs } from '../utils/aDesPoidsNegatifs.js';

export function dijkstra(g, source) {
  // Vérification poids négatifs
  if (aDesPoidsNegatifs(g)) {
    return {
      success: false,
      error: "Dijkstra ne supporte pas les poids négatifs"
    };
  }

  // Initialisation
  const dist = new Array(g.n + 1).fill(Infinity);
  const pred = new Array(g.n + 1).fill(null);
  const visite = new Array(g.n + 1).fill(false);
  dist[source] = 0;

  // Boucle principale
  for (let i = 1; i <= g.n; i++) {
    // Sélection du sommet non visité de distance minimale
    let u = -1;
    let minDist = Infinity;
    for (let j = 1; j <= g.n; j++) {
      if (!visite[j] && dist[j] < minDist) {
        minDist = dist[j];
        u = j;
      }
    }
    // Si aucun sommet atteignable restant, on sort
    if (u === -1) break;

    visite[u] = true;

    // Relaxation des arcs sortants
    for (const { v, w } of (g.adj[u] || [])) {
      if (dist[v] > dist[u] + w) {
        dist[v] = dist[u] + w;
        pred[v] = u;
      }
    }
  }

  // Retour formaté (on enlève l'indice 0)
  return {
    success: true,
    result: {
      distances: dist.slice(1),        
      predecesseurs: pred.slice(1)
    }
  };
}