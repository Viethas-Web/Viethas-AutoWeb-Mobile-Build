import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
@Component({
  selector: 'app-edit-sub-food',
  templateUrl: './edit-sub-food.component.html',
  styleUrls: ['./edit-sub-food.component.scss']
})
export class EditSubFoodComponent implements OnInit {
  formEditSubFood: FormGroup
  price: any = 0;
  price2:any = 0;
  originalBarcode: string = ''; // Lưu giá trị ban đầu của barcode

  constructor(
    public dialogRef: MatDialogRef<EditSubFoodComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,    
    private vhAlgorithm: VhAlgorithm
  ) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.formEditSubFood = new FormGroup({
      price2: new FormControl(this.data.item.price2,
        Validators.compose([Validators.required,Validators.pattern('(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)')])
      ),
      price: new FormControl(
        this.data.item.price,
        Validators.compose([Validators.required,Validators.pattern('(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)')])
      ),
      barcode:new FormControl(this.data.item.barcode),
      allow_sell:new FormControl(this.data.item.allow_sell),
      selling:new FormControl(this.data.item.selling),
    })

    // Lưu giá trị ban đầu của barcode
    this.originalBarcode = this.data.item.barcode;
    let fieldNames:any = [
      {field: 'name', validators: {required: true, pattern: ''} },
      {field: 'unit', validators: {required: true, pattern: ''} },
    ];

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminEditHandleChangeMultiLanguage(
        this.formEditSubFood,
        language.code,
        [],
        fieldNames,
        this.data.item,
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
        this.formEditSubFood.controls['barcode'].setValue(newbarcode);
        if(this.data.type == 'edit') {
          this.onUpdateBarcode();
        }
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

  close() {
    if(this.data.type == 'add' ) {
      this.dialogRef.close();
    } else {
      const data = {...this.formEditSubFood.value}
  
      data.price = parseFloat(this.price.getRawValue() ? this.price.getRawValue() : 0);
    
      data.price2 = parseFloat(this.price2.getRawValue() ? this.price2.getRawValue() : 0);

      const result = {
        ...Object.keys(data)
              .filter((key) => key.startsWith('name_'))
              .reduce((obj, key) => ({ ...obj, [key]: data[key] }), {}),
          allow_sell: data.allow_sell,
          selling: data.selling,
          units: [
            {
              ...Object.keys(data)
              .filter((key) => key.startsWith('unit_'))
              .reduce((obj, key) => ({ ...obj, [key]: data[key] }), {}),
              ratio: 1,
              default: true,
              price: data.price,
              price2: data.price2,
              barcode: data.barcode,
            },
          ]
      }
      // console.log('result', result);
      this.dialogRef.close(result);
    }
  }

  editSubFood() {
    if (this.formEditSubFood.invalid) {
      this.formEditSubFood.markAllAsTouched();
      return;
    }
    
    const data = {
      ...this.formEditSubFood.value,
    }

    data.price = parseFloat(
      this.price.getRawValue() ? this.price.getRawValue() : 0
    );
  
    data.price2 = parseFloat(
      this.price2.getRawValue() ? this.price2.getRawValue() : 0
    );

    if(this.data.type == 'add') {
      this.checkBarcode(data.barcode).then((result) => {
        if(result) {
          this.dialogRef.close(data)
        } else {
          this.functionService.createMessage('error', 'barcode_da_ton_tai_vui_long_nhap_lai');
        }
      })
    } 
  }

  getFormControl(controlName: string): FormControl {
    return this.formEditSubFood.get(controlName) as FormControl;
  }

  /**
  * Do chỉ có trường name_, allow_sell, selling nằm ở cấp ngoài nên sẽ dùng hàm này để update,
  còn các trường còn lại nằm ở trong trường unit nên sẽ dùng hàm updateUnitField()
  * @param field 
  */
  updateField(field: string) {
    if(this.data.type == 'add') return;
    this.vhQueryAutoWeb.updateSubFood(this.data.item._id, {
      [field]: this.formEditSubFood.value[field],
    })
  }

  updateUnitField() {
    if(this.data.type == 'add') return;
    const data = {...this.formEditSubFood.value}
  
    data.price = parseFloat(this.price.getRawValue() ? this.price.getRawValue() : 0);
    data.price2 = parseFloat(this.price2.getRawValue() ? this.price2.getRawValue() : 0);
    this.vhQueryAutoWeb.updateSubFood(this.data.item._id, {
      units: [
        {
          ...Object.keys(data)
          .filter((key) => key.startsWith('unit_'))
          .reduce((obj, key) => ({ ...obj, [key]: data[key] }), {}),
          ratio: 1,
          default: true,
          price: data.price,
          price2: data.price2,
          barcode: data.barcode,
        },
      ]
    }).then((res:any) => {
      this.originalBarcode = data.barcode;
    })
    
  }

  onUpdateBarcode() {
    if(this.data.type == 'add') return;
    const data = {...this.formEditSubFood.value}
    if(data.barcode == this.originalBarcode) return;
    this.checkBarcode(data.barcode).then((result) => {
      if(result) {
        this.updateUnitField();
      } else {
        this.functionService.createMessage('error', 'barcode_da_ton_tai_vui_long_nhap_lai');
        this.formEditSubFood.controls['barcode'].setValue(this.originalBarcode);
      }
    })
  }
}
