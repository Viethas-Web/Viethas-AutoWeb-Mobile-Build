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
import { AddWebsiteAppComponent } from './add-websites-apps/add-websites-apps.component';
import { EditWebsiteAppComponent } from './edit-websites-apps/edit-websites-apps.component';
import { WebAppContactComponent } from './websites-apps-contact/websites-apps-contact.component';
import { WebsitesAppsComponent } from './websites-apps.component';
import { ListImagesModule } from '../components/list-images/list-images.module';


const routes: Routes = [
  {
    path: '',
    component: WebsitesAppsComponent
  },
]

@NgModule({
  declarations: [ 
    WebsitesAppsComponent,
    AddWebsiteAppComponent,
    EditWebsiteAppComponent,
    WebAppContactComponent
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
export class WebsitesAppModule { }
