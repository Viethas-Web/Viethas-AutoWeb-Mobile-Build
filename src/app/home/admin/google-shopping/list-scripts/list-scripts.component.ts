import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService, LanguageService } from 'vhobjects-service'; 
import { AddEmbeddedScriptComponent } from './add-embedded-script/add-embedded-script.component';
import { EditEmbeddedScriptComponent } from './edit-embedded-script/edit-embedded-script.component';
 

@Component({
  selector: 'app-list-scripts',
  templateUrl: './list-scripts.component.html',
  styleUrls: ['./list-scripts.component.scss']
})
export class ListScriptsComponent implements OnInit {
/** biến dùng để chứa chiều cao của bảng dữ liệu */
  tableHeight: string;
  /** danh sách danh mục để lọc */
  categories: Array<any> = [{
    _id: 'all',
    name: 'Tất cả',
  }];
  categoriesInit:any;
  /* Biến này hiển thị ở html xem sort theo trường nào */
  sortby: any = {
    data: true,
  };
  /** get những sp theo danh mục */
  idCategory = 'all';
  /* Biến này truyền vào hàm để sort */
  sort: any = { data: 1 };
  /**Dùng tìm kiếm sản phẩm */
  keySearch: string = '';
  /** mảng chưa danh sách sp search */
  dataSearched: any = []
  /** Danh sách sản phẩm hiển thị */
  scripts: any[] = []; // 
  /** biến ẩn hiện loading ở table khi get dữ liệu */
  loading = false;
  loadingCategory = false;

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
    public vhAlgorithm: VhAlgorithm,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    private changeDetectorRef: ChangeDetectorRef, 
    private nzModalService: NzModalService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
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

  /** 
   * Hàm thực hiện lấy danh sách sản phẩm 
   */
  getData() {
    this.loading = true;
    this.vhQueryAutoWeb.getSetups_byFields({
      type: {$eq: 'embedded_script'},
    })
    .then((res:any) => {
      this.scripts = res;
      this.dataSearched = res;
      this.handlePaginateLocal();
    }) 
    .finally(() => this.loading = false);
  }


  handleSort(field) {
    this.sortby[field] = !this.sortby[field];
    this.sort = { [field]: this.sortby[field] ? 1 : -1 }

    this.handlePaginateLocal();
  }

 
  /** Phân trang sản phẩm khi search */
  handlePaginateLocal() {
    let data_filter = this.dataSearched
    switch (true) {
      case this.sort.hasOwnProperty('data'): {
        data_filter = this.sort['data'] == 1 ? this.vhAlgorithm.sortStringbyASC(data_filter, 'data') : this.vhAlgorithm.sortStringbyDESC(data_filter, 'data')
        break;
      }
    }

    let data_page = new Array(); //mảng dữ liệu phân theo page
    for (let i = 0; i < data_filter.length; i++) {
      if ((i >= this.limit * (this.pageCurrent - 1)) && (i < this.limit * this.pageCurrent)) data_page.push(data_filter[i]);
    }
    this.totalPages = Math.ceil(data_filter.length / this.limit); // tổng số page
    this.scripts = data_page
  }

  /**
   * hàm này reset pagination về 1
   */
  resetPagination() {
    this.pageCurrent = 1;
    this.pageGoto = 1;
    this.pageShowChoose = [0, 1, 2];
  }

  /** pageCurrent thay đổi */
  pageIndexChange(event) {
    this.pageCurrent = event;
    this.handlePaginateLocal();
  }

  /** limit thay đổi */
  limitChange(event) {
    this.resetPagination();
    this.limit = event;
    this.handlePaginateLocal();
  } 

  handleAddData() {
    const modal: NzModalRef = this.nzModalService.create({
      nzWidth: '500px',
      nzContent: AddEmbeddedScriptComponent,
      nzFooter: null,
      nzCloseIcon: null, 
      nzComponentParams: {
        type_setup: 'embedded_script',
        type_options: [
          { value: 'header', label: 'Head' },
          { value: 'body', label: 'Body' }
        ]
      }
    });

    modal.afterClose.subscribe((result) => {
      if (result) {
        this.scripts = [result, ...this.scripts];
      }
    });
  }

  deleteData(data) {
     this.nzModalService.confirm({
      nzTitle: this.languageService.translate('xac_nhan_xoa_script'),
      nzOkText: this.languageService.translate('co'),
      nzOkDanger: true,
      nzCancelText: this.languageService.translate('khong'),
      nzOnOk: () =>
        new Promise((resolve, reject) => {
          this.vhQueryAutoWeb.deleteSetup(data._id)
            .then((res:any) => {
              this.scripts = this.scripts.filter(pro => pro._id != data._id);
              this.functionService.createMessage('success', 'Xóa script thành công');
              resolve(res);
            })
        }).catch(() => console.log('Oops errors!'))
    });
  }

  editData(data) {
    const modal: NzModalRef = this.nzModalService.create({
      nzWidth: '500px',
      nzContent: EditEmbeddedScriptComponent,
      nzFooter: null,
      nzCloseIcon: null, 
      nzComponentParams: {
        dataEdit: data,
        type_options: [
          { value: 'header', label: 'Head' },
          { value: 'body', label: 'Body' }
        ]
      }
    });

    modal.afterClose.subscribe((result) => {
      if (result) {
        this.scripts = this.scripts.map(pro => {
          if (pro._id === result._id) return { ...pro, ...result };
          return pro;
        });
        this.dataSearched = [...this.scripts];
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  updateActive(pro: any, active: boolean) {
    this.vhQueryAutoWeb.updateSetup(pro._id, { active })
      .then((res: any) => {
        this.scripts = this.scripts.map(item => {
          if (item._id === pro._id) {
            return { ...item, active };
          }
          return item;
        });
        this.functionService.createMessage('success', active ? 'Kích hoạt script thành công' : 'Hủy kích hoạt script thành công');
      })
      .catch(err => {
        console.error('Error updating active status:', err);
        this.functionService.createMessage('error', 'Cập nhật trạng thái thất bại');
      })
  }
}
