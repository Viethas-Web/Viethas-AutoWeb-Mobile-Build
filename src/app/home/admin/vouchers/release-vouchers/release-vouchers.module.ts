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
import { ReleaseVouchersComponent } from './release-vouchers.component';
import { DetailVoucherReleaseComponent } from './detail-voucher-release/detail-voucher-release.component';
import { PaginationModule } from '../../components/pagination/pagination.module';
import { VhSelectModule } from '../../components/vh-select/vh-select.module';
import { EditReleaseVoucherComponent } from './edit-release-voucher/edit-release-voucher.component';
import { VoucherCodeComponent } from './voucher-code/voucher-code.component';
import { AddReleaseVoucherComponent } from './add-release-voucher/add-release-voucher.component';


const routes: Routes = [
  {
    path: '',
    component: ReleaseVouchersComponent,
    children: [
      {
        path: 'detail-voucher-release',
        component: DetailVoucherReleaseComponent,
      },
    ]
  },
]

@NgModule({
  declarations: [ 
    ReleaseVouchersComponent,
    DetailVoucherReleaseComponent,
    EditReleaseVoucherComponent,
    VoucherCodeComponent,
    AddReleaseVoucherComponent
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
export class ReleaseVouchersModule { }
