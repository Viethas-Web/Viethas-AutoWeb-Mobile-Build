import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgZorroAntModule } from 'src/app/ng-zorro-ant.module';
import { DynamicModule } from 'ng-dynamic-component';
import { TranslateModule } from '@ngx-translate/core';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AdminRoutingModule } from './admin-routing.module';
import { SettingsModule } from './settings/settings.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SitemapComponent } from './sitemap/sitemap.component';
import { CanonicalComponent } from './canonical/canonical.component';
import { AdminConfigModule } from 'vhobjects-admin';
import { SelectLanguageConfigModule } from 'vhobjects-admin';
import { DescriptionByDeviceComponent } from './components/dialog/description-by-device/description-by-device.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { GoogleShoppingModule } from './google-shopping/google-shopping.module';
import { VhCkeditorModalModule } from './components/vh-ckeditor-modal/vh-ckeditor-modal.module';
import { FoldersManagerComponent } from './folders-manager/folders-manager.component';
// import { InvoicesOnlineComponent } from './invoices-online/invoices-online.component';
 

@NgModule({
  declarations: [
    AdminComponent, SitemapComponent, CanonicalComponent, DescriptionByDeviceComponent, FoldersManagerComponent,
    
  ],
  entryComponents: [],
  exports: [],
  imports: [
    CommonModule,
    AdminRoutingModule,
     
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntModule,
    DynamicModule,
   
    TranslateModule,
    ScrollingModule, 
    SelectLanguageConfigModule,
    SettingsModule,
    AdminConfigModule,
    CKEditorModule,
    GoogleShoppingModule,
    VhCkeditorModalModule
 
  ],
  providers: [VhComponent, { provide: MAT_DIALOG_DATA, useValue: {} },
  { provide: MatDialogRef, useValue: {} }],
})
export class AdminModule { }