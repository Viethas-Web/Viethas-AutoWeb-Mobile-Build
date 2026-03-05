import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HostingManagementComponent } from './hosting-management.component';
import { RouterModule, Routes } from '@angular/router';
import { NgZorroAntModule } from '../ng-zorro-ant.module';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HostingRenewalComponent } from './hosting-renewal/hosting-renewal.component';
import { AtwQrBankingModal } from './hosting-renewal/qr-banking-modal/qr-banking-modal.component';
import { HostingDashboardComponent } from './hosting-dashboard/hosting-dashboard.component';
import { DomainManagementComponent } from './domain-management/domain-management.component';
import { PaymentWebsiteComponent } from './payment-website/payment-website.component';
import { HistoryRenewalComponent } from './history-renewal/history-renewal.component';
import { DetailInvoiceWebComponent } from './history-renewal/detail-invoice-web/detail-invoice-web.component';


const routes: Routes = [
  {
    path: '',
    component: HostingManagementComponent,
    children: [
      {
        path: '',
        component: HostingDashboardComponent 
      },
      {
        path: 'hosting-renewal',
        component: HostingRenewalComponent
      },
      {
        path: 'history-renewal',
        component: HistoryRenewalComponent
      },
      {
        path: 'payment-website',
        component: PaymentWebsiteComponent
      },
      {
        path: 'domain-management',
        component: DomainManagementComponent
      },
    ]
  },
]
@NgModule({
  declarations: [
    PaymentWebsiteComponent,
    AtwQrBankingModal,
    HostingManagementComponent,
    HostingRenewalComponent,
    HistoryRenewalComponent,
    HostingDashboardComponent,
    DomainManagementComponent,
    DetailInvoiceWebComponent
  ],
  imports: [
    CommonModule,
    NgZorroAntModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslateModule
  ]
})
export class HostingManagementModule { }
