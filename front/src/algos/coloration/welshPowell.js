import { estGrapheValide, erreur } from "../utils/grapheUtils.js";
import {
  construireVoisinageNonOriente,
  calculerDegres,
  trierSommetsParDegre,
  colorierSommets,
  calculerNombreCouleurs
} from "../utils/welshUtils.js";

export function welsh_powell(g) {
  if (!estGrapheValide(g)) {
    return erreur();
  }

  const voisinage = construireVoisinageNonOriente(g);
  const degres = calculerDegres(voisinage, g.n);
  const sommetsTries = trierSommetsParDegre(degres, g.n);
  const coloration = colorierSommets(sommetsTries, voisinage);
  const nombreCouleurs = calculerNombreCouleurs(coloration);

  return {
    success: true,
    result: {
      coloration,
      nombreCouleurs
    }
  };
}