import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { OtherPaymentSaleComponent } from '../other-payment-sale/other-payment-sale.component';

@Component({
  selector: 'app-edit-detail-invoice-of-sale',
  templateUrl: './edit-detail-invoice-of-sale.component.html',
  styleUrls: ['./edit-detail-invoice-of-sale.component.scss']
})
export class EditDetailInvoiceOfSaleComponent implements OnInit {
  showDetail: any = [];
  loading_product: boolean = false;
  discount: number = 0;
  tax: number = 0;
  endUser = {
    _id: '',
    email: 'wizzy@gmail.com',
    phone: '0596327888',
    name: 'Wizzy boy',
    address: 'LA',
    type: 0
  };
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public vhAlgorithm: VhAlgorithm,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<EditDetailInvoiceOfSaleComponent>,
  ) { }

  ngOnInit(): void {
    for(let i = 0; i<2; i++){
      this.showDetail.push({
        name: 'Sản phẩm ' + i,
        quantity: 3,
        unit: 'Cái',
        price: 200000,
      })
    }
  }
  formatterPercent = (value: number): string => `${value} %`;
  parserPercent = (value: string): string => value.replace(' %', '');
  getBillDetail() {
    this.vhQueryAutoWeb.getBill_detailsByFields({ id_bill: { $eq: this.data._id } }, {}, {}, 0)
      .then((response: any) => {
        if (response.vcode === 0) {
          let bill_details = response.data;
          if (bill_details.length) {
            for (let i in bill_details) {
              let id = bill_details[i].id_subproduct ? bill_details[i].id_subproduct : bill_details[i].id_product;
              this.vhQueryAutoWeb.getDetailProduct(id)
                .then((detailproduct: any) => {
                  if (detailproduct) {
                    let name: string;
                    if (bill_details[i].units) {
                      name = detailproduct.name + ` (${bill_details[i].units.find(item => item.ratio == bill_details[i].ratio).unit})`;
                    } else {
                      name = detailproduct.name
                    }
                    bill_details[i].name = name;
                    bill_details[i].unit = detailproduct.units[0].unit;

                    let img = '/assets/root/images/system/icons/default.svg';
                    let data = detailproduct?.webapp_img ? detailproduct?.webapp_img : detailproduct?.img;
                    bill_details[i].img = data ? data : img
                  }
                  this.showDetail = bill_details;
                }, (error: any) => {
                  // console.log('error', error)
                })
            }
          }
        }
      }, (error: any) => {
        // console.log('error', error)
      })
  }
  // Thêm thanh toán khác
  openPayment(){
    this.dialog.open(OtherPaymentSaleComponent,{
       width: '600px',
       height: '300px'
    })
   }
   deleteProduct(item){
    
   }
  closeDialog() {
    this.dialogRef.close();
  }
}
