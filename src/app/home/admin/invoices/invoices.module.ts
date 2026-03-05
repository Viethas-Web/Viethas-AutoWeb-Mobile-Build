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
import { InvoicesComponent } from './invoices.component';
import { DetailInvoiceComponent } from './detail-invoice/detail-invoice.component';
import { EditDetailInvoiceComponent } from './edit-detail-invoice/edit-detail-invoice.component';
import { OtherPaymentComponent } from './other-payment/other-payment.component';


const routes: Routes = [
  {
    path: '',
    component: InvoicesComponent
  },
]

@NgModule({
  declarations: [
    InvoicesComponent,
    DetailInvoiceComponent,
    EditDetailInvoiceComponent,
    OtherPaymentComponent
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
export class InvoicesModule { }
