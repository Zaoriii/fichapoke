export interface MarkData {
  name: string;
  desc: string;
  attr: string;
  bonus: number;
}

export interface ItemData {
  name: string;
  rarity: string | null;
  img?: string;
  price: number | string | null;
  sell: number | string | null;
  desc: string | null;
  cat: string;
}

export interface PkMove {
  name: string;
  type: string;
  dmgType: string;
  power: number;
  acc1: string;
  acc2: string;
  dmg1: string;
  target: string;
  effect: string;
}

export interface PkAbility {
  name: string;
  description: string;
  effect: string;
}

export const NATURES_DATA: string[] = [
  "Adamant", "Brave", "Naughty", "Lonely", "Bold", "Impish", "Relaxed", "Lax",
  "Timid", "Jolly", "Hasty", "Naive", "Modest", "Quiet", "Rash", "Mild",
  "Calm", "Careful", "Gentle", "Sassy", "Serious", "Hardy", "Docile", "Bashful", "Quirky"
];

export const MARKS_DATA: MarkData[] = [
  { name: "Meu Parceiro", desc: "Parceria Afiada", attr: "ATK", bonus: 10 },
  { name: "Marca do Vigor", desc: "Sou Forte!", attr: "ATK", bonus: 10 },
  { name: "Bora Lutar", desc: "Lutador Nato", attr: "ATK", bonus: 10 },
  { name: "Atento", desc: "Super Atencioso", attr: "DEF", bonus: 10 },
  { name: "Marca da Harmonia", desc: "Suave na Nave", attr: "DEF", bonus: 10 },
  { name: "Conquistador", desc: "Orgulhoso", attr: "DEF", bonus: 10 },
  { name: "Meu Amor", desc: "Seu Pokémon ama você.", attr: "HP", bonus: 30 },
  { name: "Alfa", desc: "Alfa do Grupo", attr: "HP", bonus: 60 },
  { name: "Pai de Pet", desc: "Meu Filho", attr: "HP, DEF & SP. DEF", bonus: 10 },
  { name: "Explorador", desc: "Achei, é meu!", attr: "HP", bonus: 10 },
  { name: "Yummy", desc: "Comilão", attr: "HP", bonus: 10 },
  { name: "Pescado", desc: "Me tirou do meu habitat?", attr: "Escolha", bonus: 10 },
  { name: "Destinado", desc: "Era Meu", attr: "Escolha", bonus: 10 },
  { name: "Tô Feliz!", desc: "Ai que delicia o verão", attr: "SP. ATK", bonus: 10 },
  { name: "Feliz da Vida", desc: "Mô Feliz!", attr: "SP. ATK", bonus: 10 },
  { name: "Carismatico", desc: "Muito Carismatico", attr: "SP.DEF", bonus: 10 },
  { name: "Popular", desc: "Bastante Popular", attr: "SP.DEF", bonus: 10 },
  { name: "Cresceu Comigo", desc: "Meu Filhote Cresceu", attr: "HP, ATK & SP. ATK", bonus: 10 },
  { name: "Calmaria", desc: "Meditador", attr: "SP.DEF", bonus: 10 },
  { name: "Campeão", desc: "Demorou, mas conseguimos", attr: "Todos", bonus: 10 },
  { name: "Shiny", desc: "Brilhante", attr: "Todos", bonus: 30 }
];

export const TYPES_DATA: string[] = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison",
  "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
];

