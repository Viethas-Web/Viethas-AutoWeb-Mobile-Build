import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicModule } from '@ionic/angular';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CustomUrlSerializer } from './custom-urlSerializer';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

import { NZ_DATE_LOCALE, NZ_I18N, en_US, vi_VN } from 'ng-zorro-antd/i18n';
import { DatePipe, registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import vi from '@angular/common/locales/vi';
registerLocaleData(en);
registerLocaleData(vi);



import { VhAuth, VhAlgorithm, VhImage, VhQueryAutoWeb, VhBuildAutoWeb, VhDesignAutoWeb, VhOTP } from 'vhautowebdb';

/**Native Plugin */
import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
// import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
// import { InAppPurchase2 } from "@ionic-native/in-app-purchase-2/ngx";
// import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { NzConfig, NZ_CONFIG } from 'ng-zorro-antd/core/config';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
 

const ngZorroConfig: NzConfig = {
  message: { nzTop: 50 },
  // notification: { nzTop: 100 }
};
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VhFB_OTP } from 'vhmongo-new';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { UrlSerializer } from '@angular/router';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzImageModule } from 'ng-zorro-antd/image';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [

    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    IonicModule.forRoot({ swipeBackEnabled: false }),
    TranslateModule.forRoot({
      loader: { provide: TranslateLoader, useFactory: (createTranslateLoader), deps: [HttpClient] }
    }),
    NgbModule,
    FormsModule,
    NzNotificationModule,
    NzMessageModule,
    MatDialogModule,
    ReactiveFormsModule,
    NzModalModule,NzImageModule
  ],
  providers: [
    Camera,
    WebView,
    ImagePicker,
    File,
    SocialSharing,
    // BarcodeScanner,
    DatePipe,
    // InAppPurchase2,
    // BluetoothSerial,
    // FunctionService,
    VhAlgorithm,
    VhAuth,
    // VhQuery,
    VhImage,
    // VhForFirstTime,
    VhQueryAutoWeb,
    VhOTP,
    VhFB_OTP,
    VhBuildAutoWeb,
    VhDesignAutoWeb,
    { provide: NZ_I18N, useValue: en_US },
    { provide: UrlSerializer, useClass: CustomUrlSerializer },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
