/**
 *
 * @param {Map<string, {x:number, y:number}>} vertices  - Map des sommets React
 * @param {Array<{from:string, to:string, weight:number}>} edges - Arêtes React
 * @param {boolean} oriented  - graphe orienté ou non
 * @param {boolean} weighted  - graphe pondéré ou non
 * @returns {{ n, adj, oriente, pondere, indexToName, nameToIndex }}
 */
export function buildGraph(vertices, edges, oriented, weighted) {
  const names = [...vertices.keys()];
  const n = names.length;

  // Mapping bidirectionnel : nom ↔ indice 1-based (les algos utilisent 1..n)
  const nameToIndex = {};
  const indexToName = {};
  names.forEach((name, i) => {
    nameToIndex[name] = i + 1;
    indexToName[i + 1] = name;
  });

  // Initialiser la liste d'adjacence
  const adj = {};
  for (let i = 1; i <= n; i++) {
    adj[i] = [];
  }

  // Remplir adj depuis les arêtes React
  for (const edge of edges) {
    const u = nameToIndex[edge.from];
    const v = nameToIndex[edge.to];
    if (u === undefined || v === undefined) continue;

    const w = weighted ? (Number(edge.weight) || 1) : 1;

    adj[u].push({ v, w });

    // Si non orienté → ajouter l'arc inverse aussi
    if (!oriented) {
      adj[v].push({ v: u, w });
    }
  }

  return {
    n,
    adj,
    oriente: oriented,
    pondere: weighted,
    indexToName,   // utile pour afficher les résultats avec les noms originaux
    nameToIndex,
  };
}

/**
 * Reconstruit un chemin (tableau d'indices 1-based) en noms lisibles.
 * @param {number[]} path - tableau d'indices
 * @param {Object} indexToName
 * @returns {string[]}
 */
export function indicesToNames(path, indexToName) {
  return path.map(i => indexToName[i] ?? `?${i}`);
}

/**
 * Convertit le tableau dist[] (1-based, index 0 = dist[1]) retourné par les algos
 * en un objet { nomSommet: distance }.
 *
 * Les algos retournent : result.distances = dist.slice(1) → tableau 0-based, indices 0..n-1
 * distances[0] = dist du sommet 1, distances[1] = dist du sommet 2, etc.
 *
 * @param {number[]} distances - result.distances des algos
 * @param {Object} indexToName
 * @returns {Object}
 */
export function distancesToMap(distances, indexToName) {
  const map = {};
  distances.forEach((d, i) => {
    const name = indexToName[i + 1];
    if (name !== undefined) map[name] = d;
  });
  return map;
}

/**
 * Reconstruit le chemin depuis source vers target en utilisant
 * le tableau predecesseurs retourné par les algos.
 *
 * predecesseurs[i] = indice du prédécesseur du sommet (i+1), ou null
 *
 * @param {number} targetIdx - indice 1-based de la cible
 * @param {(number|null)[]} predecesseurs - result.predecesseurs des algos
 * @param {Object} indexToName
 * @returns {string[]} chemin en noms, ou [] si inaccessible
 */
export function reconstructPath(targetIdx, predecesseurs, indexToName) {
  const path = [];
  let cur = targetIdx;

  while (cur !== null && cur !== undefined) {
    path.unshift(indexToName[cur] ?? `?${cur}`);
    // predecesseurs est 0-based : predecesseurs[i] = prédécesseur du sommet (i+1)
    cur = predecesseurs[cur - 1];
  }

  return path;
}