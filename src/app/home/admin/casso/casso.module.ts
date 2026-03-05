import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgZorroAntModule } from 'src/app/ng-zorro-ant.module';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationModule } from '../components/pagination/pagination.module';
import { CassoComponent } from './casso.component';
import { EditCassoComponent } from './edit-casso/edit-casso.component';
import { AddCassoComponent } from './add-casso/add-casso.component';
import { VhSelectModule } from '../components/vh-select/vh-select.module';


const routes: Routes = [
  {
    path: '',
    component: CassoComponent
  },
]

@NgModule({
  declarations: [
    CassoComponent,
    EditCassoComponent,
    AddCassoComponent,
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
    VhSelectModule,
    
  ]
})
export class CassoModule { }
