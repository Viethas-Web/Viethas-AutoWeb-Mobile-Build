import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { VhAlgorithm, VhEventMediator, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import { LanguageService } from 'src/app/services/language.service';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-list-products',
  templateUrl: './list-products.component.html',
  styleUrls: ['./list-products.component.scss']
})
export class ListProductsComponent implements OnInit {
  @Input() productList: any[];
  @Input() idMainSector: string;
  @Input() dataRender: any;
  @Input() mainSectors: any;
  /** biến dùng để chứa chiều cao của bảng dữ liệu */
  tableHeight: string;
  /** danh sách danh mục để lọc */
  categories: Array<any> = [{
    _id: 'all',
    name: 'Tất cả',
  }];
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
  dataSearched: any = []
  /** Danh sách sản phẩm hiển thị */
  products: any[] = []; // 
  /** biến ẩn hiện loading ở table khi get dữ liệu */
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

  /** Lấy trường name theo ngôn ngữ đang được chọn */
  get nameField() {
    return 'name_' + this.functionService.selectedLanguageCode;
  }


  constructor(
    public vhAlgorithm: VhAlgorithm,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    private changeDetectorRef: ChangeDetectorRef,
    private vhEventMediator: VhEventMediator,
    private languageService: LanguageService,
    private modal: NzModalRef
  ) { }

  ngOnInit(): void {

    this.getCategory();
  }

  trackByFn(index: number, item: any) {
    return item._id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }

