import { dfs } from "./Utils/dfs.js";

/**
 * Trouve les composantes connexes d’un graphe non orienté
 * @param {Object} g - graphe
 * @returns {Object} { success, result | error }
 */
export function composantes_connexes(g) {

  // Vérification : uniquement graphe non orienté
  if (g.oriente) {
    return {
      success: false,
      error: "composantes_connexes : graphe orienté non supporté"
    };
  }

  const visited = new Set();
  const result = [];

  // Parcours de tous les sommets
  for (let i = 1; i <= g.n; i++) {

    // Si non visité → nouvelle composante
    if (!visited.has(i)) {
      const comp = [];

      // DFS pour récupérer toute la composante
      dfs(g, i, visited, (u) => {
        comp.push(u);
      });

      result.push(comp);
    }
  }

  return {
    success: true,
    result: result
  };
}