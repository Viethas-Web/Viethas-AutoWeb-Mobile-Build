import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhEventMediator, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-add-sub-food',
  templateUrl: './add-sub-food.component.html',
  styleUrls: ['./add-sub-food.component.scss']
})
export class AddSubFoodComponent implements OnInit {

  price: any = 0;
  price2: any = 0;

  formAddSubFood: FormGroup
  
  constructor(
    public dialogRef: MatDialogRef<AddSubFoodComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private vhEventMediator: VhEventMediator,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    private vhAlgorithm: VhAlgorithm
  ) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.formAddSubFood = new FormGroup({
      price2: new FormControl(0,Validators.compose([Validators.required, Validators.pattern('(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)')])),
      price: new FormControl(0,Validators.compose([Validators.required, Validators.pattern('(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)')])),
      barcode:new FormControl(''),
      allow_sell:new FormControl(true),
      selling:new FormControl(false),
    })

    let fieldNames:any = [
      {field: 'name', validators: {required: true} },
      {field: 'unit', validators: {required: true} },
    ];

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminAddHandleChangeMultiLanguage(
        this.formAddSubFood,
        language.code,
        [],
        fieldNames,
      );
    });
  }

  ngAfterViewInit() {
    this.clearjs();
  }

  clearjs() {
    this.vhAlgorithm.waitingStack().then(() => {
      this.price = this.vhAlgorithm.vhnumeral('.price');
      this.price2 = this.vhAlgorithm.vhnumeral('.price2');
    });
  }



  /** Hàm này thực hiện tự động tạo mã vạch
 *
 */
  generateBarcodesAutomatically() {
    let newbarcode = '';
    for (let index = 0; index < 12; index++) {
      newbarcode += Math.floor(Math.random() * 10);
    }
    this.checkBarcode(newbarcode).then((result) => {
      if (result) {
        this.formAddSubFood.controls['barcode'].setValue(newbarcode);
      } else {
        this.generateBarcodesAutomatically();
      }
    })
 
  }

  /** Hàm thực hiện check barcode tự động có hợp lệ không
   *
   * @param barcode
   * @returns true: barcode hợp lệ, false: barcode không hợp lệ
   */
  checkBarcode(barcode: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.vhQueryAutoWeb.getFoods_byFields({
        'units.0.barcode': { $eq: barcode }
      }).then((res:any) => {
        if (res.vcode == 0 && res.data.length > 0) {
          resolve(false);
        } else {
          if(this.data?.subFoods) {
            resolve(this.data.subFoods.every((subFood: any) => subFood.barcode != barcode))
          } else {
            resolve(true);
          }
        }
      })
    })
  }


  addSubFood() {
    if (this.formAddSubFood.invalid) {
      this.formAddSubFood.markAllAsTouched();
      return;
    }
    
    const data = {
      ...this.formAddSubFood.value,
    }

    data.price = parseFloat(
      this.price.getRawValue() ? this.price.getRawValue() : 0
    );
  
    data.price2 = parseFloat(
      this.price2.getRawValue() ? this.price2.getRawValue() : 0
    );

    this.checkBarcode(data.barcode).then((result) => {
      if (result) {
        this.dialogRef.close(data);
      } else {
        this.functionService.createMessage('error', 'barcode_da_ton_tai_vui_long_nhap_lai');
      }
    })
  }

  getFormControl(controlName: string): FormControl {
    return this.formAddSubFood.get(controlName) as FormControl;
  }
}
