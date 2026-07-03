import { Pokemon, BoxPokemon, Ficha, InventarioItem } from "./types";
export const jr = (): string => Math.random().toString(36).substring(2, 9);

export function uy(type: string): string {
  const mapping: Record<string, string> = {
    normal: "Normal", fogo: "Fire", água: "Water", agua: "Water",
    elétrico: "Electric", eletrico: "Electric", grama: "Grass", planta: "Grass",
    gelo: "Ice", lutador: "Fighting", lutadora: "Fighting", luta: "Fighting",
    veneno: "Poison", venenoso: "Poison", terra: "Ground", terrestre: "Ground",
    voador: "Flying", voadora: "Flying", voo: "Flying", psíquico: "Psychic",
    psiquico: "Psychic", inseto: "Bug", pedra: "Rock", rocha: "Rock",
    fantasma: "Ghost", dragão: "Dragon", dragao: "Dragon", sombrio: "Dark",
    sombria: "Dark", noturno: "Dark", aço: "Steel", aco: "Steel", fada: "Fairy"
  };
  const o = (type || "").trim().toLowerCase();
  return mapping[o] || (type || "").trim();
}

export interface ImportResult {
  patch: Partial<Pokemon & BoxPokemon> & { _importNote?: string };
  found: string[];
  missing: string[];
}

export function dy(text: string): ImportResult {
  const patch: any = {};
  const found: string[] = [];
  const missing: string[] = [];

  const getLine = (label: string): string => {
    const regex = new RegExp("(?:" + label + ")\\s*\\n([^\\n]+)", "i");
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  };

  const pokemonName = getLine("Pok\u00E9mon|Pokemon");
  if (pokemonName) {
    let gender = "Indefinido";
    if (pokemonName.includes("\u2640")) gender = "F\u00EAmea";
    else if (pokemonName.includes("\u2642")) gender = "Macho";
    patch.nome = pokemonName.replace(/[♀♂]/g, "").trim();
    patch.genero = gender;
    found.push("Nome/G\u00EAnero");
  } else {
    missing.push("Nome");
  }

  // Omit Level scanning! But check the rest of the lines

  const tera = getLine("Tera Type|Teratype");
  if (tera) {
    patch.teratype = uy(tera);
    found.push("Teratype");
  } else {
    missing.push("Teratype");
  }

  const nature = getLine("Nature");
  if (nature) {
    patch.nature = nature;
    found.push("Nature");
  } else {
    missing.push("Nature");
  }

  const ability = getLine("Ability|Habilidade");
  if (ability) {
    patch.habilidade = ability;
    found.push("Habilidade");
  } else {
    missing.push("Habilidade");
  }

  const movesMatch = text.match(/Moves\s*\n((?:[•\-][^\n]+\n?)+)/i);
  if (movesMatch) {
    const list = movesMatch[1].split("\n")
      .map(line => line.replace(/^[•\-]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 4);
    const golpes = list.map(name => ({ nome: name }));
    while (golpes.length < 4) {
      golpes.push({ nome: "" });
    }
    patch.golpes = golpes;
    found.push("Golpes (" + list.length + ")");
  } else {
    missing.push("Golpes");
  }

  const totalMatch = text.match(/Base Stats\s*\(Total:\s*(\d+)\)/i);
  if (totalMatch) {
    patch.total = Number(totalMatch[1]);
  }

  const statsMatch = text.match(/Base Stats[^\n]*\n([^\n]*\n?[^\n]*)/i);
  if (statsMatch) {
    const d = statsMatch[1];
    const v: Record<string, number> = {};
    const rgx = /(HP|ATK|DEF|SPA|SPD|SPE)\s*:\s*(\d+)/gi;
    let match;
    while ((match = rgx.exec(d))) {
      v[match[1].toUpperCase()] = Number(match[2]);
    }
    if (Object.keys(v).length >= 4) {
      patch.baseStats = {
        hp: v.HP || 0,
        atk: v.ATK || 0,
        def: v.DEF || 0,
        spatk: v.SPA || 0,
        spdef: v.SPD || 0,
        spd: v.SPE || 0
      };
      found.push("Status Base");
    } else {
      missing.push("Status Base");
    }
  } else {
    missing.push("Status Base");
  }

  const ivsLine = getLine("IVs");
  if (ivsLine) {
    const match = ivsLine.match(/\((\d+)\)/);
    if (match) {
      patch.ivs = Number(match[1]) >= 31 ? 31 : 0;
      found.push("IVs");
    } else if (/perfeit/i.test(ivsLine)) {
      patch.ivs = 31;
      found.push("IVs");
    } else {
      missing.push("IVs");
    }
  } else {
    missing.push("IVs");
  }

  const rarity = getLine("Raridade");
  const shinyAlpha = text.match(/Shiny\s*\/\s*Alpha\s*\n([\s\S]*?)(?:\n\s*\n|Moves)/i);
  const importNotes: string[] = [];
  if (rarity) {
    importNotes.push("Raridade: " + rarity.replace(/^[^\wÀ-ú]+/, "").trim());
  }
  if (shinyAlpha) {
    importNotes.push(shinyAlpha[1].trim().replace(/\n+/g, " — "));
  }
  if (importNotes.length) {
    patch._importNote = importNotes.join(" | ");
  }

  return { patch, found, missing };
}

export interface PkDerivedStats {
  hp: number;
  defesa: number;
  spDefesa: number;
  will: number;
  iniciativa: number;
  evasion: number;
  choque: number;
}

export function pkCalc(mon: Partial<Pokemon>): PkDerivedStats {
  const at = mon.atributos || { strength: 1, dexterity: 1, vitality: 1, special: 1, insight: 1 };
  const str = Number(at.strength) || 0;
  const dex = Number(at.dexterity) || 0;
  const vit = Number(at.vitality) || 0;
  const spe = Number(at.special) || 0;
  const ins = Number(at.insight) || 0;
  const sk = mon.skills || {};
  const baseHp = Number(mon.baseHP) || 4;

  const clashVal = Number((sk as any).clash) || 0;
  const channelVal = Number((sk as any).channel) || 0;
  const evasionVal = Number((sk as any).evasion) || 0;
  const alertVal = Number((sk as any).alert) || 0;

  return {
    hp: baseHp + vit,
    defesa: vit + clashVal,
    spDefesa: spe + channelVal,
    will: spe + ins,
    iniciativa: dex + alertVal,
    evasion: dex + evasionVal,
    choque: str + clashVal
  };
}

export interface RollResult {
  dice: number[];
  sucessos: number;
}

export function rollPool(n: number): RollResult {
  const count = Math.max(0, Number(n) || 0);
  const dice: number[] = [];
  for (let i = 0; i < count; i++) {
    dice.push(1 + Math.floor(Math.random() * 6));
  }
  const sucessos = dice.filter(d => d >= 4).length;
  return { dice, sucessos };
}

export function encMon9(mon: Partial<Pokemon | BoxPokemon>): string {
  try {
    const { id, ...rest } = mon as any;
    return btoa(unescape(encodeURIComponent(JSON.stringify(rest))));
  } catch (e) {
    return "";
  }
}

export function decMon9(code: string): any {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
  } catch (e) {
    return null;
  }
}

