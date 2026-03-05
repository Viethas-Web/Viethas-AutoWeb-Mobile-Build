import { Component, OnInit, SimpleChanges } from '@angular/core';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-list-coupons',
  templateUrl: './list-coupons.component.html',
  styleUrls: ['./list-coupons.component.scss']
})
export class ListCouponsComponent implements OnInit {
  tableHeight: string; // biến dùng để chứa chiều cao của bảng dữ liệu
  list_coupons = []; 
  visible = false; // Biến này xác định drawer sẽ ẩn hay hiện
  isOpenComponent: boolean = false; // Biến này xác định component nào được hiện hoặc ẩn
  isAdded: boolean = false; // Biến này bắt sự kiện từ child trả về true mỗi khi thêm mới
  isEdited: boolean = false;// Biến này bắt sự kiện từ child trả về true mỗi khi cập nhật
  editValueCoupon = {};
  keySearch:any = ''
  list_coupons_search = [];
  isASC: boolean = true; // true. A->Z, false. Z->A
  /** biến ẩn hiện loading ở table của sp khi get dữ liệu */
  loading = false 
  constructor(private vhQueryAutoWeb: VhQueryAutoWeb,
    private message: NzMessageService,
    public vhAlgorithm: VhAlgorithm,
    public languageService : LanguageService
  ) { }

  ngOnInit(): void {
  }
  // Lấy giá trị đã thêm coupon
  getValueCoupon(){
    this.loading = true;
    this.vhQueryAutoWeb.getCoupons_byFields({},{},{},0)
    .then((rsp: any)=>{
      console.log(rsp);
      if(rsp.vcode == 0){
        this.list_coupons = rsp.data;
        this.list_coupons_search = rsp.data;
      }else if(rsp.vcode == 11){
        //phát thông báo lý do không lấy dữ liệu về được
      }
    }, error=>{
      // console.log('error', error);
    })
    .finally(()=>{
      this.loading = false;
    })
  }
  isAdd(event){
    if(!event) return;
    this.list_coupons = [...this.list_coupons, event];
  }
  isEdit(event){
    if(!event) return;
    this.list_coupons = this.list_coupons.map(item=> item._id == event._id ? event : item);
  }
  // Chỉnh sửa coupon
  editCoupon(item){
    this.editValueCoupon =item;
    this.visible = true;
    this.isOpenComponent = true;
  }
  // Xóa coupon
  deleteCoupon(item){
    this.vhQueryAutoWeb.deleteCoupon(item._id)
    .then((rsp: any)=>{
      if(rsp.vcode == 0){
       //phát thông báo xóa thành công
       this.message.success(this.languageService.translate('xoa_thanh_cong'));
       this.getValueCoupon();
      }else if(rsp.vcode == 1){
       //phát thông báo lý do xóa ko thành công (dùng câu từ dễ hiểu với khách hàng)
       this.message.error(this.languageService.translate('coupon_nay_da_duoc_phat_hanh'));
      }
      }, error=>{
      console.log('error', error);
      })
  }
  // Mở drawer
  open(): void {
    this.visible = true;
    this.isOpenComponent = false;
  }
  // Đóng drawer
  close(): void {
    this.visible = false;
  }
  closeDrawer(event){
    this.visible = event;
  }
  // Hiện thi thông báo 
  cancel(): void {
  }
   /** hàm sort cho các cột */
   nameCol = false;
   valueCol = false;
   pointsCol = false
  /**Sắp xếp coupon theo thứ tự
   *  @param type: name,costs,point
   */
  sortProducts(colName) {
    switch (colName) {
      case 'name':
        if (this.nameCol) {
          this.list_coupons = this.vhAlgorithm.sortVietnamesebyASC([...this.list_coupons], colName);
        } else {
          this.list_coupons = this.vhAlgorithm.sortVietnamesebyDESC([...this.list_coupons], colName);
        }
        break;
      case 'points':
        if (this.pointsCol) {
          this.list_coupons = this.vhAlgorithm.sortNumberbyASC([...this.list_coupons], colName);
        } else {
          this.list_coupons = this.vhAlgorithm.sortNumberbyDESC([...this.list_coupons], colName);
        }
        break;
      case 'value':
        if (this.valueCol) {
          this.list_coupons = this.vhAlgorithm.sortNumberbyASC([...this.list_coupons], colName);
        } else {
          this.list_coupons = this.vhAlgorithm.sortNumberbyDESC([...this.list_coupons], colName);
        }
        break;
    }
  }

  search_Coupon(key) {
    let tempVal: string = key.toLowerCase();
    if (key.length) {
      this.list_coupons = this.vhAlgorithm.searchList(
        this.vhAlgorithm.changeAlias(tempVal),
        this.list_coupons_search, ["name"]
      );
    } else {
      this.list_coupons = this.list_coupons_search
    }
  }
}
