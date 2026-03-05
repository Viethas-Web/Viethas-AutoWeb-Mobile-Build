import { VhImage } from 'vhautowebdb';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-manage-library-add-folder',
  templateUrl: './manage-library-add-folder.component.html',
  styleUrls: ['./manage-library-add-folder.component.scss']
})
export class ManageLibraryAddFolderComponent implements OnInit {
  folderName: any = ""
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ManageLibraryAddFolderComponent>,
    private vhImage: VhImage,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private functionService: FunctionService
  ) { }

  ngOnInit(): void {
  }

  addFolder() {    
    this.folderName = this.folderName.trim();
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

    this.vhImage.createImageFolder(this.data.path, this.folderName)
      .then((res:any) => {
        if(res) {
          this.dialogRef.close(res)
        }   
      })
  }

}
