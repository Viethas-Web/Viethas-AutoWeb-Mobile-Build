import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { FunctionService } from 'vhobjects-service';
import { LanguageService } from 'src/app/services/language.service';
import { AddSnimeiComponent } from './add-snimei/add-snimei.component';
import { EditSnimeiComponent } from './edit-snimei/edit-snimei.component';
import { ImportDataByExcelComponent } from './import-data-by-excel/import-data-by-excel.component';
@Component({
  selector: 'app-snimei',
  templateUrl: './snimei.component.html',
  styleUrls: ['./snimei.component.scss']
})
export class SnimeiComponent implements OnInit {
  /**Dùng tìm kiếm sản phẩm */
  keySearch: string = ''; 
  /** danh sách danh mục để lọc */
  categories: Array<any> = [];
  /** biến dùng để chứa chiều cao của bảng dữ liệu */
  tableHeight: string; 
  /** lọc theo lookup */
  lookupGroup: any = 'all' 
  /** mảng lookupGroup để lọc */
  lookupGroupArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  /** lọc theo ngày */
  date = [new Date(), new Date()] // biến gán mảng chọn ngày xem dữ liệu
  /** trường sẽ lọc */
  date_query: '' | 'date_created' | 'warehouse_release_date' | 'active_date' = '';
  /**biến để ẩn/hiện modal chọn loại ngày filter */
  isVisible = false 
  /** mảng chưa danh sách sp search */  
  dataSearched: any  = [] 
  /** Danh sách sản phẩm hiển thị */
  snimeis: any = []; // 
  /** biến ẩn hiện loading ở table của sp khi get dữ liệu */
  loading = false;  
  /** Mảng chứa số lượng sản phẩm hiển thị trong 1 trang */
  numberPerPage = [5, 10, 20, 50, 100]; 
  /* Biến này truyền vào hàm để sort */
  sort: any = { name: 1 };
  /* Biến này hiển thị ở html xem sort theo trường nào */
  sortby: any = { 
    date_created: false,
    sn_imei: false,
    lookup_group: false,
    active: false,
    warehouse_release_date: false,
    active_date: false,
    expiration_date: false
  };

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
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void { }

