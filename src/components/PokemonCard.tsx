import React, { useState, useRef, useEffect } from "react";
import { Pokemon, BoxPokemon, PokemonGolpe } from "../types";
import { MARKS_DATA, NATURES_DATA, TYPES_DATA, ITEMS_DATA, PK_MOVES, PK_ABILITIES } from "../data";
import { pkCalc, rollPool, jr, encMon9, dy } from "../utils";
import { Shield, Sparkles, BookOpen, Trash2, ArrowUpCircle, CheckCircle2, ChevronUp, ChevronDown } from "lucide-react";

// Autocomplete Component
interface AutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  options: any[];
  getLabel: (item: any) => string;
  getSub?: (item: any) => string;
  placeholder?: string;
  onPick: (item: any) => void;
}

export function SoAutocomplete({ value, onChange, options, getLabel, getSub, placeholder, onPick }: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filtered = options.filter(item =>
    getLabel(item).toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="autocomplete-wrap" ref={listRef}>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={e => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && filtered.length > 0 && (
        <div className="autocomplete-list">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="autocomplete-item"
              onMouseDown={() => {
                onPick(item);
                setQuery(getLabel(item));
                setIsOpen(false);
              }}
            >
              {getLabel(item)}
              {getSub && <small>{getSub(item)}</small>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Item display helper
export function LpItemDisplay({ name }: { name: string }) {
  const item = ITEMS_DATA.find(i => i.name === name);
  if (!item) return null;
  return (
    <React.Fragment>
      <div className="move-meta" style={{ marginTop: 4 }}>
        {item.img && (
          <img
            src={item.img}
            style={{ width: 26, height: 26, objectFit: "contain" }}
            onError={e => { (e.target as HTMLElement).style.display = "none"; }}
            alt=""
          />
        )}
        {item.cat && <span className="type-chip" style={{ background: "#888" }}>{item.cat}</span>}
        {item.rarity && <span className="type-chip" style={{ background: "#5A8EA2" }}>{item.rarity}</span>}
        {item.price !== "" && <span><b>Preço:</b> {item.price}⪧</span>}
        {item.sell !== "" && <span><b>Venda:</b> {item.sell}⪧</span>}
      </div>
      {item.desc && <div className="move-effect" style={{ marginTop: 4 }}>{item.desc}</div>}
    </React.Fragment>
  );
}

// Pokérole Move Row
export function PkMoveRow({ move, atributos, skills }: { move: any; atributos: any; skills: any }) {
  const [accRes, setAccRes] = useState<any>(null);
  const [dmgRes, setDmgRes] = useState<any>(null);

  const accPool = (Number(atributos?.[move.acc1]) || 0) + (Number(skills?.[move.acc2]) || 0);
  const dmgPool = move.dmg1 ? (Number(atributos?.[move.dmg1]) || 0) + (Number(move.power) || 0) : 0;

  const typeColor = "#3E9DDB"; // Placeholder or imported colors
  const moveCatColor = "#CE4269";

  return (
    <div className="move-row" style={{ marginTop: 6, padding: 8, background: "#161b22", borderRadius: 8, border: "1px solid #30363d" }}>
      <div className="move-meta" style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", fontSize: 11, color: "#c9d1d9" }}>
        <b style={{ color: "#58a6ff" }}>{move.name}</b>
        <span className="type-chip" style={{ background: "#30363d" }}>{move.type}</span>
        <span className="type-chip" style={{ background: "#8b949e", color: "#0d1117" }}>{move.dmgType}</span>
        <span>Acc: {move.acc1}+{move.acc2} ({accPool}d6)</span>
        {move.dmg1 && <span>Dano: {move.dmg1}+Poder {move.power} ({dmgPool}d6)</span>}
      </div>
      {move.effect && <div className="move-effect" style={{ fontSize: 11, color: "#8b949e", marginTop: 4 }}>{move.effect}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
        <button
          type="button"
          className="btn-ghost"
          style={{ fontSize: 10, padding: "4px 8px" }}
          onClick={() => setAccRes(rollPool(accPool))}
        >
          🎯 Acurácia
        </button>
        {accRes && (
          <span style={{ fontSize: 11, fontWeight: 800, color: "#58a6ff" }}>
            {accRes.sucessos} sucesso{accRes.sucessos === 1 ? "" : "s"}
          </span>
        )}
        {move.dmg1 && (
          <button
            type="button"
            className="btn-ghost"
            style={{ fontSize: 10, padding: "4px 8px" }}
            onClick={() => setDmgRes(rollPool(dmgPool))}
          >
            💥 Dano
          </button>
        )}
        {dmgRes && (
          <span style={{ fontSize: 11, fontWeight: 800, color: "#f85149" }}>
            {dmgRes.sucessos} sucesso{dmgRes.sucessos === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </div>
  );
}

// Pokérole Roller
export function PkRoller({ atributos, skills }: { atributos: any; skills: any }) {
  const [a1, setA1] = useState("strength");
  const [s1, setS1] = useState("");
  const [extra, setExtra] = useState(0);
  const [res, setRes] = useState<any>(null);

  const pool = (Number(atributos?.[a1]) || 0) + (s1 ? Number(skills?.[s1]) || 0 : 0) + Number(extra);

  return (
    <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 10, padding: 10, marginTop: 6 }}>
      <div className="grid grid-3">
        <div className="field">
          <label>Atributo</label>
          <select value={a1} onChange={e => setA1(e.target.value)}>
            <option value="strength">Strength</option>
            <option value="dexterity">Dexterity</option>
            <option value="vitality">Vitality</option>
            <option value="special">Special</option>
            <option value="insight">Insight</option>
          </select>
        </div>
        <div className="field">
          <label>Skill</label>
          <select value={s1} onChange={e => setS1(e.target.value)}>
            <option value="">—</option>
            <option value="brawl">Brawl</option>
            <option value="channel">Channel</option>
            <option value="clash">Clash</option>
            <option value="evasion">Evasion</option>
            <option value="alert">Alert</option>
            <option value="athletic">Athletic</option>
            <option value="stealth">Stealth</option>
            <option value="charm">Charm</option>
            <option value="etiquette">Etiquette</option>
            <option value="intimidate">Intimidate</option>
            <option value="perform">Perform</option>
            <option value="empathy">Empathy</option>
            <option value="nature_skill">Nature</option>
          </select>
        </div>
        <div className="field">
          <label>Dados extras</label>
          <input type="number" value={extra} onChange={e => setExtra(Number(e.target.value) || 0)} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
        <span style={{ fontSize: 11, color: "#8b949e", fontWeight: 700 }}>Pool: {pool}d6</span>
        <button type="button" className="btn-pd" style={{ fontSize: 11, padding: "5px 12px" }} onClick={() => setRes(rollPool(pool))}>
          🎲 Rolar
        </button>
      </div>
      {res && (
        <div style={{ marginTop: 6, fontSize: 13 }}>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {res.dice.map((d: number, i: number) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  width: 22,
                  height: 22,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 5,
                  fontWeight: 800,
                  fontSize: 12,
                  background: d >= 4 ? "#238636" : "#21262d",
                  color: d >= 4 ? "#fff" : "#8b949e"
                }}
              >
                {d}
              </span>
            ))}
          </div>
          <div style={{ fontWeight: 800, marginTop: 4, color: "#58a6ff" }}>
            {res.sucessos} sucesso{res.sucessos === 1 ? "" : "s"}
          </div>
        </div>
      )}
    </div>
  );
}

// Import Modal
export function ImportModal({ onClose, onApply }: { onClose: () => void; onApply: (patch: any, note?: string) => void }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);

  const analyze = () => {
    if (!text.trim()) return;
    const res = dy(text);
    setResult(res);
  };

  const apply = () => {
    if (!result) return;
    const { _importNote, ...patch } = result.patch;
    onApply(patch, _importNote);
    onClose();
  };

  return (
    <div className="modal-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-head">
          <h3>📋 Colar Pokémon do Bot</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Cole o texto do bot do Discord:</label>
            <textarea
              rows={8}
              value={text}
              onChange={e => {
                setText(e.target.value);
                setResult(null);
              }}
              placeholder="Ex: Pokémon Nincada ♀..."
            />
          </div>
          {!result && (
            <button className="btn-pd" style={{ width: "100%" }} onClick={analyze}>
              Analisar texto
            </button>
          )}
          {result && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#2E6F95" }}>
                ✅ Encontrado: {result.found.join(", ") || "nada"}
              </p>
              {result.missing.length > 0 && (
                <p style={{ fontSize: 12, fontWeight: 700, color: "#b5462b" }}>
                  ⚠️ Não encontrado: {result.missing.join(", ")}
                </p>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="btn-pd" style={{ flex: 1 }} onClick={apply}>
                  Aplicar ao Pokémon
                </button>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setResult(null)}>
                  Analisar novamente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export Modal
export function ExportModal({ mon, onClose }: { mon: any; onClose: () => void }) {
  const code = encMon9(mon);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {}
  };

  return (
    <div className="modal-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-head">
          <h3>📤 Exportar {mon.nome || "Pokémon"}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 12, color: "#6b6354", marginBottom: 8 }}>
            Copie o código abaixo e use o botão Importar em outra ficha.
          </p>
          <textarea
            rows={6}
            readOnly
            value={code}
            onFocus={e => e.target.select()}
            style={{ fontFamily: "monospace", fontSize: 10 }}
          />
          <button type="button" className="btn-pd" style={{ width: "100%", marginTop: 10 }} onClick={copy}>
            {copied ? "✅ Copiado!" : "📋 Copiar código"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Dynamic image fetcher component
export function PokeImage({ name, className }: { name: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    const cleanName = (name || "").trim();
    if (!cleanName) {
      setSrc(null);
      setLoading(false);
      return;
    }
    const slug = cleanName.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/♀/g, "-f")
      .replace(/♂/g, "-m")
      .replace(/[.':]/g, "")
      .replace(/\s+/g, "-");

    const cached = (window as any).__POKE_IMG_CACHE?.[slug];
    if (cached) {
      setSrc(cached);
      return;
    }

    setLoading(true);
    const tid = setTimeout(() => {
      fetch("https://pokeapi.co/api/v2/pokemon/" + slug)
        .then(res => (res.ok ? res.json() : Promise.reject()))
        .then(data => {
          if (!alive) return;
          const url = data?.sprites?.other?.["official-artwork"]?.front_default ||
            data?.sprites?.front_default ||
            "https://img.pokemondb.net/artwork/" + slug + ".jpg";
          (window as any).__POKE_IMG_CACHE = (window as any).__POKE_IMG_CACHE || {};
          (window as any).__POKE_IMG_CACHE[slug] = url;
          setSrc(url);
        })
        .catch(() => {
          if (!alive) return;
          const url = "https://img.pokemondb.net/artwork/" + slug + ".jpg";
          (window as any).__POKE_IMG_CACHE = (window as any).__POKE_IMG_CACHE || {};
          (window as any).__POKE_IMG_CACHE[slug] = url;
          setSrc(url);
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    }, 500);

    return () => {
      alive = false;
      clearTimeout(tid);
    };
  }, [name]);

  if (src) {
    return <img className={className || ""} src={src} alt={name} referrerPolicy="no-referrer" />;
  }
  if (loading) {
    return <div className={"img-loading " + (className || "")}>...</div>;
  }
  return null;
}

// Active Pokémon Card Component
export function ActivePokemonCard({
  mon,
  onUpdate,
  onRemove,
  onMoveToBox
}: {
  key?: any;
  mon: Pokemon;
  onUpdate: (patch: Partial<Pokemon>) => void;
  onRemove: () => void;
  onMoveToBox: () => void;
}) {
  const isExpanded = mon.expanded === true;
  const toggleExpand = () => onUpdate({ expanded: !isExpanded });

  const [botOpen, setBotOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [tab, setTab] = useState("perfil");

  const pk = pkCalc(mon);

  const handleBaseStatChange = (stat: string, val: string) => {
    onUpdate({
      baseStats: {
        ...mon.baseStats,
        [stat]: val === "" ? "" : Number(val) || 0
      }
    });
  };

  const handleGolpeChange = (idx: number, patch: Partial<PokemonGolpe>) => {
    const list = [...mon.golpes];
    list[idx] = { ...list[idx], ...patch };
    onUpdate({ golpes: list });
  };

  const handleToggleMark = (markName: string) => {
    let list = mon.marks || [];
    if (list.includes(markName)) {
      list = list.filter(m => m !== markName);
    } else if (list.length < 6) {
      list = [...list, markName];
    }
    onUpdate({ marks: list });
  };

  const handleWeaknessChange = (type: string, val: string) => {
    onUpdate({
      weak: {
        ...mon.weak,
        [type]: val
      }
    });
  };

  const handleBotImportApply = (patch: any, note?: string) => {
    const updated = { ...patch };
    if (note) {
      updated.anotacoes = (mon.anotacoes ? mon.anotacoes + "\n" : "") + note;
    }
    onUpdate(updated);
  };

  const statFields = ["hp", "atk", "def", "spatk", "spdef", "spd"];
  const bstTotal = statFields.reduce((sum, f) => sum + (Number(mon.baseStats[f as keyof typeof mon.baseStats]) || 0), 0);

  const statsReg = ["batalhas", "vitorias", "derrotas", "treinou", "vitaminas", "capturas", "derrotou", "esquivou"];

  return (
    <React.Fragment>
      <div className={"mon-card" + (mon.pronto ? " ready-outline" : "")}>
        <div className="mon-head" onClick={toggleExpand}>
          <div className="mon-img-wrap">
            <PokeImage name={mon.especie || mon.nome} />
          </div>
          <div className="mon-head-info">
            <input
              type="text"
              style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "2px solid rgba(255,255,255,0.2)", fontWeight: 800, fontSize: 15 }}
              value={mon.nome}
              onClick={e => e.stopPropagation()}
              onChange={e => onUpdate({ nome: e.target.value })}
              placeholder="Nome do Pokémon"
            />
            <div className="mon-name-row">
              <span className="mon-level-badge">{mon.rank || "Starter"}</span>
              <span className="mon-life-badge">❤️ HP {pk.hp}</span>
              {(mon.tipo1 || mon.tipo2) && (
                <React.Fragment>
                  {mon.tipo1 && <span className="type-chip" style={{ background: "#3E9DDB" }}>{mon.tipo1}</span>}
                  {mon.tipo2 && <span className="type-chip" style={{ background: "#CE4269" }}>{mon.tipo2}</span>}
                </React.Fragment>
              )}
              {mon.pokebola && <span className="mon-pokeball-chip"><LpItemDisplay name={mon.pokebola} /></span>}
            </div>
          </div>
          <div className="mon-actions-row" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className={"btn-ready" + (mon.pronto ? " active" : "")}
              onClick={() => onUpdate({ pronto: !mon.pronto, expanded: mon.pronto })}
            >
              {mon.pronto ? "✓ Pronto" : "Marcar pronto"}
            </button>
            <button type="button" className="btn-toggle" onClick={toggleExpand}>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button className="btn-icon danger" onClick={onRemove}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {isExpanded && (
          <React.Fragment>
            <div style={{ padding: "8px 14px 0", display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
              <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => setBotOpen(true)}>
                📋 Colar do Bot
              </button>
              <button type="button" className="btn-ghost" style={{ fontSize: 11 }} onClick={() => setExportOpen(true)}>
                📤 Exportar
              </button>
              <button type="button" className="btn-ghost" style={{ fontSize: 11 }} onClick={onMoveToBox}>
                ↓ Mover pra Box
              </button>
            </div>

            <div className="mon-subtabbar">
              {["perfil", "combate", "golpes", "registro"].map(tKey => (
                <button
                  key={tKey}
                  type="button"
                  className={"subtab-btn " + (tab === tKey ? "active" : "")}
                  onClick={() => setTab(tKey)}
                >
                  {tKey.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="mon-body">
              {tab === "perfil" && (
                <React.Fragment>
                  <div className="grid grid-4">
                    <div className="field">
                      <label>Gênero</label>
                      <select value={mon.genero} onChange={e => onUpdate({ genero: e.target.value })}>
                        <option value="Macho">Macho</option>
                        <option value="Fêmea">Fêmea</option>
                        <option value="Indefinido">Indefinido</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Tipo 1</label>
                      <select value={mon.tipo1} onChange={e => onUpdate({ tipo1: e.target.value })}>
                        <option value="">—</option>
                        {TYPES_DATA.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Tipo 2</label>
                      <select value={mon.tipo2} onChange={e => onUpdate({ tipo2: e.target.value })}>
                        <option value="">—</option>
                        {TYPES_DATA.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Teratype</label>
                      <select value={mon.teratype} onChange={e => onUpdate({ teratype: e.target.value })}>
                        <option value="">—</option>
                        {TYPES_DATA.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-2">
                    <div className="field">
                      <label>Espécie</label>
                      <input
                        type="text"
                        placeholder="Ex: Pikachu"
                        value={mon.especie || ""}
                        onChange={e => onUpdate({ especie: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label>Base HP (Espécie)</label>
                      <input type="number" value={mon.baseHP} onChange={e => onUpdate({ baseHP: Number(e.target.value) || 4 })} />
                    </div>
                  </div>

                  <div className="grid grid-2">
                    <div className="field">
                      <label>Rank</label>
                      <select value={mon.rank || "Starter"} onChange={e => onUpdate({ rank: e.target.value })}>
                        <option value="Starter">Starter</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Amateur">Amateur</option>
                        <option value="Ace">Ace</option>
                        <option value="Professional">Professional</option>
                        <option value="Master">Master</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Nature</label>
                      <select value={mon.nature} onChange={e => onUpdate({ nature: e.target.value })}>
                        <option value="">—</option>
                        {NATURES_DATA.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-2">
                    <div className="field">
                      <label>Poké Ball</label>
                      <SoAutocomplete
                        value={mon.pokebola}
                        options={ITEMS_DATA.filter(i => i.cat === "Pokébola")}
                        getLabel={i => i.name}
                        getSub={i => i.desc || ""}
                        placeholder="Buscar Poké Ball..."
                        onChange={val => onUpdate({ pokebola: val })}
                        onPick={item => onUpdate({ pokebola: item.name })}
                      />
                    </div>
                    <div className="field">
                      <label>Item Segurado</label>
                      <SoAutocomplete
                        value={mon.itemSegurado}
                        options={ITEMS_DATA}
                        getLabel={i => i.name}
                        getSub={i => i.cat}
                        placeholder="Buscar Item..."
                        onChange={val => onUpdate({ itemSegurado: val })}
                        onPick={item => onUpdate({ itemSegurado: item.name })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-3">
                    <div className="field">
                      <label>Felicidade</label>
                      <input type="number" value={mon.felicidade} onChange={e => onUpdate({ felicidade: Number(e.target.value) || 0 })} />
                    </div>
                    <div className="field" style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#6b6354" }}>
                        <input
                          type="checkbox"
                          style={{ width: "auto" }}
                          checked={mon.megaShinka}
                          onChange={e => onUpdate({ megaShinka: e.target.checked, battleBond: e.target.checked ? false : mon.battleBond })}
                        />
                        Mega Shinka
                      </label>
                    </div>
                    <div className="field" style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#6b6354" }}>
                        <input
                          type="checkbox"
                          style={{ width: "auto" }}
                          checked={mon.battleBond}
                          onChange={e => onUpdate({ battleBond: e.target.checked, megaShinka: e.target.checked ? false : mon.megaShinka })}
                        />
                        Battle Bond
                      </label>
                    </div>
                  </div>

                  <div className="field">
                    <label>Habilidade</label>
                    <SoAutocomplete
                      value={mon.habilidade}
                      options={PK_ABILITIES}
                      getLabel={a => a.name}
                      getSub={a => a.effect}
                      placeholder="Buscar Habilidade..."
                      onChange={val => onUpdate({ habilidade: val })}
                      onPick={item => onUpdate({ habilidade: item.name })}
                    />
                  </div>

                  <div className="section-sub">Informações Físicas e Sociais</div>
                  <div className="grid grid-3">
                    <div className="field">
                      <label>Tamanho</label>
                      <input type="text" value={mon.tamanho || ""} onChange={e => onUpdate({ tamanho: e.target.value })} placeholder="Ex: 0.4 m" />
                    </div>
                    <div className="field">
                      <label>Peso</label>
                      <input type="text" value={mon.peso || ""} onChange={e => onUpdate({ peso: e.target.value })} placeholder="Ex: 6.0 kg" />
                    </div>
                    <div className="field">
                      <label>Lealdade</label>
                      <input type="number" min={0} max={6} value={mon.lealdade ?? 3} onChange={e => onUpdate({ lealdade: Number(e.target.value) || 0 })} />
                    </div>
                  </div>

                  <div className="grid grid-3">
                    <div className="field">
                      <label>Lazo Batalla</label>
                      <input type="text" value={mon.lazoBatalla || ""} onChange={e => onUpdate({ lazoBatalla: e.target.value })} placeholder="Nome do Lazo" />
                    </div>
                    <div className="field">
                      <label>Puntos Entrenamiento</label>
                      <input type="number" min={0} value={mon.puntosEntrenamiento ?? 0} onChange={e => onUpdate({ puntosEntrenamiento: Number(e.target.value) || 0 })} />
                    </div>
                    <div className="field">
                      <label>Instinto / Lógica</label>
                      <select value={mon.instintoLogica || "Instinto"} onChange={e => onUpdate({ instintoLogica: e.target.value })}>
                        <option value="Instinto">Instinto</option>
                        <option value="Lógica">Lógica</option>
                        <option value="Ambos">Ambos</option>
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <label>Acessórios</label>
                    <input type="text" value={mon.accesorios || ""} onChange={e => onUpdate({ accesorios: e.target.value })} placeholder="Ex: Laço Vermelho, Óculos" />
                  </div>

                  <div className="section-sub">Ranuras de Bolsa (Mochila do Pokémon)</div>
                  <div className="grid grid-2">
                    {[0, 1, 2, 3].map(idx => (
                      <div className="field" key={idx}>
                        <label>Slot {idx + 1}</label>
                        <SoAutocomplete
                          value={mon.ranurasBolsa?.[idx] || ""}
                          options={ITEMS_DATA}
                          getLabel={i => i.name}
                          getSub={i => i.cat}
                          placeholder={`Item da Bolsa ${idx + 1}...`}
                          onChange={val => {
                            const bag = [...(mon.ranurasBolsa || ["", "", "", ""])];
                            bag[idx] = val;
                            onUpdate({ ranurasBolsa: bag });
                          }}
                          onPick={item => {
                            const bag = [...(mon.ranurasBolsa || ["", "", "", ""])];
                            bag[idx] = item.name;
                            onUpdate({ ranurasBolsa: bag });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </React.Fragment>
              )}

              {tab === "combate" && (
                <React.Fragment>
                  <div className="section-sub">Atributos Pokérole 3.0</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
                    {["strength", "dexterity", "vitality", "special", "insight"].map(k => (
                      <div className="stat-pill" key={k}>
                        <input
                          type="number"
                          min={0}
                          max={8}
                          style={{ textAlign: "center", border: "none", padding: 0, fontWeight: 700, fontSize: 15 }}
                          value={mon.atributos?.[k as keyof typeof mon.atributos] ?? 1}
                          onChange={e => onUpdate({ atributos: { ...mon.atributos, [k]: Number(e.target.value) || 0 } })}
                        />
                        <div className="l">{k.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>

                  <div className="section-sub">Status Derivados (Pokérole 3.0)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                    <div className="stat-pill">
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>{pk.hp}</div>
                      <div className="l" style={{ fontSize: 9 }}>HP</div>
                    </div>
                    <div className="stat-pill">
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>{pk.defesa}</div>
                      <div className="l" style={{ fontSize: 9 }}>Defesa</div>
                    </div>
                    <div className="stat-pill">
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>{pk.spDefesa}</div>
                      <div className="l" style={{ fontSize: 9 }}>Sp.Def</div>
                    </div>
                    <div className="stat-pill">
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>{pk.will}</div>
                      <div className="l" style={{ fontSize: 9 }}>Will</div>
                    </div>
                    <div className="stat-pill">
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>{pk.iniciativa}</div>
                      <div className="l" style={{ fontSize: 9 }}>Inic.</div>
                    </div>
                    <div className="stat-pill">
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>{pk.evasion}</div>
                      <div className="l" style={{ fontSize: 9 }}>Evasão</div>
                    </div>
                    <div className="stat-pill">
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>{pk.choque}</div>
                      <div className="l" style={{ fontSize: 9 }}>Choque</div>
                    </div>
                  </div>

                  <div className="section-sub">Skills (0—5)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                    {Object.keys(mon.skills).map(k => (
                      <div className="stat-pill" key={k}>
                        <input
                          type="number"
                          min={0}
                          max={5}
                          style={{ textAlign: "center", border: "none", padding: 0, fontWeight: 700, fontSize: 13 }}
                          value={mon.skills?.[k as keyof typeof mon.skills] ?? 0}
                          onChange={e => onUpdate({ skills: { ...mon.skills, [k]: Number(e.target.value) || 0 } })}
                        />
                        <div className="l" style={{ fontSize: 9 }}>{k.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>

                  <div className="section-sub">Atributos de Concurso (0—5)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
                    {[
                      { key: "dureza", label: "Dureza" },
                      { key: "carisma_concurso", label: "Carisma" },
                      { key: "beleza", label: "Beleza" },
                      { key: "dulzura", label: "Dulzura" },
                      { key: "ingenio", label: "Ingenio" }
                    ].map(({ key, label }) => (
                      <div className="stat-pill" key={key}>
                        <input
                          type="number"
                          min={0}
                          max={5}
                          style={{ textAlign: "center", border: "none", padding: 0, fontWeight: 700, fontSize: 13 }}
                          value={mon[key as keyof typeof mon] !== undefined ? Number(mon[key as keyof typeof mon]) : 0}
                          onChange={e => onUpdate({ [key]: Number(e.target.value) || 0 })}
                        />
                        <div className="l" style={{ fontSize: 9 }}>{label.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>

                  <div className="section-sub">Rolador de Dados</div>
                  <PkRoller atributos={mon.atributos} skills={mon.skills} />

                  <div className="section-sub">Marcas (Até 6)</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {MARKS_DATA.map(m => (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => handleToggleMark(m.name)}
                        className={mon.marks.includes(m.name) ? "btn-pd" : "btn-ghost"}
                        style={{ padding: "5px 10px", fontSize: 10 }}
                      >
                        {m.name} (+{m.bonus} {m.attr})
                      </button>
                    ))}
                  </div>

                  <div className="section-sub">Fraquezas e Resistências</div>
                  <div className="weak-grid">
                    {TYPES_DATA.map(t => (
                      <div className="weak-cell" key={t}>
                        <div className="type-chip" style={{ background: "#888", marginBottom: 4, display: "block", textAlign: "center" }}>{t}</div>
                        <select
                          value={mon.weak[t] || "1"}
                          onChange={e => handleWeaknessChange(t, e.target.value)}
                        >
                          <option value="1">—</option>
                          <option value="2">x2</option>
                          <option value="4">x4</option>
                          <option value="0.5">x½</option>
                          <option value="0.25">x¼</option>
                          <option value="0">Imune</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </React.Fragment>
              )}

              {tab === "golpes" && (
                <React.Fragment>
                  <div style={{ fontSize: 11, color: "#8a8270", marginBottom: 6 }}>
                    Lista de golpes do Pokérole 3.0.
                  </div>
                  {mon.golpes.map((g, idx) => {
                    const matchedMove = PK_MOVES.find(m => m.name === g.nome);
                    return (
                      <div key={idx} style={{ marginBottom: 8 }}>
                        <SoAutocomplete
                          value={g.nome}
                          options={PK_MOVES}
                          getLabel={m => m.name}
                          getSub={m => m.type + " · " + m.dmgType}
                          placeholder={`Golpe ${idx + 1}`}
                          onChange={val => handleGolpeChange(idx, { nome: val })}
                          onPick={item => handleGolpeChange(idx, { nome: item.name })}
                        />
                        {matchedMove && <PkMoveRow move={matchedMove} atributos={mon.atributos} skills={mon.skills} />}
                      </div>
                    );
                  })}
                </React.Fragment>
              )}

              {tab === "registro" && (
                <React.Fragment>
                  <div className="section-sub">Estatísticas de Batalha</div>
                  <div className="grid grid-3">
                    {statsReg.map(k => (
                      <div className="field" key={k}>
                        <label>{k.toUpperCase()}</label>
                        <input
                          type="number"
                          value={mon[k as keyof typeof mon] as number ?? 0}
                          onChange={e => onUpdate({ [k]: Number(e.target.value) || 0 })}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="section-sub">Anotações</div>
                  <textarea
                    rows={4}
                    value={mon.anotacoes}
                    onChange={e => onUpdate({ anotacoes: e.target.value })}
                    placeholder="Notas, marcas adicionais, conquistas, histórico..."
                  />
                </React.Fragment>
              )}
            </div>
          </React.Fragment>
        )}
      </div>

      {botOpen && <ImportModal onClose={() => setBotOpen(false)} onApply={handleBotImportApply} />}
      {exportOpen && <ExportModal mon={mon} onClose={() => setExportOpen(false)} />}
    </React.Fragment>
  );
}

// Box Pokémon Card Component
export function BoxPokemonCard({
  mon,
  onUpdate,
  onRemove,
  onMoveToTeam,
  canMoveToTeam
}: {
  key?: any;
  mon: BoxPokemon;
  onUpdate: (patch: Partial<BoxPokemon>) => void;
  onRemove: () => void;
  onMoveToTeam: () => void;
  canMoveToTeam: boolean;
}) {
  const isExpanded = mon.expanded === true;
  const toggleExpand = () => onUpdate({ expanded: !isExpanded });

  const [botOpen, setBotOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [tab, setTab] = useState("perfil");

  const pk = pkCalc(mon);

  // Since level is removed, stats in Box card just utilize calculated mods
  const handleBaseStatChange = (stat: string, val: string) => {
    onUpdate({
      baseStats: {
        ...mon.baseStats,
        [stat]: val === "" ? "" : Number(val) || 0
      }
    });
  };

  const handleGolpeChange = (idx: number, patch: Partial<PokemonGolpe>) => {
    const list = [...mon.golpes];
    list[idx] = { ...list[idx], ...patch };
    onUpdate({ golpes: list });
  };

  const handleToggleMark = (markName: string) => {
    let list = mon.marks || [];
    if (list.includes(markName)) {
      list = list.filter(m => m !== markName);
    } else if (list.length < 6) {
      list = [...list, markName];
    }
    onUpdate({ marks: list });
  };

  const handleWeaknessChange = (type: string, val: string) => {
    onUpdate({
      weak: {
        ...mon.weak,
        [type]: val
      }
    });
  };

  const handleBotImportApply = (patch: any, note?: string) => {
    const updated = { ...patch };
    if (note) {
      updated.notas = (mon.notas ? mon.notas + "\n" : "") + note;
    }
    onUpdate(updated);
  };

  const statFields = ["hp", "atk", "def", "spatk", "spdef", "spd"];
  const bstTotal = statFields.reduce((sum, f) => sum + (Number(mon.baseStats[f as keyof typeof mon.baseStats]) || 0), 0);

  const statsReg = ["batalhas", "vitorias", "derrotas", "treinou", "vitaminas", "capturas", "derrotou", "esquivou"];

  return (
    <React.Fragment>
      <div className="mon-card">
        <div className="mon-head" onClick={toggleExpand}>
          <div className="mon-img-wrap">
            <PokeImage name={mon.especie || mon.nome} />
          </div>
          <div className="mon-head-info">
            <input
              type="text"
              style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "2px solid rgba(255,255,255,0.2)", fontWeight: 800, fontSize: 15 }}
              value={mon.nome}
              onClick={e => e.stopPropagation()}
              onChange={e => onUpdate({ nome: e.target.value })}
              placeholder="Nome do Pokémon"
            />
            <div className="mon-name-row">
              <span className="mon-level-badge">BST {bstTotal}</span>
              {(mon.tipo1 || mon.tipo2) && (
                <React.Fragment>
                  {mon.tipo1 && <span className="type-chip" style={{ background: "#3E9DDB" }}>{mon.tipo1}</span>}
                  {mon.tipo2 && <span className="type-chip" style={{ background: "#CE4269" }}>{mon.tipo2}</span>}
                </React.Fragment>
              )}
              {mon.pokebola && <span className="mon-pokeball-chip"><LpItemDisplay name={mon.pokebola} /></span>}
            </div>
          </div>
          <div className="mon-actions-row" onClick={e => e.stopPropagation()}>
            <button type="button" className="btn-toggle" onClick={toggleExpand}>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button className="btn-icon danger" onClick={onRemove}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {isExpanded && (
          <React.Fragment>
            <div style={{ padding: "8px 14px 0", display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
              <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => setBotOpen(true)}>
                📋 Colar do Bot
              </button>
              <button type="button" className="btn-ghost" style={{ fontSize: 11 }} onClick={() => setExportOpen(true)}>
                📤 Exportar
              </button>
              <button type="button" className="btn-ghost" style={{ fontSize: 11 }} onClick={onMoveToTeam} disabled={!canMoveToTeam}>
                ↑ Mover pro Time
              </button>
            </div>

            {botOpen && <ImportModal onClose={() => setBotOpen(false)} onApply={handleBotImportApply} />}

            <div className="mon-subtabbar">
              {["perfil", "combate", "golpes", "registro"].map(tKey => (
                <button
                  key={tKey}
                  type="button"
                  className={"subtab-btn " + (tab === tKey ? "active" : "")}
                  onClick={() => setTab(tKey)}
                >
                  {tKey.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="mon-body">
              {tab === "perfil" && (
                <React.Fragment>
                  <div className="grid grid-2">
                    <div className="field">
                      <label>Espécie</label>
                      <input type="text" value={mon.especie} onChange={e => onUpdate({ especie: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Base HP (Espécie)</label>
                      <input type="number" value={mon.baseHP ?? 4} onChange={e => onUpdate({ baseHP: Number(e.target.value) || 4 })} />
                    </div>
                  </div>
                  <div className="grid grid-4">
                    <div className="field">
                      <label>Gênero</label>
                      <select value={mon.genero} onChange={e => onUpdate({ genero: e.target.value })}>
                        <option value="Macho">Macho</option>
                        <option value="Fêmea">Fêmea</option>
                        <option value="Indefinido">Indefinido</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Tipo 1</label>
                      <select value={mon.tipo1} onChange={e => onUpdate({ tipo1: e.target.value })}>
                        <option value="">—</option>
                        {TYPES_DATA.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Tipo 2</label>
                      <select value={mon.tipo2} onChange={e => onUpdate({ tipo2: e.target.value })}>
                        <option value="">—</option>
                        {TYPES_DATA.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Teratype</label>
                      <select value={mon.teratype} onChange={e => onUpdate({ teratype: e.target.value })}>
                        <option value="">—</option>
                        {TYPES_DATA.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-4">
                    <div className="field">
                      <label>Total (0–500)</label>
                      <input type="number" value={mon.total} onChange={e => onUpdate({ total: Number(e.target.value) || 500 })} />
                    </div>
                    <div className="field">
                      <label>Nature</label>
                      <select value={mon.nature} onChange={e => onUpdate({ nature: e.target.value })}>
                        <option value="">—</option>
                        {NATURES_DATA.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>IVs</label>
                      <select value={mon.ivs} onChange={e => onUpdate({ ivs: Number(e.target.value) })}>
                        <option value={31}>31 (perfeito)</option>
                        <option value={0}>0</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Felicidade</label>
                      <input type="number" value={mon.felicidade} onChange={e => onUpdate({ felicidade: Number(e.target.value) || 0 })} />
                    </div>
                  </div>

                  <div className="grid grid-2">
                    <div className="field">
                      <label>Poké Ball</label>
                      <SoAutocomplete
                        value={mon.pokebola}
                        options={ITEMS_DATA.filter(i => i.cat === "Pokébola")}
                        getLabel={i => i.name}
                        getSub={i => i.desc || ""}
                        placeholder="Buscar Poké Ball..."
                        onChange={val => onUpdate({ pokebola: val })}
                        onPick={item => onUpdate({ pokebola: item.name })}
                      />
                    </div>
                    <div className="field">
                      <label>Item Segurado</label>
                      <SoAutocomplete
                        value={mon.itemSegurado}
                        options={ITEMS_DATA}
                        getLabel={i => i.name}
                        getSub={i => i.cat}
                        placeholder="Buscar Item..."
                        onChange={val => onUpdate({ itemSegurado: val })}
                        onPick={item => onUpdate({ itemSegurado: item.name })}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Habilidade</label>
                    <SoAutocomplete
                      value={mon.habilidade}
                      options={PK_ABILITIES}
                      getLabel={a => a.name}
                      getSub={a => a.effect}
                      placeholder="Buscar Habilidade..."
                      onChange={val => onUpdate({ habilidade: val })}
                      onPick={item => onUpdate({ habilidade: item.name })}
                    />
                  </div>

                  <div className="section-sub">Informações Físicas e Sociais</div>
                  <div className="grid grid-3">
                    <div className="field">
                      <label>Tamanho</label>
                      <input type="text" value={mon.tamanho || ""} onChange={e => onUpdate({ tamanho: e.target.value })} placeholder="Ex: 0.4 m" />
                    </div>
                    <div className="field">
                      <label>Peso</label>
                      <input type="text" value={mon.peso || ""} onChange={e => onUpdate({ peso: e.target.value })} placeholder="Ex: 6.0 kg" />
                    </div>
                    <div className="field">
                      <label>Lealdade</label>
                      <input type="number" min={0} max={6} value={mon.lealdade ?? 3} onChange={e => onUpdate({ lealdade: Number(e.target.value) || 0 })} />
                    </div>
                  </div>

                  <div className="grid grid-3">
                    <div className="field">
                      <label>Lazo Batalla</label>
                      <input type="text" value={mon.lazoBatalla || ""} onChange={e => onUpdate({ lazoBatalla: e.target.value })} placeholder="Nome do Lazo" />
                    </div>
                    <div className="field">
                      <label>Puntos Entrenamiento</label>
                      <input type="number" min={0} value={mon.puntosEntrenamiento ?? 0} onChange={e => onUpdate({ puntosEntrenamiento: Number(e.target.value) || 0 })} />
                    </div>
                    <div className="field">
                      <label>Instinto / Lógica</label>
                      <select value={mon.instintoLogica || "Instinto"} onChange={e => onUpdate({ instintoLogica: e.target.value })}>
                        <option value="Instinto">Instinto</option>
                        <option value="Lógica">Lógica</option>
                        <option value="Ambos">Ambos</option>
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <label>Acessórios</label>
                    <input type="text" value={mon.accesorios || ""} onChange={e => onUpdate({ accesorios: e.target.value })} placeholder="Ex: Laço Vermelho, Óculos" />
                  </div>

                  <div className="section-sub">Ranuras de Bolsa (Mochila do Pokémon)</div>
                  <div className="grid grid-2">
                    {[0, 1, 2, 3].map(idx => (
                      <div className="field" key={idx}>
                        <label>Slot {idx + 1}</label>
                        <SoAutocomplete
                          value={mon.ranurasBolsa?.[idx] || ""}
                          options={ITEMS_DATA}
                          getLabel={i => i.name}
                          getSub={i => i.cat}
                          placeholder={`Item da Bolsa ${idx + 1}...`}
                          onChange={val => {
                            const bag = [...(mon.ranurasBolsa || ["", "", "", ""])];
                            bag[idx] = val;
                            onUpdate({ ranurasBolsa: bag });
                          }}
                          onPick={item => {
                            const bag = [...(mon.ranurasBolsa || ["", "", "", ""])];
                            bag[idx] = item.name;
                            onUpdate({ ranurasBolsa: bag });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </React.Fragment>
              )}

              {tab === "combate" && (
                <React.Fragment>
                  <div className="section-sub">Atributos Pokérole 3.0</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
                    {["strength", "dexterity", "vitality", "special", "insight"].map(k => (
                      <div className="stat-pill" key={k}>
                        <input
                          type="number"
                          min={0}
                          max={8}
                          style={{ textAlign: "center", border: "none", padding: 0, fontWeight: 700, fontSize: 15 }}
                          value={mon.atributos?.[k as keyof typeof mon.atributos] ?? 1}
                          onChange={e => onUpdate({ atributos: { ...mon.atributos, [k]: Number(e.target.value) || 0 } })}
                        />
                        <div className="l">{k.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>

                  <div className="section-sub">Status Derivados (Pokérole 3.0)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                    <div className="stat-pill">
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>{pk.hp}</div>
                      <div className="l" style={{ fontSize: 9 }}>HP</div>
                    </div>
                    <div className="stat-pill">
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>{pk.defesa}</div>
                      <div className="l" style={{ fontSize: 9 }}>Defesa</div>
                    </div>
                    <div className="stat-pill">
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>{pk.spDefesa}</div>
                      <div className="l" style={{ fontSize: 9 }}>Sp.Def</div>
                    </div>
                    <div className="stat-pill">
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>{pk.will}</div>
                      <div className="l" style={{ fontSize: 9 }}>Will</div>
                    </div>
                    <div className="stat-pill">
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>{pk.iniciativa}</div>
                      <div className="l" style={{ fontSize: 9 }}>Inic.</div>
                    </div>
                    <div className="stat-pill">
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>{pk.evasion}</div>
                      <div className="l" style={{ fontSize: 9 }}>Evasão</div>
                    </div>
                    <div className="stat-pill">
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#2E6F95" }}>{pk.choque}</div>
                      <div className="l" style={{ fontSize: 9 }}>Choque</div>
                    </div>
                  </div>

                  <div className="section-sub">Skills (0—5)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                    {Object.keys(mon.skills || {}).map(k => (
                      <div className="stat-pill" key={k}>
                        <input
                          type="number"
                          min={0}
                          max={5}
                          style={{ textAlign: "center", border: "none", padding: 0, fontWeight: 700, fontSize: 13 }}
                          value={mon.skills?.[k as keyof typeof mon.skills] ?? 0}
                          onChange={e => onUpdate({ skills: { ...mon.skills, [k]: Number(e.target.value) || 0 } })}
                        />
                        <div className="l" style={{ fontSize: 9 }}>{k.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>

                  <div className="section-sub">Atributos de Concurso (0—5)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
                    {[
                      { key: "dureza", label: "Dureza" },
                      { key: "carisma_concurso", label: "Carisma" },
                      { key: "beleza", label: "Beleza" },
                      { key: "dulzura", label: "Dulzura" },
                      { key: "ingenio", label: "Ingenio" }
                    ].map(({ key, label }) => (
                      <div className="stat-pill" key={key}>
                        <input
                          type="number"
                          min={0}
                          max={5}
                          style={{ textAlign: "center", border: "none", padding: 0, fontWeight: 700, fontSize: 13 }}
                          value={mon[key as keyof typeof mon] !== undefined ? Number(mon[key as keyof typeof mon]) : 0}
                          onChange={e => onUpdate({ [key]: Number(e.target.value) || 0 })}
                        />
                        <div className="l" style={{ fontSize: 9 }}>{label.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>

                  <div className="section-sub">Rolador de Dados</div>
                  <PkRoller atributos={mon.atributos} skills={mon.skills} />

                  <div className="section-sub">Marcas (Até 6)</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {MARKS_DATA.map(m => (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => handleToggleMark(m.name)}
                        className={mon.marks.includes(m.name) ? "btn-pd" : "btn-ghost"}
                        style={{ padding: "5px 10px", fontSize: 10 }}
                      >
                        {m.name} (+{m.bonus} {m.attr})
                      </button>
                    ))}
                  </div>

                  <div className="section-sub">Status Base do Pokémon (BST)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6 }}>
                    {statFields.map(f => (
                      <div className="stat-pill" key={f}>
                        <input
                          type="number"
                          style={{ textAlign: "center", border: "none", padding: 0, fontWeight: 700, fontSize: 13 }}
                          value={mon.baseStats[f as keyof typeof mon.baseStats]}
                          onChange={e => handleBaseStatChange(f, e.target.value)}
                        />
                        <div className="l">{f.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: "#8a8270", margin: "6px 0 0" }}>
                    Total Base: {bstTotal} · Falta: <span style={{ fontWeight: 800 }}>{Math.max(0, (mon.total || 500) - bstTotal)}</span>
                  </div>

                  <div className="section-sub">Fraquezas e Resistências</div>
                  <div className="weak-grid">
                    {TYPES_DATA.map(t => (
                      <div className="weak-cell" key={t}>
                        <div className="type-chip" style={{ background: "#888", marginBottom: 4, display: "block", textAlign: "center" }}>{t}</div>
                        <select
                          value={mon.weak[t] || "1"}
                          onChange={e => handleWeaknessChange(t, e.target.value)}
                        >
                          <option value="1">—</option>
                          <option value="2">x2</option>
                          <option value="4">x4</option>
                          <option value="0.5">x½</option>
                          <option value="0.25">x¼</option>
                          <option value="0">Imune</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </React.Fragment>
              )}

              {tab === "golpes" && (
                <React.Fragment>
                  {mon.golpes.map((g, idx) => {
                    const matchedMove = PK_MOVES.find(m => m.name === g.nome);
                    return (
                      <div key={idx} style={{ marginBottom: 8 }}>
                        <SoAutocomplete
                          value={g.nome}
                          options={PK_MOVES}
                          getLabel={m => m.name}
                          getSub={m => m.type + " · " + m.dmgType}
                          placeholder={`Golpe ${idx + 1}`}
                          onChange={val => handleGolpeChange(idx, { nome: val })}
                          onPick={item => handleGolpeChange(idx, { nome: item.name })}
                        />
                        {matchedMove && <PkMoveRow move={matchedMove} atributos={mon.atributos} skills={mon.skills} />}
                      </div>
                    );
                  })}
                </React.Fragment>
              )}

              {tab === "registro" && (
                <React.Fragment>
                  <div className="section-sub">Estatísticas de Batalha</div>
                  <div className="grid grid-3">
                    {statsReg.map(k => (
                      <div className="field" key={k}>
                        <label>{k.toUpperCase()}</label>
                        <input
                          type="number"
                          value={mon[k as keyof typeof mon] as number ?? 0}
                          onChange={e => onUpdate({ [k]: Number(e.target.value) || 0 })}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="section-sub">Notas</div>
                  <textarea
                    rows={4}
                    value={mon.notas}
                    onChange={e => onUpdate({ notas: e.target.value })}
                    placeholder="Notas, marcas, histórico..."
                  />
                </React.Fragment>
              )}
            </div>
          </React.Fragment>
        )}
      </div>

      {exportOpen && <ExportModal mon={mon} onClose={() => setExportOpen(false)} />}
    </React.Fragment>
  );
}
