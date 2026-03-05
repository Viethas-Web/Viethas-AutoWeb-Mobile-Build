
import { Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhImage, VhQueryAutoWeb } from 'vhautowebdb';
import { AddCategoryComponent } from '../../categories/add-category/add-category.component';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { LanguageService } from 'src/app/services/language.service';
import { AddProductComboComponent } from '../add-product-combo/add-product-combo.component';
import { FunctionService } from 'vhobjects-service';
import { DescriptionByDeviceComponent } from '../../components/dialog/description-by-device/description-by-device.component';
import { VhCkeditorModalComponent } from '../../components/vh-ckeditor-modal/vh-ckeditor-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'app-add-combo',
  templateUrl: './add-combo.component.html',
  styleUrls: ['./add-combo.component.scss']
})
export class AddComboComponent implements OnInit {
  @Output() submitAddCombo = new EventEmitter();
  content: any = '';
  public addComboForm: FormGroup;
  public categories: any = [];
  public price: any;
  public barcode: boolean = false;
  public category: any;
  public img: string = '';
  public listImgProduct: Array<any> = [];
  public listBarcode = [];
  public selectedIndexTabset = 0;
  public comboIngredients: Array<any> = []; // Chứa tất cả các thành phần trong combo
  public comboIngredientsTrash: Array<any> = []; // Biến dùng để chứa tất cả các thành phần trong combo trong quá trình chọn sản phẩm vào combo
  public total = 0; // Giá tổng combo
  public products: Array<any> = []; // Danh sách sản phẩm được chọn
  public isASC = false;
  public id_category = 'all';
  public limitProduct: number = 10; // giới hạn sản phẩm trên 1 trang
  public pageCurrentProduct = 1;
  public loading_product = false;
  public totalPages = 1;
  public pageGotoProduct: number = 1; /** Trang người dùng chuyển tới hiển thị = */
  public pageShowChoose: any = [0, 1, 2]; /** Số trang hiển thị = */
  public categoryInProducts: Array<any> = []; // Danh sách danh mục có trong products được lấy về
  categoryInProducts_search = []; //  Danh sách danh mục có trong products được lấy về để search
  submitting = false; // Trạng thái submit form để tránh submit nhiều lần

  setupComboImg: any = {};
  setupCategoryImg: any = {};

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
  newFields = [];
  newFieldsCKEditor = [];
  doneLoad = true;

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
    public vhComponent: VhComponent,
    public functionService: FunctionService,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public vhImage: VhImage,
    public dialog: MatDialog,
    public languageService: LanguageService,
    public dialogRef: MatDialogRef<AddComboComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit(): void {
    this.categories = this.data.categories.filter(c => c._id != 'all');

    this.setupComboImg = this.data.setupComboImg;

    this.getNewFields();
    this.getCategoryInProducts();
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

  getNewFields() {
    this.vhQueryAutoWeb.getNewFields_byFields({ id_main_sector: { $eq: 'combo' } })
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


  ngAfterViewInit(): void {
    // Đoạn này sẽ giúp khởi tạo CKEDITOR không bị ẩn thanh tool lúc khởi tạo
    const webapp_description = document.getElementById('webapp_description');
    if (webapp_description) {
      webapp_description.style.display = 'none';
      setTimeout(() => {
        webapp_description.style.display = 'block';
      }, 500);
    }
  }

  trackByFn(index: number, item: any) {
    return item.id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }

  /** Hàm khởi tạo form
   *
   */
  initForm(): void {
    this.addComboForm = new FormGroup({
      units: new FormControl([]),
      barcode: new FormControl(''),
      allow_sell: new FormControl(true),
      selling: new FormControl(true),
      type: new FormControl(5),
      id_categorys: new FormControl([]),
      webapp_price_sales: new FormControl(
        0,
        Validators.compose([
          Validators.pattern(
            '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)'
          ),
        ])
      ),
      webapp_hidden: new FormControl(false),
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
      this.addComboForm.addControl(field.field_custom, new FormControl(field.field_start_value || [], field.field_required ? [Validators.required] : []));
    });

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminAddHandleChangeMultiLanguage(
        this.addComboForm,
        language.code,
        [...this.newFields.filter((f: any) => f.field_input_type != "select-multiple"), ...this.newFieldsCKEditor],
        fieldNames,
      );
    });

    this.doneLoad = true;
  }

  backPageFn(): void {
    this.submitAddCombo.emit(false);
  }

