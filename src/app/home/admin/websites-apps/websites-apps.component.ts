import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VhAlgorithm, VhEventMediator, VhQueryAutoWeb } from 'vhautowebdb';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
// import { FunctionService } from 'vhobjects-service';
import { LanguageService } from 'src/app/services/language.service';
import { AddWebsiteAppComponent } from './add-websites-apps/add-websites-apps.component';
import { EditWebsiteAppComponent } from './edit-websites-apps/edit-websites-apps.component';
import { FunctionService } from 'vhobjects-service';
@Component({
  selector: 'websites-apps',
  templateUrl: './websites-apps.component.html',
  styleUrls: ['./websites-apps.component.scss'],
})
export class WebsitesAppsComponent implements OnInit {
  /** biến dùng để chứa chiều cao của bảng dữ liệu */
  tableHeight: string; 
  /** setup website */
  setupWebsiteImg
  /** setup category */
  setupCategoryImg
  /** danh sách danh mục để lọc */
  categories: Array<any> = [ ];
  /* Biến này hiển thị ở html xem sort theo trường nào */
  sortby: any = { 
    [this.nameField]: true,
  };
  /** get những sp theo danh mục */
  idCategory = 'all';
  /* Biến này truyền vào hàm để sort */
  sort: any = { [this.nameField]: 1 };
  /**Dùng tìm kiếm sản phẩm */
  keySearch: string = ''; 
  /** mảng chưa danh sách sp search */  
  dataSearched: any  = [] 
  /** Danh sách website hiển thị */
  websites: any[] = []; // 
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

  /** Lấy trường name theo ngôn ngữ đang được chọn */
  get nameField() {
    return 'name_' + this.functionService.selectedLanguageCode;
  }


  constructor(
    private vhComponent: VhComponent,
    public vhAlgorithm: VhAlgorithm,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    private changeDetectorRef: ChangeDetectorRef,
    private languageService: LanguageService,
    private vhEventMediator: VhEventMediator,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {

    this.vhQueryAutoWeb.getSetups_byFields({type: {$in: ['website_image' ,'category_image']}})
    .then((res:any) => {
      if(res.length) {
        for(let i of res) {
          if(i.type == 'website_image') {
            this.setupWebsiteImg = i
          }

          if(i.type == 'category_image') {
            this.setupCategoryImg = i
          }

        }
      }
    })


    this.getCategory();
    
  }

  ngOnDestroy(): void {}

  trackByFn(index: number, item: any) {
    return item.id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }

  languageChangedSubscription
  ngAfterViewInit(): void {
    this.languageChangedSubscription = this.vhEventMediator.configChanged.subscribe((message: any) => {
      if (message?.status === 'update-language') {
        this.keySearch=''; 
        this.websites=[]; 
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
        { id_main_sectors: { $all: ['webapp'] } },
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
            ).finally(() => this.loadingCategory = false);
        }
      });
  }

  /** Hàm thực hiện lấy danh sách website
   *
   * @param pageCurrent trang hiện tại
   */
  getWebsites() {
    this.loading = true;
    this.keySearch = ''
    let query = {
      sub_type: { $eq: 2 }, 
      id_main_sector: { $eq: 'webapp' } 
    }
    if(this.idCategory != 'all') {
      query['id_categorys'] = { $all: [this.idCategory]}
    }
    this.vhQueryAutoWeb.getWebApps_byFields(
      query,
      {},
      this.sort,
      this.limit,
      this.pageCurrent
    ).then((res: any) => {
      let websites = this.proccessData(res.data);

      this.loading = false;
      this.websites = websites;
      
      this.totalPages = res.totalpages;

      // new Event('resize') tạo ra một event có type = "resize".
      // Khi phát đi, tất cả các listener đang lắng nghe sự kiện resize của window sẽ được gọi.
      // height lúc chưa load sản phẩm sẽ khác height sau khi load sản phẩm xong nên cần trigger lại sự kiện resize để virtual scroll hoạt động chính xác
       window.dispatchEvent(new Event('resize'));
    });
  }

  proccessData(data) {
    // const validCategoryIds = this.categories.map(c => c._id);

    const dataClone = JSON.parse(JSON.stringify(data));
    const dataReturn = dataClone.map((product) => {
      // Cập nhật chuỗi tên danh mục
      const name = Array.isArray(product.id_categorys)
        ? product.id_categorys
          .map((idCate) => {
            if (idCate === '') {
              return 'Trống';
            } else {
              return this.categories.find((find) => find._id === idCate)?.['name_' + this.functionService.selectedLanguageCode];
            }
          })
          .join(', ')
        : this.categories.find((find) => find._id === product.id_categorys)?.['name_' + this.functionService.selectedLanguageCode];

      product.category_name = name;
      // product.date = new Date();
      // this.vhQueryAutoWeb.updateNews(product._id, {
      //   date: product.date
      // })
      
      // xử lý id_category đã bị xóa 
      // let id_categorys = product.id_categorys.filter(id => validCategoryIds.includes(id));
      // if (id_categorys.length !== product.id_categorys.length) {
      //   this.vhQueryAutoWeb.updateWebApp(product._id, { id_categorys: id_categorys })
      //     .then((res) => {
      //       console.log('Cập nhật id_categorys thành công', res);
      //       product.id_categorys = id_categorys;
      //     })
      //     .catch((err) => {
      //       console.error('Lỗi cập nhật id_categorys', err);
      //     });
      // }
      return product;
    });

    return dataReturn
  }
  
