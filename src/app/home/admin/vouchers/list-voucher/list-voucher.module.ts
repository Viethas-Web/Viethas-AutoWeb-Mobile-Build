import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgZorroAntModule } from 'src/app/ng-zorro-ant.module';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
// import { PaginationModule } from '../components/pagination/pagination.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
// import { VhSelectModule } from '../components/vh-select/vh-select.module';
import { SelectLanguageConfigModule } from 'vhobjects-admin'; 
import { AddVoucherComponent } from './add-voucher/add-voucher.component';
import { DetailVoucherComponent } from './detail-voucher/detail-voucher.component';
import { ChooseProductVoucherComponent } from './choose-product-voucher/choose-product-voucher.component';
import { ListVoucherComponent } from './list-voucher.component';
import { PaginationModule } from '../../components/pagination/pagination.module';
import { VhSelectModule } from '../../components/vh-select/vh-select.module';


const routes: Routes = [
  {
    path: '',
    component: ListVoucherComponent,
    children: [
      {
        path: 'detail-voucher',
        component: DetailVoucherComponent,

      },
      {
        path: 'add-voucher',
        component: AddVoucherComponent,

      },
    ]
  },
]

@NgModule({
  declarations: [ 
    ListVoucherComponent,
    AddVoucherComponent,
    DetailVoucherComponent,
    ChooseProductVoucherComponent,
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
export class ListVoucherModule { }
