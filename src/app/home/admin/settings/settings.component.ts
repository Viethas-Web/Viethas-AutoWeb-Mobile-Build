import { Component, EventEmitter, Input, OnInit, Output, } from '@angular/core';
import {  VhQueryAutoWeb } from 'vhautowebdb';
import { MatDialog } from '@angular/material/dialog';
import { SingleImageComponent } from './single-image/single-image.component';
import { CategoryImageComponent } from './category-image/category-image.component';
import { ProductImageComponent } from './product-image/product-image.component';
import { FoodImageComponent } from './food-image/food-image.component';
import { NewsImageComponent } from './news-image/news-image.component';
import { ServiceImageComponent } from './service-image/service-image.component';
import { WebsiteImageComponent } from './website-image/website-image.component';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  
  @Input() blockChoosing;
  @Input() objectChoosing;
  @Input() selectedDevice;
  @Input() blockPicking;
  @Input() currentPage;
  @Input() subproject;
  @Input() resolution;
  @Output() addNewFrame = new EventEmitter()


  @Input() setupSingleImage;
  @Input() setupCategoryImage;
  @Input() setupProductImage;
  @Input() setupFoodImage;
  @Input() setupNewsImage;
  @Input() setupServiceImage;
  @Input() setupWebsiteImage;
  



  settings = [
    {
      label: "hinh_anh_don",
      component: SingleImageComponent,
      icon: 'bi bi-image-fill'
    },
    {
      label: "hinh_anh_danh_muc",
      component: CategoryImageComponent,
      icon: 'bi bi-collection'
    },
    {
      label: "hinh_anh_san_pham",
      component: ProductImageComponent,
      icon: 'bi bi-archive'
    },
    {
      label: "hinh_anh_mon_an_thuc_uong",
      component: FoodImageComponent,
      icon: 'bi bi-basket2-fill'
    },
    {
      label: "hinh_anh_tin_tuc",
      component: NewsImageComponent,
      icon: 'bi bi-file-earmark-image-fill'
    },
    {
      label: "hinh_anh_dich_vu",
      component: ServiceImageComponent,
      icon: "bi bi-tools"
    },
    {
      label: "hinh_anh_du_an",
      component: WebsiteImageComponent,
      icon: 'bi bi-card-heading'
    },
  ]

  settingChoosing = null;
  showSettings:boolean = false

  mapSettings = {
    'hinh_anh_danh_muc': 'category',
    'hinh_anh_san_pham': "ecommerce",
    'hinh_anh_mon_an_thuc_uong': "food_drink",
    'hinh_anh_tin_tuc': 'news',
    'hinh_anh_dich_vu': 'service',
    'hinh_anh_du_an': 'webapp',
    'hinh_anh_don': 'basic',
  }

  constructor(
    private VhQueryAutoWeb: VhQueryAutoWeb,
    private matDialog: MatDialog,
  ) {}

  ngOnInit(): void {}

  handleChooseSettings(item): void {
    const component = item.component;
    this.matDialog.open(component, {
      width: '30vw',
      height: '570px',
      data: {
        subproject: this.subproject,
        resolution: this.resolution,
        setupSingleImage: this.setupSingleImage,
        setupCategoryImage: this.setupCategoryImage,
        setupProductImage: this.setupProductImage,
        setupFoodImage: this.setupFoodImage,
        setupNewsImage: this.setupNewsImage,
        setupServiceImage: this.setupServiceImage,
        setupWebsiteImage: this.setupWebsiteImage
      },
    });
  }

  conditionToShow(setting) {
    if(['hinh_anh_danh_muc', 'hinh_anh_san_pham', 'hinh_anh_mon_an_thuc_uong', 'hinh_anh_tin_tuc', 'hinh_anh_dich_vu', 'hinh_anh_du_an', 'hinh_anh_don'].includes(setting.label)) {
      return this.subproject.main_sectors.some((sector) => sector == this.mapSettings[setting.label]);
    } else return true;
  }

   
}
