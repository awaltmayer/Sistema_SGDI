import { obterClienteSupabase } from './supabase.servico.js';
import type { Usuario, CriarUsuarioDTO } from '../tipos/index.js';

const fallbackUsuarios: Usuario[] = [
  {
    id: 31,
    id_usuario: 'e5a9b1ec-8764-432b-8c3a-e86d2703fc21',
    nome_completo: 'APPELT',
    iniciais: 'AP',
    email: 'appelt.dev@gmail.com',
    funcao: 'Membro',
    status: 'active',
    url_avatar: null,
    criado_em: '2026-10-06T22:53:28.885Z',
  },
  {
    id: 32,
    id_usuario: '758fb491-cb3b-47d8-8f9d-fe06df2abef3',
    nome_completo: 'Augusto Wolfart Altmayer',
    iniciais: 'AU',
    email: '1138100@atitus.edu.br',
    funcao: 'Membro',
    status: 'active',
    url_avatar: null,
    criado_em: '2026-10-06T22:53:54.239Z',
  },
  {
    id: 1,
    id_usuario: 'a7dff8fc-60f0-4a86-82b9-1c6092f25415',
    nome_completo: 'ENIO NETO',
    iniciais: 'EN',
    email: 'enio.neto@empresa.com',
    funcao: 'Administrador',
    status: 'active',
    url_avatar: null,
    criado_em: '2026-09-20T12:00:00.000Z',
  },
  {
    id: 15,
    id_usuario: 'b8eef2ab-92c1-41d3-9f12-0e81c72f1092',
    nome_completo: 'Ricardo Drews',
    iniciais: 'RD',
    email: 'ricardo.drews@empresa.com',
    funcao: 'Membro',
    status: 'active',
    url_avatar: null,
    criado_em: '2026-09-22T15:20:00.000Z',
  },
];

let proximoIdUsuario = 50;

export interface FiltrosUsuarios {
  status?: string;
  funcao?: string;
  busca?: string;
}

export const usuariosServico = {
  async listarUsuarios(filtros: FiltrosUsuarios = {}): Promise<Usuario[]> {
    const supabase = obterClienteSupabase();

    if (supabase) {
      try {
        let query = supabase
          .from('usuarios')
          .select('id, id_usuario, nome_completo, iniciais, email, funcao, status, url_avatar, criado_em');

        if (filtros.status) {
          query = query.eq('status', filtros.status);
        }
        if (filtros.funcao) {
          query = query.eq('funcao', filtros.funcao);
        }
        if (filtros.busca) {
          query = query.or(`nome_completo.ilike.%${filtros.busca}%,email.ilike.%${filtros.busca}%`);
        }

        query = query.order('nome_completo', { ascending: true });

        const { data, error } = await query;
        if (!error && data) {
          return data as Usuario[];
        }
      } catch {
        // Fallback
      }
    }

    let resultado = [...fallbackUsuarios];
    if (filtros.status) {
      resultado = resultado.filter((u) => u.status.toLowerCase() === filtros.status?.toLowerCase());
    }
    if (filtros.funcao) {
      resultado = resultado.filter((u) => u.funcao.toLowerCase() === filtros.funcao?.toLowerCase());
    }
    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase();
      resultado = resultado.filter(
        (u) => u.nome_completo.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo)
      );
    }
    return resultado;
  },

  async obterUsuarioPorId(id: number | string): Promise<Usuario | null> {
    const supabase = obterClienteSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, id_usuario, nome_completo, iniciais, email, funcao, status, url_avatar, criado_em')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return data as Usuario;
        }
      } catch {
        // Fallback
      }
    }

    const usuario = fallbackUsuarios.find((u) => String(u.id) === String(id));
    return usuario || null;
  },

  async criarUsuario(dados: CriarUsuarioDTO): Promise<Usuario> {
    const supabase = obterClienteSupabase();

    const gerarIniciais = (nome: string) => {
      const partes = nome.trim().split(/\s+/);
      if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    };

    const novoUsuario: Usuario = {
      id: proximoIdUsuario++,
      nome_completo: dados.nome_completo,
      iniciais: dados.iniciais || gerarIniciais(dados.nome_completo),
      email: dados.email,
      funcao: dados.funcao || 'Membro',
      status: dados.status || 'active',
      url_avatar: dados.url_avatar || null,
      criado_em: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .insert({
            nome_completo: novoUsuario.nome_completo,
            iniciais: novoUsuario.iniciais,
            email: novoUsuario.email,
            funcao: novoUsuario.funcao,
            status: novoUsuario.status,
            url_avatar: novoUsuario.url_avatar,
          })
          .select()
          .single();

        if (!error && data) {
          return data as Usuario;
        }
      } catch {
        // Fallback
      }
    }

    fallbackUsuarios.push(novoUsuario);
    return novoUsuario;
  },
};
