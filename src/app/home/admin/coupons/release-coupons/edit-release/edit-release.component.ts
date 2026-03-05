import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-edit-release',
  templateUrl: './edit-release.component.html',
  styleUrls: ['./edit-release.component.scss']
})
export class EditReleaseComponent implements OnInit {
  @Input() itemEditing: any;
  @Output() isEdited = new EventEmitter<boolean>();
  @Output() closeModal = new EventEmitter<boolean>();
  data_release = new FormGroup({});
  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private message: NzMessageService,
    private languageService : LanguageService
  ) { }

  ngOnInit(): void {
    console.log('itemEditing', this.itemEditing);

    this.data_release = new FormGroup({
      'name': new FormControl(this.itemEditing?.name,[
        Validators.required
      ]),
      'date_validity': new FormControl((new Date(this.itemEditing?.date_validity)).toISOString().substring(0,10)),
      'date_expire': new FormControl((new Date(this.itemEditing?.date_expire)).toISOString().substring(0,10))
    })
  }

  handleOk(): void {
    if(this.data_release.value.name.length != ''){
      this.data_release.value.date_validity = new Date(this.data_release.value.date_validity).toISOString();
      this.data_release.value.date_expire = new Date(this.data_release.value.date_expire).toISOString();
      this.vhQueryAutoWeb.updateCouponRelease(this.itemEditing._id,this.data_release.value)
      .then((bool:any)=>{
        if(bool.vcode === 0){
          this.message.success(this.languageService.translate('cap_nhat_thanh_cong'));
          const dataEdited = { ...this.itemEditing, ...this.data_release.value }
          this.isEdited.emit(dataEdited);
        }
        this.closeModal.emit(false);
      }, error=>{
        this.message.error(this.languageService.translate('cap_nhat_that_bai'));
      })
    }
  }

  handleCancel(): void {
    this.isEdited.emit(false);
    this.closeModal.emit(false);
  }
}
