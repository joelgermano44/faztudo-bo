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
import { ProfessionalApplications } from './pages/backoffice/professional-applications/professional-applications';
import { SupportChat } from './pages/backoffice/support-chat/support-chat';
import { Payments } from './pages/backoffice/payments/payments';
import { Advertisements } from './pages/backoffice/advertisements/advertisements';
import { Categories } from './pages/backoffice/categories/categories';
import { Clients } from './pages/backoffice/clients/clients';
import { Addresses } from './pages/backoffice/addresses/addresses';
import { Professionals } from './pages/backoffice/professionals/professionals';
import { Profile } from './pages/backoffice/profile/profile';

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
      {
        path: 'professional-applications',
        component: ProfessionalApplications,
      },
      {
        path: 'admin-support-chat',
        component: SupportChat,
      },
      {
        path: 'payments',
        component: Payments,
      },
      {
        path: 'advertisements',
        component: Advertisements,
      },
      {
        path: 'categories',
        component: Categories,
      },
      {
        path: 'clients-users',
        component: Clients,
      },
      {
        path: 'addresses',
        component: Addresses,
      },
      {
        path: 'professionals-users',
        component: Professionals,
      },
      {
        path: 'profile',
        component: Profile,
      },
    ],
  },
];
