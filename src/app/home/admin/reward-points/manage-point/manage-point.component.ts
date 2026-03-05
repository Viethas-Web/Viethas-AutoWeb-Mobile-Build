import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-manage-point',
  templateUrl: './manage-point.component.html',
  styleUrls: ['./manage-point.component.scss']
})
export class ManagePointComponent implements OnInit {
 
  formEditPoint: FormGroup;
  isVisible = false;
  itemEdit: any;
  /** Danh sách hạng khách hàng */
  customerClass: any = [];
  /** Danh sách khách hàng */
  customers: any = [];
  /** Biến search */
  keySearch: any = '';
  /** Biến filter theo hạng khách hàng */
  idCustomerClass: any = 'all' 
  /** biến ẩn hiện loading ở table khi get dữ liệu */
  loading = false;  
  /** Dữ liệu khi search */
  dataSearched: any = [];
  /* Biến này hiển thị ở html xem sort theo trường nào */
  sortby: any = { 
    name: false, 
    point_validity: false
  };
  /* Biến này truyền vào hàm để sort */
  sort: any = { name: 1 };


  earning_points_bills: any = [];
  earning_points_products: any = [];

  /* ----------------- Pagination ----------------- */
  /* Trang hiện tại */
  pageCurrent: number = 1;  
  /* Tổng số page của sản phẩm */
  totalPages: number = 1;  
  /* Giới hạn sản phẩm trên 1 trang */
  limit: number = 10;  
  /* Danh sách số lượng page */
  listNumbersPage: number[] = [];  
  /*Số trang hiển thị */
  pageShowChoose: any = [0, 1, 2]; 
  /* Trang người dùng chuyển tới hiển thị */
  pageGoto: number = 1; 
  /* Mảng chứa số lượng sản phẩm hiển thị trong 1 trang */
  numberPerPage = [5, 10, 20, 50, 100]; 
  

  constructor( 
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private functionService: FunctionService
  ) { }

  ngOnInit(): void {
    // this.customer_group = [{ _id: 'all', name: ("Tất cả") }].concat(this.vhQueryAutoWeb.getlocalCustomerClasss())
    this.getCustomerClass();
        
    this.vhQueryAutoWeb.getEarningPointsBills()
    .then((res:any) => {
      this.earning_points_bills = res.data;
    })

    this.vhQueryAutoWeb.getEarningPointsProducts()
    .then((res:any) => {
      this.earning_points_products = res.data;
    })
  }

  getCustomerClass() {
    this.vhQueryAutoWeb.getCustomerClasss_byFields({})
    .then((res: any) => {
      if(res.vcode == 0){
        this.customerClass = res.data;
      }
    })
    
  }

  /*---tìm kiếm khách hàng theo tên và email---*/
  searchCustomer(event) {
    this.functionService.createMessage('warning', 'Đang chờ hàm search của backend');
  }


  /**
   * get dữ liệu báo cáo
   */
  getCustomers() {
    this.loading = true;
    let query = {};
    if(this.idCustomerClass != 'all') {
      query['id_customer_class'] = { $eq: this.idCustomerClass };
    }

    this.vhQueryAutoWeb.getCustomers_byFields(query, {}, this.sort, this.limit, this.pageCurrent)
    .then((res:any) => {
      console.log('res', res);
      if(res.vcode == 0){
        this.customers = res.data.map(item => {
          const findCustomerClass = this.customerClass.find(ele => ele._id == item.id_customer_class);
          const findPointBill = this.earning_points_bills.find(ele => ele._id == findCustomerClass?.id_earning_points_bill)
          const findPointProduct = this.earning_points_products.find(ele => ele._id == findCustomerClass?.id_earning_points_product)
          return {
            ...item,
            
            class_name: findCustomerClass?.name,
            program_name: (findPointBill?.name || '') + '\n' + (findPointProduct?.name || '')
          }
        })
        this.totalPages = res.totalpages;
      }
    })
    .catch(err => console.error(err))
    .finally(() => this.loading = false)
  }


  /**
   * mở modal chỉnh sửa tích điểm
   */
  editEarningPoint(data) {
    this.formEditPoint = new FormGroup({
      point: new FormControl(data.earned_points || 0, [Validators.required]),
    })
    this.itemEdit = data;
    this.isVisible = true
  }
  /**
   * xử lý khi nhấn ok modal chỉnh sửa tích điểm
   */
  closeOkModal() {
    this.loading = true;
    this.vhQueryAutoWeb.updateCustomer_byEarnedPoints(this.itemEdit._id, this.formEditPoint.value['point']).then((bool)=>{
      console.log('updateCustomer_byEarnedPoints', bool)
      if(bool){
        this.customers.find(item => item._id ==this.itemEdit._id).earned_points =  this.formEditPoint.value['point']
      }
      this.isVisible = false
    })
    .catch(err => console.error(err))
    .finally(() => this.loading = false)

  }
  /**
   * xử lý khi nhấn ok modal chỉnh sửa tích điểm
   */
  closeCancelModal() {
    this.isVisible = false
  }



  onSearch() {

  }

  trackByFn(index: number, item: any) {
    return item._id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }


  handlePaginateLocal() {
    let data_filter =  this.dataSearched 
    // data_filter = this.isASC ?  this.vhAlgorithm.sortStringbyASC(data_filter, 'name') : this.vhAlgorithm.sortStringbyDESC(data_filter, 'name')
    let data_page = new Array(); //mảng dữ liệu phân theo page
    for (let i = 0; i < data_filter.length; i++) {
      if ((i >= this.limit * (this.pageCurrent - 1)) && (i < this.limit * this.pageCurrent)) data_page.push(data_filter[i]);
    }
    this.totalPages = Math.ceil(data_filter.length / this.limit); // tổng số page

    return data_page
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
      case 'name': {
        this.sort = { name: this.sortby[field] ? 1 : -1 };
        break;
      }
      case 'point_validityCol': {
        this.sort = { point_validityCol: this.sortby[field] ? 1 : -1 };
        break;
      }
    }
    
    if(this.keySearch) {
      this.customers = this.handlePaginateLocal();
    } else {
      this.getCustomers();
    }
  }


  /** pageCurrent thay đổi */
  pageIndexChange(event) {
    this.pageCurrent = event;
    if (this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }
    else 
      this.getCustomers();
  }

  /** limit thay đổi */
  limitChange(event) {
    this.resetPagination();
    this.limit = event;
    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    } else {
      this.getCustomers()
    }
  }
}
