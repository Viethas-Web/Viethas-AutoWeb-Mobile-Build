import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditByBillComponent implements OnInit {
  data_selected: any;
  formEdit: FormGroup;
  exchange: any = {
    points: '1',
    money: '1000'
  }
  bill_total_minimum = '0';

  synbol = JSON.parse(localStorage.getItem('vhsales_currencyFormat')).symbol.text
  constructor(
    private router: Router,
    public vhAlgorithm: VhAlgorithm,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private route: ActivatedRoute,
    private vhComponent: VhComponent) {
    this.data_selected = this.router.getCurrentNavigation().extras.state
  }

  ngOnInit(): void {
    this.initFormEdit(this.data_selected)
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
    this.formEdit.controls[field].setValue(parseFloat(this.bill_total_minimum) ? parseFloat(this.bill_total_minimum) : 0)

  }

  /**
   * bắt sk thay đổi money or points
   */
  changeExchange(field, value) {
    this.exchange[field] = value ? value.replaceAll(/[.*+?^${}()|[\]\\,a-zA-Z]/g, '') : 0
  }

  /**
   * gán các giá trị của công thức nhận từ state vào form để xử lý
   */
  initFormEdit(data) {
    this.exchange = {
      points: data.exchange.points,
      money: data.exchange.money,
    }
    this.bill_total_minimum = data.bill_total_minimum;
    this.formEdit = new FormGroup({
      name: new FormControl(data.name, Validators.required),
      bill_total_minimum: new FormControl(data.bill_total_minimum, Validators.required),
      include_promotion_product: new FormControl(data.include_promotion_product),
      include_discount: new FormControl(data.include_discount),
      include_paid_points: new FormControl(data.include_paid_points),
      include_tax: new FormControl(data.include_tax),
      include_fee: new FormControl(data.include_fee),
    })
  }

  /**
   * cập nhật công thức lên DB
   */
  editData() {
    let data = this.formEdit.value;
    data['exchange'] = {
      points: parseFloat(this.exchange.points),
      money: parseFloat(this.exchange.money)
    }
    if (this.formEdit.valid) {
      this.vhComponent.showLoading('').then(() => {
        this.vhQueryAutoWeb.updateEarningPointsBill(this.data_selected._id, data).then((response: any) => {
          this.vhComponent.alertMessageDesktop('success', "cap_nhat_chuong_trinh_tich_diem_thanh_cong");

          this.router.navigate(['../'], { relativeTo: this.route, state : response });
        }, error => {
          this.vhComponent.alertMessageDesktop('error', "cap_nhat_trinh_tich_diem_that_bai")
          console.log('error', error);
        }).finally(() => this.vhComponent.hideLoading(0))
      })

    }
    else this.vhComponent.alertMessageDesktop('error', 'vui_long_dien_day_du_thong_tin');
  }
}
