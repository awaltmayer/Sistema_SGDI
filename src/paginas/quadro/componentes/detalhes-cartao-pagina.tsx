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
import { colunas } from '@/dados/dados-iniciais';
import type { Prioridade, IdColuna, MembroEquipe } from '@/dados/dados-iniciais';
import { priorityConfig } from './seletor-prioridade';
import { ColumnIcon } from './icone-coluna';
import { BoardTopBar } from './barra-superior-quadro';
import { CardChecklistsContainer } from './lista-verificacao/container-listas-verificacao';
import { AddChecklistPopover } from './lista-verificacao/seletor-adicionar-lista';
import { CardTimerWidget } from './cronometro/widget-cronometro-cartao';
import './detalhes-cartao-pagina.css';

export interface PropsPaginaDetalhesCartao {
  basePath: string;
  caminhoBase?: string;
}
export type CardDetailPageProps = PropsPaginaDetalhesCartao;

export function PaginaDetalhesCartao({ basePath, caminhoBase }: PropsPaginaDetalhesCartao) {
  const rotaBase = caminhoBase ?? basePath;
  const { cardId } = useParams<{ cardId: string }>();
  const navegar = useNavigate();
  const {
    useCard,
    useUpdateCard,
    useDeleteCard,
    useComments,
    useTeamMembers,
    useCurrentUser,
  } = useDataProvider();

  const { data: cartao, isLoading: carregando } = useCard(cardId ?? '');
  const { mutate: updateCard } = useUpdateCard();
  const { mutate: deleteCard } = useDeleteCard();
  const { data: membros = [] } = useTeamMembers();
  const { data: usuarioAtual } = useCurrentUser();
  const { data: comentarios = [] } = useComments(cardId ?? '');

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [textoComentario, setTextoComentario] = useState('');
  const refInicial = useRef<string | null>(null);

  const lidarComMudancaStatus = (novaCol: IdColuna) => {
    if (!cartao) return;
    updateCard(cartao.id, { coluna: novaCol, column: novaCol });
  };

  useEffect(() => {
    if (cartao && cartao.id !== refInicial.current) {
      setTitulo(cartao.titulo ?? cartao.title ?? '');
      setDescricao(cartao.descricao ?? cartao.description ?? '');
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
    const atual = cartao.titulo ?? cartao.title;
    if (titulo !== atual) updateCard(cartao.id, { titulo, title: titulo });
  };

  const salvarDescricao = () => {
    const atual = cartao.descricao ?? cartao.description;
    if (cartao && descricao !== atual) {
      updateCard(cartao.id, { descricao, description: descricao });
    }
  };

  const excluirCartao = () => {
    if (!cartao) return;
    deleteCard(cartao.id);
    navegar(rotaBase);
  };

  const adicionarComentario = () => {
    setTextoComentario('');
  };

  const tituloCartao = cartao.titulo ?? cartao.title;
  const colCartao = cartao.coluna ?? cartao.column;
  const prioCartao = cartao.prioridade ?? cartao.priority;
  const respIdCartao = cartao.id_responsavel ?? cartao.assignee_id;
  const respCartao = cartao.responsavel ?? cartao.assignee ?? encontrarMembro(membros, respIdCartao);
  const dataVencCartao = cartao.data_vencimento ?? cartao.due_date;
  const listasCartao = cartao.listas_verificacao ?? cartao.checklists ?? [];
  const rastreadorCartao = cartao.rastreador_tempo ?? cartao.time_tracker;
  const colunaAtual = colunas.find((c) => c.id === colCartao);
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
                <BreadcrumbPage className="max-w-[40ch] truncate">
                  <span className="font-mono font-semibold text-muted-foreground mr-1">#{cartao.id}</span>
                  {tituloCartao}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_280px]">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl md:text-3xl font-mono font-bold text-muted-foreground select-none">
                  #{cartao.id}
                </span>
                <Input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  onBlur={salvarTitulo}
                  className="h-auto -mx-2 -my-1 rounded-md border-none bg-transparent px-2 py-1 text-3xl md:text-3xl font-semibold tracking-tight text-balance shadow-none transition-colors hover:bg-accent focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring flex-1"
                />
              </div>

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

              <CardChecklistsContainer cardId={cartao.id} checklists={listasCartao} />

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
                  const autor = encontrarMembro(membros, comment.id_autor || comment.author_id);
                  let dataFormatada = '';
                  try {
                    const dataStr = comment.criado_em || comment.created_at || '';
                    const d = parseISO(dataStr);
                    dataFormatada = isNaN(d.getTime()) ? '' : format(d, 'MMM d');
                  } catch {
                    dataFormatada = '';
                  }
                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="size-7 shrink-0">
                        {(autor?.url_avatar || autor?.avatar_url) && (
                          <AvatarImage src={autor.url_avatar || autor.avatar_url!} alt={autor.nome_completo || autor.full_name} />
                        )}
                        <AvatarFallback className="text-xs">
                          {autor?.iniciais ?? autor?.initials ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {autor?.nome_completo ?? autor?.full_name ?? 'Desconhecido'}
                          </span>
                          {dataFormatada && (
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {dataFormatada}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground text-pretty">{comment.conteudo || comment.body}</p>
                      </div>
                    </div>
                  );
                })}

                <div className="flex gap-3 pt-2">
                  <Avatar className="size-7 shrink-0">
                    {(eu?.url_avatar || eu?.avatar_url) && (
                      <AvatarImage src={eu.url_avatar || eu.avatar_url!} alt={eu.nome_completo || eu.full_name} />
                    )}
                    <AvatarFallback className="text-xs">{eu?.iniciais ?? eu?.initials ?? '?'}</AvatarFallback>
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
                cardTitle={tituloCartao}
                timeTracker={rastreadorCartao}
              />

              <LinhaCampo icon={IconColumns} label="Status">
                <Select
                  value={colCartao}
                  onValueChange={(v) => lidarComMudancaStatus(v as IdColuna)}
                >
                  <SelectTrigger className="w-full text-xs">
                    <div className="flex items-center gap-1.5">
                      <ColumnIcon name={colunaAtual?.icon ?? 'circle-dashed'} className="size-3.5" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {colunas.map((col) => (
                      <SelectItem key={col.id} value={col.id} className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <ColumnIcon name={col.icon} className="size-3.5" />
                          {col.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </LinhaCampo>

              <LinhaCampo icon={IconFlag} label="Prioridade">
                <Select
                  value={prioCartao}
                  onValueChange={(v) => updateCard(cartao.id, { prioridade: v as Prioridade, priority: v as Prioridade })}
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['high', 'medium', 'low'] as Prioridade[]).map((p) => (
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

              <LinhaCampo icon={IconUser} label="Responsável">
                <Select
                  value={respIdCartao ?? 'unassigned'}
                  onValueChange={(val) => {
                    const novoId = val === 'unassigned' ? null : val;
                    updateCard(cartao.id, { id_responsavel: novoId, assignee_id: novoId });
                  }}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue>
                      {respCartao ? (
                        <span className="flex items-center gap-2">
                          <Avatar className="size-4">
                            {(respCartao.url_avatar || respCartao.avatar_url) && (
                              <AvatarImage src={respCartao.url_avatar || respCartao.avatar_url!} alt={respCartao.nome_completo || respCartao.full_name} />
                            )}
                            <AvatarFallback className="text-[10px]">
                              {respCartao.iniciais || respCartao.initials}
                            </AvatarFallback>
                          </Avatar>
                          {respCartao.nome_completo || respCartao.full_name}
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
                            {(m.url_avatar || m.avatar_url) && (
                              <AvatarImage src={m.url_avatar || m.avatar_url!} alt={m.nome_completo || m.full_name} />
                            )}
                            <AvatarFallback className="text-[10px]">
                              {m.iniciais || m.initials}
                            </AvatarFallback>
                          </Avatar>
                          {m.nome_completo || m.full_name}
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
                      className={`h-8 w-full justify-start ${dataVencCartao ? '' : 'text-muted-foreground'}`}
                    >
                      {dataVencCartao
                        ? (() => {
                            try {
                              const d = parseISO(dataVencCartao);
                              return isNaN(d.getTime()) ? 'Data inválida' : format(d, 'MMM d, yyyy');
                            } catch {
                              return dataVencCartao;
                            }
                          })()
                        : 'Definir vencimento…'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataVencCartao ? (() => {
                        try {
                          const d = parseISO(dataVencCartao);
                          return isNaN(d.getTime()) ? undefined : d;
                        } catch {
                          return undefined;
                        }
                      })() : undefined}
                      onSelect={(_d) => {
                      }}
                      defaultMonth={dataVencCartao ? (() => {
                        try {
                          const d = parseISO(dataVencCartao);
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
                  checklists={listasCartao}
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
                        {listasCartao.length}/5
                      </span>
                    </Button>
                  }
                />
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
                    <AlertDialogTitle>Excluir cartão #{cartao.id}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza de que deseja excluir &ldquo;{tituloCartao}&rdquo;? Esta ação
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

function encontrarMembro(members: MembroEquipe[], id: string | null) {
  return members.find((m) => m.id === id) ?? null;
}

export const CardDetailPage = PaginaDetalhesCartao;
export const DetalhesCartaoPagina = PaginaDetalhesCartao;
export default PaginaDetalhesCartao;