// Omit level/exp related items: Rare Candy, Exp Candy XS/S/M/L/XL, Lucky Egg, Evolution Crystal
export const ITEMS_DATA: ItemData[] = [
  { name: "Great Ball", rarity: "Incomum", img: "https://www.serebii.net/itemdex/sprites/sv/greatball.png", price: 600, sell: 300, desc: "Adiciona +1 na Rolagem de Captura.", cat: "Pokébola" },
  { name: "Ultra Ball", rarity: "Raro", img: "https://www.serebii.net/itemdex/sprites/sv/ultraball.png", price: 800, sell: 400, desc: "Adiciona +2 na Rolagem de Captura.", cat: "Pokébola" },
  { name: "Master Ball", rarity: "Lendário", img: "https://www.serebii.net/itemdex/sprites/sv/masterball.png", price: "", sell: "", desc: "A Master Ball pode falhar quando lançada em Pokémon lendários.", cat: "Pokébola" },
  { name: "Luxury Ball", rarity: "Incomum", img: "https://www.serebii.net/itemdex/sprites/sv/luxuryball.png", price: 3000, sell: 1500, desc: "Adiciona +0 na Rolagem de Captura. Os Pokémon capturados tornam-se amigos mais facilmente.", cat: "Pokébola" },
  { name: "Premier Ball", rarity: "Incomum", img: "https://www.serebii.net/itemdex/sprites/sv/premierball.png", price: "", sell: 20, desc: "Adiciona +0 na Rolagem de Captura.", cat: "Pokébola" },
  { name: "Dive Ball", rarity: "Incomum", img: "https://www.serebii.net/itemdex/sprites/sv/diveball.png", price: 1000, sell: 500, desc: "Adiciona +2 na Rolagem de Captura se o Pokémon estiver na água.", cat: "Pokébola" },
  { name: "Dusk Ball", rarity: "Incomum", img: "https://www.serebii.net/itemdex/sprites/sv/duskball.png", price: 1000, sell: 500, desc: "Adiciona +2 na Rolagem de Captura se estiver a Noite, sem Luz Solar ou em Cavenas.", cat: "Pokébola" },
  { name: "Heal Ball", rarity: "Incomum", img: "https://www.serebii.net/itemdex/sprites/sv/healball.png", price: 1000, sell: 500, desc: "Adiciona +0 em sua rolagem de captura. O Pokémon capturado se recupera totalmente.", cat: "Pokébola" },
  { name: "Net Ball", rarity: "Incomum", img: "https://www.serebii.net/itemdex/sprites/sv/netball.png", price: 1000, sell: 500, desc: "Adiciona +2 na Rolagem de Captura se Pokémon for do tipo Água ou Inseto.", cat: "Pokébola" },
  { name: "Nest Ball", rarity: "Incomum", img: "https://www.serebii.net/itemdex/sprites/sv/nestball.png", price: 1000, sell: 500, desc: "Adiciona +2 na Rolagem de Captura se Pokémon puder evoluir mas ainda não evoluiu.", cat: "Pokébola" },
  { name: "Quick Ball", rarity: "Raro", img: "https://www.serebii.net/itemdex/sprites/sv/quickball.png", price: 1000, sell: 500, desc: "Adiciona +4 na Rolagem de Captura se lançado como sua primeira ação durante o combate.", cat: "Pokébola" },
  { name: "Repeat Ball", rarity: "Incomum", img: "https://www.serebii.net/itemdex/sprites/sv/repeatball.png", price: 1000, sell: 500, desc: "Adiciona +3 na Rolagem de Captura se Pokémon já teve uma Pokébola jogada nele.", cat: "Pokébola" },
  { name: "Timer Ball", rarity: "Incomum", img: "https://www.serebii.net/itemdex/sprites/sv/timerball.png", price: 1000, sell: 500, desc: "Adiciona +1 na Rolagem de Captura conforme os turnos passam.", cat: "Pokébola" },
  { name: "Poké Ball", rarity: "Comum", img: "https://www.serebii.net/itemdex/sprites/sv/pokeball.png", price: 200, sell: 100, desc: "Adiciona +0 na Rolagem de Captura.", cat: "Pokébola" },
  { name: "Potion", rarity: "Comum", img: "https://www.serebii.net/itemdex/sprites/sv/potion.png", price: 250, sell: 125, desc: "Restaura 20 pontos de vida de um pokémon com HP baixo.", cat: "Medicinal" },
  { name: "Super Potion", rarity: "Incomum", img: "https://www.serebii.net/itemdex/sprites/sv/superpotion.png", price: 800, sell: 400, desc: "Recupera 40 pontos de vida de um pokémon com HP baixo.", cat: "Medicinal" },
  { name: "Hyper Potion", rarity: "Raro", img: "https://www.serebii.net/itemdex/sprites/sv/hyperpotion.png", price: 3000, sell: 1500, desc: "Recupera 80 pontos de vida de um pokémon com HP baixo.", cat: "Medicinal" },
  { name: "Max Potion", rarity: "Épico", img: "https://www.serebii.net/itemdex/sprites/sv/maxpotion.png", price: 5000, sell: 2500, desc: "Recupera todo o HP.", cat: "Medicinal" },
  { name: "Full Restore", rarity: "Épico", img: "https://www.serebii.net/itemdex/sprites/sv/fullrestore.png", price: 10000, sell: 5000, desc: "Recupera todo o HP e cura condições de status.", cat: "Medicinal" },
  { name: "Antidote", rarity: "Comum", img: "https://www.serebii.net/itemdex/sprites/sv/antidote.png", price: 200, sell: 100, desc: "Cura envenenamento.", cat: "Medicinal" },
  { name: "Awakening", rarity: "Comum", img: "https://www.serebii.net/itemdex/sprites/sv/awakening.png", price: 200, sell: 100, desc: "Acorda um Pokémon adormecido.", cat: "Medicinal" },
  { name: "Burn Heal", rarity: "Comum", img: "https://www.serebii.net/itemdex/sprites/sv/burnheal.png", price: 200, sell: 100, desc: "Cura queimaduras.", cat: "Medicinal" },
  { name: "Ice Heal", rarity: "Comum", img: "https://www.serebii.net/itemdex/sprites/sv/iceheal.png", price: 200, sell: 100, desc: "Cura congelamento.", cat: "Medicinal" },
  { name: "Paralyze Heal", rarity: "Comum", img: "https://www.serebii.net/itemdex/sprites/sv/paralyzeheal.png", price: 200, sell: 100, desc: "Cura paralisia.", cat: "Medicinal" },
  { name: "Full Heal", rarity: "Comum", img: "https://www.serebii.net/itemdex/sprites/sv/fullheal.png", price: 200, sell: 100, desc: "Cura qualquer condição de status.", cat: "Medicinal" },
  { name: "Revive", rarity: "Incomum", img: "https://www.serebii.net/itemdex/sprites/sv/revive.png", price: 2000, sell: 1000, desc: "Revive com metade do HP.", cat: "Medicinal" },
  { name: "Max Revive", rarity: "Épico", img: "https://www.serebii.net/itemdex/sprites/sv/maxrevive.png", price: 5000, sell: 2500, desc: "Revive com HP cheio.", cat: "Medicinal" },
  { name: "Protein", rarity: "Raro", img: "https://www.serebii.net/itemdex/sprites/sv/protein.png", price: 15000, sell: 7500, desc: "Aumenta EVs de Attack em 10.", cat: "Consumivel" },
  { name: "Iron", rarity: "Raro", img: "https://www.serebii.net/itemdex/sprites/sv/iron.png", price: 15000, sell: 7500, desc: "Aumenta EVs de Defense em 10.", cat: "Consumivel" },
  { name: "Calcium", rarity: "Raro", img: "https://www.serebii.net/itemdex/sprites/sv/calcium.png", price: 15000, sell: 7500, desc: "Aumenta EVs de Special Attack em 10.", cat: "Consumivel" },
  { name: "Zinc", rarity: "Raro", img: "https://www.serebii.net/itemdex/sprites/sv/zinc.png", price: 15000, sell: 7500, desc: "Aumenta EVs de Special Defense em 10.", cat: "Consumivel" },
  { name: "Carbos", rarity: "Raro", img: "https://www.serebii.net/itemdex/sprites/sv/carbos.png", price: 15000, sell: 7500, desc: "Aumenta EVs de Speed em 10.", cat: "Consumivel" },
  { name: "HP Up", rarity: "Raro", img: "https://www.serebii.net/itemdex/sprites/sv/hpup.png", price: 15000, sell: 7500, desc: "Aumenta EVs de HP em 10.", cat: "Consumivel" },
  { name: "Leftovers", rarity: "Raro", img: "https://www.serebii.net/itemdex/sprites/sv/leftovers.png", price: 30000, sell: 15000, desc: "Recupera 4 de HP por turno.", cat: "Equipável" },
  { name: "Rocky Helmet", rarity: "Incomum", img: "https://www.serebii.net/itemdex/sprites/sv/rockyhelmet.png", price: 50000, sell: 25000, desc: "Atacantes por contato perdem 1/6 de HP.", cat: "Equipável" }
];

