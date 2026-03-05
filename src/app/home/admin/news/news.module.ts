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
import { NewsComponent } from './news.component';
import { AddNewsComponent } from './add-news/add-news.component';
import { EditNewsComponent } from './edit-news/edit-news.component';
import { ListImagesModule } from '../components/list-images/list-images.module';
import { ManageLibraryModule } from '../manage-library/manage-library.module';


const routes: Routes = [
  {
    path: '',
    component: NewsComponent
  },
]

@NgModule({
  declarations: [
    NewsComponent,
    AddNewsComponent,
    EditNewsComponent,
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
    ListImagesModule,
    ManageLibraryModule
  ]
})
export class NewsModule { }
