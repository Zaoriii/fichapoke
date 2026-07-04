// Integração com o dataset público do Pokerole-Data (mesma fonte usada pelo PokéroleDex).
// Repositório: https://github.com/Pokerole-Software-Development/Pokerole-Data
// Não requer chave de API — é um repositório público, lido via GitHub Contents API + raw.githubusercontent.com

export interface PokeroleGolpeResult {
  nome: string;
  poder?: number;
  tipo?: string;
  punteria?: string;
  dano?: string;
  efeito?: string;
}

export interface PokeroleAutofillResult {
  tipo1: string;
  tipo2: string;
  baseHP: number;
  atributos: {
    strength: number;
    dexterity: number;
    vitality: number;
    special: number;
    insight: number;
  };
  habilidade: string;
  habilidadesDisponiveis: string[];
  golpes: PokeroleGolpeResult[];
  tamanho?: string;
  peso?: string;
  raw: any;
}

const REPO = "Pokerole-Software-Development/Pokerole-Data";
const BRANCH = "master";
const API_BASE = `https://api.github.com/repos/${REPO}/contents`;

type IndexEntry = { name: string; download_url: string };
type FolderIndex = Map<string, IndexEntry>;

const memoryIndexCache: Record<string, FolderIndex> = {};
const memoryJsonCache = new Map<string, any>();

function normalize(name: string): string {
  return (name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // remove espaços, hífen, apóstrofo etc.
}

function localStorageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function localStorageSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // quota cheia ou indisponível — segue sem cache persistente
  }
}

// Busca (e cacheia) a listagem de arquivos de uma pasta do dataset (ex: "Pokedex", "Moves", "Abilities")
async function loadFolderIndex(folder: string): Promise<FolderIndex> {
  if (memoryIndexCache[folder]) return memoryIndexCache[folder];

  const cacheKey = `pokeroleData_idx_${folder}`;
  const cached = localStorageGet(cacheKey);
  if (cached) {
    try {
      const entries: IndexEntry[] = JSON.parse(cached);
      const map: FolderIndex = new Map(entries.map(e => [normalize(e.name), e]));
      memoryIndexCache[folder] = map;
      return map;
    } catch {
      // cache corrompido, ignora e recarrega
    }
  }

  const res = await fetch(`${API_BASE}/v3.0/${folder}?ref=${BRANCH}`);
  if (!res.ok) {
    throw new Error(`Não foi possível acessar a pasta "${folder}" do Pokerole-Data (HTTP ${res.status}).`);
  }
  const list: any[] = await res.json();
  const entries: IndexEntry[] = list
    .filter(f => f.type === "file" && typeof f.name === "string" && f.name.toLowerCase().endsWith(".json"))
    .map(f => ({ name: f.name.replace(/\.json$/i, ""), download_url: f.download_url }));

  const map: FolderIndex = new Map(entries.map(e => [normalize(e.name), e]));
  memoryIndexCache[folder] = map;
  localStorageSet(cacheKey, JSON.stringify(entries));
  return map;
}

async function fetchJsonCached(url: string): Promise<any> {
  if (memoryJsonCache.has(url)) return memoryJsonCache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao buscar dados em ${url} (HTTP ${res.status}).`);
  const data = await res.json();
  memoryJsonCache.set(url, data);
  return data;
}

function findInIndex(index: FolderIndex, name: string): IndexEntry | null {
  const key = normalize(name);
  if (!key) return null;
  if (index.has(key)) return index.get(key)!;
  // fallback: correspondência parcial (ex: "Mr. Mime" vs "Mr Mime", variações de forma)
  for (const [k, v] of index) {
    if (k.startsWith(key) || key.startsWith(k)) return v;
  }
  return null;
}

export async function fetchPokedexEntry(speciesName: string): Promise<any | null> {
  const index = await loadFolderIndex("Pokedex");
  const entry = findInIndex(index, speciesName);
  if (!entry) return null;
  return fetchJsonCached(entry.download_url);
}

export async function fetchMoveEntry(moveName: string): Promise<any | null> {
  const index = await loadFolderIndex("Moves");
  const entry = findInIndex(index, moveName);
  if (!entry) return null;
  return fetchJsonCached(entry.download_url);
}

function readHeightMeters(h: any): number | undefined {
  if (!h || typeof h !== "object") return undefined;
  const v = h.Meters ?? h.meters ?? h.Metres ?? h.metres;
  return typeof v === "number" ? v : undefined;
}

function readWeightKg(w: any): number | undefined {
  if (!w || typeof w !== "object") return undefined;
  const v = w.Kilograms ?? w.kilograms ?? w.Kg ?? w.kg;
  return typeof v === "number" ? v : undefined;
}

/**
 * Busca os dados de uma espécie no Pokerole-Data e monta um objeto pronto
 * para ser mesclado num Pokemon/BoxPokemon da ficha.
 * Retorna `null` se a espécie não for encontrada no dataset.
 */
export async function fetchAutofillForSpecies(
  speciesName: string,
  opts?: { moveLimit?: number }
): Promise<PokeroleAutofillResult | null> {
  const dex = await fetchPokedexEntry(speciesName);
  if (!dex) return null;

  const moveLimit = opts?.moveLimit ?? 4;
  const learnset: { Learned?: string; Name: string }[] = Array.isArray(dex.Moves) ? dex.Moves : [];
  const starterMoves = learnset.filter(m => (m.Learned || "").toLowerCase() === "starter");
  const chosen = (starterMoves.length ? starterMoves : learnset).slice(0, moveLimit);

  const golpes: PokeroleGolpeResult[] = await Promise.all(
    chosen.map(async m => {
      try {
        const move = await fetchMoveEntry(m.Name);
        if (!move) return { nome: m.Name };
        return {
          nome: move.Name || m.Name,
          poder: typeof move.Power === "number" ? move.Power : undefined,
          tipo: move.Type || undefined,
          punteria: [move.Accuracy1, move.Accuracy2].filter(Boolean).join(" + "),
          dano: [move.Damage1, move.Damage2].filter(Boolean).join(" + "),
          efeito: move.Effect || move.Description || undefined
        };
      } catch {
        return { nome: m.Name };
      }
    })
  );

  const habilidadesDisponiveis = [dex.Ability1, dex.Ability2, dex.HiddenAbility].filter(Boolean);

  return {
    tipo1: dex.Type1 || "",
    tipo2: dex.Type2 || "",
    baseHP: typeof dex.BaseHP === "number" ? dex.BaseHP : 4,
    atributos: {
      strength: dex.Strength ?? 1,
      dexterity: dex.Dexterity ?? 1,
      vitality: dex.Vitality ?? 1,
      special: dex.Special ?? 1,
      insight: dex.Insight ?? 1
    },
    habilidade: dex.Ability1 || "",
    habilidadesDisponiveis,
    golpes,
    tamanho: (() => {
      const m = readHeightMeters(dex.Height);
      return m !== undefined ? `${m} m` : undefined;
    })(),
    peso: (() => {
      const kg = readWeightKg(dex.Weight);
      return kg !== undefined ? `${kg} kg` : undefined;
    })(),
    raw: dex
  };
}
