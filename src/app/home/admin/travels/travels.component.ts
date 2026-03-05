import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { FunctionService } from 'vhobjects-service';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-travels',
  templateUrl: './travels.component.html',
  styleUrls: ['./travels.component.scss'],
})
export class TravelsComponent implements OnInit {
  public travelList: any[] = []; // Danh sách travel
  public showTravels: any = []; // Danh sách travel hiển thị
  public pageCurrent: number = 1; // Trang hiện tại
  public totalPages: number = 1; // Tổng số page của travel
  public limit: number = 10; // giới hạn travel trên 1 trang
  public listNumbersPage: number[] = []; // Danh sách số lượng page
  public searchNameTravel: string = ''; // Dùng tìm kiếm travel
  public pageShowChoose: any = [0, 1, 2]; /** Số trang hiển thị = */
  public pageGoto: number = 1; /** Trang người dùng chuyển tới hiển thị = */
  public isASC: boolean = true; // true. A->Z, false. Z->A
  public travelActionList: any[] = []; // Biến dùng để chứa các travel đã chọn để xóa hàng loạt
  public categories: Array<any> = [];
  public tableHeight: string; // biến dùng để chứa chiều cao của bảng dữ liệu
  id_category = ''; // get những sp theo danh mục
  loading = false; // biến ẩn hiện loading ở table của sp khi get dữ liệu
  isVisibleAddTravelComponent = false;
  isVisibleEditTravelComponent = false;
  constructor(
    private vhComponent: VhComponent,
    public vhAlgorithm: VhAlgorithm,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    private changeDetectorRef: ChangeDetectorRef,
    private languageService : LanguageService
  ) {}

  ngOnInit(): void {
    this.getCategory();
  }

  ngOnDestroy(): void {}

