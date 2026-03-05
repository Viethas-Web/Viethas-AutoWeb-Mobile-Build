import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LanguageService } from 'src/app/services/language.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FunctionService } from 'vhobjects-service';
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditByProductComponent implements OnInit {
  customer_group: any = []
  data_selected: any;
  formEdit: FormGroup;
  exchange: any = {
    points: '1',
    money: '1000'
  }
  synbol = JSON.parse(localStorage.getItem('vhsales_currencyFormat')).symbol.text
  products: any = []
  local_products: any = []
  list_search_products: any = [];
  list_select_products: any = [];
  show_select_product = false
  search_value = ''
  id_category: any = '';
  list_earning_points_product: any;
  list_category: any[] = []
  list_category_show: any[] = []

  /** mảng chưa danh sách sp search */  
  dataSearched: any  = [] 
  /* Biến này truyền vào hàm để sort */
  sort: any = { name: 1 };
  /**Dùng tìm kiếm sản phẩm */
  keySearch: string = '';
  /** get những sp theo danh mục */
  idCategory = 'all';
  dataCurrent: any = 'products';
  dataList: any = [
    {
      label: 'Sản phẩm',
      value: 'products',
      mainSector: 'ecommerce'
    },
    {
      label: 'Dịch vụ',
      value: 'services',
      mainSector: 'service'
    },
    {
      label: 'Combo',
      value: 'combos',
      mainSector: 'combo'
    },
    {
      label: 'Món ăn',
      value: 'foods',
      mainSector: 'food_drink'
    }
  ];

  loading = false;
  pageCurrent: number = 1; // Trang hiện tại
  totalPages: number = 1; // Tổng số page của sản phẩm
  limit: number = 10; // giới hạn sản phẩm trên 1 trang 
  pageShowChoose: any = [0, 1, 2]; /** Số trang hiển thị = */
  pageGoto: number = 1; /** Trang người dùng chuyển tới hiển thị = */
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public vhAlgorithm: VhAlgorithm, 
    private vhComponent: VhComponent,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private nzModalService: NzModalService,
    private languageService: LanguageService,
    private functionService: FunctionService
  ) {
    if(this.router.getCurrentNavigation()) this.data_selected = this.router.getCurrentNavigation().extras.state.data_selected
    else this.goBack()
  }

  ngOnInit(): void {
    this.initFormEdit(this.data_selected)

    this.getCategorys()

  }

  /** Hàm thực hiện lấy danh sách danh mục
   *
   */
  getCategorys() {
    const findMainSector = this.dataList.find(e => e.value == this.dataCurrent).mainSector
    // id_main_sector: { $in: [['ecommerce'],['service'],['food_drink'],['combo']] } // đang tìm cách query
    this.vhQueryAutoWeb.getCategorys_byFields({ id_main_sectors: { $all: [findMainSector]}}, {}, {}, 0)
      .then((res: any) => {
        console.log('getCategorys_byFields', res);
        if (res.vcode === 0) {
          res.data = res.data.filter(e => e.id_main_sectors.every(item => ['ecommerce', 'service', 'food_drink', 'combo'].includes(item)))
          this.vhQueryAutoWeb.getCategorySteps_byIdCategoryArray(res.data.map(e => { return e._id }))
            .then((response: any) => {
              if (response.vcode === 0) {
                this.list_category = response.data.map((e) => {
                  return {
                    ...e,
                    array_step: Array(e.step)
                      .fill(0)
                      .map((_, i) => i),
                  };
                });
                this.list_category_show = this.list_category
              }
            }, (error: any) => {
              console.log('error', error)
            })
        }

      });
  }

  generateSymBol(array: []) {
    let string = '';
    array.forEach((_) => {
      string = string + `- `;
    });
    return string;
  }
  searchLocalCategory(value) {
    this.list_category_show = this.vhAlgorithm.searchList(this.vhAlgorithm.changeAlias(value), this.list_category, ['name'])
  }


  getProducts() {
    this.loading = true;
    this.keySearch = '';
    let query = {}
    if(this.idCategory != 'all') {
      query = { id_categorys: { $all: [this.idCategory] }}
    }

    let promise = this.vhQueryAutoWeb.getProducts_byFields(
     query,
      {},
      this.sort,
      this.limit,
      this.pageCurrent
    );
    if(this.dataCurrent == 'foods') {
      promise = this.vhQueryAutoWeb.getFoods_byFields(
       query,
        {},
        this.sort,
        this.limit,
        this.pageCurrent
      );
    }
     if(this.dataCurrent == 'services') {
      promise = this.vhQueryAutoWeb.getServices_byFields(
       query,
        {},
        this.sort,
        this.limit,
        this.pageCurrent
      );
     }
     if(this.dataCurrent == 'combos') {
      promise = this.vhQueryAutoWeb.getCombos_byFields(
       query,
        {},
        this.sort,
        this.limit,
        this.pageCurrent
      );
     }
    Promise.all([promise])
      .then((res: any) => {
      if (res[0].vcode != 0) {
        console.error(res[0])
        this.functionService.createMessage('error', this.languageService.translate('co_loi_xay_ra_vui_long_thu_lai'), 2000);
        return;
      }
      let products = this.proccessData(res[0].data)

      this.products = products;
      this.totalPages = res[0].totalpages;
    })
    .catch((error) => console.error(error))
    .finally(() => this.loading = false);
  }

  
  /**
   * gán các giá trị của công thức nhận từ state vào form để xử lý
   */
  initFormEdit(data) {
    this.exchange = {
      points: data.exchange.points,
      money: data.exchange.money,
    }
    this.formEdit = new FormGroup({
      name: new FormControl(data.name, Validators.required),
      include_promotion_product: new FormControl(data.include_promotion_product),
    })

    let promise = [];
    for (let index = 0; index < this.data_selected.products.length; index++) {
      promise[index] = this.vhQueryAutoWeb.getProduct(this.data_selected.products[index])

    }
    let promise1 = [];
    for (let index = 0; index < this.data_selected.products.length; index++) {
      promise1[index] = this.vhQueryAutoWeb.getFood(this.data_selected.products[index])

    }
    let promise2 = [];
    for (let index = 0; index < this.data_selected.products.length; index++) {
      promise2[index] = this.vhQueryAutoWeb.getService(this.data_selected.products[index])

    }
    let promise3 = [];
    for (let index = 0; index < this.data_selected.products.length; index++) {
      promise3[index] = this.vhQueryAutoWeb.getCombo(this.data_selected.products[index])

    }
    Promise.all(
      promise.concat(promise1).concat(promise2).concat(promise3)
    ).then((res): any => {
      this.list_select_products = res.filter(item => item).map(e => {
        return {
          ...e,
          checked: true,
          unitDefault: e.units.find((unit) => unit.default == true)

        }
      })
    })
    

  }
  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route ,state : {}});
  }
  /**
   * bắt sk thay đổi money or points
   */
  changeExchange(field, value) {
    this.exchange[field] = value.replaceAll(/[.*+?^${}()|[\]\\,a-zA-Z]/g, '')
  }
  /**
   * cập nhật công thức lên DB
   */
  editData() {
    let data = this.formEdit.value;
    data['exchange'] = {
      points: parseFloat(this.exchange.points),
      money: parseFloat(this.exchange.money)
    }
    data['products'] = this.list_select_products.map(item => { return item._id })

    if (this.list_select_products.length) {
      if (this.formEdit.valid) {
        this.vhComponent.showLoading('').then(() => {
          this.vhQueryAutoWeb.updateEarningPointsProduct(this.data_selected._id, data).then((bool: any) => {
            this.vhComponent.hideLoading(0);
            if (bool) {
              this.vhComponent.alertMessageDesktop('success', this.languageService.translate("cap_nhat_chuong_trinh_tich_diem_thanh_cong"))

              this.router.navigate(['../'], { relativeTo: this.route, state: bool });
            }
            else this.vhComponent.alertMessageDesktop('error', this.languageService.translate("cap_nhat_trinh_tich_diem_that_bai"))
          }, error => {
            this.vhComponent.hideLoading(0);
            this.vhComponent.alertMessageDesktop('error', this.languageService.translate("cap_nhat_trinh_tich_diem_that_bai"))
            console.log('error', error);
          })
        })

      }
      else this.vhComponent.alertMessageDesktop('error', this.languageService.translate("Vui lòng điền đầy đủ thông tin"));
    }
    else {
      this.nzModalService.warning({
        nzTitle: this.languageService.translate("vui_long_chon_san_pham_ap_dung"),
        nzOnOk: () => {
          this.openModalSelectProduct()
        },
        nzCancelText: this.languageService.translate("Cancel"),
      })
    }
  }
  /**
     * mở modal chọn sp tích điểm
     */
  openModalSelectProduct() {
    this.show_select_product = true;
    this.products = this.list_search_products.filter(item => item.price >= this.exchange.money);
    console.log(this.products);


  }
  /**
   * xử lý khi nhấn ok modal chọn sp tích điểm
   */
  handleOkSelectProduct() {

  }

  /**
   * lọc sp theo tên
   */
  searchProducts(ev: string) {
    this.products = this.vhAlgorithm.searchList(this.vhAlgorithm.changeAlias(ev.toLocaleLowerCase()), this.list_search_products, ['name', 'barcode'])
  }

  // xử lý checkbox product
  chooseProduct(data) {
    if (!this.list_select_products.find(e => e._id == data._id)){
      data.checked = true
      this.list_select_products = this.list_select_products.concat([data])
     
    }
    else this.list_select_products = this.list_select_products.filter(e => e._id != data._id)
  }

  unChooseProduct(data) {
    this.list_select_products = this.list_select_products.filter(e => e._id != data._id)
  }

  /**
   * hàm này kiểm tra xem sp đã được thêm hay chưa để bật swich lên
   * @param data 
   */
  checkExited(data){
    return this.list_select_products.find(e => e._id == data._id) ? true : false
  }

  /**
 * hàm này reset pagination về 1
 */
  resetPagination() {
    this.pageCurrent = 1;
    this.pageGoto = 1;
    this.pageShowChoose = [0, 1, 2];
  }

  /**
   * hàm này search sản phẩm theo tên
   */
  onSearch(): void {
    this.loading = true;
    this.idCategory = 'all';
    this.resetPagination();
    this.vhQueryAutoWeb.searchList_likeSearch(this.dataCurrent.value, 'name', this.keySearch, {}, {})
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

      return product;
    });
    return dataReturn;
  }

  
  /** Phân trang sản phẩm khi search */
  handlePaginateLocal() {
    let data_filter = this.dataSearched
    switch (true) {
      case this.sort.hasOwnProperty('name'): {
        data_filter = this.sort.name == 1 ?  this.vhAlgorithm.sortStringbyASC(data_filter, 'name')  : this.vhAlgorithm.sortStringbyDESC(data_filter, 'name')
        break;
      }
    }

    let data_page = new Array(); //mảng dữ liệu phân theo page
    for (let i = 0; i < data_filter.length; i++) {
      if ((i >= this.limit * (this.pageCurrent - 1)) && (i < this.limit * this.pageCurrent)) data_page.push(data_filter[i]);
    }
    this.totalPages = Math.ceil(data_filter.length / this.limit); // tổng số page
    this.products =  data_page
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
    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    } else {
      this.getProducts()
    }
  }
}