export function toArr9<T>(v: any, fallback: T[]): T[] {
  if (Array.isArray(v)) return v;
  if (v && typeof v === "object") {
    return Object.keys(v).sort((a, b) => Number(a) - Number(b)).map(k => v[k]);
  }
  return fallback;
}

export function normMon9(baseFn: () => any, val: any): any {
  if (!val) return null;
  const base = baseFn();
  const m = { ...base, ...val };
  m.marks = toArr9(val.marks, []);
  const golpes = toArr9(val.golpes, []);
  m.golpes = golpes.length ? golpes.map((g: any) => ({
    nome: g?.nome || "",
    poder: g?.poder !== undefined ? Number(g.poder) : undefined,
    tipo: g?.tipo !== undefined ? String(g.tipo) : undefined,
    punteria: g?.punteria !== undefined ? String(g.punteria) : undefined,
    dano: g?.dano !== undefined ? String(g.dano) : undefined,
    efeito: g?.efeito !== undefined ? String(g.efeito) : undefined,
    usos: g?.usos !== undefined ? Number(g.usos) : undefined,
  })) : [{ nome: "" }, { nome: "" }, { nome: "" }, { nome: "" }];
  
  m.ranurasBolsa = toArr9(val.ranurasBolsa, ["", "", "", ""]);
  m.weak = val.weak && typeof val.weak === "object" ? val.weak : {};
  m.baseStats = {
    hp: 0, atk: 0, def: 0, spatk: 0, spdef: 0, spd: 0,
    ...(val.baseStats && typeof val.baseStats === "object" ? val.baseStats : {})
  };
  if (base.atributos) {
    m.atributos = { ...base.atributos, ...(val.atributos || {}) };
  }
  if (base.skills) {
    m.skills = { ...base.skills, ...(val.skills || {}) };
  }
  return m;
}

