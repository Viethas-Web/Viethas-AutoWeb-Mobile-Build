import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VhAlgorithm, VhAuth, VhImage, VhQueryAutoWeb, } from 'vhautowebdb';
import { LanguageService } from 'src/app/services/language.service';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-detail-customer',
  templateUrl: './detail-customer.component.html',
  styleUrls: ['./detail-customer.component.scss']
})
export class DetailCustomerComponent implements OnInit {
  detailCustomer: FormGroup;

  customerGroups: any = []
  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private vhAuth: VhAuth,
    private vhComponent: VhComponent,
    public languageService: LanguageService,
    private vhImage: VhImage,
    private vhAlgorithm: VhAlgorithm,
    public dialogRef: MatDialogRef<DetailCustomerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }
  ngOnInit(): void {
    this.vhQueryAutoWeb.getCustomerClasss_byFields({})
      .then((rsp: any) => {
        if (rsp.vcode == 0) { 
          this.customerGroups = rsp.data;
        } else if (rsp.vcode == 11) {
          //phát thông báo lý do không lấy dữ liệu về được
          this.vhComponent.alertMessageDesktop("warning", this.languageService.translate('vui_long_dang_nhap_de_lay_du_lieu'))
        }
      }, error => {
        console.log('error', error);
      })
    this.detailCustomer = new FormGroup({
      img: new FormControl(this.data.img),
      name: new FormControl(this.data.name, Validators.required),
      email: new FormControl(this.data.email),
      gender: new FormControl(this.data.gender),
      datebirth: new FormControl(this.data.datebirth),
      phone: new FormControl(this.data.phone, Validators.required),
      address: new FormControl(this.data.address),
      country: new FormControl(this.data.country),
      province: new FormControl(this.data.province),
      district: new FormControl(this.data.district),
      note: new FormControl(this.data.note),
      debt_enable: new FormControl(this.data.debt_enable),
      id_customer_class: new FormControl(this.data.id_customer_class ? this.data.id_customer_class : ''),
      type: new FormControl(this.data.type),
      id_branch: new FormControl(this.data.id_branch),
      time_for_payment: new FormControl(this.data.time_for_payment),
    });
  }



  /**
   * xử lý thay đổi trường cho phép nợ của khách hàng
   * @param value 
   * @example this.changeDebtEnable(true)
   */
  changeDebtEnable(value) {
    this.detailCustomer.value.debt_enable = value;
    this.updateCustomer(this.detailCustomer.value);
    if (value) this.detailCustomer.addControl('time_for_payment', new FormControl(0, [Validators.required]))
    else this.detailCustomer.removeControl('time_for_payment');
  }
  /**
   * xử lý thay đổi trường ngày sinh của khách hàng
   * @param value 
   * @example this.changeDebtEnable(true)
   */
  onChangeDatePicker(value) {
    this.detailCustomer.value.datebirth = value;
    this.updateCustomer({ datebirth: this.detailCustomer.value.datebirth });
  }




  /**
   * cập nhật khách hàng theo trường truyền vào
   * @param value 
   * @example this.updateCustomer({name : 'nguyen van a'})
   */
  updateCustomer(value) {
    if (this.detailCustomer.valid) {
      let customer = { ...value };
      this.vhQueryAutoWeb.updateCustomer(this.data._id, customer)
        .then((res) => {
        });
    }
  }
  /**
   * mở folder chọn file
   * @example this.getFile()
   */
  getFile() {
    document.getElementById("file-upload").click();
  }
  /** Lấy hình ảnh từ Desktop */
  onUpload(e?) {
    const file = e.target.files[0];
    this.vhImage.getThumbnailFromDesktop(file, 256, 256, "images/database/customers", this.detailCustomer.value["img"] || '').then(
      photoURL => {
        this.detailCustomer.controls["img"].setValue(photoURL);
        this.vhComponent.showToast(2000, (this.languageService.translate("Image was loaded successfully")), 'success-toast');
        this.updateCustomer({ img: this.detailCustomer.value.img });
      },
      () => {
        this.vhComponent.showToast(2000, (this.languageService.translate("Image was failed")), 'success-toast');
      }
    );
  }

}
