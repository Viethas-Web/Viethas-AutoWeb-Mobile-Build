import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-detail-voucher',
  templateUrl: './detail-voucher.component.html',
  styleUrls: ['./detail-voucher.component.scss']
})
export class DetailVoucherComponent implements OnInit {
  listProduct = [];
  listProductChose = [];
  total = 0;
  priceProduct = 0;
  price_origin: any;
  editPrice: any = {};
  data: any;
  imgDefault = "https://phutungnhapkhauchinhhang.com/wp-content/uploads/2020/06/default-thumbnail.jpg";
  show_product = [];
  formVoucher: FormGroup;
  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private message: NzMessageService,
    public vhAlgorithm: VhAlgorithm,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private languageService: LanguageService
  ) {
    this.data = this.router.getCurrentNavigation()?.extras.state.voucher;
    this.initForm(this.data);
  }

  ngOnInit(): void {
    
    if (this.data.products) {
      this.total = this.data.units[0].price;
      for (let i = 0; i < this.data.products.length; i++) {
        let id = this.data.products[i].id_subproduct ? this.data.products[i].id_subproduct : this.data.products[i].id_product;
        this.vhQueryAutoWeb.getDetailProduct(id)
          .then((detail: any) => {
            const product = this.data.products[i];
            let arrayItem = {
              ...this.data.products[i],
              price_origin: product.price,
              index: i,
              unit: this.vhQueryAutoWeb.getUnit_byRatio(detail.units, 1).unit
            }
            arrayItem['imgs'] = detail.imgs ? detail.imgs : this.imgDefault;
            arrayItem['name'] = detail.name;
            this.show_product.push(arrayItem);
          }, (error: any) => {
            console.log('error', error)
          })
      }
    }
  }
  ngAfterViewInit() {
    this.vhAlgorithm.waitingStack().then(() => {
      this.price_origin = this.vhAlgorithm.vhnumeral('.price_origin')
    });
  }
  // Khởi tạo form
  initForm(item){
    this.formVoucher = new FormGroup({
      _id: new FormControl(item._id),
      name: new FormControl(item.name, [
        Validators.required
      ]),
      points: new FormControl(item.units[0].points, [
        Validators.required
      ]),
      price: new FormControl(item.units[0].price),
      unit: new FormControl(item.units[0].unit, [
        Validators.required
      ]),
      price_origin: new FormControl(item.units[0].price_origin, [
        Validators.required
      ]),
      type: new FormControl(item.type),
      products: new FormControl(item.products, Validators.required)
    })
  }
  
  // Get data formVoucher
  get name() { return this.formVoucher.get('name') }
  get points() { return this.formVoucher.get('points') }
  get price() { return this.formVoucher.get('price') }
  get priceOrigin() { return this.formVoucher.get('price_origin') }
  get unit() { return this.formVoucher.get('unit') }
  /**
   * cập nhật voucher theo trường truyền vào
   */
  editVoucher(field: string, object) {
    if (this.formVoucher.valid && parseFloat(this.price_origin.getRawValue()) >= this.total) {
      this.vhQueryAutoWeb.updateVoucher(this.formVoucher.value._id, object).then((bool) => {
        console.log('updateVouchers', bool);
        this.message.success(this.languageService.translate('cap_nhat_thanh_cong'));
      }, error => {
        this.message.error(this.languageService.translate('cap_nhat_khong_thanh_cong'));
      })
    } else {
      this.message.error(this.languageService.translate('gia_niem_yet_phai_lon_hon_hoac_bang_tong_gia_ban'));
    }
  }
  /**
   * cập nhật trường products và units của voucher
   */
  updateVoucherByField(value) {
    this.vhQueryAutoWeb.updateVoucher(this.formVoucher.value._id, value).then((bool) => {
      console.log('updateVouchers', bool);
    }, error => {
      this.message.error(this.languageService.translate('co_loi_xay_ra_vui_long_thu_lai'));
    })
  }
  deleteVoucher() {
    this.vhQueryAutoWeb.deleteVoucher(this.data._id)
      .then((rsp: any) => {
        console.log('deleteVoucher', rsp);
        if (rsp.vcode == 0) {
          //phát thông báo xóa thành công
          this.message.success(this.languageService.translate('xoa_thanh_cong'));
          this.goBack();
        } else if (rsp.vcode == 1) {
          //phát thông báo lý do xóa ko thành công (dùng câu từ dễ hiểu với khách hàng)
          this.message.error(this.languageService.translate('xoa_khong_thanh_cong_do_voucher_da_duoc_phat_hanh_vui_long_xoa_dot_phat_hanh_lien_quan'))
        }
      }, error => {
        console.log('error', error);
      })
  }
  /**
   * tính lại tổng tiền của sp trong voucher
   */
  cardPrice() {
    this.total = 0;
    this.show_product.forEach((element) => {
      this.total = this.total + (element.price * element.quantity)
    });
    this.updateVoucherByField({products : this.show_product, units:[{price : this.total, default : true,ratio: 1,points : this.formVoucher.value.points, price_origin : this.total*1.1 , unit : this.formVoucher.value.unit}]})
  }
  /**
   * bắt sk thay đổi giá niêm yết của voucher(giá gốc voucher)
   */
  changePriceForm() {
    this.price_origin = this.vhAlgorithm.vhnumeral('.price_origin');
  }
  /**
   * bắt sk thay đổi giá của sp trong voucher
   */
  changePriceItemCard(item, index) {
    if (item) {
      let price: string = this.editPrice['product-' + index].getRawValue()
      item.price = price ? parseFloat(price) : item.price_origin
    }
    this.cardPrice()
  }
  goBack() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }
}
