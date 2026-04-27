import { eulerien } from "./eulerien/eulerien.js";
import { welsh_powell } from "./welsh/welsh.js";

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

const g2 = {
  n: 3,
  oriente: false,
  pondere: false,
  adj: {
    1: [{ v: 2, w: 1 }, { v: 3, w: 1 }],
    2: [{ v: 1, w: 1 }, { v: 3, w: 1 }],
    3: [{ v: 1, w: 1 }, { v: 2, w: 1 }]
  }
};

const g3 = {
  n: 4,
  oriente: false,
  pondere: false,
  adj: {
    1: [{ v: 2, w: 1 }, { v: 3, w: 1 }, { v: 4, w: 1 }],
    2: [{ v: 1, w: 1 }],
    3: [{ v: 1, w: 1 }],
    4: [{ v: 1, w: 1 }]
  }
};

const g4 = {
  n: 3,
  oriente: true,
  pondere: false,
  adj: {
    1: [{ v: 2, w: 1 }],
    2: [{ v: 3, w: 1 }],
    3: [{ v: 1, w: 1 }]
  }
};

const g5 = {
  n: 3,
  oriente: true,
  pondere: false,
  adj: {
    1: [{ v: 2, w: 1 }],
    2: [{ v: 3, w: 1 }],
    3: []
  }
};

const g6 = {
  n: 3,
  oriente: false,
  pondere: false,
  adj: {
    1: [],
    2: [],
    3: []
  }
};

function testEuler(nom, g, attendu) {
  const res = eulerien(g);
  const ok = res.success && res.result.type === attendu;

  console.log(nom, ok ? "OK" : "FAIL", res);
}

function testWelsh(nom, g) {
  const res = welsh_powell(g);
  console.log(nom, res);
}

testEuler("Euler g1 chemin non orienté", g1, "chemin eulérien");
testEuler("Euler g2 circuit non orienté", g2, "circuit eulérien");
testEuler("Euler g3 non eulérien", g3, "non eulérien");
testEuler("Euler g4 circuit orienté", g4, "circuit eulérien");
testEuler("Euler g5 chemin orienté", g5, "chemin eulérien");
testEuler("Euler g6 sans arêtes", g6, "circuit eulérien");

testWelsh("Welsh g1", g1);
testWelsh("Welsh g2 triangle", g2);
testWelsh("Welsh g3 étoile", g3);
testWelsh("Welsh g6 sans arêtes", g6);