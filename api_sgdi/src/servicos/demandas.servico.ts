import { obterClienteSupabase } from './supabase.servico.js';
import type { Demanda, CriarDemandaDTO, AtualizarDemandaDTO, Comentario, CriarComentarioDTO } from '../tipos/index.js';

// Base de dados em memória inicial (espelho dos dados padrão do SGDI) usada como fallback resiliente
const fallbackDemandas: Demanda[] = [
  {
    id: 42,
    id_usuario: 'a7dff8fc-60f0-4a86-82b9-1c6092f25415',
    titulo: 'Migração do Cluster Kubernetes para v1.30 e Upgrade dos Worker Nodes (Infra/Cloud)',
    descricao: 'Execução da janela de manutenção programada no cluster EKS de produção: atualização control plane, rolling update dos node groups sem downtime nas APIs e revalidação dos ingress controllers NGINX.',
    coluna: 'done',
    prioridade: 'high',
    data_vencimento: '2026-10-02',
    posicao: 0,
    ids_responsaveis: ['1', '32'],
    criado_em: '2026-09-24T23:26:30.151Z',
  },
  {
    id: 43,
    id_usuario: '758fb491-cb3b-47d8-8f9d-fe06df2abef3',
    titulo: 'Implementação do Gateway de Pagamento PIX e Webhooks com Assinatura mTLS (Software)',
    descricao: 'Desenvolvimento da integração bancária com protocolo Open Finance e certificação mTLS. Implementação de fila no RabbitMQ com política de retry para eventos com falha de conexão.',
    coluna: 'done',
    prioridade: 'medium',
    data_vencimento: '2026-10-04',
    posicao: 1,
    ids_responsaveis: ['15'],
    criado_em: '2026-09-29T23:26:30.151Z',
  },
  {
    id: 44,
    id_usuario: 'a7dff8fc-60f0-4a86-82b9-1c6092f25415',
    titulo: 'Correção de Vulnerabilidades Críticas de Dependências e SBOM (Segurança)',
    descricao: 'Correção de alertas de segurança no pipeline CI/CD, auditoria de pacotes npm/python e automação de scanning com Trivy.',
    coluna: 'in-progress',
    prioridade: 'high',
    data_vencimento: '2026-11-10',
    posicao: 2,
    ids_responsaveis: ['31', '32'],
    criado_em: '2026-10-01T23:26:30.151Z',
  },
  {
    id: 45,
    id_usuario: 'e5a9b1ec-8764-432b-8c3a-e86d2703fc21',
    titulo: 'Configuração de Monitoramento e Dashboard no Grafana (Infraestrutura)',
    descricao: 'Criação de métricas de latência p99, taxa de erro HTTP 5xx e consumo de CPU/Memória com alertas no Slack.',
    coluna: 'todo',
    prioridade: 'low',
    data_vencimento: '2026-11-15',
    posicao: 3,
    ids_responsaveis: ['31'],
    criado_em: '2026-10-04T23:26:30.151Z',
  },
];

const fallbackComentarios: Comentario[] = [
  {
    id: 1,
    id_cartao: 42,
    id_autor: 31,
    autor_nome: 'APPELT',
    conteudo: 'Janela de manutenção aprovada pela diretoria para o final de semana.',
    criado_em: '2026-09-25T14:30:00.000Z',
  },
  {
    id: 2,
    id_cartao: 43,
    id_autor: 32,
    autor_nome: 'Augusto Altmayer',
    conteudo: 'Certificados mTLS configurados no ambiente de homologação.',
    criado_em: '2026-09-30T10:15:00.000Z',
  },
];

let proximoIdDemanda = 100;
let proximoIdComentario = 10;

export interface FiltrosDemandas {
  status?: string;
  prioridade?: string;
  solicitante_id?: string;
  responsavel_id?: string;
  busca?: string;
  limite?: number;
  pagina?: number;
}

