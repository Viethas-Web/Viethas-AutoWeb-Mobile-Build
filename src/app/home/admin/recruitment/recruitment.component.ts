import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VhAlgorithm, VhEventMediator, VhQueryAutoWeb } from 'vhautowebdb';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { LanguageService } from 'src/app/services/language.service';
import { AddRecruitmentComponent } from './add-recruitment/add-recruitment.component';
import { FunctionService } from 'vhobjects-service';
import { EditRecruitmentComponent } from './edit-recruitment/edit-recruitment.component';
@Component({
  selector: 'app-recruitment',
  templateUrl: './recruitment.component.html',
  styleUrls: ['./recruitment.component.scss'],
})
export class RecruitmentComponent implements OnInit {
  /** biến dùng để chứa chiều cao của bảng dữ liệu */
  tableHeight: string; 
  /* Biến này hiển thị ở html xem sort theo trường nào */
  sortby: any = { 
    [this.positionField]: true,
    address: false,
    [this.salaryField]: true,
    date_expired: false
  };
  /* Biến này truyền vào hàm để sort */
  sort: any = { [this.positionField]: 1 };
  /**Dùng tìm kiếm sản phẩm */
  keySearch: string = ''; 
  /** mảng chưa danh sách sp search */  
  dataSearched: any  = [] 
  /** Danh sách recruitments hiển thị */
  recruitments: any[] = []; // 
  /** biến ẩn hiện loading ở table khi get dữ liệu */
  loading = false;
  loadingCategory = false;
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
  /** setup category */
  setupCategoryImg
  /** danh sách danh mục để lọc */
  categories: Array<any> = [];

  /** Lấy trường position theo ngôn ngữ đang được chọn */
  get positionField() {
    return 'position_' + this.functionService.selectedLanguageCode;
  }

  /** Lấy trường salary theo ngôn ngữ đang được chọn */
  get salaryField() {
    return 'salary_' + this.functionService.selectedLanguageCode;
  }


  constructor( 
    private vhComponent: VhComponent,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private languageService: LanguageService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    public vhEventMediator: VhEventMediator,
    public functionService: FunctionService,
    private vhAlgorithm: VhAlgorithm
  ) {}

  ngOnInit(): void {
    this.vhQueryAutoWeb.getSetups_byFields({ type: { $in: ['category_image'] } })
      .then((res: any) => {
        if (res.length) {
          this.setupCategoryImg = res.find(e => e.type == 'category_image')
        }
      })
    this.getCategory();
  }

