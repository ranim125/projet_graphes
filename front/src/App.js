import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';

// ── Imports des vrais algorithmes ──────────────────────────────────────────
import { dijkstra }                      from '../src/algos/plusCourtChemin/dijkstra.js';
import { bellmanFord }                   from '../src/algos/plusCourtChemin/bellmanFord.js';
import { bellman }                       from '../src/algos/plusCourtChemin/bellman.js';
import { kruskal }                       from '../src/algos/arbresCouvrants/kruskal.js';
import { prim }                          from '../src/algos/arbresCouvrants/prim.js';
import { welsh_powell }                  from '../src/algos/coloration/welshPowell.js';
import { composantes_connexes }          from '../src/algos/composantes/composantes_connexes.js';
import { composantes_fortement_connexes} from '../src/algos/composantes/cfc.js';
import { eulerien }                      from '../src/algos/euler/eulerien.js';

// ── Adaptateur React → structure g ────────────────────────────────────────
import {
  buildGraph,
  distancesToMap,
  reconstructPath,
  indicesToNames,
} from './graphAdapter.js';

// ── Palette ──────────────────────────────────────────────────────────────
const COLORS = {
  A:'#a855f7', B:'#3b82f6', C:'#22c55e', D:'#f97316',
  E:'#ec4899', F:'#eab308', G:'#06b6d4', H:'#ef4444',
  I:'#84cc16', J:'#14b8a6',
};
const COLOR_LIST = Object.values(COLORS);

// Palette pour la coloration de graphe (Welsh-Powell)
const COLORATION_PALETTE = [
  '#ef4444', // rouge
  '#22c55e', // vert
  '#3b82f6', // bleu
  '#f59e0b', // orange
  '#a855f7', // violet
  '#ec4899', // rose
  '#14b8a6', // turquoise
  '#eab308', // jaune
  '#6366f1', // indigo
  '#84cc16', // lime
];

function getColor(name, vertices) {
  if (COLORS[name]) return COLORS[name];
  const idx = [...vertices.keys()].indexOf(name);
  return COLOR_LIST[idx % COLOR_LIST.length] || '#6366f1';
}

const DEFAULT_VERTICES = new Map();
const DEFAULT_EDGES = [];