  trackByFn(index: number, item: any) {
    return item.id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (
        document.querySelector('#purchase-invoice-today') &&
        document.querySelector('.ant-table-thead') &&
        document.querySelector('.purchase-invoice-today-header')
      ) {
        this.tableHeight =
          document.querySelector('#purchase-invoice-today').clientHeight -
          document.querySelector('.ant-table-thead').clientHeight -
          document.querySelector('.purchase-invoice-today-header').clientHeight -
          100 +
          'px';
      }
      this.changeDetectorRef.detectChanges();
    }, 0);
  }

  /** hàm này get danh sách category để chọn xem sp theo danh mục
   *
   * @example this.getCategory()
   */
  getCategory() {
    this.vhQueryAutoWeb.getCategorys_byFields({}).then((res: any) => {
      this.categories = res.data.map((e) => {
        return {
          ...e,
          array_step: Array(e.step)
            .fill(0)
            .map((_, i) => i),
        };
      });
    });
  }

  /** Hàm thực hiện lấy danh sách travel
   *
   * @param pageCurrent trang hiện tại
   */
  getTravels(sort) {
    if (!this.id_category) {
      this.vhComponent.alertMessageDesktop(
        'warning',
        this.languageService.translate('vui_long_chon_danh_muc_travel')
      );
      return;
    }
    this.loading = true;
    let promise =
      this.id_category == 'all'
        ? this.vhQueryAutoWeb.getProducts_byFields(
            { type: { $eq: 51 } },
            {},
            sort,
            this.limit,
            this.pageCurrent
          )
        : this.vhQueryAutoWeb.getProducts_byFields(
            { id_categorys: { $all: [this.id_category] }, type: { $eq: 51 } },
            {},
            sort,
            this.limit,
            this.pageCurrent
          );
    promise.then((responseTravels: any) => {
      let travels = responseTravels.data;
      travels.forEach((travel) => {
        if (travel.units) {
          travel.unitDefault = travel.units.find(
            (item) => item.default == true
          );
        }
        // Cập nhật chuỗi tên danh mục
        const name = Array.isArray(travel.id_category)
          ? travel.id_category.map((idCate) => {
              if (idCate === '') {
                return 'Trống';
              } else {
                return this.categories.find((find) => find._id === idCate)?.['name_' + this.functionService.selectedLanguageCode];
              }
            })
          : this.categories.find((find) => find._id === travel.id_category)?.['name_' + this.functionService.selectedLanguageCode];

        travel.category_name = name;
      });

      this.loading = false;
      this.travelList = this.showTravels = travels;
      this.totalPages = responseTravels.totalpages;
    });
  }

  /** Chuyển trang -----------------
   *
   * @param value
   */
  transferFn(value: number): void {
    this.pageCurrent = Number(value);
    this.pageGoto = Number(value);
    this.softTravels();
    // Thay đổi giá trị trang cho người dùng chọn
    if (this.pageCurrent < this.totalPages && this.pageCurrent > 1) {
      this.pageShowChoose = this.pageShowChoose.map((num, index) => {
        return (num = this.pageCurrent + index - 1);
      });
    } 
    else {
      this.pageShowChoose = this.pageShowChoose.map((_, index) => this.pageCurrent + index - 1);
    }
  }

  /** Chuyển trang đến trang trước
   *
   */
  gotoPreviousPage() {
    if (this.pageCurrent > 1) {
      this.transferFn(this.pageCurrent - 1);
    } else if (this.pageCurrent == 1) {
      this.transferFn(this.totalPages);
    }
  }

  /** Chuyển trang đến trang sau
   *
   */
  gotoNextPage() {
    if (this.pageCurrent < this.totalPages) {
      this.transferFn(this.pageCurrent + 1);
    } else if ((this.pageCurrent = this.totalPages)) {
      this.transferFn(1);
    }
  }

  /**Sắp xếp travel theo thứ tự
   *
   */
  softTravels() {
    if (!this.isASC) {
      this.getTravels({ name: -1 });
    } else {
      this.getTravels({ name: 1 });
    }
  }

  /** Hàm thực hiện mở popup thêm travel
   *
   */
  addTravelFn(): void {
    this.isVisibleAddTravelComponent = true;
  }

  /** Hàm thực hiện mở popup edit với id
   *
   * @param travel: dữ liệu travel được truyền cho popup
   */
  dataEditTravel: any;
  editTravel(travel): void {
    this.dataEditTravel = travel;
    this.isVisibleEditTravelComponent = true;
  }

  /** Hàm thực hiện xác nhận xóa travel và thực hiện xóa travel
   *
   * @param travel
   */
  deleteTravel(travel) {
    this.vhComponent
      .alertConfirm('', `${this.languageService.translate('xoa_travel')}`, travel.name,`${this.languageService.translate('dong_y')}`, `${this.languageService.translate('thoat')}`)
      .then(
        (ok) => {
          if (ok == 'OK') {
            this.vhQueryAutoWeb.deleteProduct(travel._id).then(
              (res: any) => {
                console.log('res', res);
                if (res.vcode === 0) {
                  this.showTravels = this.showTravels.filter(
                    (item) => item._id != travel._id
                  );
                  this.functionService.createMessage(
                    'success',
                    this.languageService.translate('xoa_travel_thanh_cong')
                  );
                }
                if (res.vcode === 11) {
                  this.functionService.createMessage(
                    'error',
                    this.languageService.translate('phien_dang_nhap_da_het_han_vui_long_dang_nhap_lai')
                  );
                }
              },
              (error) => {
                this.functionService.createMessage(
                  'error',
                  this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_xoa_du_lieu_vui_long_thu_lai')
                );
              }
            );
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  /** Hàm thực hiện cập nhật trạng thái travel
   *
   * @param item
   * @param objectUpdate
   */
  updateHiddenTravel(item, objectUpdate) {
    this.vhQueryAutoWeb
      .updateProduct(item._id, objectUpdate)
      .then((res: any) => {
        console.log('res', res);
        if (res.vcode === 0) {
          this.functionService.createMessage(
            'success',
            this.languageService.translate('cap_nhat_travel_thanh_cong')
          );
        }
        if (res.vcode === 11) {
          this.functionService.createMessage(
            'error',
            this.languageService.translate('phien_dang_nhap_da_het_han')
          );
        }
      })
      .catch((err) => {
        this.functionService.createMessage(
          'error',
          this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_cap_nhat_du_lieu')
        );
      });
  }

  keyupSearch() {
    if (this.searchNameTravel == '') this.onSearchTravel(this.pageCurrent);
  }

  onSearchTravel(pageCurrent?): void {
    this.functionService.createMessage('warning', 'Đang chờ hàm search của backend');
    // if (this.searchNameTravel !== '') {
    //   this.vhQueryAutoWeb
    //     .searchList(
    //       'product',
    //       ['name'],
    //       this.searchNameTravel,
    //       {name : 1}
    //     )
    //     .then((result: any) => {
    //       if (result.vcode === 0) {
    //         let travels = result.data.filter((item) => item.type === 1);
    //         travels.forEach((travel) => {
    //           // Cập nhật chuỗi tên danh mục
    //           const name = Array.isArray(travel.id_category)
    //             ? travel.id_category
    //                 .map(
    //                   (idCate) =>
    //                     this.categories.find((find) => find._id === idCate)
    //                       ?.name
    //                 )
    //                 .join(', ')
    //             : this.categories.find(
    //                 (find) => find._id === travel.id_category
    //               )?.name;

    //           travel.category_name = name;
    //         });

    //         this.showTravels = travels;
    //         this.totalPages = result.totalpages;
    //       }
    //     });
    // } else {
    //   this.softTravels();
    // }
  }

  handleCancelEditTravelComponent() {
    this.isVisibleEditTravelComponent = false;
    if (this.id_category) {
      this.softTravels();
    }
  }

  handleCancelAddtravelComponent() {
    this.isVisibleAddTravelComponent = false;
  }

  handleOkAddtravelComponent() {
    this.isVisibleAddTravelComponent = false;
  }

  submitAddTravel(e) {
    this.handleOkAddtravelComponent();
    if (this.id_category) {
      this.softTravels();
    }
  }

  generateSymBol(array: []) {
    let string = '';
    array.forEach((_) => {
      string = string + `- `;
    });
    return string;
  }
}
