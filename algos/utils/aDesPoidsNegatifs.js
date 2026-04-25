export function aDesPoidsNegatifs(g) {
  // Parcours de tous les sommets
  for (let u = 1; u <= g.n; u++) {
    // Parcours des voisins de u
    for (const { w } of (g.adj[u] || [])) {
      if (w < 0) {
        return true;   // Un poids négatif trouvé
      }
    }
  }
  return false;       // Aucun poids négatif
}