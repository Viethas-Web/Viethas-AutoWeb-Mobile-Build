import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { FunctionService } from 'vhobjects-service'; 
import { LanguageService } from 'src/app/services/language.service';
import { JsonDataService } from 'src/app/services/json-data.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AddHostingRenewalPackageComponent } from './add-hosting-renewal-package/add-hosting-renewal-package.component';
import { EditHostingRenewalPackageComponent } from './edit-hosting-renewal-package/edit-hosting-renewal-package.component';

@Component({
  selector: 'app-hosting-renewals',
  templateUrl: './hosting-renewals.component.html',
  styleUrls: ['./hosting-renewals.component.scss']
})
export class HostingRenewalsComponent implements OnInit {
/** danh sách tải khoản ngân hàng để hiển thị */
  hostingRenewalPackage: any[] = [];
  /** danh sách chi nhánh */
  branchs: any[] = []
  /** mảng chưa danh sách sp search */  
  dataSearched: any  = [] 
  /** biến ẩn hiện loading ở table của sp khi get dữ liệu */
  loading = false;  
  /* Biến này truyền vào hàm để sort */
  sort: any = { price: 1 };
  /**Dùng tìm kiếm sản phẩm */
  keySearch: string = ''; 
  /* Biến này hiển thị ở html xem sort theo trường nào */
  sortby: any = { 
    name: false,
  };
  tableHeight: string;
  banks: any[] = [];

  /** ------------------------Pagination------------------------ */
  /** Trang hiện tại */
  pageCurrent: number = 1;
  /** Tổng số trang */
  totalPages: number = 1;
  /** Số lượng bản ghi trên 1 trang */
  limit: number = 20;
  /** Số trang hiển thị = */
  pageShowChoose: any = [0, 1, 2]; 
  /** Trang đi đến  */
  pageGoto: number = 1;


  constructor(
    private vhComponent: VhComponent,
    public vhAlgorithm: VhAlgorithm,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef, 
    private languageService: LanguageService, 
  ) { }

  ngOnInit(): void {
    // this.vhQueryAutoWeb
    //   .getHosting_Packages_byFields_byPages(
    //     {},
    //     {},
    //     this.sort,
    //   )
    //   .then(
    //     (rsp: any) => {
    //       console.log(rsp);
    //       if (rsp.vcode === 0) {
    //         rsp.data.forEach(element => {
    //           this.vhQueryAutoWeb.deleteHosting_Package(element._id)
    //           .then((res:any) => {
    //             console.log(res);
    //           })
    //         });
    //       }
    //     },
    //     (error) => {
    //       console.error(error)
    //       this.functionService.createMessage('error','da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu_vui_long_thu_lai');
    //     }
    //   )
  }
  
