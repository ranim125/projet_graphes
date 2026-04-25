export function detecteCycle(g) {
  const etat = new Array(g.n + 1).fill(0); // 0 = non visité, 1 = en cours, 2 = terminé

  // Fonction récursive de parcours en profondeur
  function dfs(u) {
    etat[u] = 1;                         // marquer en cours de visite
    for (const { v } of (g.adj[u] || [])) {
      if (etat[v] === 1) {               // arc arrière → cycle détecté
        return true;
      }
      if (etat[v] === 0 && dfs(v)) {     // exploration d'un voisin blanc
        return true;
      }
    }
    etat[u] = 2;                         // visite terminée
    return false;
  }

  // Lancer le DFS sur chaque sommet non encore visité
  for (let i = 1; i <= g.n; i++) {
    if (etat[i] === 0 && dfs(i)) {
      return true;
    }
  }
  return false;
}