  languageChangedSubscription
  ngAfterViewInit(): void {
    this.languageChangedSubscription = this.vhEventMediator.configChanged.subscribe((message: any) => {
      if (message?.status === 'update-language') {
        this.keySearch=''; 
        this.recruitments=[]; 
        this.totalPages=0
      }
    });

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
   * hàm này get danh sách category để chọn xem sp theo danh mục
   * @example this.getCategory()
   */
  getCategory() {
    this.loadingCategory = true;
    this.vhQueryAutoWeb
      .getCategorys_byFields(
        { id_main_sectors: { $all: ['recruitment'] } },
        {},
        {},
        0
      )
      .then((res: any) => {
        if (res.vcode === 0) {
          this.vhQueryAutoWeb
            .getCategorySteps_byIdCategoryArray(
              res.data.map((e) => {
                return e._id;
              })
            )
            .then(
              (response: any) => {
                if (response.vcode === 0) {
                  response.data.forEach((e) => {
                    this.categories = [
                      ...this.categories,
                      e
                    ]
                  });
                }
              },
              (error: any) => {
                console.log('error', error);
              }
            )
            .finally(() => this.loadingCategory = false);
        }
      });
  }

  onSearch() {
    this.loading = true;
    this.date = [new Date(), new Date()];
    this.resetPagination();
    this.vhQueryAutoWeb.searchList_likeSearch('recruitments', this.positionField, this.keySearch, {}, {})
      .then((res: any) => {
        console.log('res', res);
        if (res.vcode === 0) {
          this.dataSearched = res.data;
          this.handlePaginateLocal();
        }
      }, (error: any) => {
        console.log('error', error)
      })
      .finally(() => this.loading = false)

  }

  getRecruitments() {
    this.loading = true;
    this.keySearch = '';
    let query = {}

    if(this.date[0] && this.date[1]) {
      query = {
        date_expired: { $gte: new Date(this.date[0].setHours(0, 0, 0)).toISOString(), $lte: new Date(this.date[1].setHours(23, 59, 59, 59)).toISOString() }
      }
    }
    this.vhQueryAutoWeb
      .getRecruitments_byFields(
        query, 
        {}, 
        this.sort, 
        this.limit, 
        this.pageCurrent)
      .then((res: any) => {
        if(res.vcode != 0) {
          this.functionService.createMessage('error', res.msg)
          return;
        }

        if (res.vcode === 0) {
          this.recruitments = res.data;
          this.totalPages = res.totalpages;

          // new Event('resize') tạo ra một event có type = "resize".
          // Khi phát đi, tất cả các listener đang lắng nghe sự kiện resize của window sẽ được gọi.
          // height lúc chưa load sản phẩm sẽ khác height sau khi load sản phẩm xong nên cần trigger lại sự kiện resize để virtual scroll hoạt động chính xác
          window.dispatchEvent(new Event('resize'));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => this.loading = false)
  }
  /**Chuyển tới trang thêm tuyển dụng */
  addRecruitment() {
    const dialogRef =  this.dialog.open(AddRecruitmentComponent, {
      width: '70vw',
      height: '80vh', 
      data: {
        categories: this.categories,
        setupCategoryImg: this.setupCategoryImg,
      }
    });

    
    dialogRef.afterClosed().subscribe((result) => {
      this.functionService.languageTempCode = this.functionService.selectedLanguageCode;
      if (result) {
        this.recruitments = [...this.recruitments, result];
      }
    });
  }
  gotoDetailPost(item) {
    const dialogRef = this.dialog.open(EditRecruitmentComponent, {
      width: '70vw',
      height: '80vh', 
      data: {
        dataEditRecruitment: item,
        categories: this.categories,
        setupCategoryImg: this.setupCategoryImg,
      }

    });

    dialogRef.afterClosed().subscribe((result) => {
      this.functionService.languageTempCode = this.functionService.selectedLanguageCode;
      if (result) {
        this.recruitments = this.recruitments.map((item) => item._id === result._id ? result : item);
      }
    });
  }

  /**
   * Xoá bài viết
   * @param recruitment
   */
  deleteRecruitment(recruitment) {
    this.vhComponent
      .alertConfirm('', this.languageService.translate('xac_nhan_xoa') + '?', recruitment[this.positionField], this.languageService.translate('dong_y'), this.languageService.translate('thoat'))
      .then(
        (ok) => {
          if (ok == 'OK') {
            this.vhQueryAutoWeb
            .deleteRecruitment(recruitment._id)
            .then((rsp: any) => {
              if (rsp.vcode === 0) {
                this.recruitments = this.recruitments.filter((item) => item._id !== recruitment._id);
                this.vhComponent.alertMessageDesktop('success',this.languageService.translate('xoa_tin_tuyen_dung_thanh_cong'));
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

  handlePaginateLocal() {
    let data_filter = this.dataSearched 
    const field = Object.keys(this.sort)[0];
    switch (field) {
      case this.positionField:
        data_filter = this.sortby[field] ?  this.vhAlgorithm.sortStringbyASC(data_filter, field) : this.vhAlgorithm.sortStringbyDESC(data_filter, field)
        break;
      case 'address':
        data_filter = this.sortby[field] ?  this.vhAlgorithm.sortStringbyASC(data_filter, field) : this.vhAlgorithm.sortStringbyDESC(data_filter, field)
        break;
      case this.salaryField:
        data_filter = this.sortby[field] ?  this.vhAlgorithm.sortNumberbyASC(data_filter, field) : this.vhAlgorithm.sortDatebyDESC(data_filter, field)
        break;
      case 'date_expired':
        data_filter = this.sortby[field] ?  this.vhAlgorithm.sortDatebyASC(data_filter, field) : this.vhAlgorithm.sortDatebyDESC(data_filter, field)
        break;
    }

    let data_page = new Array(); //mảng dữ liệu phân theo page
    for (let i = 0; i < data_filter.length; i++) {
      if ((i >= this.limit * (this.pageCurrent - 1)) && (i < this.limit * this.pageCurrent)) data_page.push(data_filter[i]);
    }
    this.totalPages = Math.ceil(data_filter.length / this.limit); // tổng số page

    this.recruitments = data_page
  }


  /**
 * hàm này reset pagination về 1
 */
  resetPagination() {
    this.pageCurrent = 1;
    this.pageGoto = 1;
    this.pageShowChoose = [0, 1, 2];
  }

  handleSort(field) {
    this.sortby[field] = !this.sortby[field];
    this.sort = { [field]: this.sortby[field] ? 1 : -1 };


    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }else {
      this.getRecruitments();
    }
  }

  /** pageCurrent thay đổi */
  pageIndexChange(event) {
    this.pageCurrent = event;
    if (this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }
    else 
      this.getRecruitments();
  }

  /** limit thay đổi */
  limitChange(event) {
    this.resetPagination();
    this.limit = event;
    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    } else {
      this.getRecruitments()
    }
  }
  trackByFn(index: number, item: any) {
    return item._id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }
}
