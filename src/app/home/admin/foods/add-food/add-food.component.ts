import { Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb, VhImage, VhEventMediator } from 'vhautowebdb';
import { AddCategoryComponent } from '../../categories/add-category/add-category.component';
import { LanguageService } from 'src/app/services/language.service';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { AddGroupPropertyFoodComponent } from '../add-group-property-food/add-group-property-food.component';
import { EditGroupPropertyFoodComponent } from '../edit-group-property-food/edit-group-property-food.component';
import { ChooseToppingComponent } from '../choose-topping/choose-topping.component';
import { AddSubFoodComponent } from '../add-sub-food/add-sub-food.component';
import { EditSubFoodComponent } from '../edit-sub-food/edit-sub-food.component';
import { FunctionService, ManageLibraryComponent } from 'vhobjects-service';
import { DescriptionByDeviceComponent } from '../../components/dialog/description-by-device/description-by-device.component';
import { DomSanitizer } from '@angular/platform-browser';
import { VhCkeditorModalComponent } from '../../components/vh-ckeditor-modal/vh-ckeditor-modal.component';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
@Component({
  selector: 'app-add-food',
  templateUrl: './add-food.component.html',
  styleUrls: ['./add-food.component.scss'],
})
export class AddFoodComponent implements OnInit {
  @Output() submitAddFood = new EventEmitter();
  content: any = '';
  public addFoodForm: FormGroup;
  public categories: any = [];
  public price: any;
  public price2: any;
  public webapp_price_sales: any;
  public barcode: boolean = false;
  public category: any;
  public img: string = '';
  public listImgProduct: Array<any> = [];
  showModalPrintBarcode = false;
  stateObj: any;
  listBarcode = [];
  selectedListCategory = [];
  public selectedIndexTabset = 0;
  newFields = [];
  newFieldsCKEditor = [];
  doneLoad = false;

  public properties: Array<any> = []; // Danh sách thuộc tính
  public subFoods: Array<any> = []; // Danh sách size món ăn
  submitting = false; // Trạng thái submit form để tránh submit nhiều lần
  toppingsChoosed: any = [];
  categoryToppings: any = [];
  languageChangedSubscription;
  devices = [
    {
      value: 'desktop',
      label: 'may_tinh',
      width: 1920,
      height: 1080,
      display: false,
    },
    {
      value: 'tablet_landscape',
      label: 'may_tinh_bang_ngang',
      width: 1920,
      height: 1080,
      display: false,
    },
    {
      value: 'tablet_portrait',
      label: 'may_tinh_bang_doc',
      width: 1920,
      height: 1080,
      display: false,
    },
    {
      value: 'mobile_landscape',
      label: 'dien_thoai_ngang',
      width: 1920,
      height: 1080,
      display: false,
    },
    {
      value: 'mobile_portrait',
      label: 'dien_thoai_doc',
      width: 1920,
      height: 1080,
      display: false,
    }
  ];

  ckeditorFields = [
    {
      field_custom: 'webapp_description',
      field_lable: 'mo_ta_chi_tiet'
    },
    {
      field_custom: 'webapp_sort_description',
      field_lable: 'mo_ta_ngan'
    },
  ];

  constructor(
    private el: ElementRef,
    public vhAlgorithm: VhAlgorithm,
    public functionService: FunctionService,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public vhImage: VhImage,
    public dialog: MatDialog,
    public vhComponent: VhComponent,
    private vhEventMediator: VhEventMediator,
    public languageService: LanguageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddFoodComponent>,
    public matdialog: MatDialog,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,

  ) {
  }

  ngOnInit(): void {
    this.categories = this.data.categories.filter(c => c._id != 'all');

    this.getNewFileds();
    this.getCategoryToppings();
  }

  ngAfterViewInit(): void {
    // Đoạn này sẽ giúp khởi tạo CKEDITOR không bị ẩn thanh tool lúc khởi tạo
    const webapp_description = document.getElementById('webapp_description');
    if (webapp_description) {
      webapp_description.style.display = 'none';
      setTimeout(() => {
        webapp_description.style.display = 'block';
      }, 500);
    }

    // this.languageChangedSubscription = this.vhEventMediator.configChanged.subscribe((message: any) => {
    //   if (message?.status === 'update-language') {
    //     this.handleChangeMultiLanguage(message?.code)
    //   }
    // });
  }

