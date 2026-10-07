/**
 * Script de Seed Manual: Demandas de Equipe de TI para o Sistema SGDI
 *
 * Popula cartões com alta fidelidade representando uma equipe de TI completa:
 * - Infraestrutura Cloud & Kubernetes
 * - Segurança da Informação & SOC
 * - Engenharia de Software & APIs
 * - Banco de Dados & DBA
 * - DevOps & Automação CI/CD
 *
 * Inclui:
 * - Tempos avançados de cronômetro (ativo) e datas de criação/conclusão (calendário)
 * - Prioridades distintas (Alta, Média, Baixa)
 * - Prazos críticos (Hoje, Amanhã, 2d, 3d)
 * - Prazos estourados / atrasados (em vermelho)
 * - Demandas sem responsável (fora do SLA)
 * - Demanda cancelada (fora do tempo médio)
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ddwlkvpvyzwkmmhpvcqn.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd2xrdnB2eXp3a21taHB2Y3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjAyNDUsImV4cCI6MjEwMzczNjI0NX0.-M2JlRJ8h63OoBX1VFj1dfm7z9UCm9c5paXk_Vu1C64';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function formatarDataIso(diasAtrasOuFrente) {
  const d = new Date();
  d.setDate(d.getDate() + diasAtrasOuFrente);
  return d.toISOString().split('T')[0];
}

function dataIsoTimestamp(diasAtras) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return d.toISOString();
}

async function rodarSeed() {
  console.log('🚀 [Seed TI] Conectando ao Supabase em:', SUPABASE_URL);

  // 1. Obter membros reais cadastrados na tabela 'usuarios'
  const { data: usuarios, error: errUsuarios } = await supabase
    .from('usuarios')
    .select('id, id_usuario, nome_completo, email');

  if (errUsuarios || !usuarios || usuarios.length === 0) {
    console.error('❌ Erro ao buscar membros da equipe:', errUsuarios);
    return;
  }

  console.log(`📋 Membros encontrados no sistema (${usuarios.length}):`);
  usuarios.forEach((u) => console.log(`   - #${u.id} ${u.nome_completo} (${u.email})`));

  // IDs para vincular nos cartões
  const uEnio = String(usuarios.find((u) => u.nome_completo?.toLowerCase().includes('enio'))?.id || usuarios[0].id);
  const uAugusto = String(usuarios.find((u) => u.nome_completo?.toLowerCase().includes('augusto'))?.id || usuarios[1 % usuarios.length].id);
  const uLuiz = String(usuarios.find((u) => u.nome_completo?.toLowerCase().includes('luiz'))?.id || usuarios[2 % usuarios.length].id);
  const uRicardo = String(usuarios.find((u) => u.nome_completo?.toLowerCase().includes('ricardo'))?.id || usuarios[3 % usuarios.length].id);

  const authEnio = usuarios.find((u) => String(u.id) === uEnio)?.id_usuario || null;
  const authAugusto = usuarios.find((u) => String(u.id) === uAugusto)?.id_usuario || null;

  // 2. Limpeza prévia de cartões para seed consistente
  console.log('\n🧹 Limpando cartões e dados anteriores...');
  try {
    await supabase.from('comentarios').delete().neq('id', 0);
    await supabase.from('itens_checklist').delete().neq('id', 0);
    await supabase.from('checklists').delete().neq('id', 0);
    await supabase.from('cartoes').delete().neq('id', 0);
  } catch (err) {
    console.warn('Aviso durante a limpeza:', err.message);
  }
  console.log('✅ Base pronta para inserção.');

  // 3. Catálogo de Demandas de TI Realistas e Distintas
  const demandasTI = [
    // ── CONCLUÍDAS (Com tempos avançados de cronômetro e dias corridos de calendário) ──
    {
      titulo: 'Migração do Cluster Kubernetes para v1.30 e Upgrade dos Worker Nodes (Infra/Cloud)',
      descricao:
        'Execução da janela de manutenção programada no cluster EKS de produção: atualização control plane, rolling update dos node groups sem downtime nas APIs e revalidação dos ingress controllers NGINX.',
      coluna: 'done',
      prioridade: 'high',
      id_usuario: authEnio,
      ids_responsaveis: [uEnio, uAugusto],
      data_vencimento: formatarDataIso(-4),
      criado_em: dataIsoTimestamp(12), // Criada há 12 dias
      posicao: 0,
      tracker: {
        em_execucao: false,
        tempo_total_segundos: 172800, // 48 horas = 2 dias ativos de cronômetro
        concluido_em: dataIsoTimestamp(3), // Concluída há 3 dias (9 dias de calendário)
        concluido_por_nome: 'ENIO NETO',
      },
    },
    {
      titulo: 'Implementação do Gateway de Pagamento PIX e Webhooks com Assinatura mTLS (Software)',
      descricao:
        'Desenvolvimento da integração bancária com protocolo Open Finance e certificação mTLS. Implementação de fila no RabbitMQ com política de retry para eventos com falha de conexão.',
      coluna: 'done',
      prioridade: 'medium',
      id_usuario: authAugusto,
      ids_responsaveis: [uLuiz],
      data_vencimento: formatarDataIso(-2),
      criado_em: dataIsoTimestamp(7), // Criada há 7 dias
      posicao: 1,
      tracker: {
        em_execucao: false,
        tempo_total_segundos: 86400, // 24 horas = 1 dia ativo de cronômetro
        concluido_em: dataIsoTimestamp(1), // Concluída há 1 dia (6 dias de calendário)
        concluido_por_nome: 'LUIZ APPELT WELLER',
      },
    },
    {
      titulo: 'Patch de Segurança do OpenSSL e Renovação do Certificado Wildcard (Segurança/Infra)',
      descricao:
        'Mitigação de vulnerabilidade crítica no módulo de criptografia dos servidores web e emissão de novo certificado TLS 1.3 Wildcard com cipher suites aprovadas pelo time de Cyber Security.',
      coluna: 'done',
      prioridade: 'high',
      id_usuario: authEnio,
      ids_responsaveis: [uRicardo],
      data_vencimento: formatarDataIso(-6),
      criado_em: dataIsoTimestamp(8),
      posicao: 2,
      tracker: {
        em_execucao: false,
        tempo_total_segundos: 43200, // 12 horas de cronômetro ativo
        concluido_em: dataIsoTimestamp(5), // 3 dias de calendário
        concluido_por_nome: 'Ricardo Drews',
      },
    },
    {
      titulo: 'Ajuste de Conexões do Pool HikariCP no Microsserviço de Faturamento (Software/DBA)',
      descricao:
        'Identificação de leak de conexões inativas no pool do backend Java Spring Boot. Ajuste de timeout para 30s e reconfiguração do tamanho máximo do pool no PostgreSQL.',
      coluna: 'done',
      prioridade: 'low',
      id_usuario: authAugusto,
      ids_responsaveis: [uAugusto],
      data_vencimento: null,
      criado_em: dataIsoTimestamp(3),
      posicao: 3,
      tracker: {
        em_execucao: false,
        tempo_total_segundos: 14400, // 4 horas de cronômetro
        concluido_em: dataIsoTimestamp(2), // 1 dia de calendário
        concluido_por_nome: 'Augusto Altmayer',
      },
    },

    // ── DEMANDAS CRÍTICAS (Faltando <= 3 dias para a data limite) ──
    {
      titulo: 'Troca de Chaves Criptográficas da API de Produção do Banco Central (Segurança)',
      descricao:
        'Substituição obrigatória das credenciais de produção no cofre HashiCorp Vault e sincronização com os secrets das aplicações antes da expiração do certificado parceiro.',
      coluna: 'in-progress',
      prioridade: 'high',
      id_usuario: authAugusto,
      ids_responsaveis: [uEnio],
      data_vencimento: formatarDataIso(0), // VENCE HOJE! (0 dias restantes)
      criado_em: dataIsoTimestamp(4),
      posicao: 0,
      tracker: {
        em_execucao: true,
        tempo_total_segundos: 28800, // 8 horas acumuladas
      },
    },
    {
      titulo: 'Envio do Relatório Mensal de Conformidade LGPD e Auditoria de Acessos (Compliance)',
      descricao:
        'Extração dos logs de auditoria do SIEM (Wazuh/Splunk), consolidação dos relatórios de privilégios de acesso e validação técnica junto ao DPO da companhia.',
      coluna: 'todo',
      prioridade: 'high',
      id_usuario: authEnio,
      ids_responsaveis: [uAugusto],
      data_vencimento: formatarDataIso(1), // VENCE AMANHÃ! (1 dia restante)
      criado_em: dataIsoTimestamp(2),
      posicao: 0,
      tracker: {
        em_execucao: false,
        tempo_total_segundos: 3600,
      },
    },
    {
      titulo: 'Remediação de Falha de Buffer Overflow no WAF Cloudflare (Infra/Redes)',
      descricao:
        'Ajuste das regras do Web Application Firewall e ativação de rate limiting nos endpoints públicos de login para mitigar tentativa de credencial stuffing.',
      coluna: 'in-progress',
      prioridade: 'medium',
      id_usuario: authEnio,
      data_vencimento: formatarDataIso(2), // FALTAM 2 DIAS!
      criado_em: dataIsoTimestamp(3),
      ids_responsaveis: [uLuiz, uRicardo],
      posicao: 1,
      tracker: {
        em_execucao: false,
        tempo_total_segundos: 21600, // 6 horas
      },
    },
    {
      titulo: 'Homologação do Teste de Restauração de Disaster Recovery em Staging (Infra/DBA)',
      descricao:
        'Simulação completa de falha no data center primário e restore do banco PostgreSQL a partir dos snapshots criptografados no S3 com validação de RTO e RPO.',
      coluna: 'todo',
      prioridade: 'medium',
      id_usuario: authAugusto,
      data_vencimento: formatarDataIso(3), // FALTAM 3 DIAS!
      criado_em: dataIsoTimestamp(1),
      ids_responsaveis: [], // SEM RESPONSÁVEL! (Fora do SLA)
      posicao: 1,
      tracker: {
        em_execucao: false,
        tempo_total_segundos: 0,
      },
    },

    // ── DEMANDAS ATRASADAS (Aparecem em VERMELHO) ──
    {
      titulo: 'Entrega do Módulo de Exportação Assíncrona de Extratos em PDF/XLSX (Software)',
      descricao:
        'Processamento em background via worker BullMQ com envio de notificação por e-mail e push notification quando o arquivo compactado estiver pronto para download.',
      coluna: 'in-progress',
      prioridade: 'high',
      id_usuario: authAugusto,
      ids_responsaveis: [uLuiz],
      data_vencimento: formatarDataIso(-3), // ATRASADA HÁ 3 DIAS!
      criado_em: dataIsoTimestamp(9),
      posicao: 2,
      tracker: {
        em_execucao: false,
        tempo_total_segundos: 50400, // 14 horas
      },
    },
    {
      titulo: 'Implementação de Política de Retenção de Logs no ElasticSearch / OpenSearch (DevOps)',
      descricao:
        'Configuração de Index Lifecycle Management (ILM) para expurgar automaticamente índices de logs com mais de 90 dias e desafogar o armazenamento dos discos NVMe.',
      coluna: 'todo',
      prioridade: 'medium',
      id_usuario: authEnio,
      ids_responsaveis: [uRicardo],
      data_vencimento: formatarDataIso(-2), // ATRASADA HÁ 2 DIAS!
      criado_em: dataIsoTimestamp(6),
      posicao: 2,
      tracker: {
        em_execucao: false,
        tempo_total_segundos: 0,
      },
    },
    {
      titulo: 'Revisão dos Grupos de Segurança e Portas SSH Expostas na AWS VPC (Segurança)',
      descricao:
        'Identificar security groups com abertura para 0.0.0.0/0 nas portas administrativas e migrar o acesso para AWS Systems Manager Session Manager (SSM) sem IP público.',
      coluna: 'todo',
      prioridade: 'high',
      id_usuario: authEnio,
      data_vencimento: formatarDataIso(-1), // ATRASADA HÁ 1 DIA!
      criado_em: dataIsoTimestamp(5),
      ids_responsaveis: [], // SEM RESPONSÁVEL! (Fora do SLA)
      posicao: 3,
      tracker: {
        em_execucao: false,
        tempo_total_segundos: 0,
      },
    },

    // ── DEMANDAS ABERTAS COM PRAZOS REGULARES / LONGO PRAZO ──
    {
      titulo: 'Refatoração da Arquitetura de Cache com Redis Cluster e Invalidação por Tags (Software)',
      descricao:
        'Substituição do cache local em memória por Redis distribuído para suporte a múltiplas réplicas do backend, reduzindo chamadas repetidas ao PostgreSQL em 75%.',
      coluna: 'in-progress',
      prioridade: 'medium',
      id_usuario: authEnio,
      ids_responsaveis: [uEnio],
      data_vencimento: formatarDataIso(12), // 12 dias para vencer
      criado_em: dataIsoTimestamp(3),
      posicao: 3,
      tracker: {
        em_execucao: true,
        tempo_total_segundos: 18000,
      },
    },
    {
      titulo: 'Criação de Dashboards de Observabilidade no Grafana com Métricas de Negócio (DevOps)',
      descricao:
        'Configuração de painéis em tempo real monitorando taxa de conversão, erros 5xx de HTTP, latência p99 e taxa de consumo de memória dos microsserviços via Prometheus.',
      coluna: 'todo',
      prioridade: 'low',
      id_usuario: authAugusto,
      ids_responsaveis: [uAugusto],
      data_vencimento: formatarDataIso(20), // 20 dias para vencer
      criado_em: dataIsoTimestamp(2),
      posicao: 4,
      tracker: {
        em_execucao: false,
        tempo_total_segundos: 0,
      },
    },
    {
      titulo: 'Treinamento de Phishing Simulado e Conscientização em Segurança da Informação (SOC)',
      descricao:
        'Envio de campanha controlada de conscientização para os colaboradores e tabulação dos dados de cliques em links suspeitos para plano de capacitação anual.',
      coluna: 'todo',
      prioridade: 'low',
      id_usuario: authEnio,
      data_vencimento: formatarDataIso(28),
      criado_em: dataIsoTimestamp(1),
      ids_responsaveis: [uRicardo],
      posicao: 5,
      tracker: {
        em_execucao: false,
        tempo_total_segundos: 0,
      },
    },

    // ── DEMANDA CANCELADA (Excluída das métricas de tempo de resolução) ──
    {
      titulo: '[Cancelada] Migração para Provedor de Mensageria Legado via RabbitMQ On-Premise',
      descricao:
        'Demanda cancelada após deliberação do comitê de arquitetura que optou pela continuidade no serviço gerenciado em nuvem (Amazon SQS/SNS).',
      coluna: 'done',
      prioridade: 'low',
      id_usuario: authAugusto,
      data_vencimento: null,
      criado_em: dataIsoTimestamp(18),
      ids_responsaveis: [],
      posicao: 4,
      tracker: {
        em_execucao: false,
        tempo_total_segundos: 7200,
        concluido_em: dataIsoTimestamp(10),
        concluido_por_nome: 'Sistema',
      },
    },
  ];

  console.log(`\n📦 Inserindo ${demandasTI.length} cartões de TI no quadro...`);

  const payloadCartoes = demandasTI.map((d) => ({
    titulo: d.titulo,
    descricao: d.descricao,
    coluna: d.coluna,
    prioridade: d.prioridade,
    data_vencimento: d.data_vencimento,
    posicao: d.posicao,
    criado_em: d.criado_em,
    id_usuario: d.id_usuario || authEnio,
    ids_responsaveis: Array.isArray(d.ids_responsaveis) ? d.ids_responsaveis : [],
  }));

  const { data: inseridos, error: errInserir } = await supabase
    .from('cartoes')
    .insert(payloadCartoes)
    .select();

  if (errInserir || !inseridos) {
    console.error('❌ Erro ao inserir cartões:', errInserir);
    return;
  }

  console.log(`✅ Sucesso! ${inseridos.length} cartões criados.`);

  // 4. Salvar metadados de rastreamento de tempo para alimentar o cronômetro do Dashboard
  const fs = require('fs');
  const path = require('path');

  const metadataPath = path.resolve(__dirname, '../src/lib/provedor-dados/storage-local.ts');
  if (fs.existsSync(metadataPath)) {
    let content = fs.readFileSync(metadataPath, 'utf8');

    const demoMetaEntries = {};
    inseridos.forEach((c, idx) => {
      const def = demandasTI[idx];
      if (def?.tracker) {
        demoMetaEntries[String(c.id)] = {
          complexity: def.prioridade === 'high' ? 'high' : def.prioridade === 'medium' ? 'medium' : 'low',
          time_tracker: {
            em_execucao: Boolean(def.tracker.em_execucao),
            tempo_total_segundos: def.tracker.tempo_total_segundos || 0,
            concluido_em: def.tracker.concluido_em || null,
            concluido_por_nome: def.tracker.concluido_por_nome || 'Equipe de TI',
            pausas: [],
          },
        };
      }
    });

    const injection = `export const DEFAULT_DEMO_METADATA: Record<string, SupabaseCardMeta> = ${JSON.stringify(
      demoMetaEntries,
      null,
      2
    )};`;

    const regex = /export const DEFAULT_DEMO_METADATA: Record<string, SupabaseCardMeta> = {[\s\S]*?};/;
    if (regex.test(content)) {
      content = content.replace(regex, injection);
      fs.writeFileSync(metadataPath, content, 'utf8');
      console.log('📝 Metadados do cronômetro sincronizados em storage-local.ts');
    }
  }

  console.log('\n🎉 [Seed TI Finalizada com Sucesso]');
  console.log('--------------------------------------------------');
  console.log(`• Concluídas com tempo acumulado: 4 demandas`);
  console.log(`• Críticas com prazo curto (<= 3d): 4 demandas`);
  console.log(`• Atrasadas em vermelho: 3 demandas`);
  console.log(`• Sem responsável fora do SLA: 2 demandas`);
  console.log(`• Cancelada fora do tempo médio: 1 demanda`);
  console.log('--------------------------------------------------\n');
}

rodarSeed().catch((e) => console.error('Erro inesperado na seed:', e));
