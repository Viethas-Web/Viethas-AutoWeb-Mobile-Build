
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { MaterialModule } from 'src/app/material.module';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeBlankComponent } from './home-blank/home-blank.component';
// import { NgZorroAntModule } from '../ng-zorro-ant.module';
// import { VhautowebObjectsModule, BlockComponentModule } from 'vhobjects-admin';

import { DynamicModule } from 'ng-dynamic-component';
// import { LocalBlockUserPipeModule } from '../pipe/block.pipe';
// import { LocalObjectUserPipeModule } from '../pipe/objects.pipe';
import { HomeComponent } from './home/home.component';
import { BlockComponentModule } from 'vhobjects-user';
import { SelectBranchComponent } from '../components/select-branch/select-branch.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { MatDialogModule } from '@angular/material/dialog';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzMessageModule } from 'ng-zorro-antd/message';
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: ':link_page',
    component: HomeBlankComponent,
    children : [
      {
        path: ':link_object',
        component: HomeBlankComponent,
      },
    ]
  },
  
]


@NgModule({
  declarations: [
    HomeBlankComponent,
    HomeComponent,
    SelectBranchComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    // NgZorroAntModule,
    NzSelectModule,
    NzModalModule,
    FormsModule,
    MatDialogModule,
    ReactiveFormsModule,
    DynamicModule,
    BlockComponentModule,
    NzNotificationModule,
    NzMessageModule
    // VhautowebObjectsModule,
    // LocalBlockUserPipeModule,
    // LocalObjectUserPipeModule
  ],
})
export class HomeModule { }
