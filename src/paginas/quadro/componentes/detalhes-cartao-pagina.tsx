import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  IconColumns,
  IconFlag,
  IconUser,
  IconUserPlus,
  IconX,
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
import { useDataProvider } from '@/lib/provedor-dados';
import { colunas } from '@/dados/dados-iniciais';
import type { Prioridade, IdColuna, MembroEquipe } from '@/dados/dados-iniciais';
import { priorityConfig } from './seletor-prioridade';
import { ColumnIcon } from './icone-coluna';
import { BoardTopBar } from './barra-superior-quadro';
import { CardChecklistsContainer } from './lista-verificacao/container-listas-verificacao';
import { AddChecklistPopover } from './lista-verificacao/seletor-adicionar-lista';
import { CardTimerWidget } from './cronometro/widget-cronometro-cartao';
import { SeletorDataVencimento, calcularStatusPrazo } from './seletor-data-vencimento';
import { SeletorResponsavel } from './seletor-responsavel';
import { toast } from 'sonner';
import { cn } from '@/lib/utilitarios';
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
    useCreateComment,
    useDeleteComment,
    useTeamMembers,
    useCurrentUser,
  } = useDataProvider();

  const { data: cartao, isLoading: carregando } = useCard(cardId ?? '');
  const { mutate: updateCard } = useUpdateCard();
  const { mutate: deleteCard } = useDeleteCard();
  const { data: membros = [] } = useTeamMembers();
  const { data: usuarioAtual } = useCurrentUser();
  const { data: comentarios = [] } = useComments(cardId ?? '');
  const { mutate: createComment, isPending: criandoComentario } = useCreateComment();
  const { mutate: deleteComment, isPending: excluindoComentario } = useDeleteComment();

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

  const membroAtual =
    (usuarioAtual &&
      membros.find(
        (m) =>
          (m.email && usuarioAtual.email && m.email.toLowerCase() === usuarioAtual.email.toLowerCase()) ||
          String(m.id) === String(usuarioAtual.id) ||
          ((usuarioAtual as any).id_usuario && m.id_usuario && String(m.id_usuario) === String((usuarioAtual as any).id_usuario)) ||
          ((usuarioAtual as any).id_usuario && m.id_usuario_membro && String(m.id_usuario_membro) === String((usuarioAtual as any).id_usuario))
      )) ||
    membros.find((m) => m.role === 'owner') ||
    membros[0];

  const eu =
    membroAtual ??
    (usuarioAtual
      ? ({
        id: usuarioAtual.id,
        nome_completo: usuarioAtual.nome_completo || 'Usuário',
        iniciais: usuarioAtual.iniciais || 'U',
        email: usuarioAtual.email || '',
        url_avatar: usuarioAtual.url_avatar || null,
        role: 'member',
        funcao: 'member',
        status: 'active',
      } as MembroEquipe)
      : null);

  const adicionarComentario = () => {
    const textoLimpo = textoComentario.trim();
    if (!textoLimpo || !cartao || criandoComentario) return;

    createComment({
      idCartao: cartao.id,
      cardId: cartao.id,
      conteudo: textoLimpo,
      body: textoLimpo,
      idAutor: membroAtual?.id,
      authorId: membroAtual?.id,
      idUsuario: usuarioAtual?.id,
      userId: usuarioAtual?.id,
    });
    setTextoComentario('');
  };

  const tituloCartao = cartao.titulo ?? cartao.title;
  const colCartao = cartao.coluna ?? cartao.column;
  const prioCartao = cartao.prioridade ?? cartao.priority;
  const rawIds = cartao.ids_responsaveis ?? cartao.assignee_ids;
  const idsResponsaveisCartao: string[] =
    Array.isArray(rawIds) && rawIds.length > 0
      ? rawIds.map(String)
      : cartao.id_responsavel != null
        ? [String(cartao.id_responsavel)]
        : cartao.assignee_id != null
          ? [String(cartao.assignee_id)]
          : [];

  const responsaveisCartao: MembroEquipe[] = (() => {
    const resolved: MembroEquipe[] = [];
    for (const id of idsResponsaveisCartao) {
      const achado = encontrarMembro(membros, id);
      if (achado) {
        resolved.push(achado);
      }
    }
    if (resolved.length === 0 && Array.isArray(cartao.responsaveis) && cartao.responsaveis.length > 0) {
      return cartao.responsaveis as MembroEquipe[];
    }
    return resolved;
  })();

  const respCartao = responsaveisCartao[0] ?? null;
  const dataVencCartao = cartao.data_vencimento ?? cartao.due_date;
  const infoPrazo = calcularStatusPrazo(dataVencCartao);
  const listasCartao = cartao.listas_verificacao ?? cartao.checklists ?? [];
  const rastreadorCartao = cartao.rastreador_tempo ?? cartao.time_tracker;
  const colunaAtual = colunas.find((c) => c.id === colCartao);

  const criadorCartao = cartao
    ? encontrarMembro(
      membros,
      cartao.id_usuario ?? (cartao as any).user_id,
      cartao.id_usuario ?? (cartao as any).user_id,
      usuarioAtual
    )
    : null;
  const nomeCriador = criadorCartao?.nome_completo || (criadorCartao as any)?.full_name || criadorCartao?.email;

  const dataCriacao = cartao ? (cartao.criado_em ?? (cartao as any).created_at) : null;
  let dataHoraCriacaoFormatada = '';
  if (dataCriacao) {
    try {
      const dataObj = typeof dataCriacao === 'string' ? parseISO(dataCriacao) : new Date(dataCriacao);
      if (!isNaN(dataObj.getTime())) {
        dataHoraCriacaoFormatada = format(dataObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      }
    } catch {
      dataHoraCriacaoFormatada = '';
    }
  }

  const podeEditarPrazoEChecklists = (() => {
    if (!usuarioAtual && !membroAtual) return false;
    const uId = usuarioAtual?.id ? String(usuarioAtual.id) : null;
    const uAuthId = (usuarioAtual as any)?.id_usuario ? String((usuarioAtual as any).id_usuario) : null;
    const mId = membroAtual?.id ? String(membroAtual.id) : null;
    const mAuthId = membroAtual?.id_usuario ? String(membroAtual.id_usuario) : null;
    const criadorId = cartao.id_usuario ?? (cartao as any).user_id;
    const criadorStr = criadorId ? String(criadorId) : null;

    // É o criador do cartão?
    if (
      criadorStr &&
      (criadorStr === uId ||
        (uAuthId && criadorStr === uAuthId) ||
        criadorStr === mId ||
        (mAuthId && criadorStr === mAuthId))
    ) {
      return true;
    }
    // É um dos responsáveis?
    if (uId && idsResponsaveisCartao.includes(uId)) return true;
    if (uAuthId && idsResponsaveisCartao.includes(uAuthId)) return true;
    if (mId && idsResponsaveisCartao.includes(mId)) return true;
    if (mAuthId && idsResponsaveisCartao.includes(mAuthId)) return true;
    if (usuarioAtual?.email) {
      const emailLower = usuarioAtual.email.toLowerCase();
      if (responsaveisCartao.some((r) => r.email && r.email.toLowerCase() === emailLower)) {
        return true;
      }
    }
    return false;
  })();

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

              {(nomeCriador || dataHoraCriacaoFormatada) && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground -mt-4">
                  {nomeCriador && (
                    <span>
                      Criado por <strong className="font-medium text-foreground">{nomeCriador}</strong>
                    </span>
                  )}
                  {nomeCriador && dataHoraCriacaoFormatada && <span>•</span>}
                  {dataHoraCriacaoFormatada && <span>{dataHoraCriacaoFormatada}</span>}
                </div>
              )}

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

              <CardChecklistsContainer cardId={cartao.id} checklists={listasCartao} podeEditar={podeEditarPrazoEChecklists} />

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
                  const autor =
                    comment.autor ??
                    comment.author ??
                    encontrarMembro(
                      membros,
                      comment.id_autor || comment.author_id,
                      comment.id_usuario || comment.user_id,
                      usuarioAtual
                    );

                  let dataFormatada = '';
                  try {
                    const dataStr = comment.criado_em || comment.created_at || '';
                    if (dataStr) {
                      const d = parseISO(dataStr);
                      dataFormatada = isNaN(d.getTime())
                        ? ''
                        : format(d, "dd 'de' MMM, HH:mm", { locale: ptBR });
                    }
                  } catch {
                    dataFormatada = '';
                  }

                  const podeExcluir =
                    (usuarioAtual && (
                      comment.id_usuario === usuarioAtual.id ||
                      comment.user_id === usuarioAtual.id ||
                      ((usuarioAtual as any).id_usuario && comment.id_usuario === (usuarioAtual as any).id_usuario) ||
                      String(comment.id_autor) === String(usuarioAtual.id)
                    )) ||
                    (membroAtual && String(comment.id_autor || comment.author_id) === String(membroAtual.id)) ||
                    membroAtual?.role === 'owner' ||
                    membroAtual?.funcao === 'owner';

                  return (
                    <div
                      key={comment.id}
                      className="group flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted/40"
                    >
                      <Avatar className="size-8 shrink-0">
                        {(autor?.url_avatar || (autor as any)?.avatar_url) && (
                          <AvatarImage
                            src={autor.url_avatar || (autor as any).avatar_url!}
                            alt={autor.nome_completo || (autor as any).full_name}
                          />
                        )}
                        <AvatarFallback className="text-xs font-medium">
                          {autor?.iniciais ?? (autor as any)?.initials ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                              {autor?.nome_completo ?? (autor as any)?.full_name ?? 'Usuário'}
                            </span>
                            {dataFormatada && (
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {dataFormatada}
                              </span>
                            )}
                          </div>
                          {podeExcluir && (
                            <button
                              type="button"
                              onClick={() => deleteComment(comment.id)}
                              disabled={excluindoComentario}
                              className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive focus:opacity-100 p-1 rounded"
                              title="Excluir comentário"
                              aria-label="Excluir comentário"
                            >
                              <IconTrash className="size-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-foreground text-pretty whitespace-pre-wrap">
                          {comment.conteudo || comment.body}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div className="flex gap-3 pt-2">
                  <Avatar className="size-8 shrink-0">
                    {(eu?.url_avatar || (eu as any)?.avatar_url) && (
                      <AvatarImage
                        src={eu.url_avatar || (eu as any).avatar_url!}
                        alt={eu.nome_completo || (eu as any).full_name}
                      />
                    )}
                    <AvatarFallback className="text-xs font-medium">
                      {eu?.iniciais ?? (eu as any)?.initials ?? '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={textoComentario}
                      onChange={(e) => setTextoComentario(e.target.value)}
                      placeholder="Adicionar um comentário…"
                      className="min-h-[80px] resize-y text-sm"
                      disabled={criandoComentario}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          adicionarComentario();
                        }
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Ctrl+Enter ou ⌘+Enter para publicar
                      </span>
                      <Button
                        size="sm"
                        onClick={adicionarComentario}
                        disabled={!textoComentario.trim() || criandoComentario}
                      >
                        {criandoComentario ? 'Publicando...' : 'Adicionar comentário'}
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
                responsaveis={responsaveisCartao}
                idsResponsaveis={idsResponsaveisCartao}
                idResponsavel={cartao.id_responsavel}
              />

              <LinhaCampo icon={IconColumns} label="Status">
                <Select
                  value={colCartao}
                  onValueChange={(v) => lidarComMudancaStatus(v as IdColuna)}
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue />
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
                  <SelectTrigger
                    className={cn(
                      'h-9 w-full rounded-sm border-0 px-3 text-xs transition-colors cursor-pointer shadow-none font-medium text-white',
                      prioCartao === 'high'
                        ? 'bg-red-600 hover:bg-red-700 [&>svg]:text-white'
                        : prioCartao === 'low'
                          ? 'bg-slate-500 hover:bg-slate-600 [&>svg]:text-white'
                          : 'bg-amber-500 hover:bg-amber-600 [&>svg]:text-white'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <IconFlag className="size-4 shrink-0 text-white" />
                      <span>{priorityConfig[prioCartao ?? 'medium']?.label ?? 'Média'}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {(['high', 'medium', 'low'] as Prioridade[]).map((p) => {
                      const cfg = priorityConfig[p];
                      const itemBg =
                        p === 'high'
                          ? 'bg-red-600 hover:bg-red-700'
                          : p === 'low'
                            ? 'bg-slate-500 hover:bg-slate-600'
                            : 'bg-amber-500 hover:bg-amber-600';
                      return (
                        <SelectItem key={p} value={p} className="cursor-pointer my-0.5 p-1">
                          <span className={cn('flex items-center gap-2 px-2.5 py-1.5 rounded-sm text-xs font-medium text-white w-full border-0 shadow-none', itemBg)}>
                            <IconFlag className="size-3.5" />
                            <span>{cfg?.label ?? p}</span>
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </LinhaCampo>

              <LinhaCampo icon={IconUser} label="Responsáveis">
                <SeletorResponsavel
                  responsaveis={responsaveisCartao}
                  idsResponsaveis={idsResponsaveisCartao}
                  aoSelecionarMultiplo={(novosIds) => {
                    updateCard(cartao.id, {
                      ids_responsaveis: novosIds,
                      assignee_ids: novosIds,
                    });
                  }}
                >
                  <div className="flex items-center justify-between min-h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs cursor-pointer hover:bg-accent hover:text-foreground transition-colors">
                    <div className="flex items-center gap-2">
                      <IconUserPlus className="size-3.5 text-primary" />
                      <span className="font-medium text-foreground">
                        {idsResponsaveisCartao.length === 0
                          ? 'Atribuir responsáveis…'
                          : 'Adicionar / alterar responsáveis'}
                      </span>
                    </div>
                    {idsResponsaveisCartao.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        {idsResponsaveisCartao.length}
                      </Badge>
                    )}
                  </div>
                </SeletorResponsavel>

                {/* Lista de responsáveis atribuídos abaixo do input */}
                {responsaveisCartao.length > 0 ? (
                  <div className="mt-2 space-y-1.5">
                    {responsaveisCartao.map((membro) => {
                      const nome = membro.nome_completo || membro.full_name || 'Responsável';
                      return (
                        <div
                          key={membro.id}
                          className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-md bg-muted/40 border border-border/50 hover:bg-muted/70 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="size-6 shrink-0 ring-1 ring-border">
                              {(membro.url_avatar || membro.avatar_url) && (
                                <AvatarImage src={membro.url_avatar || membro.avatar_url!} alt={nome} />
                              )}
                              <AvatarFallback className="text-[10px] font-semibold">
                                {membro.iniciais || membro.initials || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-medium text-foreground truncate">
                                {nome}
                              </span>
                              {membro.email && (
                                <span className="text-[10px] text-muted-foreground truncate">
                                  {membro.email}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            title={`Remover ${nome}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const novosIds = idsResponsaveisCartao.filter((id) => id !== String(membro.id));
                              updateCard(cartao.id, {
                                ids_responsaveis: novosIds,
                                assignee_ids: novosIds,
                              });
                            }}
                            className="p-1 rounded-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          >
                            <IconX className="size-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic px-1 pt-0.5">
                    Nenhum responsável atribuído
                  </p>
                )}
              </LinhaCampo>

              <LinhaCampo icon={IconCalendar} label="Data de vencimento">
                {podeEditarPrazoEChecklists ? (
                  <SeletorDataVencimento
                    dataVencimento={dataVencCartao}
                    aoSelecionar={(novaData) => {
                      updateCard(cartao.id, {
                        data_vencimento: novaData,
                        due_date: novaData,
                      });
                    }}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-between h-9 w-full rounded-sm border-0 px-3 text-xs transition-colors cursor-pointer shadow-none',
                        dataVencCartao
                          ? infoPrazo.classeBadge
                          : 'border-0 bg-muted/80 text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <IconCalendar className="size-4 shrink-0" />
                        <span>{dataVencCartao ? infoPrazo.textoFormatado : 'Definir vencimento…'}</span>
                      </span>
                    </div>
                  </SeletorDataVencimento>
                ) : (
                  <div
                    onClick={() => {
                      toast.error('Apenas o criador ou responsáveis podem alterar a data de vencimento.');
                    }}
                    className={cn(
                      'flex items-center justify-between h-9 w-full rounded-sm border-0 px-3 text-xs shadow-none opacity-80 cursor-not-allowed select-none',
                      dataVencCartao
                        ? infoPrazo.classeBadge
                        : 'border-0 bg-muted/80 text-muted-foreground'
                    )}
                    title="Apenas o criador ou responsáveis podem alterar a data de vencimento"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <IconCalendar className="size-4 shrink-0" />
                      <span>{dataVencCartao ? infoPrazo.textoFormatado : 'Sem vencimento'}</span>
                    </span>
                  </div>
                )}
              </LinhaCampo>

              <LinhaCampo icon={IconSquareCheck} label="Checklists">
                {podeEditarPrazoEChecklists ? (
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
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    onClick={() => {
                      toast.error('Apenas o criador ou responsáveis podem adicionar checklists.');
                    }}
                    className="h-8 w-full justify-between font-normal text-muted-foreground opacity-60 cursor-not-allowed"
                    title="Apenas o criador ou responsáveis podem alterar checklists"
                  >
                    <span className="flex items-center gap-2">
                      <IconSquareCheck className="size-4 text-muted-foreground" />
                      <span>Adicionar checklist</span>
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {listasCartao.length}/5
                    </span>
                  </Button>
                )}
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

function encontrarMembro(
  members: MembroEquipe[],
  id?: string | number | null,
  idUsuario?: string | null,
  usuarioAtual?: { id: string; nome_completo?: string; iniciais?: string; url_avatar?: string | null; email?: string } | null
): MembroEquipe | null {
  if (id != null && id !== '') {
    const achado = members.find((m) => String(m.id) === String(id));
    if (achado) return achado;
  }
  if (idUsuario) {
    const achado = members.find(
      (m) =>
        (m.id_usuario && String(m.id_usuario) === String(idUsuario)) ||
        (m.id_usuario_membro && String(m.id_usuario_membro) === String(idUsuario))
    );
    if (achado) return achado;
    if (usuarioAtual && String(usuarioAtual.id) === String(idUsuario)) {
      return {
        id: usuarioAtual.id,
        nome_completo: usuarioAtual.nome_completo ?? 'Usuário',
        iniciais: usuarioAtual.iniciais ?? 'U',
        email: usuarioAtual.email ?? '',
        url_avatar: usuarioAtual.url_avatar ?? null,
      } as MembroEquipe;
    }
  }
  return null;
}

export const CardDetailPage = PaginaDetalhesCartao;
export const DetalhesCartaoPagina = PaginaDetalhesCartao;
export default PaginaDetalhesCartao;
