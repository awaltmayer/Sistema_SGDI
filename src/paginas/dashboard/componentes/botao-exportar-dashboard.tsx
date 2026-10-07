import { useState } from 'react';
import { IconDownload, IconFileSpreadsheet, IconFileTypePdf, IconAlertTriangle } from '@tabler/icons-react';
import { Button } from '@/componentes/base/botao';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/componentes/ui/painel-flutuante';
import {
  exportarExcelDashboard,
  exportarPdfDashboard,
  extrairDemandasAtrasadas,
  type ParametrosExportacaoDashboard,
} from '../exportador-dashboard';

export interface PropsBotaoExportarDashboard extends ParametrosExportacaoDashboard {
  className?: string;
}

export function BotaoExportarDashboard(props: PropsBotaoExportarDashboard) {
  const [aberto, setAberto] = useState(false);
  const atrasadas = extrairDemandasAtrasadas(props.cartoes);
  const totalAtrasadas = atrasadas.length;

  const lidarComExportarExcel = () => {
    setAberto(false);
    exportarExcelDashboard(props);
  };

  const lidarComExportarPdf = () => {
    setAberto(false);
    exportarPdfDashboard(props);
  };

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-7 px-2.5 text-xs gap-1.5 border-0 bg-card hover:bg-muted text-foreground transition-colors cursor-pointer rounded-sm ${props.className || ''}`}
          title="Exportar apenas demandas atrasadas nos formatos Excel e PDF"
        >
          <IconDownload className="size-3.5 text-muted-foreground shrink-0" />
          <span>Exportar</span>
          {totalAtrasadas > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-xs text-[10px] font-bold bg-red-600 text-white">
              {totalAtrasadas}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="w-48 p-2 bg-popover border-0 shadow-xl rounded-md text-popover-foreground space-y-1.5 z-50"
      >
        <div className="px-1 py-0.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Apenas Atrasadas
        </div>

        <div className="flex flex-col gap-1">
          {/* Opção Excel */}
          <button
            type="button"
            onClick={lidarComExportarExcel}
            disabled={totalAtrasadas === 0}
            className="flex items-center gap-2 p-2 rounded-sm border-0 bg-muted/40 hover:bg-muted/70 text-left transition-colors cursor-pointer text-xs font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="p-1 rounded-xs bg-emerald-600 text-white shrink-0">
              <IconFileSpreadsheet className="size-3.5" />
            </div>
            <span>Planilha Excel</span>
          </button>

          {/* Opção PDF */}
          <button
            type="button"
            onClick={lidarComExportarPdf}
            disabled={totalAtrasadas === 0}
            className="flex items-center gap-2 p-2 rounded-sm border-0 bg-muted/40 hover:bg-muted/70 text-left transition-colors cursor-pointer text-xs font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="p-1 rounded-xs bg-red-600 text-white shrink-0">
              <IconFileTypePdf className="size-3.5" />
            </div>
            <span>Documento PDF</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
