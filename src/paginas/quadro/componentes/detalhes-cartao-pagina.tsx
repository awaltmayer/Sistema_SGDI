import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  IconColumns,
  IconFlag,
  IconUser,
  IconCalendar,
  IconFileX,
  IconSquareCheck,
  IconPalette,
  IconCheck,
  IconGauge,
  IconTrash,
} from '@tabler/icons-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/componentes/ui/trilha-navegacao';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/componentes/ui/menu-selecao';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/componentes/ui/dialogo-alerta';
import { Separator } from '@/componentes/ui/separador';
import { Input } from '@/componentes/ui/campo-texto';
import { Textarea } from '@/componentes/ui/area-texto';
import { Avatar, AvatarFallback, AvatarImage } from '@/componentes/ui/avatar';
import { Button } from '@/componentes/base/botao';
import { Badge } from '@/componentes/base/distintivo';
import { Card, CardContent } from '@/componentes/ui/cartao';
import { Skeleton } from '@/componentes/ui/esquema-carregamento';
import { Calendar } from '@/componentes/ui/calendario';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/componentes/ui/painel-flutuante';
import { useDataProvider } from '@/lib/provedor-dados';
import { columns, complexityConfig } from '@/dados/dados-iniciais';
import type { Priority, ColumnId, TeamMember, Complexity } from '@/dados/dados-iniciais';
import { priorityConfig } from './seletor-prioridade';
import { ColumnIcon } from './icone-coluna';
import { BoardTopBar } from './barra-superior-quadro';
import { CardChecklistsContainer } from './lista-verificacao/container-listas-verificacao';
import { AddChecklistPopover } from './lista-verificacao/seletor-adicionar-lista';
import { CardTimerWidget } from './cronometro/widget-cronometro-cartao';
import { CARD_COLORS, getCardColorStyle } from './configuracao-cores-cartao';
import './detalhes-cartao-pagina.css';

export interface PropsPaginaDetalhesCartao {
  basePath: string;
  caminhoBase?: string;
}
export type CardDetailPageProps = PropsPaginaDetalhesCartao;

