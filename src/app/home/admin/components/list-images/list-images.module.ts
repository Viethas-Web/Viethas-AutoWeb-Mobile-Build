import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgZorroAntModule } from 'src/app/ng-zorro-ant.module';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ListImagesComponent } from './list-images.component';
import { MultipleUrlUploaderModule } from '../multiple-url-uploader/multiple-url-uploader.module';



@NgModule({
  declarations: [
    ListImagesComponent
  ],
  imports: [
    CommonModule,
    NgZorroAntModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    IonicModule,
    TranslateModule,
    MultipleUrlUploaderModule
  ],
  exports: [
    ListImagesComponent
  ],
})
export class ListImagesModule { }
