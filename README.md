# Contratus MTL — Plataforma Integrada de Gestão de Contratos, Concursos Electrónicos e Fiscalização

Plataforma oficial de **e-Procurement e Fiscalização Rodoviária** do **Ministério dos Transportes e Logística (MTL) de Moçambique**, em estrita conformidade com o **Decreto n.º 79/2022** (Regulamento de Contratação de Empreitada de Obras Públicas, Fornecimento de Bens e Prestação de Serviços ao Estado) e **Diploma Ministerial n.º 46/2024**.

---

## 1. Demonstração de Ponta a Ponta (Fluxo Operacional)

A aplicação vem pré-carregada com dados realistas de Moçambique e permite percorrer todo o ciclo de vida da contratação pública:

1. **Instrução do Concurso (Técnico / UGEA)**:
   - Entre como **Técnico** (`tecnico@mtl.demo`).
   - Aceda a **Novo Concurso**. Seleccione uma das 8 modalidades legais do Decreto 79/2022. O sistema valida automaticamente o prazo mínimo legal (ex.: 21 dias para Concurso Público).
   - Grave o concurso no estado `RASCUNHO` e clique em **Submeter para Aprovação (UGEA)**.
2. **Aprovação e Publicação (Gestão / Autoridade Competente)**:
   - Alterne para **Gestão** (`gestao@mtl.demo`) através do menu rápido da barra lateral.
   - Abra o concurso no estado `PENDENTE_APROVACAO` e clique em **Aprovar e Publicar Concurso**. O concurso é publicado com despacho homologatório e contagem regressiva em tempo real.
3. **Submissão de Proposta Selada (Concorrente)**:
   - Alterne para **Concorrente** (`concorrente@ceta.demo`).
   - Aceda ao concurso e clique em **Submeter Proposta Selada**. Preencha o valor e anexe os documentos.
   - O sistema calcula um **hash SHA-256 autêntico** (Web Crypto API) sobre os dados e emite um **Comprovativo Oficial Imprimível** com carimbo temporal e selo de inviolabilidade.
   - Enquanto o prazo estiver aberto, o concorrente pode **substituir a proposta**, mantendo o histórico de versões.
4. **Sigilo Absoluto e Encerramento do Prazo (Admin)**:
   - Alterne para **Admin** (`admin@mtl.demo`). Verifique no registo de auditoria que a submissão foi registada, mas os valores permanecem confidenciais.
   - Aceda ao **Modo Demonstração** e clique em **Simular Fim do Prazo** para o concurso.
5. **Ato Solene de Abertura e Avaliação (Júri / Técnico)**:
   - Alterne para **Técnico** (Júri).
   - No concurso agora com prazo expirado, clique em **Realizar Ato de Abertura (Júri)**. As propostas são deslacradas e é gerada a **Ata Oficial de Abertura**.
   - O concurso passa a `EM_AVALIACAO`.
6. **Homologação e Celebração de Contrato (Gestão)**:
   - Alterne para **Gestão**. Clique em **Homologar e Adjudicar**, inserindo o despacho ministerial.
   - É gerado automaticamente o **Contrato formal de Obras Públicas**.
7. **Execução e Fiscalização Rodoviária (Fiscal / Técnico & Gestão)**:
   - Aceda a **Contratos e Obras** e abra o contrato vigente.
   - Actualize o **Visto do Tribunal Administrativo** (Pendente / Visado / Recusado).
   - Registe **Autos de Medição** com percentual físico e fotos simuladas.
   - Registe **Pagamentos e Liquidações** de faturas.
   - O sistema emite alertas automáticos em caso de desvio entre avanço físico e financeiro.
   - O progresso físico e financeiro é sincronizado em tempo real no **Mapa SIG** (EN1, EN6, EN8) e no **Dashboard Executivo**.
8. **Recurso / Reclamação e Participação Cívica**:
   - Concorrentes podem submeter reclamações formais no prazo legal.
   - Cidadãos podem submeter sugestões e denúncias no **Portal Público de Transparência**.

---

## 2. Perfis e Controlo de Acesso (RBAC)

| Perfil | Identificador Demo | Atribuições |
| :--- | :--- | :--- |
| **Administrador** | `admin@mtl.demo` | Gestão de utilizadores, auditoria global, modo de demonstração e parametrização. *Nunca vê propostas seladas antes da abertura*. |
| **Gestão** | `gestao@mtl.demo` | Directora Nacional / Autoridade Competente: autorização e publicação, designação do júri, despacho de adjudicação, visto TA e aprovação de adendas. |
| **Técnico (UGEA / Júri / Fiscal)** | `tecnico@mtl.demo` | Elaboração de rascunhos, verificação de prazos legais, ato público de abertura, avaliação de propostas e autos de medição em obra. |
| **Concorrente** | `concorrente@ceta.demo` | Registo da empresa (NUIT), descarregamento de peças, pedidos de esclarecimento, submissão/substituição de propostas com hash SHA-256 e emissão de comprovativo. |
| **Público** | Acesso livre | Portal de transparência, consulta de adjudicações, mapa rodoviário e formulário cívico de denúncias. |

---

## 3. Arquitectura de Software

- **Frontend**: Angular 21 (Zoneless, Signals, Standalone Components, novo Control Flow `@if`/`@for`).
- **Design System**: *Contratus Design System* (paleta monocromática elegante com cinzas quentes `#E9E7E2`/`#F7F7F6`, acentos semânticos pontuais, raios 8px/10px/16px, tipografia Inter com `tabular-nums`).
- **Camada de Dados Desacoplada**:
  - Repositórios com interfaces tipadas (`IConcursoRepository`, `IPropostaRepository`, `IContratoRepository`, etc.) injectados via `InjectionToken`.
  - Implementação `LocalStorageRepository` com versionamento de esquema, tratamento de excepções e seed data completo.
- **Criptografia Real**: Selagem via Web Crypto API (`crypto.subtle.digest('SHA-256')`).
- **Geoespacial**: Leaflet + OpenStreetMap para visualização de troços viários em Moçambique.
- **Gráficos**: SVG puro e CSS sem dependências pesadas de bibliotecas de terceiros.

---

## 4. Decisões de Design Assumidas

1. **Design System "Contratus"**:
   - Superfície em moldura de aplicação centrada num fundo exterior cinzento-quente (`#E9E7E2`).
   - Tipografia limpa, hierarquia por peso e contraste de cinzas (preto `#1A1A1A` para acções primárias e destaques).
   - Cor restrita a fins semânticos (estados de concursos, riscos, progresso).
2. **Moeda e Formatação**:
   - Metical Moçambicano (`MZN`), formato `MZN 1.250.000,00` com `font-feature-settings: 'tnum'`.
   - Datas em fuso horário de Maputo (`Africa/Maputo`).

---

## 5. Limitações do MVP e Roteiro para Backend Real

- **Encriptação de Propostas**: No MVP, é gerado um hash SHA-256 autêntico e a proposta é mascarada na interface. Num backend de produção com PostgreSQL, a proposta é encriptada com chave pública assimétrica do Júri, e a chave privada só é desbloqueada por quorum do Júri no momento do ato de abertura.
- **Ligação a Backend REST/PostgreSQL**: Graças aos `InjectionToken`, basta criar classes que implementem `IConcursoRepository` com `HttpClient` e alterar o provider em `app.config.ts`, sem modificar nenhum componente.
- **Interoperabilidade Futura**: Interfaces prontas para integração com o Cadastro Único (UFSA), Tribunal Administrativo (e-Visto) e Sistema de Administração Financeira do Estado (e-SISTAFE).
