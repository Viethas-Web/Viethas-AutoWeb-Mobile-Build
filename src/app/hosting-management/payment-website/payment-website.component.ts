import { Component, Input, OnInit } from '@angular/core';
import { VhAlgorithm, VhEventMediator, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service/src/services';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { AtwQrBankingModal } from '../hosting-renewal/qr-banking-modal/qr-banking-modal.component';

@Component({
  selector: 'app-payment-website',
  templateUrl: './payment-website.component.html',
  styleUrls: ['./payment-website.component.scss']
})
export class PaymentWebsiteComponent implements OnInit {
  id_hosting: any;
  currentHosting: any;
  currentWebsite: any;
  loading: boolean = true;
  /** Số ngày sử dụng hosting*/
  days: number = 1;
  id_subproject: string = '';
  @Input() type: any;
  hostingPackageDefault:any = null;
  opening: boolean = false;
  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    private route: ActivatedRoute,
    private router: Router,
    private nzModalService: NzModalService,
    public vhAlgorithm: VhAlgorithm,
    private vhEventMediator: VhEventMediator
  ) { }

  ngOnInit() {
    this.route.parent.params.subscribe((routeParam) => {
      this.vhQueryAutoWeb.getHosting_byEndUser(routeParam.id_hosting)
        .then((res) => {
          if (res.vcode != 0) return this.functionService.createMessage('error', res.msg);
          this.currentHosting = res.data

          this.vhQueryAutoWeb.getWebApps_byFields({
            id_subproject: { $eq: this.currentHosting.id_subproject },
          })
            .then((res: any) => {
              if (res.vcode != 0) return this.functionService.createMessage('error', res.msg);
              this.currentWebsite = res.data[0]

            })
            .finally(() => this.loading = false);
        })
      
    });
    
    this.id_subproject = this.vhQueryAutoWeb.getlocalSubProject(this.vhQueryAutoWeb.getlocalSubProject_Working()._id)._id;

    this.vhQueryAutoWeb.getHosting_Packages_byFields_byPages({
      default: { $eq: true },
    })
    .then((res:any) => {
      this.hostingPackageDefault = res.data[0]
    })
  }


  handlePaymentWebsite() {
    if(this.opening) return;
    this.opening = true;
    // get bill type 36 xem có ko
    this.vhQueryAutoWeb.getBillsByFields({
      bill_type: {$eq: 36},
      id_customer: {$eq: this.vhQueryAutoWeb.getlocalEndUser()._id},
    })
    .then((res:any) => {
      if (res.vcode != 0) return this.functionService.createMessage('error', res.msg);
      // có 3 trường hợp:
      // 1.ko có bill thì tạo bill mới
      // 2.có bill nhưng bill đó của gia hạn hosting(chỉ có 1 bill_detail), (xóa bill và bill_detail, tạo bill bill_detail mới)
      // 3.có bill và bill đó của thanh toán website luôn(cập nhật lại bill, bill_detail)


      // 1.ko có bill thì tạo bill mới
      if(res.data.length == 0) {
        this.createBillandOpenModalBanking()
      }

      if (res.data.length > 0) {
        this.processBills(res.data)
        .then((bills:any) => {
          const findBillPaymentWebsite = bills.find((bi:any) => bi.bill_details.length == 2);
          //2.có bill nhưng bill đó của gia hạn hosting(chỉ có 1 bill_detail), (xóa bill và bill_detail, tạo bill bill_detail mới))
          if(!findBillPaymentWebsite) {
            // nếu tìm thấy bill gia hạn hosting thì xóa đi, tạo bill mới cho thanh toán website
            const findBillRenewalHosting = bills.find((bill:any) => bill.bill_details.length == 1);
            if(findBillRenewalHosting) {
              this.vhQueryAutoWeb.deleteBill_Billdetail(findBillRenewalHosting._id)
            }
            this.createBillandOpenModalBanking()  
          }
          // 3.có bill và bill đó của thanh toán website luôn(cập nhật lại bill, bill_detail)
          else {
            let billUpdated = {
              ...findBillPaymentWebsite,
              total: this.currentWebsite.price,
              payment: this.currentWebsite.price
            }
  
            const findBillDetailHosting = findBillPaymentWebsite.bill_details.find((bill_detail:any) => bill_detail.hasOwnProperty('id_hosting'));
            const findBillDetailWebsite = findBillPaymentWebsite.bill_details.find((bill_detail:any) => !bill_detail.hasOwnProperty('id_hosting'));
  
            let billDetailsUpdated = [
              {
                ...findBillDetailHosting,
                id_hosting: this.currentHosting._id,
                id_product: this.hostingPackageDefault._id,
                ratio: this.hostingPackageDefault.units.find((unit:any) => unit.default).ratio,
                price: 0,
                ptype: 8,
                quantity: 1,
                price_origin: this.hostingPackageDefault.units.find((unit:any) => unit.default).price
              },
              {
                ...findBillDetailWebsite,
                id_product: this.currentWebsite._id,
                price: this.currentWebsite.price,
                quantity: 1,
                ptype: 11
              }
            ]
  
            let promises = [this.vhQueryAutoWeb.updateBill(billUpdated._id, billUpdated), this.vhQueryAutoWeb.updateBill_detail(billDetailsUpdated[0]._id, billDetailsUpdated[0]), this.vhQueryAutoWeb.updateBill_detail(billDetailsUpdated[1]._id, billDetailsUpdated[1])]
            Promise.all(promises)
            .then(
              (bill: any) => {
                // console.log('bill', bill)
                this.openModalBanking(billUpdated)
  
              },
              (error: any) => {
                this.functionService.createMessage('error', 'co_loi_xay_ra_vui_long_thu_lai', 1200);
                console.error(error);
              })
          }
        })
      } 
    })


   
  }
  /**
   * hàm này lặp qua bills và gán bill_details cho từng bill
   */
  processBills(bills) {
    return Promise.all(bills.map(async (bill) => {
      const rsp = await this.vhQueryAutoWeb.getBill_details_byId_bill(bill._id)
      bill.bill_details = rsp
      return bill;
    }));
  }

  createBillandOpenModalBanking() {
    let bill_details = [
      {
        id_hosting: this.currentHosting._id,  
        id_product: this.hostingPackageDefault._id,
        ratio: this.hostingPackageDefault.units.find((unit:any) => unit.default).ratio ,
        price: 0,
        quantity: 1,
        ptype: 8,
        price_origin: this.hostingPackageDefault.units.find((unit:any) => unit.default).price 
      },
      {
        id_product: this.currentWebsite._id,
        price: this.currentWebsite.price,
        quantity: 1,
        ptype: 11
      }
    ]

    let bill = {
      id_customer: this.vhQueryAutoWeb.getlocalEndUser()._id,
      id_branch: this.vhQueryAutoWeb.getDefaultBranch()._id,
      tax: 0,
      fee: 0,
      total: this.currentWebsite.price,
      payment_type: 3,
      payment: this.currentWebsite.price
    }

    this.vhQueryAutoWeb.createBill_Billdetail_36(bill, bill_details).then(
      (bill: any) => {
        this.openModalBanking(bill)
      },
      (error: any) => {
        this.functionService.createMessage('error', 'co_loi_xay_ra_vui_long_thu_lai', 1200);
        console.error(error);
      });
  }

  openModalBanking(bill) {
    const modal: NzModalRef = this.nzModalService.create({
      nzTitle: 'QR Banking',
      nzContent: AtwQrBankingModal,
      nzClosable: true,
      nzMaskClosable: false,
      nzComponentParams: {
        bill
      },
      nzFooter: null,
      nzWidth: window.innerWidth <= 767 ? '90vw' : '60vw',
    })

    modal.afterClose.subscribe(result => {
      // console.log('result', result)
      if (result) {
        // thanh toán thành công sang trang gia hạn hosting
        let route = `${this.id_subproject}/hosting-management/${this.currentHosting._id}`
        if (this.type === 'build') route = `/hosting-management/${this.currentHosting._id}`;
        this.router.navigate([`/${route}`]);
        this.vhEventMediator.notifyOnConfigChanged({
          id_hosting: this.currentHosting._id, paid_online: true,
        })
      } 

      this.opening = false;
    });
  }
}
