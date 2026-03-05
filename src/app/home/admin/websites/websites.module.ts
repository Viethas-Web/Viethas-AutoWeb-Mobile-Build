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
import { WebsitesComponent } from './websites.component';
import { AddWebsiteComponent } from './add-website/add-website.component';
import { EditWebsiteComponent } from './edit-website/edit-website.component';
import { WebContactComponent } from './website-contact/website-contact.component';
import { ListImagesModule } from '../components/list-images/list-images.module';
import { WebInvoicesComponent } from './web-invoices/web-invoices.component';
import { DetailInvoiceWebComponent } from './web-invoices/detail-invoice-web/detail-invoice-web.component';
import { HostingRenewalsComponent } from './hosting-renewals/hosting-renewals.component';
import { PackageUnitsComponent } from './hosting-renewals/package-units/package-units.component';
import { AddPackageUnitsComponent } from './hosting-renewals/package-units/add-package-units/add-package-units.component';
import { EditPackageUnitsComponent } from './hosting-renewals/package-units/edit-package-units/edit-package-units.component';
import { EditHostingRenewalPackageComponent } from './hosting-renewals/edit-hosting-renewal-package/edit-hosting-renewal-package.component';
import { AddHostingRenewalPackageComponent } from './hosting-renewals/add-hosting-renewal-package/add-hosting-renewal-package.component';


const routes: Routes = [
  {
    path: '',
    component: WebsitesComponent,
    children: [
      {
        path: 'websites-contact',
        component: WebContactComponent,
      }
    ]
  },
]

@NgModule({
  declarations: [
    WebsitesComponent,
    AddWebsiteComponent,
    EditWebsiteComponent,
    WebContactComponent,
    WebInvoicesComponent,
    DetailInvoiceWebComponent,
    HostingRenewalsComponent,
    PackageUnitsComponent,
    AddPackageUnitsComponent,
    EditPackageUnitsComponent,
    EditHostingRenewalPackageComponent,
    AddHostingRenewalPackageComponent
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
export class WebsitesModule { }
