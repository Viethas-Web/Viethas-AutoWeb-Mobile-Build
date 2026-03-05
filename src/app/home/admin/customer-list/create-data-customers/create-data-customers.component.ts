import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import {   VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { NzModalService } from 'ng-zorro-antd/modal';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { LanguageService } from 'src/app/services/language.service';
 

@Component({
  selector: 'app-create-data-customers',
  templateUrl: './create-data-customers.component.html',
  styleUrls: ['./create-data-customers.component.scss']
})
export class CreateDataCustomersComponent implements OnInit {
  formData: FormGroup[] = [];
  
  nameFile: string = "";
  url: any = "/assets/documents/list-customer/" + this.languageService.translate("Customer list") + ".xlsx"
  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public vhAlgorithm: VhAlgorithm,
    private vhComponent: VhComponent,
    private router: Router,
    private languageService: LanguageService,
    private nzModalService: NzModalService,
    private platform: Platform,
    ) { }

  ngOnInit() {
    //this.deleteAllCustomer()
  }
  /**Chọn file */
  openFile() {
    document.getElementById("file_excel_customer")['value'] = '';
    document.getElementById("file_excel_customer").click()
  }

  validation_messages = {
    name: [{ type: "required", message: this.languageService.translate("Name is required") }],
    status_name: [{ message: this.languageService.translate("Invalid name") }],
    email: [{ type: "required", message: this.languageService.translate("Email is required") },
    { type: "email", message: this.languageService.translate("Invalid email") }],
    status_email: [{ message: this.languageService.translate("Invalid email") }],
    phone: [{ type: "required", message: this.languageService.translate("Phone number is required") },
    { type: "pattern", message: this.languageService.translate("Invalid phone number") }],
    status_phone: [{ message: this.languageService.translate("Invalid phone number") }],
  };

  /**
   * trả về form lưu các trường để thêm khách hàng
   * @example this.initForm({name : '',...} , 1)
   */
  initForm(data, index) {
    return new FormGroup({
      id: new FormControl(index),
      type: new FormControl(1),
      name: new FormControl(data[this.languageService.translate("_customer_name")], [Validators.required]),
      gender: new FormControl(data[this.languageService.translate("_gender")]),
      email: new FormControl(data[this.languageService.translate("_email")] ? data[this.languageService.translate("_email")] : ''),
      status_email: new FormControl(false), // trạng thái tên true: trùng / false: oke
      phone: new FormControl(data[this.languageService.translate("_phone")] ? data[this.languageService.translate("_phone")] : '', [Validators.required, Validators.pattern("[0-9]*")]),
      status_phone: new FormControl(false), // trạng thái tên true: trùng / false: oke
      address: new FormControl(data[this.languageService.translate("_address")]),
      district: new FormControl(data[this.languageService.translate("_district")]),
      province: new FormControl(data[this.languageService.translate("_province")]),
      country: new FormControl(data[this.languageService.translate("_country")]),
      time_for_payment : new FormControl(0),
    })
  }

  /**
   * lọc toàn bộ mảng từ file excel và set lại trường status_phone
   * @example this.checkModelChange()
   */
  checkModelChange() {
    this.formData.forEach((form, index) => {
      let status: any = this.checkEmailAndPhone(form['value']['phone'], form['value']['id'])
      form.controls['status_phone'].setValue(status[0] ? true : status[1])
    })
  }

  /**Check phone đã tồn tại chưa và lấy id_customer
   *  @example this.checkEmailAndPhone(0123456, 1)
  */
  checkEmailAndPhone(phone, id_form?: any) {
    if (phone != "") {
      
      let checkPhone: any = this.formData.filter(item => item['value'].phone.trim() == phone.trim() && item['value']['id'] != id_form).length == 0 ? false : true;
      return [  null, checkPhone]
    } else return [null];
  }

  /**Mở CSVFile */
  openXLSXFile(events) {
    if (events.target.files[0]) {
      // lưu tên file
      this.nameFile = events.target.files[0]['name'].slice(0, events.target.files[0]['name'].lastIndexOf("."))

      this.vhAlgorithm.importXLSX(events.target.files[0]).then((data: any) => {
        if (data.length > 200) {
          this.vhComponent.alertMessage("", this.languageService.translate("Only 200 customers can be imported at a time"), "", "OK").then(() => {
            this.formData = []
          })
        } else {
          this.formData = []
          if (data.length) {
            this.vhComponent.showLoading("").then(() => {
              data.forEach((item, index) => {
                this.formData.push(this.initForm(item, index))
                if (index == data.length - 1) {
                  this.vhComponent.hideLoading(0)
                  this.checkModelChange();
                }
              })
            })
          }
        }

      }).catch(err => {
        this.vhComponent.hideLoading(0)
        this.formData = [];
        this.vhComponent.alertMessage(this.languageService.translate("Error"), this.languageService.translate("Fail file format"), "", this.languageService.translate("Cancel"))
      })
    }
  }
  /** Xuất ra file CSV hoặc tải về file mẫu */
  status: boolean = false;
  exportXLSXFile() {
    if (this.formData.length) {
      let XLSXData: any[] = [];
      this.formData.forEach((item, index) => {
        let row: Object = new Object;

        row[this.languageService.translate("_customer_name")] = item['value']['name']
        row[this.languageService.translate("_gender")] = item['value']['gender']
        row[this.languageService.translate("_email")] = item['value']['email']
        row[this.languageService.translate("_phone")] = item['value']['phone']
        row[this.languageService.translate("_address")] = item['value']['address']
        row[this.languageService.translate("_district")] = item['value']['district']
        row[this.languageService.translate("_province")] = item['value']['province']
        row[this.languageService.translate("_country")] = item['value']['country']

        XLSXData.push(row)
        if (index == this.formData.length - 1) {
          this.vhAlgorithm.exportXLSX(XLSXData, this.nameFile).then(() => this.status = true).catch(err => this.status = true)
        }
      })
    }
  }

  /**Check dữ liệu trước khi tạo dữ liệu */
  checkForm(): boolean {
    for (let i = 0; i < this.formData.length; i++) {
      if (this.formData[i].invalid || this.formData[i]['value'].status_email == true || this.formData[i]['value'].status_phone == true) {
        this.vhComponent.alertMessage(this.languageService.translate("Error"), `${this.languageService.translate("Error line")} ${i + 1}`, "", this.languageService.translate("Cancel"))
        return false;
      }
      if (i == this.formData.length - 1) {
        return true;
      }
    }
    return false;
  }

  createdError: string = ""
  /**
   * bắt sk nhấn nút lưu
   * @example this.createDataCustomer() 
   */
  createDataCustomer() {
    if (this.checkForm()) {
      this.vhComponent.alertConfirm(this.languageService.translate("Confirm"), "", this.languageService.translate("Create customer data"), "OK", this.languageService.translate("Cancel"))
        .then(res => {
          this.createCustomer();
        }, () => { })
    }
  }

  /**
   * tạo khách hàng lên DB
   * @example this.createCustomer();
   */
  createCustomer() {
    this.vhComponent.showLoading("", "current-loading").then(() => {
      const data: any[] = this.formData.map(form => {
        let customerVal: any = { ...form['value'] }
        console.log(form['value']['gender']);
        
        customerVal['gender'] = this.languageService.translate(form['value']['gender'] ? form['value']['gender'] : '')
        delete customerVal['status_email']
        delete customerVal['status_phone']

        return customerVal
      })

      // this.vhQueryAutoWeb.addCustomers([...data]).then((customer: any[]) => {
         
      //   this.showLog([...data], [...customer])
      // }, error => {
      //   console.error(error)
      // }).finally(() => this.vhComponent.hideLoading(0))
    })
  }

  /**
   * hiển thị modal lỗi thêm khách hàng nếu có
   * @param data mảng khách hàng cần thêm
   * @param dataSuccess mảng khách hàng đã thêm lên DB thành công
   * @example this.showLog([...data], [...customer])
   */
  showLog(data: any[], dataSuccess: any[]) {
    this.createdError = ""
    if (data.length != dataSuccess.length) {
      for (let customer of data) {
        if (!dataSuccess.some(item => item.phone == customer.phone))
          this.createdError += `<span> - ${customer.name}(${customer.phone})</span><br/>`
      }

      this.nzModalService.error({
        nzTitle: this.languageService.translate("Customers have been created failed"),
        nzContent: this.createdError
      });
      this.formData = []
    } else {
      this.vhComponent.showToast(1500, `${this.languageService.translate("Customers")} ${this.languageService.translate("has been added successfully")}`, "success-toast")
      this.goBack()
    }


  }

  /** Tải file mẫu */
  downloadSampleFile() {
    if (this.platform.is("electron")){
      let urlEn = "https://github.com/Viethas-App/Download-Sample-File/releases/download/Download-Sample-File/Customer-list.xlsx"
      let urlVI = "https://github.com/Viethas-App/Download-Sample-File/releases/download/Download-Sample-File/Danh-sach-khach-hang.xlsx"
      let appLang: any = localStorage.getItem("vh-sales-language")
        if(appLang == 'vi') window.open(urlVI,'_blank', 'location=yes,height=250,width=250,scrollbars=yes,status=yes,title=Download')
          else window.open(urlEn,'_blank', 'location=yes,height=250,width=250,scrollbars=yes,status=yes,title=Download')
    } else {
    document.getElementById("download_customer").click()
    }
  }

  goBack() {
    this.router.navigate(['/dashboard/manage/partner/customer/customer-list']);
  }

}
