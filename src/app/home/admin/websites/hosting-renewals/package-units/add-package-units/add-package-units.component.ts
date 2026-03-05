import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-add-package-units',
  templateUrl: './add-package-units.component.html',
  styleUrls: ['./add-package-units.component.scss']
})
export class AddPackageUnitsComponent implements OnInit {
  addPackageUnitsForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,    
    public dialogRef: MatDialogRef<AddPackageUnitsComponent>,
    private vhAlgorithm: VhAlgorithm,
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.addPackageUnitsForm = new FormGroup({
      barcode: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required]),
      ratio: new FormControl('', [Validators.required]),
      default: new FormControl(false),
    });

    let fieldNames:any = [
      {field: 'unit', validators: {required: true, pattern: ''} },
    ];

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminAddHandleChangeMultiLanguage(
        this.addPackageUnitsForm,
        language.code,
        [],
        fieldNames,
      );
    });

    this.vhAlgorithm.waitingStack().then(() => {
      this.vhAlgorithm.vhnumeral('.price2'); 
      this.vhAlgorithm.vhnumeral('.ratio2'); 
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
    if (this.checkBarcode(newbarcode)) {
      this.addPackageUnitsForm.controls['barcode'].setValue(newbarcode);
    } else {
      this.generateBarcodesAutomatically();
    }
  }

  // nếu barcode hợp lệ trả về true
  async checkBarcode(barcode: string): Promise<boolean> {
    try {
      if(this.data.dataUnits.some((unit:any) => unit.barcode == barcode)) return false;

      const res:any = await this.vhQueryAutoWeb.getHosting_Packages_byFields_byPages({
        'units.barcode': { $eq: barcode },
      });
      if(res.vcode != 0) {
        console.error(res.msg)
        return false
      } 

      if (res.data.length > 0) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      return true;
    }
  }

  getFormControl(controlName: string): FormControl {
    return this.addPackageUnitsForm.get(controlName) as FormControl;
  }

  handleAddPackageUnits() {

    if(this.data.type == 'add') {
      this.dialogRef.close({
        ...this.addPackageUnitsForm.value,
        price: parseFloat(this.vhAlgorithm.vhnumeral('.price2').getRawValue()),
        ratio: parseFloat(this.vhAlgorithm.vhnumeral('.ratio2').getRawValue()),
      })
    } 
    
    if (this.data.type == 'edit') {
      const newUnit = {
        ...this.addPackageUnitsForm.value,
        price: parseFloat(this.vhAlgorithm.vhnumeral('.price2').getRawValue()),
        ratio: parseFloat(this.vhAlgorithm.vhnumeral('.ratio2').getRawValue()),
      }
      const newUnits = [...this.data.dataUnits, newUnit]

      this.vhQueryAutoWeb.updateHosting_Package(this.data.hostingPackage._id, {
        units: newUnits,
      })
      .then((res:any) => {
        if(res.vcode != 0) {
          console.error(res.msg)
          return
        }
        this.dialogRef.close(newUnit)
      })

      
    }
  }
}
