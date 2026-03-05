import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-edit-coupon',
  templateUrl: './edit-coupon.component.html',
  styleUrls: ['./edit-coupon.component.scss']
})
export class EditCouponComponent implements OnInit {
  @Input() editCoupon: any;
  @Output() closeDrawer = new EventEmitter<boolean>();
  @Output() isEdited = new EventEmitter<boolean>();
  constructor(
    private message: NzMessageService,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public languageService : LanguageService
  ) { }

  ngOnInit(): void {
    this.infoCoupon.patchValue({
      name: this.editCoupon?.name,
      value: this.editCoupon?.units[0].value,
      point: this.editCoupon?.units[0].points
    })
  }
  infoCoupon = new FormGroup({
    name: new FormControl('', [
      Validators.required,
    ]),
    value: new FormControl(0, [
      Validators.required,
    ]),
    point: new FormControl(0, [
      Validators.required,
    ])
  })
  updateInfoCoupon() {
    const data_update = { ...this.infoCoupon.value };
    data_update['units'] = [{
      value: Number(data_update.value),
      points: Number(data_update.point),
      unit: '',
      ratio: 1,
      default: true
    }]
    delete data_update.value;
    delete data_update.point;
    this.vhQueryAutoWeb.updateCoupon(this.editCoupon._id, data_update)
      .then((rsp: any) => {
        if (rsp.vcode === 0) {
          this.message.success(this.languageService.translate('cap_nhap_thanh_cong'));
          const dataEdited = {...this.editCoupon, ...data_update};
          this.isEdited.emit(dataEdited);
        }
        this.closeDrawer.emit(false);
      }, error => {
        this.message.success(this.languageService.translate('cap_nhap_that_bai'));
      })

  }
  get name() { return this.infoCoupon.get('name') }
  get value() { return this.infoCoupon.get('value') }
  get point() { return this.infoCoupon.get('point') }
}
