import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VhQueryAutoWeb } from 'vhautowebdb';

@Component({
  selector: 'app-single-image',
  templateUrl: './single-image.component.html',
  styleUrls: ['./single-image.component.scss']
})
export class SingleImageComponent implements OnInit {
  subproject
  resolution
  setupSingleImage



  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.subproject = this.data.subproject;
    this.resolution = this.data.resolution;
    this.setupSingleImage = this.data.setupSingleImage;
    
  }

  /**
 * hàm này để cập nhật resolution cho subproject
 */
  updateSetup() {
    this.vhQueryAutoWeb
      .updateSetup(this.setupSingleImage._id, {
        upload_image: {
          compress_type: this.setupSingleImage.upload_image.compress_type,
          display: this.setupSingleImage.upload_image.display,
          source: this.setupSingleImage.upload_image.source,
        }
      })
      .then((bool: any) => {
        
      });
  }

}