  /** Hàm thực hiện thêm đữ liệu combo
   *
   * @param value
   */
  onSubmitAddCombo(value): void {
    this.submitting = true;
    this.functionService.showLoading(this.languageService.translate('dang_them'));

    const product = {
      imgs: this.listImgProduct.map((item) => item.path),
      ...value,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (this.addComboForm.valid) {
      product.link = this.functionService.nonAccentVietnamese(product['name_' + this.functionService.defaultLanguage].trim());
      product.link = product.link.replace(/[^a-z0-9-]/g, '');
      this.vhQueryAutoWeb.getCombos_byFields({ link: { $eq: product.link } }).then((response: any): void => {
        if (response.vcode === 0 && response.data.length !== 0) {
          product.link = product.link + '-1';
        }

        // Khởi tạo mảng units
        product['units'] = [
          {
            barcode: value.barcode,
            price: this.total,
            ratio: 1,
            default: true,
          },
        ];

        // Thêm tất cả các trường bắt đầu bằng "unit_"
        Object.keys(product).forEach((key) => {
          if (key.startsWith('unit_')) {
            product['units'][0][key] = product[key];
          }
        });

        // Xử lý các logic khác
        Object.keys(product).forEach((key) => {
          if (key === 'manysize') {
            if (product[key] === true) {
              delete product['allow_sell'];
              delete product['selling'];
            }
          }
          if (key === 'ratio' || key === 'price' || key === 'barcode' || key.startsWith('unit_')) {
            delete product[key];
          }
        });

        this.comboIngredients = this.comboIngredients.map((item) => {
          // Lấy tất cả các trường bắt đầu bằng "unit_" từ `item`
          const unitFields = Object.keys(item)
            .filter((key) => key.startsWith('unit_'))
            .reduce((acc, key) => {
              acc[key] = item[key];
              return acc;
            }, {});

          // Xử lý trường hợp có id_subproduct
          if (item.id_subproduct) {
            return {
              id_product: item._id,
              id_subproduct: item.id_subproduct,
              type: item.type,
              quantity: item.quantity,
              price: item.price,
              ratio: item.ratio,
              ...unitFields, // Gắn các trường bắt đầu bằng "unit_"
            };
          } else {
            // Xử lý trường hợp không có id_subproduct
            return {
              id_product: item._id,
              type: item.type,
              quantity: item.quantity,
              price: item.price,
              ratio: item.ratio,
              ...unitFields, // Gắn các trường bắt đầu bằng "unit_"
            };
          }
        });

        // filter id_categorys rỗng
        product.id_categorys = product.id_categorys.filter((option) => option !== '');

        this.vhQueryAutoWeb.addCombo({ ...product, combos: this.comboIngredients }).then((res: any) => {
          if (res.vcode === 0) {
            this.functionService.createMessage(
              'success',
              this.languageService.translate('them_combo_thanh_cong')
            );
            this.dialogRef.close(res.data);
          }
          if (res.vcode === 11) {
            this.functionService.createMessage(
              'error',
              this.languageService.translate('phien_dang_nhap_da_het_han')
            );
          }
        }, (err) => {
          this.functionService.createMessage(
            'error',
            this.languageService.translate('co_loi_xay_ra_vui_long_thu_lai')
          );
        }).finally(() => {
          this.functionService.hideLoading();
          setTimeout(() => {
            this.submitting = false;
          }, 100);
        });
      },
        (error) => {
          this.functionService.createMessage(
            'error',
            this.languageService.translate('co_loi_xay_ra_vui_long_thu_lai')
          );
          this.functionService.hideLoading();
          this.submitting = false;
        }
      );
    } else {
      this.functionService.createMessage('error', this.languageService.translate('vui_long_dien_du_thong_tin'));
      this.functionService.hideLoading();
      this.submitting = false;
    }
  }

  /** Hàm thực hiện mở popup danh sách combo
   *
   */
  openFormAddComboIngredients(): void {
    const dialogRef = this.dialog.open(AddProductComboComponent, {
      width: '70vw',
      height: '85vh',
      disableClose: true,
      data: {
        categoryInProducts: this.categoryInProducts,
        comboIngredients: this.comboIngredients,
      }

    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      if (result?.length) {
        this.comboIngredients = [...result];
        this.total = this.comboIngredients.reduce(
          (prev: number, next) => prev + next.quantity * next.price,
          0
        );
      }
    });
  }

  getCategoryInProducts() {
    this.vhQueryAutoWeb
      .getCategorys_byFields({ id_main_sectors: { $all: ['food_drink', 'ecommerce'] } }, {}, {}, 0)
      .then((category: any) => {
        this.vhQueryAutoWeb.getCategorySteps_byIdCategoryArray(category.data.map(e => { return e._id; }))
          .then((response: any) => {
            if (response.vcode === 0) {
              this.categoryInProducts = category.data.map((e) => {
                return {
                  ...e,
                  array_step: Array(e.step)
                    .fill(0)
                    .map((_, i) => i),
                };
              });
              this.categoryInProducts_search = category.data;
            }
          }, (error: any) => {
            console.log('error', error);
          });

      });
  }

  sortProducts() {

  }


  /** Chuyển trang -----------------
   *
   * @param value
   */
  transferFn(value: number): void {
    this.pageCurrentProduct = Number(value);
    this.pageGotoProduct = Number(value);
    // this.softProducts();
    // Thay đổi giá trị trang cho người dùng chọn
    if (
      this.pageCurrentProduct < this.totalPages &&
      this.pageCurrentProduct > 1
    ) {
      if (
        this.pageShowChoose[this.pageShowChoose.length - 1] ==
        this.pageCurrentProduct
      )
        this.pageShowChoose = this.pageShowChoose.map((num) => num + 1);
      else if (this.pageShowChoose[0] == this.pageCurrentProduct)
        this.pageShowChoose = this.pageShowChoose.map((num) => num - 1);
    }
  }

  /** Chuyển trang đến trang trước
   *
   */
  gotoPreviousPage() {
    if (this.pageCurrentProduct > 1) {
      this.transferFn(this.pageCurrentProduct - 1);
    } else if (this.pageCurrentProduct == 1) {
      this.transferFn(this.totalPages);
    }
  }

  /** Chuyển trang đến trang sau
   *
   */
  gotoNextPage() {
    if (this.pageCurrentProduct < this.totalPages) {
      this.transferFn(this.pageCurrentProduct + 1);
    } else if ((this.pageCurrentProduct = this.totalPages)) {
      this.transferFn(1);
    }
  }



  /** Thực hiện giảm số lượng item trong combo
   *
   * @param item
   */
  subQuantity(item) {
    item.quantity = item.quantity - 1;
    if (item.quantity < 0) item.quantity = 0;
    this.total = this.comboIngredients.reduce(
      (prev: number, next) => prev + next.quantity * next.price,
      0
    );
  }

  /** Thực hiện tăng số lượng item trong combo
   *
   * @param item
   */
  addQuantity(item) {
    item.quantity = item.quantity + 1;
    this.total = this.comboIngredients.reduce(
      (prev: number, next) => prev + next.quantity * next.price,
      0
    );
  }

  /** Hàm thực hiển chọn đơn vị
   *
   * @param item sản phẩm
   * @param event đơn vị chọn
   * @returns đơn vị chọn và gán vào unitDefault
   */
  selecUnit(item, event) {
    return (item.unitDefault = item.units.find((item) => item == event));
  }

  /** Hàm thực hiện sửa số lượng trong combo
   *
   * @param product
   */
  editQuantity(product) {
    this.vhComponent
      .alertInputMoney(
        'Sửa số lượng',
        '',
        'OK',
        'Cancel',
        [
          {
            name: 'quantity',
            type: 'text',
            placeholder: 'Số lượng',
            value: product.quantity,
            cssClass: 'selling-quantity',
            id: 'selling-quantity',
            attributes: {
              inputmode: 'numeric',
              maxLength: 10,
            },
          },
        ],
        false,
        () => { }
      )
      .then(
        (result: any) => {
          if (result) {
            if (result.value) {
              if (parseFloat(result.value.quantity) <= 0) {
                this.vhComponent.showToast(
                  3000,
                  this.languageService.translate('so_luong_phai_lon_hon_0'),
                  'alert-toast'
                );
              } else {
                product.quantity = parseFloat(result.value.quantity);
                this.total = this.comboIngredients.reduce(
                  (prev: number, next) => prev + next.quantity * next.price,
                  0
                );
              }
            }
          }
        },
        () => { }
      );
  }

  // Điều chỉnh giá bán của sản phẩm đã chọn
  editPrice(item) {
    this.vhComponent
      .alertInputMoney(
        'Sửa giá tiền',
        '',
        'OK',
        'Cancel',
        [
          {
            name: 'price',
            type: 'tel',
            placeholder: 'Giá tiền',
            value: item.price,
            cssClass: 'size-price',
            id: 'size-price',
            attributes: {
              maxLength: 15,
              onBlur: () => {
                let regExpPrice: RegExp =
                  /(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)/;
                let price = document.getElementById('size-price')['value'];
                if (!regExpPrice.test(price)) {
                  document.getElementById('size-price')['value'] = 0;
                  this.cleaveJS('size-price');
                }
              },
            },
          },
        ],
        false,
        () => {
          this.cleaveJS('size-price');
        }
      )
      .then(
        (result) => {
          let price = document.getElementById('size-price')['value'];
          if (price) {
            item.price = parseFloat(this.price.getRawValue());
            this.total = this.comboIngredients.reduce(
              (prev: number, next) => prev + next.quantity * next.price,
              0
            );
          }
        },
        () => { }
      );
  }

  cleaveJS(className) {
    this.price = this.vhAlgorithm.vhnumeral(`.${className}`);
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
      this.addComboForm.controls['barcode'].setValue(newbarcode);
    }
  }

