// algos/tests/test_all.js
import { dijkstra } from '../plusCourtChemin/dijkstra.js';
import { bellmanFord } from '../plusCourtChemin/bellmanFord.js';
import { bellman } from '../plusCourtChemin/bellman.js';
import { kruskal } from '../arbresCouvrants/kruskal.js';
import { prim } from '../arbresCouvrants/prim.js';
import { composantes_connexes } from '../composantes/composantes_connexes.js';
import { composantes_fortement_connexes } from '../composantes/cfc.js';
import { eulerien } from '../euler/eulerien.js';
import { welsh_powell } from '../coloration/welshPowell.js';

// ---------- Graphes de test ----------

// g1 : non orienté, pondéré, connexe
const g1 = {
  n: 5,
  oriente: false,
  pondere: true,
  adj: {
    1: [{ v: 2, w: 3 }, { v: 3, w: 5 }],
    2: [{ v: 1, w: 3 }, { v: 4, w: 2 }],
    3: [{ v: 1, w: 5 }, { v: 5, w: 4 }],
    4: [{ v: 2, w: 2 }],
    5: [{ v: 3, w: 4 }]
  }
};

// g2 : orienté, pondéré, poids négatifs, sans cycle absorbant
const g2 = {
  n: 4,
  oriente: true,
  pondere: true,
  adj: {
    1: [{ v: 2, w: 4 }, { v: 3, w: -2 }],
    2: [{ v: 4, w: 3 }],
    3: [{ v: 2, w: 1 }],
    4: []
  }
};

// g3 : orienté, cycle absorbant (1→2→3→1 = -1)
const g3 = {
  n: 3,
  oriente: true,
  pondere: true,
  adj: {
    1: [{ v: 2, w: 1 }],
    2: [{ v: 3, w: -2 }],
    3: [{ v: 1, w: 0 }]
  }
};

// g4 : DAG (orienté, sans circuit)
const g4 = {
  n: 4,
  oriente: true,
  pondere: true,
  adj: {
    1: [{ v: 2, w: 3 }, { v: 3, w: 2 }],
    2: [{ v: 4, w: 1 }],
    3: [{ v: 4, w: 4 }],
    4: []
  }
};

// g5 : orienté avec circuit, pour Bellman (doit échouer)
const g5 = {
  n: 3,
  oriente: true,
  pondere: true,
  adj: {
    1: [{ v: 2, w: 1 }],
    2: [{ v: 3, w: 1 }],
    3: [{ v: 1, w: 1 }]
  }
};

// g6 : non orienté, non connexe
const g6 = {
  n: 4,
  oriente: false,
  pondere: true,
  adj: {
    1: [{ v: 2, w: 1 }],
    2: [{ v: 1, w: 1 }],
    3: [{ v: 4, w: 2 }],
    4: [{ v: 3, w: 2 }]
  }
};

// g7 : orienté, fortement connexe ?
const g7 = {
  n: 4,
  oriente: true,
  pondere: false,
  adj: {
    1: [{ v: 2, w: 1 }],
    2: [{ v: 3, w: 1 }],
    3: [{ v: 4, w: 1 }],
    4: [{ v: 1, w: 1 }]
  }
};

// g8 : non orienté, eulérien (circuit)
const g8 = {
  n: 4,
  oriente: false,
  pondere: false,
  adj: {
    1: [{ v: 2, w: 1 }, { v: 3, w: 1 }],
    2: [{ v: 1, w: 1 }, { v: 4, w: 1 }],
    3: [{ v: 1, w: 1 }, { v: 4, w: 1 }],
    4: [{ v: 2, w: 1 }, { v: 3, w: 1 }]
  }
};

// g9 : non orienté, chemin eulérien (2 impairs)
const g9 = {
  n: 5,
  oriente: false,
  pondere: false,
  adj: {
    1: [{ v: 2, w: 1 }],
    2: [{ v: 1, w: 1 }, { v: 3, w: 1 }],
    3: [{ v: 2, w: 1 }, { v: 4, w: 1 }],
    4: [{ v: 3, w: 1 }, { v: 5, w: 1 }],
    5: [{ v: 4, w: 1 }]
  }
};

// g10 : orienté, eulérien (circuit) avec d+ = d-
const g10 = {
  n: 3,
  oriente: true,
  pondere: false,
  adj: {
    1: [{ v: 2, w: 1 }],
    2: [{ v: 3, w: 1 }],
    3: [{ v: 1, w: 1 }]
  }
};

// ---------- Exécution ----------

console.log("=== DIJKSTRA (g1) ===");
console.log(JSON.stringify(dijkstra(g1, 1), null, 2));

console.log("=== DIJKSTRA (g2, poids négatif) ===");
console.log(JSON.stringify(dijkstra(g2, 1), null, 2));

console.log("\n=== BELLMAN-FORD (g1) ===");
console.log(JSON.stringify(bellmanFord(g1, 1), null, 2));

console.log("=== BELLMAN-FORD (g2, poids négatif) ===");
console.log(JSON.stringify(bellmanFord(g2, 1), null, 2));

console.log("=== BELLMAN-FORD (g3, cycle absorbant) ===");
console.log(JSON.stringify(bellmanFord(g3, 1), null, 2));

console.log("\n=== BELLMAN (g4, DAG) ===");
console.log(JSON.stringify(bellman(g4, 1), null, 2));

console.log("=== BELLMAN (g5, avec circuit) ===");
console.log(JSON.stringify(bellman(g5, 1), null, 2));

console.log("\n=== KRUSKAL (g1) ===");
console.log(JSON.stringify(kruskal(g1), null, 2));

console.log("=== KRUSKAL (g6, non connexe) ===");
console.log(JSON.stringify(kruskal(g6), null, 2));

console.log("\n=== PRIM (g1) ===");
console.log(JSON.stringify(prim(g1), null, 2));

console.log("=== PRIM (g6, non connexe) ===");
console.log(JSON.stringify(prim(g6), null, 2));

console.log("\n=== COMPOSANTES CONNEXES (g1) ===");
console.log(JSON.stringify(composantes_connexes(g1), null, 2));

console.log("=== COMPOSANTES CONNEXES (g6, deux compos.) ===");
console.log(JSON.stringify(composantes_connexes(g6), null, 2));

console.log("=== COMPOSANTES CONNEXES (g2, orienté → erreur) ===");
console.log(JSON.stringify(composantes_connexes(g2), null, 2));

console.log("\n=== CFC (g7, orienté fortement connexe) ===");
console.log(JSON.stringify(composantes_fortement_connexes(g7), null, 2));

console.log("=== CFC (g2, orienté) ===");
console.log(JSON.stringify(composantes_fortement_connexes(g2), null, 2));

console.log("=== CFC (g1, non orienté → erreur) ===");
console.log(JSON.stringify(composantes_fortement_connexes(g1), null, 2));

console.log("\n=== EULER (g8, circuit non orienté) ===");
console.log(JSON.stringify(eulerien(g8), null, 2));

console.log("=== EULER (g9, chemin non orienté) ===");
console.log(JSON.stringify(eulerien(g9), null, 2));

console.log("=== EULER (g10, circuit orienté) ===");
console.log(JSON.stringify(eulerien(g10), null, 2));

console.log("\n=== WELSH-POWELL (g1) ===");
console.log(JSON.stringify(welsh_powell(g1), null, 2));