import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'contratos', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'contratos',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/contracts/contract-list/contract-list.component').then(
                m => m.ContractListComponent,
              ),
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import('./features/contracts/new-contract/new-contract.component').then(
                m => m.NewContractComponent,
              ),
          },
          {
            path: ':id/cerrar',
            loadComponent: () =>
              import('./features/contracts/close-contract/close-contract.component').then(
                m => m.CloseContractComponent,
              ),
          },
        ],
      },
      // Placeholders para módulos futuros
      { path: 'vehiculos',  redirectTo: 'dashboard' },
      { path: 'clientes',   redirectTo: 'dashboard' },
      { path: 'tarifas',    redirectTo: 'dashboard' },
      { path: 'coberturas', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: '' },
];
