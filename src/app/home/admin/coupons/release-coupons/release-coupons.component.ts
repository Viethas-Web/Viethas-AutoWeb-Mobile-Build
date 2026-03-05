import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-release-coupons',
  templateUrl: './release-coupons.component.html',
  styleUrls: ['./release-coupons.component.scss']
})
export class ReleaseCouponsComponent implements OnInit {
  public id_subproject: any; // id dự án
  public tableHeight: string; // biến dùng để chứa chiều cao của bảng dữ liệu.
  public isASC: boolean = true; // true. A->Z, false. Z->A
  isOpenComponent: boolean = false; // biến này xác định component nào hiển hoặc ẩn
  visible: boolean = false; // biến này xác định modal sẽ ẩn hay hiển
  /** biến ẩn hiện loading ở table khi get dữ liệu */
  loading = false 
  list_vouchers = [];
  itemEditing: any; // biến này truyền item khi click chỉnh sửa item
  listVoucherSearch:any = []
  searchVoucher: any = '';
  date = [new Date(), new Date()];
  showFilter = false;
  date_query: any = '';
  constructor( 
    private message: NzMessageService,
    public vhAlgorithm: VhAlgorithm,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private languageService: LanguageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
  }

  // Get dữ liệu coupon
  getCouponRealease() {
    this.searchVoucher = '';
    let query = {}
    if (this.date_query) {
      query = {
        ...query,
        [this.date_query]: {
          $gte: new Date(this.date[0].setHours(0, 0, 0, 0)).toISOString(),
          $lte: new Date(this.date[1].setHours(23, 59, 59, 999)).toISOString()
        }
      }
    }
    this.vhQueryAutoWeb.getCouponReleases_byFields(query)
    .then((voucher_releases: any) => {
      if (voucher_releases.vcode == 0) {
        this.list_vouchers = voucher_releases.data;
        this.listVoucherSearch = voucher_releases.data;
      }
    })
  }
  // Nhận giá trị trả về khi add coupon release
  isAdd(event) {
    console.log('event', event);
    if(!event) return;  
    this.list_vouchers = [...this.list_vouchers, event];
  }
  isEdit(event) {
    if(!event) return;
    this.list_vouchers = this.list_vouchers.map(e => {
      if(e._id == event._id) {
        return event;
      }
      return e;
    })
  }

  // Show modal add
  showModalAdd(): void {
    this.visible = true;
    this.isOpenComponent = true;
  }
  // Show modal edit
  showModalEdit(event, item) {
    event.stopPropagation();
    this.itemEditing = item;
    this.visible = true;
    this.isOpenComponent = false;
  }
  // Đóng modal
  closeModal(event) {
    this.visible = event;
  }
  // Thông báo trạng thái
  cancel(): void {
  }

  confirm(item): void {
    this.vhQueryAutoWeb.deleteCouponRelease(item._id)
      .then((rsp: any) => {
        if (rsp.vcode == 0) {
          //phát thông báo xóa thành công
          this.message.success(this.languageService.translate('xoa_thanh_cong'));
          this.list_vouchers = this.list_vouchers.filter(e => e._id != item._id);
        } else if (rsp.vcode == 1) {
          //phát thông báo lý do xóa ko thành công (dùng câu từ dễ hiểu với khách hàng)
          this.message.error(this.languageService.translate('xoa_khong_thang_cong'));
        }
      }, error => {
        console.log('error', error);
      })
  }
  /**Sắp xếp coupon theo thứ tự
  */
  nameCol = false;
  sortProducts(colName) {
    if (this.nameCol) {
      this.list_vouchers = this.vhAlgorithm.sortVietnamesebyASC([...this.list_vouchers], colName);
    } else {
      this.list_vouchers = this.vhAlgorithm.sortVietnamesebyDESC([...this.list_vouchers], colName);
    }
  }

  onSearchVoucher(key) {
    let tempVal: string = key.toLowerCase();
    if (key.length) {
      this.list_vouchers = this.vhAlgorithm.searchList(
        this.vhAlgorithm.changeAlias(tempVal),
        this.listVoucherSearch, ["name"]
      );
    } else {
      this.list_vouchers = this.listVoucherSearch
    }
  }

  filterDate() {
    if (this.date[0] && this.date[1]) {
      this.list_vouchers = this.list_vouchers.filter(voucher => {
        const voucherDate = new Date(voucher.date); // Giả sử thuộc tính ngày là 'date'
        return voucherDate >= this.date[0] && voucherDate <= this.date[1];
      });
    }
  }

  viewDetail(data) { 
    this.router.navigate(['detail-coupon'], { relativeTo: this.route, state: { ...data, id_coupon_release: data._id }});
  }
}