  trackByFn(index: number, item: any) {
    return item._id; // hoặc sử dụng một thuộc tính duy nhất khác của item
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


  /** Hàm thực hiện lấy danh sách sản phẩm
   *
   * @param
   */
  getSNIMEIs() {
    this.loading = true;
    this.keySearch = '';
    let query = {}
    if (this.lookupGroup != 'all') {
      query = {
        lookup_group: { $eq: this.lookupGroup },
      }
    }
    else query = {
    }
    if (this.date_query) {
      query = {
        ...query,
        [this.date_query]: { $gte: new Date(this.date[0].setHours(0, 0, 0)).toISOString(), $lte: new Date(this.date[1].setHours(23, 59, 59, 59)).toISOString() }
      }
    }
    this.vhQueryAutoWeb.getSNIMEIs_byFields_byPages(
      query,
      {},
      this.sort,
      this.limit,
      this.pageCurrent
    )
      .then((res: any) => {
        console.log(res);
        this.snimeis = res.data;
        this.totalPages = res.totalpages;

        // new Event('resize') tạo ra một event có type = "resize".
        // Khi phát đi, tất cả các listener đang lắng nghe sự kiện resize của window sẽ được gọi.
        // height lúc chưa load sản phẩm sẽ khác height sau khi load sản phẩm xong nên cần trigger lại sự kiện resize để virtual scroll hoạt động chính xác
        window.dispatchEvent(new Event('resize'));
      })
      .catch((error) => console.error(error))
      .finally(() => this.loading = false);
  }

  /** Hàm thực hiện mở popup thêm sản phẩm
   *
   */
  openModalAdd(): void {
    this.keySearch = ''
    const dialogRef = this.dialog.open(AddSnimeiComponent, {
      width: '80vw',
      height: '70vh',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.functionService.languageTempCode = this.functionService.selectedLanguageCode;
      if (result) {
        this.snimeis = [...this.snimeis, result];
      }
    });
  }

  /** Hàm thực hiện mở popup edit với id
   *
   * @param data: dữ liệu snimei truyền cho popup
   */
  dataEditProduct: any;
  editProduct(data): void {
    const dialogRef = this.dialog.open(EditSnimeiComponent, {
      width: '80vw',
      height: '70vh',
      disableClose: true,
      data: data
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.functionService.languageTempCode = this.functionService.selectedLanguageCode;
      if (result) {
        this.snimeis = this.snimeis.map((item) => item._id === result._id ? result : item);
      }
    });
  }

  /** Hàm thực hiện xác nhận xóa sản phẩm và thực hiện xóa sản phẩm
   *
   * @param snimei
   */
  deleteProduct(snimei) {
    this.vhComponent
      .alertConfirm('', this.languageService.translate('xoa_snimei_nay'), snimei['name_' + this.functionService.selectedLanguageCode], this.languageService.translate('dong_y'), this.languageService.translate('thoat'))
      .then(
        (ok) => {
          if (ok == 'OK') {
            this.vhQueryAutoWeb.deleteSNIMEI(snimei._id).then(
              (res: any) => {
                if (res.vcode === 0) {
                  this.snimeis = this.snimeis.filter((item) => item._id != snimei._id);
                  this.functionService.createMessage('success', this.languageService.translate('xoa_san_pham_thanh_cong'));
                }
                if (res.vcode === 11) {
                  this.functionService.createMessage('error', this.languageService.translate('phien_dang_nhap_da_het_han'));
                }
              },
            )
              .catch((error) => {
                console.error(error.message);
              })
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  onSearch(): void {
    this.loading = true;
    this.lookupGroup = 'all';
    this.date = [new Date(), new Date()]
    this.resetPagination();
    this.vhQueryAutoWeb.searchList_likeSearch('snimeis', 'sn_imei', this.keySearch?.toString(), {}, {})
      .then((res: any) => {
        console.log('res', res);
        if (res.vcode === 0) {
          this.dataSearched = res.data;
          this.handlePaginateLocal();
        }
      }, (error: any) => {
        console.log('error', error)
      })
      .finally(() => this.loading = false);
  }

  openModalImportExcel(): void {
    const dialogRef = this.dialog.open(ImportDataByExcelComponent, {
      width: '80vw',
      height: '90vh',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.functionService.languageTempCode = this.functionService.selectedLanguageCode;
      if (result) {
        this.snimeis = this.snimeis.concat(result) 
      }
    });
  }


  // Hàm sort cho các cột  
  handleSort(field) {
    this.sortby[field] = !this.sortby[field];
    this.sort = { 
      [field]: this.sortby[field] ? 1 : -1 
    };


    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }else {
      this.getSNIMEIs();
    }
  }

  getProductOrder(colName: string, value: boolean) {
    return value ? { [colName]: 1 } : { [colName]: -1 };
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
    let data_filter = this.lookupGroup == 'all' ? this.dataSearched : this.dataSearched.filter(item => item.lookup_group == this.lookupGroup)
    switch (true) {
      case this.sort.hasOwnProperty('date_created') :
        data_filter = this.sort.date_created == 1 ?  this.vhAlgorithm.sortDatebyASC(data_filter, 'date_created') : this.vhAlgorithm.sortDatebyDESC(data_filter, 'date_created')
        break;
      case this.sort.hasOwnProperty('expiration_date') :
        data_filter = this.sort.expiration_date == 1 ?  this.vhAlgorithm.sortDatebyASC(data_filter, 'expiration_date') : this.vhAlgorithm.sortDatebyDESC(data_filter, 'expiration_date')
        break;
      case this.sort.hasOwnProperty('active_date'):
        data_filter = this.sort.active_date == 1 ?  this.vhAlgorithm.sortDatebyASC(data_filter, 'active_date') : this.vhAlgorithm.sortDatebyDESC(data_filter, 'active_date')
        break;
      case this.sort.hasOwnProperty('warehouse_release_date'):
        data_filter = this.sort.warehouse_release_date == 1 ?  this.vhAlgorithm.sortDatebyASC(data_filter, 'warehouse_release_date') : this.vhAlgorithm.sortDatebyDESC(data_filter, 'warehouse_release_date')
        break;
      case this.sort.hasOwnProperty('sn_imei') :
        data_filter = this.sort.sn_imei == 1 ?  this.vhAlgorithm.sortStringbyASC(data_filter, 'sn_imei') : this.vhAlgorithm.sortStringbyDESC(data_filter, 'sn_imei')
        break;
      case this.sort.hasOwnProperty('active'):
        data_filter = this.sort.active == 1 ?  this.vhAlgorithm.sortNumberbyASC(data_filter, 'active') : this.vhAlgorithm.sortNumberbyDESC(data_filter,'active')
        break;
      case  this.sort.hasOwnProperty('lookup_group'):
        data_filter = this.sort.lookup_group == 1 ?  this.vhAlgorithm.sortNumberbyASC(data_filter, 'lookup_group') : this.vhAlgorithm.sortNumberbyDESC(data_filter, 'lookup_group')
        break;
    }

    let data_page = new Array(); //mảng dữ liệu phân theo page
    for (let i = 0; i < data_filter.length; i++) {
      if ((i >= this.limit * (this.pageCurrent - 1)) && (i < this.limit * this.pageCurrent)) data_page.push(data_filter[i]);
    }
    this.totalPages = Math.ceil(data_filter.length / this.limit); // tổng số page
    this.snimeis = data_page;
  }

  /** pageCurrent thay đổi */
  pageIndexChange(event) {
    this.pageCurrent = event;
    if (this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }
    else 
      this.getSNIMEIs();
  }

  /** limit thay đổi */
  limitChange(event) {
    this.resetPagination();
    this.limit = event;
    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    } else {
      this.getSNIMEIs()
    }
  }
}
