import { Component, Input, OnInit } from '@angular/core';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service/src/services'; 
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'atw-qr-banking-modal',
  templateUrl: './qr-banking-modal.component.html',
  styleUrls: ['./qr-banking-modal.component.scss']
})
export class AtwQrBankingModal implements OnInit {
  @Input() data: any;
   /** bill sau khi tạo */
  @Input() bill: any;
  /** url hình qr */
  urlImg:string = null;
  loading: boolean = true;
  loadingBankAccounts: boolean = false;

  bankAccounts: any[] = [];
  /** biến để clear interval */
  interval: any;
  /** biến này để active bank khi click vào*/
  currentBank: any = null;

  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private functionService: FunctionService,
    private nzModalRef: NzModalRef
  ) { }

  ngOnInit() {
   
    // khoảng 5s sẽ get lại bill để kiểm tra xem đã thanh toán chưa
    // nếu có paid_online = true thì sẽ thông báo thanh toán thành công và đóng modal
    this.interval = setInterval(() => {
      if(this.bill)
        this.vhQueryAutoWeb.getBill(this.bill._id)
          .then((res: any) => {
            console.log(res);
            if (res.data.bill_type == 1 && res.data.paid_online) {
              this.functionService.createMessage("success",  'thanh_toan_thanh_cong')
              this.nzModalRef.close(true)
              clearInterval(this.interval)
            }
          })
    }, 5000);

    this.getBanksAccount();
    
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    clearInterval(this.interval)
  }

  getBanksAccount() {
    this.loadingBankAccounts = true
    let query = {}
    this.vhQueryAutoWeb
      .admin_getWallets_byFields_byPages(
        query,
        {},
        {},
      )
      .then(
        (rsp: any) => {
          // console.log(rsp);
          if (rsp.vcode === 0) {
            this.bankAccounts = rsp.data
            if(this.bankAccounts.length) {
              this.handleChooseBank(this.bankAccounts[0])
            }
          }
        },
        (error) => {
          console.error(error)
          this.functionService.createMessage('error','da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu_vui_long_thu_lai');
        }
      )
      .finally(() => this.loadingBankAccounts = false)
  }

  handleChooseBank(bank) {
    // khi đổi bank thì sẽ tạo lại qr mới và update lại id_wallet cho bill
    this.currentBank = bank;
    this.loading = true;

    this.vhQueryAutoWeb.vietqr_generateQR(bank.account_no, bank.account_name, bank.acq_id, bank.template, this.bill._id, this.bill.total)
      .then((res:any) => {
        if(res.vcode == 0) {
          this.urlImg = res.data
          this.vhQueryAutoWeb.updateBill(this.bill._id, { id_wallet: bank._id })
        }
      })
      .catch((err) => console.error(err))
      .finally(() => this.loading = false)
  }
}
