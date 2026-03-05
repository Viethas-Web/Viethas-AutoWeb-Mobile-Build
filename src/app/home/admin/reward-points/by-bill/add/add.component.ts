
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddByBillComponent implements OnInit {

  formAdd: FormGroup;
  exchange: any = {
    points: '1',
    money: '100000'
  }
  bill_total_minimum = '0';

  synbol = JSON.parse(localStorage.getItem('vhsales_currencyFormat')).symbol.text;
   
  // customer_group: any = [];
  // id_customer_class: any = ''
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public vhAlgorithm: VhAlgorithm,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private vhComponent: VhComponent,
  ) {
    
  }

  ngOnInit(): void {
    this.initFormAdd();


  }
  /**
   * khởi tạo form với các trường để add công thức
   */
  initFormAdd() {
    this.formAdd = new FormGroup({
      name: new FormControl('', Validators.required),
      bill_total_minimum: new FormControl(0, Validators.required),
      include_promotion_product: new FormControl(false),
      include_discount: new FormControl(false),
      include_paid_points: new FormControl(false),
      include_tax: new FormControl(false),
      include_fee: new FormControl(false),
      id_branch: new FormControl(this.vhQueryAutoWeb.getDefaultBranch()?._id)
    })
  }
  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  /**
   * bắt sk thay đổi bill_total_minimum
   */
  changeValue(field, value) {
    // if(value.replaceAll(',','')) 
    this.bill_total_minimum = value.replaceAll(/[.*+?^${}()|[\]\\,a-zA-Z]/g, '')
    this.formAdd.controls[field].setValue(parseFloat(this.bill_total_minimum))

  }

  /**
   * bắt sk thay đổi money or points
   */
  changeExchange(field, value) {
    this.exchange[field] = value.replaceAll(/[.*+?^${}()|[\]\\,a-zA-Z]/g, '')
  }
  /**
   * thêm công thức vào DB
   */
  addData() {
    let data = this.formAdd.value;
    data['exchange'] = {
      points: parseFloat(this.exchange.points),
      money: parseFloat(this.exchange.money)
    }
    if (this.formAdd.valid) {
      this.vhComponent.showLoading('').then(() => {
        this.vhQueryAutoWeb.addEarningPointsBill(data).then((response: any) => {
          this.vhComponent.alertMessageDesktop('success', "them_chuong_trinh_tich_diem_thanh_cong");
         
          this.router.navigate(['../'], { relativeTo: this.route, state: response });
        }, error => {
          this.vhComponent.alertMessageDesktop('error', "them_chuong_trinh_tich_diem_that_bai")
          console.log('error', error);
        }).finally(() => this.vhComponent.hideLoading(0))
      })

    }
    else this.vhComponent.alertMessageDesktop('error', "vui_long_dien_day_du_thong_tin");
  }
}
