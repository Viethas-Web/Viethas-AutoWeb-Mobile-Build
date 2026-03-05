import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VhCkeditorModalComponent } from './vh-ckeditor-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgZorroAntModule } from 'vhobjects-service';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule,
    TranslateModule,
    NgZorroAntModule
  ],
  declarations: [VhCkeditorModalComponent]
})
export class VhCkeditorModalModule { }
