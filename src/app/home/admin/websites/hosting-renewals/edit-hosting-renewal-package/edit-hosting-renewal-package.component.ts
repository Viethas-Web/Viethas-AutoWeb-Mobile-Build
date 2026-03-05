import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { VhAlgorithm, VhImage, VhQueryAutoWeb } from 'vhautowebdb'; 
import { FunctionService } from 'vhobjects-service';  
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PackageUnitsComponent } from '../package-units/package-units.component';

@Component({
  selector: 'app-edit-hosting-renewal-package',
  templateUrl: './edit-hosting-renewal-package.component.html',
  styleUrls: ['./edit-hosting-renewal-package.component.scss']
})
export class EditHostingRenewalPackageComponent implements OnInit {
  editHostingRenewalPackageForm: FormGroup;
  EDITOR:any = DecoupledEditor;
  units: any[] = [
    {
      barcode: '',
      default: true,
      price: 0,
      ratio: 1,
    }
  ];
  submitting:boolean = false;
  hostingPackage:any = null;

  constructor( 
    public vhAlgorithm: VhAlgorithm,
    public vhQueryAutoWeb: VhQueryAutoWeb, 
    public functionService: FunctionService,
    public vhImage: VhImage,  
    private matdialog: MatDialog,
    public dialogRef: MatDialogRef<EditHostingRenewalPackageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    
  }

  ngOnInit(): void {
    this.hostingPackage = {...this.data.hostingPackage}
    this.initForm({...this.data.hostingPackage})
  }

  /** Hàm khởi tạo form
   *
   */
  initForm(data) { 
    this.editHostingRenewalPackageForm = new FormGroup({
      type: new FormControl(8),
      days: new FormControl(data.days),
    });

    let fieldNames:any = [
      {field: 'name', validators: {required: true, pattern: ''} },
      {field: 'description', validators: {required: false, pattern: ''} },
    ];

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminEditHandleChangeMultiLanguage(
        this.editHostingRenewalPackageForm,
        language.code,
        [],
        fieldNames,
        data,
      );
    });

    this.units = data.units

    this.vhAlgorithm.waitingStack().then(() => {
      this.vhAlgorithm.vhnumeral('.price'); 
      this.vhAlgorithm.vhnumeral('.days'); 
    });
  }

  close() { 
    this.dialogRef.close({
      ...this.editHostingRenewalPackageForm.value,
      days: parseFloat(this.vhAlgorithm.vhnumeral('.days')?.getRawValue() || 0),
      units: this.units.map((unit:any) => {
      return {
        ...unit,
        price:  parseFloat(this.vhAlgorithm.vhnumeral('.price')?.getRawValue() || 0),
        
      }
    }), _id: this.hostingPackage._id});
  }

  updatePackage(field,value): void {
    this.submitting = true;
    
    if(field == 'units') {
      const newValue = [
        {
          ...value[0],
          price:  parseFloat(this.vhAlgorithm.vhnumeral('.price')?.getRawValue() || 0),
        }
      ]

      value = newValue;
    }

    if(field == 'days') {
      value = parseFloat(this.vhAlgorithm.vhnumeral('.days')?.getRawValue() || 0);
    }

    this.vhQueryAutoWeb.updateHosting_Package(this.hostingPackage._id, {
      [field]: value
    })
    .then((res:any) => {
      if(res.vcode != 0) return this.functionService.createMessage('error', 'cap_nhat_goi_gia_han_hosting_that_bai')
    })
    .finally(() => this.submitting = false);
  }

  getFormControl(controlName: string): FormControl {
    return this.editHostingRenewalPackageForm.get(controlName) as FormControl;
  }

  public onReady(editor: any): void {
    editor.ui
      .getEditableElement()
      .parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
      );
    editor.plugins.get('FileRepository').createUploadAdapter = (
      loader: any
    ) => {
      return this.vhImage.MyUploadImageAdapter(loader, 'images/database/products');
    };
  }


  showUnitList() {
    const dataUnits = this.units.map((unit:any) => {
      return {
        ...unit,
        price: parseFloat(unit.price.toString().replace(',', '')),
        days: parseFloat(unit.days.toString().replace(',', '')),
      }
    })

    const dialogRef = this.matdialog.open(PackageUnitsComponent, {
      width: '60vw',
      height: '80vh',
      disableClose: true,
      data: {
        dataUnits: dataUnits,
        hostingPackage: this.hostingPackage,
        type: 'edit'
      }

    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result) {
        this.units = result

        this.vhAlgorithm.waitingStack().then(() => {
          this.vhAlgorithm.vhnumeral('.price'); 
          this.vhAlgorithm.vhnumeral('.days'); 
        });
      }
    }) 
  }

  generateBarcodesAutomatically() {
    let newbarcode = '';
    for (let index = 0; index < 12; index++) {
      newbarcode += Math.floor(Math.random() * 10);
    }
    if (this.checkBarcode(newbarcode)) {
      this.units[0].barcode = newbarcode;
      this.updatePackage('units', this.units);
    } else {
      this.generateBarcodesAutomatically();
    }
  }

  // nếu barcode hợp lệ trả về true
  async checkBarcode(barcode: string): Promise<boolean> {
    try {
      if(this.units.some((unit:any) => unit.barcode == barcode)) return false;

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

}
