import { estGrapheValide, erreur } from "../utils/grapheUtils.js";
import { traiterEulerOriente, traiterEulerNonOriente } from "../utils/eulerUtils.js";

export function eulerien(g) {
  if (!estGrapheValide(g)) {
    return erreur();
  }

  if (g.oriente) {
    return traiterEulerOriente(g);
  }

  return traiterEulerNonOriente(g);
}