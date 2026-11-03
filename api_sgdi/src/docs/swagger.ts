export const especificacaoOpenApi = {
  openapi: '3.0.3',
  info: {
    title: 'API REST - Sistema SGDI (Gestão de Demandas de TI)',
    version: '1.0.0',
    description: `API REST oficial para disponibilização, consulta e manipulação de demandas e dados do Sistema SGDI por outras aplicações.
    
### Características Principais:
- **Segurança**: Autenticação via Chave de API (\`X-API-Key\` ou \`Authorization: Bearer <chave>\`).
- **Padrão REST**: Verbos HTTP semânticos (GET, POST, PUT, DELETE) e códigos de status padronizados (200, 201, 400, 401, 404, 500).
- **Formato**: Todas as rotas respondem invariavelmente em JSON (\`application/json\`).
- **Prefixo Unificado**: Todas as rotas iniciam obrigatoriamente com \`/api/\`.`,
    contact: {
      name: 'Suporte Técnico SGDI',
      email: 'suporte@sgdi.local',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Servidor Local da API SGDI',
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'Chave de autenticação da API. Também pode ser enviada via `Authorization: Bearer <chave>`',
      },
    },
    schemas: {
      Demanda: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 42 },
          id_usuario: { type: 'string', nullable: true, example: 'a7dff8fc-60f0-4a86-82b9-1c6092f25415' },
          titulo: { type: 'string', example: 'Migração do Cluster Kubernetes para v1.30' },
          descricao: { type: 'string', example: 'Execução da janela de manutenção programada no cluster EKS...' },
          coluna: { type: 'string', enum: ['todo', 'in-progress', 'done'], example: 'in-progress' },
          prioridade: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
          data_vencimento: { type: 'string', format: 'date', nullable: true, example: '2026-11-20' },
          posicao: { type: 'integer', example: 0 },
          ids_responsaveis: {
            type: 'array',
            items: { type: 'string' },
            example: ['31', '32'],
          },
          criado_em: { type: 'string', format: 'date-time', example: '2026-10-01T12:00:00.000Z' },
        },
      },
      CriarDemandaDTO: {
        type: 'object',
        required: ['titulo'],
        properties: {
          titulo: { type: 'string', example: 'Nova funcionalidade de relatórios em PDF' },
          descricao: { type: 'string', example: 'Exportação com paginação e suporte a tabelas' },
          coluna: { type: 'string', enum: ['todo', 'in-progress', 'done'], default: 'todo' },
          prioridade: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
          data_vencimento: { type: 'string', format: 'date', nullable: true, example: '2026-12-01' },
          id_usuario: { type: 'string', nullable: true, example: '31' },
          ids_responsaveis: {
            type: 'array',
            items: { type: 'string' },
            example: ['31'],
          },
        },
      },
      AtualizarDemandaDTO: {
        type: 'object',
        properties: {
          titulo: { type: 'string', example: 'Título atualizado' },
          descricao: { type: 'string', example: 'Nova descrição detalhada' },
          coluna: { type: 'string', enum: ['todo', 'in-progress', 'done'] },
          prioridade: { type: 'string', enum: ['low', 'medium', 'high'] },
          data_vencimento: { type: 'string', format: 'date', nullable: true },
          ids_responsaveis: { type: 'array', items: { type: 'string' } },
        },
      },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 31 },
          id_usuario: { type: 'string', nullable: true },
          nome_completo: { type: 'string', example: 'Luiz Appelt Weller' },
          iniciais: { type: 'string', example: 'LA' },
          email: { type: 'string', example: 'luiz.appelt@empresa.com' },
          funcao: { type: 'string', example: 'Membro' },
          status: { type: 'string', example: 'active' },
          criado_em: { type: 'string', format: 'date-time' },
        },
      },
      Comentario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          id_cartao: { type: 'integer', example: 42 },
          id_autor: { type: 'integer', example: 31 },
          autor_nome: { type: 'string', example: 'Luiz Appelt' },
          conteudo: { type: 'string', example: 'Deploy concluído no ambiente de staging.' },
          criado_em: { type: 'string', format: 'date-time' },
        },
      },
      RespostaErro401: {
        type: 'object',
        properties: {
          sucesso: { type: 'boolean', example: false },
          erro: { type: 'string', example: 'Não autorizado' },
          mensagem: { type: 'string', example: 'Chave de autenticação ausente ou inválida.' },
          codigo_status: { type: 'integer', example: 401 },
        },
      },
      RespostaErro404: {
        type: 'object',
        properties: {
          sucesso: { type: 'boolean', example: false },
          erro: { type: 'string', example: 'Demanda não encontrada' },
          mensagem: { type: 'string', example: 'Nenhuma demanda encontrada com o ID 999.' },
          codigo_status: { type: 'integer', example: 404 },
        },
      },
    },
  },
  paths: {
    '/api/status': {
      get: {
        summary: 'Verificar status da API SGDI (Healthcheck)',
        description: 'Endpoint público para diagnóstico e monitoramento da integridade da API.',
        responses: {
          '200': {
            description: 'API SGDI operacional',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sucesso: { type: 'boolean', example: true },
                    servico: { type: 'string', example: 'API REST - Sistema SGDI' },
                    status: { type: 'string', example: 'operacional' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/demandas': {
      get: {
        summary: 'Listar demandas do SGDI',
        description: 'Retorna a lista de demandas/cartões cadastradas no SGDI com suporte a filtros e paginação.',
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['todo', 'in-progress', 'done'] }, description: 'Filtrar por coluna/status' },
          { name: 'prioridade', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high'] }, description: 'Filtrar por urgência/prioridade' },
          { name: 'busca', in: 'query', schema: { type: 'string' }, description: 'Termo para busca em título e descrição' },
          { name: 'limite', in: 'query', schema: { type: 'integer', default: 50 }, description: 'Quantidade por página' },
          { name: 'pagina', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Número da página' },
        ],
        responses: {
          '200': {
            description: 'Lista de demandas retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sucesso: { type: 'boolean', example: true },
                    dados: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Demanda' },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Chave de API ausente ou inválida',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RespostaErro401' } } },
          },
        },
      },
      post: {
        summary: 'Criar uma nova demanda no SGDI',
        description: 'Cria uma nova demanda/cartão no Kanban do SGDI.',
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CriarDemandaDTO' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Demanda criada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sucesso: { type: 'boolean', example: true },
                    mensagem: { type: 'string', example: 'Demanda criada com sucesso no SGDI.' },
                    dados: { $ref: '#/components/schemas/Demanda' },
                    codigo_status: { type: 'integer', example: 201 },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Dados inválidos ou campos obrigatórios ausentes',
          },
          '401': {
            description: 'Não autorizado (chave ausente ou incorreta)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RespostaErro401' } } },
          },
        },
      },
    },
    '/api/demandas/{id}': {
      get: {
        summary: 'Obter detalhes de uma demanda',
        description: 'Retorna uma demanda específica pelo seu ID sequencial.',
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID da demanda' },
        ],
        responses: {
          '200': {
            description: 'Demanda encontrada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sucesso: { type: 'boolean', example: true },
                    dados: { $ref: '#/components/schemas/Demanda' },
                  },
                },
              },
            },
          },
          '401': { description: 'Não autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/RespostaErro401' } } } },
          '404': { description: 'Demanda não encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/RespostaErro404' } } } },
        },
      },
      put: {
        summary: 'Atualizar uma demanda existente',
        description: 'Atualiza campos como status, título, prioridade, prazos ou responsáveis da demanda.',
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID da demanda' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AtualizarDemandaDTO' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Demanda atualizada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sucesso: { type: 'boolean', example: true },
                    mensagem: { type: 'string' },
                    dados: { $ref: '#/components/schemas/Demanda' },
                    codigo_status: { type: 'integer', example: 200 },
                  },
                },
              },
            },
          },
          '400': { description: 'Dados inválidos' },
          '401': { description: 'Não autorizado' },
          '404': { description: 'Demanda não encontrada' },
        },
      },
      delete: {
        summary: 'Excluir uma demanda do SGDI',
        description: 'Remove definitivamente uma demanda do sistema.',
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID da demanda' },
        ],
        responses: {
          '200': {
            description: 'Demanda excluída com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sucesso: { type: 'boolean', example: true },
                    mensagem: { type: 'string', example: 'Demanda #42 excluída com sucesso.' },
                    codigo_status: { type: 'integer', example: 200 },
                  },
                },
              },
            },
          },
          '401': { description: 'Não autorizado' },
          '404': { description: 'Demanda não encontrada' },
        },
      },
    },
    '/api/demandas/{id}/comentarios': {
      get: {
        summary: 'Listar comentários de uma demanda',
        description: 'Retorna as anotações e comentários adicionados a uma demanda.',
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Comentários da demanda',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sucesso: { type: 'boolean', example: true },
                    dados: { type: 'array', items: { $ref: '#/components/schemas/Comentario' } },
                  },
                },
              },
            },
          },
          '401': { description: 'Não autorizado' },
          '404': { description: 'Demanda não encontrada' },
        },
      },
      post: {
        summary: 'Adicionar comentário em uma demanda',
        description: 'Insere um novo comentário vinculado à demanda especificada.',
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id_autor', 'conteudo'],
                properties: {
                  id_autor: { type: 'integer', example: 31 },
                  conteudo: { type: 'string', example: 'Deploy em produção homologado.' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Comentário inserido com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sucesso: { type: 'boolean', example: true },
                    mensagem: { type: 'string' },
                    dados: { $ref: '#/components/schemas/Comentario' },
                    codigo_status: { type: 'integer', example: 201 },
                  },
                },
              },
            },
          },
          '400': { description: 'Campos obrigatórios ausentes' },
          '401': { description: 'Não autorizado' },
          '404': { description: 'Demanda não encontrada' },
        },
      },
    },
    '/api/usuarios': {
      get: {
        summary: 'Listar usuários e membros do SGDI',
        description: 'Lista os membros cadastrados disponíveis para atuar como solicitantes ou responsáveis.',
        security: [{ ApiKeyAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de usuários',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sucesso: { type: 'boolean', example: true },
                    dados: { type: 'array', items: { $ref: '#/components/schemas/Usuario' } },
                  },
                },
              },
            },
          },
          '401': { description: 'Não autorizado' },
        },
      },
      post: {
        summary: 'Cadastrar novo usuário no SGDI',
        description: 'Cria um novo usuário/membro no sistema SGDI.',
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome_completo', 'email'],
                properties: {
                  nome_completo: { type: 'string', example: 'Maria Oliveira' },
                  email: { type: 'string', example: 'maria.oliveira@empresa.com' },
                  funcao: { type: 'string', example: 'Membro' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Usuário cadastrado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sucesso: { type: 'boolean', example: true },
                    dados: { $ref: '#/components/schemas/Usuario' },
                    codigo_status: { type: 'integer', example: 201 },
                  },
                },
              },
            },
          },
          '400': { description: 'Nome ou e-mail inválido' },
          '401': { description: 'Não autorizado' },
        },
      },
    },
    '/api/usuarios/{id}': {
      get: {
        summary: 'Obter dados de um usuário pelo ID',
        description: 'Retorna informações do membro/usuário cadastrado.',
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Usuário encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sucesso: { type: 'boolean', example: true },
                    dados: { $ref: '#/components/schemas/Usuario' },
                  },
                },
              },
            },
          },
          '401': { description: 'Não autorizado' },
          '404': { description: 'Usuário não encontrado' },
        },
      },
    },
  },
};
