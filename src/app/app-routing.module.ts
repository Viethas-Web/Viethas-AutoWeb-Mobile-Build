import { NgModule } from '@angular/core';
import {  RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  // {
  //   path: 'admin',
  //   loadChildren: () => import('./home/admin/admin.module').then((m) => m.AdminModule),
   
  // },
  // {
  //   path: 'hosting-management/:id_hosting',
  //   loadChildren: () =>
  //     import('./hosting-management/hosting-management.module').then((m) => m.HostingManagementModule),
    
  // },
  {
    path: 'page-not-found',
    loadChildren: () =>
      import('./not-found/not-found.module').then((m) => m.NotFoundModule),
  },
  {
    path: '',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false, scrollPositionRestoration: 'top', onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
