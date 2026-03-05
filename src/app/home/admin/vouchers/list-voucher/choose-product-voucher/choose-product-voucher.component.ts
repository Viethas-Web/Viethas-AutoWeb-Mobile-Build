import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';


@Component({
  selector: 'app-choose-product-voucher',
  templateUrl: './choose-product-voucher.component.html',
  styleUrls: ['./choose-product-voucher.component.scss']
})
export class ChooseProductVoucherComponent implements OnInit {
  /** danh sách danh mục để lọc */
  listCategories: any = []
  /** danh sách sản phẩm đã chọn */
  listProductChoosed: any
  id_category: string = 'all'
  id_category_selected: string = 'all'
  pageCurrent: number = 1; // Trang hiện tại
  totalPages: number = 1; // Tổng số page của sản phẩm
  pageGoto: number = 1; /** Trang người dùng chuyển tới hiển thị = */
  pageShowChoose:number[] = [0, 1, 2];
  isASC: boolean = true; // true. A->Z, false. Z->A
  limit:number = 20;

  currentValue:  'product' | 'food' = 'product'

  /** Biến này là giá trị của input search name product */
  searchNameProduct:string = ''

  /** mảng chưa danh sách sp search */  
  public data_searched: any  = [] 
   /** Danh sách sản phẩm hiển thị */
  public products: any = []; // 
   /** biến ẩn hiện loading ở table của sp khi get dữ liệu */
  loading = false;  
  /** Mảng chứa số lượng sản phẩm hiển thị trong 1 trang */
  numberPerPage = [5, 10, 20, 50, 100]; 

  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public dialogRef: MatDialogRef<ChooseProductVoucherComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private vhAlgorithm: VhAlgorithm
  ) { }

  ngOnInit() {
    this.listCategories = this.data.listCategories
    this.listProductChoosed = [...this.data.listProductChoosed]
  }

  close() {
    this.dialogRef.close(false);
  }

  onSearchProduct() {
    this.id_category = this.id_category_selected = 'all';
    this.resetPagination();
    this.vhQueryAutoWeb.searchList_likeSearch(this.currentValue == 'product' ? 'products' : 'foods', 'name', this.searchNameProduct, {}, {})
      .then((res: any) => {
        console.log('res', res);
        if (res.vcode === 0) {
          this.data_searched = res.data;

          for (let i in this.data_searched) {
            this.data_searched[i]['show_expand'] = false;
    
            if (this.data_searched[i].units) {
              this.data_searched[i].unitDefault = this.data_searched[i].units.find(
                (item) => item.default == true
              );
            }
            if (this.data_searched[i].subs) {
              if (this.data_searched[i].subs.length) {
                this.data_searched[i].subs.forEach((element) => {
                  if (element.units) {
                    element['unitDefault'] = element.units.find((e) => e.default);
                  }
                });
              }
            }
          }

          this.data_searched.forEach((product) => {
            product.isChoose = this.listProductChoosed.some(prod => prod._id === product._id);
          })

          this.products = this.handlePaginateLocal();
        }
      }, (error: any) => {
        console.log('error', error)
      })
  }

  generateSymBol(array: []) {
    let string = '';
    array.forEach((_) => {
      string = string + `- `;
    });
    return string;
  }

  /**
 * hàm này reset pagination về 1
 */
  resetPagination() {
    this.pageCurrent = 1;
    this.pageGoto = 1;
    this.pageShowChoose = [0, 1, 2];
  }

  /**Sắp xếp sản phẩm theo thứ tự
   *
   */
  sortProducts() {
    this.searchNameProduct = ''
    this.getProducts({ name: this.isASC ? 1 : -1 });
  }

  handleSort() {
    this.isASC = !this.isASC; 
    if(this.searchNameProduct) {
      this.products = this.handlePaginateLocal();
    }else {
      this.sortProducts();
    }
  }

  onChangeCurrentValue() {
    this.searchNameProduct = ''
    this.id_category = this.id_category_selected = 'all';
    this.products = [];
    this.resetPagination();
  }

   /** Hàm thực hiện lấy danh sách sản phẩm
   *
   * @param 
   */
   getProducts(sort) {
    this.loading = true;
    if (this.id_category_selected != this.id_category) {
      this.resetPagination();
      this.id_category_selected = this.id_category;
    }

    this.loading = true;
    let queryProduct = this.id_category == 'all' ? {} : { id_categorys: { $all: [this.id_category] } };
    let promise = 

    this.vhQueryAutoWeb.getProducts_byFields(
       queryProduct,
        {},
        sort,
        this.limit,
        this.pageCurrent
      ) 

    Promise.all([promise]).then(([res]: any) => {
      let products = res.data
      console.log(res);
      
      for (let i in products) {
        products[i]['show_expand'] = false;

        if (products[i].units) {
          products[i].unitDefault = products[i].units.find(
            (item) => item.default == true
          );
        }
        if (products[i].subs) {
          if (products[i].subs.length) {
            products[i].subs.forEach((element) => {
              if (element.units) {
                element['unitDefault'] = element.units.find((e) => e.default);
              }
            });
          }
        }
      }

      products.forEach((product) => {
        product.isChoose = this.listProductChoosed.some(prod => prod._id === product._id);
      })
      this.products = products;
      this.totalPages = res.totalpages;
      this.loading = false;
    });

  }

 /** Hàm thực hiện add sản phẩm vừa chọn vào danh sách sản phẩm combo
 *
 * @param productChoice
 */
 chooseProductToVoucher(event: any, productChoice: any) {
  if(event) {
    this.listProductChoosed.push({
      ...productChoice,
      unit_choosed: productChoice.unitDefault,
      quantity: 1,
    })
  } else {
    this.listProductChoosed = this.listProductChoosed.filter((filter) => filter._id !== productChoice._id);
  }
}

  trackByFn(index: number, item: any) {
    return item.id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }

  onAddProductToVoucher() {
    this.dialogRef.close(this.listProductChoosed);
  }

   /** Chuyển trang đến trang trước
   *
   */
   gotoPreviousPage() {
    if (this.pageCurrent > 1) {
      this.transferFn(this.pageCurrent - 1);
    }
  }

  /** Chuyển trang đến trang sau
   *
   */
  gotoNextPage() {
    if (this.pageCurrent < this.totalPages) {
      this.transferFn(this.pageCurrent + 1);
    }
  }

   /** Chuyển trang -----------------
   * nếu là mảng danh sách search thì tự phân trang
   * khi có dữ liệu search thì phân trang dựa vào dữ liệu search
   * ngược lại get lại từ DB
   * @param value
   */
   transferFn(value: number): void {
    if (value == this.pageCurrent) return;
    this.pageCurrent = Number(value);
    this.pageGoto = Number(value);
    
    if (this.searchNameProduct) {
      this.products = this.handlePaginateLocal();
    }
    else 
      this.sortProducts();

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

  handlePaginateLocal() {
    let data_filter = this.id_category == 'all' ? this.data_searched : this.data_searched.filter(item => item.id_categorys.includes(this.id_category))
    data_filter = this.isASC ?  this.vhAlgorithm.sortStringbyASC(data_filter, 'name') : this.vhAlgorithm.sortStringbyDESC(data_filter, 'name')
    let data_page = new Array(); //mảng dữ liệu phân theo page
    for (let i = 0; i < data_filter.length; i++) {
      if ((i >= this.limit * (this.pageCurrent - 1)) && (i < this.limit * this.pageCurrent)) data_page.push(data_filter[i]);
    }
    this.totalPages = Math.ceil(data_filter.length / this.limit); // tổng số page

    return data_page
  }

   /**
   * hàm này xử lý việc thay đổi limit
   * thay đổi limit thì phải reset lại pagination
   */
   handleChangeLimit() {
    this.resetPagination();
    if(this.searchNameProduct) {
      const data_filter = this.id_category == 'all' ? this.data_searched : this.data_searched.filter(item => item.id_categorys.includes(this.id_category))
      let data_page = new Array(); //mảng dữ liệu phân theo page
      for (let i = 0; i < data_filter.length; i++) {
        if ((i >= this.limit * (this.pageCurrent - 1)) && (i < this.limit * this.pageCurrent)) data_page.push(data_filter[i]);
      }
      this.totalPages = Math.ceil(data_filter.length / this.limit); // tổng số page
      this.products =  data_page
    } else {
      this.sortProducts()
    }
  }
}
