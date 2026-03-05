import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { Component, Input, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { FunctionService } from 'vhobjects-service/src/services';


@Component({
  selector: 'app-config-maintenance',
  templateUrl: './config-maintenance.component.html',
  styleUrls: ['./config-maintenance.component.scss']
})
export class ConfigMaintenanceComponent implements OnInit {
  arr_link_page: any = [];
  maintenance: any = {
    link: null,
    type: 'maintenance'
  };

  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private vhAlgorithm: VhAlgorithm,
    private message: NzMessageService,
    private translateService: TranslateService,
    public functionService: FunctionService,
  ) { }

  ngOnInit() {

    this.getLinkAllPages();
    this.vhQueryAutoWeb
      .getSetups_byFields({ type: { $eq: 'maintenance' } })
      .then((docs: any) => {
        if (docs.length) {
          this.maintenance = docs[0];
        }
        else {
          this.vhQueryAutoWeb.addSetup({ link: '', type: 'maintenance' })
            .then((rsp: any) => {
              // console.log('check rsp', rsp);
              this.maintenance = rsp.data;
            }, error => {

            })
        }

      })
  }


  updateSetup() {
    this.vhQueryAutoWeb.updateSetup(this.maintenance._id, { link: this.maintenance.link })
      .then((rsp: any) => {
        if (rsp.vcode === 0) {
          // console.log('updateSetup succeed');
          this.message.success(this.translateService.instant('cap_nhat_thanh_cong'));
        }
      }, error => {
        console.log('error', error);
      })
  }

  getLinkAllPages() {
    this.vhQueryAutoWeb.getPages_byFields({ type: { $eq: 'maintenance' } }).then((pages: any) => {
      // Dùng cho trường hợp trang không có name_vn (Hoặc functionService.defaultLanguage)
      const pagesNew = pages.map((page) => {
        // if (!page.name) console.warn('Không có name', page)
        if (!page['name_' + this.functionService.defaultLanguage] && page.name) {
          return {
            ...page,
            ['name_' + this.functionService.defaultLanguage]: page.name
          };
        } else return page;
      });
      this.arr_link_page = this.vhAlgorithm.sortVietnamesebyASC(pagesNew, 'name_' + this.functionService.defaultLanguage);
    });
  }
}
