import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb, VhImage } from 'vhautowebdb';
import { AddCategoryComponent } from '../../categories/add-category/add-category.component';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { AddGroupPropertyFoodComponent } from '../add-group-property-food/add-group-property-food.component';
import { EditGroupPropertyFoodComponent } from '../edit-group-property-food/edit-group-property-food.component';
import { AddSubFoodComponent } from '../add-sub-food/add-sub-food.component';
import { EditSubFoodComponent } from '../edit-sub-food/edit-sub-food.component';
import { ChooseToppingComponent } from '../choose-topping/choose-topping.component';
import { FunctionService, ManageLibraryComponent } from 'vhobjects-service';
import { LanguageService } from 'src/app/services/language.service';
import { DescriptionByDeviceComponent } from '../../components/dialog/description-by-device/description-by-device.component';
import { DomSanitizer } from '@angular/platform-browser';
import { VhCkeditorModalComponent } from '../../components/vh-ckeditor-modal/vh-ckeditor-modal.component';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
@Component({
  selector: 'app-edit-food',
  templateUrl: './edit-food.component.html',
  styleUrls: ['./edit-food.component.scss'],
})
export class EditFoodComponent implements OnInit {
  // @Input() data: any;


  public editFoodForm: FormGroup;
  public price: any = 0;
  public price2: any = 0;
  public webapp_price_sales: any;
  public listImgProduct: any = [];
  public categories: Array<any> = [];
  public listBarcode: Array<any> = [];
  public units: Array<any> = []; // Mảng danh sách các đơn vị
  public path: any = ''; // Dùng để chứa đường dẫn ảnh trả về từ thư viện
  public visibleFormEditLotProduct = false;
  public postionEditLotProduct: number;

  public selectedIndexTabset = 0;
  public properties: Array<any> = []; // Danh sách thuộc tính
  public subFoods: Array<any> = []; // Danh sách size món ăn
  newFields = [];
  newFieldsCKEditor = [];
  setupFoodImg;
  setupComboImg: any = {};
  toppingsChoosed: Array<any> = [];
  categoryToppings: Array<any> = [];
  languageChangedSubscription;
  originalLink: string = ''; // Lưu giá trị ban đầu của link
  originalBarcode: string = ''; // Lưu giá trị ban đầu của barcode
  submitting = false; // Trạng thái submit form để tránh submit nhiều lần
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
  setup_fields_google_shopping: any;

  constructor(
    private el: ElementRef,
    public vhAlgorithm: VhAlgorithm,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    public vhComponent: VhComponent,
    public vhImage: VhImage,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditFoodComponent>,
    public matdialog: MatDialog,
    public languageService: LanguageService,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
  ) { }


  trackByFn(item: any) {
    return item.id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }

