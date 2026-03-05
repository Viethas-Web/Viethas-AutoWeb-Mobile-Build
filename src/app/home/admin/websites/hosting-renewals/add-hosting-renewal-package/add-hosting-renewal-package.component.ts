import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { VhAlgorithm, VhImage, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PackageUnitsComponent } from '../package-units/package-units.component';

@Component({
  selector: 'app-add-hosting-renewal-package',
  templateUrl: './add-hosting-renewal-package.component.html',
  styleUrls: ['./add-hosting-renewal-package.component.scss']
})
export class AddHostingRenewalPackageComponent implements OnInit {
  addHostingPackageRenewalPackageForm: FormGroup;
  EDITOR:any = DecoupledEditor;
  units: any[] = [
    {
      barcode: '',
      default: true,
      price: 0,
      ratio: 1,
    }
  ];
  submitting: boolean = false;

  constructor(
    public vhAlgorithm: VhAlgorithm,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    public vhImage: VhImage,
    private matdialog: MatDialog,
    public dialogRef: MatDialogRef<AddHostingRenewalPackageComponent>,
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  /** Hàm khởi tạo form
   *
   */
  initForm() {
    this.addHostingPackageRenewalPackageForm = new FormGroup({
      type: new FormControl(8),
      days: new FormControl(365),
    });

    let fieldNames:any = [
      {field: 'name', validators: {required: true, pattern: ''} },
      {field: 'description', validators: {required: false, pattern: ''} },

    ];

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminAddHandleChangeMultiLanguage(
        this.addHostingPackageRenewalPackageForm,
        language.code,
        [],
        fieldNames,
      );
    });

    this.vhAlgorithm.waitingStack().then(() => {
      this.vhAlgorithm.vhnumeral('.price'); 
      this.vhAlgorithm.vhnumeral('.days'); 
    });
  }

  onSubmitAddHostingPackage(): void {
    // Kiểm tra xem có gói là default chưa, nếu chưa thì set default = true
    // nếu có rồi thì set default = false
    if(this.submitting) return;
    this.submitting = true;
    const value = {
      ...this.addHostingPackageRenewalPackageForm.value,
      days: parseFloat(this.vhAlgorithm.vhnumeral('.days')?.getRawValue() || 0),
      units: this.units.map((unit:any) => {
        return {
          ...unit,
          price:  parseFloat(this.vhAlgorithm.vhnumeral('.price')?.getRawValue() || 0),
        }
      })
    }

    this.vhQueryAutoWeb.addHosting_Package(value)
    .then((res: any) => {
      if (res.vcode != 0) {
        console.error(res.msg)
        return this.functionService.createMessage('error', 'them_goi_gia_han_hosting_that_bai')
      }
     
      this.dialogRef.close(res.data)
      this.functionService.createMessage('success', 'them_goi_gia_han_hosting_thanh_cong')
    })
    .catch((err) => console.error(err))
    .finally(() => this.submitting = false)
  }

  close() {
    this.dialogRef.close()
  }

  getFormControl(controlName: string): FormControl {
    return this.addHostingPackageRenewalPackageForm.get(controlName) as FormControl;
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
    const dialogRef = this.matdialog.open(PackageUnitsComponent, {
      width: '60vw',
      height: '80vh',
      disableClose: true,
      data: {
        dataUnits: this.units.map((unit:any) => {
          return {
            ...unit,
            price: +unit.price.toString().replace(',', ''),
            days: +unit.days.toString().replace(',', ''),
          }
        }),
        type: 'add'
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
