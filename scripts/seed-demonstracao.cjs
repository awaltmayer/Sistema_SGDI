const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ddwlkvpvyzwkmmhpvcqn.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd2xrdnB2eXp3a21taHB2Y3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjAyNDUsImV4cCI6MjEwMzczNjI0NX0.-M2JlRJ8h63OoBX1VFj1dfm7z9UCm9c5paXk_Vu1C64';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// IDs dos usuários existentes no sistema:
// ENIO NETO: auth 'db2cb34a-708b-4a37-b760-800b4ec3e642', id: 14
// Augusto Wolfart Altmayer: auth '92477c16-dcc9-4591-9788-f4605030b947', id: 17
// LUIZ APPELT WELLER: auth 'e5ed083e-0054-40fe-a931-c182939bbfad', id: 15
// Ricardo Drews: auth 'ac1b523e-cde1-474f-a1ab-5f3756a6f7c0', id: 19

const USER_ENIO = 'db2cb34a-708b-4a37-b760-800b4ec3e642';
const USER_AUGUSTO = '92477c16-dcc9-4591-9788-f4605030b947';
const USER_LUIZ = 'e5ed083e-0054-40fe-a931-c182939bbfad';
const USER_RICARDO = 'ac1b523e-cde1-474f-a1ab-5f3756a6f7c0';

