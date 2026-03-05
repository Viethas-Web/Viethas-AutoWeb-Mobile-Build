import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhEventMediator, VhQueryAutoWeb } from 'vhautowebdb';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { LanguageService } from 'src/app/services/language.service';
import { AddUnitsComponent } from './add-units/add-units.component';
import { EditUnitsComponent } from './edit-units/edit-units.component';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss'],
})
export class UnitsComponent implements OnInit {
  @Input('openComponentUnits') openComponentUnits: boolean = false;
  @Input('barcodes') barcodes: any = []; // Danh sách barcode được truyền
  @Input('dataUnits') dataUnits: any[]; // Danh sách đơn vị được truyền
  @Output('closeUnits') closeUnits = new EventEmitter<any>();

  ratioError = true;
  constructor(
    public vhAlgorithm: VhAlgorithm,
    private vhComponent: VhComponent,
    private languageService: LanguageService,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    private vhEventMediator: VhEventMediator,
    private changeDetectorRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<UnitsComponent>,
    public matdialog: MatDialog,
    public functionService: FunctionService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }
  ngOnInit(): void { 
    this.dataUnits = this.data.dataUnits
    this.barcodes = this.data.barcodes
  }
  
  tableHeight: string;
  ngAfterViewInit() {
    setTimeout(() => {
      if (
        document.querySelector('#_unit') &&
        document.querySelector('.ant-table-thead')
      ) {
        this.tableHeight =
          document.querySelector('#_unit').clientHeight -
          document.querySelector('.ant-table-thead').clientHeight +
          'px';
      }
      this.changeDetectorRef.detectChanges();
    }, 0);
  }

  public visibleFormUnit = false;
  public formHandleUnit: FormGroup;
  public visibleFormUnitEdit = false;
  /** Mở popup thêm đơn vị
   *
   */
  openModalAddUnit() {
    this.initFormUnit();
    // this.visibleFormUnit = !this.visibleFormUnit;

    const dialogRef = this.matdialog.open(AddUnitsComponent, {
      width: '40vw',
      height: '70vh',
      disableClose: true,
      data: {
        dataUnits: this.dataUnits,
        formHandleUnit: this.formHandleUnit,
        ratioExist: this.ratioExist,
        errorContentRatio: this.errorContentRatio,
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result) {
        this.handleSaveUnit()
      }
    });

  }

  handleSaveUnit() {
    if (this.formHandleUnit.valid) {
      const unit = {
        ...this.formHandleUnit.value,
        price: parseFloat(this.price.getRawValue()) || 0,
        price_import: parseFloat(this.price_import.getRawValue()) || 0,
        price2: parseFloat(this.price_2.getRawValue()) || 0,
        webapp_price_sales: parseFloat(this.price_sales.getRawValue()) || 0,
        hidden: false,
      };
      this.dataUnits = [...this.dataUnits, unit];
      this.visibleFormUnit = !this.visibleFormUnit;
    }
  }

  handleSaveUnitEdit() {
    if (this.formHandleUnit.valid) {
      this.dataUnits = this.dataUnits.map((element, index) => {
        if (index === this.postionUnitEdit) {
          return {
            ...this.formHandleUnit.value,
            price: parseFloat(this.price.getRawValue()) || 0,
            price_import: parseFloat(this.price_import.getRawValue()) || 0,
            price2: parseFloat(this.price_2.getRawValue()) || 0,
            webapp_price_sales: parseFloat(this.price_sales.getRawValue()) || 0,
          };
        }
        return element;
      });

      this.visibleFormUnitEdit = !this.visibleFormUnitEdit;
    }
  }

