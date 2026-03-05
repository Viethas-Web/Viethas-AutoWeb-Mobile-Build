import { ChangeDetectorRef, Component, OnInit } from '@angular/core'; 
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { LanguageService } from 'src/app/services/language.service';
import { FunctionService } from 'vhobjects-service';
@Component({
  selector: 'app-website-contact',
  templateUrl: './website-contact.component.html',
  styleUrls: ['./website-contact.component.scss'],
})
export class WebContactComponent implements OnInit {
  /** biến dùng để chứa chiều cao của bảng dữ liệu */
  tableHeight: string; 
  /** setup product */
  setupProductImg
  /** setup category */
  setupCategoryImg
  /** danh sách danh mục để lọc */
  categories: Array<any> = [];
  /* Biến này hiển thị ở html xem sort theo trường nào */
  sortby: any = { 
    name: false,
    phone_code: false,
    email: false,
    content: false,
    id_subproject: false,
    date: false,
  };
  
  /** get những sp theo trạng thái */
  status = 'all';
  /* Biến này truyền vào hàm để sort */
  sort: any = { name: 1 };
  /**Dùng tìm kiếm sản phẩm */
  keySearch: string = ''; 
  /** mảng chưa danh sách sp search */  
  dataSearched: any  = [] 
  /** Danh sách sản phẩm hiển thị */
  contacts: any[] = []; // 
  /** biến ẩn hiện loading ở table khi get dữ liệu */
  loading = false;  
  /** lọc theo ngày */
  date: any = [new Date(), new Date()];

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
    private changeDetectorRef: ChangeDetectorRef,
    private languageService: LanguageService

  ) { }

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

  ngOnInit(): void {
    
  }

  trackByFn(index: number, item: any) {
    return item._id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }


  /** Hàm thực hiện lấy danh sách sản phẩm
   *
   * @param 
   */
  getContact() {
    this.loading = true;
    let query:any = { type: { $eq: 3 } } 

    if (this.date[0] && this.date[1]) {
      query = {
        ...query,
        date: { $gte: new Date(this.date[0].setHours(0, 0, 0)).toISOString(), $lte: new Date(this.date[1].setHours(23, 59, 59, 59)).toISOString() }
      }
    }

    if(this.status != 'all') {
      query = {
        ...query,
        status: this.status
      }
    }

    this.vhQueryAutoWeb.getContacts_byFields(
          query,
          {},
          this.sort,
          this.limit,
          this.pageCurrent
        ).then((res: any) => {
        console.log(res);
        this.contacts = res.data;
        this.totalPages = res.totalpages;

         // new Event('resize') tạo ra một event có type = "resize".
      // Khi phát đi, tất cả các listener đang lắng nghe sự kiện resize của window sẽ được gọi.
      // height lúc chưa load sản phẩm sẽ khác height sau khi load sản phẩm xong nên cần trigger lại sự kiện resize để virtual scroll hoạt động chính xác
       window.dispatchEvent(new Event('resize'));
    })
    .catch((error) => console.log(error))
    .finally(() => this.loading = false);
  }



  /**
   * hàm này reset pagination về 1
   */
  resetPagination() {
    this.pageCurrent = 1;
    this.pageGoto = 1;
    this.pageShowChoose = [0, 1, 2];
  }



  /** Hàm thực hiện xác nhận xóa sản phẩm và thực hiện xóa sản phẩm
   *
   * @param product
   */
  deleteInfoCandidates(product) {
    this.vhComponent
      .alertConfirm('', this.languageService.translate('xac_nhan_xoa'), product.name, this.languageService.translate('dong_y'), this.languageService.translate('thoat'))
      .then(
        (ok) => {
          if (ok == 'OK') {
            this.vhQueryAutoWeb.deleteContact(product._id).then(
              (res: any) => {
                console.log('res', res);
                if(res.vcode != 0) {
                  this.functionService.createMessage('error',res.msg);
                  return;
                }
                this.contacts = this.contacts.filter((item) => item._id != product._id);
                this.functionService.createMessage('success', 'xoa_thanh_cong');
              },
              (error) => {
                this.functionService.createMessage(
                  'error',
                  'da_xay_ra_loi_trong_qua_trinh_xoa_du_lieu_vui_long_thu_lai'
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

  /** pageCurrent thay đổi */
  pageIndexChange(event) {
    this.pageCurrent = event;
    this.getContact()
  }

  /** limit thay đổi */
  limitChange(event) {
    this.resetPagination();
    this.limit = event;
    this.getContact()
  }

  handleSort(field) {
    this.sortby[field] = !this.sortby[field];
    this.sort = { [field]: this.sortby[field] ? 1 : -1 }

    this.getContact();
  }


  openNewWindow(link_demo) {
    window.open(link_demo, "_blank")
  }

  updateContact(item) {
    this.vhQueryAutoWeb.updateContact(item._id, {
      status: item.status
    })
    .then((res:any) => {
      console.log('res', res);
    })
  }

}
