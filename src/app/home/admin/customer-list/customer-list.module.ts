import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgZorroAntModule } from 'src/app/ng-zorro-ant.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AddCustomerComponent } from './add-customer/add-customer.component';
import { DetailCustomerComponent } from './detail-customer/detail-customer.component';
import { CreateDataCustomersComponent } from './create-data-customers/create-data-customers.component';
import { TranslateModule } from '@ngx-translate/core';
import { CustomerListComponent } from './customer-list.component';
import { MaterialModule } from 'src/app/material.module';
import { EditCustomerComponent } from './edit-customer/edit-customer.component';
import { PaginationModule } from '../components/pagination/pagination.module';
const routes: Routes = [
  {
    path: '',
    component: CustomerListComponent,
    children: [
      {
        path: 'add',
        component: AddCustomerComponent
      },
      {
        path: 'detail',
        component: DetailCustomerComponent
      },
      {
        path: 'create-data',
        component: CreateDataCustomersComponent
      }
    ]
  }
]

@NgModule({
  declarations: [
    CustomerListComponent,
    AddCustomerComponent,
    DetailCustomerComponent,
    EditCustomerComponent,
    CreateDataCustomersComponent,
  ],
  imports: [
    CommonModule,
    NgZorroAntModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    PaginationModule
  ],
  entryComponents :[
    AddCustomerComponent,
    EditCustomerComponent,
    DetailCustomerComponent,
    CreateDataCustomersComponent
  ]
})
export class CustomerModule { }