  ngOnInit(): void {
    this.categories = this.data.categories.filter(c => c._id != 'all');

    this.setupFoodImg = this.data.setupFoodImg;
    if (this.data.dataEditFood) {
      this.getNewFileds();
      this.getSetup();
    }

    // Lắng click ra ngoài (backdrop)
    // đoạn này để đóng mà modal và trả về result, nếu ko sẽ ko cập nhật giao diện
    this.dialogRef.backdropClick().subscribe(() => {
      this.close();
    });
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
        this.initForm(this.data.dataEditFood);


      });
  }
  doneLoad = false;
  /** Hàm khởi tạo form
   *
   * @param value: object
   */
  initForm(food: any): void {
    const { languageTempCode, defaultLanguage } = this.functionService;
    this.editFoodForm = new FormGroup({
      _id: new FormControl(food._id),
      id_categorys: new FormControl(food.id_categorys && food.id_categorys.length > 0 ? food.id_categorys : []),
      link: new FormControl(food.link, [Validators.required, Validators.pattern('^(?!.*[\\/\\\\])[a-z0-9-]+$')]),
      manysize: new FormControl(food.manysize),
      selling: new FormControl(food.selling),
      units: new FormControl(food.units),
      webapp_hidden: new FormControl(food.webapp_hidden),
      google_shopping_enable: new FormControl(food?.google_shopping_enable ?? false),
      google_shopping: new FormGroup({
        id: new FormControl(food?.google_shopping?.id ?? ''),
        title: new FormControl(food?.google_shopping?.title ?? ''),
        description: new FormControl(food?.google_shopping?.description ?? ''),
        link: new FormControl(food?.google_shopping?.link ?? ''),
        image_link: new FormControl(food?.google_shopping?.image_link ?? ''),
        additional_image_links: (food.google_shopping?.additional_image_links && Array.isArray(food.google_shopping?.additional_image_links)) ? this.formBuilder.array(
          food.google_shopping.additional_image_links.map(link => new FormControl(link))
        ) : this.formBuilder.array(Array.from({ length: 10 }).map(() => new FormControl(''))),
        price: new FormControl(food?.google_shopping?.price ?? ''),
        availability: new FormControl(food?.google_shopping?.availability ?? ''),
        brand: new FormControl(food?.google_shopping?.brand ?? ''),
        condition: new FormControl(food?.google_shopping?.condition ?? ''),
        type_product: new FormControl(food?.google_shopping?.type_product ?? ''),
        google_product_category: new FormControl(food?.google_shopping?.google_product_category ?? ''),
      }),
      url_canonical: new FormControl(food.url_canonical || ''),
    });

    let fieldNames: any = [
      { field: 'name', validators: { required: true, pattern: '' } },
      { field: 'webapp_sort_description', validators: { required: false, pattern: '' } },
      { field: 'webapp_description', validators: { required: false, pattern: '' } },
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
      this.editFoodForm.addControl(field.field_custom, new FormControl(food[field.field_custom] || [], field.field_required ? [Validators.required] : []));
    });

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminEditHandleChangeMultiLanguage(
        this.editFoodForm,
        language.code,
        [...this.newFields.filter((f: any) => f.field_input_type != "select-multiple"), ...this.newFieldsCKEditor],
        fieldNames,
        food,
        this.getUnitsByRatio.bind(this),
      );
    });

    this.originalLink = food.link;
    if (food.units) this.originalBarcode = food.units[0].barcode;

    if (food.units) {
      const unit = this.getUnitsByRatio(food.units, 1);
      const patternValidator = Validators.pattern(
        '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)'
      );

      // Các field cố định
      const fixedFields = [
        { name: 'price', value: unit?.price ?? 0 },
        { name: 'price2', value: unit?.price2 ?? 0 },
        { name: 'webapp_price_sales', value: unit?.webapp_price_sales ?? 0 },
        { name: 'barcode', value: unit?.barcode ?? '', validators: [] },
      ];

      // Thêm các field cố định
      fixedFields.forEach(({ name, value, validators = [Validators.required, patternValidator] }) => {
        this.editFoodForm.addControl(
          name,
          new FormControl(value, Validators.compose(validators))
        );
      });

      // Tự động thêm các field bắt đầu bằng `unit_`
      Object.keys(unit)
        .filter((key) => key.startsWith('unit_'))
        .forEach((key) => {
          if (!this.editFoodForm.contains(key)) {
            this.editFoodForm.addControl(key, new FormControl(unit[key] ?? '', Validators.required));
          }
        });
      if (!this.editFoodForm.contains(`unit_${languageTempCode}`)) {
        this.editFoodForm.addControl(`unit_${languageTempCode}`,
          new FormControl('', Validators.required)
        );
      }
    }

    if (food.properties) {
      this.properties = food.properties;
    }
    if (food.toppings) {
      if (Array.isArray(food.toppings)) {
        Promise.all(
          food.toppings.map(async (topping: any) => {
            const item: any = await this.vhQueryAutoWeb.getTopping(topping.id_topping);
            // Lấy tất cả trường bắt đầu bằng 'name_'
            Object.assign(topping, Object.fromEntries(Object.entries(item).filter(([key]) => key.startsWith('name_'))));
            topping.imgs = item.imgs;
            topping.barcode = item.units.find((unit) => unit.default).barcode;
            topping.price = item.units.find((unit) => unit.default).price;
            topping._id = item._id;
            return topping;
          })
        );
      }
      this.toppingsChoosed = food.toppings;
    }

    if (food.subs) {
      this.subFoods = food.subs;
    }

    if (food.imgs?.length) {
      this.listImgProduct = food.imgs.map((map) => ({
        path: map,
        visible: false,
      }));
    }
    this.doneLoad = true;

    this.clearJs();
  }

  clearJs() {
    if (!this.data.dataEditFood.subs) {
      this.vhAlgorithm.waitingStack().then(() => {
        this.price = this.vhAlgorithm.vhnumeral('.price');
        this.price2 = this.vhAlgorithm.vhnumeral('.price2');
        this.webapp_price_sales = this.vhAlgorithm.vhnumeral('.webapp_price_sales');
      });
    }
  }

  getUnitsByRatio(units: Array<any>, ratio: number) {
    return units.find((unit) => unit.ratio == ratio);
  }

  /** Hàm thực hiện cập nhật dữ liệu thay đổi của sản phẩm
   *
   * @param field trường cập nhật
   * @param objectUpdate dữ liệu cập nhật. Vd: {field: 'aaa'}
   */
  updateProduct(field: string, objectUpdate) {
    if (!objectUpdate[field] && this.editFoodForm.get(field)?.errors?.required) return;

    objectUpdate.updated_at = new Date().toISOString();
    if (!objectUpdate.created_at) objectUpdate.created_at = new Date().toISOString();

    if (field == 'link' && objectUpdate.link.trim() == this.originalLink) return;
    if (['barcode', 'price', 'webapp_price_sales'].includes(field) || field.startsWith('unit_')) {
      const { barcode } = this.editFoodForm.value;
      const unitsNew = this.editFoodForm.value.units;
      const index = unitsNew.findIndex(({ ratio }) => ratio === 1);
      // Khởi tạo đối tượng data
      let data: any = {
        barcode,
        ratio: 1,
        price: parseFloat(this.price.getRawValue()),
        webapp_price_sales: parseFloat(this.webapp_price_sales.getRawValue()),
        default: unitsNew[index]?.default || false,
      };

      // Thêm tất cả các trường bắt đầu bằng "unit_" vào data
      Object.keys(this.editFoodForm.value)
        .filter((key) => key.startsWith('unit_'))
        .forEach((key) => {
          data[key] = this.editFoodForm.value[key];
        });

      unitsNew.splice(index, 1, data);
      objectUpdate = { units: unitsNew };
      if (field == 'barcode' && objectUpdate.units[0].barcode == this.originalBarcode) return;
    }

    if (field == 'imgs') {
      objectUpdate = {
        imgs: this.listImgProduct.map((item) => item.path),
      };
    }

    if (field == 'link') {
      // check link only have a-z and không dấu, 0-9, - if not return error
      if (!/^[a-zA-Z0-9-]*$/.test(objectUpdate.link.trim())) {
        this.functionService.createMessage('error', 'duong_dan_chi_duoc_phep_chua_a_z_0_9_va_dau_gach_ngang');
        return;
      }

      this.vhQueryAutoWeb.getFoods_byFields({ link: { $eq: objectUpdate.link.trim() } })
        .then((res: any) => {
          if (res.vcode === 0) {
            if (res.data.length > 0) {
              this.functionService.createMessage('error', 'duong_dan_da_ton_tai');
              return;
            }

            this.handleUpdateFood(field, objectUpdate);

          }
        });
    } else if (field == 'barcode') {

      this.checkBarcode(objectUpdate.units[0].barcode).then((result) => {
        if (result) {
          this.handleUpdateFood(field, objectUpdate);
        } else {
          this.functionService.createMessage('error', 'barcode_da_ton_tai_vui_long_nhap_lai');
        }
      });
    } else this.handleUpdateFood(field, objectUpdate);



  }

  handleUpdateFood(field, objectUpdate) {
    this.submitting = true;
    this.vhQueryAutoWeb
      .updateFood(this.data.dataEditFood._id, objectUpdate)
      .then(
        (res: any) => {
          if (res.vcode === 11) {
            this.functionService.createMessage(
              'error',
              'phien_dang_nhap_da_het_han_vui_long_dang_nhap_lai'
            );
          }
          if (field == 'link') {
            this.originalLink = objectUpdate.link;
          }
          if (field == 'barcode') {
            this.originalBarcode = objectUpdate.units[0].barcode;
          }
        },
        (err) => {
          console.log('updateCategory error', err);
          this.functionService.createMessage(
            'error',
            'da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu_vui_long_thu_lai'
          );
        }
      ).finally(() => this.submitting = false);
  }

  updateNewField(field, value) {

    this.vhQueryAutoWeb.updateFood(this.data.dataEditFood._id, { [field]: value }).then(
      (res: any) => {
        if (res.vcode === 11) {
          this.functionService.createMessage(
            'error',
            'Phiên đăng nhập đã hết hạn vui lòng đăng nhập lại'
          );
        }
      },
      (err) => {
        this.functionService.createMessage(
          'error',
          'Đã xãy ra lỗi trong quá trình cập nhật dữ liệu ! Vui lòng thử lại.'
        );
      }
    );
  }

  public isVisibleAddProperty = false; // Ẩn-Hiện modal thêm thuộc tính
  public isVisibleEditProperty = false;

  /** Hàm thực mở form thêm thuộc tính cho món ăn
   *
   */
  openFormAddProperties() {
    const dialogRef = this.matdialog.open(AddGroupPropertyFoodComponent, {
      width: '40vw',
      height: '50vh',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.properties = [...this.properties, result];
        this.updateProduct('properties', { properties: this.properties });
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
        this.updateProduct('properties', { properties: this.properties });
      }
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


  /** Hàm nhận sự kiện trả về danh sách ảnh từ app-list-image
   *
   * @param event
   */
  sendImgs(event) {
    if (event) {
      this.listImgProduct = event.imgs;
      this.updateProduct('imgs', { img: this.listImgProduct });
    }
  }

  openFormAddSubFood(): void {
    const dialogRef = this.matdialog.open(AddSubFoodComponent, {
      width: '40vw',
      height: '61vh',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {


        const subFood = {
          ...Object.keys(result)
            .filter((key) => key.startsWith('name_'))
            .reduce((obj, key) => ({ ...obj, [key]: result[key] }), {}),
          allow_sell: result.allow_sell,
          selling: result.selling,
          units: [
            {
              ...Object.keys(result)
                .filter((key) => key.startsWith('unit_'))
                .reduce((obj, key) => ({ ...obj, [key]: result[key] }), {}),
              ratio: 1,
              default: true,
              price: result.price,
              price2: result.price2,
              barcode: result.barcode,
            },
          ]
        };

        this.vhQueryAutoWeb.addSubFood(this.data.dataEditFood._id, subFood)
          .then((res: any) => {
            if (res.vcode != 0) return this.functionService.createMessage('error', res.msg);
            this.subFoods = [...this.subFoods, res.data];
          });
      }
    });
  }

  /** Hàm thực hiện điều chỉnh cỡ với vị trí trong mảng
  *
  * @param item
  * @param index
  */
  openFormEditSubFood(item, index: number): void {
    const itemEdit = {
      ...item,
      ...item.units[0]
    };

    const dialogRef = this.matdialog.open(EditSubFoodComponent, {
      width: '40vw',
      height: '61vh',
      data: {
        item: itemEdit,
        type: 'edit' // type: 'edit' hoặc 'add', khi edit thì sẽ cập nhật dữ liệu liền k cần ấn lưu
      },
      // không cho click ra ngoài để đóng dialog
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.subFoods = this.subFoods.map((item, idx) => {
          if (idx === index) {
            return result;
          }
          return item;
        });
      }
    });
  }

  openChooseTopping() {
    const dialogRef = this.matdialog.open(ChooseToppingComponent, {
      width: '50vw',
      height: '72vh',
      data: {
        food: this.data.dataEditFood,
        toppingsChoosed: this.toppingsChoosed,
        categoryToppings: this.categoryToppings,
        type: 'edit'
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toppingsChoosed = [...this.toppingsChoosed, ...result];
      }
    });
  }



  /** Hàm thực hiện xóa cỡ theo vị trí trong mảng subFoods
   *
   * @param index vị trí cỡ trong mảng subFoods
   */
  deleteSubFood(indexInput: number, id_sub_food): void {
    this.vhQueryAutoWeb.deleteSubFood(id_sub_food)
      .then((res: any) => {
        console.log('res', res);
        if (res.vcode != 0) return this.functionService.createMessage('error', res.msg);
        this.subFoods = this.subFoods.filter((_, index) => index !== indexInput);
      });
  }

  deletePropertyByIndex(indexInput: number) {
    this.properties = this.properties.filter(
      (_, index) => index !== indexInput
    );
    this.updateProduct('properties', { properties: this.properties });

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
        this.editFoodForm.controls['barcode'].setValue(newbarcode);
        this.updateProduct('barcode', { barcode: newbarcode });
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

  deleteTopping(id) {
    this.toppingsChoosed = this.toppingsChoosed.filter((item) => item._id !== id);
    this.updateProduct('toppings', { toppings: this.toppingsChoosed.map((item: any) => ({ id_topping: item._id, quantity: 1 })) });
  }

  close(): void {
    this.dialogRef.close({
      ...this.data.dataEditFood,
      ...this.editFoodForm.value,
    });
  }


  selectChange(event, field) {
    this.editFoodForm.controls[field].setValue(event);
    this.updateProduct(field, { [field]: event });
  }

  updateFieldCKEditor(field, value) {
    this.updateProduct(field, { [field]: value });
  }

  updateDynamicField(fieldKey: string, value: any) {
    const dynamicKey = fieldKey + '_' + this.functionService.languageTempCode;
    const updatedValue = { [dynamicKey]: value };
    this.updateProduct(dynamicKey, updatedValue);
  }

  getFormControl(controlName: string): FormControl {
    return this.editFoodForm.get(controlName) as FormControl;
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
        formData: this.editFoodForm,
        tabs: staticTabs.concat(dynamicTabs), // gộp tabs tĩnh và động
        callUpdate: this.updateProduct.bind(this)
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        // xử lý sau khi đóng dialog
      }
    });
  }

  handleEditCkeditor(item) {
    const dialogRef = this.matdialog.open(VhCkeditorModalComponent, {
      width: '60vw',
      height: '80vh',
      data: {
        formData: this.editFoodForm,
        item: item,
        type: 'foods' // để phân biệt upload ảnh cho danh mục hay sản phẩm
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.updateDynamicField(item.field_custom, this.editFoodForm.get(item.field_custom + '_' + this.functionService.languageTempCode).value);
    });
  }

  getContentSafeHtml(field: string): any {
    const rawHtml = this.getFormControl(field).value;
    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  }

  pathFile = '/images/database/products';
  openFromLibrary(index: number, type: string | 'reference_links' | 'additional_image_links' | 'image_link' = 'reference_links'): void {
    const dialogRef = this.matdialog.open(ManageLibraryComponent, {
      width: '85%',
      maxWidth: '100%',
      disableClose: true,
      data: {
        startPath: this.pathFile ? this.pathFile : '/images/database/foods',
        scopeData: '/images',
      },
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data.href) {
        if (type === 'reference_links') {
          // this.reference_links[`link${index}`] = data.href;
          // this.updateReferenceLinks();
        } else if (type === 'additional_image_links') {
          const pos = index - 1;
          const arr = this.googleShopping.get('additional_image_links');
          if (arr && pos >= 0 && pos < 10) {
            (arr as any).at(pos).setValue(data.href);
          }
          this.updateProduct('google_shopping', { google_shopping: this.editFoodForm.value.google_shopping });
        } else if (type === 'image_link') {
          this.googleShopping.get('image_link')?.setValue(data.href);
          this.updateProduct('google_shopping', { google_shopping: this.editFoodForm.value.google_shopping });
        }
      }
      this.pathFile = data.path;
    });
  }

  // Getter to access google_shopping FormGroup
  get googleShopping(): FormGroup {
    return this.editFoodForm.get('google_shopping') as FormGroup;
  }

  // Getter to access additional_image_links FormArray
  get additionalImageLinksControls() {
    return (this.googleShopping.get('additional_image_links') as any).controls as FormControl[];
  }

  // Tạo dữ liệu Google Shopping từ setup_fields_google_shopping
  generateGoogleShoppingData() {
    const enabled = this.editFoodForm.value.google_shopping_enable;

    // Nếu chưa bật thì không cho tạo, tuỳ bạn muốn warning hay im lặng
    if (!enabled) {
      // Ví dụ dùng notification:
      // this.notification.warning('Thông báo', 'Bạn cần bật Google Shopping trước.');
      return;
    }

    if (!this.setup_fields_google_shopping) {
      return;
    }

    const formData = this.editFoodForm.value;
    const googleShoppingData: any = {};

    this.setup_fields_google_shopping.forEach((setup) => {
      const key = setup.key;
      const field = setup.field;
      const type = setup.type;
      const defaultValue = setup.value ?? '';

      let value = defaultValue;

      if (type === 'value') {
        // dùng luôn defaultValue
        value = defaultValue;
      } else {
        if (field === 'imgs[0]') {
          value = this.listImgProduct[0]?.path ?? defaultValue;
        } else if (field) {
          value = this.getValueByPath(formData, field, defaultValue);
        }
      }

      googleShoppingData[key] = value;
    });

    // Cập nhật vào form
    this.editFoodForm.patchValue({
      google_shopping: googleShoppingData
    });

    // Cập nhật lên server
    this.updateProduct('google_shopping', {
      google_shopping: googleShoppingData
    });
    this.functionService.createMessage('success', this.languageService.translate('cap_nhat_du_lieu_thanh_cong'));
  }

  getSetup() {
    this.vhQueryAutoWeb.getSetups_byFields({ type: 'fields_google_shopping', mainSector: 'food_drink' }).then((res: any) => {
      if (res.length > 0) {
        this.setup_fields_google_shopping = res[0]?.data;
      }
    });
  }

  // Hàm truy cập giá trị từ object theo đường dẫn
  private getValueByPath(obj: any, path: string, defaultValue: any = ''): any {
    try {
      return path.split('.').reduce((current, key) => {
        const match = key.match(/\[(\d+)\]/);
        if (match) {
          const index = parseInt(match[1]);
          key = key.replace(match[0], '');
          return current && current[key] ? current[key][index] : defaultValue;
        }
        return current ? current[key] : defaultValue;
      }, obj);
    } catch (error) {
      console.error(`Lỗi khi truy cập đường dẫn ${path}:`, error);
      return defaultValue;
    }
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
