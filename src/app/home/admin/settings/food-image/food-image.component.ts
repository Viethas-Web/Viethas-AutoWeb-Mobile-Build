import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VhQueryAutoWeb } from 'vhautowebdb';

@Component({
  selector: 'app-food-image',
  templateUrl: './food-image.component.html',
  styleUrls: ['./food-image.component.scss']
})
export class FoodImageComponent implements OnInit {
  subproject
  resolution
  setupFoodImage

  

  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.subproject = this.data.subproject;
    this.resolution = this.data.resolution;
    this.setupFoodImage = this.data.setupFoodImage;
  }

  /**
 * hàm này để cập nhật resolution cho subproject
 */
  updateSetup() {
    this.vhQueryAutoWeb
      .updateSetup(this.setupFoodImage._id, {
        upload_image: {
          compress_type: this.setupFoodImage.upload_image.compress_type,
          source: this.setupFoodImage.upload_image.source,
        }
      })
      .then((bool: any) => {
        
      });
  }
}
