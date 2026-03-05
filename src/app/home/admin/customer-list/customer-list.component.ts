import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { LanguageService } from 'src/app/services/language.service';
import { AddCustomerComponent } from './add-customer/add-customer.component';  
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { DatePipe } from '@angular/common'; 
import { EditCustomerComponent } from './edit-customer/edit-customer.component';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  /* Biến này chứa danh sách khách hàng khi tìm kiếm tìm kiếm */
  dataSearched: any = [];
  /* Biến này chứa danh sách khách hàng */
  customers: any = []; 
  /* Biến này dùng để hiển thị loading khi tải dữ liệu */
  loading: boolean = false;
  /* Biến này hiển thị ở html xem sort theo trường nào */
  sortby: any = { 
    name: false,
    email: false,
    date_register: false
  };
  /* Biến này dùng để tìm kiếm email khách hàng */
  keySearch: any = ''; 
  /* Biến này truyền vào hàm để sort */
  sort: any = { name: 1 };
  /* Biến dùng để chứa chiều cao của bảng dữ liệu */
  tableHeight: string; 
  /* Biến này lọc ngày đăng ký người dùng */
  date = [new Date(), new Date()]; 

  /* ----------------- Pagination ----------------- */
  /* Trang hiện tại */
  pageCurrent: number = 1;  
  /* Tổng số page của sản phẩm */
  totalPages: number = 1;  
  /* Giới hạn sản phẩm trên 1 trang */
  limit: number = 20;  
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
    public vhAlgorithm: VhAlgorithm,
    public translate: TranslateService,
    public languageService: LanguageService, 
    private nzModalService: NzModalService,
    private datePipe: DatePipe, 
    private functionService: FunctionService,
  ) {}

  ngOnInit(): void {}

  /**
    * Hàm lấy dữ liệu khách hàng
   */
  getData() {
    this.loading = true;
    this.keySearch = '';
    let query = {
      date_register: { 
        $gte: new Date(this.date[0].setHours(0, 0, 0)).toISOString(), 
        $lte: new Date(this.date[1].setHours(23, 59, 59, 59)).toISOString() 
      }
    }
    this.vhQueryAutoWeb.getCustomers_byFields(
      query, 
      {}, 
      this.sort, 
      this.limit, 
      this.pageCurrent
    )
      .then((res: any) => {
        // console.log('res', res);
        if (res.vcode === 0) {
          this.customers = res.data;
          this.totalPages = res.totalpages
        }
      }, (error: any) => { 
        console.error(error);
      })
      .finally(() => {
        this.loading = false;
      })
  }


  /* Hàm tìm kiếm email khách hàng */
  searchCustomer() {
    this.resetPagination();
    this.loading = true;
    this.vhQueryAutoWeb.getCustomers_byFields({email: { $eq: this.keySearch }}, {}, this.sort, this.limit, this.pageCurrent)
    .then((res:any) => {
      if (res.vcode === 0) {
        this.dataSearched = res.data;
        this.handlePaginateLocal();
      }

    })
    .catch((error) => console.error(error))
    .finally(() => this.loading = false)
  }

  /**
   * Hàm mở modal thêm khách hàng
   */
  openAddCustomer() {
    const modal:NzModalRef = this.nzModalService.create({
      nzContent: AddCustomerComponent,
      nzFooter: null,
      nzWidth: '60vw',
      nzClosable: false,
      nzMaskClosable: false,
     
    })

    modal.afterClose.subscribe(result => {
      // console.log('result', result)
      if (result) {
        this.customers = this.customers.concat(result)
      }
    });

  }
  /**
   * Hàm mở modal chỉnh sửa khách hàng
   */
  openEditCustomer(data) {
    const modal:NzModalRef = this.nzModalService.create({
      nzContent: EditCustomerComponent,
      nzFooter: null,
      nzWidth: '60vw',
      nzClosable: false,
      nzMaskClosable: false,
      nzComponentParams: {
        data: data
      }
     
    })

    modal.afterClose.subscribe(result => {
      // console.log('result', result)
      if (result) {
        this.customers = this.customers.map(e => e._id == result._id ? result : e)
      }
    });
  }
  deleteCustomer(data) {
    this.nzModalService.confirm({
      nzTitle: this.languageService.translate('xac_nhan_xoa_khach_hang_nay'),
      nzCancelText: this.languageService.translate('huy'),
      nzOnOk: () => {
        this.vhQueryAutoWeb.deleteCustomer(data._id)
        .then((res: any) => {
          console.log('res', res)
          if (res.vcode != 0) {
            this.functionService.createMessage("error", "xoa_khong_thanh_cong", res.msg)
            return
          }

          this.customers = this.customers.filter(e => e._id != data._id)
          this.functionService.createMessage("success", "xoa_thanh_cong")
        }, error => {
          console.error(error)
        })
      }
    })
  }

  /**
   * tải danh sách kh về file excel
   * @example this.exportListCustomer()
   */
  exportListCustomer() {
    let productExcel: Array<any> = [];
    this.customers.forEach((customer, index) => {
      let row: Object = new Object()
      row[this.languageService.translate("ten_khach_hang")] = customer['name'] ? customer['name'] : ''
      row[this.languageService.translate("gioi_tinh")] = customer['gender'] ? this.languageService.translate(customer['gender']) : ''
      row["Email"] = customer['email'] ? customer['email'] : ''
      row[this.languageService.translate("so_dien_thoai")] = customer['phone'] ? customer['phone'] : ''
      row[this.languageService.translate("ngay_dang_ky")] = customer['date_register'] ? this.formatDate(new Date(customer['date_register'])) : ''
      row[this.languageService.translate("dia_chi")] = customer['address'] ? customer['address'] : ''
      row[this.languageService.translate("quan_huyen")] = customer['district'] ? customer['district'] : ''
      row[this.languageService.translate("tinh_thanh_pho")] = customer['province'] ? customer['province'] : ''
      row[this.languageService.translate("quoc_gia")] = customer['country'] ? customer['country'] : ''
      productExcel.push(row)
      if (index == this.customers.length - 1) {
        this.vhAlgorithm.exportXLSX(productExcel, this.languageService.translate("Customer list"))
      }
    })
  }

  formatDate(date) {
    return this.datePipe.transform(date, "dd/MM/yyyy")
  }


 

  handlePaginateLocal() {
    let data_filter = this.dataSearched 

    switch (true) {
      case this.sort.hasOwnProperty('name'): {
        data_filter = this.sort.name == 1 ?  this.vhAlgorithm.sortStringbyASC(data_filter, 'name')  : this.vhAlgorithm.sortStringbyDESC(data_filter, 'name')
        break;
      }
      case this.sort.hasOwnProperty('email'): {
        data_filter = this.sort.email == 1 ?  this.vhAlgorithm.sortStringbyASC(data_filter, 'email')  : this.vhAlgorithm.sortStringbyDESC(data_filter, 'email')
        break;
      }
      case this.sort.hasOwnProperty('date_register'): {
        data_filter = this.sort.date_register == 1 ?  this.vhAlgorithm.sortDatebyASC(data_filter, 'date_register')  : this.vhAlgorithm.sortDatebyDESC(data_filter, 'date_register')
        break;
      }
    }

    let data_page = new Array(); //mảng dữ liệu phân theo page
    for (let i = 0; i < data_filter.length; i++) {
      if ((i >= this.limit * (this.pageCurrent - 1)) && (i < this.limit * this.pageCurrent)) data_page.push(data_filter[i]);
    }
    this.totalPages = Math.ceil(data_filter.length / this.limit); // tổng số page
    this.customers = data_page;
  }

  /** pageCurrent thay đổi */
  pageIndexChange(event) {
    this.pageCurrent = event;
    if (this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }
    else 
      this.getData();
  }

  /** limit thay đổi */
  limitChange(event) {
    this.resetPagination();
    this.limit = event;
    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    } else {
      this.getData()
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

  handleSort(field) {
    this.sortby[field] = !this.sortby[field];
    this.sort = { [field]: this.sortby[field] ? 1 : -1 }
    
    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    } else {
      this.getData();
    }
  }
  
}
