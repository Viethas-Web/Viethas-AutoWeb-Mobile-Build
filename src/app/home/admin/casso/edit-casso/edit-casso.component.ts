import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { VhAlgorithm, VhImage, VhQueryAutoWeb } from 'vhautowebdb'; 
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FunctionService } from 'vhobjects-service';  

@Component({
  selector: 'app-edit-casso',
  templateUrl: './edit-casso.component.html',
  styleUrls: ['./edit-casso.component.scss']
})
export class EditCassoComponent implements OnInit {
  editBankAccount: FormGroup;
  @Input() banks: any[] = [];
  @Input() branchs: any[] = [];
  @Input() bankAccount: any[] = [];
  submitting:boolean = false;
  templates = [
    {
      label: 'compact2',
      value: 'compact2'
    },
    {
      label: 'compact',
      value: 'compact'
    },
    {
      label: 'qr_only',
      value: 'qr_only'
    },
    {
      label: 'print',
      value: 'print'
    }
  ]

  constructor( 
    public vhAlgorithm: VhAlgorithm,
    public vhQueryAutoWeb: VhQueryAutoWeb, 
    public functionService: FunctionService,
    public vhImage: VhImage,  
    private modal: NzModalRef
    
  ) {
    
  }

  ngOnInit(): void {
    this.initForm(this.bankAccount);
    
  }

  /** Hàm khởi tạo form
   *
   */
  initForm(data) { 
    this.editBankAccount = new FormGroup({
      _id: new FormControl(data._id, Validators.compose([Validators.required])),
      acq_id: new FormControl(data.acq_id, Validators.compose([Validators.required])),
      account_name: new FormControl(data.account_name, Validators.compose([Validators.required])),
      account_no: new FormControl(data.account_no, Validators.compose([Validators.required])),
      branch: new FormControl(data.branch, Validators.compose([Validators.required])),
      template: new FormControl(data.template, Validators.compose([Validators.required])),
    });
  }

  close() { 
    this.modal.close({...this.editBankAccount.value});
  }

  changeBanks(event) {
    this.editBankAccount.get('acq_id').setValue(event)
    let findLogo = this.banks.find(bank => bank.bin == event);
    this.updateBankAccount({acq_id: event, logo: findLogo.logo})
  }

  changeTemplate(event) {
    this.editBankAccount.get('template').setValue(event)
    this.updateBankAccount({template: event})
  }

  changeBranch(event) {
    this.editBankAccount.get('branch').setValue(event)
    this.updateBankAccount({branch: event})

  }

  updateBankAccount(value): void {
    this.vhQueryAutoWeb.admin_updateWallet(this.editBankAccount.get('_id').value, value)
    .then((res:any) => {
      // console.log('admin_updateWallet', res)
    })
  }
}
