export interface AtributosTreinador {
  strength: number;
  dexterity: number;
  vitality: number;
  special: number;
  insight: number;
}

export interface Habilidade {
  nome: string;
  desc: string;
}

export interface ConquistaItem {
  texto: string;
  foto: string | null;
}

export interface Treinador {
  nome: string;
  classe: string;
  idade: string;
  genero: string;
  rank: string;
  pokedolares: number;
  foto: string | null;
  rotomImg: string | null;
  atributos: AtributosTreinador;
  skills: PokemonSkills;
  habilidadeTreinador: Habilidade;
  habilidadesClasse: Habilidade[];
  insignias: (string | ConquistaItem)[];
  fitas: (string | ConquistaItem)[];
  broches: (string | ConquistaItem)[];
  chaves: (string | ConquistaItem)[];
  background: string;
}

export interface PokemonStats {
  hp: number;
  atk: number;
  def: number;
  spatk: number;
  spdef: number;
  spd: number;
}

export interface PokemonGolpe {
  nome: string;
  poder?: number;
  tipo?: string;
  punteria?: string;
  dano?: string;
  efeito?: string;
  usos?: number;
}

export interface PokemonAtributos {
  strength: number;
  dexterity: number;
  vitality: number;
  special: number;
  insight: number;
}

export interface PokemonSkills {
  brawl: number;
  channel: number;
  clash: number;
  evasion: number;
  alert: number;
  athletic: number;
  stealth: number;
  charm: number;
  etiquette: number;
  intimidate: number;
  perform: number;
  empathy: number;
  nature_skill: number;
}

export interface Pokemon {
  id: string;
  pronto: boolean;
  nome: string;
  especie: string;
  genero: string;
  tipo1: string;
  tipo2: string;
  total: number;
  nature: string;
  ivs: number;
  teratype: string;
  pokebola: string;
  itemSegurado: string;
  felicidade: number;
  baseStats: PokemonStats;
  habilidade: string;
  megaShinka: boolean;
  battleBond: boolean;
  marks: string[];
  markEscolha: string;
  golpes: PokemonGolpe[];
  weak: Record<string, string>;
  batalhas: number;
  vitorias: number;
  derrotas: number;
  treinou: number;
  vitaminas: number;
  capturas: number;
  derrotou: number;
  esquivou: number;
  anotacoes: string;
  rank: string;
  baseHP: number;
  atributos: PokemonAtributos;
  skills: PokemonSkills;
  tamanho?: string;
  peso?: string;
  lealdade?: number;
  lazoBatalla?: string;
  puntosEntrenamiento?: number;
  accesorios?: string;
  ranurasBolsa?: string[];
  instintoLogica?: string;
  dureza?: number;
  carisma_concurso?: number;
  beleza?: number;
  dulzura?: number;
  ingenio?: number;
  expanded?: boolean;
}

export interface BoxPokemon {
  id: string;
  nome: string;
  especie: string;
  genero: string;
  tipo1: string;
  tipo2: string;
  total: number;
  nature: string;
  teratype: string;
  habilidade: string;
  pokebola: string;
  itemSegurado: string;
  felicidade: number;
  ivs: number;
  baseStats: PokemonStats;
  megaShinka: boolean;
  battleBond: boolean;
  marks: string[];
  markEscolha: string;
  weak: Record<string, string>;
  golpes: PokemonGolpe[];
  moveset?: string;
  notas: string;
  batalhas: number;
  vitorias: number;
  derrotas: number;
  treinou: number;
  vitaminas: number;
  capturas: number;
  derrotou: number;
  esquivou: number;
  baseHP: number;
  atributos: PokemonAtributos;
  skills: PokemonSkills;
  tamanho?: string;
  peso?: string;
  lealdade?: number;
  lazoBatalla?: string;
  puntosEntrenamiento?: number;
  accesorios?: string;
  ranurasBolsa?: string[];
  instintoLogica?: string;
  dureza?: number;
  carisma_concurso?: number;
  beleza?: number;
  dulzura?: number;
  ingenio?: number;
  expanded?: boolean;
}

export interface InventarioItem {
  id: string;
  nome: string;
  qtd: number;
}

export interface Ficha {
  treinador: Treinador;
  time: Pokemon[];
  box: BoxPokemon[];
  inventario: Record<string, InventarioItem[]>;
}
