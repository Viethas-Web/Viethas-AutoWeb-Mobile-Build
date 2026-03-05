import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhEventMediator, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-choose-topping',
  templateUrl: './choose-topping.component.html',
  styleUrls: ['./choose-topping.component.scss']
})
export class ChooseToppingComponent implements OnInit {
  toppingsChoosed
  categoryToppings
  loading: boolean = false;
  searchNameTopping: string = '';
  toppings: any = []
  toppingsSelected: any = []

  idCategory: string = 'all'
  idCategorySelected: string = 'all'
  pageCurrent: number = 1; // Trang hiện tại
  totalPages: number = 1; // Tổng số page của sản phẩm
  pageGoto: number = 1; /** Trang người dùng chuyển tới hiển thị = */
  pageShowChoose: number[] = [0, 1, 2];
  isASC: boolean = true; // true. A->Z, false. Z->A
  limit: number = 20;
  /** mảng chưa danh sách sp search */
  dataSearched: any = []
  /** Mảng chứa số lượng sản phẩm hiển thị trong 1 trang */
  numberPerPage = [5, 10, 20, 50, 100];


  constructor(
    private matdialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ChooseToppingComponent>,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    private vhEventMediator: VhEventMediator,
    private vhAlgorithm: VhAlgorithm
  ) { }

  ngOnInit() {
    this.toppingsChoosed = this.data.toppingsChoosed;
    this.categoryToppings = this.data.categoryToppings;
  }

  close() {
    this.dialogRef.close(false);
  }

  trackByFn(index: number, item: any) {
    return item.id; // hoặc sử dụng một thuộc tính duy nhất khác của item
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

  /**Sắp xếp sản phẩm theo thứ tự
   *
   */
  sortToppings() {
    this.searchNameTopping = ''
    this.getToppings({ name: this.isASC ? 1 : -1 });
  }

  /** Hàm thực hiện lấy danh sách sản phẩm
  *
  * @param 
  */
  getToppings(sort) {
    this.loading = true;
    if (this.idCategorySelected != this.idCategory) {
      this.resetPagination();
      this.idCategorySelected = this.idCategory;
    }

    this.loading = true;
    let queryToppings = this.idCategory == 'all' ? {} : { id_categorys: { $all: [this.idCategory] } };


    let promise = this.vhQueryAutoWeb.getToppings_byFields(
      queryToppings,
      {},
      sort,
      this.limit,
      this.pageCurrent
    )
    Promise.all([promise]).then(([res]: any) => {
      let toppings = res.data
      toppings.forEach((product) => {
        product.isChoose = this.toppingsChoosed.some(prod => prod._id === product._id);
      })
      this.toppings = toppings;
      this.totalPages = res.totalpages;
      this.loading = false;
    });

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

    if (this.searchNameTopping) {
      this.toppings = this.handlePaginateLocal();
    }
    else
      this.sortToppings();

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
    let data_filter = this.idCategory == 'all' ? this.dataSearched : this.dataSearched.filter(item => item.idCategory.includes(this.idCategory))
    data_filter = this.isASC ? this.vhAlgorithm.sortStringbyASC(data_filter, 'name') : this.vhAlgorithm.sortStringbyDESC(data_filter, 'name')
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
    if (this.searchNameTopping) {
      const data_filter = this.idCategory == 'all' ? this.dataSearched : this.dataSearched.filter(item => item.idCategory.includes(this.idCategory))
      let data_page = new Array(); //mảng dữ liệu phân theo page
      for (let i = 0; i < data_filter.length; i++) {
        if ((i >= this.limit * (this.pageCurrent - 1)) && (i < this.limit * this.pageCurrent)) data_page.push(data_filter[i]);
      }
      this.totalPages = Math.ceil(data_filter.length / this.limit); // tổng số page
      this.toppings = data_page
    } else {
      this.sortToppings()
    }
  }

  /** Hàm thực hiện add sản phẩm vừa chọn vào danh sách sản phẩm combo
*
* @param productChoice
*/
  chooseToppingForFood(event: any, productChoice: any) {
    if (event) {
      this.toppingsSelected.push({
        ...productChoice,
        price: productChoice.units.find((item) => item.default == true).price,
        quantity: 1,
      })
    } else {
      this.toppingsSelected = this.toppingsSelected.filter((filter) => filter._id !== productChoice._id);
    }
  }

  /**
 * hàm này reset pagination về 1
 */
  resetPagination() {
    this.pageCurrent = 1;
    this.pageGoto = 1;
    this.pageShowChoose = [0, 1, 2];
  }

  onSearchTopping() {
    this.idCategory = this.idCategorySelected = 'all';
    this.resetPagination();
    this.vhQueryAutoWeb.searchList_likeSearch('toppings', 'name', this.searchNameTopping, {}, {})
      .then((res: any) => {
        if (res.vcode === 0) {
          this.dataSearched = res.data;

          this.dataSearched.forEach((product) => {
            product.isChoose = this.toppingsChoosed.some(prod => prod._id === product._id);
          })

          this.toppings = this.handlePaginateLocal();
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

  onChooseToppingForFood() {
    if(this.data.type == 'add') {
      this.dialogRef.close(this.toppingsSelected);
    } else {
      // topping liên kết
      const toppings = this.toppingsSelected.map((dish) => {
        return {
          id_topping: dish._id,
          quantity: dish.quantity,
        };
      });
      console.log('toppings', toppings);
      this.vhQueryAutoWeb.updateFood(this.data.food._id, { toppings: toppings }).then((res:any) => {
        this.dialogRef.close(this.toppingsSelected);
      })
      
    }
  }

  handleSort() {
    this.isASC = !this.isASC; 
    if(this.searchNameTopping) {
      this.toppingsChoosed = this.handlePaginateLocal();
    }else {
      this.sortToppings();
    }
  }
}
