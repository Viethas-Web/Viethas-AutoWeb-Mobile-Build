import { Component, OnInit } from '@angular/core';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service/src/services';
import { ActivatedRoute } from '@angular/router';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { AtwQrBankingModal } from './qr-banking-modal/qr-banking-modal.component';

@Component({
  selector: 'app-hosting-renewal',
  templateUrl: './hosting-renewal.component.html',
  styleUrls: ['./hosting-renewal.component.scss']
})
export class HostingRenewalComponent implements OnInit {
  id_hosting:any;
  currentHosting: any;
  loading: boolean = true;
  /** Số ngày sử dụng hosting*/
  hostingPackages: any[] = [];
  hostingPackageChoosing: any = null;
  opening: boolean = false;
  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    private route: ActivatedRoute,
    private nzModalService: NzModalService
  ) { }

  ngOnInit() {
    this.route.parent.params.subscribe((routeParam) => {
      this.vhQueryAutoWeb.getHosting_byEndUser(routeParam.id_hosting)
      .then((res) => {
        if(res.vcode != 0) return this.functionService.createMessage('error', res.msg);
        this.currentHosting = res.data

        this.vhQueryAutoWeb.getHosting_Packages_byFields_byPages({}, {})
        .then((res:any) => {
          if(res.vcode != 0) return this.functionService.createMessage('error', res.msg);
          this.hostingPackages = res.data.map((item:any) => {
            const defaultUnit = item.units.find((unit:any) => unit.default);
            return {
              ...item,
              unitChoosing: defaultUnit
            }
          });
          this.hostingPackageChoosing = this.hostingPackages.find((item:any) => item.default)
        }).finally(() => this.loading = false);
      })
     
    });


  }

  handleRenewal() {
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
      // 3.có bill và bill đó của gia hạn hosting luôn(cập nhật lại bill, bill_detail)

      if (res.data.length == 0) {
        this.createBillandOpenModalBanking()
      }
      if (res.data.length > 0) {
        this.processBills(res.data)
        .then((bills:any) => {
          const findBillRenewalHosting = bills.find((bi:any) => bi.bill_details.length == 1);
          //2.có bill nhưng bill đó của gia hạn hosting(chỉ có 1 bill_detail), (xóa bill và bill_detail, tạo bill bill_detail mới))
          if(!findBillRenewalHosting) {
            // nếu tìm thấy bill gia hạn hosting thì xóa đi, tạo bill mới cho gia hạn hosting
            const findBillPaymentWebsite = bills.find((bill:any) => bill.bill_details.length == 2);
            if(findBillPaymentWebsite) {
              this.vhQueryAutoWeb.deleteBill_Billdetail(findBillPaymentWebsite._id)
            }
            this.createBillandOpenModalBanking()  
          }
          // 3.có bill và bill đó của gia hạn hosting luôn(cập nhật lại bill, bill_detail)
          else {
            // let billUpdated = {
            //   ...findBillRenewalHosting,
            //   total: this.hostingPackageChoosing.unitChoosing.price,
            //   payment: this.hostingPackageChoosing.unitChoosing.price
            // }
  
            // const findBillDetailHosting = findBillRenewalHosting.bill_details.find((bill_detail:any) => bill_detail.hasOwnProperty('id_hosting'));
  
            // let billDetailsUpdated = [
            //   {
            //     ...findBillDetailHosting,
            //     id_hosting: this.currentHosting._id,
            //     id_product: this.hostingPackageChoosing._id,
            //     ratio: this.hostingPackageChoosing.unitChoosing.ratio,
            //     price: this.hostingPackageChoosing.unitChoosing.price,
            //   },
            // ]


            let billUpdated = {
              ...findBillRenewalHosting,
              total: 2000,
              payment: 2000
            }
  
            const findBillDetailHosting = findBillRenewalHosting.bill_details.find((bill_detail:any) => bill_detail.hasOwnProperty('id_hosting'));
  
            let billDetailsUpdated = [
              {
                ...findBillDetailHosting,
                id_hosting: this.currentHosting._id,
                id_product: this.hostingPackageChoosing._id,
                ratio: this.hostingPackageChoosing.unitChoosing.ratio,
                price: 2000,
              },
            ]
            
  
            let promises = [this.vhQueryAutoWeb.updateBill(billUpdated._id, billUpdated), this.vhQueryAutoWeb.updateBill_detail(billDetailsUpdated[0]._id, billDetailsUpdated[0])]
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
     // let bill_details = [
    //   {
    //     id_hosting: this.currentHosting._id,
    //     id_product: this.hostingPackageChoosing._id,
    //     ratio: this.hostingPackageChoosing.unitChoosing.ratio ,
    //     price: this.hostingPackageChoosing.unitChoosing.price ,
    //     quantity: 1,
    //   }
    // ]

    // let bill = {
    //   id_customer: this.vhQueryAutoWeb.getlocalEndUser()._id,
    //   id_branch: this.vhQueryAutoWeb.getDefaultBranch()._id,
    //   tax: 0,
    //   fee: 0,
    //   total: this.hostingPackageChoosing.unitChoosing.price ,
    //   payment_type: 3,
    //   payment: this.hostingPackageChoosing.unitChoosing.price ,
    // }

    let bill_details = [
      {
        id_hosting: this.currentHosting._id,
        id_product: this.hostingPackageChoosing._id,
        ratio: this.hostingPackageChoosing.unitChoosing.ratio,
        price: 2000,
        ptype: 8,
        quantity: 1,
      }
    ]

    let bill = {
      id_customer: this.vhQueryAutoWeb.getlocalEndUser()._id,
      id_branch: this.vhQueryAutoWeb.getDefaultBranch()._id,
      tax: 0,
      fee: 0,
      total: 2000,
      payment_type: 3,
      payment: 2000,
    }

    this.vhQueryAutoWeb.createBill_Billdetail_36(bill, bill_details).then(
      (bill: any) => {
        this.openModalBanking(bill)
      },
      (error: any) => {
        this.functionService.createMessage('error', 'co_loi_xay_ra_vui_long_thu_lai', 1200);
        console.log('error ', error);
      });
  }

  openModalBanking(bill) {
    const modal: NzModalRef =  this.nzModalService.create({
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
      this.opening = false;
    });
  }

  onUnitChange(unit: any) {
    this.hostingPackageChoosing.unitChoosing = unit;
  }

}
