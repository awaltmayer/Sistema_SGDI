export interface OpcaoCorColuna {
  id: string;
  name: string;
  hex: string;
  swatchBg: string;
  isLight?: boolean;
  borderHex?: string;
  bgClass: string;
  borderClass: string;
  headerClass: string;
  badgeClass: string;
  btnClass: string;
  iconClass: string;
  addBtnClass: string;
}
export type ColumnColorOption = OpcaoCorColuna;

/**
 * Paleta de cores flat sólidas e lisas para as colunas do quadro.
 * A opção "default" adota Preto Absoluto (#000000) no modo escuro e Cinza Suave (#f1f5f9) no modo claro.
 */
export const CORES_COLUNA: OpcaoCorColuna[] = [
  {
    id: "default",
    name: "Padrão (Preto no Escuro)",
    hex: "",
    swatchBg: "",
    isLight: false,
    bgClass: "bg-slate-100 dark:bg-black",
    borderClass: "border-slate-200/80 dark:border-white/10",
    headerClass: "text-slate-900 dark:text-white",
    badgeClass: "bg-slate-200 text-slate-800 dark:bg-white/15 dark:text-white",
    btnClass: "text-slate-600 hover:text-slate-950 hover:bg-slate-200 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10",
    iconClass: "text-slate-900 dark:text-white",
    addBtnClass: "text-slate-700 hover:bg-slate-200 dark:text-white/80 dark:hover:bg-white/10",
  },
  {
    id: "blue",
    name: "Azul Oceano",
    hex: "#2563eb",
    swatchBg: "#2563eb",
    bgClass: "bg-blue-600",
    borderClass: "border-blue-700/50",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "sky",
    name: "Azul Céu",
    hex: "#0284c7",
    swatchBg: "#0284c7",
    bgClass: "bg-sky-600",
    borderClass: "border-sky-700/50",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "cyan",
    name: "Ciano",
    hex: "#0891b2",
    swatchBg: "#0891b2",
    bgClass: "bg-cyan-600",
    borderClass: "border-cyan-700/50",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "teal",
    name: "Verde-Água",
    hex: "#0d9488",
    swatchBg: "#0d9488",
    bgClass: "bg-teal-600",
    borderClass: "border-teal-700/50",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "green",
    name: "Verde Esmeralda",
    hex: "#059669",
    swatchBg: "#059669",
    bgClass: "bg-emerald-600",
    borderClass: "border-emerald-700/50",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "lime",
    name: "Verde Limão",
    hex: "#65a30d",
    swatchBg: "#65a30d",
    bgClass: "bg-lime-600",
    borderClass: "border-lime-700/50",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "yellow",
    name: "Amarelo Âmbar",
    hex: "#d97706",
    swatchBg: "#d97706",
    bgClass: "bg-amber-600",
    borderClass: "border-amber-700/50",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "orange",
    name: "Laranja Coral",
    hex: "#ea580c",
    swatchBg: "#ea580c",
    bgClass: "bg-orange-600",
    borderClass: "border-orange-700/50",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "red",
    name: "Vermelho Rubi",
    hex: "#dc2626",
    swatchBg: "#dc2626",
    bgClass: "bg-red-600",
    borderClass: "border-red-700/50",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "rose",
    name: "Rosa Suave",
    hex: "#e11d48",
    swatchBg: "#e11d48",
    bgClass: "bg-rose-600",
    borderClass: "border-rose-700/50",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "pink",
    name: "Rosa Vibrante",
    hex: "#db2777",
    swatchBg: "#db2777",
    bgClass: "bg-pink-600",
    borderClass: "border-pink-700/50",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "purple",
    name: "Roxo Ametista",
    hex: "#7c3aed",
    swatchBg: "#7c3aed",
    bgClass: "bg-purple-600",
    borderClass: "border-purple-700/50",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "indigo",
    name: "Azul Índigo",
    hex: "#4f46e5",
    swatchBg: "#4f46e5",
    bgClass: "bg-indigo-600",
    borderClass: "border-indigo-700/50",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "slate",
    name: "Cinza Grafite",
    hex: "#334155",
    swatchBg: "#334155",
    bgClass: "bg-slate-700",
    borderClass: "border-slate-800/50",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "black",
    name: "Preto Absoluto",
    hex: "#000000",
    swatchBg: "#000000",
    borderHex: "rgba(255, 255, 255, 0.15)",
    bgClass: "bg-black",
    borderClass: "border-white/15",
    headerClass: "text-white",
    badgeClass: "bg-white/15 text-white",
    btnClass: "text-white/80 hover:text-white hover:bg-white/15",
    iconClass: "text-white",
    addBtnClass: "text-white/85 hover:bg-white/10",
  },
];

export const COLUMN_COLORS = CORES_COLUNA;

export function obterEstiloCorColuna(colorId?: string | null): OpcaoCorColuna {
  if (!colorId || colorId === "default") {
    return CORES_COLUNA[0];
  }
  // Retrocompatibilidade caso 'amber' tenha sido gravado no cache anteriormente
  if (colorId === "amber") {
    return CORES_COLUNA.find((c) => c.id === "orange") ?? CORES_COLUNA[0];
  }
  const match = CORES_COLUNA.find((c) => c.id === colorId);
  return match ?? CORES_COLUNA[0];
}

export const getColumnColorStyle = obterEstiloCorColuna;
