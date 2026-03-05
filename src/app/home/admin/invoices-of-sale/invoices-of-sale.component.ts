import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import { DetailInvoiceOfSaleComponent } from './detail-invoice-of-sale/detail-invoice-of-sale.component';


@Component({
  selector: 'app-invoices-of-sale',
  templateUrl: './invoices-of-sale.component.html',
  styleUrls: ['./invoices-of-sale.component.scss']
})
export class InvoicesOfSaleComponent implements OnInit {
  /** biến dùng để chứa chiều cao của bảng dữ liệu */
  tableHeight: string; 
  /** danh sách danh mục để lọc */
  categories: Array<any> = [];
  /* Biến này hiển thị ở html xem sort theo trường nào */
  sortby: any = { 
    bill_code: false,
  };
  /* Biến này truyền vào hàm để sort */
  sort: any = { bill_code: 1 };
  /**Dùng tìm kiếm sản phẩm */
  keySearch: string = ''; 
  /** mảng chưa danh sách sp search */  
  dataSearched: any  = [] 
  /** Danh sách bills hiển thị */
  bills: any[] = []; // 
  /** biến ẩn hiện loading ở table khi get dữ liệu */
  loading = false;  
  /** lọc theo ngày */
  date = [new Date(), new Date()];
  
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

  constructor(
    public vhAlgorithm: VhAlgorithm,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    private dialog: MatDialog,
  private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

  }

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

  /** Hàm này get hóa đơn */
  getBills() {
    this.loading = true;
    this.vhQueryAutoWeb.getBills_byFields_byPages
    (
      { 
        date: { $gte: new Date(this.date[0].setHours(0, 0, 0)), $lte: new Date(this.date[1].setHours(23, 59, 59, 59)) },
        bill_type: { $eq: 1 },
        // --- Điều kiện HOẶC ---
        $or: [
          
          // Kịch bản 1: (paid_online == true VÀ confirmed == true)
          { 
            paid_online: true,
            confirmed: true 
          },
          
          // Kịch bản 2: (paid_online KHÔNG TỒN TẠI VÀ confirmed KHÔNG TỒN TẠI)
          { 
            paid_online: { $exists: false },
            confirmed: { $exists: false }
          }
        ]
      },
      {},
      this.sort,
      this.limit,
      this.pageCurrent
      )
      .then((res: any) => {
        console.log(res);
        if (res.vcode === 0) {
          this.bills = res.data
          this.totalPages = res.totalpages || 1;

          // new Event('resize') tạo ra một event có type = "resize".
          // Khi phát đi, tất cả các listener đang lắng nghe sự kiện resize của window sẽ được gọi.
          // height lúc chưa load sản phẩm sẽ khác height sau khi load sản phẩm xong nên cần trigger lại sự kiện resize để virtual scroll hoạt động chính xác
          window.dispatchEvent(new Event('resize'));
        }
      }, (error: any) => {
        console.error(error);
      })
      .finally(() => this.loading = false)
  }

  // Hiển thị chi tiết
  showDetail(id_bill) {
    this.dialog.open(DetailInvoiceOfSaleComponent, {
      height: '600px',
      width: '1200px',
      data: id_bill
    })
  }

  // xóa chi tiết
  deleteDetail(id_bill) {
    this.vhQueryAutoWeb.deleteBill_Billdetail(id_bill)
    .then((bool) => {
      if (bool) {
        this.bills = this.bills.filter(e => e._id != id_bill);
        this.functionService.createMessage("success", "xoa_don_thanh_cong")
      } else {
        this.functionService.createMessage("error", "xoa_don_that_bai")
      }
    }, (error: any) => {
      console.error('error ', error);
    })
  }
  trackByFn(index: number, item: any) {
    return item._id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }

  /** pageCurrent thay đổi */
  pageIndexChange(event) {
    this.pageCurrent = event;
    this.getBills();
  }

  /** limit thay đổi */
  limitChange(event) {
    this.resetPagination();
    this.limit = event;
    this.getBills()
  }

  handleSort(field) {
    this.sortby[field] = !this.sortby[field];
    this.sort = { [field]: this.sortby[field] ? 1 : -1 }

    this.getBills();
  }

  
  /**
 * hàm này reset pagination về 1
 */
  resetPagination() {
    this.pageCurrent = 1;
    this.pageGoto = 1;
    this.pageShowChoose = [0, 1, 2];
  }


  
}
