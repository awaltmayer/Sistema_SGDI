import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { config } from '../src/config/env.js';

describe('📌 Rotas de Demandas e Comentários (/api/demandas)', () => {
  const CHAVE = config.chaveApi;

  it('Deve listar demandas cadastradas e retornar paginação', async () => {
    const res = await request(app)
      .get('/api/demandas?limite=5&pagina=1')
      .set('X-API-Key', CHAVE);

    expect(res.status).toBe(200);
    expect(res.body.sucesso).toBe(true);
    expect(Array.isArray(res.body.dados)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.limite).toBe(5);
  });

  it('Deve filtrar demandas por status (coluna)', async () => {
    const res = await request(app)
      .get('/api/demandas?status=done')
      .set('X-API-Key', CHAVE);

    expect(res.status).toBe(200);
    expect(res.body.sucesso).toBe(true);
    res.body.dados.forEach((demanda: any) => {
      expect(demanda.coluna).toBe('done');
    });
  });

  it('Deve criar, consultar comentários e adicionar um novo comentário em uma demanda', async () => {
    // 1. Cria uma demanda para o teste
    const resDemanda = await request(app)
      .post('/api/demandas')
      .set('X-API-Key', CHAVE)
      .send({
        titulo: 'Demanda para teste de comentários',
        descricao: 'Demanda de teste',
      });

    expect(resDemanda.status).toBe(201);
    const demandaId = resDemanda.body.dados.id;

    // 2. Adiciona um comentário
    const resComentario = await request(app)
      .post(`/api/demandas/${demandaId}/comentarios`)
      .set('X-API-Key', CHAVE)
      .send({
        id_autor: 31,
        conteudo: 'Comentário inserido via teste de integração.',
      });

    expect(resComentario.status).toBe(201);
    expect(resComentario.body.sucesso).toBe(true);
    expect(resComentario.body.dados.conteudo).toBe('Comentário inserido via teste de integração.');

    // 3. Consulta a lista de comentários da demanda
    const resListaComentarios = await request(app)
      .get(`/api/demandas/${demandaId}/comentarios`)
      .set('X-API-Key', CHAVE);

    expect(resListaComentarios.status).toBe(200);
    expect(resListaComentarios.body.sucesso).toBe(true);
    expect(resListaComentarios.body.dados.length).toBeGreaterThanOrEqual(1);

    // Limpa a demanda de teste
    await request(app).delete(`/api/demandas/${demandaId}`).set('X-API-Key', CHAVE);
  });
});