  languageChangedSubscription
  ngAfterViewInit(): void {
    this.languageChangedSubscription = this.vhEventMediator.configChanged.subscribe((message: any) => {
      if (message?.status === 'update-language') {
        this.keySearch = '';
        this.products = [];
        this.totalPages = 0
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
    this.vhQueryAutoWeb
      .getCategorys_byFields(
        { id_main_sectors: { $all: [this.dataRender[this.idMainSector].col_search] } },
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
                    this.categories.push({
                      ...e,
                      array_step: Array(e.step)
                        .fill(0)
                        .map((_, i) => i),
                    })
                  });


                }
              },
              (error: any) => {
                console.log('error', error);
              }
            );
        }
      });
  }

  /** 
   * Hàm thực hiện lấy danh sách sản phẩm 
   */
  getProducts() {
    this.loading = true;
    this.keySearch = '';
    let query: any = { type: { $eq: 3 } }
    if (this.idCategory != 'all') {
      query = {
        ...query,
        id_categorys: { $all: [this.idCategory] }
      }
    }
    let promise = this.onGetProduct(this.idMainSector);

    promise
      .then((res: any) => {
        console.log(res);
        this.products = this.proccessData(res.data);
        // lưu ý totalpages ko viết hoa chữ p
        this.totalPages = res.totalpages;
      })
      .catch((error) => console.error(error))
      .finally(() => this.loading = false);
  }

  onGetProduct(idMainSector) {
    let query: any = {}
    if (this.idCategory != 'all') {
      query = {
        ...query,
        id_categorys: { $all: [this.idCategory] }
      }
    }
    const methodMap: { [key: string]: () => Promise<any> } = {
      food_drink: () => {
        query = {
          ...query,
          type: { $eq: 1 },
        }
        return this.vhQueryAutoWeb.getFoods_byFields(query, {}, {}, 10, 0)
      },
      ecommerce: () => {
        query = {
          ...query,
          type: { $eq: 3 },
        }
        return this.vhQueryAutoWeb.getProducts_byFields(query, {}, {}, 10, 0)
      },
      service: () => {
        query = {
          ...query,
          type: { $eq: 2 },
        }
        return this.vhQueryAutoWeb.getServices_byFields(query, {}, {}, 10, 0)
      },
      webapp: () => {
        return this.vhQueryAutoWeb.getWebApps_byFields({ id_main_sector: { $eq: 'webapp' }, sub_type: { $eq: 1 }, ...query }, {}, {}, 10, 0)
      }
    };

    const selectedMethod = methodMap[idMainSector];

    if (selectedMethod) {
      return selectedMethod(); // Gọi đúng hàm
    } else {
      return Promise.reject('Component không hợp lệ: ' + idMainSector);
    }
  }

  // biến đổi dữ liệu get về để hiển thị
  proccessData(data) {
    const dataClone = JSON.parse(JSON.stringify(data));
    const dataReturn = dataClone.map((product) => {
      product.show_expand = false;

      if (product.units) {
        product.unitDefault = product.units.find(
          (item) => item.default == true
        );
      }

      if (product.subs?.length) {
        product.subs.forEach((sub) => {
          sub.unitDefault = sub?.units?.find((e) => e.default);
        });
      }
      // Cập nhật chuỗi tên danh mục
      const name = Array.isArray(product.id_categorys)
        ? product.id_categorys
          .map((idCate) => {
            if (idCate === '') {
              return 'Trống';
            } else {
              return this.categories.find((find) => find._id === idCate)?.['name_' + this.functionService.selectedLanguageCode]
            }
          })
          .join(', ')
        : this.categories.find((find) => find._id === product.id_categorys)?.['name_' + this.functionService.selectedLanguageCode]
      product.category_name = name;

      return product;
    });
    return dataReturn;
  }

  handleSort(field) {
    this.sortby[field] = !this.sortby[field];
    this.sort = { [field]: this.sortby[field] ? 1 : -1 }

    if (this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    } else {
      this.getProducts();
    }
  }



  /** Hàm thực hiện cập nhật trạng thái sản phẩm
   *
   * @param item
   * @param objectUpdate
   */
  updateData(item, objectUpdate) {
    const promise = this.onUpdateDate(item, objectUpdate)
    promise
      .then((res: any) => {
        // console.log('res', res);
        if (!this.productList.some((p: any) => p._id === item._id)) {
          this.productList.push(item);
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

  onUpdateDate(item, objectUpdate) {

    const methodMap: { [key: string]: () => Promise<any> } = {
      food_drink: () => {
        return this.vhQueryAutoWeb.updateFood(item._id, objectUpdate)
      },
      ecommerce: () => {
        return this.vhQueryAutoWeb.updateProduct(item._id, objectUpdate)
      },
      service: () => {
        return this.vhQueryAutoWeb.updateService(item._id, objectUpdate)
      },
      webapp: () => {
        return this.vhQueryAutoWeb.updateWebApp(item._id, objectUpdate)
      }
    };

    const selectedMethod = methodMap[this.idMainSector];

    if (selectedMethod) {
      return selectedMethod(); // Gọi đúng hàm
    } else {
      return Promise.reject('Component không hợp lệ: ' + this.idMainSector);
    }
  }




  generateSymBol(array: []) {
    let string = '';
    array.forEach((_) => {
      string = string + `- `;
    });
    return string;
  }

  /**
   * hàm này search sản phẩm theo tên
   */
  onSearch(): void {
    this.loading = true;
    this.idCategory = 'all';
    this.resetPagination();
    this.vhQueryAutoWeb.searchList_likeSearch('products', this.nameField, this.keySearch, {}, {})
      .then((res: any) => {
        // console.log('res', res);
        if (res.vcode === 0) {
          this.dataSearched = this.proccessData(res.data);
          this.handlePaginateLocal();
        }
      }, (error: any) => {
        console.error('error', error)
      })
      .finally(() => this.loading = false);
  }

  /** Phân trang sản phẩm khi search */
  handlePaginateLocal() {
    let data_filter = this.dataSearched
    switch (true) {
      case this.sort.hasOwnProperty(this.nameField): {
        data_filter = this.sort[this.nameField] == 1 ? this.vhAlgorithm.sortStringbyASC(data_filter, this.nameField) : this.vhAlgorithm.sortStringbyDESC(data_filter, this.nameField)
        break;
      }
    }

    let data_page = new Array(); //mảng dữ liệu phân theo page
    for (let i = 0; i < data_filter.length; i++) {
      if ((i >= this.limit * (this.pageCurrent - 1)) && (i < this.limit * this.pageCurrent)) data_page.push(data_filter[i]);
    }
    this.totalPages = Math.ceil(data_filter.length / this.limit); // tổng số page
    this.products = data_page
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
      this.getProducts();
  }

  /** limit thay đổi */
  limitChange(event) {
    this.resetPagination();
    this.limit = event;
    if (this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    } else {
      this.getProducts()
    }
  }

  close() {
    this.modal.close({
      productList: this.productList,
      idMainSector: this.idMainSector
    });
  }

}
