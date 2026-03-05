import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { LanguageService } from 'src/app/services/language.service';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-customer-group',
  templateUrl: './customer-group.component.html',
  styleUrls: ['./customer-group.component.scss']
})
export class CustomerGroupComponent implements OnInit {
  newNameGroup: any;
  customer_group: any = [];
  list_discount_bills: any[] = [];

  list_earning_point_bills: any = [];
  list_earning_points_products: any = [];
  formAdd: FormGroup;
  formEdit: FormGroup;
  earned_points_clear_auto = {
    enable: false,
    month_of_year: '12'
  }
  payment: any = {
    points: '1',
    money: '1000',
    enable: false
  }
  symbol = JSON.parse(localStorage.getItem('vhsales_currencyFormat')).symbol.text;
  default_customer_class = true
  submitting = false; // Trạng thái submit form để tránh submit nhiều lần

  constructor(
    private router: Router,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public vhAlgorithm: VhAlgorithm,
    private vhComponent: VhComponent,
    private languageService: LanguageService,
    private nzModalService: NzModalService,
    private functionService: FunctionService
  ) {
  }

  ngOnInit(): void {
    this.initFormAdd();
    this.getData();

  }


  /**
   * khởi tạo các trường cho form để lưu hạng khách hàng
   * @example this.initFormAdd()
   */
  initFormAdd() {
    this.formAdd = new FormGroup({
      name: new FormControl('', Validators.required),
      id_discount_bill: new FormControl(null),
      id_discount_sales: new FormControl(null),
      id_earning_points_bill: new FormControl(null),
      id_earning_points_product: new FormControl(null),
      exchange_coupon_enable: new FormControl(false),
      exchange_voucher_enable: new FormControl(false),
      exchange_payment_card_enable: new FormControl(false),
    })
    this.earned_points_clear_auto = {
      enable: false,
      month_of_year: '12'
    }

    this.payment = {
      points: '1',
      money: '1000',
      enable: false
    }

  }
  /**
   * gán các giá trị của hạng được chọn vào form để cập nhật
   * @param data 
   * @example this.initFormEdit(customer_class_selected)
   */
  initFormEdit(data) {
    this.formEdit = new FormGroup({
      name: new FormControl(data.name, Validators.required),
      id_discount_bill: new FormControl(data.id_discount_bill),
      id_discount_sales: new FormControl(data.id_discount_sales),
      id_earning_points_bill: new FormControl(data.id_earning_points_bill),
      id_earning_points_product: new FormControl(data.id_earning_points_product),
      exchange_coupon_enable: new FormControl(data.exchange_coupon_enable),
      exchange_voucher_enable: new FormControl(data.exchange_voucher_enable),
      exchange_payment_card_enable: new FormControl(data.exchange_payment_card_enable),
    })
    this.earned_points_clear_auto = {
      enable: data.earned_points_clear_auto['enable'],
      month_of_year: data.earned_points_clear_auto['month_of_year']
    }
    this.payment = {
      points: data.payment.points,
      money: data.payment.money,
      enable: data.payment.enable,
    }
  }

  getData() {
    Promise.all([
      this.vhQueryAutoWeb.getCustomerClasss_byFields({}),
      this.vhQueryAutoWeb.getEarningPointsBills(),
      this.vhQueryAutoWeb.getEarningPointsProducts(),
    ])
      .then(([customer_class, earning_point_bills, earning_points_products]: any) => {
        console.log(customer_class);

        if (customer_class.vcode == 0) {
          this.customer_group = this.vhAlgorithm.sortStringbyASC(customer_class.data, 'name').map(item => {
            return {
              ...item,
              id_discount_bill: item.id_discount_bill ? item.id_discount_bill : '',
              id_discount_sales: item.id_discount_sales ? item.id_discount_sales : '',
              id_earning_points_bill: item.id_earning_points_bill ? item.id_earning_points_bill : '',
              id_earning_points_product: item.id_earning_points_product ? item.id_earning_points_product : '',

            }
          })
          this.list_earning_point_bills = earning_point_bills.data;
          this.list_earning_points_products = earning_points_products.data;
        }
      })

  }

  sort() {
    this.customer_group.sort((a, b) =>
      this.vhAlgorithm.changeAlias(a.name).toLowerCase() >
        this.vhAlgorithm.changeAlias(b.name).toLowerCase()
        ? 1
        : -1
    );
  }

