import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-redirect-page',
  templateUrl: './redirect-page.component.html',
  styleUrls: ['./redirect-page.component.scss']
})
export class RedirectPageComponent implements OnInit {
  /** Mảng chứa danh sách URL hiển thị trên trang hiện tại */
  urls: any[] = [];
  /** Mảng chứa danh sách URL khi tìm kiếm cục bộ */
  dataSearched: any[] = [];
  /** Item mới chưa lưu (tối đa 1) */
  pendingUrl: any | null = null;
  loading = false;
  tableHeight: string;
  keySearch: string = '';
  /** Biến phân trang */
  pageCurrent: number = 1;
  totalPages: number = 1;
  limit: number = 5;
  pageShowChoose: number[] = [0, 1, 2];
  pageGoto: number = 1;
  sort: any = { old_url: 1 };

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.getUrls(); // Tải dữ liệu ban đầu
  }

  ngAfterViewInit(): void {
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

  onSearch() {
    // this.resetPagination();

    // if (this.keySearch.trim()) {
    //   this.pendingUrl = null;
    //   this.getUrls(); // gọi API để lấy dữ liệu mới cho từ khóa
    // } else {
    //   this.dataSearched = [];
    //   this.pendingUrl = null;
    //   this.getUrls(); // reset về danh sách ban đầu
    // }
  }

  resetPagination() {
    this.pageCurrent = 1;
    this.pageGoto = 1;
    this.pageShowChoose = [0, 1, 2];
  }

  getUrls() {
    this.loading = true;
    this.keySearch = '';
    let query: any = {} 
    this.vhQueryAutoWeb.getURLRedirects_byFields_byPages(
      query,
      {},
      this.sort,
      this.limit,
      this.pageCurrent
    )
      .then((res: any) => {
        this.urls = res.data;
        this.totalPages = Math.ceil(res.totaldocs / this.limit) || 1;
        this.dataSearched = this.pendingUrl ? [this.pendingUrl, ...res.data] : res.data;
        window.dispatchEvent(new Event('resize'));
        this.changeDetectorRef.detectChanges();
      })
      .catch((error) => {
        console.error(error);
        this.message.error('Lỗi khi tải danh sách URL');
      })
      .finally(() => (this.loading = false));
  }

  addUrlFn() {
    // Chỉ cho phép thêm 1 record mới chưa lưu
    if (this.pendingUrl) {
      this.message.error('Vui lòng lưu hoặc xóa URL hiện tại trước khi thêm URL mới');
      return;
    }
    const newUrl = {
      _id: `temp_${Date.now()}`,
      old_url: '',
      current_url: '',
      isEdited: true
    };
    this.pendingUrl = newUrl;
    this.dataSearched = [newUrl, ...this.dataSearched];
    this.urls = [newUrl, ...this.urls];
    this.resetPagination();
    this.handlePaginateLocal();
    this.changeDetectorRef.detectChanges();
  }

  saveUrl(item: any) {
    if (!item?.old_url || !item?.current_url) {
      this.message.error('Vui lòng nhập cả URL cũ và URL mới');
      return;
    }

    const oldUrlTrimmed = item.old_url.trim();
    const currentUrlTrimmed = item.current_url.trim();

    if (oldUrlTrimmed === currentUrlTrimmed) {
      this.message.error('URL cũ và URL mới không được trùng nhau');
      return;
    }

    const isDuplicateOldUrl = this.dataSearched.some(
      (u) =>
        u._id !== item._id &&
        u.old_url?.trim().toLowerCase() === oldUrlTrimmed.toLowerCase()
    );

    if (isDuplicateOldUrl) {
      this.message.error('URL cũ đã tồn tại trong danh sách, vui lòng nhập URL khác');
      return;
    }

    this.loading = true;
    const urlData = {
      old_url: oldUrlTrimmed,
      current_url: currentUrlTrimmed
    };

    const savePromise = item._id.startsWith('temp_')
      ? this.vhQueryAutoWeb.addURLRedirect(urlData)
      : this.vhQueryAutoWeb.updateURLRedirect(item._id, urlData);

    savePromise
      .then((res: any) => {
        if (item._id.startsWith('temp_')) {
          this.pendingUrl = null; // Xóa pendingUrl sau khi lưu
        }
        Object.assign(item, res.data);
        item.isEdited = false;
        this.message.success('Lưu URL thành công');
        this.getUrls(); // Làm mới dữ liệu từ server
      })
      .catch((error) => {
        console.error('Error saving URL:', error);
        this.message.error('Lỗi khi lưu URL');
      })
      .finally(() => (this.loading = false));
  }

  deleteUrl(item: any) {
    if (item._id.startsWith('temp_')) {
      this.pendingUrl = null; // Xóa pendingUrl
      this.urls = this.urls.filter((url) => url._id !== item._id);
      this.dataSearched = this.dataSearched.filter((url) => url._id !== item._id);
      this.handlePaginateLocal();
      this.changeDetectorRef.detectChanges();
      return;
    }

    this.loading = true;
    this.vhQueryAutoWeb.deleteURLRedirect(item._id)
      .then(() => {
        this.message.success('Xóa URL thành công');
        this.getUrls(); // Làm mới dữ liệu từ server
      })
      .catch((error) => {
        console.error('Error deleting URL:', error);
        this.message.error('Lỗi khi xóa URL');
      })
      .finally(() => (this.loading = false));
  }

  sortField(field: string) {
    this.sort = { [field]: this.sort[field] === 1 ? -1 : 1 };
    this.resetPagination();
    this.pendingUrl = null; // Xóa pendingUrl khi sắp xếp
    this.dataSearched = this.dataSearched.filter((url) => !url._id.startsWith('temp_'));
    this.urls = this.urls.filter((url) => !url._id.startsWith('temp_'));
    this.getUrls();
  }

  trackByFn(index: number, item: any) {
    return item._id;
  }

  pageIndexChange(event: number) {
    this.pageCurrent = event;
    if (this.pendingUrl) {
      // Xóa pendingUrl khi chuyển trang
      this.pendingUrl = null;
      this.dataSearched = this.dataSearched.filter((url) => !url._id.startsWith('temp_'));
      this.urls = this.urls.filter((url) => !url._id.startsWith('temp_'));
    }
    if (this.keySearch.trim() && this.dataSearched.length) {
      this.handlePaginateLocal();
    } else {
      this.getUrls();
    }
  }

  handlePaginateLocal() {
    const start = (this.pageCurrent - 1) * this.limit;
    const end = start + this.limit;
    this.urls = this.dataSearched.slice(start, end);
    this.totalPages = Math.ceil(this.dataSearched.length / this.limit) || 1;
    this.changeDetectorRef.detectChanges();
  }

  limitChange(event: number) {
    this.limit = event;
    this.resetPagination();
    if (this.pendingUrl) {
      // Xóa pendingUrl khi thay đổi limit
      this.pendingUrl = null;
      this.dataSearched = this.dataSearched.filter((url) => !url._id.startsWith('temp_'));
      this.urls = this.urls.filter((url) => !url._id.startsWith('temp_'));
    }
    if (this.keySearch.trim() && this.dataSearched.length) {
      this.handlePaginateLocal();
    } else {
      this.getUrls();
    }
  }

  markAsEdited(item: any) {
    if (!item._id.startsWith('temp_')) {
      item.isEdited = true;
    }
    this.changeDetectorRef.detectChanges();
  }
}