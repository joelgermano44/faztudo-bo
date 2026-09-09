import { Routes } from '@angular/router';
import { authGuard } from '../core/guard/auth.guard';
import { guestGuard } from '../core/guard/guest.guard';
import { Landing } from './pages/landing/landing';
import { Layout } from './pages/layout/layout';
import { Login } from './pages/login/login';
import { BackOffice } from './pages/layout/backoffice/backoffice';
import { Dashboard } from './pages/backoffice/dashboard/dashboard';
import { Orders } from './pages/backoffice/orders/orders';
import { OrderDetail } from './pages/backoffice/orders/order-detail/order-detail';
import { Administrators } from './pages/backoffice/administrators/administrators';
import { Notifications } from './pages/backoffice/notifications/notifications';
import { Services } from './pages/backoffice/services/services';

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
    component: BackOffice,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: Dashboard,
      },
      {
        path: 'orders',
        component: Orders,
      },
      {
        path: 'orders/:id',
        component: OrderDetail,
      },
      {
        path: 'administrators',
        component: Administrators,
      },
      {
        path: 'notifications',
        component: Notifications,
      },
      {
        path: 'services',
        component: Services,
      },
    ],
  },
];
