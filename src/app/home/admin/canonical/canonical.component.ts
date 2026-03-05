import { Component, OnInit } from '@angular/core';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-canonical',
  templateUrl: './canonical.component.html',
  styleUrls: ['./canonical.component.scss'],
})
export class CanonicalComponent implements OnInit {
  /**
   * Biến này để chứa dữ liệu của this.data.staticdata
   * Lưu ý: không thể gộp 2 trường _id và id_object (gán _id=id_object và xóa id_object) vì:  không cho phép chỉ định _id khi gán
   */
  setup: any = {
    url_canonical: '',
  };
  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private message: NzMessageService,
    private languageService: LanguageService
  ) {}
  ngOnInit(): void {
    this.getSetup();
  }
  // hàm lấy ra cấu hình cho object zalo
  getSetup() {
    this.vhQueryAutoWeb.getSetups_byFields({ type: { $eq: 'url_canonical' } }).then((docs: any) => {
      if (docs.length) {
        this.setup = docs[0];
      } else {
        this.vhQueryAutoWeb.addSetup({ url_canonical: '', type: 'url_canonical'}).then((rsp: any) => {
          if (rsp.vcode === 0) {
            this.setup = rsp.data;
          }
        });
      }
    });
  }

  update() {
    // Xử lý: nếu url_canonical có dấu '/' ở cuối thì xóa
    if (this.setup.url_canonical && this.setup.url_canonical.endsWith('/')) {
      this.setup.url_canonical = this.setup.url_canonical.slice(0, -1);
    }

    // Cập nhật giá trị khi đã có url_canonical
    this.vhQueryAutoWeb.updateSetup(this.setup._id, { url_canonical: this.setup.url_canonical }).then((rsp: any) => {
      if (rsp.vcode == 0) {
        this.createMessage('success', this.languageService.translate('cap_nhat_thanh_cong'));
      } else {
        this.createMessage('error', this.languageService.translate('cap_nhat_that_bai'));
      }
    });
  }

  // hàm hiển thị thông báo
  createMessage(
    type: 'success' | 'error' | 'warning' | 'info',
    content: string,
    duration: number = 2000
  ): void {
    this.message.create(type, content, {
      nzDuration: duration,
    });
  }
}
