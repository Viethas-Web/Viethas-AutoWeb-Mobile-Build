import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-add-release',
  templateUrl: './add-release.component.html',
  styleUrls: ['./add-release.component.scss']
})
export class AddReleaseComponent implements OnInit {
  @Output() isAdded = new EventEmitter<boolean>();
  @Output() closeModal = new EventEmitter<boolean>();
  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private functionService: FunctionService,
  ) { }

  ngOnInit(): void {
  }
  data_release = new FormGroup({
    'name': new FormControl('',[
      Validators.required
    ]),
    'date_validity': new FormControl((new Date()).toISOString().substring(0,10)),
    'date_expire': new FormControl((new Date()).toISOString().substring(0,10))
  })
  handleOk(): void {
    if(this.data_release.value.name.length != ''){
      this.data_release.value.date_validity = new Date(this.data_release.value.date_validity).toISOString();
      this.data_release.value.date_expire = new Date(this.data_release.value.date_expire).toISOString();
      this.vhQueryAutoWeb.addCouponRelease(this.data_release.value)
      .then((response: any)=>{ 
        if (response.vcode != 0) {
          this.functionService.createMessage('error', 'them_that_bai');
          return;
        }
        this.functionService.createMessage('success', 'them_thanh_cong');
        this.isAdded.emit(response.data);
        this.closeModal.emit(false);
        }, error=>{
        console.log('error', error);
        })
    }

  }

  handleCancel(): void {
    this.closeModal.emit(false);
    this.isAdded.emit(false);
  }
}