async function seed() {
  console.log('Iniciando limpeza dos cartões e dados anteriores...');

  // 1. Limpar comentários
  await supabase.from('comentarios').delete().neq('id', 0);

  // 2. Limpar itens de checklist
  await supabase.from('itens_checklist').delete().neq('id', 0);

  // 3. Limpar checklists
  await supabase.from('checklists').delete().neq('id', 0);

  // 4. Limpar cartões
  const { error: errDel } = await supabase.from('cartoes').delete().neq('id', 0);
  if (errDel) {
    console.error('Erro ao deletar cartões:', errDel);
    return;
  }
  console.log('Dados anteriores limpos com sucesso.');

  // 5. Inserir os novos cartões de TI (Software & Infra)
  const cartoesParaInserir = [
    {
      titulo: 'Migração do Cluster Kubernetes para Versão 1.30 (EKS/Infra)',
      descricao:
        'Executar a atualização dos control planes e worker nodes do cluster de produção para a versão v1.30. Necessário aplicar rolling update sem indisponibilidade nas APIs de microserviços e validar os ingress controllers.',
      coluna: 'in-progress',
      prioridade: 'high',
      id_usuario: USER_ENIO,
      ids_responsaveis: ['14', '17'],
      data_vencimento: '2026-10-02',
      posicao: 0,
    },
    {
      titulo: 'Implementação de Autenticação OAuth2 / MFA no Portal Corporativo (Software)',
      descricao:
        'Substituir o fluxo legado de sessão por autenticação federada com OpenID Connect (OIDC) e suporte a TOTP (Google Authenticator) para mitigar riscos de credenciais vazadas e conformidade com LGPD.',
      coluna: 'in-progress',
      prioridade: 'high',
      id_usuario: USER_AUGUSTO,
      ids_responsaveis: ['14', '15'],
      data_vencimento: '2026-09-30',
      posicao: 1,
    },
    {
      titulo: 'Correção de Vulnerabilidade Crítica no Proxy NGINX e Renovação SSL (Infra)',
      descricao:
        'Aplicação de patch contra CVE de buffer overflow nos balanceadores de carga e renovação antecipada do certificado Wildcard (*.empresa.com.br) via Let\'s Encrypt / Certbot com cipher suites TLS 1.3.',
      coluna: 'done',
      prioridade: 'high',
      id_usuario: USER_RICARDO,
      ids_responsaveis: ['14'],
      data_vencimento: '2026-09-28',
      posicao: 0,
    },
    {
      titulo: 'Pipeline CI/CD no GitHub Actions com SonarQube e Deploy Automatizado (Software/DevOps)',
      descricao:
        'Criação da esteira automatizada de build, execução de testes unitários com Vitest, análise estática de qualidade no SonarCloud e deploy automático para staging com notificações em canal do Slack.',
      coluna: 'done',
      prioridade: 'medium',
      id_usuario: USER_ENIO,
      ids_responsaveis: ['14', '19'],
      data_vencimento: '2026-09-27',
      posicao: 1,
    },
    {
      titulo: 'Configuração de Política de Backup Imutável e Disaster Recovery (Infra)',
      descricao:
        'Implementar storage tier com retenção com Bucket Lock (WORM - Write Once, Read Many) no Cloud Storage para proteger contra ransomware e exclusões acidentais, com replicação geo-redundante.',
      coluna: 'todo',
      prioridade: 'high',
      id_usuario: USER_LUIZ,
      ids_responsaveis: ['14', '17'],
      data_vencimento: '2026-10-05',
      posicao: 0,
    },
    {
      titulo: 'Refatoração e Otimização de Consultas SQL no Módulo de Relatórios (Software)',
      descricao:
        'Identificar queries com table scan em tabelas volumosas e criar índices compostos parciais no PostgreSQL para reduzir o tempo de resposta da API de 3.2s para menos de 200ms.',
      coluna: 'todo',
      prioridade: 'medium',
      id_usuario: USER_ENIO,
      ids_responsaveis: ['14', '15'],
      data_vencimento: '2026-10-07',
      posicao: 1,
    },
    {
      titulo: 'Provisionamento de VPN WireGuard e Segmentação de Rede para Home Office (Infra)',
      descricao:
        'Configurar servidor WireGuard de alta performance com autenticação via chaves públicas e isolamento de VLAN para os desenvolvedores remotos acessarem os ambientes internos com segurança.',
      coluna: 'todo',
      prioridade: 'low',
      id_usuario: USER_RICARDO,
      ids_responsaveis: ['19'],
      data_vencimento: '2026-10-10',
      posicao: 2,
    },
  ];

  const { data: cartoesCriados, error: errIns } = await supabase
    .from('cartoes')
    .insert(cartoesParaInserir)
    .select();

  if (errIns || !cartoesCriados) {
    console.error('Erro ao inserir novos cartões:', errIns);
    return;
  }

  console.log(`Inseridos ${cartoesCriados.length} cartões com sucesso!`);
  const cardMap = {};
  for (const c of cartoesCriados) {
    cardMap[c.titulo] = c.id;
    console.log(`Cartão #${c.id}: ${c.titulo}`);
  }

  // 6. Inserir Checklists e Itens para demonstrar a barra de progresso
  const checklistsData = [
    {
      id_cartao: cardMap['Migração do Cluster Kubernetes para Versão 1.30 (EKS/Infra)'],
      titulo: 'Plano de Mudança (GMUD) e Pré-Requisitos',
      itens: [
        { titulo: 'Backup dos etcd snapshots e export dos manifestos YAML', esta_concluido: true },
        { titulo: 'Validação de compatibilidade das APIs deprecated do K8s v1.30', esta_concluido: true },
        { titulo: 'Atualização da AMI nos grupos de auto-scaling (Node Groups)', esta_concluido: false },
        { titulo: 'Teste de carga e validação dos ingress controllers NGINX', esta_concluido: false },
      ],
    },
    {
      id_cartao: cardMap['Implementação de Autenticação OAuth2 / MFA no Portal Corporativo (Software)'],
      titulo: 'Critérios de Aceite e Segurança',
      itens: [
        { titulo: 'Configurar Client ID e Secret no Identity Provider (IdP)', esta_concluido: true },
        { titulo: 'Implementar middleware de validação do token JWT com assinatura RS256', esta_concluido: true },
        { titulo: 'Criação da tela de leitura de QR Code para pareamento do MFA (TOTP)', esta_concluido: true },
        { titulo: 'Implementar fluxo de revogação de tokens e refresh automático', esta_concluido: false },
      ],
    },
    {
      id_cartao: cardMap['Correção de Vulnerabilidade Crítica no Proxy NGINX e Renovação SSL (Infra)'],
      titulo: 'Homologação e Rollout de Segurança',
      itens: [
        { titulo: 'Atualização dos pacotes nginx e openssl para a versão estável mais recente', esta_concluido: true },
        { titulo: 'Renovação e instalação das chaves criptográficas no keystore', esta_concluido: true },
        { titulo: 'Validação de cipher suites TLS 1.3 no SSL Labs (Score A+)', esta_concluido: true },
        { titulo: 'Teste de healthcheck dos microserviços e reativação do tráfego', esta_concluido: true },
      ],
    },
    {
      id_cartao: cardMap['Pipeline CI/CD no GitHub Actions com SonarQube e Deploy Automatizado (Software/DevOps)'],
      titulo: 'Estágios da Pipeline de CI/CD',
      itens: [
        { titulo: 'Linting e checagem de tipos estáticos TypeScript', esta_concluido: true },
        { titulo: 'Execução da suíte de testes unitários com cobertura mínima de 80%', esta_concluido: true },
        { titulo: 'Construção da imagem Docker multi-stage otimizada', esta_concluido: true },
        { titulo: 'Notificação automática no canal de deploys do Slack', esta_concluido: true },
      ],
    },
    {
      id_cartao: cardMap['Configuração de Política de Backup Imutável e Disaster Recovery (Infra)'],
      titulo: 'Plano de Execução DR & Resiliência',
      itens: [
        { titulo: 'Habilitar Object Retention e Object Lock (WORM) no bucket de backup', esta_concluido: false },
        { titulo: 'Configurar replicação geográfica secundária (Cross-Region)', esta_concluido: false },
        { titulo: 'Simular cenário de restauração em ambiente isolado (Sandbox)', esta_concluido: false },
      ],
    },
    {
      id_cartao: cardMap['Refatoração e Otimização de Consultas SQL no Módulo de Relatórios (Software)'],
      titulo: 'Tarefas de Performance e Índices',
      itens: [
        { titulo: 'Extrair planos de execução com EXPLAIN (ANALYZE, BUFFERS)', esta_concluido: false },
        { titulo: 'Criar índices btree nas colunas de busca frequente', esta_concluido: false },
        { titulo: 'Implementar paginação baseada em cursor no endpoint', esta_concluido: false },
      ],
    },
    {
      id_cartao: cardMap['Provisionamento de VPN WireGuard e Segmentação de Rede para Home Office (Infra)'],
      titulo: 'Etapas de Conectividade e Redes',
      itens: [
        { titulo: 'Instalação e tuning do WireGuard no gateway Linux', esta_concluido: false },
        { titulo: 'Geração e distribuição segura dos arquivos .conf de clientes', esta_concluido: false },
        { titulo: 'Validação de regras no firewall iptables para isolamento de VLAN', esta_concluido: false },
      ],
    },
  ];

  for (const chk of checklistsData) {
    if (!chk.id_cartao) continue;
    const { data: chkCriado, error: errChk } = await supabase
      .from('checklists')
      .insert({
        id_cartao: chk.id_cartao,
        id_usuario: USER_ENIO,
        titulo: chk.titulo,
        posicao: 0,
      })
      .select()
      .single();

    if (errChk || !chkCriado) {
      console.error('Erro ao criar checklist:', errChk);
      continue;
    }

    const itensParaInserir = chk.itens.map((it, idx) => ({
      id_checklist: chkCriado.id,
      id_usuario: USER_ENIO,
      titulo: it.titulo,
      esta_concluido: it.esta_concluido,
      posicao: idx,
    }));

    await supabase.from('itens_checklist').insert(itensParaInserir);
  }
  console.log('Checklists e itens inseridos com sucesso!');

  // 7. Inserir Comentários técnicos simulando ENIO NETO
  const comentariosData = [
    {
      id_cartao: cardMap['Migração do Cluster Kubernetes para Versão 1.30 (EKS/Infra)'],
      id_usuario: USER_ENIO,
      id_autor: 14,
      conteudo:
        'Snapshot do etcd realizado com sucesso no bucket S3 de contingência. Iniciando drenagem dos nós de staging primeiro para validação prévia das pods.',
    },
    {
      id_cartao: cardMap['Migração do Cluster Kubernetes para Versão 1.30 (EKS/Infra)'],
      id_usuario: USER_ENIO,
      id_autor: 14,
      conteudo:
        '@Augusto Wolfart Altmayer Por favor, acompanhe o throughput e a taxa de 5xx no Grafana durante o rolling update.',
    },
    {
      id_cartao: cardMap['Implementação de Autenticação OAuth2 / MFA no Portal Corporativo (Software)'],
      id_usuario: USER_ENIO,
      id_autor: 14,
      conteudo:
        'Testes com o TOTP no Google Authenticator validados em ambiente local com sucesso. A chave secreta está sendo criptografada com AES-256 no banco de dados.',
    },
    {
      id_cartao: cardMap['Correção de Vulnerabilidade Crítica no Proxy NGINX e Renovação SSL (Infra)'],
      id_usuario: USER_ENIO,
      id_autor: 14,
      conteudo:
        'Atualização concluída com zero downtime nos balanceadores. O teste no SSL Labs confirmou nota A+ com suporte exclusivo a TLS 1.2 e TLS 1.3.',
    },
    {
      id_cartao: cardMap['Pipeline CI/CD no GitHub Actions com SonarQube e Deploy Automatizado (Software/DevOps)'],
      id_usuario: USER_ENIO,
      id_autor: 14,
      conteudo:
        'Pipeline em produção no repositório. O tempo médio de build caiu de 8 minutos para 1 minuto e 40 segundos com a estratégia de cache das dependências.',
    },
    {
      id_cartao: cardMap['Configuração de Política de Backup Imutável e Disaster Recovery (Infra)'],
      id_usuario: USER_ENIO,
      id_autor: 14,
      conteudo:
        'Alinhei com o setor de compliance a regra de retenção de 90 dias com Bucket Lock (WORM). Nenhuma exclusão poderá ser realizada antes do vencimento do período.',
    },
  ];

  for (const com of comentariosData) {
    if (!com.id_cartao) continue;
    await supabase.from('comentarios').insert({
      id_cartao: com.id_cartao,
      id_usuario: com.id_usuario,
      id_autor: com.id_autor,
      conteudo: com.conteudo,
    });
  }
  console.log('Comentários inseridos com sucesso!');
  console.log('\nSeed finalizado com êxito!');
}

seed().catch(console.error);
