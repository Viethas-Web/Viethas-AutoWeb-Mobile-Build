
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-by-bill',
  templateUrl: './by-bill.component.html',
  styleUrls: ['./by-bill.component.scss']
})
export class ByBillComponent implements OnInit {
  customer_group: any = [];
  list_data: any = [];
  data_selected: any;
  constructor(
    private router: Router,
    private cdRef: ChangeDetectorRef,
    public vhAlgorithm: VhAlgorithm,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private vhComponent: VhComponent,
    private route: ActivatedRoute,
  ) {

    if (this.router.getCurrentNavigation().extras && this.router.getCurrentNavigation().extras.state) {
       this.getData()
    }

  }

  ngOnInit(): void {

  }
  getData() {
    // get công thức tích điểm theo hóa đơn
    Promise.all([
      this.vhQueryAutoWeb.getCustomerClasss_byFields({}),
      this.vhQueryAutoWeb.getEarningPointsBills()
    ])
      .then(([customer_group, point_bills]: any) => {
        this.customer_group = this.vhAlgorithm.sortStringbyASC(customer_group.data, 'name')
        // đem trường điểm và tiền ra ngoài mục đích để dễ sort
        this.list_data = this.vhAlgorithm.sortStringbyASC(point_bills.data, 'name').map(item => {
          return {
            ...item,
            asMoney: item.exchange.money,
            asPoints: item.exchange.points
          }
        })

      })
  }
  heightScroll: string;
  ngAfterViewChecked() {
    if (document.querySelector("#product-list") && document.querySelector(".ant-table-thead") && document.querySelector(".product-list-header")) {
      this.heightScroll = document.querySelector("#product-list").clientHeight - document.querySelector(".ant-table-thead").clientHeight
        - document.querySelector(".product-list-header").clientHeight - 50 + "px";
    }
    this.cdRef.detectChanges();
  }

  gotoAdd() {
    this.router.navigate(['add'], { relativeTo: this.route, state: { list_data: this.list_data } });
    // this.router.navigate(['/dashboard/manage/sales-program/reward-points/by-bill/add'])
  }
  gotoEdit(data) {
    this.router.navigate(['edit'], { relativeTo: this.route, state: data });
    // this.router.navigate(['/dashboard/manage/sales-program/reward-points/by-bill/edit'], { state: data })
  }
  /**
   * xóa công thức khỏi DB
   * @example this.deleleData(earning_point_selected)
   */
  deleleData(data) {
    this.vhComponent.showLoading('').then(() => {
      this.vhQueryAutoWeb.deleteEarningPointsBill(data._id).then(bool => {
        if (bool) {
          let customer_group = this.customer_group.find(item => item.id_earning_points_bill == data._id)
          if (customer_group) {
            this.vhQueryAutoWeb.updateCustomerClass(customer_group._id, { id_earning_points_bill: "" }).then((bool) => {
              this.vhComponent.alertMessageDesktop("success", "xoa_chuong_trinh_thanh_cong");
              this.list_data = this.list_data.filter(item => item._id != data._id);
            }, error => {
              console.log('error', error);
            })
          }
          else {
            this.vhComponent.alertMessageDesktop("success", "xoa_chuong_trinh_thanh_cong");
            this.list_data = this.list_data.filter(item => item._id != data._id);
          }

        }
        else this.vhComponent.alertMessageDesktop("error", "co_loi_xay_ra_khi_xoa");
      }).finally(() => this.vhComponent.hideLoading(0))
    })
  }

  /** hàm sort cho các cột */
  nameCol = false;
  asMoneyCol = false;
  asPointsCol = false
  /** Hàm thực hiện sắp xếp theo collection
   *
   * @param colName       // tên cột muôn sắp xếp
   */
  sortTable(colName) {
    switch (colName) {
      case 'name':
        if (this.nameCol) {
          this.list_data = this.vhAlgorithm.sortVietnamesebyASC([...this.list_data], colName);
        } else {
          this.list_data = this.vhAlgorithm.sortVietnamesebyDESC([...this.list_data], colName);
        }
        break;
      case 'asMoney':
        if (this.asMoneyCol) {
          this.list_data = this.vhAlgorithm.sortNumberbyASC([...this.list_data], colName);
        } else {
          this.list_data = this.vhAlgorithm.sortNumberbyDESC([...this.list_data], colName);
        }
        break;
      case 'asPoints':
        if (this.asPointsCol) {
          this.list_data = this.vhAlgorithm.sortNumberbyASC([...this.list_data], colName);
        } else {
          this.list_data = this.vhAlgorithm.sortNumberbyDESC([...this.list_data], colName);
        }
        break;
    }
  }
}
