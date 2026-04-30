export function estGrapheValide(g) {
  if (!g || typeof g !== "object") return false;
  if (!Number.isInteger(g.n) || g.n < 1) return false;
  if (typeof g.oriente !== "boolean") return false;
  if (typeof g.pondere !== "boolean") return false;
  if (!g.adj || typeof g.adj !== "object") return false;

  for (let u = 1; u <= g.n; u++) {
    const liste = g.adj[u] || [];

    if (!Array.isArray(liste)) return false;

    for (const edge of liste) {
      if (!edge || typeof edge !== "object") return false;
      if (!Number.isInteger(edge.v) || edge.v < 1 || edge.v > g.n) return false;
    }
  }

  return true;
}

export function getAdj(g, u) {
  return g.adj[u] || [];
}

export function erreur() {
  return {
    success: false,
    error: "Graphe invalide"
  };
}