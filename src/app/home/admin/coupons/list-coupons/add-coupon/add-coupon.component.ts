import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-add-coupon',
  templateUrl: './add-coupon.component.html',
  styleUrls: ['./add-coupon.component.scss']
})
export class AddCouponComponent implements OnInit {
  @Output() closeDrawer = new EventEmitter<boolean>(); // Biến này dùng để đóng drawer  
  @Output() IsAdded = new EventEmitter<boolean>();
  constructor(private vhQueryAutoWeb: VhQueryAutoWeb,
    private message: NzMessageService,
    public languageService: LanguageService
    ) { }

  ngOnInit(): void {
  }
  infoCoupon = new FormGroup({
    name: new FormControl('',[
      Validators.required,
    ]),
    value: new FormControl(0,[
      Validators.required,
    ]),
    point: new FormControl(0,[
      Validators.required,
    ])
  })
  addCoupon(){
    // xử lý phần units của coupon để lưu
    const require = this.infoCoupon.value;
    if(require.name.length != '' && require.value != 0 && require.point != 0){
      require['units'] = [{
        value: Number(require.value),
        points: Number(require.point),
        unit: '',
        ratio: 1,
        default: true
      }]
      delete require.value;
      delete require.point;
      this.vhQueryAutoWeb.addCoupon(require)
      .then((res: any)=>{
        if(res.vcode === 0){
          this.IsAdded.emit(res.data);
          this.infoCoupon.reset();
          this.closeDrawer.emit(false);
        }
        }, error=>{
        console.log('error', error);
        })
     
    
    }else{
      this.message.warning(this.languageService.translate('vui_nhap_long_day_du_thong_tin'))
    }
  }
  cancel(){
    this.closeDrawer.emit(false);
    this.IsAdded.emit(false);
  }
  get name(){ return this.infoCoupon.get('name')}
  get value(){ return this.infoCoupon.get('value')}
  get point(){ return this.infoCoupon.get('point')}
}
