import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {
  /** Trang hiện tại */
  @Input() pageCurrent: number = 1;
  /** Tổng số trang */
  @Input() totalPages: number = 1;
  /** Số lượng bản ghi trên 1 trang */
  @Input() limit: number = 20;
  /** Số trang hiển thị = */
  @Input() pageShowChoose: any = [0, 1, 2]; 
  /** Trang đi đến  */
  @Input() pageGoto: number = 1;
  /** Mảng chứa số lượng sản phẩm hiển thị trong 1 trang */
  @Input() numberPerPage = [5, 10, 20, 50, 100, 200, 500, 1000]; 
  /** Chuyển trang */
  @Output() pageIndexChange:any = new EventEmitter();
  /** Thay đổi số lượng hiển thị trên trang trang */
  @Output() limitChange:any = new EventEmitter();

  constructor() { }

  ngOnInit() {
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

    // Thay đổi giá trị trang cho người dùng chọn
    if (this.pageCurrent < this.totalPages && this.pageCurrent > 1) {
      this.pageShowChoose = this.pageShowChoose.map((num, index) => {
        return (num = this.pageCurrent + index - 1);
      });
    }
    else {
      this.pageShowChoose = this.pageShowChoose.map((_, index) => this.pageCurrent + index - 1);
    }

    this.pageIndexChange.emit(this.pageCurrent);
  }

  /**
 * hàm này xử lý việc thay đổi limit
 * thay đổi limit thì phải reset lại pagination
 */
  handleChangeLimit() {
    this.limitChange.emit(this.limit);
  }

}
