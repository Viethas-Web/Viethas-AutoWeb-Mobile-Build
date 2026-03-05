import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { VhImage } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-description-by-device',
  templateUrl: './description-by-device.component.html',
  styleUrls: ['./description-by-device.component.scss']
})
export class DescriptionByDeviceComponent implements OnInit {
  public EDITOR = DecoupledEditor;
  selectedDeviceIndex: number = 0;
  selectedTabIndex: number = 0;
  device: string = 'desktop';
  devices = [
    {
      name: 'Máy tính',
      value: 'desktop'
    },
    {
      name: 'Tablet ngang',
      value: 'tablet_landscape'
    },
    {
      name: 'Tablet dọc',
      value: 'tablet_portrait'
    },
    {
      name: 'Mobile ngang',
      value: 'mobile_landscape'
    },
    {
      name: 'Mobile dọc',
      value: 'mobile_portrait'
    }
  ]
  constructor(
    public functionService: FunctionService,    
    @Inject(MAT_DIALOG_DATA) public data: any,
    public vhImage: VhImage,    
    public dialogRef: MatDialogRef<DescriptionByDeviceComponent>,
  ) { }
  ngOnInit() {
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
      return  this.vhImage.MyUploadImageAdapter(loader, 'images/database/categories')
    };
  }

  getFormControl(item: any): FormControl { 
    return this.data.formData.get(this.device+ '_' + item.field+'_' + this.functionService.languageTempCode) as FormControl;
  }

  /**
   * Khi thay đổi tab Thiết bị được chọn.
   * Nếu có thay đổi mà chưa lưu thì lưu luôn
   * @param event 
   */
  changeTabs(event: any) {
    this.selectedDeviceIndex = event.index;
    this.device = this.devices[this.selectedDeviceIndex].value;
    this.selectedTabIndex = 0;
  }

  updateData(item: any) {
    const deviceKey = this.device + '_' + item.field + '_' + this.functionService.languageTempCode;
    const valueToUpdate = this.data.formData.get(deviceKey)?.value; // hoặc cách bạn lấy value tùy bạn dùng form nào

    this.data.callUpdate?.(deviceKey, { [deviceKey]: valueToUpdate });
  }
  
  onTabContentChange(event: any) {
    this.selectedTabIndex = event.index;
  }
}