  ngAfterViewInit(): void {
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
          105 +
          'px';
      }
      this.changeDetectorRef.detectChanges();
    }, 0);
  }



  /** Hàm thực hiện lấy danh sách danh mục
   *
   */
  getHostingRenewalPackage() {
    this.loading = true
    this.keySearch = ''
    let query = {}
    this.vhQueryAutoWeb
      .getHosting_Packages_byFields_byPages(
        query,
        {},
        this.sort,
        this.limit,
        this.pageCurrent
      )
      .then(
        (rsp: any) => {
          console.log(rsp);
          if (rsp.vcode === 0) {
            this.totalPages = rsp.totalpages;
            this.hostingRenewalPackage = rsp.data.map((item: any) => {
              return {
                ...item,
                defaultUnit: Array.isArray(item.units)
                  ? item.units.find((unit: any) => unit.default) || {}
                  : {},
              };
            });
          }
        },
        (error) => {
          console.error(error)
          this.functionService.createMessage('error','da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu_vui_long_thu_lai');
        }
      ).finally(() => this.loading = false)
  }

  /** Hàm thực hiện mở popup thêm danh mục
   *
   */
  addPackage(): void { 
    const dialogRef = this.dialog.open(AddHostingRenewalPackageComponent, {
      width: '60vw',
      height: '95vh',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.hostingRenewalPackage = [...this.hostingRenewalPackage, result]
      }
    });

  }

  /** Hàm thực hiện mở popup edit với id
   *
   * @param hostingPackage: dữ liệu danh mục được truyền cho popup
   */
  editPackage(hostingPackage): void {
    const hostingPackageClone = JSON.parse(JSON.stringify(hostingPackage))
    const dialogRef = this.dialog.open(EditHostingRenewalPackageComponent, {
      width: '60vw',
      height: '95vh',
      disableClose: true,
      data: {
        hostingPackage: hostingPackageClone, 
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.hostingRenewalPackage = this.hostingRenewalPackage.map((item) => item._id == result._id ? result : item)
      }
    });

  }

  deletePackage(hostingPackage) {
    this.vhComponent
      .alertConfirm('', this.languageService.translate('xoa_goi'), hostingPackage['name_' + this.functionService.selectedLanguageCode], this.languageService.translate('dong_y'), this.languageService.translate('thoat'))
      .then(
        (ok) => {
          if (ok == 'OK') {
            this.vhQueryAutoWeb.deleteHosting_Package(hostingPackage._id).then(
              (res: any) => {
                if (res.vcode === 0) {
                  this.functionService.createMessage(
                    'success',
                    'xoa_goi_thanh_cong'
                  );
                  this.hostingRenewalPackage = this.hostingRenewalPackage.filter(item => item._id !== hostingPackage._id)
                }
                if (res.vcode === 11) {
                  this.functionService.createMessage('error','phien_dang_nhap_da_het_han_vui_long_dang_nhap_lai');
                }
              },
              (error) => {
                console.error(error)
                this.functionService.createMessage('error','da_xay_ra_loi_trong_qua_trinh_xoa_du_lieu');
              }
            );
          }
        },
        (error) => {
          console.error(error);
        }
      );
  }

  onSearch(): void {
    this.resetPagination();
    this.vhQueryAutoWeb.searchList_likeSearch('hosting_package', 'name', this.keySearch, {}, {})
      .then((res: any) => {
        console.log('res', res);
        if (res.vcode === 0) {
          this.dataSearched = res.data;
          this.hostingRenewalPackage = this.dataSearched.map((e) => {
            return {
              ...e,
              array_step: Array(e.step)
                .fill(0)
                .map((x, i) => i),
            };
          });

           this.handlePaginateLocal();
        }
      }, (error: any) => {
        console.log('error', error)
      })
  }


  /**
   * hàm này reset pagination về 1
   */
  resetPagination() {
    this.pageCurrent = 1;
    this.pageGoto = 1;
    this.pageShowChoose = [0, 1, 2];
  }

  handlePaginateLocal() {
    let data_filter = this.dataSearched 
    const field = Object.keys(this.sort)[0]
    switch (field) {
      case 'acq_id': {
        data_filter = this.sortby[field] ?  this.vhAlgorithm.sortStringbyASC(data_filter, field)  : this.vhAlgorithm.sortStringbyDESC(data_filter, field)
        break;
      }
      case 'account_name': {
        data_filter = this.sortby[field] ?  this.vhAlgorithm.sortStringbyASC(data_filter, field)  : this.vhAlgorithm.sortStringbyDESC(data_filter, field)
        break;
      }
      case 'account_no': {
        data_filter = this.sortby[field] ?  this.vhAlgorithm.sortStringbyASC(data_filter, field)  : this.vhAlgorithm.sortStringbyDESC(data_filter, field)
        break;
      }
    }
    let data_page = new Array(); //mảng dữ liệu phân theo page
    for (let i = 0; i < data_filter.length; i++) {
      if ((i >= this.limit * (this.pageCurrent - 1)) && (i < this.limit * this.pageCurrent)) data_page.push(data_filter[i]);
    }
    this.totalPages = Math.ceil(data_filter.length / this.limit); // tổng số page
    this.hostingRenewalPackage = data_page
  }

  handleSort(field) {

    this.sortby[field] = !this.sortby[field];

    const sortField = field === 'price' ? 'units.price' : field;

    this.sort = { [sortField]: this.sortby[field] ? 1 : -1 }

    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }else {
      this.getHostingRenewalPackage();
    }
  }
  /** pageCurrent thay đổi */
  pageIndexChange(event) {
    this.pageCurrent = event;
    if (this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }
    else 
      this.getHostingRenewalPackage();
  }

  /** limit thay đổi */
  limitChange(event) {
    this.resetPagination();
    this.limit = event;
    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    } else {
      this.getHostingRenewalPackage()
    }
  }




}
