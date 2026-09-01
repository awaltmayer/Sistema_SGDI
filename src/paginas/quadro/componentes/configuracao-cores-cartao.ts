export interface OpcaoCorCartao {
  id: string;
  name: string;
  swatchBg: string; // Cor CSS para a amostra visual
  isDark: boolean; // Define o contraste do texto
  bgClass: string;
  hoverClass: string;
  titleClass: string;
  textClass: string;
  subtextClass: string;
  borderClass: string;
  actionButtonClass: string;
  badgeClass: string;
}
export type CardColorOption = OpcaoCorCartao;

export const CORES_CARTAO: OpcaoCorCartao[] = [
  {
    id: "default",
    name: "Padrão (Sem cor)",
    swatchBg: "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)",
    isDark: false,
    bgClass: "bg-card",
    hoverClass: "hover:bg-accent",
    titleClass: "text-foreground",
    textClass: "text-foreground",
    subtextClass: "text-muted-foreground",
    borderClass: "border-border",
    actionButtonClass: "text-muted-foreground hover:text-foreground hover:bg-accent",
    badgeClass: "bg-muted text-muted-foreground",
  },
  // Azuis
  {
    id: "blue",
    name: "Azul Oceano",
    swatchBg: "#2563eb",
    isDark: true,
    bgClass: "bg-blue-600 dark:bg-blue-700",
    hoverClass: "hover:bg-blue-600/90 dark:hover:bg-blue-700/90",
    titleClass: "text-white font-semibold",
    textClass: "text-white",
    subtextClass: "text-blue-100",
    borderClass: "border-blue-700/60 dark:border-blue-600/60",
    actionButtonClass: "text-blue-100 hover:text-white hover:bg-white/15",
    badgeClass: "bg-white/20 text-white",
  },
  {
    id: "sky",
    name: "Azul Céu (Claro)",
    swatchBg: "#7dd3fc",
    isDark: false,
    bgClass: "bg-sky-200 dark:bg-sky-300",
    hoverClass: "hover:bg-sky-200/90 dark:hover:bg-sky-300/90",
    titleClass: "text-sky-950 font-semibold",
    textClass: "text-sky-950",
    subtextClass: "text-sky-800",
    borderClass: "border-sky-300 dark:border-sky-400",
    actionButtonClass: "text-sky-900 hover:text-black hover:bg-sky-900/10",
    badgeClass: "bg-sky-900/15 text-sky-950",
  },
  // Verdes
  {
    id: "green",
    name: "Verde Esmeralda",
    swatchBg: "#059669",
    isDark: true,
    bgClass: "bg-emerald-600 dark:bg-emerald-700",
    hoverClass: "hover:bg-emerald-600/90 dark:hover:bg-emerald-700/90",
    titleClass: "text-white font-semibold",
    textClass: "text-white",
    subtextClass: "text-emerald-100",
    borderClass: "border-emerald-700/60 dark:border-emerald-600/60",
    actionButtonClass: "text-emerald-100 hover:text-white hover:bg-white/15",
    badgeClass: "bg-white/20 text-white",
  },
  {
    id: "lime",
    name: "Verde Limão (Claro)",
    swatchBg: "#bef264",
    isDark: false,
    bgClass: "bg-lime-200 dark:bg-lime-300",
    hoverClass: "hover:bg-lime-200/90 dark:hover:bg-lime-300/90",
    titleClass: "text-lime-950 font-semibold",
    textClass: "text-lime-950",
    subtextClass: "text-lime-800",
    borderClass: "border-lime-300 dark:border-lime-400",
    actionButtonClass: "text-lime-900 hover:text-black hover:bg-lime-900/10",
    badgeClass: "bg-lime-900/15 text-lime-950",
  },
  // Amarelos / Âmbar
  {
    id: "yellow",
    name: "Amarelo Sol (Claro)",
    swatchBg: "#fde047",
    isDark: false,
    bgClass: "bg-amber-200 dark:bg-amber-300",
    hoverClass: "hover:bg-amber-200/90 dark:hover:bg-amber-300/90",
    titleClass: "text-amber-950 font-semibold",
    textClass: "text-amber-950",
    subtextClass: "text-amber-800",
    borderClass: "border-amber-300 dark:border-amber-400",
    actionButtonClass: "text-amber-900 hover:text-black hover:bg-amber-900/10",
    badgeClass: "bg-amber-900/15 text-amber-950",
  },
  {
    id: "amber",
    name: "Âmbar / Laranja",
    swatchBg: "#ea580c",
    isDark: true,
    bgClass: "bg-orange-600 dark:bg-orange-700",
    hoverClass: "hover:bg-orange-600/90 dark:hover:bg-orange-700/90",
    titleClass: "text-white font-semibold",
    textClass: "text-white",
    subtextClass: "text-orange-100",
    borderClass: "border-orange-700/60 dark:border-orange-600/60",
    actionButtonClass: "text-orange-100 hover:text-white hover:bg-white/15",
    badgeClass: "bg-white/20 text-white",
  },
  // Vermelhos / Rosas
  {
    id: "red",
    name: "Vermelho Rubi",
    swatchBg: "#dc2626",
    isDark: true,
    bgClass: "bg-red-600 dark:bg-red-700",
    hoverClass: "hover:bg-red-600/90 dark:hover:bg-red-700/90",
    titleClass: "text-white font-semibold",
    textClass: "text-white",
    subtextClass: "text-red-100",
    borderClass: "border-red-700/60 dark:border-red-600/60",
    actionButtonClass: "text-red-100 hover:text-white hover:bg-white/15",
    badgeClass: "bg-white/20 text-white",
  },
  {
    id: "rose",
    name: "Rosa Pastel (Claro)",
    swatchBg: "#fecdd3",
    isDark: false,
    bgClass: "bg-rose-200 dark:bg-rose-300",
    hoverClass: "hover:bg-rose-200/90 dark:hover:bg-rose-300/90",
    titleClass: "text-rose-950 font-semibold",
    textClass: "text-rose-950",
    subtextClass: "text-rose-800",
    borderClass: "border-rose-300 dark:border-rose-400",
    actionButtonClass: "text-rose-900 hover:text-black hover:bg-rose-900/10",
    badgeClass: "bg-rose-900/15 text-rose-950",
  },
  {
    id: "pink",
    name: "Rosa Vibrante",
    swatchBg: "#db2777",
    isDark: true,
    bgClass: "bg-pink-600 dark:bg-pink-700",
    hoverClass: "hover:bg-pink-600/90 dark:hover:bg-pink-700/90",
    titleClass: "text-white font-semibold",
    textClass: "text-white",
    subtextClass: "text-pink-100",
    borderClass: "border-pink-700/60 dark:border-pink-600/60",
    actionButtonClass: "text-pink-100 hover:text-white hover:bg-white/15",
    badgeClass: "bg-white/20 text-white",
  },
  // Roxos / Índigo
  {
    id: "purple",
    name: "Roxo Ametista",
    swatchBg: "#7c3aed",
    isDark: true,
    bgClass: "bg-purple-600 dark:bg-purple-700",
    hoverClass: "hover:bg-purple-600/90 dark:hover:bg-purple-700/90",
    titleClass: "text-white font-semibold",
    textClass: "text-white",
    subtextClass: "text-purple-100",
    borderClass: "border-purple-700/60 dark:border-purple-600/60",
    actionButtonClass: "text-purple-100 hover:text-white hover:bg-white/15",
    badgeClass: "bg-white/20 text-white",
  },
  {
    id: "indigo",
    name: "Azul Índigo",
    swatchBg: "#4f46e5",
    isDark: true,
    bgClass: "bg-indigo-600 dark:bg-indigo-700",
    hoverClass: "hover:bg-indigo-600/90 dark:hover:bg-indigo-700/90",
    titleClass: "text-white font-semibold",
    textClass: "text-white",
    subtextClass: "text-indigo-100",
    borderClass: "border-indigo-700/60 dark:border-indigo-600/60",
    actionButtonClass: "text-indigo-100 hover:text-white hover:bg-white/15",
    badgeClass: "bg-white/20 text-white",
  },
  // Teal / Ciano
  {
    id: "teal",
    name: "Verde-Água / Teal",
    swatchBg: "#0d9488",
    isDark: true,
    bgClass: "bg-teal-600 dark:bg-teal-700",
    hoverClass: "hover:bg-teal-600/90 dark:hover:bg-teal-700/90",
    titleClass: "text-white font-semibold",
    textClass: "text-white",
    subtextClass: "text-teal-100",
    borderClass: "border-teal-700/60 dark:border-teal-600/60",
    actionButtonClass: "text-teal-100 hover:text-white hover:bg-white/15",
    badgeClass: "bg-white/20 text-white",
  },
  // Cinzas
  {
    id: "slate",
    name: "Cinza Claro",
    swatchBg: "#cbd5e1",
    isDark: false,
    bgClass: "bg-slate-200 dark:bg-slate-300",
    hoverClass: "hover:bg-slate-200/90 dark:hover:bg-slate-300/90",
    titleClass: "text-slate-900 font-semibold",
    textClass: "text-slate-900",
    subtextClass: "text-slate-700",
    borderClass: "border-slate-300 dark:border-slate-400",
    actionButtonClass: "text-slate-800 hover:text-black hover:bg-slate-900/10",
    badgeClass: "bg-slate-900/15 text-slate-900",
  },
  {
    id: "gray",
    name: "Cinza Grafite (Escuro)",
    swatchBg: "#334155",
    isDark: true,
    bgClass: "bg-slate-700 dark:bg-slate-800",
    hoverClass: "hover:bg-slate-700/90 dark:hover:bg-slate-800/90",
    titleClass: "text-white font-semibold",
    textClass: "text-white",
    subtextClass: "text-slate-200",
    borderClass: "border-slate-600 dark:border-slate-700",
    actionButtonClass: "text-slate-200 hover:text-white hover:bg-white/15",
    badgeClass: "bg-white/20 text-white",
  },
];
export const CARD_COLORS = CORES_CARTAO;

export function obterEstiloCorCartao(colorId?: string | null): OpcaoCorCartao {
  if (!colorId || colorId === "default") {
    return CORES_CARTAO[0];
  }
  const match = CORES_CARTAO.find((c) => c.id === colorId);
  return match ?? CORES_CARTAO[0];
}
export const getCardColorStyle = obterEstiloCorCartao;




