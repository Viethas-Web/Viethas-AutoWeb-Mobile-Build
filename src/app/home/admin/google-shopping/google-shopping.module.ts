import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldsGoogleShoppingComponent } from './fields-google-shopping/fields-google-shopping.component';
import { StructureProductComponent } from './fields-google-shopping/structure-product/structure-product.component';
import { MaterialModule, NgZorroAntModule } from 'vhobjects-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductsGoogleShoppingComponent } from './products-google-shopping/products-google-shopping.component';
import { TranslateModule } from '@ngx-translate/core';
import { ListProductsComponent } from './products-google-shopping/list-products/list-products.component';
import { PaginationModule } from '../components/pagination/pagination.module';
import { VhSelectModule } from '../components/vh-select/vh-select.module';
import { DetailProductComponent } from './products-google-shopping/detail-product/detail-product.component';
import { ListScriptsComponent } from './list-scripts/list-scripts.component';
import { AddEmbeddedScriptComponent } from './list-scripts/add-embedded-script/add-embedded-script.component';
import { EditEmbeddedScriptComponent } from './list-scripts/edit-embedded-script/edit-embedded-script.component';
import { FieldsEmbeddedScriptComponent } from './fields-embedded-script/fields-embedded-script.component';
import { StructureScriptComponent } from './fields-embedded-script/structure-script/structure-script.component';
import { ListScriptsObjectComponent } from './list-scripts-object/list-scripts-object.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    NgZorroAntModule,
    FormsModule,
    TranslateModule,
    PaginationModule,
    VhSelectModule,
    ReactiveFormsModule

  ],
  declarations: [
    FieldsGoogleShoppingComponent,
    StructureProductComponent,
    ProductsGoogleShoppingComponent,
    ListProductsComponent,
    DetailProductComponent,
    ListScriptsComponent,
    ListScriptsObjectComponent,
    AddEmbeddedScriptComponent,
    EditEmbeddedScriptComponent,
    FieldsEmbeddedScriptComponent,
    StructureScriptComponent
  ]
})
export class GoogleShoppingModule { }