export function normFicha9(val: any): Ficha {
  const empty = {
    treinador: {
      nome: "", classe: "Treinador", idade: "", genero: "", rank: "Amateur", pokedolares: 1000,
      foto: null, rotomImg: null,
      atributos: { strength: 1, dexterity: 1, vitality: 1, special: 1, insight: 1 },
      skills: { brawl: 0, channel: 0, clash: 0, evasion: 0, alert: 0, athletic: 0, stealth: 0, charm: 0, etiquette: 0, intimidate: 0, perform: 0, empathy: 0, nature_skill: 0 },
      habilidadeTreinador: { nome: "", desc: "" },
      habilidadesClasse: [{ nome: "", desc: "" }, { nome: "", desc: "" }, { nome: "", desc: "" }],
      insignias: Array(8).fill(""), fitas: Array(6).fill(""), broches: Array(8).fill(""), chaves: Array(6).fill(""),
      background: ""
    },
    time: [], box: [], inventario: { equipavel: [], consumivel: [], medicinal: [], berry: [], pokebola: [], extras: [], evolucao: [] }
  };
  if (!val) return empty as any;

  const t = { ...empty.treinador, ...(val.treinador || {}) };
  t.atributos = {
    strength: val.treinador?.atributos?.strength ?? val.treinador?.atributos?.vitalidade ?? 1,
    dexterity: val.treinador?.atributos?.dexterity ?? val.treinador?.atributos?.destreza ?? 1,
    vitality: val.treinador?.atributos?.vitality ?? val.treinador?.atributos?.vitalidade ?? 1,
    special: val.treinador?.atributos?.special ?? val.treinador?.atributos?.sabedoria ?? 1,
    insight: val.treinador?.atributos?.insight ?? val.treinador?.atributos?.percepcao ?? 1,
  };
  t.skills = {
    brawl: val.treinador?.skills?.brawl ?? 0,
    channel: val.treinador?.skills?.channel ?? 0,
    clash: val.treinador?.skills?.clash ?? 0,
    evasion: val.treinador?.skills?.evasion ?? 0,
    alert: val.treinador?.skills?.alert ?? 0,
    athletic: val.treinador?.skills?.athletic ?? 0,
    stealth: val.treinador?.skills?.stealth ?? 0,
    charm: val.treinador?.skills?.charm ?? 0,
    etiquette: val.treinador?.skills?.etiquette ?? 0,
    intimidate: val.treinador?.skills?.intimidate ?? 0,
    perform: val.treinador?.skills?.perform ?? 0,
    empathy: val.treinador?.skills?.empathy ?? 0,
    nature_skill: val.treinador?.skills?.nature_skill ?? 0,
  };
  t.habilidadeTreinador = { ...empty.treinador.habilidadeTreinador, ...(t.habilidadeTreinador || {}) };
  t.habilidadesClasse = toArr9(t.habilidadesClasse, []).length ? toArr9(t.habilidadesClasse, []) : empty.treinador.habilidadesClasse;
  t.insignias = toArr9(t.insignias, []).length ? toArr9(t.insignias, []) : empty.treinador.insignias;
  t.fitas = toArr9(t.fitas, []).length ? toArr9(t.fitas, []) : empty.treinador.fitas;
  t.broches = toArr9(t.broches, []).length ? toArr9(t.broches, []) : empty.treinador.broches;
  t.chaves = toArr9(t.chaves, []).length ? toArr9(t.chaves, []) : empty.treinador.chaves;

  const time = toArr9(val.time, []).map(item => normMon9(() => ({
    id: jr(), pronto: false, nome: "", especie: "", genero: "Macho", tipo1: "", tipo2: "", total: 500,
    nature: "", ivs: 31, teratype: "", pokebola: "", itemSegurado: "", felicidade: 0,
    baseStats: { hp: 0, atk: 0, def: 0, spatk: 0, spdef: 0, spd: 0 }, habilidade: "", megaShinka: false, battleBond: false,
    marks: [], markEscolha: "", golpes: [{ nome: "" }, { nome: "" }, { nome: "" }, { nome: "" }], weak: {},
    batalhas: 0, vitorias: 0, derrotas: 0, treinou: 0, vitaminas: 0, capturas: 0, derrotou: 0, esquivou: 0, anotacoes: "",
    rank: "Starter", baseHP: 4, atributos: { strength: 1, dexterity: 1, vitality: 1, special: 1, insight: 1 },
    skills: { brawl: 0, channel: 0, clash: 0, evasion: 0, alert: 0, athletic: 0, stealth: 0, charm: 0, etiquette: 0, intimidate: 0, perform: 0, empathy: 0, nature_skill: 0 },
    tamanho: "", peso: "", lealdade: 3, lazoBatalla: "", puntosEntrenamiento: 0, accesorios: "", ranurasBolsa: ["", "", "", ""], instintoLogica: "",
    dureza: 0, carisma_concurso: 0, beleza: 0, dulzura: 0, ingenio: 0
  }), item)).filter(Boolean);

  const box = toArr9(val.box, []).map(item => normMon9(() => ({
    id: jr(), nome: "", especie: "", genero: "Macho", tipo1: "", tipo2: "", total: 500,
    nature: "", teratype: "", habilidade: "", pokebola: "", itemSegurado: "", felicidade: 0, ivs: 31,
    baseStats: { hp: 0, atk: 0, def: 0, spatk: 0, spdef: 0, spd: 0 }, megaShinka: false, battleBond: false,
    marks: [], markEscolha: "", weak: {}, golpes: [{ nome: "" }, { nome: "" }, { nome: "" }, { nome: "" }], moveset: "", notas: "",
    batalhas: 0, vitorias: 0, derrotas: 0, treinou: 0, vitaminas: 0, capturas: 0, derrotou: 0, esquivou: 0,
    baseHP: 4, atributos: { strength: 1, dexterity: 1, vitality: 1, special: 1, insight: 1 },
    skills: { brawl: 0, channel: 0, clash: 0, evasion: 0, alert: 0, athletic: 0, stealth: 0, charm: 0, etiquette: 0, intimidate: 0, perform: 0, empathy: 0, nature_skill: 0 },
    tamanho: "", peso: "", lealdade: 3, lazoBatalla: "", puntosEntrenamiento: 0, accesorios: "", ranurasBolsa: ["", "", "", ""], instintoLogica: "",
    dureza: 0, carisma_concurso: 0, beleza: 0, dulzura: 0, ingenio: 0
  }), item)).filter(Boolean);

  const inventario = { ...empty.inventario, ...(val.inventario || {}) };

  return { treinador: t, time, box, inventario } as Ficha;
}

