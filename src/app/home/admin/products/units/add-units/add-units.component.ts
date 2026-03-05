import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VhEventMediator, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-add-units',
  templateUrl: './add-units.component.html',
  styleUrls: ['./add-units.component.scss']
})
export class AddUnitsComponent implements OnInit {


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private vhEventMediator: VhEventMediator,
    public functionService: FunctionService,    
    public dialogRef: MatDialogRef<AddUnitsComponent>,
  ) { }

  ngOnInit() {

  }

  checkRatioExist() {
    const ratio = this.data.formHandleUnit.value.ratio;
    if(this.data.dataUnits.find(e => e.ratio == ratio)) this.data.ratioExist = true;
    else this.data.ratioExist = false;
  }

    /** Hàm này thực hiện tự động tạo mã vạch
   *
   */
    generateBarcodesAutomatically() {
      let newbarcode = '';
      for (let index = 0; index < 12; index++) {
        newbarcode += Math.floor(Math.random() * 10);
      }
      if (this.checkBarcode(newbarcode)) {
        const targetForm = this.data.formHandleUnit;
  
        targetForm.controls['barcode'].setValue(newbarcode);
      }
    }

  /** Hàm thực hiện check barcode tự động có hợp lệ không
 *
 * @param barcode
 * @returns true: barcode hợp lệ, false: barcode không hợp lệ
 */
  async checkBarcode(barcode: string): Promise<boolean> {
    try {
      const product = await this.vhQueryAutoWeb.getProducts_byFields({
        barcode: { $eq: barcode },
      });
      if (product) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      return true;
    }
  }

  getFormControl(controlName: string): FormControl {
    return this.data.formHandleUnit.get(controlName) as FormControl;
  }
}
