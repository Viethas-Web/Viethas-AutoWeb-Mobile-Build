import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgZorroAntModule } from 'src/app/ng-zorro-ant.module';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationModule } from '../components/pagination/pagination.module';
import { RedirectPageComponent } from './redirect-page.component';

const routes: Routes = [
  {
    path: '',
    component: RedirectPageComponent
  },
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgZorroAntModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    PaginationModule
  ],
  declarations: [RedirectPageComponent]
})
export class RedirectPageModule { }
