export function detecteCycleAbsorbant(g, distances) {
  for (let u = 1; u <= g.n; u++) {
    for (const { v, w } of (g.adj[u] || [])) {
      if (distances[u] !== Infinity && distances[v] > distances[u] + w) {
        return true; // une relaxation encore possible → cycle absorbant
      }
    }
  }
  return false;
}