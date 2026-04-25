/**
 * Inverse les arêtes d’un graphe orienté
 * @param {Object} g - graphe original
 * @returns {Object} graphe transposé
 */
export function transposeGraph(g) {
  const adjT = {};

  // initialisation
  for (let i = 1; i <= g.n; i++) {
    adjT[i] = [];
  }

  // inversion des arêtes
  for (let u = 1; u <= g.n; u++) {
    for (const { v, w } of g.adj[u]) {
      adjT[v].push({ v: u, w });
    }
  }

  return {
    n: g.n,
    oriente: g.oriente,
    pondere: g.pondere,
    adj: adjT
  };
}