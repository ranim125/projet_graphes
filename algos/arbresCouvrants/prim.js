import { isConnected } from "../utils/connexe.js";
export function prim(g) {
  if (!g || typeof g !== "object") {
    throw new Error("Graphe invalide");
  }
  if (!isConnected(g)) {
  throw new Error("Graphe non connexe");
}

  if (g.n === 0) return [];
  if (g.n === 1) return [];

  const visited = new Set();
  const mst = [];

  // commencer par le sommet 1
  visited.add(1);

  while (visited.size < g.n) {
    let minEdge = null;

    for (const u of visited) {
      for (const { v, w } of g.adj[u]) {

        // on cherche une arête vers un sommet non visité
        if (!visited.has(v)) {
          if (!minEdge || w < minEdge.w) {
            minEdge = { u, v, w };
          }
        }
      }
    }

    // si aucune arête trouvée → graphe non connexe
    if (!minEdge) {
      throw new Error("Graphe non connexe");
    }

    mst.push(minEdge);
    visited.add(minEdge.v);
  }

  return mst;
}