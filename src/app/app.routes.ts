import { Routes } from '@angular/router';
import { guestGuard } from '../core/guard/guest.guard';
import { Landing } from './pages/landing/landing';
import { Layout } from './pages/layout/layout';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Home } from './pages/dashboard/home/home';
import { authGuard } from '../core/guard/auth.guard';

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
