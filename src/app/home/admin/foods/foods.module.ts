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
import { FoodsComponent } from './foods.component';
import { ChooseToppingComponent } from './choose-topping/choose-topping.component';
import { EditFoodComponent } from './edit-food/edit-food.component';
import { AddSubFoodComponent } from './add-sub-food/add-sub-food.component';
import { AddPropertyFoodComponent } from './add-property-food/add-property-food.component';
import { AddGroupPropertyFoodComponent } from './add-group-property-food/add-group-property-food.component';
import { AddFoodComponent } from './add-food/add-food.component';
import { EditSubFoodComponent } from './edit-sub-food/edit-sub-food.component';
import { EditPropertyFoodComponent } from './edit-property-food/edit-property-food.component';
import { EditGroupPropertyFoodComponent } from './edit-group-property-food/edit-group-property-food.component';
import { ListImagesModule } from '../components/list-images/list-images.module';


const routes: Routes = [
  {
    path: '',
    component: FoodsComponent
  },
]

@NgModule({
  declarations: [
    FoodsComponent,
    AddSubFoodComponent,
    AddPropertyFoodComponent,
    AddGroupPropertyFoodComponent,
    AddFoodComponent,
    ChooseToppingComponent,
    EditFoodComponent,
    EditSubFoodComponent,
    EditPropertyFoodComponent,
    EditGroupPropertyFoodComponent
      
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
export class FoodsModule { }
