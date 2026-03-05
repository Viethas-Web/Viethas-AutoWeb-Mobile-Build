import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms'; 
import { VhAlgorithm, VhImage, VhQueryAutoWeb } from 'vhautowebdb';
import { LanguageService } from 'src/app/services/language.service';
import { FunctionService } from 'vhobjects-service';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-edit-customer',
  templateUrl: './edit-customer.component.html',
  styleUrls: ['./edit-customer.component.scss']
})
export class EditCustomerComponent implements OnInit {
  @Input() data: any;
  editCustomerForm: FormGroup;
  phone: any;
  createProd: boolean = false;
  /*Danh sách hạng thành viên*/
  customerGroups: any = [];
  /*Trạng thái submit form để tránh submit nhiều lần*/
  submitting = false;

  constructor( 
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public lang: LanguageService,
    private vhAlgorithm: VhAlgorithm,
    private vhImage: VhImage, 
    private funtionService: FunctionService,
    private modal: NzModalRef
  ) { }

  ngOnInit() {
    this.initForm(this.data);
  }

  ngAfterViewInit() {
    this.phone = this.vhAlgorithm.vhphoneNumber(".phone");
  }
  /**
   * khởi tạo form lưu các trường của customer
   * @example  this.editCustomerForm();
   */
  initForm(data) {
    this.editCustomerForm = new FormGroup({
      img: new FormControl(data.img),
      name: new FormControl(data.name, Validators.compose([Validators.required])),
      email: new FormControl(data.email, Validators.compose([Validators.required, Validators.email])),
      gender: new FormControl(data.gender),
      datebirth: new FormControl(data.datebirth),
      phone: new FormControl(data.phone, Validators.compose([Validators.required, Validators.minLength(10)])),
      address: new FormControl(data.address),
      country: new FormControl(data.country),
      province: new FormControl(data.province),
      district: new FormControl(data.district),
      note: new FormControl(data.note),
      debt_enable: new FormControl(data.debt_enable),
      id_customer_class: new FormControl(data.id_customer_class),
      type: new FormControl(1),
      id_branch: new FormControl(this.vhQueryAutoWeb.getDefaultBranch()._id),
      time_for_payment: new FormControl(data.time_for_payment, Validators.compose([Validators.required])) ,
      date_register: new FormControl(new Date(data.date_register)),
    });
    this.vhQueryAutoWeb.getCustomerClasss_byFields({})
      .then((rsp: any) => {
        if (rsp.vcode == 0) { 
          this.customerGroups = rsp.data; 
        } else if (rsp.vcode == 11) {
          //phát thông báo lý do không lấy dữ liệu về được
          this.funtionService.createMessage('warning', `vui_long_dang_nhap_de_lay_du_lieu`);
        }
      }, error => {
        console.error(error);
      })
  }
 

  /**
   * 
   */
  updateCustomer(value) {
    this.vhQueryAutoWeb.updateCustomer(this.data._id, value)
    .then((res:any) => {

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
      this.editCustomerForm.value["img"] || ''
    ).then(
      photoURL => {
        // console.log('photoURL', photoURL);
        this.editCustomerForm.controls["img"].setValue(photoURL);
        this.funtionService.createMessage('success', `hinh_anh_da_duoc_tai_thanh_cong`);
        this.updateCustomer({img: photoURL});
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
    if (this.editCustomerForm.value.debt_enable) this.editCustomerForm.addControl('time_for_payment', new FormControl(1, [Validators.required]))
    else this.editCustomerForm.removeControl('time_for_payment');

    this.updateCustomer({debt_enable: this.editCustomerForm.value.debt_enable })
  }

  close() {
    this.modal.close({...this.editCustomerForm.value, _id: this.data._id});
  }

  handleUpdateEmail() {
    this.vhQueryAutoWeb.getCustomers_byFields({email: {$eq: this.editCustomerForm.value.email}})
    .then((res:any) => {
      if(res.vcode != 0) {
        this.funtionService.createMessage('error', `co_loi_xay_ra_vui_long_thu_lai_sau`);
        return
      }

      if(res.data.length > 0) {
        this.funtionService.createMessage('error', `tai_khoan_email_da_ton_tai`);
        this.editCustomerForm.get('email').setValue(this.data.email)
        return
      }

      this.updateCustomer({email: this.editCustomerForm.value.email})
    })
  }
}
