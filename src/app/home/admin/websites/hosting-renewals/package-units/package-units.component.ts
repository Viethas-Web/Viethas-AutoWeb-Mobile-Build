import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import { AddPackageUnitsComponent } from './add-package-units/add-package-units.component';
import { EditPackageUnitsComponent } from './edit-package-units/edit-package-units.component';

@Component({
  selector: 'app-package-units',
  templateUrl: './package-units.component.html',
  styleUrls: ['./package-units.component.scss'],
})
export class PackageUnitsComponent implements OnInit {
  dataUnits:any = [];
  barcodes: any = [];
  constructor(
    public vhAlgorithm: VhAlgorithm, 
    public vhQueryAutoWeb: VhQueryAutoWeb,
    private changeDetectorRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<PackageUnitsComponent>,
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

  /**
   * Mở popup thêm đơn vị
   */
  openModalAddUnit() {
    const dialogRef = this.matdialog.open(AddPackageUnitsComponent, {
      width: '40vw',
      height: '53vh',
      disableClose: true,
      data: {
        hostingPackage: this.data.hostingPackage,
        dataUnits: this.dataUnits,
        type: this.data.type
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result) {
        this.dataUnits = [...this.dataUnits, result];
      }
    });

  }


  /** 
   *
   * Hàm này thực hiện chọn đơn vị mặc định
   */
  selectUnitDefault(unit) {
    this.dataUnits
      .filter((fillter) => fillter != unit)
      .forEach((element) => {
        element.default = false;
      });
    const index = this.dataUnits.findIndex((find) => find == unit);
    this.dataUnits[index].default = true;
    if(this.data.type == 'edit') {
      this.vhQueryAutoWeb.updateHosting_Package(this.data.hostingPackage._id, {
        units: this.dataUnits
      })
    }
  }

  okUnits() {
    this.dataUnits = this.dataUnits.map((unit:any) => {
      return {
        ...unit,
        price: parseFloat(unit.price.toString().replace(',', '')),
        ratio: parseFloat(unit.ratio.toString().replace(',', '')),
      }
    })

    this.dialogRef.close(this.dataUnits)
  }

  close() {
    if(this.data.type == 'add') {
      this.dialogRef.close(false)
    }
    if(this.data.type == 'edit') {
      this.dialogRef.close(this.dataUnits)
    }
  }

  editUnit(unit, positionUnit) {
    const dialogRef = this.matdialog.open(EditPackageUnitsComponent, {
      width: '40vw',
      height: '53vh',
      disableClose: true,
      data: {
        positionUnit: positionUnit,
        unit: unit,
        dataUnits: this.dataUnits,
        type: this.data.type,
        hostingPackage: this.data.hostingPackage,
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result) {
        this.dataUnits = this.dataUnits.map((unit:any, index:number) => {
          return index == positionUnit ? result : unit
        })
      }
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
    // nếu type == 'add' thì truyền vào position
    this.dataUnits = this.dataUnits.filter((_, index) => positionUnit != index);

    if(this.data.type == 'edit') {
      this.vhQueryAutoWeb.updateHosting_Package(this.data.hostingPackage._id, {
        units: this.dataUnits
      })
    }
  }
}
