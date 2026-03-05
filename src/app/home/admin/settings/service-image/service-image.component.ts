import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VhQueryAutoWeb } from 'vhautowebdb';

@Component({
  selector: 'app-service-image',
  templateUrl: './service-image.component.html',
  styleUrls: ['./service-image.component.scss']
})
export class ServiceImageComponent implements OnInit {
   subproject
   resolution
   setupServiceImage



  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.subproject = this.data.subproject;
    this.resolution = this.data.resolution;
    this.setupServiceImage = this.data.setupServiceImage;

  }

  /**
 * hàm này để cập nhật resolution cho subproject
 */
  updateSetup() {
    this.vhQueryAutoWeb
      .updateSetup(this.setupServiceImage._id, {
        upload_image: {
          compress_type: this.setupServiceImage.upload_image.compress_type,
          source: this.setupServiceImage.upload_image.source,
        }
      })
      .then((bool: any) => {
        
      });
  }
}
