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
import { ManageLibraryComponent } from './manage-library.component';
import { ManageLibraryAddFolderComponent } from './manage-library-add-folder/manage-library-add-folder.component';
import { ManageLibraryEditFolderComponent } from './manage-library-edit-folder/manage-library-edit-folder.component';



@NgModule({
  declarations: [
    ManageLibraryComponent,
    ManageLibraryAddFolderComponent,
    ManageLibraryEditFolderComponent
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
export class ManageLibraryModule { }
