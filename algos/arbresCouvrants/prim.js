import { isConnected } from "../utils/connexe.js";

export function prim(g) {
  if (!g || typeof g !== "object") {
    return {
      success: false,
      error: "Graphe invalide"
    };
  }
  if (!isConnected(g)) {
    return {
      success: false,
      error: "Graphe non connexe"
    };
  }

  if (g.n === 0) {
    return {
      success: true,
      result: {
        arbre: [],
        coutTotal: 0
      }
    };
  }
  if (g.n === 1) {
    return {
      success: true,
      result: {
        arbre: [],
        coutTotal: 0
      }
    };
  }

  const visited = new Set();
  const mst = [];

  visited.add(1);

  while (visited.size < g.n) {
    let minEdge = null;

    for (const u of visited) {
      for (const { v, w } of g.adj[u]) {
        if (!visited.has(v)) {
          if (!minEdge || w < minEdge.w) {
            minEdge = { u, v, w };
          }
        }
      }
    }

    if (!minEdge) {
      return {
        success: false,
        error: "Graphe non connexe"
      };
    }

    mst.push(minEdge);
    visited.add(minEdge.v);
  }

  const coutTotal = mst.reduce((sum, edge) => sum + edge.w, 0);

  return {
    success: true,
    result: {
      arbre: mst,
      coutTotal: coutTotal
    }
  };
}