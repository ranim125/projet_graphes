export function listeAretes(g) {
  const aretes = [];
  const dejaVu = new Set();

  for (let u = 1; u <= g.n; u++) {
    for (const { v, w } of (g.adj[u] || [])) {
      // identifiant unique pour éviter les doublons en non orienté
      const id = g.oriente ? `${u}->${v}` : (u < v ? `${u}-${v}` : `${v}-${u}`);
      if (!dejaVu.has(id)) {
        dejaVu.add(id);
        aretes.push({ u, v, w });
      }
    }
  }

  return aretes;
}