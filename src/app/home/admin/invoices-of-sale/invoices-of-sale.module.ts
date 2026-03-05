import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgZorroAntModule } from 'src/app/ng-zorro-ant.module';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationModule } from '../components/pagination/pagination.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { VhSelectModule } from '../components/vh-select/vh-select.module';
import { SelectLanguageConfigModule } from 'vhobjects-admin'; 
import { OtherPaymentSaleComponent } from './other-payment-sale/other-payment-sale.component';
import { EditDetailInvoiceOfSaleComponent } from './edit-detail-invoice-of-sale/edit-detail-invoice-of-sale.component';
import { DetailInvoiceOfSaleComponent } from './detail-invoice-of-sale/detail-invoice-of-sale.component';
import { InvoicesOfSaleComponent } from './invoices-of-sale.component';
import { InvoicesOnlineComponent } from '../invoices-online/invoices-online.component';
import { DetailInvoiceOnlineComponent } from '../invoices-online/detail-invoice/detail-invoice.component';


const routes: Routes = [
  {
    path: '',
    component: InvoicesOfSaleComponent
  },
]

@NgModule({
  declarations: [
    InvoicesOfSaleComponent,
    OtherPaymentSaleComponent,
    EditDetailInvoiceOfSaleComponent,
    DetailInvoiceOfSaleComponent,
    InvoicesOnlineComponent,
    DetailInvoiceOnlineComponent
  ],
  imports: [
    CommonModule,
    NgZorroAntModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    PaginationModule,
    CKEditorModule,
    VhSelectModule,
    SelectLanguageConfigModule
  ]
})
export class InvoicesOfSaleModule { }