  /** Hàm thực hiện mở popup thêm website
   *
   */
  addWebsiteFn(): void {
    if(!this.setupWebsiteImg) return;

    this.keySearch = ''
    const dialogRef = this.dialog.open(AddWebsiteAppComponent, {
      width: '70vw',
      height: '80vh', 
      data: {
        categories: this.categories,
        setupWebsiteImg: this.setupWebsiteImg,
        setupCategoryImg: this.setupCategoryImg
      }

    });

    dialogRef.afterClosed().subscribe((result) => {
      this.functionService.languageTempCode = this.functionService.selectedLanguageCode;
      if (result && (this.idCategory == 'all' || result.id_categorys.includes(this.idCategory))) {
        this.websites = [this.proccessData([result])[0], ...this.websites];
      }
    });

  }

  /** Hàm thực hiện mở popup edit với id
   *
   * @param website: dữ liệu website được truyền cho popup
   */
  editWebsite(website): void {

    if(!this.setupWebsiteImg) return;
    const dialogRef = this.dialog.open(EditWebsiteAppComponent, {
      width: '70vw',
      height: '80vh', 
      data: {
        categories: this.categories,
        setupWebsiteImg: this.setupWebsiteImg,
        setupCategoryImg: this.setupCategoryImg,
        dataEditWebsite: website
      }

    });

    dialogRef.afterClosed().subscribe((result) => {
      this.functionService.languageTempCode = this.functionService.selectedLanguageCode;
      if (result) {
        this.websites = this.websites.map(p => p._id === result._id ? this.proccessData([result])[0] : p)
      }
    });
  }

  /** Hàm thực hiện xác nhận xóa website và thực hiện xóa website
   *
   * @param website
   */
  deleteWebsite(website) {
    this.vhComponent
      .alertConfirm('', this.languageService.translate('xoa_website'), website[this.nameField], this.languageService.translate('dong_y'), this.languageService.translate('thoat'))
      .then(
        (ok) => {
          if (ok == 'OK') {
            this.vhQueryAutoWeb.deleteWebApp(website._id).then(
              (res: any) => {
                console.log('res', res);
                if (res.vcode === 0) {
                  this.websites = this.websites.filter((item) => item._id != website._id);
                  this.functionService.createMessage('success',this.languageService.translate('xoa_website_thanh_cong'));
                }
                if (res.vcode === 11) {
                  this.functionService.createMessage(
                    'error',
                    this.languageService.translate('phien_dang_nhap_da_het_han')
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

  /** Hàm thực hiện cập nhật trạng thái website
   *
   * @param item
   * @param objectUpdate
   */
  updateHiddenWebsite(item, objectUpdate) {
    this.vhQueryAutoWeb
      .updateWebApp(item._id, objectUpdate)
      .then((res: any) => {
        console.log('res', res);
        if (res.vcode === 0) {
          this.functionService.createMessage(
            'success',
            this.languageService.translate('cap_nhat_website_thanh_cong')
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

  /**
   * hàm này render option danh mục có dấu - thể hiện cấp độ
   * @param category danh mục cần render
   * @returns 
   */
  renderOptionCategory(category) {
    if(category.step) {
      return Array(category.step).fill(0).map((_, i) => i).map(() => '- ').join('') + category['name_' + this.functionService.languageTempCode]
    }
    return category['name_' + this.functionService.languageTempCode]
  }

  onSearch(): void {
    this.idCategory = 'all'
    this.resetPagination();
    this.vhQueryAutoWeb.searchList_likeSearch('webapps', this.nameField, this.keySearch, {}, {})
      .then((res: any) => {
        console.log('res', res);
        if (res.vcode === 0) {
          this.dataSearched = res.data.filter((item) => item.sub_type === 2);
          this.dataSearched.forEach((website) => {
            // Cập nhật chuỗi tên danh mục
            const name = Array.isArray(website.id_categorys)
              ? website.id_categorys
                .map((idCate) => {
                  if (idCate === '') {
                    return 'Trống';
                  } else {
                    return this.categories.find((find) => find._id === idCate)?.['name_' + this.functionService.selectedLanguageCode];
                  }
                })
                .join(', ')
              : this.categories.find((find) => find._id === website.id_categorys)?.['name_' + this.functionService.selectedLanguageCode];
    
            website.category_name = name;
          });
          this.handlePaginateLocal();
        }
      }, (error: any) => {
        console.log('error', error)
      })
  }


  handlePaginateLocal() {
    let data_filter = this.dataSearched 
    switch (true) {
      case this.sort.hasOwnProperty(this.nameField): {
        data_filter = this.sort[this.nameField] == 1 ?  this.vhAlgorithm.sortStringbyASC(data_filter, this.nameField)  : this.vhAlgorithm.sortStringbyDESC(data_filter, this.nameField)
        break;
      }
    }
    let data_page = new Array(); //mảng dữ liệu phân theo page
    for (let i = 0; i < data_filter.length; i++) {
      if ((i >= this.limit * (this.pageCurrent - 1)) && (i < this.limit * this.pageCurrent)) 
        data_page.push(data_filter[i]);
    }
    this.totalPages = Math.ceil(data_filter.length / this.limit); // tổng số page
    this.websites =  data_page
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
    switch (field) {
      case this.nameField: {
        this.sort = { [this.nameField]: this.sortby[field] ? 1 : -1 };
        break;
      }
    }

    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }else this.getWebsites()
  }

   /** pageCurrent thay đổi */
   pageIndexChange(event) {
    this.pageCurrent = event;
    if (this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }
    else 
      this.getWebsites();
  }

  /** limit thay đổi */
  limitChange(event) {
    this.resetPagination();
    this.limit = event;
    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    } else {
      this.getWebsites()
    }
  }
}
