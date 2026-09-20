import { useState, useEffect } from 'react';
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
import { Badge } from '@/componentes/base/distintivo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/componentes/ui/menu-selecao';
import { useDataProvider } from '@/lib/provedor-dados';
import { useAuth } from '@/lib/autenticacao/provedor-autenticacao';
import { colunas, type IdColuna, type Prioridade } from '@/dados/dados-iniciais';
import { toast } from 'sonner';
import {
  IconPlus,
  IconLoader2,
  IconSparkles,
  IconLock,
  IconShieldLock,
  IconUserCheck,
} from '@tabler/icons-react';
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

  const { usuario } = useAuth();
  const { useCreateCard, useCards, useTeamMembers, useCurrentUser } = useDataProvider();
  const { mutate: createCard, isPending: estaCriando } = useCreateCard();
  const { data: cartoes = [] } = useCards();
  const { data: membros = [] } = useTeamMembers();
  const { data: usuarioAtual } = useCurrentUser();

  // Identificar se o usuário logado é Administrador ou Proprietário
  const membroLogado = membros.find(
    (m) =>
      (usuario && m.id_usuario_membro === usuario.id) ||
      (usuario?.email && m.email?.toLowerCase() === usuario.email.toLowerCase())
  );
  const ehAdmin = membroLogado?.funcao === 'admin' || membroLogado?.funcao === 'owner';

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [coluna, setColuna] = useState<IdColuna>('todo');
  const [prioridade, setPrioridade] = useState<Prioridade>('medium');
  const [idResponsavel, setIdResponsavel] = useState<string>('none');
  const [idSolicitante, setIdSolicitante] = useState<string>('');
  const [dataVencimento, setDataVencimento] = useState('');

  // Ao abrir o diálogo ou carregar o usuário, vincula automaticamente à sessão
  useEffect(() => {
    if (usuario?.id && !idSolicitante) {
      setIdSolicitante(usuario.id);
    }
  }, [usuario, idSolicitante]);

  const redefinirFormulario = () => {
    setTitulo('');
    setDescricao('');
    setColuna('todo');
    setPrioridade('medium');
    setIdResponsavel('none');
    setIdSolicitante(usuario?.id ?? '');
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

<<<<<<< HEAD
=======
    // Vinculação garantida ao user_id autenticado ou selecionado por admin
    const solicitanteFinal = idSolicitante || usuario?.id || null;

>>>>>>> ec99f6c (Atrelação a ID e complemento a tabela para verificações)
    createCard({
      title: tituloLimpo,
      column: coluna,
      nextPosition: proximaPosicao,
      description: descricao.trim() || '',
      priority: prioridade,
      assignee_id: idResponsavel !== 'none' ? idResponsavel : null,
      id_solicitante: solicitanteFinal,
      solicitante_id: solicitanteFinal,
      due_date: dataVencimento ? new Date(dataVencimento).toISOString() : null,
    });

    toast.success('Demanda criada e vinculada ao solicitante com sucesso!');
    redefinirFormulario();
    mudarAberto(false);
  };

  // Dados do usuário logado para exibição
  const nomeUsuarioLogado =
    usuarioAtual?.nome_completo ||
    (usuario?.user_metadata?.full_name as string | undefined) ||
    usuario?.email?.split('@')[0] ||
    'Utilizador Autenticado';
  const iniciaisUsuarioLogado =
    usuarioAtual?.iniciais ||
    nomeUsuarioLogado.slice(0, 2).toUpperCase();
  const avatarUsuarioLogado =
    usuarioAtual?.url_avatar ||
    (usuario?.user_metadata?.avatar_url as string | undefined) ||
    null;

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
                  Crie e registre uma nova tarefa vinculada diretamente ao solicitante.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="sgdi-dialogo-demanda-corpo">
            {/* Vínculo de Solicitante Automático por Sessão */}
            <div className="sgdi-dialogo-campo">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <IconUserCheck className="size-3.5 text-primary" />
                  Solicitante da Demanda
                </Label>
                {ehAdmin ? (
                  <span className="flex items-center gap-1 text-[11px] text-primary font-medium">
                    <IconShieldLock className="size-3" />
                    Perfil Administrador (pode abrir em nome de terceiros)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <IconLock className="size-3" />
                    Vinculado à sua sessão
                  </span>
                )}
              </div>

              {ehAdmin ? (
                /* Administrador: Seletor com pesquisa pelos usuários cadastrados */
                <Select
                  value={idSolicitante || usuario?.id || ''}
                  onValueChange={setIdSolicitante}
                >
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue placeholder="Selecione o solicitante" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Opção para o próprio administrador */}
                    <SelectItem value={usuario?.id ?? 'admin'} className="text-xs">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-5">
                          {avatarUsuarioLogado && <AvatarImage src={avatarUsuarioLogado} />}
                          <AvatarFallback className="text-[9px]">{iniciaisUsuarioLogado}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                          <span className="font-medium text-foreground">
                            {nomeUsuarioLogado} (Você)
                          </span>
                          <span className="text-[10px] text-muted-foreground">{usuario?.email}</span>
                        </div>
                      </div>
                    </SelectItem>

                    {/* Lista dos demais usuários / membros cadastrados */}
                    {membros
                      .filter(
                        (m) =>
                          m.id_usuario_membro !== usuario?.id &&
                          m.email?.toLowerCase() !== usuario?.email?.toLowerCase()
                      )
                      .map((m) => (
                        <SelectItem
                          key={m.id}
                          value={m.id_usuario_membro || m.id}
                          className="text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="size-5">
                              {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                              <AvatarFallback className="text-[9px]">{m.initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-left">
                              <span className="font-medium text-foreground">{m.full_name}</span>
                              <span className="text-[10px] text-muted-foreground">{m.email}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                /* Utilizador Comum: Campo bloqueado/somente leitura vinculado à sessão */
                <div className="flex items-center gap-2.5 rounded-md border border-border/80 bg-muted/40 px-3 py-2 text-xs transition-colors">
                  <Avatar className="size-7">
                    {avatarUsuarioLogado && <AvatarImage src={avatarUsuarioLogado} />}
                    <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                      {iniciaisUsuarioLogado}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1 text-left">
                    <span className="font-medium text-foreground truncate">
                      {nomeUsuarioLogado}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate">
                      {usuario?.email}
                    </span>
                  </div>
                  <Badge color="blue" className="text-[10px] py-0.5 px-2 font-medium">
                    Sua Conta
                  </Badge>
                </div>
              )}
            </div>
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
                <Select value={coluna} onValueChange={(v) => setColuna(v as IdColuna)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colunas.map((col) => (
                      <SelectItem key={col.id} value={col.id} className="text-xs">
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sgdi-dialogo-campo">
                <Label className="text-xs font-semibold">Prioridade</Label>
                <Select value={prioridade} onValueChange={(v) => setPrioridade(v as Prioridade)}>
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

            {/* Linha 2: Responsável e Prazo Final */}
            <div className="sgdi-dialogo-grid-2">
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
