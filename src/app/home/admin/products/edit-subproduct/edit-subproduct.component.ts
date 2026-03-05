import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb, VhEventMediator } from 'vhautowebdb';
import { UnitsComponent } from '../units/units.component';
import { AddProductLotsComponent } from '../add-product-lots/add-product-lots.component';
import { EditProductLotsComponent } from '../edit-product-lots/edit-product-lots.component';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-edit-subproduct',
  templateUrl: './edit-subproduct.component.html',
  styleUrls: ['./edit-subproduct.component.scss']
})
export class EditSubproductComponent implements OnInit {
  formSubProduct
  unitsSubProduct
  lots
  
  unitByRatio1
  units
  priceSubProduct
  price2SubProduct
  priceImportSubProduct
  priceSalesSubProduct
  listBarcode
  days_import_warning
  days_exp_warning
  formBuilder
  formLotProduct
  addProductForm
  formEditLotProduct
  postionEditLotProduct
  warningNumberSubProduct
  daysImportWarningSubProduct
  daysExpWarningSubProduct
  

  constructor(
    public dialogRef: MatDialogRef<EditSubproductComponent>,
    private vhAlgorithm: VhAlgorithm,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private vhEventMediator: VhEventMediator,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public functionService: FunctionService,
    private matdialog: MatDialog
  ) { }

  ngOnInit() {

    this.formSubProduct = this.data.formSubProduct
    this.unitsSubProduct = this.data.unitsSubProduct
    this.lots = this.data.lots
    this.formEditLotProduct = this.data.formEditLotProduct
    this.unitByRatio1 = this.data.unitByRatio1
    this.units = this.data.units
    this.priceSubProduct = this.data.priceSubProduct
    this.price2SubProduct = this.data.price2SubProduct
    this.priceImportSubProduct = this.data.priceImportSubProduct
    this.priceSalesSubProduct = this.data.priceSalesSubProduct
    this.listBarcode = this.data.listBarcode
    this.days_import_warning = this.data.days_import_warning
    this.days_exp_warning = this.data.days_exp_warning
    this.formBuilder = this.data.formBuilder
    this.formLotProduct = this.data.formLotProduct
    this.addProductForm = this.data.addProductForm
    this.postionEditLotProduct = this.data.postionEditLotProduct;

    this.warningNumberSubProduct = this.data.warningNumberSubProduct
    this.daysImportWarningSubProduct = this.data.daysImportWarningSubProduct
    this.daysExpWarningSubProduct = this.data.daysExpWarningSubProduct
    this.clearjsSubProduct()
  }

  languageChangedSubscription
  ngAfterViewInit(): void {
    // this.languageChangedSubscription = this.vhEventMediator.configChanged.subscribe((message: any) => {
    //   if (message?.status === 'update-language') {
    //     this.handleChangeMultiLanguage(message?.code)
    //   }
    // });
  }

  ngOnDestroy() {
    this.languageChangedSubscription?.unsubscribe();
  }

  clearjsSubProduct() {
    this.vhAlgorithm.waitingStack().then(() => {
      this.priceSubProduct = this.vhAlgorithm.vhnumeral('.price_subproduct');
      this.priceImportSubProduct = this.vhAlgorithm.vhnumeral(
        '.price_import_subproduct'
      );
      this.price2SubProduct = this.vhAlgorithm.vhnumeral('.price_2_subproduct');
      this.priceSalesSubProduct = this.vhAlgorithm.vhnumeral(
        '.webapp_price_sales_subproduct'
      );
      this.warningNumberSubProduct = this.vhAlgorithm.vhnumeral(
        '.warning_number_subproduct'
      );
      if (this.formSubProduct.value.manylot) {
        this.daysImportWarningSubProduct = this.vhAlgorithm.vhnumeral(
          '.days_import_warning_subproduct'
        );
        this.daysExpWarningSubProduct = this.vhAlgorithm.vhnumeral(
          '.days_exp_warning_subproduct'
        );
      }
    });
  }

  openUnitsSubProduct() {
    this.units = this.formSubProduct.value.units
    this.unitByRatio1 = {
      ...Object.keys(this.formSubProduct.value)
        .filter((key) => key.startsWith('unit_'))
        .reduce((units, key) => {
          units[key] = this.formSubProduct.value[key];
          return units;
        }, {}),
      default: this.units.length > 1 ? this.units[0].default : true,
      ratio: 1,
      barcode: this.formSubProduct.value.barcode,
      price: parseFloat(this.priceSubProduct.getRawValue() || 0),
      price2: parseFloat(this.price2SubProduct.getRawValue() || 0),
      price_import: parseFloat(this.priceImportSubProduct.getRawValue() || 0),
      webapp_price_sales: parseFloat(
        this.priceSalesSubProduct.getRawValue() || 0
      ),
    };
    if (this.units.length === 0) {
      this.units = [this.unitByRatio1];
    } else {
      this.units = this.units.filter((filter) => filter.ratio != 1);
      this.units = [this.unitByRatio1, ...this.units];
    }
    if (this.units.length === 1) this.units[0].default = true;
    this.listBarcode = !this.formSubProduct.value.manysize
      ? [
        this.formSubProduct.value.barcode,
        ...this.units.map((item) => item.barcode),
        ...this.lots.map((lot) => lot.barcode),
      ]
      : [];

    // this.openComponentUnits = !this.openComponentUnits;
    const dialogRef = this.matdialog.open(UnitsComponent, {
      width: '60vw',
      height: '80vh',
      disableClose: true,
      data: {
        dataUnits: this.units,
        barcodes: this.listBarcode
      }

    });

    dialogRef.afterClosed().subscribe((result) => {
      this.closeUnits(result);
    })
  }

