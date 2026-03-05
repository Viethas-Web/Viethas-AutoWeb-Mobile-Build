import { ChangeDetectorRef, Component, OnInit } from '@angular/core'; 
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { FunctionService } from 'vhobjects-service'; 
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-voucher-code',
  templateUrl: './voucher-code.component.html',
  styleUrls: ['./voucher-code.component.scss']
})
export class VoucherCodeComponent implements OnInit {
  release: any;
  list_data: any = [];
  list_search_data: any = [];
  list_filter_data: any = [];
  isVisibleModal: boolean = false
  isVisibleModalEdit: boolean = false
  form: FormGroup
  search_value: string = ''
  filterValue: any = 'all'
  data_selected: any;
  barcode_designs: any;
  start_print: boolean = false;
  list_print_data: any[] = [];
  /** phần này để làm mở rộng cho table - code mẫu từ library ant ngzorro */
  checked = false;
  loading = false;
  indeterminate = false;
  listOfCurrentPageData: any = [];
  setOfCheckedId = new Set<string>();

  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    public vhAlgorithm: VhAlgorithm,
    public vhComponent: VhComponent,
    private functionService: FunctionService, 
    private languageService: LanguageService,
    private vhQueryAutoWeb: VhQueryAutoWeb
  ) {
    this.release = this.router.getCurrentNavigation().extras.state;
  }

  ngOnInit(): void { 
    if (this.release.id_design_barcode)
      Promise.all([
        this.vhQueryAutoWeb.getVoucherCodes_byIdCouponReleaseDetail(this.release._id),
        // this.vhQuery.getDocsByFields("barcode_designs ", { id_branch: { $eq: this.vhQueryAutoWeb.getDefaultBranch()._id }, type: { $eq: 2 } })
      ])
        .then(([product_codes, barcode_designs]: any) => {
          this.list_data = product_codes.map(item => { return { ...item, status: item.status } });
          this.list_search_data = this.list_data;
          this.list_filter_data = this.list_data;
          this.barcode_designs = barcode_designs.find(item => item._id == this.release.id_design_barcode);
        })
    else {
      this.vhQueryAutoWeb.getVoucherCodes_byIdCouponReleaseDetail(this.release._id)
        .then((product_codes: any) => {
          console.log('product_codes', product_codes);
          this.list_data = product_codes.data.map(item => { return { ...item, status: item.status } });
          this.list_search_data = this.list_data;
          this.list_filter_data = this.list_data;
        })
    }
  }

  /**
   * mở modal tạo số lượng mã phát hành
   */
  initForm() {
    this.isVisibleModal = true;
    this.form = new FormGroup({
      number: new FormControl(1, Validators.required),
    })
  }


  heightScroll: string;
  ngAfterViewInit() {
    setTimeout(() => {
      if (document.querySelector("#product-list") && document.querySelector(".ant-table-thead") && document.querySelector(".product-list-header")) {
        this.heightScroll = document.querySelector("#product-list").clientHeight - document.querySelector(".ant-table-thead").clientHeight
          - document.querySelector(".product-list-header").clientHeight - 70 + "px";
      }
      this.cdRef.detectChanges();
    }, 0);
  }
  goBack() { 
    this.router.navigate(['../'], {relativeTo: this.route, state: this.release });
  }

  /**
   * lọc mã phát hành theo code
   */
  search(value) {
    this.list_data = this.vhAlgorithm.searchList(this.vhAlgorithm.changeAlias(value.toLowerCase()), this.list_search_data, ["code"])
  }

  /**
   * bắt sk nhấn nút ok modal tạo số lượng mã phát hành
   */
  addProductCode() {
    if (new Date() < new Date(this.release.date_expire)) {
      this.vhComponent.showLoading('')
        .then(() => {
          this.vhQueryAutoWeb.createVoucherCodes({
            date_validity: new Date(this.release.date_validity),
            date_expire: new Date(this.release.date_expire),
            id_voucher_release_detail: this.release._id,
            id_voucher: this.release.id_coupon,
            ratio: 1
          }, this.form.value.number)
            .then((coupon_codes) => {
              
              this.list_data = this.list_data.concat(coupon_codes)
              this.list_filter_data = this.list_filter_data.concat([coupon_codes])
              this.list_search_data = this.list_search_data.concat([coupon_codes])
              this.isVisibleModal = false;
              // this.vhQueryAutoWeb.updateCouponReleaseDetail
            }, error => {
              
            }).finally(() => this.vhComponent.hideLoading(0))
        })
    }
    else {
      this.vhComponent.alertMessageDesktop("error", this.languageService.translate("Ngày hiện tại đang lớn hơn ngày hết hạn của đợt này!"))
    }
  }

  checkExpried(date_expire) {
    return new Date() > new Date(date_expire)
  }
  //  lọc mã coupon theo trạng thái 
  filter(event) {
    if (event == 'all') {
      this.list_search_data = this.list_filter_data
    }
    else {
      if (event == 1) this.list_search_data = this.list_filter_data.filter(item => !this.checkExpried(item.date_expire) && item.status == 1)
      else if (event == 5) this.list_search_data = this.list_filter_data.filter(item => this.checkExpried(item.date_expire) && item.status == 1)
      else this.list_search_data = this.list_filter_data.filter(item => item.status == event)
    }
    this.search(this.search_value)
  }

  /**
   * xóa mã phát hành khỏi DB
   */
  deleteProductCode(data) {
    alert('Chưa có hàm xóa')
    this.vhQueryAutoWeb.deleteVoucherCode
    // this.vhQueryAutoWeb.deleteCouponCode(data._id, data.id_coupon_release_detail)
    //   .then(bool => {
    //     if (bool) {
    //       this.list_data = this.list_data.filter(item => item._id != data._id)
    //       this.list_filter_data = this.list_filter_data.filter(item => item._id != data._id)
    //       this.list_search_data = this.list_search_data.filter(item => item._id != data._id)
    //     }
    //   }, error => {
        
    //   })
  }

  /**
   * xuất file excel và tải về
   */
  export() {
    let data = [];
    let name = `${this.languageService.translate("_list_of_barcodes")}`;
    for (let _row of this.list_data) {
      let item: any = new Object();
      item[this.languageService.translate('Mã phiếu')] = _row._id;
      item[this.languageService.translate('Ngày phát hành')] = this.functionService.formatDate(_row.date_validity);
      item[this.languageService.translate('Ngày hết hạn')] = this.functionService.formatDate(_row.date_expire);
      data.push(item);
    }
    this.vhAlgorithm.exportXLSX(data, name)
  }

  /**
   * in mã thẻ
   * @param data 
   */
  print(data) {
    if (this.barcode_designs) {
      this.list_print_data = data
      this.start_print = true;
      setTimeout(() => {
        this.start_print = false;
      }, 200);
    }
    else {
      this.vhComponent.alertMessageDesktop("error", this.languageService.translate("Bạn chưa chọn mẫu in cho coupon này!"))
    }
  }



  updateCheckedSet(id: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onCurrentPageDataChange(listOfCurrentPageData): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData;
    this.checked = listOfEnabledData.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  onItemChecked(id: string, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
      .forEach(({ _id }) => this.updateCheckedSet(_id, checked));
    this.refreshCheckedStatus();
  }

  printAll(): void {
    this.loading = true;
    let requestData = this.list_data.filter(data => this.setOfCheckedId.has(data._id)).slice(0, 20);
    this.print(requestData)
  }

  /** hàm sort cho các cột */
  codeCol = false;
  date_validityCol = false;
  date_expireCol = false;
  /** Hàm thực hiện sắp xếp theo collection
   *
   * @param colName       // tên cột muôn sắp xếp
   */
  sortTable(colName) {
    switch (colName) {
      case 'code':
        if (this.codeCol) {
          this.list_data = this.vhAlgorithm.sortStringbyASC([...this.list_data], colName);
        } else {
          this.list_data = this.vhAlgorithm.sortStringbyDESC([...this.list_data], colName);
        }
        break;
      case 'date_validity':
        if (this.date_validityCol) {
          this.list_data = this.vhAlgorithm.sortDatebyASC([...this.list_data], colName);
        } else {
          this.list_data = this.vhAlgorithm.sortDatebyDESC([...this.list_data], colName);
        }
        break;
      case 'date_expire':
        if (this.date_expireCol) {
          this.list_data = this.vhAlgorithm.sortDatebyASC([...this.list_data], colName);
        } else {
          this.list_data = this.vhAlgorithm.sortDatebyDESC([...this.list_data], colName);
        }
        break;
    }
  }
}
