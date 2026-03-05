import { map } from 'rxjs/operators';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { VhAlgorithm, VhEventMediator, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import { LanguageService } from 'src/app/services/language.service';
import { ListProductsComponent } from './list-products/list-products.component';
import { DetailProductComponent } from './detail-product/detail-product.component';
import { VhComponent } from 'src/app/components/vh-component/vh-component';

@Component({
  selector: 'app-products-google-shopping',
  templateUrl: './products-google-shopping.component.html',
  styleUrls: ['./products-google-shopping.component.scss']
})
export class ProductsGoogleShoppingComponent implements OnInit {
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

  mainSectors: any = [
    { label: "san_pham", value: "ecommerce" },
    { label: "mon_an", value: "food_drink" },
    { label: "webapp", value: "webapp" },
    // { label: "dich_vu", value: "service" },
  ]
  mainSectorsInit: any;
  idMainSector: string = 'ecommerce';

  dataRender = {
    ecommerce: {
      title: 'danh_sach_san_pham_google_shopping',
      search: 'tim_kiem_ten_san_pham',
      name: 'thong_tin_san_pham',
      list: 'danh_sach_san_pham',
      col_search: 'products'
    },
    food_drink: {
      title: 'danh_sach_mon_an_google_shopping',
      search: 'tim_kiem_ten_mon_an',
      name: 'thong_tin_mon_an',
      list: 'danh_sach_mon_an',
      col_search: 'foods'
    },
    webapp: {
      title: 'danh_sach_website_google_shopping',
      search: 'tim_kiem_ten_website',
      name: 'thong_tin_website',
      list: 'danh_sach_website',
      col_search: 'webapps'
    },
    service: {
      title: 'danh_sach_dich_vu_google_shopping',
      search: 'tim_kiem_ten_dich_vu',
      name: 'thong_tin_dich_vu',
      list: 'danh_sach_dich_vu',
      col_search: 'services'
    },
  }


  constructor(
    public vhAlgorithm: VhAlgorithm,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    private changeDetectorRef: ChangeDetectorRef,
    private vhEventMediator: VhEventMediator,
    private languageService: LanguageService,
    private vhComponent: VhComponent,
    private nzModalService: NzModalService
  ) { }

  ngOnInit(): void {

    this.mainSectors = this.mainSectors.filter((e: any) => this.vhQueryAutoWeb.getlocalSubProject(
      this.vhQueryAutoWeb.getlocalSubProject_Working()._id
    ).main_sectors.some((item: string) => item === e.value))
    this.mainSectorsInit = [...this.mainSectors]
    this.getCategory()
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
    this.loadingCategory = true;
    const defaultAll = { _id: 'all', name: 'Tất cả' };

    const mainSectorIds = this.mainSectors.map((sector: any) => sector.value);
    if (!mainSectorIds.length) {
      this.categories = [defaultAll];
      this.loadingCategory = false;
      return;
    }

    this.vhQueryAutoWeb
      .getCategorys_byFields(
        { id_main_sectors: { $in: mainSectorIds } },
        {},
        {},
        0
      )
      .then((res: any) => {
        if (res.vcode === 0) {
          return this.vhQueryAutoWeb.getCategorySteps_byIdCategoryArray(
            res.data.map((e) => e._id)
          );
        }
        return Promise.resolve({ vcode: 1, data: [] });
      })
      .then((response: any) => {
        if (response.vcode === 0) {
          const mapped = response.data.map((e: any) => ({
            ...e,
            array_step: Array(e.step || 0).fill(0).map((_, i) => i),
          }));

          //loại bỏ trùng _id
          const filtered = mapped
            .filter(
              (cat: any, index: number, self: any[]) =>
                index === self.findIndex((t) => t._id === cat._id)
            );

          this.categories = [defaultAll, ...filtered];
        } else {
          this.categories = [defaultAll];
        }
      })
      .catch((err) => {
        console.error(err);
        this.categories = [defaultAll];
      })
      .finally(() => {
        this.loadingCategory = false;
        this.categoriesInit = [...this.categories]; 
      });
  }



  /** 
   * Hàm thực hiện lấy danh sách sản phẩm 
   */
  getProducts() {
    this.loading = true;
    this.keySearch = '';
    const promises = this.mainSectors.map((sector: any) => this.onGetProduct(sector.value));

    Promise.all(promises)
      .then((results: any[]) => {
        // gộp tất cả data từ nhiều sector
        const allDocs = results.flatMap((res: any, index: number) =>
          this.proccessData(res.data).map((item: any) => ({
            ...item,
            mainSector: this.mainSectors[index].value // Add mainSector to each item
          }))
        );

        // tính tổng docs từ backend
        const totalDocs = results.reduce(
          (sum, res) => sum + (res?.totaldocs || 0),
          0
        );
        this.totalPages = Math.ceil(totalDocs / this.limit);

        // paginate ở frontend
        const start = (this.pageCurrent - 1) * this.limit;
        const end = start + this.limit;
        this.products = allDocs.slice(start, end);
      })
      .catch((error) => console.error(error))
      .finally(() => {
        this.loading = false;
        this.categories = this.categoriesInit;
        this.mainSectors = this.mainSectorsInit;
      });
  }

  onGetProduct(idMainSector) {
    let query: any = {

      google_shopping_enable: { $eq: true }
    }
    if (this.idCategory && this.idCategory != 'all') {
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
        return this.vhQueryAutoWeb.getFoods_byFields(query, {}, {}, 0, 0)
      },
      ecommerce: () => {
        query = {
          ...query,
          type: { $eq: 3 },
        }
        return this.vhQueryAutoWeb.getProducts_byFields(query, {}, {}, 0, 0)
      },
      service: () => {
        return this.vhQueryAutoWeb.getServices_byFields(query, {}, {}, 0, 0)
      },
      webapp: () => {
        return this.vhQueryAutoWeb.getWebApps_byFields({ type: { $eq: 11 }, sub_type: { $eq: 1 }, ...query }, {}, {}, 0, 0)
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
  updateHiddenProduct(item, objectUpdate) {
    this.vhQueryAutoWeb
      .updateProduct(item._id, objectUpdate)
      .then((res: any) => {

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
    this.resetPagination();
    let query: any = {
      google_shopping_enable: { $eq: true }
    }
    if (this.idCategory && this.idCategory != 'all') {
      query = {
        ...query,
        id_categorys: { $all: [this.idCategory] }
      }
    }
    const promises = this.mainSectors.map((sector: any) => {
      return this.vhQueryAutoWeb.searchList_likeSearch(this.dataRender[sector.value].col_search, this.nameField, this.keySearch, query, {})
    });

    Promise.all(promises)
      .then((results: any[]) => {
        // gộp tất cả data từ nhiều sector
        this.dataSearched = results.flatMap((res: any) =>
          res?.data ? this.proccessData(res.data) : []
        );

        // tổng số trang = cộng lại hoặc tùy cách backend trả về
        const totalDocs = results.reduce((sum, res) => sum + (res?.totalDocs || 0), 0);
        this.totalPages = Math.ceil(totalDocs / this.limit); 
        this.handlePaginateLocal();
      })
      .catch((error) => console.error(error))
      .finally(() => {
        this.loading = false;
      });
    // this.vhQueryAutoWeb.searchList_likeSearch(this.dataRender[this.idMainSector].col_search, this.nameField, this.keySearch, { google_shopping_enable: { $eq: true } }, {})
    //   .then((res: any) => {
    //     if (res.vcode === 0) {
    //       this.dataSearched = this.proccessData(res.data);
    //       this.handlePaginateLocal();
    //     }
    //   }, (error: any) => {
    //     console.error('error', error)
    //   })
    //   .finally(() => this.loading = false);
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
    else this.getProducts();
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

  /** Hàm thực hiện cập nhật trạng thái sản phẩm
   *
   * @param item
   * @param objectUpdate
   */
  updateData(product, objectUpdate) {
    const promise = this.onUpdateDate(product, objectUpdate)
    promise
      .then((res: any) => {
        if (objectUpdate.google_shopping_enable === false) {
          this.products = this.products.filter((p: any) => p._id !== product._id);
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

  onUpdateDate(product, objectUpdate) {

    const methodMap: { [key: string]: () => Promise<any> } = {
      food_drink: () => {
        return this.vhQueryAutoWeb.updateFood(product._id, objectUpdate)
      },
      ecommerce: () => {
        return this.vhQueryAutoWeb.updateProduct(product._id, objectUpdate)
      },
      webapp: () => {
        return this.vhQueryAutoWeb.updateWebApp(product._id, objectUpdate)
      }
    };

    const selectedMethod = methodMap[product.mainSector];

    if (selectedMethod) {
      return selectedMethod(); // Gọi đúng hàm
    } else {
      return Promise.reject('Component không hợp lệ: ' + product.mainSector);
    }
  }

  handleShowStructure(pro) {
    const modal: NzModalRef = this.nzModalService.create({
      nzWidth: '80%',
      nzContent: DetailProductComponent,
      nzFooter: null,
      nzCloseIcon: null,
      nzComponentParams: {
        product: pro
      }

    });

    modal.afterClose.subscribe((result) => {
      if (result) {

      }
    });
  } 

  handleFeedXml() {
    const siteUrl = window.location.origin;   // domain: https://webappgiare.vn

    // Tạo title và description dựa vào url
    const title = `Danh sách sản phẩm từ ${siteUrl}`;
    const description = `Nguồn cấp dữ liệu sản phẩm được tạo từ ${siteUrl}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>${this.escapeXml(title)}</title>\n`;
    xml += `    <link>${siteUrl}</link>\n`;
    xml += `    <description>${this.escapeXml(description)}</description>\n`;

    this.products.forEach((pro: any) => {
      const g = pro.google_shopping;
      xml += `    <item>\n`;
      xml += `      <g:id>${g.id}</g:id>\n`;
      xml += `      <g:title>${this.escapeXml(g.title)}</g:title>\n`;
      xml += `      <g:description>${this.escapeXml(g.description)}</g:description>\n`;
      xml += `      <g:link>${g.link}</g:link>\n`;
      xml += `      <g:image_link>${g.image_link}</g:image_link>\n`;
      xml += `      <g:price>${g.price}</g:price>\n`;
      xml += `      <g:availability>${g.availability}</g:availability>\n`;
      xml += `      <g:brand>${g.brand}</g:brand>\n`;
      xml += `      <g:condition>${g.condition}</g:condition>\n`;
      xml += `      <g:product_type>${g.product_type ?? g.type_product}</g:product_type>\n`;
      xml += `      <g:google_product_category>${g.google_product_category}</g:google_product_category>\n`;

      if(g.additional_image_links && g.additional_image_links.length) {
        g.additional_image_links.filter((link: string) => link && link.trim() !== '')
        .forEach((link:string) => {
          xml += `<g:additional_image_link>${link}</g:additional_image_link>\n`;
        })
      }
      xml += `    </item>\n`;
    });

    xml += `  </channel>\n`;
    xml += `</rss>`;

    // Xuất file để tải về
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feed.xml';
    a.click();
    window.URL.revokeObjectURL(url);
  }


  // escape text để không bị lỗi XML khi có ký tự đặc biệt
  escapeXml(value: string) {
    if (!value) return '';
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  /** 
   * Xuất tệp ra XLSX
   */
  handleFeedSheet() {
    if (this.products && this.products.length) {
      let XLSXData: any[] = [];

      this.products.forEach((pro: any, index) => {
        const g = pro.google_shopping; // dữ liệu trong field google_shopping
        let row: any = {};

        row['id'] = g.id;
        row['title'] = g.title;
        row['description'] = g.description;
        row['link'] = g.link; // hoặc `${window.location.origin}/product/${g.id}`
        row['image_link'] = g.image_link;
        row['price'] = g.price;
        row['availability'] = g.availability;
        row['brand'] = g.brand;
        row['condition'] = g.condition;
        row['product_type'] = g.product_type;
        row['google_product_category'] = g.google_product_category;

        XLSXData.push(row);

        // Nếu là phần tử cuối thì lưu file
        if (index === this.products.length - 1) {
          this.vhAlgorithm.exportXLSX(XLSXData, 'feed').then(() => {
            // thành công
          }).catch(err => {
            console.error(err);
            this.vhComponent.alertMessage(
              this.languageService.translate('Error'),
              this.languageService.translate('An error occurred'),
              '',
              this.languageService.translate('Cancel')
            );
          });
        }
      });
    }
  }

  getProductsByMainSector(sector: any) {
    this.products = [];
    this.totalPages = 0;
    this.keySearch = '';
    this.idCategory = null;
    if (sector._id === 'all') {
      const mainSectors: any = [
        { label: "san_pham", value: "ecommerce" },
        { label: "mon_an", value: "food_drink" },
        { label: "webapp", value: "webapp" },
        // { label: "dich_vu", value: "service" },
      ]
      // Nếu chọn "Tất cả" thì lấy tất cả main_sectors của subProject hiện tại
      this.mainSectors = mainSectors.filter((e: any) =>
        this.vhQueryAutoWeb
          .getlocalSubProject(this.vhQueryAutoWeb.getlocalSubProject_Working()._id)
          .main_sectors.includes(e.value)
      );
    } else {
      // Nếu chọn sector cụ thể
      this.mainSectors = [sector];
    }
    // this.getProducts();
  }
}