  /** Hàm này thực hiện đóng danh sách đơn vị và xử lí sự kiện
 *
 */
  closeUnits(event) {
    if (event) {
      this.units = event;
      if (!this.addProductForm.value.manysize)
        this.addProductForm.controls['units'].setValue(event);
      else {
        this.formSubProduct.controls['units'].setValue(event);
      }
    }
  }

  changeManyLotSubProduct(e) {
    if (!e) {
      // manylot = false
      this.formSubProduct.removeControl('days_exp_warning');
      this.formSubProduct.removeControl('days_import_warning');
      if (this.formSubProduct.value.lots)
        this.formSubProduct.removeControl('lots');
    } else {
      // manylot = true
      this.formSubProduct.addControl(
        'days_exp_warning',
        new FormControl(0, [Validators.required])
      );
      this.formSubProduct.addControl(
        'days_import_warning',
        new FormControl(0, [Validators.required])
      );
      this.formSubProduct.addControl('lots', new FormControl([]));
      this.vhAlgorithm.waitingStack().then(() => {
        if (this.formSubProduct.value.manylot) {
          this.days_import_warning = this.vhAlgorithm.vhnumeral(
            '.days_import_warning_subproduct'
          );
          this.days_exp_warning = this.vhAlgorithm.vhnumeral(
            '.days_exp_warning_subproduct'
          );
        }
      });
    }
  }

  /** Hàm này thực khởi tạo form thêm lô và mở popup
 *
 */
  openFormAddLotProduct() {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10);
    this.formLotProduct = this.formBuilder.group({
      lot_number: new FormControl(
        '',
        Validators.compose([Validators.required])
      ),
      barcode: new FormControl(''),
      date_mfg: new FormControl(
        formattedDate,
        Validators.compose([Validators.required])
      ),
      date_exp: new FormControl(
        formattedDate,
        Validators.compose([Validators.required])
      ),
      hidden: new FormControl(false),
    });
    // this.visibleFormLotProduct = !this.visibleFormLotProduct;

    const dialogRef = this.matdialog.open(AddProductLotsComponent, {
      width: '30vw',
      height: '50vh',
      disableClose: true,
      data: {
        formLotProduct: this.formLotProduct,
      }
    });

    dialogRef.afterClosed().subscribe((result:boolean) => {
      if(result) {
        this.handleAddLotProduct()
      }
    })

  }

  
    /** Hàm thực hiện thêm lô sản phẩm
 *
 */
    handleAddLotProduct() {
      if (this.formLotProduct.valid) {
        this.lots = [this.formLotProduct.value, ...this.lots];
        // this.itemLots.setValue(this.lots);
        this.formSubProduct.controls['lots'].setValue(this.lots);
      }
      // this.visibleFormLotProduct = !this.visibleFormLotProduct;
    }


  /** Hàm này thực hiện xóa lô
 *
 * @param lot
 * @param index
 */
  openDeleteLotProduct(idx) {
    this.lots = this.lots.filter((_, index) => index != idx);
    this.formSubProduct.controls['lots'].setValue(this.lots);
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
      this.formSubProduct.controls['barcode'].setValue(newbarcode);
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

  /** Hàm này thực hiện khởi tạo form sửa lô và mở popup
   *
   * @param lot
   * @param index
   */
  openEditLotProduct(lot, index) {
    this.formEditLotProduct = new FormGroup({
      lot_number: new FormControl(
        lot.lot_number,
        Validators.compose([Validators.required])
      ),
      barcode: new FormControl(lot.barcode),
      date_mfg: new FormControl(
        lot.date_mfg,
        Validators.compose([Validators.required])
      ),
      date_exp: new FormControl(
        lot.date_exp,
        Validators.compose([Validators.required])
      ),
      hidden: new FormControl(lot.hidden),
    });
    this.postionEditLotProduct = index;
    // this.visibleFormEditLotProduct = !this.visibleFormEditLotProduct;

    const dialogRef = this.matdialog.open(EditProductLotsComponent, {
      width: '30vw',
      height: '50vh',
      disableClose: true,
      data: {
        formEditLotProduct: this.formEditLotProduct,
      }
    });

    dialogRef.afterClosed().subscribe((result:boolean) => {
      if(result) {
        this.handleEditLotProduct()
      }
    })

  }

  /** Hàm thực hiện sửa lô sản phẩm
 *
 */
  handleEditLotProduct() {
    if (this.formEditLotProduct.valid) {
      const editedData = this.formEditLotProduct.value;
      this.lots[this.postionEditLotProduct] = editedData;
      const newLots = this.lots.map((item, index) => index === this.postionEditLotProduct ? editedData : item);
      this.lots = newLots;
      this.formSubProduct.controls['lots'].setValue(this.lots);
    }
    // this.visibleFormEditLotProduct = !this.visibleFormEditLotProduct;
  }

  getFormControl(controlName: string): FormControl {
    return this.formSubProduct.get(controlName) as FormControl;
  }
}
