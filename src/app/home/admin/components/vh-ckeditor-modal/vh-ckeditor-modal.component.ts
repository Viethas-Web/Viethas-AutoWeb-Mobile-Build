import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VhImage } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'app-vh-ckeditor-modal',
  templateUrl: './vh-ckeditor-modal.component.html',
  styleUrls: ['./vh-ckeditor-modal.component.scss']
})
export class VhCkeditorModalComponent implements OnInit {
  public EDITOR = DecoupledEditor;
  constructor(
    public functionService: FunctionService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public vhImage: VhImage,
    public dialogRef: MatDialogRef<VhCkeditorModalComponent>,
  ) { }

  ngOnInit() {
  }
  

  getFormControl(controlName: string): FormControl {
    return this.data.formData.get(controlName) as FormControl;
  }

  public onReady(editor: any) {    
    editor.ui
      .getEditableElement()
      .parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
      );
    editor.plugins.get('FileRepository').createUploadAdapter = (
      loader: any
    )=> {      
      return  this.vhImage.MyUploadImageAdapter(loader, 'images/database/' + this.data.type)
    };
  }

  close() {
    this.dialogRef.close();
  }
}
