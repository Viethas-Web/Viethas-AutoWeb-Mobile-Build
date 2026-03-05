import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-other-payment-sale',
  templateUrl: './other-payment-sale.component.html',
  styleUrls: ['./other-payment-sale.component.scss']
})
export class OtherPaymentSaleComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<OtherPaymentSaleComponent>) { }

  ngOnInit(): void {
  }
  closeDialog() {
    this.dialogRef.close();
  }
}
