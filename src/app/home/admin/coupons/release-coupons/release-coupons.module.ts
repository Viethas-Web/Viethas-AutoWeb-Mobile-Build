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
import { ReleaseCouponsComponent } from './release-coupons.component';
import { ReleaseComponent } from './release/release.component';
import { EditReleaseComponent } from './edit-release/edit-release.component';
import { DetailCouponComponent } from './detail-coupon/detail-coupon.component';
import { AddReleaseComponent } from './add-release/add-release.component';
import { PaginationModule } from '../../components/pagination/pagination.module';
import { VhSelectModule } from '../../components/vh-select/vh-select.module';


const routes: Routes = [
  {
    path: '',
    component: ReleaseCouponsComponent,
    children: [
      {
        path: 'detail-coupon',
        component: DetailCouponComponent,

      },
      {
        path: 'detail-coupon/release',
        component: ReleaseComponent,

      },
    ]
  },
]

@NgModule({
  declarations: [  
    ReleaseCouponsComponent,
    ReleaseComponent,
    EditReleaseComponent,
    DetailCouponComponent,
    AddReleaseComponent
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
export class ReleaseCouponsModule { }
