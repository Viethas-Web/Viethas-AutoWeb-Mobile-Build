import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms'; 
import { VhAlgorithm, VhImage,  VhQueryAutoWeb } from 'vhautowebdb';
import { LanguageService } from 'src/app/services/language.service';
import { VhComponent } from 'src/app/components/vh-component/vh-component'; 
import { FunctionService } from 'vhobjects-service';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.scss']
})
export class AddCustomerComponent implements OnInit {
  addCustomerForm: FormGroup;
  phone: any;
  createProd: boolean = false;
  /*Danh sách hạng thành viên*/
  customerGroups: any = [];
  /*Trạng thái submit form để tránh submit nhiều lần*/
  submitting = false;

  constructor( 
    private vhComponent: VhComponent,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public lang: LanguageService,
    private vhAlgorithm: VhAlgorithm,
    private vhImage: VhImage,  
    private funtionService: FunctionService,
    private modal: NzModalRef
  ) { }

  ngOnInit() {
    this.initaddCustomerForm();
  }
  ngAfterViewInit() {
    this.phone = this.vhAlgorithm.vhphoneNumber(".phone");
  }
  ngOnDestroy() {
    if (!this.createProd && this.addCustomerForm.value['img']) {
      this.vhImage.deleteThumbnail([this.addCustomerForm.value['img']])
    }
  }
  /**
   * khởi tạo form lưu các trường của customer
   * @example  this.initaddCustomerForm();
   */
  initaddCustomerForm() {
    this.addCustomerForm = new FormGroup({
      img: new FormControl(''),
      name: new FormControl(null, Validators.compose([Validators.required])),
      email: new FormControl(null, Validators.compose([Validators.required, Validators.email])),
      gender: new FormControl('male'),
      datebirth: new FormControl(new Date()),
      phone: new FormControl(null, Validators.compose([Validators.required, Validators.minLength(10)])),
      address: new FormControl(null),
      country: new FormControl(null),
      province: new FormControl(null),
      district: new FormControl(null),
      note: new FormControl(null),
      debt_enable: new FormControl(true),
      id_customer_class: new FormControl(null),
      type: new FormControl(1),
      id_branch: new FormControl(this.vhQueryAutoWeb.getDefaultBranch()._id),
      time_for_payment: new FormControl(1, Validators.compose([Validators.required])),
      date_register: new FormControl(new Date()),
    });
    this.vhQueryAutoWeb.getCustomerClasss_byFields({})
      .then((rsp: any) => {
        // console.log('getCustomerClasss_byFields', rsp);
        if (rsp.vcode == 0) {
          this.customerGroups = rsp.data;
          if (rsp.data.find(e => e.default)) this.addCustomerForm.controls['id_customer_class'].setValue(rsp.data.find(e => e.default)._id)
        } else if (rsp.vcode == 11) {
          //phát thông báo lý do không lấy dữ liệu về được
          this.funtionService.createMessage('warning', `vui_long_dang_nhap_de_lay_du_lieu`);
        }
      }, error => {
        console.error(error);
      })
  }
 

  /**
   * add customer lên DB
   * @example this.addCustomer()
   */
  addCustomer() {
    this.vhQueryAutoWeb.getCustomers_byFields({email: {$eq: this.addCustomerForm.value.email}})
    .then((res: any) => {
      if (res.vcode !== 0) {
        this.funtionService.createMessage('error', `co_loi_xay_ra_vui_long_thu_lai_sau`);
        return;
      }

      if (res.data.length > 0) {
        this.funtionService.createMessage('warning', `tai_khoan_email_da_ton_tai`);
        return;
      }

      this.submitting = true;
      this.vhComponent.showLoading("").then(() => {
        let customer: any = { ...this.addCustomerForm.value };
        customer.phone = this.phone.getRawValue();
        customer.date = new Date().toISOString();
        this.vhQueryAutoWeb.addCustomer(customer)
          .then((res: any) => {
            console.log(res);
            if (res.vcode === 0) { 
              this.funtionService.createMessage('success', `${this.lang.translate("khach_hang")} ${customer.name} ${this.lang.translate("da_them_thanh_cong")}`);
              this.createProd = true;
              this.modal.close(res.data); 
            }
          }, error => {
            console.error(error);
            this.funtionService.createMessage('error', `co_loi_xay_ra_vui_long_thu_lai_sau`);
          })
          .finally(() => { this.vhComponent.hideLoading(0); this.submitting = false; })
      })
    })


    
  }
  /**
   * mở giao diện chọn file để upload ảnh
   * @example getFile()
   */
  getFile() {
    document.getElementById("file-upload").click();
  }
  
  
  /** Lấy hình ảnh từ Desktop */
  onUpload(e?) {
    const file = e.target.files[0];
    this.vhImage.getThumbnailFromDesktop(
      file, 
      256, 
      256, 
      "images/database/customers", 
      this.addCustomerForm.value["img"] || ''
    ).then(
      photoURL => {
        // console.log('photoURL', photoURL);
        this.addCustomerForm.controls["img"].setValue(photoURL);
        this.funtionService.createMessage('success', `hinh_anh_da_duoc_tai_thanh_cong`);
      },
      (error) => {
        console.error(error)
        this.funtionService.createMessage('error', `tai_anh_that_bai`);
      }
    );
  }

  /**
   * thay đổi cho phép nợ hay ko
   * @example changeDebt()
   */
  changeDebt() {
    if (this.addCustomerForm.value.debt_enable) this.addCustomerForm.addControl('time_for_payment', new FormControl(1, [Validators.required]))
    else this.addCustomerForm.removeControl('time_for_payment');
  }

  close() {
    this.modal.close();
  }
}