  /** Hàm thực hiện check barcode tự động có hợp lệ không
   *
   * @param barcode
   * @returns true: barcode hợp lệ, false: barcode không hợp lệ
   */
  async checkBarcode(barcode: string): Promise<boolean> {
    try {
      const product = await this.vhQueryAutoWeb.getCombos_byFields({
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
      if (result && result.id_main_sectors.includes('combo')) {
        this.data.categories.push(result);
        this.categories = [...this.categories, result];
      }
    });
  }

  /** Hàm thực hiện xóa thành phần bất kì trong combo
   *
   * @param product
   */
  daleteComboIngredients(product: any) {
    this.comboIngredients = this.comboIngredientsTrash =
      this.comboIngredients.filter((filter) => filter._id !== product._id);

    this.total = this.comboIngredients.reduce(
      (prev: number, next) => prev + next.quantity * next.price,
      0
    );
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
  products_search = [];
  searchLocalProduct(value) {
    this.products = this.vhAlgorithm.searchList(this.vhAlgorithm.changeAlias(value), this.products_search, ['name']);
  }
  loadingProduct = false;
  getData() {

    this.loadingProduct = true;
    let promiseProduct = this.id_category == 'all'
      ? this.vhQueryAutoWeb.getProducts_byFields(
        {},
        {},
        {},
        0,
        0
      )
      : this.vhQueryAutoWeb.getProducts_byFields(
        { id_categorys: { $all: [this.id_category] } },
        {},
        {},
        0,
        0
      );
    let promiseFood = this.id_category == 'all'
      ? this.vhQueryAutoWeb.getFoods_byFields(
        {},
        {},
        {},
        0,
        0
      )
      : this.vhQueryAutoWeb.getFoods_byFields(
        { id_categorys: { $all: [this.id_category] } },
        {},
        {},
        0,
        0
      );

    Promise.all([promiseProduct, promiseFood]).then(([product, food]: any) => {
      let products = product.data.concat(food.data);
      for (let i in products) {
        products[i]['show_expand'] = false;

        if (products[i].units) {
          products[i].unitDefault = products[i].units.find(
            (item) => item.default == true
          );
        }
        if (products[i].subs) {
          if (products[i].subs.length) {
            products[i].subs.forEach((element) => {
              if (element.units) {
                element['unitDefault'] = element.units.find((e) => e.default);
              }
            });
          }
        }
      }
      this.products = products;
      this.products_search = products;
      this.loadingProduct = false;
    });
  }

  forcusInput() {
    setTimeout(() => {
      document.getElementById('inputSearch').focus();
    }, 500);

  }

  close() {
    this.dialogRef.close(false);
  }

  selectChange(event, field) {
    this.addComboForm.controls[field].setValue(event);
  }

  getFormControl(controlName: string): FormControl {
    return this.addComboForm.get(controlName) as FormControl;
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
        formData: this.addComboForm,
        tabs: staticTabs.concat(dynamicTabs) // gộp tabs tĩnh và động
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        // xử lý sau khi đóng dialog
      }
    });
  }

  handleEditCkeditor(item) {
    const dialogRef = this.dialog.open(VhCkeditorModalComponent, {
      width: '60vw',
      height: '80vh',
      data: {
        formData: this.addComboForm,
        item: item,
        type: 'combos' // để phân biệt upload ảnh cho danh mục hay sản phẩm
      }
    });

    dialogRef.afterClosed().subscribe(() => {

    });
  }

  getContentSafeHtml(field: string): any {
    const rawHtml = this.getFormControl(field).value;
    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
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

    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) =>
      this.vhImage.MyUploadImageAdapter(loader, `images/database/combos`);
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

  ngOnDestroy() {
    for (const { element, event, handler } of this.editorListeners) {
      element.removeEventListener(event, handler);
    }
    this.editorListeners = [];
  }
}
