import { isConnected } from "../utils/connexe.js";

export function kruskal(g) {
  // =========================
  // 🔴 Vérifications initiales
  // =========================
  if (!g || typeof g !== "object") {
    return {
      success: false,
      error: "Graphe invalide"
    };
  }
  if (!isConnected(g)) {
    return {
      success: false,
      error: "Le graphe n'est pas connexe"
    };
  }

  if (typeof g.n !== "number" || g.n <= 0) {
    return {
      success: false,
      error: "Nombre de sommets invalide"
    };
  }

  if (!g.adj || typeof g.adj !== "object") {
    return {
      success: false,
      error: "Liste d'adjacence invalide"
    };
  }

  // Cas limite : un seul sommet
  if (g.n === 1) {
    return {
      success: true,
      result: {
        arbre: [],
        coutTotal: 0
      }
    };
  }

  // =========================
  // 🧱 Extraction des arêtes
  // =========================
  const edges = [];

  for (const uStr in g.adj) {
    const u = Number(uStr);

    if (!Array.isArray(g.adj[u])) {
      return {
        success: false,
        error: `Adj invalide pour sommet ${u}`
      };
    }

    for (const edge of g.adj[u]) {
      const v = edge.v;
      const w = edge.w;

      if (typeof v !== "number" || typeof w !== "number") {
        return {
          success: false,
          error: "Arête invalide"
        };
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
    return {
      success: false,
      error: "Le graphe n'est pas connexe (MST incomplet)"
    };
  }

  // Calcul du coût total
  const coutTotal = mst.reduce((somme, arete) => somme + arete.w, 0);

  return {
    success: true,
    result: {
      arbre: mst,
      coutTotal: coutTotal
    }
  };
}