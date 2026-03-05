import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { VhAlgorithm, VhImage, VhQueryAutoWeb } from 'vhautowebdb';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-add-casso',
  templateUrl: './add-casso.component.html',
  styleUrls: ['./add-casso.component.scss']
})
export class AddCassoComponent implements OnInit {
  addBankAccount: FormGroup;
  @Input() banks: any[] = [];
  @Input() branchs: any[] = [];
  submitting: boolean = false;
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
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  /** Hàm khởi tạo form
   *
   */
  initForm() {
    this.addBankAccount = new FormGroup({
      acq_id: new FormControl('970415', Validators.compose([Validators.required])),
      account_name: new FormControl('', Validators.compose([Validators.required])),
      account_no: new FormControl('', Validators.compose([Validators.required])),
      branch: new FormControl(this.branchs[0]._id, Validators.compose([Validators.required])),
      template: new FormControl('compact2'),
    });
  }



  /** Hàm thực hiện xử lí thêm danh mục
   *
   * @param value
   */
  onSubmitAddBankAccount(value): void {
    const findLogo = this.banks.find(bank => bank.bin == value.acq_id)
    if (!findLogo) {
      this.functionService.createMessage('error', 'Thêm tài khoản ngân hàng thất bại Không tìm thấy logo ngân hàng')
      return;
    }

    value.logo = findLogo.logo;
    
    this.submitting = true;
    this.vhQueryAutoWeb.admin_addWallet(value)
      .then((res: any) => {
        if (res.vcode != 0) {
          this.functionService.createMessage('error', 'Thêm tài khoản ngân hàng thất bại', res.msg)
          return;
        }

        this.modal.close(res.data)
        this.functionService.createMessage('success', 'them_tai_khoan_ngan_hang_thanh_cong')
      })
      .catch((err) => console.error(err))
      .finally(() => this.submitting = false)
  }

  close() {
    this.modal.close()
  }

  changeBanks(event) {
    this.addBankAccount.get('acq_id').setValue(event)
  }

  changeTemplate(event) {
    this.addBankAccount.get('template').setValue(event)
  }

  changeBranch(event) {
    this.addBankAccount.get('branch').setValue(event)
  }





}
