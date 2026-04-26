import { isConnected } from "../utils/connexe.js";
export function kruskal(g) {
  // =========================
  // 🔴 Vérifications initiales
  // =========================
  if (!g || typeof g !== "object") {
    throw new Error("Graphe invalide");
  }
  if (!isConnected(g)) {
  throw new Error("Graphe non connexe");
}

  if (typeof g.n !== "number" || g.n <= 0) {
    throw new Error("Nombre de sommets invalide");
  }

  if (!g.adj || typeof g.adj !== "object") {
    throw new Error("Liste d'adjacence invalide");
  }

  // Cas limite : un seul sommet
  if (g.n === 1) {
    return [];
  }

  // =========================
  // 🧱 Extraction des arêtes
  // =========================
  const edges = [];

  for (const uStr in g.adj) {
    const u = Number(uStr);

    if (!Array.isArray(g.adj[u])) {
      throw new Error(`Adj invalide pour sommet ${u}`);
    }

    for (const edge of g.adj[u]) {
      const v = edge.v;
      const w = edge.w;

      if (typeof v !== "number" || typeof w !== "number") {
        throw new Error("Arête invalide");
      }

      // éviter doublons (graphe non orienté)
      if (u < v) {
        edges.push({ u, v, w });
      }
    }
  }

  // =========================
  // 📊 Tri des arêtes
  // =========================
  edges.sort((a, b) => a.w - b.w);

  // =========================
  // 🧠 Union-Find
  // =========================
  const parent = {};
  const rank = {};

  for (let i = 1; i <= g.n; i++) {
    parent[i] = i;
    rank[i] = 0;
  }

  function find(x) {
    if (parent[x] !== x) {
      parent[x] = find(parent[x]); // compression de chemin
    }
    return parent[x];
  }

  function union(a, b) {
    const rootA = find(a);
    const rootB = find(b);

    if (rootA === rootB) {
      return false; // cycle
    }

    // union par rang
    if (rank[rootA] < rank[rootB]) {
      parent[rootA] = rootB;
    } else if (rank[rootA] > rank[rootB]) {
      parent[rootB] = rootA;
    } else {
      parent[rootB] = rootA;
      rank[rootA]++;
    }

    return true;
  }

  // =========================
  // 🌳 Construction du MST
  // =========================
  const mst = [];

  for (const { u, v, w } of edges) {
    if (union(u, v)) {
      mst.push({ u, v, w });
    }

    if (mst.length === g.n - 1) {
      break;
    }
  }

  // =========================
  // ⚠️ Vérification connexité
  // =========================
  if (mst.length !== g.n - 1) {
    throw new Error("Le graphe n'est pas connexe (MST incomplet)");
  }

  return mst;
}