  /**Kiểm tra tồn tại tên danh mục */
  checkExistGroup(groupName: string): Promise<boolean> {
    return new Promise<any>((resolve, reject) => {
      let index = this.customer_group.findIndex(item =>
        this.vhAlgorithm.changeAlias(item.name).toLowerCase() == this.vhAlgorithm.changeAlias(groupName).toLowerCase())
      if (index == -1) resolve(false)
      else resolve(true);
    });
  }


  /*----Add group product----*/
  addGroupForm: FormGroup;
  visible_add = false; //biến cờ trạng thái show/hide popup thêm danh mục

  openAdd(): void {
    this.visible_add = true;
    this.formAdd.reset();
  }
  closeAdd(): void {
    this.visible_add = false;
  }
  getValue(value) {
    this.newNameGroup = value;
  }
  addGroup() {
    if (this.newNameGroup) {
      this.submitting = true;
      this.functionService.showLoading(this.languageService.translate('dang_them'));

      this.checkExistGroup(this.newNameGroup)
        .then((res) => {
          if (res) {
            this.functionService.hideLoading();
            this.submitting = false;
            this.vhComponent.showToast(1500, this.languageService.translate("Group existed"), 'alert-toast');
            return;
          } else {
            let data = this.formAdd.value
            data['earned_points_clear_auto'] = {
              enable: this.earned_points_clear_auto.enable,
              month_of_year: parseInt(this.earned_points_clear_auto.month_of_year)
            }
            data['payment'] = {
              points: parseFloat(this.payment.points),
              money: parseFloat(this.payment.money),
              enable: this.payment.enable
            }
            if (!this.customer_group.length) data.default = true
            console.log('addCustomerClass data', data);

            this.vhQueryAutoWeb.addCustomerClass(data).then((response: any) => {

              if (response.vcode == 0) {
                this.customer_group.push({ ...response.data, number_customer: 0 });
                this.vhComponent.alertMessageDesktop('success', 'them_hang_khach_hang_thanh_cong')
                this.closeAdd();
              }
              else this.vhComponent.alertMessageDesktop("error", "co_loi_xay_ra_vui_long_thu_lai")
            }, error => {
              this.vhComponent.alertMessageDesktop("error", "co_loi_xay_ra_vui_long_thu_lai")
              console.log('error', error);
            }).finally(() => {
              this.functionService.hideLoading();
              setTimeout(() => {
                this.submitting = false;
              }, 100);
            });
          }
        }, err => {
          this.functionService.hideLoading();
          this.submitting = false; 
          this.vhComponent.alertMessageDesktop("error", "co_loi_xay_ra_vui_long_thu_lai");
          console.log('error', err);
        })
    }
    else this.vhComponent.alertMessageDesktop('error', "vui_long_nhap_ten")
  }

  /** ----Edit group product----- */
  visible_detail = false;
  data_selected: any;
  _id: any;
  /**
   * mở drawer cập nhật hạng khách hàng
   * @param item 
   * @example openEdit(customer_class_selected)
   */
  openEdit(item): void {
    this.visible_detail = true;
    this._id = item._id;
    this.initFormEdit(item);
    this.data_selected = item
  }
  /**
   * đóng drawer cập nhật hạng khách hàng
   * @example this.closeEdit()
   */
  closeEdit(): void {
    this.visible_detail = false;
  }
  /**
   * bắt sk nhấn nút lưu trong drawer cập nhật hạng khách hàng
   * @example this.editGroup()
   */
  editGroup() {
    if (this.formEdit.valid) {
      let data = this.formEdit.value;
      data.id_discount_bill = data.id_discount_bill ? data.id_discount_bill : null;
      data.id_discount_sales = data.id_discount_sales ? data.id_discount_sales : null;
      data.id_earning_points_bill = data.id_earning_points_bill ? data.id_earning_points_bill : null;
      data.id_earning_points_product = data.id_earning_points_product ? data.id_earning_points_product : null;

      data['earned_points_clear_auto'] = {
        enable: this.earned_points_clear_auto.enable,
        month_of_year: parseInt(this.earned_points_clear_auto.month_of_year)
      }
      data['payment'] = {
        points: parseFloat(this.payment.points),
        money: parseFloat(this.payment.money),
        enable: this.payment.enable
      }
      this.vhQueryAutoWeb.updateCustomerClass(this._id, data)
        .then((bool) => {
          if (bool) {
            this.customer_group[this.customer_group.findIndex(item => item._id == this._id)].name = this.formEdit.value.name;
            this.customer_group[this.customer_group.findIndex(item => item._id == this._id)].id_discount_bill = this.formEdit.value.id_discount_bill ? this.formEdit.value.id_discount_bill : '';
            this.customer_group[this.customer_group.findIndex(item => item._id == this._id)].id_discount_sales = this.formEdit.value.id_discount_sales ? this.formEdit.value.id_discount_sales : '';
            this.customer_group[this.customer_group.findIndex(item => item._id == this._id)].id_earning_points_bill = this.formEdit.value.id_earning_points_bill ? this.formEdit.value.id_earning_points_bill : '';
            this.customer_group[this.customer_group.findIndex(item => item._id == this._id)].id_earning_points_product = this.formEdit.value.id_earning_points_product ? this.formEdit.value.id_earning_points_product : '';
            this.customer_group[this.customer_group.findIndex(item => item._id == this._id)].earned_points_clear_auto = this.earned_points_clear_auto;

            this.customer_group[this.customer_group.findIndex(item => item._id == this._id)].exchange_coupon_enable = this.formEdit.value.exchange_coupon_enable;
            this.customer_group[this.customer_group.findIndex(item => item._id == this._id)].exchange_voucher_enable = this.formEdit.value.exchange_voucher_enable;
            this.customer_group[this.customer_group.findIndex(item => item._id == this._id)].exchange_payment_card_enable = this.formEdit.value.exchange_payment_card_enable;
            this.customer_group[this.customer_group.findIndex(item => item._id == this._id)].payment = this.payment;
            this.vhComponent.alertMessageDesktop("success", 'cap_nhat_hang_khach_hang_thanh_cong')
          }

          this.closeEdit();
        }, error => {
          console.log('error', error);
        })
    } else this.closeEdit()
  }

