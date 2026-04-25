export function detecteCycleAbsorbant(g, distances) {
  for (let u = 1; u <= g.n; u++) {
    for (const { v, w } of (g.adj[u] || [])) {
      // Si on peut encore améliorer, c'est qu'il y a un cycle absorbant
      if (distances[u] !== Infinity && distances[v] > distances[u] + w) {
        return true;
      }
    }
  }
  return false;
}