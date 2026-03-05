import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VhQueryAutoWeb } from 'vhautowebdb';

@Component({
  selector: 'app-transfer-image-to-server',
  templateUrl: './transfer-image-to-server.component.html',
  styleUrls: ['./transfer-image-to-server.component.scss']
})
export class TransferImageToServerComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<TransferImageToServerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private vhQueryAutoWeb: VhQueryAutoWeb
  ) { }

  ngOnInit() {
  }


  /**
 * hàm này để cập nhật Setup
 */
  updateSetup() {
    let dataUpdate:any = {
      upload_image: {
        compress_type: this.data.setupsImage.upload_image.compress_type,
        source: this.data.setupsImage.upload_image.source,
      }
    }
    this.vhQueryAutoWeb
      .updateSetup(this.data.setupsImage._id, dataUpdate)
      .then((bool: any) => {
        
      });
  }




}