export default function App() {
  const [lightMode, setLightMode]     = useState(false);
  const [oriented, setOriented]       = useState(true);
  const [weighted, setWeighted]       = useState(true);
  const [vertices, setVertices]       = useState(new Map(DEFAULT_VERTICES));
  const [edges, setEdges]             = useState([...DEFAULT_EDGES]);
  const [selectedAlgo, setSelectedAlgo] = useState('Dijkstra');
  const [currentTool, setCurrentTool] = useState('select');
  const [zoom, setZoom]               = useState(1);
  const [startVertex, setStartVertex] = useState('');
  const [resultContent, setResultContent] = useState('');
  const [toast, setToast]             = useState({ msg:'', show:false });
  const [modal, setModal]             = useState(null);
  
  // État pour la coloration des sommets
  const [vertexColors, setVertexColors] = useState(null); // { 'A': '#ef4444', 'B': '#22c55e', ... }

  // Modal form state
  const [newVertexName, setNewVertexName]   = useState('');
  const [deleteVertexSel, setDeleteVertexSel] = useState('');
  const [connectFrom, setConnectFrom]       = useState('');
  const [connectTo, setConnectTo]           = useState('');
  const [connectWeight, setConnectWeight]   = useState(1);
  const [deleteEdgeSel, setDeleteEdgeSel]   = useState('');

  const dragRef    = useRef(null);
  const svgRef     = useRef(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast({ msg, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2400);
  }, []);

  const vertexNames = [...vertices.keys()];

  // ── Auto-sélectionner le premier sommet ──────────────────────────────────
  useEffect(() => {
    if (vertexNames.length > 0 && !vertexNames.includes(startVertex)) {
      setStartVertex(vertexNames[0]);
    }
    if (vertexNames.length === 0) setStartVertex('');
  }, [vertices]);

  const typeBadge = `ℹ Le graphe est ${oriented ? 'orienté' : 'non orienté'} et ${weighted ? 'pondéré' : 'non pondéré'}`;

  // ── Add vertex ──────────────────────────────────────────────────────────
  const openAddVertex = () => { setNewVertexName(''); setModal('addVertex'); };
  const confirmAddVertex = () => {
    const name = newVertexName.trim().toUpperCase();
    if (!name) { showToast('Veuillez saisir un nom.'); return; }
    if (vertices.has(name)) { showToast(`Le sommet "${name}" existe déjà.`); return; }
    const cx = 150 + Math.random() * 400;
    const cy = 100 + Math.random() * 300;
    setVertices(v => new Map([...v, [name, { x: cx, y: cy }]]));
    setModal(null);
    showToast(`Sommet "${name}" ajouté.`);
  };

  // ── Delete vertex ───────────────────────────────────────────────────────
  const openDeleteVertex = () => {
    if (vertices.size === 0) { showToast('Aucun sommet à supprimer.'); return; }
    setDeleteVertexSel(vertexNames[0]);
    setModal('deleteVertex');
  };
  const confirmDeleteVertex = () => {
    const name = deleteVertexSel;
    if (!name) return;
    setVertices(v => { const m = new Map(v); m.delete(name); return m; });
    setEdges(e => e.filter(ed => ed.from !== name && ed.to !== name));
    setModal(null);
    showToast(`Sommet "${name}" supprimé.`);
  };

  // ── Connect ─────────────────────────────────────────────────────────────
  const openConnect = () => {
    if (vertices.size < 2) { showToast('Il faut au moins 2 sommets.'); return; }
    setConnectFrom(vertexNames[0]);
    setConnectTo(vertexNames[1] || vertexNames[0]);
    setConnectWeight(1);
    setModal('connect');
  };
  const confirmConnect = () => {
    if (connectFrom === connectTo) { showToast('Les deux sommets doivent être différents.'); return; }
    const dup = edges.some(e => e.from === connectFrom && e.to === connectTo);
    if (dup) { showToast(`Un arc de ${connectFrom} vers ${connectTo} existe déjà.`); return; }
    setEdges(e => [...e, { from: connectFrom, to: connectTo, weight: Number(connectWeight) || 1 }]);
    setModal(null);
    showToast(`Arc ${connectFrom} → ${connectTo} ajouté.`);
  };

  // ── Delete edge ─────────────────────────────────────────────────────────
  const openDeleteEdge = () => {
    if (edges.length === 0) { showToast('Aucune arête à supprimer.'); return; }
    setDeleteEdgeSel(0);
    setModal('deleteEdge');
  };
  const confirmDeleteEdge = () => {
    const idx = parseInt(deleteEdgeSel);
    setEdges(e => e.filter((_, i) => i !== idx));
    setModal(null);
    const e = edges[idx];
    showToast(`Arc ${e.from} → ${e.to} supprimé.`);
  };

  // ── Clear graph ─────────────────────────────────────────────────────────
  const clearGraph = () => {
    if (!window.confirm('Effacer tout le graphe ?')) return;
    setVertices(new Map());
    setEdges([]);
    clearResult();
    showToast('Graphe effacé.');
  };

  const clearResult = () => {
    setResultContent('');
    setVertexColors(null);
  };

  // ── Matrice d'adjacence ──────────────────────────────────────────────────
  const buildMatrix = () => {
    const names = [...vertices.keys()];
    let mat = '\t' + names.join('\t') + '\n';
    names.forEach(row => {
      mat += row;
      names.forEach(col => {
        const e = edges.find(ed => ed.from === row && ed.to === col);
        mat += '\t' + (e ? e.weight : 0);
      });
      mat += '\n';
    });
    return mat;
  };

  // ════════════════════════════════════════════════════════════════════════
  // ── Exécution des algorithmes ──────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════
  const runAlgorithm = () => {
    if (vertices.size === 0) { showToast("Ajoutez d'abord des sommets au graphe."); return; }
    const src = startVertex || vertexNames[0];
    if (!src) { showToast('Sélectionnez un sommet de départ.'); return; }

    // Réinitialiser la coloration
    setVertexColors(null);

    // Normalisation du nom d'algo
    const algoName = selectedAlgo.replace(' (Welsh-Powell)', '').trim();

    // Construction du graphe backend
    const g = buildGraph(vertices, edges, oriented, weighted);
    const srcIdx = g.nameToIndex[src];

    let result = `→ Algorithme : ${selectedAlgo}\n→ Sommet de départ : ${src}\n→ Calcul en cours...\n\n`;

    try {
      // ── Plus court chemin ──────────────────────────────────────────────
      if (algoName === 'Dijkstra') {
        const res = dijkstra(g, srcIdx);
        if (!res.success) { 
          result += `❌ Erreur : ${res.error}`; 
        } else {
          const distMap = distancesToMap(res.result.distances, g.indexToName);
          result += `✅ Distances minimales depuis ${src} :\n\n`;
          
          // Chemins et distances
          for (const [name, d] of Object.entries(distMap)) {
            if (name === src) continue;
            const targetIdx = g.nameToIndex[name];
            const path = reconstructPath(targetIdx, res.result.predecesseurs, g.indexToName);
            const pathStr = path.length > 1 ? path.join(' → ') : src + ' → ?';
            const distStr = d === Infinity ? '∞' : d;
            result += `  ${src} → ${name} : ${pathStr} (coût: ${distStr})\n`;
          }
          
          // Matrice d'adjacence
          result += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          result += `📊 MATRICE D'ADJACENCE\n\n`;
          result += buildMatrix();
        }
      }

      else if (algoName === 'Bellman-Ford') {
        const res = bellmanFord(g, srcIdx);
        if (!res.success) { 
          result += `❌ Erreur : ${res.error}`; 
        } else {
          const distMap = distancesToMap(res.result.distances, g.indexToName);
          result += `✅ Distances minimales (Bellman-Ford) depuis ${src} :\n\n`;
          
          for (const [name, d] of Object.entries(distMap)) {
            if (name === src) continue;
            const targetIdx = g.nameToIndex[name];
            const path = reconstructPath(targetIdx, res.result.predecesseurs, g.indexToName);
            const pathStr = path.length > 1 ? path.join(' → ') : src + ' → ?';
            const distStr = d === Infinity ? '∞' : d;
            result += `  ${src} → ${name} : ${pathStr} (coût: ${distStr})\n`;
          }
          
          result += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          result += `📊 MATRICE D'ADJACENCE\n\n`;
          result += buildMatrix();
        }
      }

      else if (algoName === 'Bellman') {
        const res = bellman(g, srcIdx);
        if (!res.success) { 
          result += `❌ Erreur : ${res.error}`; 
        } else {
          const distMap = distancesToMap(res.result.distances, g.indexToName);
          result += `✅ Distances minimales (Bellman) depuis ${src} :\n\n`;
          
          for (const [name, d] of Object.entries(distMap)) {
            if (name === src) continue;
            const targetIdx = g.nameToIndex[name];
            const path = reconstructPath(targetIdx, res.result.predecesseurs, g.indexToName);
            const pathStr = path.length > 1 ? path.join(' → ') : src + ' → ?';
            const distStr = d === Infinity ? '∞' : d;
            result += `  ${src} → ${name} : ${pathStr} (coût: ${distStr})\n`;
          }
          
          result += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          result += `📊 MATRICE D'ADJACENCE\n\n`;
          result += buildMatrix();
        }
      }

      // ── Arbres couvrants ───────────────────────────────────────────────
      else if (algoName === 'Kruskal') {
        const res = kruskal(g);
        if (!res.success) { 
          result += `❌ Erreur : ${res.error}`; 
        } else {
          result += `✅ Arbre couvrant minimum (Kruskal) :\n\n`;
          res.result.arbre.forEach(e => {
            const u = g.indexToName[e.u];
            const v = g.indexToName[e.v];
            result += `  ${u} — ${v} : ${e.w}\n`;
          });
          result += `\n🎯 Coût total : ${res.result.coutTotal}\n`;
          
          result += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          result += `📊 MATRICE D'ADJACENCE\n\n`;
          result += buildMatrix();
        }
      }

      else if (algoName === 'Prim') {
        const res = prim(g);
        if (!res.success) { 
          result += `❌ Erreur : ${res.error}`; 
        } else {
          result += `✅ Arbre couvrant minimum (Prim) :\n\n`;
          res.result.arbre.forEach(e => {
            const u = g.indexToName[e.u];
            const v = g.indexToName[e.v];
            result += `  ${u} — ${v} : ${e.w}\n`;
          });
          result += `\n🎯 Coût total : ${res.result.coutTotal}\n`;
          
          result += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          result += `📊 MATRICE D'ADJACENCE\n\n`;
          result += buildMatrix();
        }
      }

      // ── Composantes ────────────────────────────────────────────────────
      else if (algoName === 'Composantes connexes') {
        const res = composantes_connexes(g);
        if (!res.success) { 
          result += `❌ Erreur : ${res.error}`; 
        } else {
          result += `✅ Composantes connexes :\n\n`;
          res.result.forEach((comp, i) => {
            const names = indicesToNames(comp, g.indexToName);
            result += `  CC${i+1} : { ${names.join(', ')} }\n`;
          });
          
          result += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          result += `📊 MATRICE D'ADJACENCE\n\n`;
          result += buildMatrix();
        }
      }

      else if (algoName === 'Composantes fortement connexes') {
        const res = composantes_fortement_connexes(g);
        if (!res.success) { 
          result += `❌ Erreur : ${res.error}`; 
        } else {
          result += `✅ Composantes fortement connexes (Kosaraju) :\n\n`;
          res.result.forEach((comp, i) => {
            const names = indicesToNames(comp, g.indexToName);
            result += `  SCC${i+1} : { ${names.join(', ')} }\n`;
          });
          
          result += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          result += `📊 MATRICE D'ADJACENCE\n\n`;
          result += buildMatrix();
        }
      }

      // ── Euler ──────────────────────────────────────────────────────────
      else if (algoName === 'Chemin eulérien' || algoName === 'Circuit eulérien') {
        const res = eulerien(g);
        if (!res.success) { 
          result += `❌ Erreur : ${res.error}`; 
        } else {
          if (res.result.chemin) {
            const path = indicesToNames(res.result.chemin, g.indexToName);
            result += `✅ Chemin eulérien : ${path.join(' → ')}\n`;
          } else if (res.result.circuit) {
            const circuit = indicesToNames(res.result.circuit, g.indexToName);
            result += `✅ Circuit eulérien : ${circuit.join(' → ')}\n`;
          } else if (res.result.type) {
            const arr = res.result.chemin || res.result.circuit || res.result.parcours || [];
            const path = indicesToNames(arr, g.indexToName);
            result += `✅ ${res.result.type} : ${path.join(' → ')}\n`;
          } else {
            result += `✅ Résultat : ${JSON.stringify(res.result)}\n`;
          }
          
          result += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          result += `📊 MATRICE D'ADJACENCE\n\n`;
          result += buildMatrix();
        }
      }

      // ── Coloration ─────────────────────────────────────────────────────
      else if (algoName === 'Coloration des sommets') {
        const res = welsh_powell(g);
        if (!res.success) { 
          result += `❌ Erreur : ${res.error}`; 
        } else {
          result += `✅ Coloration des sommets (Welsh-Powell) :\n\n`;
          
          // Créer le mapping de couleurs pour l'affichage visuel
          const colorMap = {};
          for (const [idx, couleurNum] of Object.entries(res.result.coloration)) {
            const name = g.indexToName[Number(idx)];
            const colorHex = COLORATION_PALETTE[(couleurNum - 1) % COLORATION_PALETTE.length];
            colorMap[name] = colorHex;
            result += `  ${name} → Couleur ${couleurNum}\n`;
          }
          
          result += `\n🎯 Nombre chromatique : ${res.result.nombreCouleurs}\n`;
          
          // Appliquer les couleurs sur le graphe
          setVertexColors(colorMap);
          
          result += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          result += `📊 MATRICE D'ADJACENCE\n\n`;
          result += buildMatrix();
        }
      }

      else {
        result += `❌ Algorithme "${algoName}" non encore implémenté.`;
      }

    } catch (err) {
      result += `❌ Exception : ${err.message}\n${err.stack || ''}`;
    }

    setResultContent(result);
    showToast(`Exécution : ${selectedAlgo} depuis ${src}`);
  };

  // ── Drag logic ──────────────────────────────────────────────────────────
  const handleMouseDown = (e, name) => {
    if (currentTool !== 'select') return;
    dragRef.current = { name, ox: e.clientX, oy: e.clientY };
    e.stopPropagation();
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current) return;
    const { name, ox, oy } = dragRef.current;
    setVertices(v => {
      const m = new Map(v);
      const vt = m.get(name);
      m.set(name, { ...vt, x: vt.x + (e.clientX - ox), y: vt.y + (e.clientY - oy) });
      return m;
    });
    dragRef.current.ox = e.clientX;
    dragRef.current.oy = e.clientY;
  }, []);

  const handleMouseUp = useCallback(() => { dragRef.current = null; }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // ── Zoom ────────────────────────────────────────────────────────────────
  const zoomIn  = () => setZoom(z => Math.min(z + 0.1, 3));
  const zoomOut = () => setZoom(z => Math.max(z - 0.1, 0.3));

  // ── Render SVG edges ────────────────────────────────────────────────────
  const renderEdges = () => edges.map((e, i) => {
    const a = vertices.get(e.from);
    const b = vertices.get(e.to);
    if (!a || !b) return null;
    const R = 24;
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist, uy = dy / dist;
    const x1 = a.x + ux * R,       y1 = a.y + uy * R;
    const x2 = b.x - ux * (R + 7), y2 = b.y - uy * (R + 7);
    const mx = (x1 + x2) / 2,      my = (y1 + y2) / 2;
    return (
      <g key={i}>
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#94a3b8" strokeWidth="1.5"
          markerEnd={oriented ? 'url(#arrow)' : undefined} />
        {weighted && (
          <>
            <rect x={mx - 10} y={my - 9} width={20} height={16} rx={3} fill="#1c2333" />
            <text x={mx} y={my} fontSize={12} fill="#e2e8f0" fontWeight={600}
              fontFamily="Rajdhani,sans-serif" dominantBaseline="central" textAnchor="middle">
              {e.weight}
            </text>
          </>
        )}
      </g>
    );
  });

  // ── Render SVG nodes ────────────────────────────────────────────────────
  const renderNodes = () => [...vertices.entries()].map(([name, v]) => {
    // Utiliser la couleur de la coloration si disponible, sinon couleur par défaut
    const col = vertexColors && vertexColors[name] ? vertexColors[name] : getColor(name, vertices);
    
    return (
      <g key={name} transform={`translate(${v.x},${v.y})`}
        onMouseDown={e => handleMouseDown(e, name)} style={{ cursor: 'pointer' }}>
        <circle r={30} fill={col + '22'} />
        <circle r={24} fill={col} style={{ filter: `drop-shadow(0 0 8px ${col}88)` }} />
        <text fontFamily="Rajdhani,sans-serif" fontWeight={700} fontSize={16}
          fill="#fff" dominantBaseline="central" textAnchor="middle"
          style={{ pointerEvents: 'none' }}>
          {name}
        </text>
      </g>
    );
  });

  const algoGroups = [
    { title: '⭐ Plus court chemin',         color: '#4f46e5', algos: ['Dijkstra', 'Bellman-Ford', 'Bellman'] },
    { title: '🌲 Arbre couvrant',             color: '#15803d', algos: ['Kruskal', 'Prim'] },
    { title: '🔄 Composantes',               color: '#c2410c', algos: ['Composantes connexes', 'Composantes fortement connexes'] },
    { title: '〜 Chemins / Circuits eulériens',color: '#be185d', algos: ['Chemin eulérien', 'Circuit eulérien'] },
    { title: '🎨 Coloration',                color: '#7c3aed', algos: ['Coloration des sommets (Welsh-Powell)'] },
  ];

  const edgeOptions = edges.map((e, i) =>
    `${e.from} → ${e.to}${weighted ? ` (${e.weight})` : ''}`
  );

  return (
    <div className={`app ${lightMode ? 'light-mode' : ''}`}>
      {/* TOP BAR */}
      <header className="topbar">
        <div className="brand">
          <svg className="brand-icon" viewBox="0 0 32 32" fill="none">
            <circle cx="8"  cy="8"  r="5" stroke="#a78bfa" strokeWidth="2"/>
            <circle cx="24" cy="8"  r="5" stroke="#60a5fa" strokeWidth="2"/>
            <circle cx="16" cy="24" r="5" stroke="#34d399" strokeWidth="2"/>
            <line x1="12" y1="10" x2="20" y2="10" stroke="#a78bfa" strokeWidth="1.5"/>
            <line x1="11" y1="12" x2="16" y2="20" stroke="#60a5fa" strokeWidth="1.5"/>
            <line x1="21" y1="12" x2="16" y2="20" stroke="#34d399" strokeWidth="1.5"/>
          </svg>
          <div>
            <span className="brand-name">GraphMaster</span>
            <span className="brand-sub">Analyse et traitements de graphes</span>
          </div>
        </div>
        <div className="topbar-right">
          <button className="icon-btn" onClick={() => setLightMode(l => !l)} title="Thème">
            {lightMode ? '☀️' : '🌙'}
          </button>
          <button className="icon-btn" title="Plein écran"
            onClick={() => document.fullscreenElement
              ? document.exitFullscreen()
              : document.documentElement.requestFullscreen()}>
            ⛶
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="app-body">

        {/* LEFT PANEL */}
        <aside className="panel panel-left">
          <section className="card">
            <div className="card-header">
              <svg className="card-icon" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/><line x1="10" y1="6" x2="10" y2="14" stroke="currentColor" strokeWidth="1.5"/><line x1="6" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.5"/></svg>
              PROPRIÉTÉS DU GRAPHE
            </div>
            <p className="label-sm">Type de graphe</p>
            <div className="check-grid">
              <label className="chk">
                <input type="checkbox" checked={oriented} onChange={e => setOriented(e.target.checked)} />
                <span className="chk-box"></span>Orienté
              </label>
              <label className="chk">
                <input type="checkbox" checked={weighted} onChange={e => setWeighted(e.target.checked)} />
                <span className="chk-box"></span>Pondéré
              </label>
            </div>
            <div className="info-badge">{typeBadge}</div>
          </section>

          <section className="card">
            <div className="card-header">
              <svg className="card-icon" viewBox="0 0 20 20"><path d="M4 16l3-1 8-8-2-2-8 8-1 3z" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
              ÉDITION DU GRAPHE
            </div>
            <button className="btn-primary"   onClick={openAddVertex}>＋ Ajouter un sommet</button>
            <button className="btn-secondary" onClick={openConnect}>⟳ Relier deux sommets</button>
            <button className="btn-ghost"     onClick={openDeleteVertex}>🗑 Supprimer un sommet</button>
            <button className="btn-ghost"     onClick={openDeleteEdge}>✂ Supprimer une arête</button>
            <button className="btn-ghost danger" onClick={clearGraph}>✕ Effacer le graphe</button>
          </section>

          <section className="card">
            <div className="card-header">
              <svg className="card-icon" viewBox="0 0 20 20"><circle cx="6" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/><circle cx="14" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/><circle cx="14" cy="15" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
              SOMMETS
            </div>
            <ul className="vertex-list">
              {[...vertices.entries()].map(([name]) => (
                <li className="vertex-item" key={name}>
                  <span className="vertex-dot" style={{ background: getColor(name, vertices) }} />
                  <span className="vertex-name">{name}</span>
                  <button className="vertex-del" onClick={() => {
                    if (window.confirm(`Supprimer "${name}" ?`)) {
                      setVertices(v => { const m = new Map(v); m.delete(name); return m; });
                      setEdges(e => e.filter(ed => ed.from !== name && ed.to !== name));
                      showToast(`Sommet "${name}" supprimé.`);
                    }
                  }} title="Supprimer">🗑</button>
                </li>
              ))}
            </ul>
            <p className="total-label">Total : {vertices.size} sommet{vertices.size > 1 ? 's' : ''}</p>
          </section>
        </aside>

        {/* CANVAS */}
        <main className="canvas-wrap">
          <div className="canvas-toolbar">
            <button className="tool-btn" onClick={zoomOut} title="Zoom –">🔍−</button>
            <button className="tool-btn" onClick={zoomIn}  title="Zoom +">🔍+</button>
            <span className="zoom-label">{Math.round(zoom * 100)}%</span>
          </div>

          <div className="canvas-container" ref={svgRef}>
            <svg id="graphSvg" width="100%" height="100%">
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
                </marker>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <g transform={`scale(${zoom})`}>
                <g>{renderEdges()}</g>
                <g>{renderNodes()}</g>
              </g>
            </svg>
          </div>

          {/* Result panel - Simplifié sans onglets */}
          <div className="result-panel">
            <div className="result-header">
              <div className="card-header" style={{ margin: 0 }}>
                <svg className="card-icon" viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/><line x1="7" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5"/><line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5"/><line x1="7" y1="13" x2="11" y2="13" stroke="currentColor" strokeWidth="1.5"/></svg>
                RÉSULTAT
              </div>
              <button className="btn-ghost sm" onClick={clearResult}>🗑 Effacer</button>
            </div>
            <div className="tab-pane">
              <div className="log-area">
                {resultContent || <span className="log-hint">Aucun résultat. Sélectionnez un algorithme et cliquez Exécuter.</span>}
              </div>
            </div>
          </div>

          {/* Departure bar */}
          <div className="departure-bar">
            <div className="card-header" style={{ margin: 0, fontSize: '.75rem' }}>
              <svg className="card-icon" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/><circle cx="10" cy="10" r="2" fill="currentColor"/></svg>
              SOMMET DE DÉPART
            </div>
            <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>
              Sélectionnez le sommet de départ :
            </span>
            <select className="select-dep" value={startVertex}
              onChange={e => setStartVertex(e.target.value)}>
              {vertexNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button className="btn-run" onClick={runAlgorithm}>▶ Exécuter</button>
          </div>
        </main>

        {/* RIGHT PANEL */}
        <aside className="panel panel-right">
          <div className="card-header" style={{ padding: '.5rem 0 .75rem' }}>
            <svg className="card-icon" viewBox="0 0 20 20"><path d="M3 10h14M10 3l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
            ALGORITHMES
          </div>
          {algoGroups.map(group => (
            <div className="algo-group" key={group.title}>
              <div className="algo-group-title">{group.title}</div>
              {group.algos.map(name => {
                const displayName = name.replace(' (Welsh-Powell)', '');
                const isActive = selectedAlgo === name || selectedAlgo === displayName;
                return (
                  <button key={name}
                    className={`algo-btn${isActive ? ' active-algo' : ''}`}
                    style={{ background: group.color }}
                    onClick={() => {
                      setSelectedAlgo(name);
                      showToast(`Algorithme sélectionné : ${name}`);
                    }}>
                    {name}
                  </button>
                );
              })}
            </div>
          ))}
        </aside>
      </div>

      {/* MODALS */}
      {modal === 'addVertex' && (
        <div className="modal-backdrop open" onClick={e => { if (e.target.classList.contains('modal-backdrop')) setModal(null); }}>
          <div className="modal">
            <div className="modal-title">➕ Ajouter un sommet</div>
            <label className="modal-label">Nom du sommet</label>
            <input className="modal-input" value={newVertexName} maxLength={5}
              placeholder="ex: G" autoFocus
              onChange={e => setNewVertexName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmAddVertex()} />
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setModal(null)}>Annuler</button>
              <button className="modal-btn ok" onClick={confirmAddVertex}>OK</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'deleteVertex' && (
        <div className="modal-backdrop open" onClick={e => { if (e.target.classList.contains('modal-backdrop')) setModal(null); }}>
          <div className="modal">
            <div className="modal-title">🗑 Supprimer un sommet</div>
            <label className="modal-label">Choisir le sommet à supprimer</label>
            <select className="modal-input" value={deleteVertexSel}
              onChange={e => setDeleteVertexSel(e.target.value)}>
              {vertexNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setModal(null)}>Annuler</button>
              <button className="modal-btn ok danger" onClick={confirmDeleteVertex}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'connect' && (
        <div className="modal-backdrop open" onClick={e => { if (e.target.classList.contains('modal-backdrop')) setModal(null); }}>
          <div className="modal">
            <div className="modal-title">⟳ Relier deux sommets</div>
            <label className="modal-label">{oriented ? 'De' : 'Sommet 1'}</label>
            <select className="modal-input" value={connectFrom}
              onChange={e => setConnectFrom(e.target.value)}>
              {vertexNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <label className="modal-label">{oriented ? 'À' : 'Sommet 2'}</label>
            <select className="modal-input" value={connectTo}
              onChange={e => setConnectTo(e.target.value)}>
              {vertexNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            {weighted && (
              <>
                <label className="modal-label">Poids</label>
                <input className="modal-input" type="number" value={connectWeight}
                  placeholder="ex: 5" onChange={e => setConnectWeight(e.target.value)} />
              </>
            )}
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setModal(null)}>Annuler</button>
              <button className="modal-btn ok" onClick={confirmConnect}>Relier</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'deleteEdge' && (
        <div className="modal-backdrop open" onClick={e => { if (e.target.classList.contains('modal-backdrop')) setModal(null); }}>
          <div className="modal">
            <div className="modal-title">✂ Supprimer une arête</div>
            <label className="modal-label">Choisir l'arête à supprimer</label>
            <select className="modal-input" value={deleteEdgeSel}
              onChange={e => setDeleteEdgeSel(e.target.value)}>
              {edgeOptions.map((label, i) => (
                <option key={i} value={i}>{label}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setModal(null)}>Annuler</button>
              <button className="modal-btn ok danger" onClick={confirmDeleteEdge}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div className={`toast${toast.show ? ' show' : ''}`}>{toast.msg}</div>
    </div>
  );
}