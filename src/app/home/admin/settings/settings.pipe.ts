import { Pipe, PipeTransform } from '@angular/core';
import { SettingsComponent } from './settings.component';
import { DesignTemplateComponent } from './design-template/design-template.component';
import { DeviceResolutionComponent } from './device-resolution/device-resolution.component';
import { PagePaddingComponent } from './page-padding/page-padding.component';
import { SingleImageComponent } from './single-image/single-image.component';
import { CategoryImageComponent } from './category-image/category-image.component';
import { LanguageComponent } from './language/language.component';
import { FoodImageComponent } from './food-image/food-image.component';
import { NewsImageComponent } from './news-image/news-image.component';
import { ProductImageComponent } from './product-image/product-image.component';
import { WebsiteImageComponent } from './website-image/website-image.component';
import { ServiceImageComponent } from './service-image/service-image.component';



const componentMap =
{
  SettingsComponent: SettingsComponent,
  DesignTemplateComponent: DesignTemplateComponent,
  DeviceResolutionComponent: DeviceResolutionComponent,
  PagePaddingComponent: PagePaddingComponent,
  SingleImageComponent: SingleImageComponent,
  CategoryImageComponent: CategoryImageComponent,
  ProductImageComponent: ProductImageComponent,
  LanguageComponent: LanguageComponent,
  NewsImageComponent: NewsImageComponent,
  FoodImageComponent: FoodImageComponent,
  ServiceImageComponent: ServiceImageComponent,
  WebsiteImageComponent: WebsiteImageComponent,


 
}
@Pipe({
  name: 'settingsPipe'
})

export class SettingsPipe implements PipeTransform {
  transform(value: string): any {
    if (componentMap[value]) {
     return componentMap[value];
    }
    throw new Error(`${value} component was not found`);
  }
}
