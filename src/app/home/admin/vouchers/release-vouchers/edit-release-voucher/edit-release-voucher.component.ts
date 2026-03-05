import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-edit-release-voucher',
  templateUrl: './edit-release-voucher.component.html',
  styleUrls: ['./edit-release-voucher.component.scss']
})
export class EditReleaseVoucherComponent implements OnInit {
  @Input() itemEditing: any;
  @Output() isEdited = new EventEmitter<boolean>();
  @Output() closeModal = new EventEmitter<boolean>();
  editForm: FormGroup;
  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private message: NzMessageService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }
  // khởi tạo form
  initForm(){
    this.editForm = new FormGroup({
      name: new FormControl(this.itemEditing?.name,[
        Validators.required
      ]),
      date_validity: new FormControl(new Date(this.itemEditing?.date_validity).toISOString().substring(0,10)),
      date_expire: new FormControl(new Date(this.itemEditing?.date_expire).toISOString().substring(0,10))
    })
  }
  handleOk(): void {
    if(this.editForm.value.name.length != ''){
      this.editForm.value.date_validity = new Date(this.editForm.value.date_validity).toISOString();
      this.editForm.value.date_expire = new Date(this.editForm.value.date_expire).toISOString();
      this.vhQueryAutoWeb.updateVoucherRelease(this.itemEditing._id,this.editForm.value)
      .then((bool:any)=>{
        if(bool.vcode === 0){
          this.message.success(this.languageService.translate('cap_nhat_thanh_cong'));
          const dataEdited = { ...this.itemEditing, ...this.editForm.value }
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
