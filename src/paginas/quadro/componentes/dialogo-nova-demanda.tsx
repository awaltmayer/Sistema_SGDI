import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/componentes/ui/dialogo';
import { Button } from '@/componentes/base/botao';
import { Input } from '@/componentes/ui/campo-texto';
import { Textarea } from '@/componentes/ui/area-texto';
import { Label } from '@/componentes/ui/rotulo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/componentes/ui/menu-selecao';
import { useDataProvider } from '@/lib/provedor-dados';
import { columns, complexityConfig, type ColumnId, type Priority, type Complexity } from '@/dados/dados-iniciais';
import { toast } from 'sonner';
import { IconPlus, IconLoader2, IconSparkles } from '@tabler/icons-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/componentes/ui/avatar';
import './dialogo-nova-demanda.css';

export interface PropsDialogoNovaDemanda {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Aliases compatibilidade
  aberto?: boolean;
  aoMudarAberto?: (aberto: boolean) => void;
}

export function DialogoNovaDemanda({
  open,
  onOpenChange,
  aberto,
  aoMudarAberto,
}: PropsDialogoNovaDemanda) {
  const estaAberto = aberto ?? open;
  const mudarAberto = aoMudarAberto ?? onOpenChange;

  const { useCreateCard, useUpdateCard, useCards, useTeamMembers } = useDataProvider();
  const { mutate: createCard, isPending: estaCriando } = useCreateCard();
  const { mutate: updateCard } = useUpdateCard();
  const { data: cartoes = [] } = useCards();
  const { data: membros = [] } = useTeamMembers();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [coluna, setColuna] = useState<ColumnId>('todo');
  const [prioridade, setPrioridade] = useState<Priority>('medium');
  const [complexidade, setComplexidade] = useState<Complexity>('medium');
  const [idResponsavel, setIdResponsavel] = useState<string>('none');
  const [dataVencimento, setDataVencimento] = useState('');

  const redefinirFormulario = () => {
    setTitulo('');
    setDescricao('');
    setColuna('todo');
    setPrioridade('medium');
    setComplexidade('medium');
    setIdResponsavel('none');
    setDataVencimento('');
  };

  const enviarFormulario = (e: React.FormEvent) => {
    e.preventDefault();
    const tituloLimpo = titulo.trim();
    if (!tituloLimpo) {
      toast.error('Informe o título da demanda');
      return;
    }

    const cartoesDaColuna = cartoes.filter((c) => c.column === coluna);
    const proximaPosicao = cartoesDaColuna.length;

    createCard({
      title: tituloLimpo,
      column: coluna,
      nextPosition: proximaPosicao,
    });

    // TODO: salvar campos adicionais (descricao, responsavel, vencimento)
    setTimeout(() => {
      const correspondente = cartoes.find((c) => c.title === tituloLimpo && c.column === coluna);
      if (correspondente) {
        updateCard(correspondente.id, {
          priority: prioridade,
          complexity: complexidade,
        });
      }
    }, 400);

    toast.success('Demanda criada com sucesso!');
    redefinirFormulario();
    mudarAberto(false);
  };

  return (
    <Dialog open={estaAberto} onOpenChange={mudarAberto}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={enviarFormulario}>
          <DialogHeader>
            <div className="sgdi-dialogo-demanda-header">
              <div className="sgdi-dialogo-demanda-icone">
                <IconSparkles className="size-5" />
              </div>
              <div>
                <DialogTitle>Nova Demanda</DialogTitle>
                <DialogDescription>
                  Crie e atribua uma nova tarefa no quadro de gestão.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="sgdi-dialogo-demanda-corpo">
            {/* Título */}
            <div className="sgdi-dialogo-campo">
              <Label htmlFor="demand-title" className="text-xs font-semibold">
                Título da Demanda <span className="text-destructive">*</span>
              </Label>
              <Input
                id="demand-title"
                placeholder="Ex: Implementar autenticação via OAuth"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Descrição */}
            <div className="sgdi-dialogo-campo">
              <Label htmlFor="demand-desc" className="text-xs font-semibold">
                Descrição ou Critérios de Aceite
              </Label>
              <Textarea
                id="demand-desc"
                placeholder="Descreva detalhes, objetivos ou links importantes..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>

            {/* Linha 1: Coluna e Prioridade */}
            <div className="sgdi-dialogo-grid-2">
              <div className="sgdi-dialogo-campo">
                <Label className="text-xs font-semibold">Coluna Inicial</Label>
                <Select value={coluna} onValueChange={(v) => setColuna(v as ColumnId)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col.id} value={col.id} className="text-xs">
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sgdi-dialogo-campo">
                <Label className="text-xs font-semibold">Prioridade</Label>
                <Select value={prioridade} onValueChange={(v) => setPrioridade(v as Priority)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high" className="text-xs text-rose-600 font-medium">
                      Alta Prioridade
                    </SelectItem>
                    <SelectItem value="medium" className="text-xs text-amber-600 font-medium">
                      Média Prioridade
                    </SelectItem>
                    <SelectItem value="low" className="text-xs text-emerald-600 font-medium">
                      Baixa Prioridade
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Linha 2: Complexidade e Responsável */}
            <div className="sgdi-dialogo-grid-2">
              <div className="sgdi-dialogo-campo">
                <Label className="text-xs font-semibold">Complexidade</Label>
                <Select value={complexidade} onValueChange={(v) => setComplexidade(v as Complexity)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(complexityConfig) as Complexity[]).map((cKey) => (
                      <SelectItem key={cKey} value={cKey} className="text-xs">
                        {complexityConfig[cKey].label} (~{complexityConfig[cKey].estimatedHours}h)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sgdi-dialogo-campo">
                <Label className="text-xs font-semibold">Responsável</Label>
                <Select value={idResponsavel} onValueChange={setIdResponsavel}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Selecione um membro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs text-muted-foreground">
                      Não atribuído
                    </SelectItem>
                    {membros.map((m) => (
                      <SelectItem key={m.id} value={m.id} className="text-xs">
                        <div className="sgdi-dialogo-responsavel-item">
                          <Avatar className="size-4">
                            {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                            <AvatarFallback className="text-[9px]">{m.initials}</AvatarFallback>
                          </Avatar>
                          <span>{m.full_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Linha 3: Data de Vencimento */}
            <div className="sgdi-dialogo-campo">
              <Label htmlFor="demand-due" className="text-xs font-semibold">
                Prazo Final / Data de Entrega
              </Label>
              <Input
                id="demand-due"
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => mudarAberto(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={estaCriando || !titulo.trim()} className="gap-1.5">
              {estaCriando ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <IconPlus className="size-4" />
                  Criar Demanda
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
