import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-info-candidates',
  templateUrl: './info-candidates.component.html',
  styleUrls: ['./info-candidates.component.scss'],
})
export class InfoCandidatesComponent implements OnInit {
  /** biến dùng để chứa chiều cao của bảng dữ liệu */
  tableHeight: string; 
  /* Biến này hiển thị ở html xem sort theo trường nào */
  sortby: any = { 
    name: true,
    phone: true,
    email: true,
    date: true
  }
  /* Biến này truyền vào hàm để sort */
  sort: any = { name: 1 };
  /**Dùng tìm kiếm sản phẩm */
  keySearch: string = ''; 
  /** mảng chưa danh sách sp search */  
  dataSearched: any  = [] 
  /** Danh sách candidates hiển thị */
  candidates: any[] = []; // 
  /** biến ẩn hiện loading ở table khi get dữ liệu */
  loading = false; 
  /** lọc theo ngày */
  date = [new Date(), new Date()] 

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
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private languageService: LanguageService,
    private changeDetectorRef: ChangeDetectorRef,
    private vhAlgorithm: VhAlgorithm
  ) {}

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

  
  handlePaginateLocal() {
    let data_filter =  this.dataSearched 
    const field = Object.keys(this.sort)[0]
    switch (field) {
      case 'name':
        data_filter = this.sortby[field] ?  this.vhAlgorithm.sortStringbyASC(data_filter, field) : this.vhAlgorithm.sortStringbyDESC(data_filter, field)
        break;
      case 'phone':
        data_filter = this.sortby[field] ?  this.vhAlgorithm.sortStringbyASC(data_filter, field) : this.vhAlgorithm.sortStringbyDESC(data_filter, field)
        break;
      case 'email':
        data_filter = this.sortby[field] ?  this.vhAlgorithm.sortStringbyASC(data_filter, field) : this.vhAlgorithm.sortStringbyDESC(data_filter, field)
        break;
      case 'position':
        data_filter = this.sortby[field] ?  this.vhAlgorithm.sortStringbyASC(data_filter, field) : this.vhAlgorithm.sortStringbyDESC(data_filter, field)
        break;
      case 'date':
        data_filter = this.sortby[field] ?  this.vhAlgorithm.sortDatebyASC(data_filter, field) : this.vhAlgorithm.sortDatebyDESC(data_filter, field)
        break;
      default:
        break;
    }

    let data_page = new Array(); //mảng dữ liệu phân theo page
    for (let i = 0; i < data_filter.length; i++) {
      if ((i >= this.limit * (this.pageCurrent - 1)) && (i < this.limit * this.pageCurrent)) data_page.push(data_filter[i]);
    }
    this.totalPages = Math.ceil(data_filter.length / this.limit); // tổng số page

    this.candidates =  data_page
  }



  

  handleSort(field) {
    this.sortby[field] = !this.sortby[field];
    this.sort = { [field]: this.sortby[field] ? 1 : -1 }

    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }else {
      this.getListdata();
    }
  }

  trackByFn(index: number, item: any) {
    return item._id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }


  getListdata() {
    this.loading = true;
    this.keySearch = '';
    let query:any = {
      type: { $eq: 1 } 
    }

    if(this.date[0] && this.date[1]) {
      query = {
        ...query,
        date: { $gte: new Date(this.date[0].setHours(0, 0, 0)).toISOString(), $lte: new Date(this.date[1].setHours(23, 59, 59, 59)).toISOString() }
      }
    }
    this.vhQueryAutoWeb
      .getContacts_byFields(
        query, 
        {}, 
        this.sort, 
        this.limit, 
        this.pageCurrent)
      .then((res: any) => {
        this.candidates = res.data;
        this.totalPages = res.totalpages;


        // new Event('resize') tạo ra một event có type = "resize".
        // Khi phát đi, tất cả các listener đang lắng nghe sự kiện resize của window sẽ được gọi.
        // height lúc chưa load sản phẩm sẽ khác height sau khi load sản phẩm xong nên cần trigger lại sự kiện resize để virtual scroll hoạt động chính xác
        window.dispatchEvent(new Event('resize'));
      })
      .catch((err) => console.error(err))
      .finally(() => this.loading = false)
  }

  deleteInfoCandidates(candidate) {
    this.vhComponent
      .alertConfirm('', this.languageService.translate('xac_nhan_xoa') + '?', candidate.name, this.languageService.translate('dong_y'), this.languageService.translate('thoat'))
      .then(
        (ok) => {
          if (ok == 'OK') {
            this.vhQueryAutoWeb
            .deleteContact(candidate._id)
            .then((res: any) => {
              if (res.vcode === 0) {
                this.vhComponent.alertMessageDesktop('success', this.languageService.translate('xoa_thanh_cong'));
                this.candidates = this.candidates.filter((item) => item._id !== candidate._id);
              }
            })
            .catch((err) => console.error(err));
          }
        },
        (error) => {
          console.error(error);
        }
      );
    

    
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
    if (this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }
    else 
      this.getListdata();
  }

  /** limit thay đổi */
  limitChange(event) {
    this.resetPagination();
    this.limit = event;
    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    } else {
      this.getListdata()
    }
  }

    
}
