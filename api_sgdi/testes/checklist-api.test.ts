import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { config } from '../src/config/env.js';

describe('✅ Checklist da API SGDI', () => {
  const CHAVE_VALIDA = config.chaveApi;
  const CHAVE_INVALIDA = 'chave_completamente_invalida_123';

  // 1. Chave fora do código (variável de ambiente)
  it('1. Deve obter a chave de API a partir de variável de ambiente (fora do código)', () => {
    expect(config.chaveApi).toBeDefined();
    expect(typeof config.chaveApi).toBe('string');
    expect(config.chaveApi.length).toBeGreaterThan(0);
  });

  // 2. Rotas começam com /api/
  it('2. Todas as rotas devem começar com o prefixo /api/', async () => {
    // Rota pública de status
    const resStatus = await request(app).get('/api/status');
    expect(resStatus.status).toBe(200);

    // Rota de documentação OpenAPI
    const resDocs = await request(app).get('/api/docs/openapi.json');
    expect(resDocs.status).toBe(200);

    // Rota fora do prefixo /api deve retornar 404
    const resInvalida = await request(app).get('/demandas');
    expect(resInvalida.status).toBe(404);
    expect(resInvalida.body.sucesso).toBe(false);
  });

  // 3. Sem chave, a resposta é 401
  it('3. Sem a chave de API, a resposta deve ser 401 Unauthorized', async () => {
    // Teste em GET /api/demandas
    const resGetDemandas = await request(app).get('/api/demandas');
    expect(resGetDemandas.status).toBe(401);
    expect(resGetDemandas.body.sucesso).toBe(false);
    expect(resGetDemandas.body.erro).toBe('Não autorizado');

    // Teste em POST /api/demandas
    const resPostDemandas = await request(app)
      .post('/api/demandas')
      .send({ titulo: 'Demanda Não Autorizada' });
    expect(resPostDemandas.status).toBe(401);

    // Teste em GET /api/usuarios
    const resGetUsuarios = await request(app).get('/api/usuarios');
    expect(resGetUsuarios.status).toBe(401);
  });

  // 4. Rotas protegidas exigem a chave válida
  it('4. Rotas protegidas devem recusar chave inválida com 401 e aceitar chave válida', async () => {
    // Com chave inválida -> 401
    const resInvalida = await request(app)
      .get('/api/demandas')
      .set('X-API-Key', CHAVE_INVALIDA);
    expect(resInvalida.status).toBe(401);
    expect(resInvalida.body.sucesso).toBe(false);

    // Com chave válida via X-API-Key -> 200
    const resValidaHeader = await request(app)
      .get('/api/demandas')
      .set('X-API-Key', CHAVE_VALIDA);
    expect(resValidaHeader.status).toBe(200);
    expect(resValidaHeader.body.sucesso).toBe(true);

    // Com chave válida via Authorization Bearer -> 200
    const resValidaBearer = await request(app)
      .get('/api/demandas')
      .set('Authorization', `Bearer ${CHAVE_VALIDA}`);
    expect(resValidaBearer.status).toBe(200);
    expect(resValidaBearer.body.sucesso).toBe(true);
  });

  // 5. Sempre responde em JSON
  it('5. A API deve sempre responder com Content-Type JSON (em sucesso ou erro)', async () => {
    // Em rota pública de sucesso
    const resStatus = await request(app).get('/api/status');
    expect(resStatus.headers['content-type']).toMatch(/application\/json/);

    // Em erro 401
    const res401 = await request(app).get('/api/demandas');
    expect(res401.headers['content-type']).toMatch(/application\/json/);

    // Em erro 404
    const res404 = await request(app).get('/api/rota-inexistente');
    expect(res404.headers['content-type']).toMatch(/application\/json/);

    // Em erro 400 (Bad Request)
    const res400 = await request(app)
      .post('/api/demandas')
      .set('X-API-Key', CHAVE_VALIDA)
      .send({ titulo: '' }); // título vazio
    expect(res400.headers['content-type']).toMatch(/application\/json/);
  });

  // 6. Cada rota usa o verbo certo & códigos de status corretos (200, 201, 400, 404)
  it('6. Deve utilizar os verbos HTTP e códigos de status corretos (GET 200, POST 201, 400, 404, PUT 200, DELETE 200)', async () => {
    // POST com dados inválidos -> 400 Bad Request
    const resPostInvalido = await request(app)
      .post('/api/demandas')
      .set('X-API-Key', CHAVE_VALIDA)
      .send({});
    expect(resPostInvalido.status).toBe(400);
    expect(resPostInvalido.body.codigo_status).toBe(400);

    // POST para criar demanda -> 201 Created
    const resCriar = await request(app)
      .post('/api/demandas')
      .set('X-API-Key', CHAVE_VALIDA)
      .send({
        titulo: 'Demanda de Teste Automatizado de Integração',
        descricao: 'Validação de verbos HTTP e códigos de status',
        coluna: 'todo',
        prioridade: 'high',
      });
    expect(resCriar.status).toBe(201);
    expect(resCriar.body.sucesso).toBe(true);
    expect(resCriar.body.codigo_status).toBe(201);
    const idCriado = resCriar.body.dados.id;
    expect(idCriado).toBeDefined();

    // GET para consultar a demanda criada -> 200 OK
    const resGet = await request(app)
      .get(`/api/demandas/${idCriado}`)
      .set('X-API-Key', CHAVE_VALIDA);
    expect(resGet.status).toBe(200);
    expect(resGet.body.dados.titulo).toBe('Demanda de Teste Automatizado de Integração');

    // GET para id inexistente -> 404 Not Found
    const res404 = await request(app)
      .get('/api/demandas/99999999')
      .set('X-API-Key', CHAVE_VALIDA);
    expect(res404.status).toBe(404);
    expect(res404.body.codigo_status).toBe(404);

    // PUT para atualizar a demanda -> 200 OK
    const resPut = await request(app)
      .put(`/api/demandas/${idCriado}`)
      .set('X-API-Key', CHAVE_VALIDA)
      .send({
        coluna: 'in-progress',
        prioridade: 'medium',
      });
    expect(resPut.status).toBe(200);
    expect(resPut.body.dados.coluna).toBe('in-progress');

    // DELETE para excluir a demanda -> 200 OK
    const resDelete = await request(app)
      .delete(`/api/demandas/${idCriado}`)
      .set('X-API-Key', CHAVE_VALIDA);
    expect(resDelete.status).toBe(200);
    expect(resDelete.body.sucesso).toBe(true);

    // DELETE novamente no mesmo ID -> 404 Not Found
    const resDelete404 = await request(app)
      .delete(`/api/demandas/${idCriado}`)
      .set('X-API-Key', CHAVE_VALIDA);
    expect(resDelete404.status).toBe(404);
  });

  // 7. Toda rota documentada
  it('7. A documentação OpenAPI e interface Swagger UI devem estar disponíveis e interativas', async () => {
    // Valida especificação JSON pura
    const resDocs = await request(app).get('/api/docs/openapi.json');
    expect(resDocs.status).toBe(200);
    expect(resDocs.headers['content-type']).toMatch(/application\/json/);
    expect(resDocs.body.openapi).toBe('3.0.3');
    expect(resDocs.body.paths['/api/demandas']).toBeDefined();
    expect(resDocs.body.paths['/api/demandas/{id}']).toBeDefined();
    expect(resDocs.body.paths['/api/usuarios']).toBeDefined();
    expect(resDocs.body.components.securitySchemes.ApiKeyAuth).toBeDefined();

    // Valida interface Swagger UI em HTML
    const resHtml = await request(app).get('/api/docs');
    expect(resHtml.status).toBe(200);
    expect(resHtml.headers['content-type']).toMatch(/text\/html/);
    expect(resHtml.text).toContain('swagger-ui');
    expect(resHtml.text).toContain('SwaggerUIBundle');
  });

  // 8. Raiz do servidor e da API respondem com JSON padrão REST
  it('8. Raiz / e /api devem responder metadados em JSON (sem depender de painéis web)', async () => {
    const resRaiz = await request(app).get('/');
    expect(resRaiz.status).toBe(200);
    expect(resRaiz.headers['content-type']).toMatch(/application\/json/);
    expect(resRaiz.body.sucesso).toBe(true);
    expect(resRaiz.body.documentacao).toBe('/api/docs');

    const resApiRaiz = await request(app).get('/api');
    expect(resApiRaiz.status).toBe(200);
    expect(resApiRaiz.headers['content-type']).toMatch(/application\/json/);
    expect(resApiRaiz.body.sucesso).toBe(true);
  });

  // 9. Suporte a PATCH para atualizações parciais
  it('9. Deve suportar atualizações parciais via PATCH', async () => {
    // Cria uma demanda
    const resCriar = await request(app)
      .post('/api/demandas')
      .set('X-API-Key', CHAVE_VALIDA)
      .send({
        titulo: 'Demanda para teste PATCH',
        coluna: 'todo',
        prioridade: 'low',
      });
    expect(resCriar.status).toBe(201);
    const id = resCriar.body.dados.id;

    // Atualiza apenas a coluna via PATCH
    const resPatch = await request(app)
      .patch(`/api/demandas/${id}`)
      .set('X-API-Key', CHAVE_VALIDA)
      .send({ coluna: 'in-progress' });
    expect(resPatch.status).toBe(200);
    expect(resPatch.body.dados.coluna).toBe('in-progress');
    expect(resPatch.body.dados.titulo).toBe('Demanda para teste PATCH');
  });

  // 10. Tratamento de JSON inválido
  it('10. Envio de JSON sintaticamente inválido deve retornar 400 Bad Request em JSON', async () => {
    const res = await request(app)
      .post('/api/demandas')
      .set('X-API-Key', CHAVE_VALIDA)
      .set('Content-Type', 'application/json')
      .send('{"titulo": "Incompleto", '); // JSON quebrado

    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.sucesso).toBe(false);
    expect(res.body.erro).toBe('JSON Inválido');
  });
});
