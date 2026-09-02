export interface OpcaoCorColuna {
  id: string;
  name: string;
  swatchBg: string;
  bgClass: string;
  borderClass: string;
  headerClass: string;
  badgeClass: string;
  btnClass: string;
  iconClass: string;
  addBtnClass: string;
}
export type ColumnColorOption = OpcaoCorColuna;

export const CORES_COLUNA: OpcaoCorColuna[] = [
  {
    id: "default",
    name: "Padrão (Cinza)",
    swatchBg: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
    bgClass: "bg-slate-200 dark:bg-slate-800",
    borderClass: "border-transparent",
    headerClass: "text-slate-900 dark:text-slate-100",
    badgeClass: "bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
    btnClass: "text-slate-700 hover:text-slate-950 hover:bg-slate-300 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700",
    iconClass: "text-slate-800 dark:text-slate-200",
    addBtnClass: "text-slate-800 hover:bg-slate-300 dark:text-slate-200 dark:hover:bg-slate-700",
  },
  {
    id: "blue",
    name: "Azul Oceano",
    swatchBg: "#2563eb",
    bgClass: "bg-blue-600 dark:bg-blue-700",
    borderClass: "border-transparent",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "sky",
    name: "Azul Céu",
    swatchBg: "#0284c7",
    bgClass: "bg-sky-500 dark:bg-sky-600",
    borderClass: "border-transparent",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "green",
    name: "Verde Esmeralda",
    swatchBg: "#059669",
    bgClass: "bg-emerald-600 dark:bg-emerald-700",
    borderClass: "border-transparent",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "lime",
    name: "Verde Limão",
    swatchBg: "#65a30d",
    bgClass: "bg-lime-600 dark:bg-lime-700",
    borderClass: "border-transparent",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "yellow",
    name: "Amarelo Âmbar",
    swatchBg: "#d97706",
    bgClass: "bg-amber-500 dark:bg-amber-600",
    borderClass: "border-transparent",
    headerClass: "text-slate-950 dark:text-white",
    badgeClass: "bg-black/15 text-slate-950 dark:bg-white/20 dark:text-white",
    btnClass: "text-slate-950/80 hover:text-slate-950 hover:bg-black/10 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/20",
    iconClass: "text-slate-950 dark:text-white",
    addBtnClass: "text-slate-950 hover:bg-black/10 dark:text-white dark:hover:bg-white/15",
  },
  {
    id: "amber",
    name: "Laranja Coral",
    swatchBg: "#ea580c",
    bgClass: "bg-orange-600 dark:bg-orange-700",
    borderClass: "border-transparent",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "red",
    name: "Vermelho Rubi",
    swatchBg: "#dc2626",
    bgClass: "bg-red-600 dark:bg-red-700",
    borderClass: "border-transparent",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "rose",
    name: "Rosa Suave",
    swatchBg: "#e11d48",
    bgClass: "bg-rose-600 dark:bg-rose-700",
    borderClass: "border-transparent",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "pink",
    name: "Rosa Vibrante",
    swatchBg: "#db2777",
    bgClass: "bg-pink-600 dark:bg-pink-700",
    borderClass: "border-transparent",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "purple",
    name: "Roxo Ametista",
    swatchBg: "#7c3aed",
    bgClass: "bg-purple-600 dark:bg-purple-700",
    borderClass: "border-transparent",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "indigo",
    name: "Azul Índigo",
    swatchBg: "#4f46e5",
    bgClass: "bg-indigo-600 dark:bg-indigo-700",
    borderClass: "border-transparent",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "teal",
    name: "Verde-Água / Teal",
    swatchBg: "#0d9488",
    bgClass: "bg-teal-600 dark:bg-teal-700",
    borderClass: "border-transparent",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "cyan",
    name: "Ciano",
    swatchBg: "#0891b2",
    bgClass: "bg-cyan-600 dark:bg-cyan-700",
    borderClass: "border-transparent",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "slate",
    name: "Cinza Escuro",
    swatchBg: "#475569",
    bgClass: "bg-slate-600 dark:bg-slate-700",
    borderClass: "border-transparent",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
  {
    id: "black",
    name: "Preto Profundo",
    swatchBg: "#0f172a",
    bgClass: "bg-slate-900 dark:bg-black",
    borderClass: "border-transparent",
    headerClass: "text-white",
    badgeClass: "bg-white/20 text-white",
    btnClass: "text-white/85 hover:text-white hover:bg-white/20",
    iconClass: "text-white",
    addBtnClass: "text-white hover:bg-white/15",
  },
];

export const COLUMN_COLORS = CORES_COLUNA;

export function obterEstiloCorColuna(colorId?: string | null): OpcaoCorColuna {
  if (!colorId || colorId === "default") {
    return CORES_COLUNA[0];
  }
  const match = CORES_COLUNA.find((c) => c.id === colorId);
  return match ?? CORES_COLUNA[0];
}
export const getColumnColorStyle = obterEstiloCorColuna;
