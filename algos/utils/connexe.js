// graphe.js

// Vérifie si le graphe est connexe (DFS)
export function isConnected(g) {
  if (!g || g.n === 0) return false;

  const visited = new Set();

  function dfs(u) {
    visited.add(u);

    for (const { v } of g.adj[u] || []) {
      if (!visited.has(v)) {
        dfs(v);
      }
    }
  }

  // commencer par le sommet 1
  dfs(1);

  return visited.size === g.n;
}