export const demandasServico = {
  async listarDemandas(filtros: FiltrosDemandas = {}): Promise<{ itens: Demanda[]; total: number }> {
    const supabase = obterClienteSupabase();

    if (supabase) {
      try {
        let query = supabase
          .from('cartoes')
          .select('id, id_usuario, titulo, descricao, coluna, prioridade, data_vencimento, posicao, ids_responsaveis, criado_em', {
            count: 'exact',
          });

        if (filtros.status) {
          query = query.eq('coluna', filtros.status);
        }
        if (filtros.prioridade) {
          query = query.eq('prioridade', filtros.prioridade);
        }
        if (filtros.solicitante_id) {
          query = query.eq('id_usuario', filtros.solicitante_id);
        }
        if (filtros.busca) {
          query = query.or(`titulo.ilike.%${filtros.busca}%,descricao.ilike.%${filtros.busca}%`);
        }

        const pagina = filtros.pagina && filtros.pagina > 0 ? filtros.pagina : 1;
        const limite = filtros.limite && filtros.limite > 0 ? filtros.limite : 50;
        const offset = (pagina - 1) * limite;

        query = query.order('id', { ascending: false }).range(offset, offset + limite - 1);

        const { data, count, error } = await query;
        if (!error && data) {
          return {
            itens: data as Demanda[],
            total: count ?? data.length,
          };
        }
      } catch {
        // Fallback para memória em caso de falha de rede/supabase
      }
    }

    // Processamento no Fallback em memória
    let resultado = [...fallbackDemandas];

    if (filtros.status) {
      resultado = resultado.filter((d) => d.coluna.toLowerCase() === filtros.status?.toLowerCase());
    }
    if (filtros.prioridade) {
      resultado = resultado.filter((d) => d.prioridade.toLowerCase() === filtros.prioridade?.toLowerCase());
    }
    if (filtros.solicitante_id) {
      resultado = resultado.filter((d) => d.id_usuario === filtros.solicitante_id);
    }
    if (filtros.responsavel_id) {
      resultado = resultado.filter((d) =>
        d.ids_responsaveis?.some((r) => String(r) === String(filtros.responsavel_id))
      );
    }
    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase();
      resultado = resultado.filter(
        (d) => d.titulo.toLowerCase().includes(termo) || d.descricao.toLowerCase().includes(termo)
      );
    }

    const total = resultado.length;
    const pagina = filtros.pagina && filtros.pagina > 0 ? filtros.pagina : 1;
    const limite = filtros.limite && filtros.limite > 0 ? filtros.limite : 50;
    const offset = (pagina - 1) * limite;

    const itens = resultado.slice(offset, offset + limite);

    return { itens, total };
  },

  async obterDemandaPorId(id: number | string): Promise<Demanda | null> {
    const supabase = obterClienteSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('cartoes')
          .select('id, id_usuario, titulo, descricao, coluna, prioridade, data_vencimento, posicao, ids_responsaveis, criado_em')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return data as Demanda;
        }
      } catch {
        // Fallback
      }
    }

    const encontrada = fallbackDemandas.find((d) => String(d.id) === String(id));
    return encontrada || null;
  },

  async criarDemanda(dados: CriarDemandaDTO): Promise<Demanda> {
    const supabase = obterClienteSupabase();

    const novaDemanda: Demanda = {
      id: proximoIdDemanda++,
      id_usuario: dados.id_usuario ?? null,
      titulo: dados.titulo,
      descricao: dados.descricao ?? '',
      coluna: dados.coluna ?? 'todo',
      prioridade: dados.prioridade ?? 'medium',
      data_vencimento: dados.data_vencimento ?? null,
      posicao: dados.posicao ?? 0,
      ids_responsaveis: dados.ids_responsaveis ?? [],
      criado_em: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const payloadSupabase = {
          titulo: novaDemanda.titulo,
          descricao: novaDemanda.descricao,
          coluna: novaDemanda.coluna,
          prioridade: novaDemanda.prioridade,
          data_vencimento: novaDemanda.data_vencimento,
          posicao: novaDemanda.posicao,
          id_usuario: novaDemanda.id_usuario,
          ids_responsaveis: novaDemanda.ids_responsaveis,
        };

        const { data, error } = await supabase
          .from('cartoes')
          .insert(payloadSupabase)
          .select()
          .single();

        if (!error && data) {
          return data as Demanda;
        }
      } catch {
        // Fallback
      }
    }

    fallbackDemandas.unshift(novaDemanda);
    return novaDemanda;
  },

  async atualizarDemanda(id: number | string, dados: AtualizarDemandaDTO): Promise<Demanda | null> {
    const supabase = obterClienteSupabase();

    if (supabase) {
      try {
        const payloadAtualizacao: Record<string, unknown> = {};
        if (dados.titulo !== undefined) payloadAtualizacao.titulo = dados.titulo;
        if (dados.descricao !== undefined) payloadAtualizacao.descricao = dados.descricao;
        if (dados.coluna !== undefined) payloadAtualizacao.coluna = dados.coluna;
        if (dados.prioridade !== undefined) payloadAtualizacao.prioridade = dados.prioridade;
        if (dados.data_vencimento !== undefined) payloadAtualizacao.data_vencimento = dados.data_vencimento;
        if (dados.posicao !== undefined) payloadAtualizacao.posicao = dados.posicao;
        if (dados.id_usuario !== undefined) payloadAtualizacao.id_usuario = dados.id_usuario;
        if (dados.ids_responsaveis !== undefined) payloadAtualizacao.ids_responsaveis = dados.ids_responsaveis;

        const { data, error } = await supabase
          .from('cartoes')
          .update(payloadAtualizacao)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (!error && data) {
          return data as Demanda;
        }
      } catch {
        // Fallback
      }
    }

    const index = fallbackDemandas.findIndex((d) => String(d.id) === String(id));
    if (index === -1) return null;

    fallbackDemandas[index] = {
      ...fallbackDemandas[index],
      ...dados,
    };
    return fallbackDemandas[index];
  },

  async excluirDemanda(id: number | string): Promise<boolean> {
    const demandaExistente = await this.obterDemandaPorId(id);
    if (!demandaExistente) {
      return false;
    }

    const supabase = obterClienteSupabase();

    if (supabase) {
      try {
        const { error } = await supabase.from('cartoes').delete().eq('id', id);
        if (!error) {
          const indexMemoria = fallbackDemandas.findIndex((d) => String(d.id) === String(id));
          if (indexMemoria !== -1) {
            fallbackDemandas.splice(indexMemoria, 1);
          }
          return true;
        }
      } catch {
        // Fallback
      }
    }

    const index = fallbackDemandas.findIndex((d) => String(d.id) === String(id));
    if (index === -1) return false;

    fallbackDemandas.splice(index, 1);
    return true;
  },

  async listarComentarios(demandaId: number | string): Promise<Comentario[]> {
    const supabase = obterClienteSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('comentarios')
          .select('id, id_cartao, id_autor, conteudo, criado_em')
          .eq('id_cartao', demandaId)
          .order('criado_em', { ascending: true });

        if (!error && data) {
          return data as Comentario[];
        }
      } catch {
        // Fallback
      }
    }

    return fallbackComentarios.filter((c) => String(c.id_cartao) === String(demandaId));
  },

  async adicionarComentario(demandaId: number | string, dados: CriarComentarioDTO): Promise<Comentario> {
    const supabase = obterClienteSupabase();

    const novoComentario: Comentario = {
      id: proximoIdComentario++,
      id_cartao: demandaId,
      id_autor: dados.id_autor,
      conteudo: dados.conteudo,
      criado_em: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('comentarios')
          .insert({
            id_cartao: demandaId,
            id_autor: dados.id_autor,
            conteudo: dados.conteudo,
          })
          .select()
          .single();

        if (!error && data) {
          return data as Comentario;
        }
      } catch {
        // Fallback
      }
    }

    fallbackComentarios.push(novoComentario);
    return novoComentario;
  },
};
