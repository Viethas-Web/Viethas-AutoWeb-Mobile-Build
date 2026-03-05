import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { elementAt } from 'rxjs/operators';
import { LanguageService } from 'src/app/services/language.service';
import { ChooseProductVoucherComponent } from '../choose-product-voucher/choose-product-voucher.component';
import { FunctionService } from 'vhobjects-service';
@Component({
  selector: 'app-add-voucher',
  templateUrl: './add-voucher.component.html',
  styleUrls: ['./add-voucher.component.scss']
})
export class AddVoucherComponent implements OnInit {
  listProductChoosed = []; // danh sách sản phẩm đã chọn
   
  isVisible: boolean = false; // biến đóng mở modal
  total = 0; // tổng tiền
  priceProduct = 0;
  price_origin: any;
  keyWord: string = ''; // Từ khóa tìm kiếm
  imgDefault = "https://phutungnhapkhauchinhhang.com/wp-content/uploads/2020/06/default-thumbnail.jpg"
  /** danh sách danh mục để lọc khi thêm sp vào voucher */
  listCategories: any = [] 
  formVoucher: FormGroup;
  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public vhAlgorithm: VhAlgorithm,
    private router: Router,
    private route: ActivatedRoute, 
    public dialog: MatDialog,
    private functionService: FunctionService,
  ) { }

  ngOnInit(): void {
    this.initForm()
    this.getCategories();
  }

  getCategories() {
    this.vhQueryAutoWeb
      .getCategorys_byFields({ id_main_sectors: { $all: ['ecommerce'] } }, {}, {}, 0)
      .then((category: any) => {
        this.vhQueryAutoWeb.getCategorySteps_byIdCategoryArray(category.data.map(e => { return e._id }))
          .then((response: any) => {
            console.log('response', response);
            if (response.vcode === 0) {
              this.listCategories = category.data.map((e) => {
                return {
                  ...e,
                  array_step: Array(e.step)
                    .fill(0)
                    .map((_, i) => i),
                };
              });
            }
          }, (error: any) => {
            console.log('error', error)
          })

      });
  }
  // Khởi tạo form
  initForm() {
    this.formVoucher = new FormGroup({
      name: new FormControl('', [Validators.required]),
      points: new FormControl(0, [Validators.required]),
      price: new FormControl(0),
      unit: new FormControl('', [Validators.required]),
      price_origin: new FormControl(0, [Validators.required]),
      type: new FormControl(1),
      products: new FormControl([], Validators.required)
    })

    // Định dạng số cho trường price_origin
    this.formVoucher.get('price_origin')?.valueChanges.subscribe(value => {
      const formattedValue = this.formatCurrency(value);
      this.formVoucher.get('price_origin')?.setValue(formattedValue, { emitEvent: false });
    });

  }

  formatCurrency(value: string): string {
    if (!value) return '';
    // Xóa tất cả dấu phẩy trước khi thêm lại
    const cleanValue = value.replace(/,/g, '');
    // Định dạng lại giá trị với dấu phẩy
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  getRawValue(controlName: string): Number {
    return Number(controlName.toString().replace(/,/g, ''));
  }

  // Thêm voucher
  addVoucher() {
    this.formVoucher.get('products')?.setValue(this.listProductChoosed);
    if(this.listProductChoosed.length == 0) {
      this.functionService.createMessage('error', 'Vui lòng chọn sản phẩm');
      return;
    }
    if (this.formVoucher.invalid) {
      this.formVoucher.get('name')?.markAsTouched();
      this.formVoucher.get('points')?.markAsTouched();
      this.formVoucher.get('price_origin')?.markAsTouched();
      this.formVoucher.get('unit')?.markAsTouched();
      return;
    }

   const data_add = {
      name: this.formVoucher.get('name')?.value,
      units: [
        {
          points: this.getRawValue(this.formVoucher.get('points')?.value),
          price: this.getRawValue(this.formVoucher.get('price')?.value),
          unit: this.formVoucher.get('unit')?.value,
          price_origin: this.getRawValue(this.formVoucher.get('price_origin')?.value),
        },
      ],
      products: this.listProductChoosed.map(item => {
        return {
          id_product: item._id,
          price: this.getRawValue(item.unit_choosed.price),
          ptype: 3,
          quantity: item.quantity,
          ratio: item.unit_choosed.ratio,
        }
      }),
      type: 1,
   } 

   if(data_add.units[0].price_origin < data_add.units[0].price) {
      this.functionService.createMessage('error', 'gia_niem_yet_phai_lon_hon_hoac_bang_tong_gia_ban');
      return;
    }

    console.log('price_origin', data_add.units[0].price_origin);
    console.log('price', data_add.units[0].price);
  
    this.vhQueryAutoWeb.addVoucher(data_add)
          .then((res: any) => {
            if (res.vcode === 0) {
              this.functionService.createMessage('success', 'them_thanh_cong');
              this.goBack();
            }
          }).catch((error: any) => {
            console.error('error', error);
            this.functionService.createMessage('error', 'them_that_bai');
          })
  }
  deleteProduct(data) {
    this.listProductChoosed = this.listProductChoosed.filter(item => item._id != data._id)
    this.calculatePrice();
    this.formVoucher.get('products')?.setValue(this.listProductChoosed);
  }

  chooseProductVoucher(): void {
    const dialogRef = this.dialog.open(ChooseProductVoucherComponent, {
      width: '70vw',
      height: '75vh',
      disableClose: true,
      data: {
        listCategories: this.listCategories,
        listProductChoosed: this.listProductChoosed,
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(!result) return;
      if (result?.length) {
        this.listProductChoosed = [...result];
        this.calculatePrice();
        this.formVoucher.get('products')?.setValue(this.listProductChoosed);
      }
    });
  }

  
  goBack() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  // thay đổi số lượng thì thay đổi giá trị price của formVoucher
  calculatePrice() {
    this.total = this.listProductChoosed.reduce(
      (prev: number, next) => prev + next.quantity * next.unit_choosed.price,
      0
    );
    this.formVoucher.get('price')?.setValue(this.total);
  }
}