  /**
   * xóa hạng khách hàng
   * @param data 
   * @example  this.deleteGroup(data)
   */
  deleteGroup(data) {
    if (data.number_customer) {
      this.nzModalService.confirm({
        nzTitle: this.languageService.translate("nhom_nay_dang_co_khach_dong_y_xoa"),
        nzOnOk: () => {
          this.vhComponent.showLoading('').then(() => {
            this.vhQueryAutoWeb.deleteCustomerClass(data._id).then(bool => {
              if (bool) {
                this.customer_group.splice(this.customer_group.indexOf(data), 1)
                this.vhComponent.alertMessageDesktop('success', 'xoa_hang_khach_hang_thanh_cong')
                this.vhComponent.hideLoading(0)
              }
            })
          })
        },
        nzCancelText: this.languageService.translate("Cancel")
      })
    }
    else {
      this.vhComponent.showLoading('').then(() => {
        this.vhQueryAutoWeb.deleteCustomerClass(data._id).then(bool => {
          if (bool) {
            this.customer_group.splice(this.customer_group.indexOf(data), 1)
            this.vhComponent.alertMessageDesktop('success', 'xoa_hang_khach_hang_thanh_cong')
          }
        }).finally(() => this.vhComponent.hideLoading(0))
      })

    }
  }

  /**
  * cập nhật trường default cho thuế đươc chọn, update lại default = false cho các thuế khác
  */
  setDefault(item) {
    let index = this.customer_group.findIndex(item => item.default)
    if (index != -1) {
      this.customer_group[index].default = false;
      item.default = true;
      Promise.all([this.vhQueryAutoWeb.updateCustomerClass(item._id, { default: true }), this.vhQueryAutoWeb.updateCustomerClass(this.customer_group[index]._id, { default: false })])
        .then(res => {
          this.vhComponent.showToast(1500, this.languageService.translate("Tax") + " " + item.name + " " + this.languageService.translate("has been set default successfully"), "success-toast")
        })
    } else {
      item.default = true;
      this.vhQueryAutoWeb.updateCustomerClass(item._id, item)
    }
  }

  gotoDetailGroup(data) {
    // this.router.navigate(['/dashboard/manage/partner/customer-group/detail'], { state: { group: data } });
  }


  changePaymentBill(field, value) {
    this.payment[field] = value.replaceAll(/[.*+?^${}()|[\]\\,a-zA-Z]/g, '')
  }

  gotoAddDiscountInvoice() {
    this.router.navigate(['dashboard/manage/sales-program/discount-customer/invoice-discount/list-discount'])
  }
  gotoAddDiscountSales() {
    this.router.navigate(['dashboard/manage/sales-program/discount-customer/sales-discount/list-discount'])
  }

  gotoAddPointInvoice() {
    this.router.navigate(['dashboard/manage/sales-program/reward-points/by-bill'])
  }

  gotoAddPointProduct() {
    this.router.navigate(['dashboard/manage/sales-program/reward-points/by-product'])
  }
}
