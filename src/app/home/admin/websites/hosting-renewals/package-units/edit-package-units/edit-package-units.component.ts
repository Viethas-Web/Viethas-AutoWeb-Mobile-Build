import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
@Component({
  selector: 'app-edit-package-units',
  templateUrl: './edit-package-units.component.html',
  styleUrls: ['./edit-package-units.component.scss']
})
export class EditPackageUnitsComponent implements OnInit {
  editPackageUnitsForm: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, 
    public functionService: FunctionService,
    public dialogRef: MatDialogRef<EditPackageUnitsComponent>,
    public vhAlgorithm: VhAlgorithm,
    private vhQueryAutoWeb: VhQueryAutoWeb
  ) { }

  ngOnInit() {
    this.initForm(this.data.unit);
  }

  initForm(data) {
    this.editPackageUnitsForm = new FormGroup({
      barcode: new FormControl(data.barcode),
      price: new FormControl(data.price),
      ratio: new FormControl(data.ratio),
      default: new FormControl(data.default),
    });
    let fieldNames:any = [
      {field: 'unit', validators: {required: true, pattern: ''} },
    ];

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminEditHandleChangeMultiLanguage(
        this.editPackageUnitsForm,
        language.code,
        [],
        fieldNames,
        data,
      );
    });

    this.vhAlgorithm.waitingStack().then(() => {
      this.vhAlgorithm.vhnumeral('.price2'); 
      this.vhAlgorithm.vhnumeral('.ratio2'); 
    });
  }

  getFormControl(controlName: string): FormControl {
    return this.editPackageUnitsForm.get(controlName) as FormControl;
  }

  generateBarcodesAutomatically() {
    let newbarcode = '';
    for (let index = 0; index < 12; index++) {
      newbarcode += Math.floor(Math.random() * 10);
    }
    if (this.checkBarcode(newbarcode)) {
      this.editPackageUnitsForm.controls['barcode'].setValue(newbarcode);
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

  handleSavePackageUnits() {
    if(this.data.type == 'add') {
      this.dialogRef.close({
        ...this.editPackageUnitsForm.value,
        price: parseFloat(this.vhAlgorithm.vhnumeral('.price2').getRawValue()),
        ratio: parseFloat(this.vhAlgorithm.vhnumeral('.ratio2').getRawValue()),
      })
    }  
  }

  close() {
    if(this.data.type == 'add') {
      this.dialogRef.close(false)
    }

    if(this.data.type == 'edit') {
      this.dialogRef.close({
        ...this.editPackageUnitsForm.value,
        price: parseFloat(this.vhAlgorithm.vhnumeral('.price2').getRawValue()),
        ratio: parseFloat(this.vhAlgorithm.vhnumeral('.ratio2').getRawValue()),
      })
    }
  }

  handleSave() {
    console.log('this.data.type', this.data.type);
    if(this.data.type == 'add') return;

    const newUnit = {
      ...this.editPackageUnitsForm.value,
      price: parseFloat(this.vhAlgorithm.vhnumeral('.price2').getRawValue()),
      ratio: parseFloat(this.vhAlgorithm.vhnumeral('.ratio2').getRawValue()),
    }

    const newUnits = this.data.dataUnits.map((unit:any, index:number) => {
      return index == this.data.positionUnit ? newUnit : unit
    })

    console.log('newUnits', newUnits);

    this.vhQueryAutoWeb.updateHosting_Package(this.data.hostingPackage._id, {
      units: newUnits
    })
  }
}
