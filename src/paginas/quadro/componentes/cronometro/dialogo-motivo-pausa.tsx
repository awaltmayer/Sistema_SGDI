import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/componentes/ui/dialogo-alerta";
import { Button } from "@/componentes/base/botao";
import { Textarea } from "@/componentes/ui/area-texto";
import { IconPlayerPause, IconAlertCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utilitarios";
import "./dialogo-motivo-pausa.css";

export interface PropsDialogoMotivoPausa {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardTitle: string;
  onConfirm: (reason: string) => void;
  // Aliases compatibilidade
  aberto?: boolean;
  aoMudarAberto?: (aberto: boolean) => void;
  tituloCartao?: string;
  aoConfirmar?: (motivo: string) => void;
}
export type PauseReasonDialogProps = PropsDialogoMotivoPausa;

export const MOTIVOS_RAPIDOS = [
  "Reunião de alinhamento com equipe",
  "Intervalo / Almoço",
  "Aguardando aprovação / cliente",
  "Bloqueio técnico / dependência",
  "Revisão de código / PR Review",
  "Atendimento urgente",
];
export const QUICK_REASONS = MOTIVOS_RAPIDOS;

export function DialogoMotivoPausa({
  open,
  onOpenChange,
  cardTitle,
  onConfirm,
  aberto,
  aoMudarAberto,
  tituloCartao,
  aoConfirmar,
}: PropsDialogoMotivoPausa) {
  const estaAberto = aberto ?? open;
  const mudarAberto = aoMudarAberto ?? onOpenChange;
  const titulo = tituloCartao ?? cardTitle;
  const confirmar = aoConfirmar ?? onConfirm;

  const [motivo, setMotivo] = useState("");
  const [rapidoSelecionado, setRapidoSelecionado] = useState<string | null>(null);
  const [erro, setErro] = useState(false);

  const selecionarRapido = (r: string) => {
    setRapidoSelecionado(r);
    setMotivo(r);
    setErro(false);
  };

  const confirmarPausa = () => {
    if (!motivo.trim()) {
      setErro(true);
      return;
    }
    confirmar(motivo.trim());
    setMotivo("");
    setRapidoSelecionado(null);
    setErro(false);
    mudarAberto(false);
  };

  const cancelarPausa = () => {
    setMotivo("");
    setRapidoSelecionado(null);
    setErro(false);
    mudarAberto(false);
  };

  return (
    <AlertDialog open={estaAberto} onOpenChange={mudarAberto}>
      <AlertDialogContent
        className="max-w-md"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <AlertDialogHeader>
          <div className="sgdi-motivo-pausa-header">
            <IconPlayerPause className="size-5" />
            <AlertDialogTitle className="text-foreground">
              Pausar Cronômetro
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Informe a justificativa para pausar o trabalho na tarefa{" "}
            <span className="font-semibold text-foreground">
              &ldquo;{titulo}&rdquo;
            </span>
            . Esta informação será salva no histórico de auditoria.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Motivos Frequentes:
            </label>
            <div className="sgdi-motivos-tags-grid">
              {MOTIVOS_RAPIDOS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => selecionarRapido(r)}
                  className={cn(
                    'sgdi-motivo-tag-btn',
                    rapidoSelecionado === r ? 'selecionado' : 'nao-selecionado'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Justificativa / Observação detalhada:{" "}
              <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Descreva o motivo da pausa..."
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                if (e.target.value.trim()) setErro(false);
              }}
              className={cn(
                'mt-1 text-sm',
                erro && "border-destructive focus-visible:ring-destructive"
              )}
              rows={3}
            />
            {erro && (
              <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                <IconAlertCircle className="size-3.5" />
                A justificativa da pausa é obrigatória.
              </p>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={cancelarPausa}>
            Cancelar
          </Button>
          <Button onClick={confirmarPausa}>Confirmar Pausa</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const PauseReasonDialog = DialogoMotivoPausa;
