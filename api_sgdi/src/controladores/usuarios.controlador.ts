import type { Request, Response } from 'express';
import { usuariosServico, type FiltrosUsuarios } from '../servicos/usuarios.servico.js';
import type { CriarUsuarioDTO } from '../tipos/index.js';

export const usuariosControlador = {
  /**
   * GET /api/usuarios
   * Lista usuários cadastrados com filtros opcionais
   */
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const filtros: FiltrosUsuarios = {
        status: req.query.status as string | undefined,
        funcao: req.query.funcao as string | undefined,
        busca: req.query.busca as string | undefined,
      };

      const usuarios = await usuariosServico.listarUsuarios(filtros);

      res.status(200).json({
        sucesso: true,
        dados: usuarios,
        meta: {
          total: usuarios.length,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao listar usuários',
        mensagem: err.message,
        codigo_status: 500,
      });
    }
  },

  /**
   * GET /api/usuarios/:id
   * Retorna os detalhes de um usuário específico
   */
  async obterPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const usuario = await usuariosServico.obterUsuarioPorId(id);

      if (!usuario) {
        res.status(404).json({
          sucesso: false,
          erro: 'Usuário não encontrado',
          mensagem: `Nenhum usuário encontrado com o ID ${id}.`,
          codigo_status: 404,
        });
        return;
      }

      res.status(200).json({
        sucesso: true,
        dados: usuario,
      });
    } catch (err: any) {
      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao consultar usuário',
        mensagem: err.message,
        codigo_status: 500,
      });
    }
  },

  /**
   * POST /api/usuarios
   * Cadastra um novo usuário no sistema (retorna 201 Created)
   */
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const { nome_completo, email, funcao, status, url_avatar, iniciais } = req.body;

      if (!nome_completo || typeof nome_completo !== 'string' || nome_completo.trim().length === 0) {
        res.status(400).json({
          sucesso: false,
          erro: 'Dados inválidos',
          mensagem: "O campo 'nome_completo' é obrigatório.",
          codigo_status: 400,
        });
        return;
      }

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        res.status(400).json({
          sucesso: false,
          erro: 'Dados inválidos',
          mensagem: "O campo 'email' é obrigatório e deve ser um e-mail válido.",
          codigo_status: 400,
        });
        return;
      }

      const dadosCriacao: CriarUsuarioDTO = {
        nome_completo: nome_completo.trim(),
        email: email.trim().toLowerCase(),
        funcao: funcao || 'Membro',
        status: status || 'active',
        iniciais,
        url_avatar: url_avatar || null,
      };

      const novoUsuario = await usuariosServico.criarUsuario(dadosCriacao);

      res.status(201).json({
        sucesso: true,
        mensagem: 'Usuário cadastrado com sucesso no SGDI.',
        dados: novoUsuario,
        codigo_status: 201,
      });
    } catch (err: any) {
      res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao criar usuário',
        mensagem: err.message,
        codigo_status: 500,
      });
    }
  },
};
