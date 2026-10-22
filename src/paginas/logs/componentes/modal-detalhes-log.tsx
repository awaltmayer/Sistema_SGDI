import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/componentes/ui/dialogo';
import type { LogAuditoria } from '@/tipos/auditoria';

interface PropsModalDetalhesLog {
  log: LogAuditoria | null;
  aoFechar: () => void;
}

export function ModalDetalhesLog({ log, aoFechar }: PropsModalDetalhesLog) {
  if (!log) return null;

  return (
    <Dialog open={Boolean(log)} onOpenChange={(aberto) => !aberto && aoFechar()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Registro de Auditoria #{log.id}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {new Date(log.criado_em).toLocaleString('pt-BR')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-muted/40 border border-border">
            <div>
              <span className="text-muted-foreground block text-[11px] uppercase tracking-wider mb-0.5">
                Usuário Responsável
              </span>
              <span className="font-medium text-foreground">
                {log.usuario_nome}
              </span>
              {log.usuario_email && (
                <span className="text-muted-foreground block text-[11px]">
                  {log.usuario_email}
                </span>
              )}
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px] uppercase tracking-wider mb-0.5">
                Operação / Entidade
              </span>
              <span className="font-medium text-foreground">
                {log.acao} &bull; {log.entidade}
              </span>
              {log.entidade_id && (
                <span className="text-muted-foreground block text-[11px]">
                  ID: {log.entidade_id}
                </span>
              )}
            </div>
          </div>

          {log.entidade_titulo && (
            <div>
              <span className="text-muted-foreground block text-[11px] uppercase tracking-wider mb-0.5">
                Referência / Demanda
              </span>
              <div className="p-2.5 rounded-md bg-muted/20 border border-border font-medium">
                {log.entidade_titulo}
              </div>
            </div>
          )}

          <div>
            <span className="text-muted-foreground block text-[11px] uppercase tracking-wider mb-0.5">
              Descrição da Ação
            </span>
            <div className="p-2.5 rounded-md bg-muted/20 border border-border text-foreground">
              {log.detalhes}
            </div>
          </div>

          {log.metadados && Object.keys(log.metadados).length > 0 && (
            <div>
              <span className="text-muted-foreground block text-[11px] uppercase tracking-wider mb-0.5">
                Metadados do Evento (Payload Técnico)
              </span>
              <pre className="p-3 rounded-md bg-black/85 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48 border border-border">
                {JSON.stringify(log.metadados, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
