import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { config } from '../src/config/env.js';

describe('👥 Rotas de Usuários e Membros (/api/usuarios)', () => {
  const CHAVE = config.chaveApi;

  it('Deve listar usuários do SGDI', async () => {
    const res = await request(app)
      .get('/api/usuarios')
      .set('X-API-Key', CHAVE);

    expect(res.status).toBe(200);
    expect(res.body.sucesso).toBe(true);
    expect(Array.isArray(res.body.dados)).toBe(true);
    expect(res.body.dados.length).toBeGreaterThan(0);
  });

  it('Deve cadastrar um novo usuário e retornar 201 Created', async () => {
    const emailUnico = `integracao.${Date.now()}@sgdi.local`;
    const res = await request(app)
      .post('/api/usuarios')
      .set('X-API-Key', CHAVE)
      .send({
        nome_completo: 'Robô Automação',
        email: emailUnico,
        funcao: 'Membro',
      });

    expect(res.status).toBe(201);
    expect(res.body.sucesso).toBe(true);
    expect(res.body.dados.nome_completo).toBe('Robô Automação');
    expect(res.body.dados.iniciais).toBe('RA');

    const usuarioId = res.body.dados.id;

    // Consulta pelo ID
    const resConsulta = await request(app)
      .get(`/api/usuarios/${usuarioId}`)
      .set('X-API-Key', CHAVE);

    expect(resConsulta.status).toBe(200);
    expect(resConsulta.body.dados.email).toBe(emailUnico);
  });

  it('Deve retornar 400 Bad Request ao tentar cadastrar usuário sem nome ou sem email válido', async () => {
    const resSemNome = await request(app)
      .post('/api/usuarios')
      .set('X-API-Key', CHAVE)
      .send({ email: 'semnome@email.com' });
    expect(resSemNome.status).toBe(400);

    const resEmailInvalido = await request(app)
      .post('/api/usuarios')
      .set('X-API-Key', CHAVE)
      .send({ nome_completo: 'Teste', email: 'email_sem_arroba' });
    expect(resEmailInvalido.status).toBe(400);
  });
});
