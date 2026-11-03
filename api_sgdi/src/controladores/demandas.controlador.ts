import type { Request, Response } from 'express';
import { demandasServico, type FiltrosDemandas } from '../servicos/demandas.servico.js';
import type { CriarDemandaDTO, AtualizarDemandaDTO, CriarComentarioDTO } from '../tipos/index.js';

export const demandasControlador = {
  /**
   * GET /api/demandas
   * Lista demandas com filtros opcionais
   */
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const filtros: FiltrosDemandas = {
        status: req.query.status as string | undefined,
        prioridade: req.query.prioridade as string | undefined,
        solicitante_id: req.query.solicitante_id as string | undefined,
        responsavel_id: req.query.responsavel_id as string | undefined,
        busca: req.query.busca as string | undefined,
        limite: req.query.limite ? Number(req.query.limite) : 50,
        pagina: req.query.pagina ? Number(req.query.pagina) : 1,
      };

      const { itens, total } = await demandasServico.listarDemandas(filtros);

      res.status(200).json({
        sucesso: true,
        dados: itens,
        meta: {
          total,
          pagina: filtros.pagina,
          limite: filtros.limite,
          total_paginas: Math.ceil(total / (filtros.limite || 50)) || 1,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao listar demandas',
        mensagem: err.message,
        codigo_status: 500,
      });
    }
  },

  /**
   * GET /api/demandas/:id
   * Busca uma demanda específica pelo ID
   */
  async obterPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const demanda = await demandasServico.obterDemandaPorId(id);

      if (!demanda) {
        res.status(404).json({
          sucesso: false,
          erro: 'Demanda não encontrada',
          mensagem: `Nenhuma demanda encontrada com o ID ${id}.`,
          codigo_status: 404,
        });
        return;
      }

      res.status(200).json({
        sucesso: true,
        dados: demanda,
      });
    } catch (err: any) {
      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao consultar demanda',
        mensagem: err.message,
        codigo_status: 500,
      });
    }
  },

  /**
   * POST /api/demandas
   * Cria uma nova demanda (retorna 201 Created)
   */
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const { titulo, descricao, coluna, prioridade, data_vencimento, posicao, id_usuario, ids_responsaveis } = req.body;

      // Validação obrigatória: título
      if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
        res.status(400).json({
          sucesso: false,
          erro: 'Dados inválidos',
          mensagem: "O campo 'titulo' é obrigatório e deve ser uma string não vazia.",
          codigo_status: 400,
        });
        return;
      }

      // Validação opcional: coluna (status)
      if (coluna && !['todo', 'in-progress', 'done'].includes(coluna)) {
        res.status(400).json({
          sucesso: false,
          erro: 'Dados inválidos',
          mensagem: "O campo 'coluna' deve ser um dos seguintes valores: 'todo', 'in-progress' ou 'done'.",
          codigo_status: 400,
        });
        return;
      }

      // Validação opcional: prioridade
      if (prioridade && !['low', 'medium', 'high'].includes(prioridade)) {
        res.status(400).json({
          sucesso: false,
          erro: 'Dados inválidos',
          mensagem: "O campo 'prioridade' deve ser 'low', 'medium' ou 'high'.",
          codigo_status: 400,
        });
        return;
      }

      const dadosCriacao: CriarDemandaDTO = {
        titulo: titulo.trim(),
        descricao: typeof descricao === 'string' ? descricao.trim() : '',
        coluna: coluna || 'todo',
        prioridade: prioridade || 'medium',
        data_vencimento: data_vencimento || null,
        posicao: typeof posicao === 'number' ? posicao : 0,
        id_usuario: id_usuario || null,
        ids_responsaveis: Array.isArray(ids_responsaveis) ? ids_responsaveis : [],
      };

      const novaDemanda = await demandasServico.criarDemanda(dadosCriacao);

      res.status(201).json({
        sucesso: true,
        mensagem: 'Demanda criada com sucesso no SGDI.',
        dados: novaDemanda,
        codigo_status: 201,
      });
    } catch (err: any) {
      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao criar demanda',
        mensagem: err.message,
        codigo_status: 500,
      });
    }
  },

  /**
   * PUT /api/demandas/:id ou PATCH /api/demandas/:id
   * Atualiza uma demanda existente (retorna 200 OK)
   */
  async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const { titulo, descricao, coluna, prioridade, data_vencimento, posicao, id_usuario, ids_responsaveis } = req.body;

      if (titulo !== undefined && (typeof titulo !== 'string' || titulo.trim().length === 0)) {
        res.status(400).json({
          sucesso: false,
          erro: 'Dados inválidos',
          mensagem: "O campo 'titulo' não pode ser vazio quando fornecido.",
          codigo_status: 400,
        });
        return;
      }

      if (coluna !== undefined && !['todo', 'in-progress', 'done'].includes(coluna)) {
        res.status(400).json({
          sucesso: false,
          erro: 'Dados inválidos',
          mensagem: "O campo 'coluna' deve ser 'todo', 'in-progress' ou 'done'.",
          codigo_status: 400,
        });
        return;
      }

      if (prioridade !== undefined && !['low', 'medium', 'high'].includes(prioridade)) {
        res.status(400).json({
          sucesso: false,
          erro: 'Dados inválidos',
          mensagem: "O campo 'prioridade' deve ser 'low', 'medium' ou 'high'.",
          codigo_status: 400,
        });
        return;
      }

      const dadosAtualizacao: AtualizarDemandaDTO = {};
      if (titulo !== undefined) dadosAtualizacao.titulo = titulo.trim();
      if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
      if (coluna !== undefined) dadosAtualizacao.coluna = coluna;
      if (prioridade !== undefined) dadosAtualizacao.prioridade = prioridade;
      if (data_vencimento !== undefined) dadosAtualizacao.data_vencimento = data_vencimento;
      if (posicao !== undefined) dadosAtualizacao.posicao = Number(posicao);
      if (id_usuario !== undefined) dadosAtualizacao.id_usuario = id_usuario;
      if (ids_responsaveis !== undefined) dadosAtualizacao.ids_responsaveis = ids_responsaveis;

      const demandaAtualizada = await demandasServico.atualizarDemanda(id, dadosAtualizacao);

      if (!demandaAtualizada) {
        res.status(404).json({
          sucesso: false,
          erro: 'Demanda não encontrada',
          mensagem: `Não foi possível atualizar: demanda com ID ${id} não encontrada.`,
          codigo_status: 404,
        });
        return;
      }

      res.status(200).json({
        sucesso: true,
        mensagem: 'Demanda atualizada com sucesso no SGDI.',
        dados: demandaAtualizada,
        codigo_status: 200,
      });
    } catch (err: any) {
      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao atualizar demanda',
        mensagem: err.message,
        codigo_status: 500,
      });
    }
  },

  /**
   * DELETE /api/demandas/:id
   * Exclui uma demanda existente (retorna 200 OK)
   */
  async excluir(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const sucesso = await demandasServico.excluirDemanda(id);

      if (!sucesso) {
        res.status(404).json({
          sucesso: false,
          erro: 'Demanda não encontrada',
          mensagem: `Não foi possível excluir: demanda com ID ${id} não encontrada.`,
          codigo_status: 404,
        });
        return;
      }

      res.status(200).json({
        sucesso: true,
        mensagem: `Demanda #${id} excluída com sucesso.`,
        codigo_status: 200,
      });
    } catch (err: any) {
      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao excluir demanda',
        mensagem: err.message,
        codigo_status: 500,
      });
    }
  },

  /**
   * GET /api/demandas/:id/comentarios
   * Lista comentários vinculados a uma demanda
   */
  async listarComentarios(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const demanda = await demandasServico.obterDemandaPorId(id);

      if (!demanda) {
        res.status(404).json({
          sucesso: false,
          erro: 'Demanda não encontrada',
          mensagem: `Demanda com ID ${id} não encontrada para listar comentários.`,
          codigo_status: 404,
        });
        return;
      }

      const comentarios = await demandasServico.listarComentarios(id);

      res.status(200).json({
        sucesso: true,
        dados: comentarios,
        meta: {
          total: comentarios.length,
          demanda_id: id,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao listar comentários',
        mensagem: err.message,
        codigo_status: 500,
      });
    }
  },

  /**
   * POST /api/demandas/:id/comentarios
   * Adiciona um comentário em uma demanda (retorna 201 Created)
   */
  async adicionarComentario(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const { id_autor, conteudo } = req.body;

      if (!id_autor) {
        res.status(400).json({
          sucesso: false,
          erro: 'Dados inválidos',
          mensagem: "O campo 'id_autor' é obrigatório para registrar um comentário.",
          codigo_status: 400,
        });
        return;
      }

      if (!conteudo || typeof conteudo !== 'string' || conteudo.trim().length === 0) {
        res.status(400).json({
          sucesso: false,
          erro: 'Dados inválidos',
          mensagem: "O campo 'conteudo' é obrigatório e não pode ser vazio.",
          codigo_status: 400,
        });
        return;
      }

      const demanda = await demandasServico.obterDemandaPorId(id);
      if (!demanda) {
        res.status(404).json({
          sucesso: false,
          erro: 'Demanda não encontrada',
          mensagem: `Demanda com ID ${id} não encontrada para inclusão de comentário.`,
          codigo_status: 404,
        });
        return;
      }

      const novoComentario = await demandasServico.adicionarComentario(id, {
        id_autor,
        conteudo: conteudo.trim(),
      });

      res.status(201).json({
        sucesso: true,
        mensagem: 'Comentário adicionado com sucesso à demanda.',
        dados: novoComentario,
        codigo_status: 201,
      });
    } catch (err: any) {
      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao adicionar comentário',
        mensagem: err.message,
        codigo_status: 500,
      });
    }
  },
};