export const PK_MOVES: PkMove[] = [
  { name: "Tackle", type: "Normal", dmgType: "Physical", power: 1, acc1: "strength", acc2: "brawl", dmg1: "strength", target: "1 Foe", effect: "O usuário avança e colide com o alvo." },
  { name: "Thunder Shock", type: "Electric", dmgType: "Special", power: 2, acc1: "special", acc2: "channel", dmg1: "special", target: "1 Foe", effect: "Pode paralisar o alvo." },
  { name: "Quick Attack", type: "Normal", dmgType: "Physical", power: 1, acc1: "dexterity", acc2: "brawl", dmg1: "strength", target: "1 Foe", effect: "Prioridade: age primeiro no round." },
  { name: "Growl", type: "Normal", dmgType: "Status", power: 0, acc1: "special", acc2: "charm", dmg1: "", target: "Todos os Foes", effect: "Reduz Strength dos alvos em 1 estágio." },
  { name: "Tail Whip", type: "Normal", dmgType: "Status", power: 0, acc1: "special", acc2: "charm", dmg1: "", target: "Todos os Foes", effect: "Reduz Vitality (Defesa) dos alvos em 1 estágio." },
  { name: "Water Gun", type: "Water", dmgType: "Special", power: 2, acc1: "special", acc2: "channel", dmg1: "special", target: "1 Foe", effect: "Jato de água contra o alvo." },
  { name: "Ember", type: "Fire", dmgType: "Special", power: 2, acc1: "special", acc2: "channel", dmg1: "special", target: "1 Foe", effect: "Pode queimar o alvo." },
  { name: "Vine Whip", type: "Grass", dmgType: "Physical", power: 2, acc1: "strength", acc2: "brawl", dmg1: "strength", target: "1 Foe", effect: "O usuário chicoteia o alvo com vinhas." },
  { name: "Scratch", type: "Normal", dmgType: "Physical", power: 1, acc1: "strength", acc2: "brawl", dmg1: "strength", target: "1 Foe", effect: "Ataque básico com garras." },
  { name: "Protect", type: "Normal", dmgType: "Status", power: 0, acc1: "dexterity", acc2: "alert", dmg1: "", target: "Self", effect: "Bloqueia o próximo ataque direcionado ao usuário neste round." },
  { name: "Agility", type: "Psychic", dmgType: "Status", power: 0, acc1: "special", acc2: "channel", dmg1: "", target: "Self", effect: "Aumenta Dexterity do usuário em 2 estágios." },
  { name: "Double Team", type: "Normal", dmgType: "Status", power: 0, acc1: "dexterity", acc2: "evasion", dmg1: "", target: "Self", effect: "Aumenta Dexterity (Evasão) do usuário em 1 estágio." },
  { name: "Thunderbolt", type: "Electric", dmgType: "Special", power: 4, acc1: "special", acc2: "channel", dmg1: "special", target: "1 Foe", effect: "Pode paralisar o alvo. Dano forte." },
  { name: "Surf", type: "Water", dmgType: "Special", power: 4, acc1: "special", acc2: "channel", dmg1: "special", target: "Todos os Foes", effect: "Onda gigante atinge todos os inimigos." },
  { name: "Body Slam", type: "Normal", dmgType: "Physical", power: 3, acc1: "strength", acc2: "brawl", dmg1: "strength", target: "1 Foe", effect: "Pode paralisar o alvo." }
];

export const PK_ABILITIES: PkAbility[] = [
  { name: "Static", description: "Corpo carregado de eletricidade estática.", effect: "Quem faz contato físico com este Pokémon tem chance de ficar paralisado." },
  { name: "Overgrow", description: "Reforça golpes de Grama em apuros.", effect: "Quando o HP está baixo, golpes do tipo Grama recebem +1 dado de dano." },
  { name: "Blaze", description: "Reforça golpes de Fogo em apuros.", effect: "Quando o HP está baixo, golpes do tipo Fogo recebem +1 dado de dano." },
  { name: "Torrent", description: "Reforça golpes de Água em apuros.", effect: "Quando o HP está baixo, golpes do tipo Água recebem +1 dado de dano." },
  { name: "Intimidate", description: "Encara o oponente para intimidá-lo.", effect: "Ao entrar em campo, reduz Strength de todos os oponentes em 1 estágio." },
  { name: "Levitate", description: "Flutua acima do chão.", effect: "Imune a golpes do tipo Ground." },
  { name: "Keen Eye", description: "Olhos afiados que impedem perda de precisão.", effect: "A Accuracy deste Pokémon nunca pode ser reduzida por efeitos de outros Pokémon." }
];
