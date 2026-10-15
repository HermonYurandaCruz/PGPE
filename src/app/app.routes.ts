import { Routes } from '@angular/router';
import { AppLayout } from './core/layout/app-layout.component';
import { roleGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/overview/overview.component').then(m => m.OverviewComponent),
        title: 'Visão Geral • Contratus MTL'
      },
      {
        path: 'concursos',
        loadComponent: () =>
          import('./features/concursos/concursos-list.component').then(m => m.ConcursosListComponent),
        title: 'Concursos Electrónicos • MTL'
      },
      {
        path: 'concursos/novo',
        loadComponent: () =>
          import('./features/concursos/concurso-form.component').then(m => m.ConcursoFormComponent),
        canActivate: [roleGuard(['TECNICO', 'ADMIN'])],
        title: 'Novo Concurso • UGEA MTL'
      },
      {
        path: 'concursos/:id',
        loadComponent: () =>
          import('./features/concursos/concurso-detail.component').then(m => m.ConcursoDetailComponent),
        title: 'Detalhe do Concurso • MTL'
      },
      {
        path: 'concorrente/meus-concursos',
        loadComponent: () =>
          import('./features/concorrente/meus-concursos.component').then(m => m.MeusConcursosComponent),
        title: 'Os Meus Concursos • Portal do Concorrente'
      },
      {
        path: 'concorrente/submeter/:concursoId',
        loadComponent: () =>
          import('./features/concorrente/proposta-submissao.component').then(m => m.PropostaSubmissaoComponent),
        title: 'Submeter Proposta Selada • MTL'
      },
      {
        path: 'concorrente/comprovativo/:propostaId',
        loadComponent: () =>
          import('./features/concorrente/comprovativo-submissao.component').then(m => m.ComprovativoSubmissaoComponent),
        title: 'Comprovativo de Submissão SHA-256 • MTL'
      },
      {
        path: 'contratos',
        loadComponent: () =>
          import('./features/contratos/contratos-list.component').then(m => m.ContratosListComponent),
        title: 'Contratos e Obras • MTL'
      },
      {
        path: 'contratos/:id',
        loadComponent: () =>
          import('./features/contratos/contrato-detail.component').then(m => m.ContratoDetailComponent),
        title: 'Execução e Fiscalização Contratual • MTL'
      },
      {
        path: 'mapa',
        loadComponent: () =>
          import('./features/mapa/mapa-sig.component').then(m => m.MapaSigComponent),
        title: 'Mapa SIG de Estradas • MTL'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard-executivo.component').then(m => m.DashboardExecutivoComponent),
        title: 'Dashboard Executivo • MTL'
      },
      {
        path: 'publico',
        loadComponent: () =>
          import('./features/public/portal-publico.component').then(m => m.PortalPublicoComponent),
        title: 'Portal de Transparência Pública • MTL'
      },
      {
        path: 'admin/utilizadores',
        loadComponent: () =>
          import('./features/admin/utilizadores.component').then(m => m.AdminUtilizadoresComponent),
        canActivate: [roleGuard(['ADMIN'])],
        title: 'Gestão de Utilizadores • MTL'
      },
      {
        path: 'admin/auditoria',
        loadComponent: () =>
          import('./features/admin/auditoria.component').then(m => m.AdminAuditoriaComponent),
        canActivate: [roleGuard(['ADMIN', 'GESTAO'])],
        title: 'Auditoria Oficial • MTL'
      },
      {
        path: 'admin/modo-demo',
        loadComponent: () =>
          import('./features/admin/modo-demo.component').then(m => m.AdminModoDemoComponent),
        title: 'Modo Demonstração • MTL'
      },
      {
        path: 'acesso-negado',
        loadComponent: () =>
          import('./features/shared/acesso-negado.component').then(m => m.AcessoNegadoComponent),
        title: 'Acesso Negado 403 • MTL'
      }
    ]
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.AuthLoginComponent),
    title: 'Iniciar Sessão • Contratus MTL'
  },
  {
    path: 'auth/registo',
    loadComponent: () =>
      import('./features/auth/registo.component').then(m => m.AuthRegistoComponent),
    title: 'Registo de Concorrente • Contratus MTL'
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/shared/nao-encontrado.component').then(m => m.NaoEncontradoComponent),
    title: 'Página Não Encontrada 404 • Contratus MTL'
  }
];