export function pdbSlug(sp: string): string {
  if (!sp) return "";
  let n = sp.trim().toLowerCase();
  const overrides: Record<string, string> = {
    "nidoran♀": "nidoran-f", "nidoran♂": "nidoran-m", "mr. mime": "mr-mime", "mr mime": "mr-mime",
    "mime jr.": "mime-jr", "mime jr": "mime-jr", "mr. rime": "mr-rime", "mr rime": "mr-rime",
    "farfetch'd": "farfetchd", "sirfetch'd": "sirfetchd", "type: null": "type-null", "type null": "type-null",
    "flabébé": "flabebe", "tapu koko": "tapu-koko", "tapu lele": "tapu-lele", "tapu bulu": "tapu-bulu",
    "tapu fini": "tapu-fini"
  };
  if (overrides[n]) return overrides[n];
  n = n.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  n = n.replace(/[♀]/g, "-f").replace(/[♂]/g, "-m");
  n = n.replace(/['.:]/g, "");
  n = n.replace(/\s+/g, "-");
  n = n.replace(/[^a-z0-9-]/g, "");
  n = n.replace(/-+/g, "-").replace(/^-|-$/g, "");
  return n;
}

export function baixarBackup9(ficha: Ficha) {
  try {
    const blob = new Blob([JSON.stringify(ficha, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const data = new Date().toISOString().slice(0, 10);
    const nome = (ficha?.treinador?.nome || "ficha").trim().replace(/[^a-z0-9\-_]+/gi, "_");
    a.href = url;
    a.download = `ficha_${nome}_${data}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err: any) {
    alert("Erro ao gerar backup: " + err.message);
  }
}

export function restaurarBackup9(file: File, onLoaded: (data: Ficha) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const val = JSON.parse(reader.result as string);
      onLoaded(normFicha9(val));
    } catch (err: any) {
      alert("Arquivo inválido ou corrompido: " + err.message);
    }
  };
  reader.onerror = () => alert("Não foi possível ler o arquivo.");
  reader.readAsText(file);
}

