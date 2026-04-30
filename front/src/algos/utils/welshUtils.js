export function construireVoisinageNonOriente(g) {
  const voisinage = {};

  for (let u = 1; u <= g.n; u++) {
    voisinage[u] = new Set();
  }

  for (let u = 1; u <= g.n; u++) {
    for (const edge of g.adj[u] || []) {
      voisinage[u].add(edge.v);
      voisinage[edge.v].add(u);
    }
  }

  return voisinage;
}

export function calculerDegres(voisinage, n) {
  const degres = {};

  for (let u = 1; u <= n; u++) {
    degres[u] = voisinage[u].size;
  }

  return degres;
}

export function trierSommetsParDegre(degres, n) {
  const sommets = [];

  for (let u = 1; u <= n; u++) {
    sommets.push(u);
  }

  sommets.sort((a, b) => degres[b] - degres[a] || a - b);

  return sommets;
}

export function colorierSommets(sommets, voisinage) {
  const coloration = {};
  let couleur = 1;

  for (const s of sommets) {
    if (coloration[s]) continue;

    coloration[s] = couleur;

    for (const autre of sommets) {
      if (coloration[autre]) continue;

      let ok = true;

      for (const v of voisinage[autre]) {
        if (coloration[v] === couleur) {
          ok = false;
          break;
        }
      }

      if (ok) {
        coloration[autre] = couleur;
      }
    }

    couleur++;
  }

  return coloration;
}

export function calculerNombreCouleurs(coloration) {
  return new Set(Object.values(coloration)).size;
}