import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-branchs',
  templateUrl: './branchs.component.html',
  styleUrls: ['./branchs.component.scss']
})
export class BranchsComponent implements OnInit {

  public searchValue: string = ''
  tableHeight: string; 
  
  constructor( 
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public vhAlgorithm: VhAlgorithm, 
    private cdRef: ChangeDetectorRef, 
    private functionService: FunctionService
  ) {
  }
  
  ngOnInit() {
    this.getBranches()
  }
  
  branchList: Array<any> = []
  branchListShow: Array<any> = []

  /**
   * get danh sách chi nhánh và gán vào biến branchList
   * @example  this.getBranches()
   */
  getBranches() {   
    this.branchList = this.vhQueryAutoWeb.getlocalBranchs()
    this.branchListShow = this.branchList
  }

  ngAfterViewChecked() {
    // tính toán height của table để scroll 
    if (document.querySelector("#branches-list") && document.querySelector(".ant-table-thead") && document.querySelector(".branches-list-header") && document.querySelector(".ant-table-pagination")) {
      this.tableHeight = document.querySelector("#branches-list").clientHeight - document.querySelector(".ant-table-thead").clientHeight
        - document.querySelector(".branches-list-header").clientHeight - document.querySelector(".ant-table-pagination").clientHeight - 60 + "px";
    }
    this.cdRef.detectChanges()
  }
  onCurrentPageDataChange(event) {

  }

  /**
   * lọc tên chi nhánh từ mảng branchList và gán cho biến branchListShow
   * @param value 
   * @example this.searchBill('chi nhánh 1')
   */
  searchBill(value) {
    this.functionService.createMessage('warning', 'Đang chờ hàm search của backend');
    // if (value.length) {
    //   let val: string = this.vhAlgorithm.changeAlias(value.trim().toLowerCase())
    //   this.branchListShow = this.vhAlgorithm.searchList(val, this.branchList, ['name'])
    // } else this.branchListShow = [...this.branchList]
  }



  /** hàm sort cho các cột */
  nameCol = false;
  phoneCol = false;
  addressCol = false;

  /** Hàm thực hiện sắp xếp theo tên trường truyền vào
   *
   * @param colName       // tên cột muôn sắp xếp
   * @example this.sortTable('name')
   */
  sortTable(colName) {
    switch (colName) {
      case 'name':
        if (this.nameCol) {
          this.branchListShow = this.vhAlgorithm.sortVietnamesebyASC([...this.branchListShow], colName);
        } else {
          this.branchListShow = this.vhAlgorithm.sortVietnamesebyDESC([...this.branchListShow], colName);
        }
        break;
      case 'phone':
        if (this.phoneCol) {
          this.branchListShow = this.vhAlgorithm.sortStringbyASC([...this.branchListShow], colName);
        } else {
          this.branchListShow = this.vhAlgorithm.sortStringbyDESC([...this.branchListShow], colName);
        }
        break;
      case 'address':
        if (this.addressCol) {
          this.branchListShow = this.vhAlgorithm.sortVietnamesebyASC([...this.branchListShow], colName);
        } else {
          this.branchListShow = this.vhAlgorithm.sortVietnamesebyDESC([...this.branchListShow], colName);
        }
        break;
    }
  }
}
