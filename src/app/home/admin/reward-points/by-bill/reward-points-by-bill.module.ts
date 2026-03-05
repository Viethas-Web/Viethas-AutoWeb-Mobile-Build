import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgZorroAntModule } from 'src/app/ng-zorro-ant.module';
import { MaterialModule } from 'src/app/material.module';
import { ColorPickerModule } from 'ngx-color-picker';
import { VhStringPercentPipeModule } from 'vhobjects-user';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
// import { PaginationModule } from '../components/pagination/pagination.module';
import { ByBillComponent } from './by-bill.component';
import { AddByBillComponent } from './add/add.component';
import { EditByBillComponent } from './edit/edit.component';
import { PaginationModule } from '../../components/pagination/pagination.module';

const routes: Routes = [
  {
    path: '',
    component: ByBillComponent,
    children: [
      {
        path: 'add',
        component: AddByBillComponent,
      },
      {
        path: 'edit',
        component: EditByBillComponent,
      }
    ]
  },
]

@NgModule({
    declarations: [
        ByBillComponent,AddByBillComponent,EditByBillComponent,
    ],
    imports: [
        CommonModule,
        MaterialModule,
        NgZorroAntModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        ColorPickerModule,
        VhStringPercentPipeModule,
        TranslateModule,
        PaginationModule,
        IonicModule,
       
    ],
    exports: []
})
export class RewardPointByBillModule { }