import React, { useState, useEffect, useRef } from "react";
import { Ficha, Pokemon, BoxPokemon, InventarioItem } from "./types";
import {
  NATURES_DATA,
  MARKS_DATA,
  ITEMS_DATA,
  TYPES_DATA,
  PK_MOVES,
  PK_ABILITIES
} from "./data";
import {
  jr,
  pkCalc,
  normFicha9,
  baixarBackup9,
  restaurarBackup9
} from "./utils";
import {
  ActivePokemonCard,
  BoxPokemonCard,
  SoAutocomplete,
  LpItemDisplay,
  PkRoller
} from "./components/PokemonCard";
import {
  Save,
  Download,
  Upload,
  User,
  Zap,
  Box as BoxIcon,
  ShoppingBag,
  FileText,
  Plus,
  Trash2,
  Lock,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const LOCAL_STORAGE_KEY = "pokerole_ficha_local_v3";
const OLD_LOCAL_STORAGE_KEY = "zaori_ficha_local_v1";

// Default factory creators (stripped of exp / level)
const createEmptyPokemon = (): Pokemon => ({
  id: jr(),
  pronto: false,
  nome: "",
  especie: "",
  genero: "Macho",
  tipo1: "",
  tipo2: "",
  total: 500,
  nature: "",
  ivs: 31,
  teratype: "",
  pokebola: "",
  itemSegurado: "",
  felicidade: 0,
  baseStats: { hp: 0, atk: 0, def: 0, spatk: 0, spdef: 0, spd: 0 },
  habilidade: "",
  megaShinka: false,
  battleBond: false,
  marks: [],
  markEscolha: "",
  golpes: [{ nome: "" }, { nome: "" }, { nome: "" }, { nome: "" }],
  weak: {},
  batalhas: 0,
  vitorias: 0,
  derrotas: 0,
  treinou: 0,
  vitaminas: 0,
  capturas: 0,
  derrotou: 0,
  esquivou: 0,
  anotacoes: "",
  rank: "Starter",
  baseHP: 4,
  atributos: { strength: 1, dexterity: 1, vitality: 1, special: 1, insight: 1 },
  skills: {
    brawl: 0, channel: 0, clash: 0, evasion: 0, alert: 0, athletic: 0, stealth: 0,
    charm: 0, etiquette: 0, intimidate: 0, perform: 0, empathy: 0, nature_skill: 0
  },
  tamanho: "",
  peso: "",
  lealdade: 3,
  lazoBatalla: "",
  puntosEntrenamiento: 0,
  accesorios: "",
  ranurasBolsa: ["", "", "", ""],
  instintoLogica: "",
  dureza: 0,
  carisma_concurso: 0,
  beleza: 0,
  dulzura: 0,
  ingenio: 0
});

const createEmptyBoxPokemon = (): BoxPokemon => ({
  id: jr(),
  nome: "",
  especie: "",
  genero: "Macho",
  tipo1: "",
  tipo2: "",
  total: 500,
  nature: "",
  teratype: "",
  habilidade: "",
  pokebola: "",
  itemSegurado: "",
  felicidade: 0,
  ivs: 31,
  baseStats: { hp: 0, atk: 0, def: 0, spatk: 0, spdef: 0, spd: 0 },
  megaShinka: false,
  battleBond: false,
  marks: [],
  markEscolha: "",
  weak: {},
  golpes: [{ nome: "" }, { nome: "" }, { nome: "" }, { nome: "" }],
  moveset: "",
  notas: "",
  batalhas: 0,
  vitorias: 0,
  derrotas: 0,
  treinou: 0,
  vitaminas: 0,
  capturas: 0,
  derrotou: 0,
  esquivou: 0,
  baseHP: 4,
  atributos: { strength: 1, dexterity: 1, vitality: 1, special: 1, insight: 1 },
  skills: {
    brawl: 0, channel: 0, clash: 0, evasion: 0, alert: 0, athletic: 0, stealth: 0,
    charm: 0, etiquette: 0, intimidate: 0, perform: 0, empathy: 0, nature_skill: 0
  },
  tamanho: "",
  peso: "",
  lealdade: 3,
  lazoBatalla: "",
  puntosEntrenamiento: 0,
  accesorios: "",
  ranurasBolsa: ["", "", "", ""],
  instintoLogica: "",
  dureza: 0,
  carisma_concurso: 0,
  beleza: 0,
  dulzura: 0,
  ingenio: 0
});

const defaultFicha = (): Ficha => ({
  treinador: {
    nome: "",
    classe: "Treinador",
    idade: "",
    genero: "",
    rank: "Amateur",
    pokedolares: 1000,
    foto: null,
    rotomImg: null,
    atributos: { strength: 1, dexterity: 1, vitality: 1, special: 1, insight: 1 },
    skills: {
      brawl: 0, channel: 0, clash: 0, evasion: 0, alert: 0, athletic: 0, stealth: 0,
      charm: 0, etiquette: 0, intimidate: 0, perform: 0, empathy: 0, nature_skill: 0
    },
    habilidadeTreinador: { nome: "", desc: "" },
    habilidadesClasse: [{ nome: "", desc: "" }, { nome: "", desc: "" }, { nome: "", desc: "" }],
    insignias: Array(8).fill(""),
    fitas: Array(6).fill(""),
    broches: Array(8).fill(""),
    chaves: Array(6).fill(""),
    background: ""
  },
  time: [],
  box: [],
  inventario: {
    equipavel: [],
    consumivel: [],
    medicinal: [],
    berry: [],
    pokebola: [],
    extras: [],
    evolucao: []
  }
});

// Photo upload (hy) helper
function TrainerPhotoUpload({ foto, onChange }: { foto: string | null; onChange: (f: string | null) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="photo-upload" onClick={() => fileRef.current?.click()} style={{ cursor: "pointer" }}>
      {foto ? (
        <img src={foto} alt="Foto do Treinador" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div className="photo-placeholder">
          <span>📷</span>
          <span>Foto do treinador</span>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
      {foto && (
        <button
          type="button"
          className="photo-remove"
          onClick={e => {
            e.stopPropagation();
            onChange(null);
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

// Achievements collection helper (Ws)
interface AchievementsProps {
  title: string;
  items: any[];
  onChange: (list: any[]) => void;
}

function AchievementsPanel({ title, items, onChange }: AchievementsProps) {
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const getObj = (idx: number) => {
    const item = items[idx];
    return typeof item === "string" ? { texto: item, foto: null } : (item || { texto: "", foto: null });
  };

  const handleUpdate = (idx: number, patch: any) => {
    const list = [...items];
    list[idx] = { ...getObj(idx), ...patch };
    onChange(list);
  };

  return (
    <div>
      <div className="section-sub">{title}</div>
      <div className="badge-grid">
        {items.map((_, idx) => {
          const it = getObj(idx);
          return (
            <div key={idx} className={"badge-slot " + (it.foto || it.texto ? "filled" : "")} style={{ position: "relative" }}>
              {it.foto && (
                <img src={it.foto} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              <button
                type="button"
                onClick={() => inputRefs.current[idx]?.click()}
                style={{ position: "absolute", inset: 0, background: "transparent", border: "none", cursor: "pointer" }}
                title="Adicionar imagem"
              />
              <input
                ref={el => { inputRefs.current[idx] = el; }}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const rdr = new FileReader();
                    rdr.onload = () => handleUpdate(idx, { foto: rdr.result as string });
                    rdr.readAsDataURL(file);
                  }
                }}
              />
              <input
                type="text"
                value={it.texto}
                placeholder={`#${idx + 1}`}
                onChange={e => handleUpdate(idx, { texto: e.target.value })}
                style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2,
                  border: "none", background: it.foto ? "rgba(0,0,0,0.6)" : "transparent",
                  color: it.foto ? "#fff" : "inherit", textAlign: "center", fontSize: 9, fontWeight: 700
                }}
              />
              {it.foto && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleUpdate(idx, { foto: null });
                  }}
                  style={{
                    position: "absolute", top: 2, right: 2, zIndex: 3, width: 14, height: 14,
                    borderRadius: "50%", background: "#c41818", color: "#fff", border: "none",
                    fontSize: 8, padding: 0, display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Habilidades de Classe/Treinador choices
const CLASS_ABILITIES_PRESETS: Record<string, { nome: string; desc: string }[]> = {
  "Treinador": [
    { nome: "Fortíssimo", desc: "Uma única vez por batalha você pode aumentar o dano final de 1 dos seus pokémons em +5 por 1 turno." },
    { nome: "Espírito Competitivo", desc: "Quando um Pokémon seu for derrotado, o próximo Pokémon enviado recebe +3 de dano até o fim do primeiro turno." },
    { nome: "Experiência de Campo", desc: "Após vencer uma batalha oficial, escolha um Pokémon para receber 20% de bônus." },
    { nome: "Recarga Rápida", desc: "Uma vez durante um combate, pode escolher um dos movimentos e ignorar o tempo de recarga dele." }
  ],
  "Coordenador": [
    { nome: "Entrada Triunfal", desc: "O primeiro Pokémon enviado para a batalha recebe +2 no resultado final em sua primeira rolagem." },
    { nome: "Dominação de Palco", desc: "Os itens que aumentam o dano do seu Pokémon recebem um buff de +3." }
  ],
  "Especialista": [
    { nome: "Tiro Porrada e Bomba", desc: "Ataques do elemento do seu tipo favorito causam sempre +2 de dano no resultado final." }
  ],
  "Criador": [
    { nome: "Mama Is Here", desc: "Os pokémons chocados nascem com IV's perfeitas, além de bônus especiais." }
  ],
  "Estilista": [
    { nome: "Flash and Pose", desc: "Diminui em -2 a próxima rolagem de acerto do inimigo usando charme." }
  ],
  "Batalhista": [
    { nome: "Eu tô Rica! Rica!", desc: "Sempre que receber alguma quantia de dinheiro, ela será dobrada." }
  ],
  "Ranger": [
    { nome: "SPD emergency!", desc: "Uma vez por batalha ou missão oficial, ao usar um item, o item fará efeito em todos os aliados." }
  ]
};

interface HabTreinadorProps {
  key?: any;
  classe: string;
  hab: { nome: string; desc: string };
  onChange: (h: { nome: string; desc: string }) => void;
  label?: string;
}

function HabTreinadorField({ classe, hab, onChange, label }: HabTreinadorProps) {
  const presets = CLASS_ABILITIES_PRESETS[classe] || [];
  const matched = presets.find(p => p.nome === hab.nome);

  return (
    <div className="move-row">
      <div className="field" style={{ marginBottom: 6 }}>
        <label>{label || "Habilidade de Treinador"}</label>
        {presets.length > 0 && (
          <select
            value={matched ? hab.nome : ""}
            onChange={e => {
              const selected = presets.find(p => p.nome === e.target.value);
              onChange(selected ? { nome: selected.nome, desc: selected.desc } : { nome: "", desc: "" });
            }}
            style={{ marginBottom: 6 }}
          >
            <option value="">Selecione uma habilidade da classe...</option>
            {presets.map(p => <option key={p.nome} value={p.nome}>{p.nome}</option>)}
          </select>
        )}
        {(!matched || presets.length === 0) && (
          <input
            type="text"
            value={hab.nome}
            onChange={e => onChange({ ...hab, nome: e.target.value })}
            placeholder="Nome da habilidade personalizada"
          />
        )}
      </div>
      <textarea
        rows={3}
        value={hab.desc}
        onChange={e => onChange({ ...hab, desc: e.target.value })}
        placeholder="Descrição do efeito..."
      />
    </div>
  );
}

// Generate Simple HTML Printout
function triggerPdfPrint(ficha: Ficha) {
  const t = ficha.treinador;
  const insigniasHtml = t.insignias.map(item => (typeof item === "string" ? item : item?.texto)).filter(Boolean).join(", ");
  const activeTeamHtml = ficha.time.map(mon => {
    const pk = pkCalc(mon);
    return `
      <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 8px; border-radius: 6px;">
        <h3>${mon.nome || "Sem nome"} - Rank: ${mon.rank || "Starter"}</h3>
        <p><b>HP:</b> ${pk.hp} &nbsp; <b>Defesa:</b> ${pk.defesa} &nbsp; <b>Will:</b> ${pk.will}</p>
        <p><b>Habilidade:</b> ${mon.habilidade || "Nenhuma"} &nbsp; <b>Item:</b> ${mon.itemSegurado || "Nenhum"}</p>
      </div>
    `;
  }).join("");

  const win = window.open("", "_blank");
  if (!win) {
    alert("Por favor, permita popups para gerar o documento.");
    return;
  }
  win.document.write(`
    <html>
      <head>
        <title>Ficha de Treinador - ${t.nome || "Pokérole"}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; line-height: 1.5; color: #222; }
          h1 { border-bottom: 2px solid #E3350D; padding-bottom: 4px; color: #E3350D; }
          h2 { border-bottom: 1px solid #ccc; padding-bottom: 2px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Ficha de Treinador - Pokérole 3.0</h1>
        <p><b>Nome:</b> ${t.nome || "Sem nome"} &nbsp; <b>Classe:</b> ${t.classe} &nbsp; <b>Rank:</b> ${t.rank}</p>
        <p><b>Idade:</b> ${t.idade || "—"} &nbsp; <b>Gênero:</b> ${t.genero || "—"} &nbsp; <b>Carteira:</b> ${t.pokedolares}⪧</p>
        <h2>Habilidades</h2>
        <p><b>${t.habilidadeTreinador.nome || "Sem nome"}:</b> ${t.habilidadeTreinador.desc || "Sem descrição."}</p>
        <h2>Insígnias</h2>
        <p>${insigniasHtml || "Nenhuma registrada."}</p>
        <h2>Time Ativo</h2>
        ${activeTeamHtml || "<p>Nenhum Pokémon ativo no time.</p>"}
      </body>
    </html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

// MAIN COMPONENT
export default function App() {
  const [ficha, setFicha] = useState<Ficha>(() => {
    try {
      let raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) {
        raw = localStorage.getItem(OLD_LOCAL_STORAGE_KEY);
      }
      if (raw) return normFicha9(JSON.parse(raw));
    } catch (err) {}
    return defaultFicha();
  });

  const [tab, setTab] = useState("treinador");
  const [saveState, setSaveState] = useState("salvo");
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto save to local storage
  useEffect(() => {
    setSaveState("pendente");
    const tid = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ficha));
        setSaveState("salvo");
      } catch (err) {
        setSaveState("erro");
      }
    }, 1000);
    return () => clearTimeout(tid);
  }, [ficha]);

  const updateTrainer = (field: string, val: any) => {
    setFicha(prev => {
      const f = JSON.parse(JSON.stringify(prev));
      const parts = field.split(".");
      let target = f.treinador;
      for (let i = 0; i < parts.length - 1; i++) {
        target = target[parts[i]];
      }
      target[parts[parts.length - 1]] = val;
      return f;
    });
  };

  const updateActivePokemon = (id: string, patch: Partial<Pokemon>) => {
    setFicha(prev => ({
      ...prev,
      time: prev.time.map(mon => mon.id === id ? { ...mon, ...patch } : mon)
    }));
  };

  const removeActivePokemon = (id: string) => {
    if (confirm("Deseja mesmo excluir este Pokémon do time?")) {
      setFicha(prev => ({
        ...prev,
        time: prev.time.filter(mon => mon.id !== id)
      }));
    }
  };

  const moveActiveToBox = (id: string) => {
    const active = ficha.time.find(mon => mon.id === id);
    if (!active) return;
    const boxMon: BoxPokemon = {
      ...createEmptyBoxPokemon(),
      nome: active.nome,
      especie: active.nome,
      genero: active.genero,
      tipo1: active.tipo1,
      tipo2: active.tipo2,
      total: active.total,
      nature: active.nature,
      teratype: active.teratype,
      habilidade: active.habilidade,
      pokebola: active.pokebola,
      itemSegurado: active.itemSegurado,
      felicidade: active.felicidade,
      ivs: active.ivs,
      baseStats: { ...active.baseStats },
      megaShinka: active.megaShinka,
      battleBond: active.battleBond,
      marks: [...active.marks],
      markEscolha: active.markEscolha,
      weak: { ...active.weak },
      golpes: active.golpes.map(g => ({ ...g })),
      notas: active.anotacoes,
      baseHP: active.baseHP,
      atributos: { ...active.atributos },
      skills: { ...active.skills }
    };

    setFicha(prev => ({
      ...prev,
      box: [...prev.box, boxMon],
      time: prev.time.filter(mon => mon.id !== id)
    }));
  };

  const moveAllActiveToBox = () => {
    if (ficha.time.length === 0) return;
    if (confirm("Deseja mesmo mover TODOS os Pokémon do time ativo para a Box?")) {
      setFicha(prev => {
        const newBox = [...prev.box];
        prev.time.forEach(active => {
          const boxMon: BoxPokemon = {
            ...createEmptyBoxPokemon(),
            nome: active.nome,
            especie: active.especie,
            genero: active.genero,
            tipo1: active.tipo1,
            tipo2: active.tipo2,
            total: active.total,
            nature: active.nature,
            teratype: active.teratype,
            habilidade: active.habilidade,
            pokebola: active.pokebola,
            itemSegurado: active.itemSegurado,
            felicidade: active.felicidade,
            ivs: active.ivs,
            baseStats: { ...active.baseStats },
            megaShinka: active.megaShinka,
            battleBond: active.battleBond,
            marks: [...active.marks],
            markEscolha: active.markEscolha,
            weak: { ...active.weak },
            golpes: active.golpes.map(g => ({ ...g })),
            notas: active.anotacoes,
            baseHP: active.baseHP,
            atributos: { ...active.atributos },
            skills: { ...active.skills }
          };
          newBox.push(boxMon);
        });
        return {
          ...prev,
          box: newBox,
          time: []
        };
      });
    }
  };

  const moveBoxToActive = (id: string) => {
    if (ficha.time.length >= 6) {
      alert("Seu time ativo já está cheio!");
      return;
    }
    const boxMon = ficha.box.find(mon => mon.id === id);
    if (!boxMon) return;

    const activeMon: Pokemon = {
      ...createEmptyPokemon(),
      nome: boxMon.nome,
      genero: boxMon.genero,
      tipo1: boxMon.tipo1,
      tipo2: boxMon.tipo2,
      total: boxMon.total,
      nature: boxMon.nature,
      teratype: boxMon.teratype,
      habilidade: boxMon.habilidade,
      pokebola: boxMon.pokebola,
      itemSegurado: boxMon.itemSegurado,
      felicidade: boxMon.felicidade,
      ivs: boxMon.ivs,
      baseStats: { ...boxMon.baseStats },
      megaShinka: boxMon.megaShinka,
      battleBond: boxMon.battleBond,
      marks: [...boxMon.marks],
      markEscolha: boxMon.markEscolha,
      weak: { ...boxMon.weak },
      golpes: boxMon.golpes.map(g => ({ ...g })),
      anotacoes: boxMon.notas,
      baseHP: boxMon.baseHP ?? 4,
      atributos: boxMon.atributos ? { ...boxMon.atributos } : { strength: 1, dexterity: 1, vitality: 1, special: 1, insight: 1 },
      skills: boxMon.skills ? { ...boxMon.skills } : {
        brawl: 0, channel: 0, clash: 0, evasion: 0, alert: 0, athletic: 0, stealth: 0,
        charm: 0, etiquette: 0, intimidate: 0, perform: 0, empathy: 0, nature_skill: 0
      }
    };

    setFicha(prev => ({
      ...prev,
      time: [...prev.time, activeMon],
      box: prev.box.filter(mon => mon.id !== id)
    }));
  };

  const updateBoxPokemon = (id: string, patch: Partial<BoxPokemon>) => {
    setFicha(prev => ({
      ...prev,
      box: prev.box.map(mon => mon.id === id ? { ...mon, ...patch } : mon)
    }));
  };

  const removeBoxPokemon = (id: string) => {
    if (confirm("Deseja remover este Pokémon da Box?")) {
      setFicha(prev => ({
        ...prev,
        box: prev.box.filter(mon => mon.id !== id)
      }));
    }
  };

  // Inventory logic
  const updateInventoryCategory = (catKey: string, rows: InventarioItem[]) => {
    setFicha(prev => ({
      ...prev,
      inventario: {
        ...prev.inventario,
        [catKey]: rows
      }
    }));
  };

  const handleBackup = () => {
    baixarBackup9(ficha);
  };

  const handleRestoreClick = () => {
    fileRef.current?.click();
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      restaurarBackup9(file, data => {
        if (confirm("Isso irá substituir todos os dados atuais pela cópia de segurança. Deseja continuar?")) {
          setFicha(data);
        }
      });
    }
    e.target.value = "";
  };

  const totalActiveProntos = ficha.time.filter(mon => mon.pronto).length;

  return (
    <div className="app-shell">
      {/* Pokédex Mechanical Hinge */}
      <div className="dex-hinge-decor" />

      {/* POKEDEX HEADER */}
      <div className="dex-header">
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="dex-lens-bezel">
            <div className="dex-lens" />
          </div>
          <div className="dex-dots">
            <div className="dex-dot r" />
            <div className="dex-dot y" />
            <div className="dex-dot g" />
          </div>
        </div>
        <div className="dex-title" style={{ marginLeft: 8 }}>
          <h1>Ficha Pokérole 3.0</h1>
          <p>Ficha de Personagem — RPG</p>
        </div>

        {/* Backups & State */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: "auto", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: saveState === "salvo" ? "#9FD6C8" : "#FFD166" }}>
            {saveState === "salvo" ? "✓ Salvo" : "⏳ Salvando..."}
          </span>
          <button type="button" className="btn-ghost" style={{ fontSize: 11 }} onClick={handleBackup}>
            <Download size={11} style={{ marginRight: 3 }} /> Backup
          </button>
          <button type="button" className="btn-ghost" style={{ fontSize: 11 }} onClick={handleRestoreClick}>
            <Upload size={11} style={{ marginRight: 3 }} /> Restaurar
          </button>
          <input ref={fileRef} type="file" accept="application/json" style={{ display: "none" }} onChange={handleFileRestore} />
        </div>
      </div>

      {/* TABS */}
      <div className="tabbar">
        <button className={"tab-btn " + (tab === "treinador" ? "active" : "")} onClick={() => setTab("treinador")}>
          <User size={13} style={{ marginRight: 4 }} /> Treinador
        </button>
        <button className={"tab-btn " + (tab === "time" ? "active" : "")} onClick={() => setTab("time")}>
          <Zap size={13} style={{ marginRight: 4 }} /> Time ({ficha.time.length}/6)
        </button>
        <button className={"tab-btn " + (tab === "box" ? "active" : "")} onClick={() => setTab("box")}>
          <BoxIcon size={13} style={{ marginRight: 4 }} /> Box ({ficha.box.length})
        </button>
        <button className={"tab-btn " + (tab === "inventario" ? "active" : "")} onClick={() => setTab("inventario")}>
          <ShoppingBag size={13} style={{ marginRight: 4 }} /> Inventário
        </button>
        <button type="button" className="tab-btn" style={{ marginLeft: "auto" }} onClick={() => triggerPdfPrint(ficha)}>
          <FileText size={13} style={{ marginRight: 4 }} /> PDF
        </button>
      </div>

      {/* TAB CONTENT: TRAINER */}
      {tab === "treinador" && (
        <div>
          <div className="card">
            <div className="card-header">
              <div className="bar" />
              <h2>Dados do Treinador</h2>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap" }}>
              <TrainerPhotoUpload foto={ficha.treinador.foto} onChange={val => updateTrainer("foto", val)} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div className="field">
                  <label>Nome</label>
                  <input
                    type="text"
                    value={ficha.treinador.nome}
                    onChange={e => updateTrainer("nome", e.target.value)}
                    placeholder="Nome do personagem"
                  />
                </div>
                <div className="grid grid-2">
                  <div className="field">
                    <label>Idade</label>
                    <input type="text" value={ficha.treinador.idade} onChange={e => updateTrainer("idade", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Gênero</label>
                    <input type="text" value={ficha.treinador.genero} onChange={e => updateTrainer("genero", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="field">
              <label>Classe</label>
              <select value={ficha.treinador.classe} onChange={e => updateTrainer("classe", e.target.value)}>
                <option value="Treinador">Treinador</option>
                <option value="Coordenador">Coordenador</option>
                <option value="Especialista">Especialista</option>
                <option value="Criador">Criador</option>
                <option value="Estilista">Estilista</option>
                <option value="Batalhista">Batalhista</option>
                <option value="Ranger">Ranger</option>
              </select>
            </div>

            <div className="grid grid-2">
              <div className="field">
                <label>Rank</label>
                <select value={ficha.treinador.rank} onChange={e => updateTrainer("rank", e.target.value)}>
                  <option value="Amateur">Amateur</option>
                  <option value="Rookie">Rookie</option>
                  <option value="Veteran">Veteran</option>
                  <option value="Ace">Ace</option>
                  <option value="Elite">Elite</option>
                  <option value="Champion">Champion</option>
                </select>
              </div>
              <div className="field">
                <label>Pokédólares</label>
                <input
                  type="number"
                  value={ficha.treinador.pokedolares}
                  onChange={e => updateTrainer("pokedolares", Number(e.target.value) || 0)}
                />
              </div>
              {/* EXP Share field completely removed */}
            </div>

            <div className="section-sub">Atributos Pokérole 3.0</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
              {[
                { key: "strength", label: "Força" },
                { key: "dexterity", label: "Destreza" },
                { key: "vitality", label: "Vitalidade" },
                { key: "special", label: "Especial" },
                { key: "insight", label: "Insight" }
              ].map(({ key, label }) => (
                <div className="stat-pill" key={key}>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    style={{ textAlign: "center", fontWeight: 900, fontSize: 16, border: "none", padding: 0 }}
                    value={ficha.treinador.atributos[key as keyof typeof ficha.treinador.atributos] ?? 1}
                    onChange={e => updateTrainer(`atributos.${key}`, Number(e.target.value) || 1)}
                  />
                  <div className="l">{label.toUpperCase()}</div>
                </div>
              ))}
            </div>

            <div className="section-sub">Status Derivados do Treinador</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
              <div className="stat-pill">
                <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>
                  {5 + (Number(ficha.treinador.atributos.vitality) || 1)}
                </div>
                <div className="l" style={{ fontSize: 9 }}>HP</div>
              </div>
              <div className="stat-pill">
                <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>
                  {(Number(ficha.treinador.atributos.vitality) || 1) + (Number(ficha.treinador.skills?.clash) || 0)}
                </div>
                <div className="l" style={{ fontSize: 9 }}>Defesa</div>
              </div>
              <div className="stat-pill">
                <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>
                  {(Number(ficha.treinador.atributos.special) || 1) + (Number(ficha.treinador.skills?.channel) || 0)}
                </div>
                <div className="l" style={{ fontSize: 9 }}>Sp.Def</div>
              </div>
              <div className="stat-pill">
                <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>
                  {(Number(ficha.treinador.atributos.special) || 1) + (Number(ficha.treinador.atributos.insight) || 1)}
                </div>
                <div className="l" style={{ fontSize: 9 }}>Will</div>
              </div>
              <div className="stat-pill">
                <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>
                  {(Number(ficha.treinador.atributos.dexterity) || 1) + (Number(ficha.treinador.skills?.alert) || 0)}
                </div>
                <div className="l" style={{ fontSize: 9 }}>Inic.</div>
              </div>
              <div className="stat-pill">
                <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>
                  {(Number(ficha.treinador.atributos.dexterity) || 1) + (Number(ficha.treinador.skills?.evasion) || 0)}
                </div>
                <div className="l" style={{ fontSize: 9 }}>Evasão</div>
              </div>
              <div className="stat-pill">
                <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>
                  {(Number(ficha.treinador.atributos.strength) || 1) + (Number(ficha.treinador.skills?.clash) || 0)}
                </div>
                <div className="l" style={{ fontSize: 9 }}>Choque</div>
              </div>
            </div>

            <div className="section-sub">Skills do Treinador (0—5)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
              {[
                { key: "brawl", label: "Luta" },
                { key: "channel", label: "Canalizar" },
                { key: "clash", label: "Chocar" },
                { key: "evasion", label: "Evasão" },
                { key: "alert", label: "Alerta" },
                { key: "athletic", label: "Atletismo" },
                { key: "stealth", label: "Furtividade" },
                { key: "charm", label: "Charme" },
                { key: "etiquette", label: "Etiqueta" },
                { key: "intimidate", label: "Intimidação" },
                { key: "perform", label: "Performance" },
                { key: "empathy", label: "Empatia" },
                { key: "nature_skill", label: "Natureza" }
              ].map(({ key, label }) => (
                <div className="stat-pill" key={key}>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    style={{ textAlign: "center", border: "none", padding: 0, fontWeight: 700, fontSize: 13 }}
                    value={ficha.treinador.skills?.[key as keyof typeof ficha.treinador.skills] ?? 0}
                    onChange={e => updateTrainer(`skills.${key}`, Number(e.target.value) || 0)}
                  />
                  <div className="l" style={{ fontSize: 9 }}>{label.toUpperCase()}</div>
                </div>
              ))}
            </div>

            <div className="section-sub">Rolador de Dados do Treinador</div>
            <PkRoller atributos={ficha.treinador.atributos} skills={ficha.treinador.skills} />
          </div>

          <div className="card">
            <div className="card-header">
              <div className="bar" />
              <h2>Habilidades do Treinador</h2>
            </div>
            <HabTreinadorField
              classe={ficha.treinador.classe}
              hab={ficha.treinador.habilidadeTreinador}
              onChange={val => updateTrainer("habilidadeTreinador", val)}
              label="Habilidade Principal"
            />
            {ficha.treinador.habilidadesClasse.map((h, idx) => (
              <HabTreinadorField
                key={idx}
                classe={ficha.treinador.classe}
                hab={h}
                onChange={val => {
                  const arr = [...ficha.treinador.habilidadesClasse];
                  arr[idx] = val;
                  updateTrainer("habilidadesClasse", arr);
                }}
                label={`Habilidade Secundária ${idx + 1} — ${["Intermediate", "Expert", "Elite"][idx]}`}
              />
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <div className="bar" />
              <h2>Conquistas</h2>
            </div>
            <div className="grid grid-2">
              <AchievementsPanel title="🏆 Insígnias" items={ficha.treinador.insignias} onChange={val => updateTrainer("insignias", val)} />
              <AchievementsPanel title="🎗️ Fitas" items={ficha.treinador.fitas} onChange={val => updateTrainer("fitas", val)} />
            </div>
            <div className="grid grid-2" style={{ marginTop: 10 }}>
              <AchievementsPanel title="🏵️ Broches" items={ficha.treinador.broches} onChange={val => updateTrainer("broches", val)} />
              <AchievementsPanel title="🔑 Chaves" items={ficha.treinador.chaves} onChange={val => updateTrainer("chaves", val)} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="bar" />
              <h2>Histórico / Background</h2>
            </div>
            <textarea
              rows={5}
              value={ficha.treinador.background}
              onChange={e => updateTrainer("background", e.target.value)}
              placeholder="Escreva a história do seu treinador, conquistas especiais..."
            />
          </div>
        </div>
      )}

      {/* TAB CONTENT: ACTIVE TEAM */}
      {tab === "time" && (
        <div>
          <div className="card">
            <div className="card-header">
              <div className="bar" />
              <h2>Time Ativo ({ficha.time.length} de 6)</h2>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              {ficha.time.length < 6 && (
                <button type="button" className="btn-pd" onClick={() => setFicha(prev => ({ ...prev, time: [...prev.time, createEmptyPokemon()] }))}>
                  + Adicionar ao Time
                </button>
              )}
              {ficha.time.length > 0 && (
                <>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={moveAllActiveToBox}
                    style={{
                      background: "linear-gradient(180deg, #4b5563, #1f2937)",
                      borderColor: "#4b5563"
                    }}
                  >
                    <BoxIcon size={13} style={{ marginRight: 4 }} /> Enviar Todos para Box
                  </button>
                  <button
                    type="button"
                    className="btn-ghost animate-pulse"
                    onClick={() => {
                      if (confirm("⚠️ Deseja mesmo EXCLUIR permanentemente TODOS os Pokémon do time ativo?")) {
                        setFicha(prev => ({ ...prev, time: [] }));
                      }
                    }}
                    style={{
                      background: "linear-gradient(180deg, #ef4444, #991b1b)",
                      borderColor: "#ef4444",
                      color: "#ffffff",
                      boxShadow: "0 3px 0 #7f1d1d, inset 0 1px 0 rgba(255,255,255,0.3)"
                    }}
                  >
                    <Trash2 size={13} style={{ marginRight: 4 }} /> Esvaziar Time (Excluir)
                  </button>
                </>
              )}
            </div>

            {ficha.time.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum Pokémon ativo no time ainda.</p>
              </div>
            ) : (
              ficha.time.map(mon => (
                <ActivePokemonCard
                  key={mon.id}
                  mon={mon}
                  onUpdate={patch => updateActivePokemon(mon.id, patch)}
                  onRemove={() => removeActivePokemon(mon.id)}
                  onMoveToBox={() => moveActiveToBox(mon.id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: BOX */}
      {tab === "box" && (
        <div>
          <div className="card">
            <div className="card-header">
              <div className="bar" />
              <h2>Box Pokémon ({ficha.box.length})</h2>
            </div>
            <button type="button" className="btn-pd" onClick={() => setFicha(prev => ({ ...prev, box: [...prev.box, createEmptyBoxPokemon()] }))}>
              + Adicionar à Box
            </button>

            {ficha.box.length === 0 ? (
              <div className="empty-state">
                <p>Box vazia.</p>
              </div>
            ) : (
              ficha.box.map(mon => (
                <BoxPokemonCard
                  key={mon.id}
                  mon={mon}
                  onUpdate={patch => updateBoxPokemon(mon.id, patch)}
                  onRemove={() => removeBoxPokemon(mon.id)}
                  onMoveToTeam={() => moveBoxToActive(mon.id)}
                  canMoveToTeam={ficha.time.length < 6}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: INVENTORY */}
      {tab === "inventario" && (
        <div>
          {/* Subtotal */}
          <div className="card">
            <div className="card-header">
              <div className="bar" />
              <h2>Inventário</h2>
            </div>
            <p style={{ fontSize: 13, color: "#6b6354" }}>Gerencie os itens do seu treinador por categoria.</p>
          </div>

          {[
            { key: "equipavel", label: "Equipável", icon: "🛡️", cat: "Equipável" },
            { key: "consumivel", label: "Consumível", icon: "🧪", cat: "Consumivel" },
            { key: "medicinal", label: "Medicinal", icon: "💊", cat: "Medicinal" },
            { key: "berry", label: "Berry", icon: "🍓", cat: "Berry" },
            { key: "pokebola", label: "Pokébola", icon: "🔴", cat: "Pokébola" },
            { key: "extras", label: "Extras", icon: "💎", cat: "Extras" },
            { key: "evolucao", label: "Evolução", icon: "✨", cat: "Evolução" }
          ].map(c => {
            const list = ficha.inventario[c.key] || [];
            return (
              <div className="card" key={c.key}>
                <div className="card-header">
                  <div className="bar" />
                  <h2>{c.icon} {c.label} ({list.length})</h2>
                </div>
                {list.length === 0 ? (
                  <p style={{ fontSize: 11, color: "#8a8270", padding: "10px 0" }}>Nenhum item nesta categoria.</p>
                ) : (
                  list.map((it, idx) => (
                    <div key={it.id} className="move-row" style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ flex: 1 }}>
                        <SoAutocomplete
                          value={it.nome}
                          options={ITEMS_DATA.filter(item => item.cat === c.cat)}
                          getLabel={item => item.name}
                          getSub={item => item.desc || ""}
                          placeholder="Buscar item..."
                          onChange={val => {
                            const arr = [...list];
                            arr[idx].nome = val;
                            updateInventoryCategory(c.key, arr);
                          }}
                          onPick={item => {
                            const arr = [...list];
                            arr[idx].nome = item.name;
                            updateInventoryCategory(c.key, arr);
                          }}
                        />
                        <LpItemDisplay name={it.nome} />
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input
                          type="number"
                          value={it.qtd}
                          onChange={e => {
                            const arr = [...list];
                            arr[idx].qtd = Number(e.target.value) || 1;
                            updateInventoryCategory(c.key, arr);
                          }}
                          style={{ width: 60 }}
                        />
                        <button
                          type="button"
                          className="btn-icon danger"
                          onClick={() => {
                            if (confirm("Remover este item?")) {
                              updateInventoryCategory(c.key, list.filter(row => row.id !== it.id));
                            }
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => updateInventoryCategory(c.key, [...list, { id: jr(), nome: "", qtd: 1 }])}
                >
                  + Adicionar {c.label}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
