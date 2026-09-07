import { Routes } from '@angular/router';
import { authGuard } from '../core/guard/auth.guard';
import { guestGuard } from '../core/guard/guest.guard';
import { Home } from './pages/backoffice/dashboard/home';
import { Landing } from './pages/landing/landing';
import { Layout } from './pages/layout/layout';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/layout/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        component: Landing,
      },
    ],
  },
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: Home,
      },
    ],
  },
];
