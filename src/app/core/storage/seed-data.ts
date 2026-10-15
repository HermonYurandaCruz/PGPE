import { User } from '../../shared/models/auth.models';
import { Concurso } from '../../shared/models/concurso.models';
import { Proposta, AtaAbertura } from '../../shared/models/proposta.models';
import { Contrato, AutoMedicao, PagamentoContrato, OcorrenciaContrato, AdendaContrato } from '../../shared/models/contrato.models';
import { TrocoEstrada } from '../../shared/models/estrada.models';
import { RegistoAuditoria } from '../../shared/models/audit.models';
import { PedidoEsclarecimento } from '../../shared/models/esclarecimento.models';
import { ReclamacaoRecurso } from '../../shared/models/reclamacao.models';
import { DenunciaCidada } from '../../shared/models/denuncia.models';

export const SEED_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Dr. Salvador Matsinhe',
    email: 'admin@mtl.demo',
    role: 'ADMIN',
    departamento: 'Direcção de Tecnologias de Informação e UGEA',
    cargo: 'Administrador de Sistemas & Auditor de e-Procurement',
    telefone: '+258 84 100 2000',
    active: true,
    avatar: 'SM'
  },
  {
    id: 'user-gestao',
    name: 'Dra. Maria Helena Mabote',
    email: 'gestao@mtl.demo',
    role: 'GESTAO',
    departamento: 'Gabinete do Ministro / Secretaria Permanente',
    cargo: 'Directora Nacional / Autoridade Competente',
    telefone: '+258 82 200 3000',
    active: true,
    avatar: 'MM'
  },
  {
    id: 'user-tecnico',
    name: 'Eng. Sérgio Macuácua',
    email: 'tecnico@mtl.demo',
    role: 'TECNICO',
    departamento: 'UGEA - Unidade Gestora Executora das Aquisições',
    cargo: 'Técnico Superior de Obras Públicas & Fiscal',
    telefone: '+258 84 300 4000',
    active: true,
    avatar: 'SM'
  },
  {
    id: 'user-concorrente-ceta',
    name: 'CETA - Engenharia e Construção, S.A.',
    email: 'concorrente@ceta.demo',
    role: 'CONCORRENTE',
    nuit: '400123456',
    companyName: 'CETA - Engenharia e Construção, S.A.',
    companyType: 'GRANDE',
    areaActividade: 'Construção Civil, Obras de Arte e Infraestruturas Rodoviárias',
    telefone: '+258 21 490 100',
    active: true,
    avatar: 'CE'
  },
  {
    id: 'user-concorrente-jocare',
    name: 'Jocare Pavimentações & Logística, Lda',
    email: 'concorrente@jocare.demo',
    role: 'CONCORRENTE',
    nuit: '400789123',
    companyName: 'Jocare Pavimentações & Logística, Lda',
    companyType: 'MEDIA',
    areaActividade: 'Pavimentação Asfáltica e Terraplanagens',
    telefone: '+258 21 320 450',
    active: true,
    avatar: 'JP'
  },
  {
    id: 'user-concorrente-vilankulo',
    name: 'Vilankulo Construções e Infraestruturas',
    email: 'concorrente@vilankulo.demo',
    role: 'CONCORRENTE',
    nuit: '400654987',
    companyName: 'Vilankulo Construções e Infraestruturas',
    companyType: 'PEQUENA',
    areaActividade: 'Obras Públicas e Manutenção Rodoviária',
    telefone: '+258 29 384 120',
    active: true,
    avatar: 'VC'
  }
];

