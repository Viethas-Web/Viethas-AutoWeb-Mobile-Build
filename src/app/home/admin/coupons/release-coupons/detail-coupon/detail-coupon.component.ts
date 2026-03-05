import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from 'src/app/services/language.service';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FunctionService } from 'vhobjects-service';
@Component({
  selector: 'app-detail-coupon',
  templateUrl: './detail-coupon.component.html',
  styleUrls: ['./detail-coupon.component.scss']
})
export class DetailCouponComponent implements OnInit {
  public tableHeight: string; // biến dùng để chứa chiều cao của bảng dữ liệu
  loading_product = false // biến ẩn hiện loading ở table của sp khi get dữ liệu
  list_show_coupons = [];
  coupons = [];
  list_data = [];
  isVisible = false;
  root: any;
  id_subproject = ''
  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService,
    public vhAlgorithm: VhAlgorithm,
    private languageService : LanguageService,
    private functionService: FunctionService
  ) {
    this.root = this.router.getCurrentNavigation()?.extras.state;
    this.route.params.subscribe((routeParam) => {
      this.id_subproject = routeParam.id_project;
      console.log(routeParam);
    });
  }

  ngOnInit(): void {
    this.getListCoupon();
  }
  getListCoupon() {
    Promise.all([
      this.vhQueryAutoWeb.getCouponReleaseDetails_byIdCouponRelease(this.root?.id_coupon_release),
      this.vhQueryAutoWeb.getCoupons_byFields({}, {}, {}, 0),
    ])
      .then(([release_details, coupons]: any) => {
        this.coupons = coupons.data;
        this.list_data = release_details?.data.map(item => { 
          return { ...item, coupon_name: this.coupons.find(ele => ele._id == item.id_coupon)?.name, value: this.coupons.find(ele => ele._id == item.id_coupon)?.units[0].value, id_design_barcode: this.coupons.find(ele => ele._id == item.id_coupon)?.id_design_barcode } 
        });
      })
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  showModal(): void {
    this.list_show_coupons = this.coupons.filter(ele => !this.list_data.find(i => i.id_coupon == ele._id)).map((item)=>{
      return { label: item.name, name: item.name, id: item._id, value: item.units[0].value }
    })
    this.isVisible = true;
  }

  handleOk(): void {
    this.functionService.showLoading('transparent');
    let arr = this.list_show_coupons.filter(item => item.checked);
    this.isVisible = false;
    let promise = new Array();
    for (let i in arr) {
      promise[i] = this.vhQueryAutoWeb.addCouponReleaseDetail({
        id_coupon: arr[i].id,
        id_coupon_release: this.root.id_coupon_release,
        quantity_released: 0
      })
    }
    // this.vhQuery.asyncPromiseAll(promise).then((array) => {
    //   this.list_data = this.list_data.concat(arr.map((item, index) => {
    //     return {
    //       name: item.label, _id: array[index].data._id, quantity_released: 0, value: item.value, coupon_name: item.label, id_coupon: array[index].data.id_coupon,
    //       id_coupon_release: this.root.id_coupon_release, id_design_barcode: item.id_design_barcode
    //     }
    //   }))
    //   this.functionService.hideLoading();
    // },
    //   error => { 
    //     console.log(error);
    //     this.functionService.hideLoading();
    //    })
    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
  }
  removeDetail(data){
    this.vhQueryAutoWeb.deleteCouponReleaseDetail(data._id)
    .then((rsp: any)=>{
      if(rsp.vcode == 0){
       //phát thông báo xóa thành công
       this.list_data = this.list_data.filter(item => item._id != data._id)
       this.message.success(this.languageService.translate('xoa_thanh_cong'));
      }else if(rsp.vcode == 1){
       //phát thông báo lý do xóa ko thành công (dùng câu từ dễ hiểu với khách hàng)
       this.message.error(this.languageService.translate('xoa_khong_thanh_cong'))
      }
      }, error=>{
      console.log('error', error);
      })
  }
  cancel(){
    //-------\\
  }
  /**Sắp xếp coupon theo thứ tự
   */
  nameCol = false;
  sortProducts(){
    if(this.nameCol){
      this.list_data = this.vhAlgorithm.sortVietnamesebyASC([...this.list_data],'coupon_name')
    }else{
      this.list_data = this.vhAlgorithm.sortVietnamesebyDESC([...this.list_data],'coupon_name')
    }
  }

  releaseCoupon(item) {
    this.router.navigate(['coupon-code'], { relativeTo: this.route, state: {...item, name: this.root.name, date_validity : this.root.date_validity, date_expire : this.root.date_expire} });
  }
}
