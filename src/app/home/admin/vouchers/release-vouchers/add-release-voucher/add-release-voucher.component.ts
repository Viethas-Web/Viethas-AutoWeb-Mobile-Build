import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-add-release-voucher',
  templateUrl: './add-release-voucher.component.html',
  styleUrls: ['./add-release-voucher.component.scss']
})
export class AddReleaseVoucherComponent implements OnInit {
  @Output() isAdded = new EventEmitter<boolean>();
  @Output() closeModal = new EventEmitter<boolean>();
  data_release: FormGroup;
  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private vhComponent: VhComponent,
    private message: NzMessageService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }
  initForm() {
    this.data_release = new FormGroup({
      'name': new FormControl('', [
        Validators.required
      ]),
      'date_validity': new FormControl((new Date()).toISOString().substring(0, 10)),
      'date_expire': new FormControl((new Date()).toISOString().substring(0, 10))
    })
  }
  handleOk(): void {
      if (this.data_release.value.name.length != '') {
        this.data_release.value.date_validity = new Date(this.data_release.value.date_validity).toISOString();
        this.data_release.value.date_expire = new Date(this.data_release.value.date_expire).toISOString();
        this.vhQueryAutoWeb.addVoucherRelease(this.data_release.value)
          .then((response: any) => {
            console.log('response', response);
            if (response.vcode == 0) {
              this.message.success(this.languageService.translate('them_thanh_cong'));
              this.isAdded.emit(response.data);
              
            }
            this.closeModal.emit(false);
          }, error => {
            this.message.error(this.languageService.translate('them_that_bai_vui_long_thu_lai'));
          })
      }
  }

  handleCancel(): void {
    this.closeModal.emit(false);
    this.isAdded.emit(false);
  }
}