  initFormUnit(unit?) {
    const patternValidator = Validators.pattern(
      '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)'
    );
    
    const fields = [
      { name: 'price', value: unit?.price ?? 0, validators: [Validators.required, patternValidator] },
      { name: 'price2', value: unit?.price2 ?? 0, validators: [Validators.required, patternValidator] },
      { name: 'price_import', value: unit?.price_import ?? 0, validators: [Validators.required, patternValidator] },
      { name: 'webapp_price_sales', value: unit?.webapp_price_sales ?? 0, validators: [patternValidator] },
      { name: 'barcode', value: unit?.barcode ?? '' },
      { name: 'ratio', value: unit?.ratio ?? '', validators: [Validators.required] },
      { name: 'default', value: unit?.default ?? false, validators: [Validators.required] },
    ];

    const unitFields = this.functionService.multi_languages.map((language: any) => ({
      name: `unit_${language.code}`,
      value: unit?.[`unit_${language.code}`] ?? '',
      validators: [Validators.required],
    }));
    
    fields.push(...unitFields);
    
    this.formHandleUnit = new FormGroup(
      fields.reduce((acc, { name, value, validators = [] }) => {
        acc[name] = new FormControl(value, Validators.compose(validators));
        return acc;
      }, {})
    );
    this.clearjs();
  }

  clearjs() {
    this.vhAlgorithm.waitingStack().then(() => {
      this.price = this.vhAlgorithm.vhnumeral('#price');
      this.price_import = this.vhAlgorithm.vhnumeral('#price_import');
      this.price_2 = this.vhAlgorithm.vhnumeral('#price_2');
      this.price_sales = this.vhAlgorithm.vhnumeral('#price_sales');
    });
  }

  public price: any;
  public price_2: any;
  public price_sales: any;
  public price_import: any;
  errorContentRatio = 'ti_le_quy_doi_da_ton_tai';
  ratioExist = false;
  checkRatioExist() {
    const ratio = this.formHandleUnit.value.ratio;

    if(this.dataUnits.find(e => e.ratio == ratio)) this.ratioExist = true;
    else this.ratioExist = false;
  }

  /** Hàm này thực hiện chọn đơn vị mặc định
   *
   * @param unit
   */
  selectUnitDefault(unit?) {
    this.dataUnits
      .filter((fillter) => fillter != unit)
      .forEach((element) => {
        element.default = false;
      });
    const index = this.dataUnits.findIndex((find) => find == unit);
    this.dataUnits[index].default = true;
  }

  okUnits() {
    if (this.barcode_exist) {
      this.vhComponent.alertMessageDesktop(
        'error',
        this.languageService.translate('barcode_da_ton_tai')
      );
    } else {
      // this.closeUnits.emit(this.dataUnits);
      this.dialogRef.close(this.dataUnits)
    }
  }

  close() {
    // this.closeUnits.emit(this.dataUnits);
    this.dialogRef.close(this.dataUnits)
  }

  public postionUnitEdit: number;
  chooseUnit(unit, position) {
    if (unit.ratio === 1) return;
    this.initFormUnit(unit);
    this.postionUnitEdit = position;

    const dialogRef = this.matdialog.open(EditUnitsComponent, {
      width: '40vw',
      height: '70vh',
      disableClose: true,
      data: {
        dataUnits: this.dataUnits,
        formHandleUnit: this.formHandleUnit,
        ratioExist: this.ratioExist,
        errorContentRatio: this.errorContentRatio,
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result) {
        this.handleSaveUnitEdit()
      }
    });


    // this.visibleFormUnitEdit = !this.visibleFormUnitEdit;
  }

  barcode_exist = false;

  //  kiểm tra đơn vị khi thêm
  checkNameUnit(unit: string, position: number) {
    // if (unit.length) {
    //   if (unit == this.dataUnit.unit) {
    //     document.getElementById('unitError' + position).style.display = 'block';
    //     return;
    //   } else {
    //     const unitsNotPosition: any[] = this.units.value.filter(
    //       (item, index) => index != position
    //     );
    //     if (unitsNotPosition.length) {
    //       unitsNotPosition.forEach((element) => {
    //         if (element.unit != unit) {
    //           document.getElementById('unitError' + position).style.display =
    //             'none';
    //           return;
    //         } else {
    //           document.getElementById('unitError' + position).style.display =
    //             'block';
    //           return;
    //         }
    //       });
    //     } else {
    //       document.getElementById('unitError' + position).style.display =
    //         'none';
    //       return;
    //     }
    //   }
    // }
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
      const targetForm = this.formHandleUnit;

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

  deteleUnit(positionUnit) {
    this.dataUnits = this.dataUnits.filter((_, index) => positionUnit != index);
  }
}