  ngOnDestroy() {
    for (const { element, event, handler } of this.editorListeners) {
      element.removeEventListener(event, handler);
    }
    this.editorListeners = [];
    this.languageChangedSubscription?.unsubscribe();
  }

  /**
   * hàm này render option danh mục có dấu - thể hiện cấp độ
   * @param category danh mục cần render
   * @returns
   */
  renderOptionCategory(category) {
    if (category.step) {
      return Array(category.step).fill(0).map((_, i) => i).map(() => '- ').join('') + category['name_' + this.functionService.languageTempCode];
    }
    return category['name_' + this.functionService.languageTempCode];
  }

  getNewFileds() {
    this.vhQueryAutoWeb.getNewFields_byFields({ id_main_sector: { $eq: 'food_drink' } })
      .then((newfields: any) => {
        this.newFields = newfields;
        this.newFields.forEach((field: any) => {
          if (!field.hasOwnProperty('field_input_location')) {
            field.field_input_location = 'admin';
            field.field_input_type = 'input';
            field.field_display_type = 'text';
          }
        });
        this.newFields = this.vhAlgorithm.sortNumberbyASC(newfields, 'field_order_number').filter(e => e.field_input_type != 'ckeditor');
        this.newFieldsCKEditor = this.vhAlgorithm.sortNumberbyASC(newfields, 'field_order_number').filter(e => e.field_input_type == 'ckeditor');
        this.initForm();
      });
  }

  deleteTopping(id) {
    this.toppingsChoosed = this.toppingsChoosed.filter((item) => item._id !== id);
  }

  getCategoryToppings() {
    this.vhQueryAutoWeb
      .getCategorys_byFields({ id_main_sector: { $all: ['food_drink'] } }, {}, {}, 0)
      .then((category: any) => {
        this.vhQueryAutoWeb.getCategorySteps_byIdCategoryArray(category.data.map(e => { return e._id; }))
          .then((response: any) => {
            if (response.vcode === 0) {
              this.categoryToppings = category.data.map((e) => {
                return {
                  ...e,
                  array_step: Array(e.step)
                    .fill(0)
                    .map((_, i) => i),
                };
              });
            }
          }, (error: any) => {
            console.log('error', error);
          });

      });
  }



  trackByFn(index: number, item: any) {
    return item.id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }

