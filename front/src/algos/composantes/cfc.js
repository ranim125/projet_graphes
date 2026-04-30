import { transposeGraph } from "../utils/InverseGraph.js";

/**
 * Algorithme de Kosaraju pour les CFC
 * @param {Object} g - graphe orienté
 * @returns {Object} { success, result | error }
 */
export function composantes_fortement_connexes(g) {

  // Vérification : uniquement graphe orienté
  if (!g.oriente) {
    return {
      success: false,
      error: "CFC : graphe non orienté non supporté"
    };
  }

  const visited = new Set();
  const stack = [];

  /**
   * DFS 1 : remplit la pile selon l’ordre de fin
   */
  function dfs1(u) {
    visited.add(u);

    for (const { v } of g.adj[u]) {
      if (!visited.has(v)) dfs1(v);
    }

    stack.push(u); // ordre de fin
  }

  // Appliquer DFS1 à tous les sommets
  for (let i = 1; i <= g.n; i++) {
    if (!visited.has(i)) dfs1(i);
  }

  // Inverser le graphe
  const gT = transposeGraph(g);

  visited.clear();
  const result = [];

  /**
   * DFS 2 : récupère une composante fortement connexe
   */
  function dfs2(u, comp) {
    visited.add(u);
    comp.push(u);

    for (const { v } of gT.adj[u]) {
      if (!visited.has(v)) dfs2(v, comp);
    }
  }

  // Traitement selon la pile
  while (stack.length > 0) {
    const u = stack.pop();

    if (!visited.has(u)) {
      const comp = [];

      // chaque DFS2 = une CFC
      dfs2(u, comp);

      result.push(comp);
    }
  }

  return {
    success: true,
    result: result
  };
}