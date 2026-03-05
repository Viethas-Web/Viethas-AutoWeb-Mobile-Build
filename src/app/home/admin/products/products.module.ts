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
import { ProductsComponent } from './products.component';
import { AddProductComponent } from './add-product/add-product.component';
import { EditProductComponent } from './edit-product/edit-product.component';
import { AddSubproductComponent } from './add-subproduct/add-subproduct.component';
import { AddProductLotsComponent } from './add-product-lots/add-product-lots.component';
import { EditProductLotsComponent } from './edit-product-lots/edit-product-lots.component';
import { EditSubproductComponent } from './edit-subproduct/edit-subproduct.component';
import { UnitsComponent } from './units/units.component';
import { AddUnitsComponent } from './units/add-units/add-units.component';
import { EditUnitsComponent } from './units/edit-units/edit-units.component';
import { ListImagesModule } from '../components/list-images/list-images.module';


const routes: Routes = [
  {
    path: '',
    component: ProductsComponent
  },
]

@NgModule({
  declarations: [
      AddProductComponent,
      EditProductComponent,
      AddSubproductComponent,
      AddProductLotsComponent,
      EditProductLotsComponent,
      EditSubproductComponent,
      ProductsComponent,
      UnitsComponent,
      AddUnitsComponent,
      EditUnitsComponent
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
    SelectLanguageConfigModule,
    ListImagesModule
  ]
})
export class ProductsModule { }
