import type { Pratica } from '../types/pratica'

export type ColorePallino = 'rosso' | 'giallo' | 'verde' | 'bianco'

type PraticaPerPallino = Pick<Pratica, 'problema' | 'pratica_finale_path' | 'inserita_enea'>

export function getColorePallino(p: PraticaPerPallino): ColorePallino {
  if (p.pratica_finale_path) return 'verde'
  if (p.problema) return 'rosso'
  if (p.inserita_enea) return 'giallo'
  return 'bianco'
}
