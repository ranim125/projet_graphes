/**
 * DFS générique
 * @param {Object} g - graphe
 * @param {number} start - sommet de départ
 * @param {Set} visited - sommets visités
 * @param {Function} action - fonction exécutée sur chaque sommet
 */
export function dfs(g, start, visited, action) {
  visited.add(start);
  action(start);

  for (const { v } of g.adj[start]) {
    if (!visited.has(v)) {
      dfs(g, v, visited, action);
    }
  }
}