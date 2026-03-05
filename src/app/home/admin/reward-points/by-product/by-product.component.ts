
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-by-product',
  templateUrl: './by-product.component.html',
  styleUrls: ['./by-product.component.scss']
})
export class ByProductComponent implements OnInit {
  customer_group: any = [];
  list_data: any = [];
  search_value = ''
  synbol = JSON.parse(localStorage.getItem('vhsales_currencyFormat')).symbol.text
  constructor(
    private router: Router,
    private cdRef: ChangeDetectorRef,
    public vhAlgorithm: VhAlgorithm,
    private vhComponent: VhComponent,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private route: ActivatedRoute,
    private languageService: LanguageService
  ) {

    if (this.router.getCurrentNavigation().extras && this.router.getCurrentNavigation().extras.state) {
      this.getData()
   }
  }

  ngOnInit(): void {

  }

  getData() {
    // get công thức tích điểm theo sp
    Promise.all([
      this.vhQueryAutoWeb.getCustomerClasss_byFields({}),
      this.vhQueryAutoWeb.getEarningPointsProducts()
    ])
      .then(([customer_class, earning_point_products]: any) => {
        console.log(earning_point_products);
        
        this.customer_group = this.vhAlgorithm.sortStringbyASC(customer_class.data, 'name').map(item => { return { ...item, selected: earning_point_products.data.findIndex(i => i.id_customer_class == item._id) == -1 ? false : true } })
        // đem trường điểm và tiền ra ngoài mục đích để dễ sort
        this.list_data = this.vhAlgorithm.sortStringbyASC(earning_point_products.data, 'name').map(item => {
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
    this.router.navigate(['add'], { relativeTo: this.route, state: this.list_data });
    // this.router.navigate(['/dashboard/manage/sales-program/reward-points/by-product/add'], { state: this.list_data })
  }
  gotoEdit(data) {
    this.router.navigate(['edit'], { relativeTo: this.route, state: { data_selected: data, list_earning_points_product: this.list_data } });

    // this.router.navigate(['/dashboard/manage/sales-program/reward-points/by-product/edit'], { state: { data_selected: data, list_earning_points_product: this.list_data } })
  }

  /**
   * xóa công thức khỏi DB
   * @example this.deleleData(earning_point_selected)
   */
  deleleData(data) {
    this.vhComponent.showLoading('').then(() => {
      this.vhQueryAutoWeb.deleteEarningPointsProduct(data._id).then(bool => {
        this.vhComponent.hideLoading(0)
        if (bool) {
          let customer_group = this.customer_group.find(item => item.id_earning_points_products == data._id)
          if (customer_group) {
            this.vhQueryAutoWeb.updateCustomerClass(customer_group._id, { id_earning_points_products: "" }).then((bool) => {
              this.vhComponent.alertMessageDesktop("success", this.languageService.translate('xoa_chuong_trinh_thanh_cong'));
              this.list_data = this.list_data.filter(item => item._id != data._id)
            }, error => {
              console.log('error', error);
            })
          }
          else {
            this.vhComponent.alertMessageDesktop("success", this.languageService.translate('xoa_chuong_trinh_thanh_cong'));
            this.list_data = this.list_data.filter(item => item._id != data._id)
          }

        }
        else this.vhComponent.alertMessageDesktop("error", this.languageService.translate("xoa_chuong_trinh_that_bai"));
      })
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