export const SEED_CONCURSOS: Concurso[] = [
  {
    id: 'cnc-01',
    numeroProcesso: 'MTL/UGEA/CP-01/2026',
    titulo: 'Reabilitação e Asfaltagem da Estrada Nacional EN1 (Xai-Xai a Chókwè)',
    objecto: 'Empreitada de reabilitação e reforço estrutural do pavimento da EN1 entre Xai-Xai e Chókwè, numa extensão de 68 km, incluindo drenagem profunda e sinalização horizontal e vertical.',
    modalidadeId: 'CONCURSO_PUBLICO',
    valorEstimadoMZN: 450000000,
    provincia: 'Gaza',
    localizacaoEspecifica: 'Gaza (EN1 km 210 a km 278)',
    prazoSubmissao: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    dataAbertura: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    dataCriacao: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    dataPublicacao: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    estado: 'PUBLICADO',
    criadoPorId: 'user-tecnico',
    criadoPorNome: 'Eng. Sérgio Macuácua',
    juriDesignadoIds: ['user-tecnico', 'user-admin'],
    criterioAvaliacao: 'COMBINADO',
    pesoTecnico: 60,
    pesoFinanceiro: 40,
    trocoEstradaId: 'troco-02',
    documentos: [
      {
        id: 'doc-01',
        nome: 'Caderno_Encargos_EN1_XaiXai_Chokwe.pdf',
        tamanhoBytes: 4250000,
        tipoMime: 'application/pdf',
        dataUpload: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        descricao: 'Caderno de Encargos e Especificações Técnicas de Obras Públicas'
      },
      {
        id: 'doc-02',
        nome: 'Termos_Referencia_Medicoes_Quantidades.xlsx',
        tamanhoBytes: 1120000,
        tipoMime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dataUpload: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        descricao: 'Mapa de Quantidades e Preços Unitários'
      },
      {
        id: 'doc-03',
        nome: 'Programa_Concurso_Decreto_79_2022.pdf',
        tamanhoBytes: 890000,
        tipoMime: 'application/pdf',
        dataUpload: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        descricao: 'Regulamento e Critérios de Avaliação'
      }
    ]
  },
  {
    id: 'cnc-02',
    numeroProcesso: 'MTL/UGEA/CP-02/2026',
    titulo: 'Construção da Nova Variante Rodoviária da EN8 (Nampula a Nacala - Lote 2)',
    objecto: 'Construção de 42 km de estrada em pavimento betuminoso de alta durabilidade para suporte ao tráfego pesado do Corredor de Nacala.',
    modalidadeId: 'CONCURSO_PUBLICO',
    valorEstimadoMZN: 320000000,
    provincia: 'Nampula',
    localizacaoEspecifica: 'Nampula - Meconta - Nacala',
    prazoSubmissao: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Prazo expirado (pronto para abertura/avaliação)
    dataAbertura: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    dataCriacao: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    dataPublicacao: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    estado: 'PUBLICADO',
    criadoPorId: 'user-tecnico',
    criadoPorNome: 'Eng. Sérgio Macuácua',
    juriDesignadoIds: ['user-tecnico'],
    criterioAvaliacao: 'COMBINADO',
    pesoTecnico: 70,
    pesoFinanceiro: 30,
    trocoEstradaId: 'troco-04',
    documentos: [
      {
        id: 'doc-04',
        nome: 'Caderno_Encargos_EN8_Lote2.pdf',
        tamanhoBytes: 5120000,
        tipoMime: 'application/pdf',
        dataUpload: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        descricao: 'Caderno de Encargos EN8'
      }
    ]
  },
  {
    id: 'cnc-03',
    numeroProcesso: 'MTL/UGEA/CPQ-01/2026',
    titulo: 'Reabilitação Estrutural e Duplicação do Corredor da Beira (EN6 - Dondo a Machipanda)',
    objecto: 'Reabilitação profunda e ampliação da capacidade de escoamento logístico rodoviário do Porto da Beira até à fronteira com o Zimbabwe.',
    modalidadeId: 'CONCURSO_PREVIA_QUALIFICACAO',
    valorEstimadoMZN: 890000000,
    provincia: 'Sofala',
    localizacaoEspecifica: 'Sofala / Manica (EN6)',
    prazoSubmissao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dataAbertura: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    dataCriacao: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    dataPublicacao: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    estado: 'EM_AVALIACAO',
    criadoPorId: 'user-tecnico',
    criadoPorNome: 'Eng. Sérgio Macuácua',
    juriDesignadoIds: ['user-tecnico', 'user-admin'],
    criterioAvaliacao: 'COMBINADO',
    pesoTecnico: 60,
    pesoFinanceiro: 40,
    trocoEstradaId: 'troco-05',
    documentos: [
      {
        id: 'doc-05',
        nome: 'Manifestacao_Interesse_EN6_PreviaQualif.pdf',
        tamanhoBytes: 3400000,
        tipoMime: 'application/pdf',
        dataUpload: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'cnc-04',
    numeroProcesso: 'MTL/UGEA/CP-04/2025',
    titulo: 'Reabilitação de Emergência da EN1 (Troço Marracuene a Manhiça, 45 km)',
    objecto: 'Reparação de taludes, reconstrução de camada base e tapete asfáltico após fortes cheias.',
    modalidadeId: 'CONCURSO_PUBLICO',
    valorEstimadoMZN: 260000000,
    provincia: 'Maputo Província',
    localizacaoEspecifica: 'EN1 (km 32 a km 77)',
    prazoSubmissao: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    dataAbertura: new Date(Date.now() - 119 * 24 * 60 * 60 * 1000).toISOString(),
    dataCriacao: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    dataPublicacao: new Date(Date.now() - 145 * 24 * 60 * 60 * 1000).toISOString(),
    estado: 'EM_EXECUCAO',
    criadoPorId: 'user-tecnico',
    criadoPorNome: 'Eng. Sérgio Macuácua',
    juriDesignadoIds: ['user-tecnico'],
    criterioAvaliacao: 'MENOR_PRECO',
    pesoTecnico: 50,
    pesoFinanceiro: 50,
    trocoEstradaId: 'troco-01',
    vencedorAdjudicadoId: 'user-concorrente-ceta',
    vencedorAdjudicadoNome: 'CETA - Engenharia e Construção, S.A.',
    valorAdjudicadoMZN: 248500000,
    dataAdjudicacao: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
    despachoAdjudicacao: 'Despacho Homologatório nº 14/MTL/2025: Adjudicado à proposta concorrente CETA por reunir total conformidade técnica e apresentar proposta mais vantajosa.',
    documentos: [
      {
        id: 'doc-06',
        nome: 'Caderno_Encargos_EN1_Marracuene.pdf',
        tamanhoBytes: 2800000,
        tipoMime: 'application/pdf',
        dataUpload: new Date(Date.now() - 145 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'cnc-05',
    numeroProcesso: 'MTL/UGEA/CDE-01/2026',
    titulo: 'Sistema Integrado de Pesagem em Movimento e Gestão Inteligente de Tráfego Rodoviário',
    objecto: 'Fornecimento e montagem de pórticos de alta velocidade com sensores WIM (Weigh-in-Motion) para preservação do património rodoviário nacional.',
    modalidadeId: 'CONCURSO_DUAS_ETAPAS',
    valorEstimadoMZN: 185000000,
    provincia: 'Maputo Província',
    localizacaoEspecifica: 'Postos de Pesagem EN1 e EN4',
    prazoSubmissao: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    dataAbertura: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    dataCriacao: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    dataPublicacao: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
    estado: 'ADJUDICADO',
    criadoPorId: 'user-tecnico',
    criadoPorNome: 'Eng. Sérgio Macuácua',
    juriDesignadoIds: ['user-tecnico', 'user-admin'],
    criterioAvaliacao: 'COMBINADO',
    pesoTecnico: 70,
    pesoFinanceiro: 30,
    vencedorAdjudicadoId: 'user-concorrente-jocare',
    vencedorAdjudicadoNome: 'Jocare Pavimentações & Logística, Lda',
    valorAdjudicadoMZN: 178200000,
    dataAdjudicacao: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    despachoAdjudicacao: 'Despacho Ministerial nº 08/GM/2026: Adjudicado ao consórcio liderado pela Jocare após parecer técnico favorável.',
    documentos: []
  },
  {
    id: 'cnc-06',
    numeroProcesso: 'MTL/UGEA/CPD-03/2026',
    titulo: 'Reparação e Manutenção de Pontões Metálicos na Estrada EN102 em Manica',
    objecto: 'Trabalhos pontuais de serralharia pesada, reforço de encontros e pintura anticorrosiva em 6 pontões secundários.',
    modalidadeId: 'CONCURSO_PEQUENA_DIMENSAO',
    valorEstimadoMZN: 3800000,
    provincia: 'Manica',
    localizacaoEspecifica: 'EN102 Sussundenga a Chimoio',
    prazoSubmissao: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    dataAbertura: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    dataCriacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    estado: 'RASCUNHO',
    criadoPorId: 'user-tecnico',
    criadoPorNome: 'Eng. Sérgio Macuácua',
    juriDesignadoIds: [],
    criterioAvaliacao: 'MENOR_PRECO',
    pesoTecnico: 50,
    pesoFinanceiro: 50,
    documentos: []
  },
  {
    id: 'cnc-07',
    numeroProcesso: 'MTL/UGEA/CL-01/2026',
    titulo: 'Auditoria de Segurança Rodoviária e Peritagem à Ponte sobre o Rio Save',
    objecto: 'Serviços especializados de consultoria de engenharia estrutural para ensaios não destrutivos dos tirantes e tabuleiro da Ponte do Save.',
    modalidadeId: 'CONCURSO_LIMITADO',
    valorEstimadoMZN: 12500000,
    provincia: 'Inhambane',
    localizacaoEspecifica: 'Fronteira Inhambane / Sofala (Rio Save)',
    prazoSubmissao: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
    dataAbertura: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    dataCriacao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    estado: 'PENDENTE_APROVACAO',
    criadoPorId: 'user-tecnico',
    criadoPorNome: 'Eng. Sérgio Macuácua',
    juriDesignadoIds: ['user-tecnico'],
    criterioAvaliacao: 'COMBINADO',
    pesoTecnico: 80,
    pesoFinanceiro: 20,
    documentos: []
  },
  {
    id: 'cnc-08',
    numeroProcesso: 'MTL/UGEA/CC-02/2025',
    titulo: 'Sinalização Horizontal e Pintura Termoplástica da Circular de Maputo',
    objecto: 'Trabalhos de repintura de faixas de rodagem, zebrados e passadeiras com tinta termoplástica retro-reflectora.',
    modalidadeId: 'CONCURSO_COTACOES',
    valorEstimadoMZN: 1450000,
    provincia: 'Maputo Cidade',
    localizacaoEspecifica: 'Estrada Circular de Maputo (Nós 1 a 6)',
    prazoSubmissao: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    dataAbertura: new Date(Date.now() - 199 * 24 * 60 * 60 * 1000).toISOString(),
    dataCriacao: new Date(Date.now() - 210 * 24 * 60 * 60 * 1000).toISOString(),
    dataPublicacao: new Date(Date.now() - 205 * 24 * 60 * 60 * 1000).toISOString(),
    estado: 'CONCLUIDO',
    criadoPorId: 'user-tecnico',
    criadoPorNome: 'Eng. Sérgio Macuácua',
    juriDesignadoIds: ['user-tecnico'],
    criterioAvaliacao: 'MENOR_PRECO',
    pesoTecnico: 50,
    pesoFinanceiro: 50,
    trocoEstradaId: 'troco-06',
    vencedorAdjudicadoId: 'user-concorrente-vilankulo',
    vencedorAdjudicadoNome: 'Vilankulo Construções e Infraestruturas',
    valorAdjudicadoMZN: 1390000,
    dataAdjudicacao: new Date(Date.now() - 190 * 24 * 60 * 60 * 1000).toISOString(),
    documentos: []
  },
  {
    id: 'cnc-09',
    numeroProcesso: 'MTL/UGEA/CLP-01/2025',
    titulo: 'Fornecimento Contínuo de 20.000 Toneladas de Betume Asfáltico 60/70',
    objecto: 'Fornecimento a granel de betume asfáltico para brigadas provinciais de manutenção rodoviária.',
    modalidadeId: 'CONCURSO_LANCES',
    valorEstimadoMZN: 95000000,
    provincia: 'Sofala',
    localizacaoEspecifica: 'Porto da Beira / Depósitos Regionais',
    prazoSubmissao: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
    dataAbertura: new Date(Date.now() - 79 * 24 * 60 * 60 * 1000).toISOString(),
    dataCriacao: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
    dataPublicacao: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    estado: 'CANCELADO',
    criadoPorId: 'user-tecnico',
    criadoPorNome: 'Eng. Sérgio Macuácua',
    juriDesignadoIds: [],
    criterioAvaliacao: 'MENOR_PRECO',
    pesoTecnico: 50,
    pesoFinanceiro: 50,
    justificacaoCancelamento: 'Cancelamento por imperativo de interesse público decorrente de reestruturação do plano financeiro orçamental anual (Artigo 92 do Dec. 79/2022).',
    documentos: []
  }
];

export const SEED_PROPOSTAS: Proposta[] = [
  // Propostas seladas para cnc-02 (prazo expirou, prontas para ato de abertura pelo júri!)
  {
    id: 'prop-01',
    concursoId: 'cnc-02',
    concorrenteId: 'user-concorrente-ceta',
    concorrenteNome: 'CETA - Engenharia e Construção, S.A.',
    concorrenteNuit: '400123456',
    concorrenteEmail: 'concorrente@ceta.demo',
    valorPropostoMZN: 312500000,
    prazoExecucaoMeses: 14,
    dataSubmissao: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    versao: 1,
    hashSHA256: '9f83c12c4f12338248b295b0e0eb859243407b1ec11151b30e3804ec6fb3d690',
    codigoReferencia: 'PROP-MTL-2026-CETA-01',
    carimboTemporal: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    selada: true, // Ainda selada até ato de abertura
    documentos: [
      {
        id: 'pdoc-01',
        nome: 'Proposta_Tecnica_CETA_EN8.pdf',
        tipo: 'PROPOSTA_TECNICA',
        tamanhoBytes: 8400000,
        tipoMime: 'application/pdf',
        dataUpload: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'pdoc-02',
        nome: 'Proposta_Financeira_CETA_Precos_Unitarios.xlsx',
        tipo: 'PROPOSTA_FINANCEIRA',
        tamanhoBytes: 1540000,
        tipoMime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dataUpload: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'pdoc-03',
        nome: 'Garantia_Bancaria_Millennium_BIM.pdf',
        tipo: 'GARANTIA_BANCARIA',
        tamanhoBytes: 620000,
        tipoMime: 'application/pdf',
        dataUpload: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ],
    historicoVersoes: [
      {
        versao: 1,
        dataSubmissao: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        hashSHA256: '9f83c12c4f12338248b295b0e0eb859243407b1ec11151b30e3804ec6fb3d690',
        valorPropostoMZN: 312500000,
        prazoExecucaoMeses: 14
      }
    ]
  },
  {
    id: 'prop-02',
    concursoId: 'cnc-02',
    concorrenteId: 'user-concorrente-jocare',
    concorrenteNome: 'Jocare Pavimentações & Logística, Lda',
    concorrenteNuit: '400789123',
    concorrenteEmail: 'concorrente@jocare.demo',
    valorPropostoMZN: 298800000,
    prazoExecucaoMeses: 16,
    dataSubmissao: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    versao: 2, // Teve substituição de proposta
    hashSHA256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    codigoReferencia: 'PROP-MTL-2026-JOC-02',
    carimboTemporal: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    selada: true,
    documentos: [
      {
        id: 'pdoc-04',
        nome: 'Proposta_Tecnica_Jocare_v2.pdf',
        tipo: 'PROPOSTA_TECNICA',
        tamanhoBytes: 6100000,
        tipoMime: 'application/pdf',
        dataUpload: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'pdoc-05',
        nome: 'Proposta_Financeira_Jocare_v2.xlsx',
        tipo: 'PROPOSTA_FINANCEIRA',
        tamanhoBytes: 1210000,
        tipoMime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dataUpload: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      }
    ],
    historicoVersoes: [
      {
        versao: 1,
        dataSubmissao: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        hashSHA256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
        valorPropostoMZN: 305000000,
        prazoExecucaoMeses: 16,
        motivoSubstituicao: 'Actualização da folha de encargos de mão de obra local'
      },
      {
        versao: 2,
        dataSubmissao: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        hashSHA256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        valorPropostoMZN: 298800000,
        prazoExecucaoMeses: 16
      }
    ]
  },
  // Propostas avaliadas para cnc-03 (em avaliação)
  {
    id: 'prop-03',
    concursoId: 'cnc-03',
    concorrenteId: 'user-concorrente-ceta',
    concorrenteNome: 'CETA - Engenharia e Construção, S.A.',
    concorrenteNuit: '400123456',
    concorrenteEmail: 'concorrente@ceta.demo',
    valorPropostoMZN: 845000000,
    prazoExecucaoMeses: 24,
    dataSubmissao: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    versao: 1,
    hashSHA256: 'c34b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
    codigoReferencia: 'PROP-MTL-2026-CETA-EN6',
    carimboTemporal: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    selada: false, // Já aberta pelo júri
    documentos: [],
    historicoVersoes: [],
    admitida: true,
    pontuacaoTecnica: 92.5,
    pontuacaoFinanceira: 89.0,
    pontuacaoFinal: 91.1,
    classificacao: 1,
    recomendadaParaAdjudicacao: true,
    parecerJuri: 'Proposta com excelente plano metodológico e parque de máquinas robusto no centro do país.'
  },
  {
    id: 'prop-04',
    concursoId: 'cnc-03',
    concorrenteId: 'user-concorrente-jocare',
    concorrenteNome: 'Jocare Pavimentações & Logística, Lda',
    concorrenteNuit: '400789123',
    concorrenteEmail: 'concorrente@jocare.demo',
    valorPropostoMZN: 875000000,
    prazoExecucaoMeses: 26,
    dataSubmissao: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    versao: 1,
    hashSHA256: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
    codigoReferencia: 'PROP-MTL-2026-JOC-EN6',
    carimboTemporal: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    selada: false,
    documentos: [],
    historicoVersoes: [],
    admitida: true,
    pontuacaoTecnica: 81.0,
    pontuacaoFinanceira: 85.0,
    pontuacaoFinal: 82.6,
    classificacao: 2,
    recomendadaParaAdjudicacao: false,
    parecerJuri: 'Cumpre integralmente os requisitos do Caderno de Encargos com valor superior.'
  }
];

export const SEED_ATAS_ABERTURA: AtaAbertura[] = [
  {
    id: 'ata-01',
    concursoId: 'cnc-03',
    dataAbertura: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    juriPresentes: ['Eng. Sérgio Macuácua (Presidente do Júri)', 'Dr. Salvador Matsinhe (Vogal)'],
    totalPropostasRecebidas: 2,
    propostasResumo: [
      {
        concorrenteNome: 'CETA - Engenharia e Construção, S.A.',
        concorrenteNuit: '400123456',
        codigoReferencia: 'PROP-MTL-2026-CETA-EN6',
        dataSubmissao: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        hashSHA256: 'c34b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
        valorPropostoMZN: 845000000,
        seloIntegro: true
      },
      {
        concorrenteNome: 'Jocare Pavimentações & Logística, Lda',
        concorrenteNuit: '400789123',
        codigoReferencia: 'PROP-MTL-2026-JOC-EN6',
        dataSubmissao: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        hashSHA256: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
        valorPropostoMZN: 875000000,
        seloIntegro: true
      }
    ],
    observacoesAto: 'Ato público de abertura realizado na plataforma electrónica sem qualquer impugnação ou irregularidade nos selos criptográficos.',
    geradaEm: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const SEED_CONTRATOS: Contrato[] = [
  {
    id: 'ct-01',
    concursoId: 'cnc-04',
    numeroContrato: 'CT-MTL/DNEP/2025/004',
    objecto: 'Empreitada de Reabilitação de Emergência da EN1 (Troço Marracuene a Manhiça, 45 km)',
    adjudicatarioId: 'user-concorrente-ceta',
    adjudicatarioNome: 'CETA - Engenharia e Construção, S.A.',
    adjudicatarioNuit: '400123456',
    valorInicialMZN: 248500000,
    valorAtualizadoMZN: 248500000,
    dataAssinatura: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    prazoMeses: 10,
    dataFimPrevista: new Date(Date.now() + 210 * 24 * 60 * 60 * 1000).toISOString(),
    gestorContratoNome: 'Dra. Maria Helena Mabote',
    fiscalObraNome: 'Eng. Sérgio Macuácua',
    vistoTribunalAdministrativo: 'VISADO',
    numeroProcessoTA: 'Proc. TA-1ª Secção nº 452/2025',
    dataVistoTA: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
    trocoEstradaId: 'troco-01',
    checklistHabilitacao: {
      certidaoQuitacaoFiscal: true,
      certidaoQuitacaoINSS: true,
      garantiaDefinitivaBancaria: true,
      alvaraConstrucaoValido: true,
      certidaoRegistoComercial: true
    },
    estado: 'VIGENTE'
  }
];

export const SEED_MEDICOES: AutoMedicao[] = [
  {
    id: 'med-01',
    contratoId: 'ct-01',
    numeroAuto: 1,
    dataMedicao: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    percentualFisicoPeriodo: 14.5,
    percentualFisicoAcumulado: 14.5,
    valorMedicaoMZN: 36032500,
    observacoes: 'Trabalhos de decapagem, desmatação e regularização da plataforma entre km 32 e km 45.',
    fotoSimuladaDescricao: 'Auto nº 1: Terraplanagem e sub-base concluída com compactação certificada em laboratório.',
    registadoPorNome: 'Eng. Sérgio Macuácua (Fiscal)',
    aprovadoPorFiscal: true
  },
  {
    id: 'med-02',
    contratoId: 'ct-01',
    numeroAuto: 2,
    dataMedicao: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    percentualFisicoPeriodo: 18.0,
    percentualFisicoAcumulado: 32.5,
    valorMedicaoMZN: 44730000,
    observacoes: 'Aplicação de brita graduada tratada com cimento (BGTC) e valetas de drenagem longitudinal.',
    fotoSimuladaDescricao: 'Auto nº 2: Base em BGTC e execução de aquedutos circulares em betão armado.',
    registadoPorNome: 'Eng. Sérgio Macuácua (Fiscal)',
    aprovadoPorFiscal: true
  },
  {
    id: 'med-03',
    contratoId: 'ct-01',
    numeroAuto: 3,
    dataMedicao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    percentualFisicoPeriodo: 15.5,
    percentualFisicoAcumulado: 48.0,
    valorMedicaoMZN: 38517500,
    observacoes: 'Início da colocação do tapete de betão betuminoso a quente (BBQ) nos primeiros 20 km.',
    fotoSimuladaDescricao: 'Auto nº 3: Espalhamento e cilindragem de betão betuminoso com espessura de 50mm.',
    registadoPorNome: 'Eng. Sérgio Macuácua (Fiscal)',
    aprovadoPorFiscal: true
  }
];

export const SEED_PAGAMENTOS: PagamentoContrato[] = [
  {
    id: 'pag-01',
    contratoId: 'ct-01',
    numeroFatura: 'FT-CETA-2025/104',
    tipo: 'ADIANTAMENTO',
    valorPagoMZN: 24850000, // 10% de adiantamento contratual
    dataPagamento: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
    observacoes: 'Adiantamento contratual de 10% caucionado por garantia bancária à primeira solicitação.',
    registadoPor: 'Dra. Maria Helena Mabote'
  },
  {
    id: 'pag-02',
    contratoId: 'ct-01',
    numeroFatura: 'FT-CETA-2025/142',
    tipo: 'MEDICAO',
    valorPagoMZN: 32429250, // Auto 1 deduzido de retenção e amortização de adiantamento
    dataPagamento: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    observacoes: 'Liquidação da factura do Auto de Medição nº 1.',
    registadoPor: 'Dra. Maria Helena Mabote'
  },
  {
    id: 'pag-03',
    contratoId: 'ct-01',
    numeroFatura: 'FT-CETA-2025/189',
    tipo: 'MEDICAO',
    valorPagoMZN: 40257000,
    dataPagamento: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    observacoes: 'Liquidação da factura do Auto de Medição nº 2.',
    registadoPor: 'Dra. Maria Helena Mabote'
  }
];

export const SEED_OCORRENCIAS: OcorrenciaContrato[] = [
  {
    id: 'oco-01',
    contratoId: 'ct-01',
    tipo: 'OCORRENCIA',
    titulo: 'Condições meteorológicas adversas com chuvas torrenciais',
    descricao: 'Interrupção temporária de trabalhos de pavimentação por 4 dias devido à passagem de depressão tropical.',
    dataRegisto: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
    gravidade: 'BAIXA',
    resolvida: true,
    resolucaoDescricao: 'Trabalhos retomados em regime de horário alargado sem impacto no caminho crítico.',
    registadoPor: 'Eng. Sérgio Macuácua'
  },
  {
    id: 'oco-02',
    contratoId: 'ct-01',
    tipo: 'ALERTA_DESVIO',
    titulo: 'Alerta Preventivo: Desvio no ritmo de aplicação de asfalto',
    descricao: 'Atraso pontual na entrega de betume pelo fornecedor local. Recomendada mobilização de cisterna adicional.',
    dataRegisto: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    gravidade: 'MEDIA',
    resolvida: true,
    resolucaoDescricao: 'Empreiteiro mobilizou fornecimento alternativo do Porto de Maputo.',
    registadoPor: 'Eng. Sérgio Macuácua'
  }
];

export const SEED_ADENDAS: AdendaContrato[] = [
  {
    id: 'adenda-01',
    contratoId: 'ct-01',
    numeroAdenda: 1,
    tipo: 'VALOR',
    justificacao: 'Necessidade imprevista de reforço geotécnico de fundação no km 52 junto à travessia da linha férrea.',
    valorAdicionalMZN: 12400000, // Menos de 5% de adenda
    estado: 'PENDENTE',
    propostaPorNome: 'Eng. Sérgio Macuácua (Fiscal)',
    dataProposta: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const SEED_TROCOS_ESTRADA: TrocoEstrada[] = [
  {
    id: 'troco-01',
    codigo: 'EN1',
    designacao: 'EN1: Marracuene a Manhiça (km 32 ao km 77)',
    provincia: 'Maputo Província',
    extensaoKm: 45,
    estado: 'EM_CONSTRUCAO',
    concursoId: 'cnc-04',
    contratoId: 'ct-01',
    empreiteiroNome: 'CETA - Engenharia e Construção, S.A.',
    progressoFisico: 48.0,
    progressoFinanceiro: 39.2,
    coordenadas: [
      [-25.7420, 32.6730],
      [-25.6800, 32.7100],
      [-25.6100, 32.7400],
      [-25.5200, 32.7750],
      [-25.4050, 32.8080]
    ],
    detalhesTecnicos: {
      tipoPavimento: 'BETUMINOSO',
      larguraFaixaMetros: 7.2,
      pontesAssociadas: 3,
      anoInicio: 2025,
      anoPrevisaoConclusao: 2026
    }
  },
  {
    id: 'troco-02',
    codigo: 'EN1',
    designacao: 'EN1: Xai-Xai a Chókwè (km 210 ao km 278)',
    provincia: 'Gaza',
    extensaoKm: 68,
    estado: 'EM_CONCURSO',
    concursoId: 'cnc-01',
    progressoFisico: 0,
    progressoFinanceiro: 0,
    coordenadas: [
      [-25.0450, 33.6420],
      [-24.9100, 33.5100],
      [-24.7800, 33.3400],
      [-24.6400, 33.1800],
      [-24.5280, 33.0110]
    ],
    detalhesTecnicos: {
      tipoPavimento: 'BETUMINOSO',
      larguraFaixaMetros: 7.5,
      pontesAssociadas: 4
    }
  },
  {
    id: 'troco-03',
    codigo: 'EN1',
    designacao: 'EN1: Inchope a Gorongosa',
    provincia: 'Sofala',
    extensaoKm: 72,
    estado: 'PLANEADO',
    progressoFisico: 0,
    progressoFinanceiro: 0,
    coordenadas: [
      [-19.2300, 34.0200],
      [-19.0500, 34.0400],
      [-18.8800, 34.0500],
      [-18.6850, 34.0620]
    ],
    detalhesTecnicos: {
      tipoPavimento: 'BETUMINOSO',
      larguraFaixaMetros: 7.0,
      pontesAssociadas: 2
    }
  },
  {
    id: 'troco-04',
    codigo: 'EN8',
    designacao: 'EN8: Nampula - Meconta - Nacala (Lote 2)',
    provincia: 'Nampula',
    extensaoKm: 42,
    estado: 'EM_CONCURSO',
    concursoId: 'cnc-02',
    progressoFisico: 0,
    progressoFinanceiro: 0,
    coordenadas: [
      [-15.1160, 39.2660],
      [-14.9800, 39.6200],
      [-14.7900, 40.1000],
      [-14.5420, 40.6720]
    ],
    detalhesTecnicos: {
      tipoPavimento: 'BETUMINOSO',
      larguraFaixaMetros: 8.0,
      pontesAssociadas: 5
    }
  },
  {
    id: 'troco-05',
    codigo: 'EN6',
    designacao: 'EN6: Corredor da Beira (Dondo a Machipanda)',
    provincia: 'Sofala',
    extensaoKm: 285,
    estado: 'EM_CONCURSO',
    concursoId: 'cnc-03',
    progressoFisico: 0,
    progressoFinanceiro: 0,
    coordenadas: [
      [-19.8300, 34.8500],
      [-19.6100, 34.7400],
      [-19.1600, 33.4800],
      [-18.9600, 32.7000]
    ],
    detalhesTecnicos: {
      tipoPavimento: 'BETUMINOSO',
      larguraFaixaMetros: 9.0,
      pontesAssociadas: 11
    }
  },
  {
    id: 'troco-06',
    codigo: 'EM100',
    designacao: 'Estrada Circular de Maputo (Nós 1 a 6)',
    provincia: 'Maputo Cidade',
    extensaoKm: 74,
    estado: 'CONCLUIDO',
    concursoId: 'cnc-08',
    empreiteiroNome: 'Vilankulo Construções e Infraestruturas',
    progressoFisico: 100,
    progressoFinanceiro: 100,
    coordenadas: [
      [-25.9200, 32.5500],
      [-25.8600, 32.5800],
      [-25.8400, 32.6500],
      [-25.8900, 32.6900]
    ],
    detalhesTecnicos: {
      tipoPavimento: 'BETUMINOSO',
      larguraFaixaMetros: 14.0,
      pontesAssociadas: 6,
      anoInicio: 2024,
      anoPrevisaoConclusao: 2025
    }
  }
];

export const SEED_ESCLARECIMENTOS: PedidoEsclarecimento[] = [
  {
    id: 'escl-01',
    concursoId: 'cnc-01',
    autorId: 'user-concorrente-ceta',
    autorNome: 'CETA - Engenharia e Construção, S.A.',
    autorNuit: '400123456',
    dataPergunta: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    pergunta: 'Solicita-se esclarecimento sobre se a pedreira de inertes basálticos de Chókwè está disponível para extracção livre ou se os custos de concessão devem ser imputados na proposta financeira.',
    resposta: 'Informa-se todos os concorrentes que a pedreira indicada no Anexo IV possui licença ambiental ativa emitida pelo MTL, cabendo apenas ao adjudicatário suportar as taxas de exploração mineira nos termos da lei.',
    dataResposta: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    respondidoPorNome: 'Eng. Sérgio Macuácua (UGEA)',
    publicado: true
  },
  {
    id: 'escl-02',
    concursoId: 'cnc-01',
    autorId: 'user-concorrente-jocare',
    autorNome: 'Jocare Pavimentações & Logística, Lda',
    autorNuit: '400789123',
    dataPergunta: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    pergunta: 'É admitida a apresentação de alvará de 6ª classe em regime de consórcio caso a empresa líder possua 7ª classe de obras públicas?',
    resposta: 'Sim, nos termos do Artigo 38 do Decreto 79/2022, é admitida a soma de qualificações em consórcio desde que a empresa líder detenha a classe principal exigida no Programa do Concurso.',
    dataResposta: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    respondidoPorNome: 'Eng. Sérgio Macuácua (UGEA)',
    publicado: true
  }
];

export const SEED_RECLAMACOES: ReclamacaoRecurso[] = [
  {
    id: 'rec-01',
    concursoId: 'cnc-03',
    concorrenteId: 'user-concorrente-jocare',
    concorrenteNome: 'Jocare Pavimentações & Logística, Lda',
    concorrenteNuit: '400789123',
    dataSubmissao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tipo: 'RECLAMACAO',
    fundamentacao: 'Reclama-se quanto à ponderação da pontuação técnica no critério de equipamentos de fresagem de pavimento atribuída no relatório preliminar de avaliação.',
    decisao: undefined // Em análise pela autoridade competente
  }
];

export const SEED_DENUNCIAS: DenunciaCidada[] = [
  {
    id: 'den-01',
    data: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    nomeCidadao: 'Albino Cossa',
    emailContato: 'albino.cossa@maputo.mz',
    telefoneContato: '+258 84 987 6543',
    concursoId: 'cnc-04',
    concursoTitulo: 'Reabilitação de Emergência da EN1 (Troço Marracuene a Manhiça, 45 km)',
    tipo: 'SUGESTAO',
    descricao: 'Recomenda-se instalação de passadeira elevada e iluminação solar no cruzamento de Bobole para proteger peões e estudantes da escola secundária adjacente à estrada em obras.',
    estado: 'EM_ANALISE',
    respostaOficial: 'Encaminhado ao Fiscal de Obra para inclusão de sinalização suplementar no próximo auto de medição.'
  }
];

export const SEED_AUDITORIA: RegistoAuditoria[] = [
  {
    id: 'aud-01',
    timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    usuarioId: 'user-tecnico',
    usuarioNome: 'Eng. Sérgio Macuácua',
    perfil: 'TECNICO',
    acao: 'CRIACAO_CONCURSO',
    entidade: 'CONCURSO',
    entidadeId: 'cnc-02',
    detalhes: 'Criação do rascunho de concurso MTL/UGEA/CP-02/2026 (EN8 Nampula - Nacala)'
  },
  {
    id: 'aud-02',
    timestamp: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    usuarioId: 'user-gestao',
    usuarioNome: 'Dra. Maria Helena Mabote',
    perfil: 'GESTAO',
    acao: 'APROVACAO_E_PUBLICACAO',
    entidade: 'CONCURSO',
    entidadeId: 'cnc-02',
    detalhes: 'Aprovação e publicação oficial do concurso MTL/UGEA/CP-02/2026'
  },
  {
    id: 'aud-03',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    usuarioId: 'user-concorrente-ceta',
    usuarioNome: 'CETA - Engenharia e Construção, S.A.',
    perfil: 'CONCORRENTE',
    acao: 'SUBMISSAO_PROPOSTA_SELADA',
    entidade: 'PROPOSTA',
    entidadeId: 'prop-01',
    detalhes: 'Submissão de proposta selada com hash SHA-256: 9f83c12c4f12338248b295b0e0eb859243407b1ec11151b30e3804ec6fb3d690'
  },
  {
    id: 'aud-04',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    usuarioId: 'user-concorrente-jocare',
    usuarioNome: 'Jocare Pavimentações & Logística, Lda',
    perfil: 'CONCORRENTE',
    acao: 'SUBSTITUICAO_PROPOSTA_SELADA',
    entidade: 'PROPOSTA',
    entidadeId: 'prop-02',
    detalhes: 'Substituição (Versão 2) de proposta selada com hash SHA-256 recalculado: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  }
];
