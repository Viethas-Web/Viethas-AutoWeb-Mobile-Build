import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { FunctionService } from 'vhobjects-service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AddBlogComponent } from './add-blog/add-blog.component';
import { EditBlogComponent } from './edit-blog/edit-blog.component';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss']
})
export class BlogsComponent implements OnInit {
  public searchTitleNew = '';
  public pageCurrent = 1; // Trang hiện tại
  public totalPages: number = 1; // Tổng số trang
  public limitItemsBlog: number = 10; // Số lượng item trên 1 trang
  public showNews: any = [];
  public news = [];
  public listChooseItem: any = [10, 20, 50, 100];
  public limit: number = 10; // giới hạn sản phẩm trên 1 trang
  public pageShowChoose: any = [0, 1, 2]; /** Số trang hiển thị = */
  public pageGoto: number = 1; /** Trang người dùng chuyển tới hiển thị = */
  subscribe: Subscription;
  public isASC: boolean = true; // true. A->Z, false. Z->A
  public categories: Array<any> = [];
  id_newscategory = '' // get những sp theo danh mục
  loading_product = false // biến ẩn hiện loading ở table của sp khi get dữ liệu

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    private vhComponent: VhComponent,
    public vhAlgorithm: VhAlgorithm,
    public functionService: FunctionService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
    private nzMessageService: NzMessageService, 
    private languageService : LanguageService
  ) {}

  createMessage(type: string, key: string, duration: number = 2000) {
    this.translate.get(key).subscribe((translatedMessage: string) => {
      this.nzMessageService.create(type, translatedMessage, { nzDuration: duration });
    });
  }
  ngOnInit(): void {
    this.getCategory()
  }


  /**
   * hàm này get danh sách category để chọn xem sp theo danh mục
   * @example this.getCategory()
   */
  getCategory() {
    this.vhQueryAutoWeb.getNewsCategorys_byFields({ type: { $eq: 2 } })
      .then((res: any) => {
        this.categories = res.data
      })
  }

  trackByFn(index: number, item: any) {
    return item._id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }


  getNews(pageCurrent?) {
    if (!this.id_newscategory) {
      this.vhComponent.alertMessageDesktop("warning", "vui_long_chon_danh_muc_bai_viet");
      return
    }
    this.loading_product = true
    let promise = this.id_newscategory == 'all' ? this.vhQueryAutoWeb.getNewss_byFields({ type: { $eq: 2  } }, {}, {}, this.limit, pageCurrent) : this.vhQueryAutoWeb.getNewss_byFields({ id_newscategory: { $eq: this.id_newscategory } }, {}, {}, this.limit, pageCurrent)
    promise.then((news: any) => {
        if (news.vcode == 0) {
          this.news = news.data.map((map) => {
            return {
              ...map,
              category_name: this.categories.find(
                (find) => find._id === map.id_newscategory
              )?.name,
            };
          });

          this.showNews = this.news;
        }
      },
      (error) => {
        this.createMessage(
          'error',
          'da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu'
        );
      }
    );
  }

  tableHeight: string;
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

  changeItemOnPage(value) {
    this.limitItemsBlog = Number(value);
    this.pageCurrent = 1;
  }

  /** Chuyển trang -----------------
   *
   * @param value
   */
  transferFn(value: number): void {
    this.pageCurrent = Number(value);
    this.pageGoto = Number(value);
    if (this.searchTitleNew == '')
      this.getNews(this.pageCurrent)
    else this.onSearchNews(this.pageCurrent);
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

  selectPage(page: number) {
    if (page === 1) {
      this.router.navigate(['admin', 'news']);
      return;
    }
    this.router.navigate(['/admin', 'news', 'page', page]);
  }

  counter(i: number) {
    return new Array(i);
  }

  public checkKey(event) {
    if (event.keyCode == 13) {
      this.onSearchNews();
    }
  }

  onSearchNews(pageCurrent?): void {
    this.functionService.createMessage('warning', 'Đang chờ hàm search của backend');
    // if (this.searchTitleNew !== '') {
    //   this.vhQueryAutoWeb
    //     .searchList(
    //       'newss',
    //       this.searchTitleNew,
    //       {},
    //       { }
    //     )
    //     .then((result: any) => {
    //       if (result.vcode === 0) {
    //         this.showNews = result.data;
    //         this.totalPages = result.totalpages;
    //       }
    //     }).catch((e) => {
    //       console.log(e);
    //     })
    // } else {
    //   this.pageCurrent = 1;
    //   this.getNews();
    // }
  }

  deteleNews(news) {
    this.vhComponent
      .alertConfirm('', this.languageService.translate('xoa_bai_viet'), news.name, this.languageService.translate('dong_y'), this.languageService.translate('thoat'))
      .then((ok) => {
        if (ok == 'OK') {
          this.vhQueryAutoWeb.deleteNews(news._id).then(
            (res: any) => {
              if (res.vcode === 0) { 
                this.createMessage(
                  'success',
                  'xoa_bai_viet_thanh_cong'
                );
                this.showNews = this.showNews.filter(
                  (filter) => filter._id !== news._id
                );
              }
              if (res.vcode === 11) {
                this.createMessage(
                  'error',
                  'phien_dang_nhap_da_het_han_vui_long_dang_nhap_lai'
                );
              }
            } ,
            (error) => {
              this.createMessage(
                'error',
                'da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu'
              );
            }
          );
        }
      });
  }

  addNews(): void {
    const dialogRef = this.dialog.open(AddBlogComponent, {
      width: '56vw',
      height: '95vh',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        result['category_name'] = this.categories.find(
          (find) => find._id === result.id_newscategory
        )?.name;
        this.news = [result, ...this.news];
        this.showNews = this.news;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  editNews(value): void {
    const dialogRef = this.dialog.open(EditBlogComponent, {
      width: '56vw',
      height: '95vh',
      data: value,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (typeof result === 'object') {
          const idx = this.news.findIndex(
            (findIndex) => findIndex._id == result._id
          );
          this.news = this.news.map((category, index) => {
            if (index == idx) category = result;
            return { ...category };
          });
          this.showNews = this.news;
          this.changeDetectorRef.detectChanges();
        }
      }
    });
  }

  updateHiddenNews(news, objectUpdate) {
    this.vhQueryAutoWeb.updateNews(news._id, objectUpdate).then(
      (bool: any) => {
        if (!bool)
          this.createMessage('error', 'cap_nhat_that_bai');
      },
      (err) => {
        this.createMessage(
          'error',
          'da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu'
        );
      }
    );
  }

  keyupSearch() {
    if (this.searchTitleNew == '') this.onSearchNews(this.pageCurrent);
  }

  /**Sắp xếp sản phẩm theo thứ tự
   *
   */
  softProducts() {
    if (this.isASC) {
      this.showNews = this.vhAlgorithm.sortVietnamesebyASC(
        this.showNews,
        'name'
      );
      this.isASC = true;
    } else {
      this.showNews = this.vhAlgorithm.sortVietnamesebyDESC(
        this.showNews,
        'name'
      );
    }
    this.isASC = !this.isASC;
  }
}
