import { getAdj } from "./grapheUtils.js";

function creerResultat(type, chemin) {
  return {
    success: true,
    result: { type, chemin }
  };
}

export function traiterEulerNonOriente(g) {
  if (!estConnexeNonOriente(g)) {
    return creerResultat("non eulérien", []);
  }

  const impairs = trouverSommetsImpairs(g);

  if (impairs.length === 0) {
    const depart = trouverSommetDepartNonOriente(g);
    const chemin = construireCheminEulerNonOriente(g, depart);
    return creerResultat("circuit eulérien", chemin);
  }

  if (impairs.length === 2) {
    const chemin = construireCheminEulerNonOriente(g, impairs[0]);
    return creerResultat("chemin eulérien", chemin);
  }

  return creerResultat("non eulérien", []);
}

export function traiterEulerOriente(g) {
  if (!estConnexeFaible(g)) {
    return creerResultat("non eulérien", []);
  }

  const { inDeg, outDeg } = calculerDegresOrientes(g);

  let depart = null;
  let plusSortant = 0;
  let plusEntrant = 0;

  for (let u = 1; u <= g.n; u++) {
    const diff = outDeg[u] - inDeg[u];

    if (diff === 1) {
      plusSortant++;
      depart = u;
    } else if (diff === -1) {
      plusEntrant++;
    } else if (diff !== 0) {
      return creerResultat("non eulérien", []);
    }
  }

  if (plusSortant === 0 && plusEntrant === 0) {
    depart = trouverSommetDepartOriente(g);
    const chemin = construireCheminEulerOriente(g, depart);
    return creerResultat("circuit eulérien", chemin);
  }

  if (plusSortant === 1 && plusEntrant === 1) {
    const chemin = construireCheminEulerOriente(g, depart);
    return creerResultat("chemin eulérien", chemin);
  }

  return creerResultat("non eulérien", []);
}

function estConnexeNonOriente(g) {
  const utiles = [];

  for (let u = 1; u <= g.n; u++) {
    if (getAdj(g, u).length > 0) utiles.push(u);
  }

  if (utiles.length === 0) return true;

  const visites = new Set();
  const pile = [utiles[0]];

  while (pile.length > 0) {
    const u = pile.pop();
    if (visites.has(u)) continue;

    visites.add(u);

    for (const edge of getAdj(g, u)) {
      if (!visites.has(edge.v)) pile.push(edge.v);
    }
  }

  return utiles.every(u => visites.has(u));
}

function trouverSommetsImpairs(g) {
  const impairs = [];

  for (let u = 1; u <= g.n; u++) {
    if (getAdj(g, u).length % 2 !== 0) {
      impairs.push(u);
    }
  }

  return impairs;
}

function trouverSommetDepartNonOriente(g) {
  for (let u = 1; u <= g.n; u++) {
    if (getAdj(g, u).length > 0) return u;
  }

  return 1;
}

function construireCheminEulerNonOriente(g, depart) {
  const adjCopie = {};

  for (let u = 1; u <= g.n; u++) {
    adjCopie[u] = getAdj(g, u).map(edge => edge.v);
  }

  const pile = [depart];
  const chemin = [];

  while (pile.length > 0) {
    const u = pile[pile.length - 1];

    if (adjCopie[u].length > 0) {
      const v = adjCopie[u].pop();

      const index = adjCopie[v].indexOf(u);
      if (index !== -1) adjCopie[v].splice(index, 1);

      pile.push(v);
    } else {
      chemin.push(pile.pop());
    }
  }

  return chemin.reverse();
}

function calculerDegresOrientes(g) {
  const inDeg = {};
  const outDeg = {};

  for (let u = 1; u <= g.n; u++) {
    inDeg[u] = 0;
    outDeg[u] = 0;
  }

  for (let u = 1; u <= g.n; u++) {
    for (const edge of getAdj(g, u)) {
      outDeg[u]++;
      inDeg[edge.v]++;
    }
  }

  return { inDeg, outDeg };
}

function estConnexeFaible(g) {
  const { inDeg, outDeg } = calculerDegresOrientes(g);
  const utiles = [];

  for (let u = 1; u <= g.n; u++) {
    if (inDeg[u] + outDeg[u] > 0) utiles.push(u);
  }

  if (utiles.length === 0) return true;

  const voisinage = {};

  for (let u = 1; u <= g.n; u++) {
    voisinage[u] = [];
  }

  for (let u = 1; u <= g.n; u++) {
    for (const edge of getAdj(g, u)) {
      voisinage[u].push(edge.v);
      voisinage[edge.v].push(u);
    }
  }

  const visites = new Set();
  const pile = [utiles[0]];

  while (pile.length > 0) {
    const u = pile.pop();
    if (visites.has(u)) continue;

    visites.add(u);

    for (const v of voisinage[u]) {
      if (!visites.has(v)) pile.push(v);
    }
  }

  return utiles.every(u => visites.has(u));
}

function trouverSommetDepartOriente(g) {
  for (let u = 1; u <= g.n; u++) {
    if (getAdj(g, u).length > 0) return u;
  }

  return 1;
}

function construireCheminEulerOriente(g, depart) {
  const adjCopie = {};

  for (let u = 1; u <= g.n; u++) {
    adjCopie[u] = getAdj(g, u).map(edge => edge.v);
  }

  const pile = [depart];
  const chemin = [];

  while (pile.length > 0) {
    const u = pile[pile.length - 1];

    if (adjCopie[u].length > 0) {
      const v = adjCopie[u].pop();
      pile.push(v);
    } else {
      chemin.push(pile.pop());
    }
  }

  return chemin.reverse();
}