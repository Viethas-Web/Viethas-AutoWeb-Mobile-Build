import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-detail-invoice-of-sale',
  templateUrl: './detail-invoice-of-sale.component.html',
  styleUrls: ['./detail-invoice-of-sale.component.scss']
})
export class DetailInvoiceOfSaleComponent implements OnInit {
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
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public vhAlgorithm: VhAlgorithm,
    public dialogRef: MatDialogRef<DetailInvoiceOfSaleComponent>,
    private functionService: FunctionService
  ) {
  }

  ngOnInit(): void {
    this.getBillDetail();
    this.vhQueryAutoWeb.getEndUser(this.data.id_customer).then((rsp: any) => {
      if (rsp.vcode === 0) {
        //-----------your code-----------
        this.endUser = rsp.data;
      }
    }, (error: any) => {
      console.log('error', error)
    })
  }
  getBillDetail() {
    this.vhQueryAutoWeb.getBill_detailsByFields({ id_bill: { $eq: this.data._id } }, {}, {}, 0)
      .then((response: any) => {
        if (response.vcode === 0) {
          let bill_details = response.data;
          if (bill_details.length) {
            for (let i in bill_details) {
              let id = bill_details[i].id_subproduct ? bill_details[i].id_subproduct : bill_details[i].id_product;
              
            // Gán giá trị cho fn dựa trên điều kiện ptype
            let fn = bill_details[i].ptype == 1
            ? this.vhQueryAutoWeb.getDetailFood(id)
            : this.vhQueryAutoWeb.getDetailProduct(id);

              fn
                .then((detailproduct: any) => {
                  if (detailproduct) {
                    let name: string;
                    if (bill_details[i].units) {
                      name = detailproduct['name_' + this.functionService.selectedLanguageCode] + ` (${bill_details[i].units.find(item => item.ratio == bill_details[i].ratio).unit})`;
                    } else {
                      name = detailproduct['name_' + this.functionService.selectedLanguageCode]
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

  completeInvoice() {
    
    this.vhQueryAutoWeb.saveBill_Billdetail(this.data._id,1) 
    .then(()=>{

    })
  }
  closeDialog() {
    this.dialogRef.close();
  }
}