  ngDestroy(): void {
    this.submitAddFood.emit({ data: 'Dữ liệu trả về' });
  }
  /** Hàm khởi tạo form
   *
   */
  initForm(): void {
    this.addFoodForm = new FormGroup({
      id_categorys: new FormControl([]),
      units: new FormControl([]),
      selling: new FormControl(false),
      price: new FormControl(0, Validators.compose([Validators.pattern('(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)')])),
      price2: new FormControl(0, Validators.compose([Validators.pattern('(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)')])),
      barcode: new FormControl(''),
      manysize: new FormControl(false),
      properties: new FormControl([]),
      webapp_price_sales: new FormControl(0, Validators.compose([Validators.pattern('(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)')])),
      webapp_hidden: new FormControl(false),
      google_shopping_enable: new FormControl(false),
      google_shopping: new FormGroup({
        id: new FormControl(''),
        title: new FormControl(''),
        description: new FormControl(''),
        link: new FormControl(''),
        image_link: new FormControl(''),
        additional_image_links: this.formBuilder.array(
          Array.from({ length: 10 }).map(() => new FormControl(''))
        ),
        price: new FormControl(''),
        availability: new FormControl(''),
        brand: new FormControl(''),
        condition: new FormControl(''),
        type_product: new FormControl(''),
        google_product_category: new FormControl(''),
      }),
      url_canonical: new FormControl(''),
    });

    let fieldNames: any = [
      { field: 'name', validators: { required: true, pattern: '' } },
      { field: 'webapp_sort_description', validators: { required: false, pattern: '' } },
      { field: 'webapp_description', validators: { required: false, pattern: '' } },
      { field: 'unit', validators: { required: true, pattern: '' } },
      { field: 'webapp_seo_title', validators: { required: false, pattern: '' } },
      { field: 'webapp_seo_description', validators: { required: false, pattern: '' } },
      { field: 'webapp_seo_keyword', validators: { required: false, pattern: '' } },
    ];

    this.devices.forEach(device => {
      fieldNames.push(
        { field: `${device.value}_webapp_description`, validators: { required: false, pattern: '' } },
        { field: `${device.value}_webapp_sort_description`, validators: { required: false, pattern: '' } },
      );
      // Thêm các field từ newFieldsCKEditor
      this.newFieldsCKEditor?.forEach((item: any) => {
        if (item?.field_custom) {
          fieldNames.push({
            field: `${device.value}_${item.field_custom}`,
            validators: { required: false, pattern: '' }
          });
        }
      });
    });

    this.newFields.filter((f: any) => f.field_input_type == "select-multiple").forEach((field: any) => {
      this.addFoodForm.addControl(field.field_custom, new FormControl(field.field_start_value || [], field.field_required ? [Validators.required] : []));
    });

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminAddHandleChangeMultiLanguage(
        this.addFoodForm,
        language.code,
        [...this.newFields.filter((f: any) => f.field_input_type != "select-multiple"), ...this.newFieldsCKEditor],
        fieldNames,
      );
    });

    this.doneLoad = true;
    this.clearjs();
  }

  clearjs() {
    this.vhAlgorithm.waitingStack().then(() => {
      this.price = this.vhAlgorithm.vhnumeral('.price');
      this.price2 = this.vhAlgorithm.vhnumeral('.price2');
      this.webapp_price_sales = this.vhAlgorithm.vhnumeral('.webapp_price_sales');
    });
  }


  onSubmitAddProduct(value): void {
    this.submitting = true;
    const food = {
      ...value,
      properties: this.properties,
      imgs: this.listImgProduct.map((item) => item.path),
      type: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!this.addFoodForm.valid) {
      this.functionService.createMessage('error', this.languageService.translate('vui_long_dien_du_thong_tin'));
      this.submitting = false;
    }

    food.link = this.functionService.nonAccentVietnamese(food['name_' + this.functionService.defaultLanguage].trim());
    food.link = food.link.replace(/[^a-z0-9-]/g, '');
    this.vhQueryAutoWeb
      .getFoods_byFields({ link: { $eq: food.link } })
      .then(
        (response: any): void => {
          if (response.vcode === 0 && response.data.length !== 0) {
            food.link = food.link + '-1';
          }

          // Nếu có size thì xóa các trường không cần thiết
          if (food.manysize) {
            if (!this.subFoods.length) {
              this.functionService.createMessage('error', this.languageService.translate('vui_long_them_it_nhat_mot_co_mon_an'));
              this.submitting = false;
              return;
            }

            Object.keys(food).forEach((key) => {
              if (key.startsWith('unit_')) {
                delete food[key];
              }
            });
            delete food.units;
            delete food.price;
            delete food.price2;
            delete food.webapp_price_sales;
            delete food.barcode;
            delete food.webapp_hidden;
            delete food.selling;
            delete food.subs;

            this.subFoods = this.subFoods.map(sub => ({
              ...Object.fromEntries(Object.entries(sub).filter(([key]) => key.startsWith('name_'))),
              allow_sell: sub.allow_sell,
              selling: sub.selling,
              units: [{
                ratio: 1,
                ...Object.fromEntries(Object.entries(sub).filter(([key]) => key.startsWith('unit_'))),
                barcode: sub.barcode,
                price: sub.price || 0,
                price2: sub.price2 || 0,
                default: true
              }]
            }));
          } else {
            this.subFoods = [];
            food.price = parseFloat(this.price.getRawValue() ? this.price.getRawValue() : 0);
            food.price2 = parseFloat(this.price.getRawValue() ? this.price2.getRawValue() : 0);
            food.webapp_price_sales = parseFloat(this.webapp_price_sales.getRawValue() ? this.webapp_price_sales.getRawValue() : 0);
            // Lọc các trường bắt đầu bằng "unit_"
            const unitFields = Object.entries(food)
              .filter(([key]) => key.startsWith('unit_'))
              .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
              }, {});

            // Gán lại `food.units`
            food.units = [
              {
                barcode: food.barcode,
                price: food.price ? food.price : 0,
                price2: food.price2 ? food.price2 : 0,
                webapp_price_sales: food.webapp_price_sales,
                ...unitFields, // Thêm tất cả các trường bắt đầu bằng "unit_"
                ratio: 1,
                default: true,
              },
            ];

            Object.keys(food).forEach((key) => {
              if (key == 'price' || key == 'price2' || key == 'webapp_price_sales' || key == 'barcode' || key.startsWith('unit_'))
                delete food[key];
            });
          }

          // topping liên kết
          food.toppings = this.toppingsChoosed.map((dish) => {
            return {
              id_topping: dish._id,
              quantity: dish.quantity,
            };
          });

          if (!food.manysize) {
            this.checkBarcode(food.units[0].barcode).then((result: any) => {
              if (result) {
                this.handleAddFood(food);
              } else {
                this.functionService.createMessage('error', this.languageService.translate('barcode_da_ton_tai_vui_long_nhap_lai'));
                this.submitting = false;
              }
            });
          } else {
            this.handleAddFood(food);
          }



        },
        (error) => {
          this.functionService.createMessage('error', this.languageService.translate('co_loi_xay_ra_vui_long_thu_lai'));
          this.submitting = false;
        }
      );
  }

  handleAddFood(food) {
    this.functionService.showLoading('').then(() => {
      this.vhQueryAutoWeb.addFoodAndSubsFood({ ...food }, this.subFoods).then(
        (res: any) => {
          if (res.vcode === 0) {
            let dataClose = { ...res.data, _id: res.data._id };
            if (this.subFoods.length > 0) {
              dataClose.subs = this.subFoods;
            }
            this.functionService.createMessage('success', this.languageService.translate('them_mon_an_thanh_cong'));
            // this.submitAddFood.emit(dataClose);
            this.dialogRef.close(dataClose);
          }
          if (res.vcode === 11) {
            this.functionService.createMessage(
              'error',
              this.languageService.translate('phien_dang_nhap_da_het_han')
            );
          }
        },
        (err: any) => {
          this.functionService.createMessage(
            'error',
            this.languageService.translate('co_loi_xay_ra_vui_long_thu_lai')
          );
        }
      ).finally(() => {
        setTimeout(() => {
          this.submitting = false;
          this.vhComponent.hideLoading(0);
        }, 100);
      });
    });

  }

  openFormAddSubFood(): void {
    const dialogRef = this.matdialog.open(AddSubFoodComponent, {
      width: '40vw',
      height: '61vh',
      data: {
        subFoods: this.subFoods,
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.subFoods = [...this.subFoods, result];
        this.addFoodForm.controls['subs'].setValue(this.subFoods);
      }
    });
  }



  /** Hàm thực hiện điều chỉnh cỡ với vị trí trong mảng
   *
   * @param item
   * @param index
   */
  openFormEditSubFood(item, index: number): void {
    const dialogRef = this.matdialog.open(EditSubFoodComponent, {
      width: '40vw',
      height: '61vh',
      data: {
        item,
        type: 'add', // type: 'edit' hoặc 'add', khi edit thì sẽ cập nhật dữ liệu liền k cần ấn lưu,
        subFoods: this.subFoods
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.subFoods = this.subFoods.map((item, idx) => {
          if (idx === index) {
            return result;
          }
          return item;
        });
        this.addFoodForm.controls['subs'].setValue(this.subFoods);
      }
    });
  }

  /** Hàm thực hiện xóa cỡ theo vị trí trong mảng subFoods
   *
   * @param index vị trí cỡ trong mảng subFoods
   */
  deleteSubFood(indexInput: number): void {
    this.subFoods = this.subFoods.filter((_, index) => index !== indexInput);
    this.addFoodForm.controls['subs'].setValue(this.subFoods);
  }

  enterPrice(): void {
    let data = this.addFoodForm.value;

    if (data.units.length !== 0) {
      // Cập nhật giá trị cho đơn vị mặc định
      this.addFoodForm.value.units.find((item) => item.default).price = parseFloat(this.price.getRawValue());
      this.addFoodForm.value.units.find((item) => item.default).webapp_price_sales = parseFloat(this.webapp_price_sales.getRawValue());
      this.addFoodForm.value.units.find((item) => item.default)[`unit_${this.functionService.languageTempCode}`] = data[`unit_${this.functionService.languageTempCode}`];
    } else {
      // Nếu không có units, thêm unit mới vào
      let units = [
        {
          [`unit_${this.functionService.languageTempCode}`]: this.addFoodForm.value[`unit_${this.functionService.languageTempCode}`],
          ratio: 1,
          default: true,
          price: parseFloat(this.price.getRawValue()),
          webapp_price_sales: parseFloat(this.webapp_price_sales.getRawValue()),
          barcode: ''
        },
      ];
      if (this.addFoodForm.value.units.length === 0) {
        this.addFoodForm.controls['units'].setValue(units);
      }
    }
  }


  changeManySize(e): void {
    if (!e) {
      this.initForm();
      this.clearjs();
    } else {
      this.addFoodForm.removeControl('price');
      this.addFoodForm.removeControl('subs');
      Object.keys(this.addFoodForm.controls)
        .filter(key => key.startsWith('unit_'))
        .forEach(key => {
          this.addFoodForm.removeControl(key);
        });
      this.addFoodForm.removeControl('barcode');
      this.addFoodForm.removeControl('webapp_price_sales');
      this.subFoods = [];
      this.addFoodForm.addControl('subs', new FormControl(this.subFoods, [Validators.required, this.arrayLengthValidator(1)]));
    }
  }

  arrayLengthValidator(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (Array.isArray(control.value) && control.value.length >= minLength) {
        return null; // No error
      }
      return { arrayLength: { requiredLength: minLength, actualLength: control.value.length } };
    };
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
        this.addFoodForm.controls['barcode'].setValue(newbarcode);
      } else {
        this.generateBarcodesAutomatically();
      }
    });

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
      }).then((res: any) => {
        if (res.vcode == 0 && res.data.length > 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  createCategory() {
    const dialogRef = this.dialog.open(AddCategoryComponent, {
      width: '60vw',
      height: '60vh',
      disableClose: true,
      data: {
        categories: this.categories,
        setupCategoryImg: this.data.setupCategoryImg
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.id_main_sectors.includes('food_drink')) {
        this.data.categories.push(result);
        this.categories = [...this.categories, result];
      }
    });
  }


  openFormAddProperties() {
    const dialogRef = this.matdialog.open(AddGroupPropertyFoodComponent, {
      width: '40vw',
      height: '50vh',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.properties = [...this.properties, result];
      }
    });
  }

  /** Hàm thực mở form sửa thuộc tính cho món ăn
   *
   */
  openFormEditProperties(property: string, index: number) {
    const dialogRef = this.matdialog.open(EditGroupPropertyFoodComponent, {
      width: '40vw',
      height: '50vh',
      data: property,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.properties[index] = result;
      }
    });
  }


  deletePropertyByIndex(indexInput: number) {
    this.properties = this.properties.filter(
      (_, index) => index !== indexInput
    );
  }

  handleOkEditProperty() { }


  openChooseTopping() {
    const dialogRef = this.matdialog.open(ChooseToppingComponent, {
      width: '50vw',
      height: '72vh',
      data: {
        toppingsChoosed: this.toppingsChoosed,
        categoryToppings: this.categoryToppings,
        type: 'add'
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toppingsChoosed = [...this.toppingsChoosed, ...result];
      }
    });
  }


  /** Hàm nhận sự kiện trả về danh sách ảnh từ app-list-image
   *
   * @param event
   */
  sendImgs(event) {
    if (event) {
      this.listImgProduct = event.imgs;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  forcusInput() {
    setTimeout(() => {
      document.getElementById('inputSearch').focus();
    }, 500);

  }

  // selectChange(event) {
  //   this.addFoodForm.controls['id_categorys'].setValue(event);
  // }

  selectChange(event, field) {
    this.addFoodForm.controls[field].setValue(event);
  }

  getFormControl(controlName: string): FormControl {
    return this.addFoodForm.get(controlName) as FormControl;
  }

  getTypeInput(item: any): string {
    if (item.field_input_type === 'input') return 'text';
    if (item.field_input_type === 'input-time') return 'time';
    if (item.field_input_type === 'input-date') return 'date';
    if (item.field_input_type === 'input-number') return 'number';
    return 'text';
  }

  openCKEditorByDevice(): void {
    const dynamicTabs = this.newFieldsCKEditor?.map((item: any) => ({
      title: item?.field_lable,
      field: item?.field_custom
    })) || [];

    const staticTabs = [
      { title: 'mo_ta_chi_tiet', field: 'webapp_description' },
      { title: 'mo_ta_ngan', field: 'webapp_sort_description' }
    ];

    const dialogRef = this.dialog.open(DescriptionByDeviceComponent, {
      width: '60vw',
      height: '80vh',
      disableClose: true,
      data: {
        formData: this.addFoodForm,
        tabs: staticTabs.concat(dynamicTabs)// gộp tabs tĩnh và động
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        // xử lý sau khi đóng dialog
      }
    });
  }

  onChangeGoogleShopping() {
    const google_shopping = this.addFoodForm.get('google_shopping')?.value;

    if (this.addFoodForm.get('google_shopping_enable')?.value) {
      if (!google_shopping.image_link) {
        this.addFoodForm.get('google_shopping.image_link')
          ?.setValue(this.listImgProduct[0]?.path);
      }
    }
  }

  handleEditCkeditor(item) {
    const dialogRef = this.matdialog.open(VhCkeditorModalComponent, {
      width: '60vw',
      height: '80vh',
      data: {
        formData: this.addFoodForm,
        item: item,
        type: 'foods' // để phân biệt upload ảnh cho danh mục hay sản phẩm
      }
    });

    dialogRef.afterClosed().subscribe(() => {

    });
  }

  getContentSafeHtml(field: string): any {
    const rawHtml = this.getFormControl(field).value;
    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  }

  path = '/images/database/products';
  openFromLibrary(index: number, type: string | 'reference_links' | 'additional_image_links' | 'image_link' = 'reference_links'): void {
    const dialogRef = this.matdialog.open(ManageLibraryComponent, {
      width: '85%',
      maxWidth: '100%',
      disableClose: true,
      data: {
        startPath: this.path ? this.path : '/images/database/products',
        scopeData: '/images',
      },
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data.href) {
        if (type === 'reference_links') {
          // this.reference_links[`link${index}`] = data.href;
        } else if (type === 'additional_image_links') {
          const pos = index - 1;
          const arr = this.googleShopping.get('additional_image_links');
          if (arr && pos >= 0 && pos < 10) {
            (arr as any).at(pos).setValue(data.href);
          }
        } else if (type === 'image_link') {
          this.googleShopping.get('image_link')?.setValue(data.href);
        }
      }
      this.path = data.path;
    });
  }

  // Getter to access google_shopping FormGroup
  get googleShopping(): FormGroup {
    return this.addFoodForm.get('google_shopping') as FormGroup;
  }

  // Getter to access additional_image_links FormArray
  get additionalImageLinksControls() {
    return (this.googleShopping.get('additional_image_links') as any).controls as FormControl[];
  }

  // CKEDITOR
  private scrollTimer: any;
  public EDITOR = DecoupledEditor;
  private editorListeners: { element: HTMLElement; event: string; handler: any; }[] = [];

  public onReady(editor: any) {
    const main = this.el.nativeElement.querySelector('.main');
    const editable = editor.ui.view.editable.element;
    const ignoredKeys = new Set([
      'Shift', 'Control', 'Alt', 'Meta', 'ArrowUp', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'CapsLock', 'Tab', 'Escape'
    ]);

    /** Debounced scroll trigger */
    const triggerScrollToEditor = () => {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = setTimeout(() => this.scrollToEditor(editor, main), 100);
    };

    /** Only scroll on real typing (ignore modifiers and navigation keys) */
    const handleKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.altKey || event.metaKey || ignoredKeys.has(event.key)) return;
      triggerScrollToEditor();
    };

    editable.addEventListener('keyup', handleKey);
    editable.addEventListener('click', triggerScrollToEditor);

    this.editorListeners.push(
      { element: editable, event: 'keyup', handler: handleKey },
      { element: editable, event: 'click', handler: triggerScrollToEditor }
    );

    const editableEl = editor.ui.getEditableElement();
    editableEl.parentElement.insertBefore(editor.ui.view.toolbar.element, editableEl);

    editor.plugins.get('FileRepository').createUploadAdapter = (
      loader: any
    ) => {
      return this.vhImage.MyUploadImageAdapter(loader, 'images/database/foods');
    };
  }

  scrollToEditor(editor: any, main: any) {
    const editorEl = editor.ui.view.editable.element;
    if (!main && !editor) return;

    const editorRect = editorEl.getBoundingClientRect();
    const containerRect = main.getBoundingClientRect();

    const data = editor.getData();
    let targetRect: DOMRect;

    if (!data) {
      targetRect = editorRect;
    } else {
      const view = editor.editing.view;
      const domConverter = editor.editing.view.domConverter;
      const selection = view.document.selection;
      const range = selection.getFirstRange();

      if (!range) {
        targetRect = editorRect;
      } else {
        const domRange = domConverter.viewRangeToDom(range);
        const rects = domRange.getClientRects();
        if (rects.length > 0) {
          targetRect = rects[0];
        } else {
          // Handle case when caret is in an empty line or paragraph
          const endContainer = domRange.endContainer as HTMLElement;
          const caretEl = endContainer.nodeType === 3
            ? endContainer.parentElement
            : endContainer;

          if (caretEl) {
            const caretRect = caretEl.getBoundingClientRect();
            // Create a small virtual rect around the caret position
            targetRect = new DOMRect(caretRect.left, caretRect.top + caretRect.height / 2, 1, 1);
          } else {
            targetRect = editorRect;
          }
        }
      }
    }

    const targetTop = targetRect.top - containerRect.top + main.scrollTop;
    const targetBottom = targetRect.bottom - containerRect.top + main.scrollTop;
    const editorTop = editorRect.top - containerRect.top + main.scrollTop;
    const editorBottom = editorRect.bottom - containerRect.top + main.scrollTop;

    const containerHeight = containerRect.height;
    const maxScrollTop = main.scrollHeight - containerHeight;

    let scrollTop: number;

    // Show as much editor content as possible while keeping target visible
    const editorHeight = editorBottom - editorTop;

    if (editorHeight <= containerHeight) {
      // Editor fits entirely - center it
      scrollTop = editorTop - (containerHeight - editorHeight) / 2;
    } else {
      // Editor is larger than container - position to show maximum context around target
      const targetPosition = (targetTop + targetBottom) / 2;

      // Try to center target but ensure we show as much editor as possible
      const idealTop = targetPosition - containerHeight / 2;

      // Adjust to not cut off editor content
      if (idealTop < editorTop) {
        scrollTop = editorTop; // Show from top of editor
      } else if (idealTop + containerHeight > editorBottom) {
        scrollTop = editorBottom - containerHeight; // Show up to bottom of editor
      } else {
        scrollTop = idealTop; // Center target
      }
    }

    const caretRelativeTop = targetTop - scrollTop;
    if (caretRelativeTop < 40) scrollTop -= 40;
    scrollTop = Math.max(0, Math.min(scrollTop, maxScrollTop));

    if (Math.abs(scrollTop - main.scrollTop) > 100) {
      main.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }
}
