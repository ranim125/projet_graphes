export function aDesPoidsNegatifs(g) {
  // parcours de tous les sommets
  for (let u = 1; u <= g.n; u++) {
    // parcours des voisins de u
    for (const { w } of (g.adj[u] || [])) {
      if (w < 0) {
        return true;   // un poids <0 trouvé
      }
    }
  }
  return false;       // aucun poids < 0>
}