export function PaginaDetalhesCartao({ basePath, caminhoBase }: PropsPaginaDetalhesCartao) {
  const rotaBase = caminhoBase ?? basePath;
  const { cardId } = useParams<{ cardId: string }>();
  const _navegar = useNavigate();
  const {
    useCard,
    useUpdateCard,
    useComments,
    useTeamMembers,
    useCurrentUser,
  } = useDataProvider();

  const { data: cartao, isLoading: carregando } = useCard(cardId ?? '');
  const { mutate: updateCard } = useUpdateCard();
  const { data: membros = [] } = useTeamMembers();
  const { data: usuarioAtual } = useCurrentUser();
  const { data: comentarios = [] } = useComments(cardId ?? '');

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [textoComentario, setTextoComentario] = useState('');
  const refInicial = useRef<string | null>(null);

  const lidarComMudancaStatus = (novaCol: ColumnId) => {
    if (!cartao || novaCol === cartao.column) return;
    updateCard(cartao.id, { column: novaCol });
  };

  useEffect(() => {
    if (cartao && cartao.id !== refInicial.current) {
      setTitulo(cartao.title);
      setDescricao(cartao.description);
      refInicial.current = cartao.id;
    }
  }, [cartao]);

  if (carregando) {
    return (
      <div className="flex h-dvh flex-col">
        <BoardTopBar />
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl px-6 py-6">
            <Skeleton className="mb-4 h-4 w-48" />
            <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_280px]">
              <div className="space-y-6">
                <Skeleton className="h-9 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-[140px] w-full" />
                </div>
                <Separator />
                <div className="space-y-4">
                  <Skeleton className="h-5 w-32" />
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="size-7 shrink-0 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <aside className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </aside>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cartao) {
    return (
      <div className="flex h-dvh flex-col">
        <BoardTopBar />
        <div className="flex flex-1 items-center justify-center p-6">
          <Card className="max-w-sm shadow-lg">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <IconFileX className="size-6 text-foreground" />
              <div className="space-y-1">
                <p className="text-foreground font-medium">Cartão não encontrado</p>
                <p className="text-sm text-muted-foreground text-pretty">
                  O cartão que você procura pode ter sido excluído ou movido.
                </p>
              </div>
              <Button asChild>
                <Link to={rotaBase}>Voltar ao quadro</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const salvarTitulo = () => {
    if (titulo !== cartao.title) updateCard(cartao.id, { title: titulo });
  };

  const salvarDescricao = () => {};

  const excluirCartao = () => {};

  const adicionarComentario = () => {
    setTextoComentario('');
  };

  const responsavel = cartao.assignee ?? encontrarMembro(membros, cartao.assignee_id);
  const colunaAtual = columns.find((c) => c.id === cartao.column);
  const eu =
    (usuarioAtual && membros.find((m) => m.email === usuarioAtual.email)) ||
    membros.find((m) => m.role === 'owner') ||
    membros[0];

  return (
    <div className="flex h-dvh flex-col">
      <BoardTopBar />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={rotaBase}>Quadro</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[40ch] truncate">{cartao.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_280px]">
            <div className="space-y-6">
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                onBlur={salvarTitulo}
                className="h-auto -mx-2 -my-1 rounded-md border-none bg-transparent px-2 py-1 text-3xl md:text-3xl font-semibold tracking-tight text-balance shadow-none transition-colors hover:bg-accent focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring"
              />

              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Descrição</p>
                <Textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  onBlur={salvarDescricao}
                  placeholder="Adicione uma descrição…"
                  className="min-h-[140px] resize-y border-none bg-transparent text-sm shadow-none transition-colors hover:bg-accent focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring -mx-2 px-2"
                />
              </div>

              <Separator />

              <CardChecklistsContainer cardId={cartao.id} checklists={cartao.checklists ?? []} />

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-foreground">Comentários</p>
                  {(comentarios ?? []).length > 0 && (
                    <Badge color="gray">{(comentarios ?? []).length}</Badge>
                  )}
                </div>
                {(comentarios ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Ainda não há comentários. Inicie a conversa.
                  </p>
                )}
                {(comentarios ?? []).map((comment) => {
                  const autor = encontrarMembro(membros, comment.author_id);
                  let dataFormatada = '';
                  try {
                    const d = parseISO(comment.created_at);
                    dataFormatada = isNaN(d.getTime()) ? '' : format(d, 'MMM d');
                  } catch {
                    dataFormatada = '';
                  }
                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="size-7 shrink-0">
                        {autor?.avatar_url && (
                          <AvatarImage src={autor.avatar_url} alt={autor.full_name} />
                        )}
                        <AvatarFallback className="text-xs">
                          {autor?.initials ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {autor?.full_name ?? 'Desconhecido'}
                          </span>
                          {dataFormatada && (
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {dataFormatada}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground text-pretty">{comment.body}</p>
                      </div>
                    </div>
                  );
                })}

                <div className="flex gap-3 pt-2">
                  <Avatar className="size-7 shrink-0">
                    {eu?.avatar_url && <AvatarImage src={eu.avatar_url} alt={eu.full_name} />}
                    <AvatarFallback className="text-xs">{eu?.initials ?? '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={textoComentario}
                      onChange={(e) => setTextoComentario(e.target.value)}
                      placeholder="Adicionar um comentário…"
                      className="min-h-[72px] resize-y text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          adicionarComentario();
                        }
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        ⌘ Enter para publicar
                      </span>
                      <Button
                        size="sm"
                        onClick={adicionarComentario}
                        disabled={!textoComentario.trim()}
                      >
                        Adicionar comentário
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6 text-sm">
              <CardTimerWidget
                cardId={cartao.id}
                cardTitle={cartao.title}
                timeTracker={cartao.time_tracker}
              />

              <LinhaCampo icon={IconColumns} label="Status">
                <Select
                  value={cartao.column ?? 'todo'}
                  onValueChange={(v) => lidarComMudancaStatus(v as ColumnId)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue>
                      {colunaAtual && (
                        <span className="flex items-center gap-2">
                          <ColumnIcon name={colunaAtual.icon} className="size-4 text-foreground" />
                          {colunaAtual.label}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        <span className="flex items-center gap-2">
                          <ColumnIcon name={col.icon} className="size-4 text-foreground" />
                          {col.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </LinhaCampo>

              <LinhaCampo icon={IconFlag} label="Prioridade">
                <Select
                  value={cartao.priority ?? 'medium'}
                  onValueChange={(v) => updateCard(cartao.id, { priority: v as Priority })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        <span className="flex items-center gap-2">
                          <span className={`size-2 rounded-full ${priorityConfig[p]?.dot ?? 'bg-amber-500'}`} />
                          {priorityConfig[p]?.label ?? p}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </LinhaCampo>

              <LinhaCampo icon={IconGauge} label="Complexidade">
                <Select
                  value={cartao.complexity ?? 'medium'}
                  onValueChange={(v) =>
                    updateCard(cartao.id, { complexity: v as Complexity })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['low', 'medium', 'high', 'very-high'] as Complexity[]).map((c) => (
                      <SelectItem key={c} value={c}>
                        <span className="flex items-center gap-2">
                          <span className={`size-2 rounded-full ${complexityConfig[c]?.dot ?? 'bg-blue-500'}`} />
                          <span>{complexityConfig[c]?.label ?? c}</span>
                          <span className="text-[10px] text-muted-foreground">
                            (~{complexityConfig[c]?.estimatedHours ?? 0}h)
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </LinhaCampo>

              <LinhaCampo icon={IconUser} label="Responsável">
                <Select
                  value={cartao.assignee_id ?? 'unassigned'}
                  onValueChange={(_v) => {
                  }}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue>
                      {responsavel ? (
                        <span className="flex items-center gap-2">
                          <Avatar className="size-4">
                            {responsavel.avatar_url && (
                              <AvatarImage src={responsavel.avatar_url} alt={responsavel.full_name} />
                            )}
                            <AvatarFallback className="text-[10px]">
                              {responsavel.initials}
                            </AvatarFallback>
                          </Avatar>
                          {responsavel.full_name}
                        </span>
                      ) : (
                        'Não atribuído'
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(membros ?? []).map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        <span className="flex items-center gap-2">
                          <Avatar className="size-4">
                            {m.avatar_url && (
                              <AvatarImage src={m.avatar_url} alt={m.full_name} />
                            )}
                            <AvatarFallback className="text-[10px]">
                              {m.initials}
                            </AvatarFallback>
                          </Avatar>
                          {m.full_name}
                        </span>
                      </SelectItem>
                    ))}
                    <SelectItem value="unassigned">Não atribuído</SelectItem>
                  </SelectContent>
                </Select>
              </LinhaCampo>

              <LinhaCampo icon={IconCalendar} label="Data de vencimento">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-8 w-full justify-start ${cartao.due_date ? '' : 'text-muted-foreground'}`}
                    >
                      {cartao.due_date
                        ? (() => {
                            try {
                              const d = parseISO(cartao.due_date);
                              return isNaN(d.getTime()) ? 'Data inválida' : format(d, 'MMM d, yyyy');
                            } catch {
                              return cartao.due_date;
                            }
                          })()
                        : 'Definir vencimento…'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={cartao.due_date ? (() => {
                        try {
                          const d = parseISO(cartao.due_date);
                          return isNaN(d.getTime()) ? undefined : d;
                        } catch {
                          return undefined;
                        }
                      })() : undefined}
                      onSelect={(_d) => {
                      }}
                      defaultMonth={cartao.due_date ? (() => {
                        try {
                          const d = parseISO(cartao.due_date);
                          return isNaN(d.getTime()) ? undefined : d;
                        } catch {
                          return undefined;
                        }
                      })() : undefined}
                    />
                  </PopoverContent>
                </Popover>
              </LinhaCampo>

              <LinhaCampo icon={IconSquareCheck} label="Checklists">
                <AddChecklistPopover
                  cardId={cartao.id}
                  checklists={cartao.checklists ?? []}
                  align="start"
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-full justify-between font-normal text-muted-foreground hover:text-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <IconSquareCheck className="size-4 text-primary" />
                        <span>Adicionar checklist</span>
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {(cartao.checklists ?? []).length}/5
                      </span>
                    </Button>
                  }
                />
              </LinhaCampo>

              <LinhaCampo icon={IconPalette} label="Cor do cartão">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-full justify-between font-normal"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="size-3.5 rounded-full border border-border"
                          style={{
                            background: getCardColorStyle(cartao.color).swatchBg,
                          }}
                        />
                        <span>{getCardColorStyle(cartao.color).name}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">Alterar</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="start">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <span className="text-xs font-semibold text-foreground">
                          Paleta de Cores
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Contraste automático
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-2 pt-1">
                        {CARD_COLORS.map((col) => {
                          const estaSelecionado =
                            (cartao.color ?? "default") === col.id ||
                            (!cartao.color && col.id === "default");
                          return (
                            <button
                              key={col.id}
                              type="button"
                              title={col.name}
                              aria-label={`Cor ${col.name}`}
                              onClick={() => {
                              }}
                              className={`relative flex size-9 items-center justify-center rounded-full transition-transform hover:scale-110 focus:outline-none ${
                                estaSelecionado
                                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                  : "border border-border/80 shadow-xs"
                              }`}
                              style={{ background: col.swatchBg }}
                            >
                              {estaSelecionado && (
                                <IconCheck
                                  className={`size-4 stroke-[3] ${
                                    col.isDark ? "text-white" : "text-slate-900"
                                  }`}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </LinhaCampo>

              <Separator />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-start font-medium text-muted-foreground hover:text-destructive">
                    <IconTrash className="size-4" />
                    Excluir cartão
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir cartão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza de que deseja excluir &ldquo;{cartao.title}&rdquo;? Esta ação
                      não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={excluirCartao}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir cartão
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PropsLinhaCampo {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}

function LinhaCampo({ icon: Icon, label, children }: PropsLinhaCampo) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-sm">
        <Icon className="size-4 text-primary" />
        <span className="text-muted-foreground">{label}</span>
      </div>
      {children}
    </div>
  );
}

function encontrarMembro(members: TeamMember[], id: string | null) {
  if (!id) return undefined;
  return members.find((m) => m.id === id);
}

export const CardDetailPage = PaginaDetalhesCartao;
export const DetalhesCartaoPagina = PaginaDetalhesCartao;
export default PaginaDetalhesCartao;
