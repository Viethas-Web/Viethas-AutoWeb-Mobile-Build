import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VhQueryAutoWeb } from 'vhautowebdb';

@Component({
  selector: 'app-news-image',
  templateUrl: './news-image.component.html',
  styleUrls: ['./news-image.component.scss']
})
export class NewsImageComponent implements OnInit {
   subproject
   resolution
   setupNewsImage


  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.subproject = this.data.subproject;
    this.resolution = this.data.resolution;
    this.setupNewsImage = this.data.setupNewsImage;
   
  }

  /**
 * hàm này để cập nhật resolution cho subproject
 */
  updateSetup() {
    this.vhQueryAutoWeb
      .updateSetup(this.setupNewsImage._id, {
        upload_image: {
          compress_type: this.setupNewsImage.upload_image.compress_type,
          source: this.setupNewsImage.upload_image.source,
        }
      })
      .then((bool: any) => {
        
      });
  }
}
