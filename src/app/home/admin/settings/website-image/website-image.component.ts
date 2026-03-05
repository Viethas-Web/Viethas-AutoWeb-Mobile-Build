import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VhQueryAutoWeb } from 'vhautowebdb';

@Component({
  selector: 'app-website-image',
  templateUrl: './website-image.component.html',
  styleUrls: ['./website-image.component.scss']
})
export class WebsiteImageComponent implements OnInit {
  subproject
  resolution
  setupWebsiteImage

  

  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.subproject = this.data.subproject;
    this.resolution = this.data.resolution;
    this.setupWebsiteImage = this.data.setupWebsiteImage;
  }

  /**
 * hàm này để cập nhật resolution cho subproject
 */
  updateSetup() {
    this.vhQueryAutoWeb
      .updateSetup(this.setupWebsiteImage._id, {
        upload_image: {
          compress_type: this.setupWebsiteImage.upload_image.compress_type,
          source: this.setupWebsiteImage.upload_image.source,
        }
      })
      .then((bool: any) => {
        
      });
  }
}
