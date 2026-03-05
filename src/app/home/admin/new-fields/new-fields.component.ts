import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { FunctionService } from 'vhobjects-service';
import { AddNewFieldComponent } from './add-new-field/add-new-field.component';
import { EditNewFieldComponent } from './edit-new-field/edit-new-field.component';
import { LanguageService } from 'src/app/services/language.service';
import { JsonDataService } from 'src/app/services/json-data.service';
@Component({
  selector: 'app-new-fields',
  templateUrl: './new-fields.component.html',
  styleUrls: ['./new-fields.component.scss']
})
export class NewFieldsComponent implements OnInit {
  /** biến dùng để chứa chiều cao của bảng dữ liệu */
  tableHeight: string;
  /* Biến này hiển thị ở html xem sort theo trường nào */
  sortby: any = {
    field_lable: false,
    id_main_sector: false,
    field_order_number: false
  };
  /** danh sách main sector đê lọc */
  mainSectors = []
  /**Dùng tìm kiếm sản phẩm */
  keySearch: string = '';
  /** Lọc theo main sector*/
  idMainSector = 'all'
  /* Biến này truyền vào hàm để sort */
  sort: any = { name: 1 };
  /** mảng chưa danh sách sp search */
  dataSearched: any = []
  /** Danh sách trường tự tạo hiển thị */
  newFields: any[] = [];
  /** biến ẩn hiện loading ở table của sp khi get dữ liệu */
  loading = false;
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
    private jsonDataService: JsonDataService
  ) { }

  ngOnInit(): void {
    this.getMainSectors()
  }

  ngAfterViewInit(): void {
    // ko được để đoạn logic này trong ngAfterViewChecked vì sẽ gây lag
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


  getMainSectors() {
    this.jsonDataService.getMainSectors().subscribe((data) => {
      let subproject = this.vhQueryAutoWeb.getlocalSubProject(this.vhQueryAutoWeb.getlocalSubProject_Working()._id);
      data.forEach((element) => {
        if (subproject.main_sectors?.includes(element.value) && element.type)
          this.mainSectors.push(element)

        if (element.value == 'basic') this.mainSectors.push(element)
      });
    })
  }



  /** Hàm thực hiện lấy danh sách danh mục
   *
   */
  getNewFields() {
    this.loading = true;
    this.keySearch = ''
    let query = {}

    if (this.idMainSector != 'all') {
      query['id_main_sector'] = { $eq: this.idMainSector }
    }

    this.vhQueryAutoWeb
      .getNewFields_byFields_byPages(
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
            this.newFields = rsp.data
          }
        },
        (error) => {
          console.log(error);
          this.functionService.createMessage('error', this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu'));
        }
      ).finally(() => this.loading = false)
  }

  renderBussiness(main_sectors) {
    switch (main_sectors) {
      case 'basic':
        return 'Cơ bản';
      case 'contact':
        return 'Thông tin liên hệ';
      case 'member':
        return 'Thành viên mua sắm';
      case 'category':
        return 'Phân cấp theo danh mục';
      case 'ecommerce':
        return 'Sản phẩm mua bán';
      case 'food_drink':
        return 'Món ăn nước uống';
      case 'combo':
        return 'Nhóm sản phẩm (combo)';
      case 'news':
        return 'Tin tức - sự kiện';
      case 'webapp':
        return 'Thiết kế webapp';
      case 'service':
        return 'Dịch vụ theo công';
      case 'recruitment':
        return 'Tuyển dụng';
      case 'branchs':
        return 'Chuỗi cửa hàng';
      case 'snimei':
        return 'Tra cứu SN/IMEI';
      case 'service_time':
        return 'Dịch vụ theo thời gian';
      case 'travel':
        return 'Du lịch';
      default:
        return '';
    }
  }

  /** Hàm thực hiện mở popup thêm danh mục
   *
   */
  addNewField(): void {
    const dialogRef = this.dialog.open(AddNewFieldComponent, {
      width: '70vw',
      height: '70vh',
      disableClose: true,
      data: this.newFields,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (typeof result === 'object') {
          this.newFields = [...this.newFields, result];
          this.changeDetectorRef.detectChanges();
        }
      }
    });
  }

  /** Hàm thực hiện mở popup edit với id
   *
   * @param newField: dữ liệu danh mục được truyền cho popup
   */
  editNewField(newField): void {
    const dialogRef = this.dialog.open(EditNewFieldComponent, {
      width: '70vw',
      height: '70vh',
      data: { newField: newField },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (typeof result === 'object') {
          this.newFields = this.newFields.map((e) => e._id === result._id ? result : e);
          this.changeDetectorRef.detectChanges();
        }
      }
    });
  }

  translateLookupGroup(item: any): string {
    if (item.id_main_sector === 'snimei') {
      return `(${this.languageService.translate('nhom_tra_cuu')}  ${item.lookup_group})`;
    }
    return '';
  }

  deleteNewField(newField) {
    this.vhComponent
      .alertConfirm('', this.languageService.translate('xoa_truong'), newField.name, this.languageService.translate('dong_y'), this.languageService.translate('huy'))
      .then(
        (ok) => {
          if (ok == 'OK') {
            this.vhQueryAutoWeb.deleteNewField(newField._id).then(
              (res: any) => {
                this.newFields = this.newFields.filter(e => e._id != newField._id)
                this.functionService.createMessage('success', 'xoa_thanh_cong');
              },
              (error) => {
                this.functionService.createMessage('error', this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_xoa_du_lieu'));
                console.error(error);
              }
            );
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }


  handleSort(field) {
    this.sortby[field] = !this.sortby[field];
    this.sort = { [field]: this.sortby[field] ? 1 : -1 }

    if (this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    } else {
      this.getNewFields();
    }
  }

  onSearchNewField(): void {
    this.loading = true;
    this.idMainSector = 'all'
    this.resetPagination();
    this.vhQueryAutoWeb.searchList_likeSearch('newfields', 'field_lable', this.keySearch, {}, {})
      .then((res: any) => {
        console.log('res', res);
        if (res.vcode === 0) {
          this.dataSearched = res.data;
          this.handlePaginateLocal();
        }
      }, (error: any) => {
        console.error('error', error)
      })
      .finally(() => this.loading = false)
  }


  handlePaginateLocal() {
    let data_filter = this.dataSearched

    switch (true) {
      case this.sort.hasOwnProperty('field_lable'): {
        data_filter = this.sort.field_lable == 1 ? this.vhAlgorithm.sortStringbyASC(data_filter, 'field_lable') : this.vhAlgorithm.sortStringbyDESC(data_filter, 'field_lable')
        break;
      }
      case this.sort.hasOwnProperty('id_main_sector'): {
        data_filter = this.sort.id_main_sector == 1 ? this.vhAlgorithm.sortStringbyASC(data_filter, 'id_main_sector') : this.vhAlgorithm.sortStringbyDESC(data_filter, 'id_main_sector')
        break;
      }
      case this.sort.hasOwnProperty('field_order_number'): {
        data_filter = this.sort.field_order_number == 1 ? this.vhAlgorithm.sortNumberbyASC(data_filter, 'field_order_number') : this.vhAlgorithm.sortNumberbyDESC(data_filter, 'field_order_number')
        break;
      }
    }

    let data_page = new Array(); //mảng dữ liệu phân theo page
    for (let i = 0; i < data_filter.length; i++) {
      if ((i >= this.limit * (this.pageCurrent - 1)) && (i < this.limit * this.pageCurrent)) data_page.push(data_filter[i]);
    }
    this.totalPages = Math.ceil(data_filter.length / this.limit); // tổng số page
    this.newFields = data_page;
  }



  /**
 * hàm này reset pagination về 1
 */
  resetPagination() {
    this.pageCurrent = 1;
    this.pageGoto = 1;
    this.pageShowChoose = [0, 1, 2];
  }

  pageIndexChange(event) {
    this.pageCurrent = event;
    if (this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }
    else
      this.getNewFields();
  }

  limitChange(event) {
    this.limit = event;
    if (this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }
    else
      this.getNewFields();
  }

}
