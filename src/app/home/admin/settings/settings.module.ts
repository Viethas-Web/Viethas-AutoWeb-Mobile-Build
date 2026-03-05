import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgZorroAntModule } from 'src/app/ng-zorro-ant.module';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationModule } from '../components/pagination/pagination.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { VhSelectModule } from '../components/vh-select/vh-select.module';
import { SelectLanguageConfigModule } from 'vhobjects-admin'; 
import { SettingsComponent } from './settings.component';
import { SingleImageComponent } from './single-image/single-image.component';
import { CategoryImageComponent } from './category-image/category-image.component';
import { ProductImageComponent } from './product-image/product-image.component';
import { NewsImageComponent } from './news-image/news-image.component';
import { FoodImageComponent } from './food-image/food-image.component';
import { ServiceImageComponent } from './service-image/service-image.component';
import { WebsiteImageComponent } from './website-image/website-image.component';
import { TransferImageToServerComponent } from '../components/dialog/transfer-image-to-server/transfer-image-to-server.component';



@NgModule({
  declarations: [
    SettingsComponent,
    SingleImageComponent,
    CategoryImageComponent,
    ProductImageComponent,
    NewsImageComponent,
    FoodImageComponent,
    ServiceImageComponent,
    WebsiteImageComponent,
    TransferImageToServerComponent
  ],
  imports: [
    CommonModule,
    NgZorroAntModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    IonicModule,
    TranslateModule,
    PaginationModule,
    CKEditorModule,
    VhSelectModule,
    SelectLanguageConfigModule
  ]
})
export class SettingsModule { }
