import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VhQueryAutoWeb } from 'vhautowebdb';

@Component({
  selector: 'app-category-image',
  templateUrl: './category-image.component.html',
  styleUrls: ['./category-image.component.scss']
})
export class CategoryImageComponent implements OnInit {
   subproject
   resolution

   setupCategoryImage

  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.subproject = this.data.subproject;
    this.resolution = this.data.resolution;
    this.setupCategoryImage = this.data.setupCategoryImage;
  }

  /**
 * hàm này để cập nhật resolution cho subproject
 */
  updateSetup() {
    this.vhQueryAutoWeb
      .updateSetup(this.setupCategoryImage._id, {
        upload_image: {
          compress_type: this.setupCategoryImage.upload_image.compress_type,
          source: this.setupCategoryImage.upload_image.source,
        }
      })
      .then((bool: any) => {
        
      });
  }


}
