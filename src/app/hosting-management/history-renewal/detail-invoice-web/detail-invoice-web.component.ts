import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service/src/services';

@Component({
  selector: 'app-detail-invoice-web',
  templateUrl: './detail-invoice-web.component.html',
  styleUrls: ['./detail-invoice-web.component.scss']
})
export class DetailInvoiceWebComponent implements OnInit {
  showDetail: any;
  loading_product: false;
  endUser = {
    _id: '',
    email: '',
    phone: '',
    name: '',
    address: '',
    type: 0
  };
  program_bill;
  program_product
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public dialogRef: MatDialogRef<DetailInvoiceWebComponent>,
    public vhAlgorithm: VhAlgorithm,
    public functionService:FunctionService
  ) {
  }

  ngOnInit(): void {
    this.getBillDetail();

    this.vhQueryAutoWeb.getEndUser(this.data.id_customer).then((rsp: any) => {
      if (rsp.vcode === 0) {
        //-----------your code-----------
        this.endUser = rsp.data;
        this.vhQueryAutoWeb.getCustomerClass(rsp.data.id_customer_class).then((customer_class: any) => {
          if (customer_class.vcode === 0) {
            //-----------your code-----------
            if (customer_class.data) {
              Promise.all([
                this.vhQueryAutoWeb.getEarningPointsBill(customer_class.data.id_earning_points_bill ? customer_class.data.id_earning_points_bill : '123'),
                this.vhQueryAutoWeb.getEarningPointsProduct(customer_class.data.id_earning_points_product ? customer_class.data.id_earning_points_product : '123')
              ]).then((res: any) => {
                
                
                this.program_bill = res[0].vcode == 0 ? res[0].data : null


                this.program_product = res[1].vcode == 0 ?  res[1].data : null
              })
            } else {

              //Khách hàng này chưa có hạng (nhờ chủ cửa hàng phân hạng cho họ)
            }
          }
        }, (error: any) => {
          console.log('error', error)
        })
      }
    }, (error: any) => {
      console.log('error', error)
    })
  }
  getBillDetail() {
    this.vhQueryAutoWeb.getBill_details_byId_bill(this.data._id)
      .then((response: any) => {
        // console.log('response', response)
        this.showDetail = response;
        // if (response) {
        //   let bill_details = response;
        //   let promise = [];
        //   bill_details.forEach((item) => {
        //     let id = item.id_subproduct ? item.id_subproduct : item.id_product;
        //     promise.push(this.vhQueryAutoWeb.getDetailProduct(id))
        //   })

        //   Promise.all(promise).then((res:any) => {
        //     bill_details.forEach((item, index) => {
        //       let id = item.id_product;
        //       const findItem = res.find(i => i._id == id);
        //       if(findItem) {
        //         item['name_' + this.functionService.selectedLanguageCode] = findItem['name_' + this.functionService.selectedLanguageCode]

        //         item.imgs = findItem.imgs;
        //         item.unit = findItem.units.find(i => i.ratio == item.ratio).unit;
        //       }
        //     })
            
        //   })
        // }
      }, (error: any) => {
        console.error('error', error)
      })
  }

  completeInvoice() {
    let promise = [];

    if (this.data.hasOwnProperty('coupon_codes') && this.data.coupon_codes.length) {
      for (let i = 0; i < this.data.coupon_codes.length; i++) {
        promise.push(this.vhQueryAutoWeb.updateCouponCode(this.data.coupon_codes[i]._id, { status: 4, id_bill: this.data._id, date_used: new Date(), id_customer_used: this.data.id_customer }));
      }
    }

    Promise.all(promise.concat([
      this.vhQueryAutoWeb.updateCustomer_byEarnedPoints(this.data.id_customer, this.getTotalEarningPoint()),
      this.vhQueryAutoWeb.saveBill_Billdetail(this.data._id, 1)
    ]))
      .then(() => {
        this.functionService.createMessage("success","Tạo đơn thành công")
        this.dialogRef.close(true);
      }, err => {
        console.log(err);
      }).catch(e => {
        console.log(e);
      });
  }


  /**
   * hàm get điểm tích lũy theo hóa đơn
   * 1. get hạng khách hàng
   * 2. từ hạng khách hàng get tích điểm theo bill
   * 3. check các điều kiện của chương trình
   * a check sản phẩm khuyến mãi include_promotion_product
   * b  check giảm giá/ chiết khấu include_discount
   * c check thanh toán = điểm thưởng include_paid_points
   * d check phí  include_fee
   * e check thuế include_tax
   * @returns 0 | number
   */
  getEarningBill() {
    if (this.program_bill && this.data.total > this.program_bill.bill_total_minimum) {


      let subTotal = this.data.total;

      if (!this.program_bill.include_promotion_product) { // ko tích điểm sp có km =>  tính lại subTotal
        subTotal = this.getSubTotalNotPromotion()
        if (this.program_bill.include_discount) subTotal = subTotal - this.data.discount - this.data.discount_bill

        if (this.program_bill.include_paid_points && this.data.payment_points) subTotal = subTotal - this.data.payment_points
        if (this.program_bill.include_fee) subTotal -= this.data.fee;

        if (this.program_bill.include_tax) subTotal += subTotal * (this.data.tax / 100)
        return ((subTotal - subTotal % this.program_bill.exchange.money) / this.program_bill.exchange.money) * this.program_bill.exchange.points
      }
      else {
        subTotal = this.data.total;
        if (this.program_bill.include_discount) subTotal = subTotal - this.data.discount - this.data.discount_bill

        if (this.program_bill.include_paid_points && this.data.payment_points) subTotal = subTotal - this.data.payment_points
        if (this.program_bill.include_fee) subTotal -= this.data.fee;

        if (this.program_bill.include_tax) subTotal += subTotal * (this.data.tax / 100)
        return ((subTotal - subTotal % this.program_bill.exchange.money) / this.program_bill.exchange.money) * this.program_bill.exchange.points
      }
    }
    else return 0
  }


  /**
  * hàm này trả về tổng tiền của sản phẩm ko có chương trình khuyến mãi
  * @return : number
  */
  getSubTotalNotPromotion() {
    return this.showDetail.filter(item => !item.id_promotion).reduce((prev: number, next) => prev + next.quantity * next.price, 0)
  }

  /**
   * hàm này trả về tổng tiền của sản phẩm  ko có chương trình khuyến mãi thuộc chương trình tích điểm sản phẩm
   * @return : number
   */
  getSubTotalNotPromotionOFProduct(products_of_program_earnig_product) {
    return this.showDetail
      .filter(item => item.price_origin == item.price && products_of_program_earnig_product.find(i => i == item.id_product || i == item.id_subproduct))
      .reduce((prev: number, next) => prev + next.quantity * next.price, 0)
  }


  /**
   * hàm này trả về tổng điểm được tích của tất cả sản phẩm
   * @returns 0 | number
   */
  getEarningProduct(products) {
    if (this.program_product) {
      let subTotal = 0;
      if (!this.program_product.include_promotion_product) { // tích điểm sp có km =>  tính lại subTotal
        subTotal = this.getSubTotalNotPromotionOFProduct(this.program_product.products)
        return ((subTotal - subTotal % this.program_product.exchange.money) / this.program_product.exchange.money) * this.program_product.exchange.points
      }
      else {
        subTotal = products.filter(item => item.price_origin == item.price && this.program_product.products.find(i => i == item.id_product)).reduce((prev: number, next) => prev + next.quantity * next.price, 0)
        return ((subTotal - subTotal % this.program_product.exchange.money) / this.program_product.exchange.money) * this.program_product.exchange.points
      }
    }
    else return 0
  }




  earning_point: number = 0;
  /**
   * hàm này trả về tổng điểm được tích của đơn và sản phẩm
   * @returns 0 | number
   */
  getTotalEarningPoint() {
    this.earning_point = this.getEarningProduct(this.showDetail) + this.getEarningBill();
    return this.earning_point ? this.earning_point : 0
  }

  /**
   * hàm này trả về điểm được tích của sản phẩm được thêm
   * @param product sản phẩm được thêm
   * @returns 0 | number
   */
  getTotalEarningPointProduct(product, promotion) {
    if (this.program_product) {
      let subTotal = 0;
      if (!this.program_product.include_promotion_product && promotion) { // tích điểm sp có km =>  tính lại subTotal
        subTotal = this.program_product.products.find(i => i == product._id) ? product.price : 0
        return ((subTotal - subTotal % this.program_product.exchange.money) / this.program_product.exchange.money) * this.program_product.exchange.points
      }
      else {
        subTotal = this.program_product.products.find(i => i == product._id) ? product.price : 0
        return ((subTotal - subTotal % this.program_product.exchange.money) / this.program_product.exchange.money) * this.program_product.exchange.points
      }
    }
    else return 0
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
