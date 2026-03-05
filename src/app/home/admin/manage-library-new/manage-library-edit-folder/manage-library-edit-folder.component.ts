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
  constructor(
    private vhImage: VhImage,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ManageLibraryEditFolderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private functionService: FunctionService 
  ) { }

  ngOnInit(): void {
    this.folderName = this.data.name
  }

  editFolder() {
    this.folderName = this.folderName.trim();
    if(this.folderName != this.data.name) {
      if(this.folderName == "") {
        this.functionService.createMessage('error', 'vui_long_nhap_ten_thu_muc')
        return;
      }
      let findIndex = -1;
      this.data.rows.forEach(ele => {
       if(ele) {
        ele.forEach(e => {
            if(e?.name == this.folderName) {
              findIndex++;
            }
        })
       }
      
      })
      if(findIndex != -1) {
        this.functionService.createMessage('error', 'ten_thu_muc_da_ton_tai')
        return;
      }
      this.vhImage.renameImageFolder(this.data.path, this.data.name, this.folderName)
        .then((data) => {
          console.log('check data', data);
          if (data) {
            this.dialogRef.close(data)
          }
        })
    } else this.functionService.createMessage('error', 'ten_thu_muc_khong_thay_doi')

  }

}
