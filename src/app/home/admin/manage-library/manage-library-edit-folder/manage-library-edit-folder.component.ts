import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VhImage } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-manage-library-edit-folder',
  templateUrl: './manage-library-edit-folder.component.html',
  styleUrls: ['./manage-library-edit-folder.component.scss']
})
export class ManageLibraryEditFolderComponent implements OnInit {

  folderName: any = ""
  type: any = 0; // 0: folder, 1: file

  mapTitle = {
    0: 'ten_thu_muc',
    1: 'ten_anh',
  }
  constructor(
    private vhImage: VhImage,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ManageLibraryEditFolderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private functionService: FunctionService
  ) { }

  ngOnInit(): void {
    this.folderName = this.data.name
    this.type = this.data.showFileNames.find((item:any) => item.name == this.folderName)?.type ?? 0
  }

  editFolder() {
    this.folderName = this.folderName.trim();
    if(this.folderName != this.data.name) {
      if(this.folderName == "") {
        this.functionService.createMessage('error', 'vui_long_nhap_ten_thu_muc')
        return;
      }
      const findIndex = this.data.showFileNames.findIndex((item) => item.name == this.folderName)
      if(findIndex != -1) {
        this.functionService.createMessage('error', 'ten_thu_muc_da_ton_tai')
        return;
      }
      
      this.vhImage.renameImageFolder(this.data.path, this.data.name, this.folderName)
        .then((data) => {
          if (data) {
            this.dialogRef.close(data)
          }
        })
    } else this.functionService.createMessage('error', 'ten_thu_muc_khong_thay_doi')

  }

}
