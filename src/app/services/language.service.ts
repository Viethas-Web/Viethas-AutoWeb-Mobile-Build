import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { en_US, vi_VN, NzI18nService } from 'ng-zorro-antd/i18n';
@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor(
    private translateService: TranslateService,
    private i18n: NzI18nService
  ) { }

  public translate(key: string) {
    let value: string
    this.translateService.get(key).subscribe(res => value = res)
    return value
  }

  switchLanguage(key) {
    switch (key) {
      case "vi": this.i18n.setLocale(vi_VN); break;
      default: this.i18n.setLocale(en_US); break;
    }
  }
}
