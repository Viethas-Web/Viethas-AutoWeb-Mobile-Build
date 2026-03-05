import { Component, OnInit } from '@angular/core';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-zalo-config',
  templateUrl: './zalo-config.component.html',
  styleUrls: ['./zalo-config.component.scss']
})
export class ZaloConfigComponent implements OnInit {
  /**
   * Biến này để chứa dữ liệu của this.data.staticdata
   * Lưu ý: không thể gộp 2 trường _id và id_object (gán _id=id_object và xóa id_object) vì:  không cho phép chỉ định _id khi gán  
   */
  setup: any = {
    oaid: ''
  };
  isVisible = false; // biến check ẩn hiện modal
  constructor(private vhQueryAutoWeb: VhQueryAutoWeb, private message: NzMessageService, private languageService: LanguageService) { }
  ngOnInit(): void {
    this.getSetup();
  }
  // hàm lấy ra cấu hình cho object zalo 
  getSetup() {
    this.vhQueryAutoWeb
      .getSetups_byFields({ type: { $eq: 'zalo' } })
      .then(
        (docs: any) => {
          if (docs.length) {
            this.setup = docs[0];
          } else {
            this.vhQueryAutoWeb.addSetup({
              oaid: '',
              type: 'zalo'
            }).then((rsp: any) => {
              if (rsp.vcode === 0) {
                this.setup = rsp.data;
              }
            }, error => {

            })
          }
        },
        (err) => {
          // chưa có dữu liệu
          console.log(err);
        });
  }

  update() {
    //cho phép cập nhật nếu giá trị OAID khác rỗng
    if (this.setup.oaid != '') {
      //cập nhật giá trị khi đã có oaid
      this.vhQueryAutoWeb
        .updateSetup(this.setup._id, { oaid: this.setup.oaid })
        .then(
          (rsp: any) => {

            if (rsp.vcode == 0) {
              this.createMessage('success', this.languageService.translate('cap_nhat_thanh_cong'))
            } else {
              this.createMessage('error', this.languageService.translate('cap_nhat_that_bai'))
            }
          },
          (error) => {
            console.log('error', error);
            this.createMessage('error', this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_cap_nhat'))
          }
        );
    } else {
      this.createMessage('error', this.languageService.translate('cap_nhat_that_bai'))
    }
  }
  // hàm hiển thị thông báo
  createMessage(type: 'success' | 'error' | 'warning' | 'info', content: string, duration: number = 2000): void {
    this.message.create(type, content, {
      nzDuration: duration,
    });
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  gotoZaloOA() {
    window.open("https://oa.zalo.me/home", "_blank")
  }
}
