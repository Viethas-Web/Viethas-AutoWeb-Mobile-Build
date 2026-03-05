import { Component, ElementRef, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  FormBuilder,
} from '@angular/forms';
import { VhAlgorithm, VhEventMediator, VhImage, VhQueryAutoWeb } from 'vhautowebdb';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddCategoryComponent } from '../../categories/add-category/add-category.component';
import { LanguageService } from 'src/app/services/language.service';
import { UnitsComponent } from '../units/units.component';
import { AddSubproductComponent } from '../add-subproduct/add-subproduct.component';
import { EditSubproductComponent } from '../edit-subproduct/edit-subproduct.component';
import { AddProductLotsComponent } from '../add-product-lots/add-product-lots.component';
import { EditProductLotsComponent } from '../edit-product-lots/edit-product-lots.component';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { FunctionService } from 'vhobjects-service';
import { DescriptionByDeviceComponent } from '../../components/dialog/description-by-device/description-by-device.component';
import { ManageLibraryComponent } from 'vhobjects-service';
import { VhCkeditorModalComponent } from '../../components/vh-ckeditor-modal/vh-ckeditor-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
})
export class AddProductComponent implements OnInit {
  @Output() submitAddProduct = new EventEmitter();
  content: any = '';
  public addProductForm: FormGroup;
  public formSubProduct: FormGroup;
  public formLotProduct: FormGroup;
  public subProducts: Array<any> = [];
  public categories: any = [];
  public price: any;
  public price_2: any;
  public price_sales: any;
  public price_import: any;
  public days_import_warning: any;
  public days_exp_warning: any;
  public warning_number: any;
  public barcode: boolean = false;
  public category: any;
  public listImgProduct: Array<any> = []; // Danh sách hình ảnh được tải lên
  public listImgNewFields = {};
  public listBarcode = [];
  public visibleFormSubProduct = false;
  public selectedListCategory = [];
  public selectedIndexTabset = 0;
  public visible: boolean = false;
  newFields = [];
  newFieldsCKEditor = [];
  doneLoad = false;
  submitting = false; // Trạng thái submit form để tránh submit nhiều lần
  setupProductImg: any = {};
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
  resolution;
  deviceWidthMax: number = 0;
  widthCustom: number = 100;
  heightCustom: number = 100;
  id_subproject: string = '';
  isShowConfirmPopup: boolean = false;
  isOpenGuideVideo: boolean = false;

  reference_links = {
    link1: '',
    link2: '',
    link3: '',
    link4: '',
    link5: '',
  };

  ckeditorFields = [
    {
      field_custom: 'webapp_description',
      field_lable: 'mo_ta_chi_tiet'
    },
    {
      field_custom: 'webapp_sort_description',
      field_lable: 'mo_ta_ngan'
    },
    {
      field_custom: 'technical_spec',
      field_lable: 'dac_ta_ky_thuat'
    },
    {
      field_custom: 'promotion',
      field_lable: 'thong_tin_khuyen_mai'
    },
    {
      field_custom: 'after_sales',
      field_lable: 'thong_tin_hau_mai'
    },
    {
      field_custom: 'other',
      field_lable: 'thong_tin_khac'
    }
  ];

  constructor(
    public dialogRef: MatDialogRef<AddProductComponent>,
    private el: ElementRef,
    public vhAlgorithm: VhAlgorithm,
    public functionService: FunctionService,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    private formBuilder: FormBuilder,
    public vhImage: VhImage,
    public matdialog: MatDialog,
    private vhComponent: VhComponent,
    public languageService: LanguageService,
    private vhEventMediator: VhEventMediator,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit(): void {
    this.categories = this.data.categories.filter(c => c._id != 'all');

    this.setupProductImg = this.data.setupProductImg;

    this.resolution = this.vhQueryAutoWeb.getlocalSubProject(this.vhQueryAutoWeb.getlocalSubProject_Working()._id).resolution;

    this.id_subproject = this.vhQueryAutoWeb.getlocalSubProject_Working()._id;
    this.devices.forEach(device => {
      if (this.deviceWidthMax < this.resolution[device.value + '_width']) {
        this.deviceWidthMax = this.resolution[device.value + '_width'];
      }
    });

    this.getNewFileds();
  }



  languageChangedSubscription;
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

  getNewFileds() {
    this.vhQueryAutoWeb.getNewFields_byFields({ id_main_sector: { $eq: 'ecommerce' } })
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
        this.newFields.forEach((item) => {
          if (item.field_input_type == 'image') {
            this.listImgNewFields[item.field_custom] ??= item.field_start_value;
          }
        });
        this.initForm();
      });
  }

  ngOnDestroy() {
    for (const { element, event, handler } of this.editorListeners) {
      element.removeEventListener(event, handler);
    }
    this.editorListeners = [];

    this.languageChangedSubscription?.unsubscribe();
  }
  /** Hàm khởi tạo form
   *
   */
  initForm(): void {
    this.addProductForm = new FormGroup({
      price2: new FormControl(
        0,
        Validators.compose([
          Validators.required,
          Validators.pattern(
            '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)'
          ),
        ])
      ),
      price: new FormControl(
        0,
        Validators.compose([
          Validators.required,
          Validators.pattern(
            '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)'
          ),
        ])
      ),
      price_import: new FormControl(
        0,
        Validators.compose([
          Validators.required,
          Validators.pattern(
            '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)'
          ),
        ])
      ),
      units: new FormControl([]),
      barcode: new FormControl(''),
      allow_sell: new FormControl(true),
      id_categorys: new FormControl([]),
      selling: new FormControl(true),
      brand: new FormControl(''),
      type: new FormControl(3),
      warning_number: new FormControl(0),
      availability: new FormControl('in_stock'),
      manysize: new FormControl(false),
      manylot: new FormControl(false),
      days_import_warning: new FormControl(0, Validators.required),
      days_exp_warning: new FormControl(0, Validators.required),

      webapp_price_sales: new FormControl(
        0,
        Validators.compose([
          Validators.pattern(
            '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)'
          ),
        ])
      ),
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
      url_canonical: new FormControl(''), //Liên kết chính tắc
      youtube_url: new FormControl(''), // Đường dẫn video youtube giới thiệu sản phẩm
      position_video_youtube: new FormControl(1), // Vị trí video youtube trong nhóm ảnh
    });

    let fieldNames: any = [
      { field: 'name', validators: { required: true, pattern: '' } },
      { field: 'webapp_sort_description', validators: { required: false, pattern: '' } },
      { field: 'webapp_description', validators: { required: false, pattern: '' } },

      { field: 'technical_spec', validators: { required: false, pattern: '' } },
      { field: 'promotion', validators: { required: false, pattern: '' } },
      { field: 'after_sales', validators: { required: false, pattern: '' } },
      { field: 'other', validators: { required: false, pattern: '' } },

      { field: 'unit', validators: { required: true, pattern: '' } },
      { field: 'webapp_seo_title', validators: { required: false, pattern: '' } },
      { field: 'webapp_seo_description', validators: { required: false, pattern: '' } },
      { field: 'webapp_seo_keyword', validators: { required: false, pattern: '' } }
    ];
    this.devices.forEach(device => {
      fieldNames.push(
        { field: `${device.value}_webapp_description`, validators: { required: false, pattern: '' } },
        { field: `${device.value}_webapp_sort_description`, validators: { required: false, pattern: '' } },

        { field: `${device.value}_technical_spec`, validators: { required: false, pattern: '' } },
        { field: `${device.value}_promotion`, validators: { required: false, pattern: '' } },
        { field: `${device.value}_after_sales`, validators: { required: false, pattern: '' } },
        { field: `${device.value}_other`, validators: { required: false, pattern: '' } },
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

    this.newFields.filter(
      (f: any) => ["select-multiple", "image"].includes(f.field_input_type)).forEach((field: any) => {
        this.addProductForm.addControl(
          field.field_custom, 
          new FormControl(field.field_start_value || [], field.field_required ? [Validators.required] : [])
        );
      }
    );

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminAddHandleChangeMultiLanguage(
        this.addProductForm,
        language.code,
        [
          ...this.newFields.filter((f: any) => !["select-multiple", "image"].includes(f.field_input_type)), 
          ...this.newFieldsCKEditor
        ],
        fieldNames,
      );
    });

    this.doneLoad = true;
    this.clearjs();
  }

  clearjs() {
    this.vhAlgorithm.waitingStack().then(() => {
      this.price = this.vhAlgorithm.vhnumeral('.price');
      this.price_import = this.vhAlgorithm.vhnumeral('.price_import');
      this.price_2 = this.vhAlgorithm.vhnumeral('.price_2');
      this.price_sales = this.vhAlgorithm.vhnumeral('.price_sales');
      this.warning_number = this.vhAlgorithm.vhnumeral('.warning_number');
      if (this.addProductForm.value.manylot) {
        this.days_import_warning = this.vhAlgorithm.vhnumeral(
          '.days_import_warning'
        );
        this.days_exp_warning = this.vhAlgorithm.vhnumeral('.days_exp_warning');
      }
    });
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

  backPageFn(): void {
    // this.submitAddProduct.emit(false);
    this.dialogRef.close(false);
  }


  onSubmitAddProduct(value): void {
    this.submitting = true;
    this.functionService.showLoading(this.languageService.translate('dang_them'));

    const product = {
      ...value,
      imgs: this.listImgProduct.map((item) => item.path),
      type: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.newFields.forEach((item) => {
      if (item.field_input_type == 'image') {
        product[item.field_custom] = this.listImgNewFields[item.field_custom].map((item) => item.path);
      }
    });

    if (this.addProductForm.valid) {
      product.link = this.functionService.nonAccentVietnamese(product['name_' + this.functionService.defaultLanguage].trim());
      product.link = product.link.replace(/[^a-z0-9-]/g, '');
      this.vhQueryAutoWeb
        .getProducts_byFields({ link: { $eq: product.link } })
        .then(
          (response: any): void => {
            if (response.vcode === 0 && response.data.length !== 0) {
              product.link = product.link + '-1';
            }

            if (product.manysize) {
              if (this.subProducts.length === 0) {
                this.functionService.createMessage(
                  'error',
                  this.languageService.translate('vui_long_them_thuoc_tinh_san_pham')
                );
              } else {
                this.subProducts = this.subProducts.map((item) => {
                  const subProduct = {
                    ...item,
                    // name: item.name,
                    warning_number: item.warning_number,
                    availability: item.availability,
                    allow_sell: item.allow_sell,
                    selling: item.selling,
                    units: [...item.units],
                    manylot: item.manylot,
                    lots: [],
                    days_import_warning: 0,
                    days_exp_warning: 0,
                    webapp_hidden: item.webapp_hidden,
                    type: 3
                  };
                  // Thêm tất cả các key bắt đầu bằng `name_` từ `item`
                  Object.keys(item)
                    .filter((key) => key.startsWith('name_'))
                    .forEach((key) => {
                      subProduct[key] = item[key];
                    });

                  if (item.manylot) {
                    subProduct.lots = item.lots;
                    subProduct.days_import_warning = item.days_import_warning;
                    subProduct.days_exp_warning = item.days_exp_warning;
                  } else {
                    delete subProduct.lots;
                    delete subProduct.days_import_warning;
                    delete subProduct.days_exp_warning;
                  }
                  return subProduct;
                });
              }
            } else {
              this.subProducts = [];
              product.price = parseFloat(
                this.price.getRawValue() ? this.price.getRawValue() : 0
              );
              product.price_import = parseFloat(
                this.price_import.getRawValue()
                  ? this.price_import.getRawValue()
                  : 0
              );
              product.price2 = parseFloat(
                this.price_2.getRawValue() ? this.price_2.getRawValue() : 0
              );
              product.webapp_price_sales = parseFloat(
                this.price_sales.getRawValue()
                  ? this.price_sales.getRawValue()
                  : 0
              );
              product.warning_number = parseFloat(
                this.warning_number.getRawValue()
                  ? this.warning_number.getRawValue()
                  : 0
              );

              const findIndex = product.units.findIndex((item) => item.default === true);

              if (findIndex != -1) {
                product.units[findIndex].price = product.price;
                product.units[findIndex].price2 = product.price2;
                product.units[findIndex].price_import = product.price_import;
                product.units[findIndex].webapp_price_sales = product.webapp_price_sales;
                product.units[findIndex].barcode = product.barcode;
              }

              product.units = [...product.units];

              if (product.manylot) {
                product.lots = this.lots;
                product.days_import_warning = parseFloat(
                  this.days_import_warning.getRawValue()
                    ? this.days_import_warning.getRawValue()
                    : 0
                );
                product.days_exp_warning = parseFloat(
                  this.days_exp_warning.getRawValue()
                    ? this.days_exp_warning.getRawValue()
                    : 0
                );
              }
            }

            Object.keys(product).forEach((key) => {
              if (key == 'manysize') {
                if (product[key] == true) {
                  delete product['allow_sell'];
                  delete product['selling'];
                  delete product['warning_number'];
                  delete product['availability'];
                  delete product['subProducts'];
                }
              }
              const keysToDelete = [
                'ratio',
                'price',
                'price2',
                'price_import',
                'webapp_price_sales',
                'barcode'
              ];

              Object.keys(product).forEach(key => {
                if (keysToDelete.includes(key) || key.startsWith('unit_')) {
                  delete product[key];
                }
              });
            });



            product.reference_links = Object.values(this.reference_links);

            if (product.youtube_url?.trim() && this.identifyYoutubeType(product?.youtube_url) !== 'EMBED_LINK') {
              product.youtube_url = this.formatEmbedUrl(product.youtube_url);
            }

            this.vhQueryAutoWeb
              .addProductAndSubsProduct({ ...product }, this.subProducts)
              .then(
                (res: any) => {
                  if (res.vcode === 0) {
                    this.functionService.createMessage(
                      'success',
                      this.languageService.translate('them_san_pham_thanh_cong')
                    );
                    let dataClose = { ...product, _id: res.data._id, };
                    if (this.subProducts.length > 0) {
                      dataClose.subs = res.data.subs;
                    }
                    this.dialogRef.close(dataClose);
                  }
                  if (res.vcode === 11) {
                    this.functionService.createMessage(
                      'error',
                      this.languageService.translate('phien_dang_nhap_da_het_han')
                    );
                  }
                },
                (err) => {
                  this.functionService.createMessage(
                    'error',
                    this.languageService.translate('co_loi_xay_ra_vui_long_thu_lai')
                  );
                }
              ).finally(() => {
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
    }
    else {
      this.functionService.createMessage('error', this.languageService.translate('vui_long_dien_du_thong_tin'));
      this.functionService.hideLoading();
      this.submitting = false;
    }
  }

  public openComponentUnits = false;
  public units: Array<any> = []; // Mảng danh sách các đơn vị
  public unitByRatio1: any = {}; // Đơn vị chính
  public lots: Array<any> = []; // Danh sách lô sản phẩm

  /** Hàm này thực hiện mở danh sách đơn vị
   *
   */
  openUnits() {
    this.unitByRatio1 = this.functionService.multi_languages.reduce((acc: any, language: any) => {
      acc[`unit_${language.code}`] = this.addProductForm.value[`unit_${language.code}`];
      acc[`name_${language.code}`] = this.addProductForm.value[`name_${language.code}`];
      return acc;
    }, {
      ratio: 1,
      barcode: this.addProductForm.value.barcode,
      price: parseFloat(this.price.getRawValue() || 0),
      price2: parseFloat(this.price_2.getRawValue() || 0),
      price_import: parseFloat(this.price_import.getRawValue() || 0),
      webapp_price_sales: parseFloat(this.price_sales.getRawValue() || 0),
      default: this.units.length > 1 ? this.units[0].default : true,
    });
    if (this.units.length === 0) {
      this.units = [this.unitByRatio1];
    } else {
      this.units = this.units.filter((filter) => filter.ratio != 1);
      this.units = [this.unitByRatio1, ...this.units];
    }
    if (this.units.length === 1) this.units[0].default = true;
    this.listBarcode = !this.addProductForm.value.manysize
      ? [
        this.addProductForm.value.barcode,
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
    });
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
    this.openComponentUnits = !this.openComponentUnits;
  }

  ///add subs ///
  public unitsSubProduct: Array<any> = [];
  openFormAddSubProduct(): void {
    this.initFormSubProduct();
    // this.visibleFormSubProduct = !this.visibleFormSubProduct;

    const dialogRef = this.matdialog.open(AddSubproductComponent, {
      width: '35vw',
      height: '80vh',
      disableClose: true,
      data: {
        formSubProduct: this.formSubProduct,
        unitsSubProduct: this.unitsSubProduct,
        days_import_warning: this.days_import_warning,
        formBuilder: this.formBuilder,
        lots: this.lots,
        formLotProduct: this.formLotProduct,
        days_exp_warning: this.days_exp_warning,
        itemLots: this.itemLots,
        formEditLotProduct: this.formEditLotProduct,
        addProductForm: this.addProductForm,
        postionEditLotProduct: this.postionEditLotProduct,
        unitByRatio1: this.unitByRatio1,
        units: this.units,
        priceSubProduct: this.priceSubProduct,
        priceImportSubProduct: this.priceImportSubProduct,
        price2SubProduct: this.price2SubProduct,
        priceSalesSubProduct: this.priceSalesSubProduct,
        listBarcode: this.listBarcode,
        // formSubProduct: this.formSubProduct,
        // generateBarcodesAutomatically: this.generateBarcodesAutomatically.bind(this),
        // openUnitsSubProduct: this.openUnitsSubProduct.bind(this),
        // unitsSubProduct: this.unitsSubProduct,
        // changeManyLotSubProduct: this.changeManyLotSubProduct.bind(this),
        // openFormAddLotProduct: this.openFormAddLotProduct.bind(this),
        // lots: this.lots,
        // openEditLotProduct: this.openEditLotProduct.bind(this),
        // openDeleteLotProduct: this.openDeleteLotProduct.bind(this),

      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.handleAddSubProduct();
      }
    });
  }

  handleAddSubProduct() {

    if (this.formSubProduct.valid) {
      let dataSub = {
        ...this.formSubProduct.value,
        units: new Array(),
        price: parseFloat(this.priceSubProduct.getRawValue() || 0),
        price2: parseFloat(this.price2SubProduct.getRawValue() || 0),
        price_import: parseFloat(this.priceImportSubProduct.getRawValue() || 0),
        webapp_price_sales: parseFloat(
          this.priceSalesSubProduct.getRawValue() || 0
        ),
        warning_number: parseFloat(
          this.warningNumberSubProduct.getRawValue() || 0
        )
      };

      dataSub.units = [
        this.functionService.multi_languages.reduce((acc: any, language: any) => {
          acc[`unit_${language.code}`] = dataSub[`unit_${language.code}`];
          return acc;
        }, {
          ratio: 1,
          price: parseFloat(dataSub.price),
          price2: parseFloat(dataSub.price2),
          price_import: parseFloat(dataSub.price_import),
          barcode: dataSub.barcode,
          webapp_price_sales: parseFloat(dataSub.webapp_price_sales),
          default: this.formSubProduct.value.units.length > 1 ? this.formSubProduct.value.units[0].default : true,
        }),
        ...this.formSubProduct.value.units.filter((filter) => filter.ratio !== 1),
      ];


      if (dataSub.manylot) {
        dataSub.lots = this.formSubProduct.value.lots;
        dataSub.days_import_warning = this.parseStringToNumber(this.formSubProduct.value.days_import_warning);
        dataSub.days_exp_warning = this.parseStringToNumber(this.formSubProduct.value.days_exp_warning);
      }

      this.subProducts = this.subProducts.concat(dataSub);
      this.addProductForm.controls['subProducts'].setValue(this.subProducts);
    }



    // this.visibleFormSubProduct = false;
  }

  parseStringToNumber(value: string): number {
    if (!value) return 0;
    if (typeof value !== 'string') return 0;
    if (typeof value == 'number') return value;
    return Number(value.replace(/,/g, ''));
  }

  public visibleEditFormSubProduct = false;
  public indexEditFormSubProduct: number;
  openFormSubProduct(subproduct, index): void {
    this.initFormSubProduct(subproduct);
    this.indexEditFormSubProduct = index;
    const dialogRef = this.matdialog.open(EditSubproductComponent, {
      width: '35vw',
      height: '80vh',
      disableClose: true,
      data: {
        formSubProduct: this.formSubProduct,
        unitsSubProduct: this.unitsSubProduct,
        days_import_warning: this.days_import_warning,
        formBuilder: this.formBuilder,
        lots: this.lots,
        formLotProduct: this.formLotProduct,
        days_exp_warning: this.days_exp_warning,
        itemLots: this.itemLots,
        formEditLotProduct: this.formEditLotProduct,
        addProductForm: this.addProductForm,
        postionEditLotProduct: this.postionEditLotProduct,
        unitByRatio1: this.unitByRatio1,
        units: this.units,
        priceSubProduct: this.priceSubProduct,
        priceImportSubProduct: this.priceImportSubProduct,
        price2SubProduct: this.price2SubProduct,
        priceSalesSubProduct: this.priceSalesSubProduct,
        listBarcode: this.listBarcode,

      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.handleEditSubProduct();
      }
    });

  }

  handleEditSubProduct(): void {
    if (this.formSubProduct.valid) {
      let dataSub = {
        ...this.formSubProduct.value,
        units: new Array(),
        price: parseFloat(this.priceSubProduct.getRawValue() || 0),
        price2: parseFloat(this.price2SubProduct.getRawValue() || 0),
        price_import: parseFloat(this.priceImportSubProduct.getRawValue() || 0),
        webapp_price_sales: parseFloat(this.priceSalesSubProduct.getRawValue() || 0),
        warning_number: parseFloat(this.warningNumberSubProduct.getRawValue() || 0),
      };
      dataSub.units = [
        {
          ...Object.keys(dataSub)
            .filter((key) => key.startsWith('unit_'))
            .reduce((acc, key) => {
              acc[key] = dataSub[key];
              return acc;
            }, {}),
          ratio: 1,
          price: parseFloat(dataSub.price),
          price2: parseFloat(dataSub.price2),
          price_import: parseFloat(dataSub.price_import),
          barcode: dataSub.barcode,
          webapp_price_sales: parseFloat(
            dataSub.webapp_price_sales
          ),
          default: this.formSubProduct.value.units.length > 1 ? this.formSubProduct.value.units[0].default : true,
        },
        ...this.formSubProduct.value.units.filter((filter) => filter.ratio != 1),
      ];

      if (dataSub.manylot) {
        dataSub.lots = this.formSubProduct.value.lots;
        dataSub.days_import_warning = this.parseStringToNumber(this.formSubProduct.value.days_import_warning);
        dataSub.days_exp_warning = this.parseStringToNumber(this.formSubProduct.value.days_exp_warning);
      }

      this.subProducts = this.subProducts.map((map, index) => {
        return (index == this.indexEditFormSubProduct) ? dataSub : map;

      });
      this.addProductForm.controls['subProducts'].setValue(this.subProducts);
    }
  }

  initFormSubProduct(subproduct?: any) {
    const unitSubProduct = subproduct?.units.find((unit) => unit.ratio === 1);
    const defaultPattern = '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)';
    const createControl = (value: any, validators = []) => new FormControl(value, validators);
    const controls = {
      // Dynamic fields for additional languages
      ...this.functionService.multi_languages.reduce((acc: any, language: any) => {
        acc[`name_${language.code}`] = createControl(subproduct?.[`name_${language.code}`] || '', [Validators.required]);
        acc[`unit_${language.code}`] = createControl(unitSubProduct?.[`unit_${language.code}`] || '', [Validators.required]);
        return acc;
      }, {}),

      // Pricing fields
      price_import: createControl(unitSubProduct?.price_import || 0, [Validators.required, Validators.pattern(defaultPattern)]),
      price: createControl(unitSubProduct?.price || 0, [Validators.required, Validators.pattern(defaultPattern)]),
      price2: createControl(unitSubProduct?.price2 || 0, [Validators.required, Validators.pattern(defaultPattern)]),
      webapp_price_sales: createControl(unitSubProduct?.webapp_price_sales || 0, [Validators.required, Validators.pattern(defaultPattern)]),

      // Other fields
      warning_number: createControl(subproduct?.warning_number || 0, [Validators.required]),
      availability: createControl(subproduct?.availability || 'in_stock'),
      barcode: createControl(unitSubProduct?.barcode || ''),
      units: createControl(subproduct?.units || []),
      allow_sell: createControl(subproduct?.allow_sell ?? true),
      selling: createControl(subproduct?.selling ?? true),
      manylot: createControl(subproduct?.manylot ?? false),
      days_import_warning: createControl(subproduct?.days_import_warning || 0),
      days_exp_warning: createControl(subproduct?.days_exp_warning || 0),
      webapp_hidden: createControl(subproduct?.webapp_hidden ?? true),
      lots: createControl([]),
    };

    // Tạo form với các controls đã tối ưu
    this.formSubProduct = new FormGroup(controls);
    this.lots = [];
    if (subproduct) {
      if (subproduct['lots'].length > 0) {
        this.formSubProduct.controls['lots'].setValue(subproduct['lots']);
        this.lots = subproduct['lots'];
      }
    }

    this.clearjsSubProduct();
  }

  public priceSubProduct: any;
  public price2SubProduct: any;
  public priceImportSubProduct: any;
  public priceSalesSubProduct: any;
  public warningNumberSubProduct: any;
  public daysImportWarningSubProduct: any;
  public daysExpWarningSubProduct: any;

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
    this.unitByRatio1 = this.functionService.multi_languages.reduce((acc: any, language: any) => {
      acc[`unit_${language.code}`] = this.formSubProduct.value[`unit_${language.code}`];
      acc[`name_${language.code}`] = this.formSubProduct.value[`name_${language.code}`];
      return acc;
    }, {
      default: this.units.length > 1 ? this.units[0].default : true,
      ratio: 1,
      barcode: this.formSubProduct.value.barcode,
      price: parseFloat(this.priceSubProduct.getRawValue() || 0),
      price2: parseFloat(this.price2SubProduct.getRawValue() || 0),
      price_import: parseFloat(this.priceImportSubProduct.getRawValue() || 0),
      webapp_price_sales: parseFloat(this.priceSalesSubProduct.getRawValue() || 0),
    });
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
    });
  }

  transPrice(item: any): any {
    const priceDefault = item.find((find) => find.default === true);
    return priceDefault;
  }

  enterPrice(): void {
    let data = this.addProductForm.value;
    if (data.units.length != 0) {
      this.addProductForm.value.units.find((item) => item.default).price =
        parseFloat(this.price.getRawValue());
      this.addProductForm.value.units.find((item) => item.default).price2 =
        parseFloat(this.price_2.getRawValue());
      this.addProductForm.value.units.find(
        (item) => item.default
      ).price_import = parseFloat(this.price_import.getRawValue());
      this.addProductForm.value.units.find(
        (item) => item.default
      ).webapp_price_sales = parseFloat(
        this.price_sales.getRawValue()
      );
      this.addProductForm.value.units.find((item) => item.default)[`unit_${this.functionService.languageTempCode}`] =
        data[`unit_${this.functionService.languageTempCode}`];
    } else {
      let units = [
        {
          [`unit_${this.functionService.languageTempCode}`]: this.addProductForm.value[`unit_${this.functionService.languageTempCode}`],
          ratio: 1,
          default: true,
          price: parseFloat(this.price.getRawValue()),
          price2: parseFloat(this.price_2.getRawValue()),
          price_import: parseFloat(this.price_import.getRawValue()),
          webapp_price_sales: parseFloat(
            this.price_sales.getRawValue()
          ),
          barcode: this.addProductForm.value.barcode
        },
      ];
      if (this.addProductForm.value.units.length == 0)
        this.addProductForm.controls['units'].setValue(units);
    }
  }

  changeManySize(e): void {
    if (!e) {
      this.subProducts = [];
      this.initForm();
      this.addProductForm.removeControl('subProducts');
      this.clearjs();
    } else {
      this.addProductForm.addControl(
        'subProducts',
        new FormControl('', [Validators.required])
      );

      // for (let i in this.newFields) {
      //   this.addProductForm.removeControl(this.newFields[i].field_custom)
      // }
      this.addProductForm.removeControl('price');
      this.addProductForm.removeControl('price2');
      this.addProductForm.removeControl('price_import');
      this.addProductForm.removeControl('barcode');
      this.addProductForm.removeControl('warning_number');
      this.addProductForm.removeControl('availability');
      Object.keys(this.addProductForm.controls).forEach(controlName => {
        if (controlName.startsWith('unit_')) {
          this.addProductForm.removeControl(controlName);
        }
      });
      this.addProductForm.removeControl('units');
      this.addProductForm.removeControl('lots');
      this.addProductForm.removeControl('selling');
      this.addProductForm.removeControl('allow_sell');
      this.addProductForm.removeControl('manylot');
      this.addProductForm.removeControl('webapp_price_sales');
    }
    this.lots = [];
    this.units = [];
  }

  /** Hàm này thực hiện những thay đổi khi quản lý sản phẩm lô
   *
   * @param e
   */
  changeManyLot(e) {
    if (!e) {
      // manylot = false
      this.addProductForm.removeControl('days_exp_warning');
      this.addProductForm.removeControl('days_import_warning');
      if (this.addProductForm.value.lots)
        this.addProductForm.removeControl('lots');
    } else {
      // manylot = true
      this.addProductForm.addControl(
        'days_exp_warning',
        new FormControl(0, [Validators.required])
      );
      this.addProductForm.addControl(
        'days_import_warning',
        new FormControl(0, [Validators.required])
      );
      this.addProductForm.addControl('lots', new FormControl([]));
      this.vhAlgorithm.waitingStack().then(() => {
        if (this.addProductForm.value.manylot) {
          this.days_import_warning = this.vhAlgorithm.vhnumeral(
            '.days_import_warning'
          );
          this.days_exp_warning =
            this.vhAlgorithm.vhnumeral('.days_exp_warning');
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

    const dialogRef = this.matdialog.open(AddProductLotsComponent, {
      width: '30vw',
      height: '50vh',
      disableClose: true,
      data: {
        formLotProduct: this.formLotProduct,
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.handleAddLotProduct();
      }
    });

  }

  public formEditLotProduct: FormGroup;
  public postionEditLotProduct: number;
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


    const dialogRef = this.matdialog.open(EditProductLotsComponent, {
      width: '30vw',
      height: '50vh',
      disableClose: true,
      data: {
        formEditLotProduct: this.formEditLotProduct,
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.handleEditLotProduct();
      }
    });

  }
  /** Hàm này thực hiện xóa lô
   *
   * @param lot
   * @param index
   */
  openDeleteLotProduct(lot, idx) {
    this.vhComponent
      .alertConfirm('', this.languageService.translate('xac_nhan_xoa_lo_san_pham') + '?', lot.lot_number, this.languageService.translate('dong_y'), this.languageService.translate('thoat'))
      .then(
        (ok) => {
          if (ok == 'OK') {
            this.lots = this.lots.filter((_, index) => index != idx);
            this.itemLots.setValue(this.lots);
          }
        },
        (error) => {
          console.error(error);
        }
      );
  }

  /** Hàm lấy mảng lô
   *
   */
  get itemLots() {
    let lotsReturn;
    if (this.addProductForm.value.manysize) {
      lotsReturn = this.formSubProduct.controls['lots'] as FormArray;
    } else {
      lotsReturn = this.addProductForm.controls['lots'] as FormArray;
    }
    return lotsReturn;
  }

  /** Hàm thực hiện thêm lô sản phẩm
   *
   */
  handleAddLotProduct() {
    if (this.formLotProduct.valid) {
      this.lots = [...this.lots, this.formLotProduct.value];
      // this.lots.push(this.formLotProduct.value);
      this.itemLots.setValue(this.lots);
    }
  }

  /** Hàm thực hiện sửa lô sản phẩm
   *
   */
  handleEditLotProduct() {
    if (this.formEditLotProduct.valid) {
      const editedData = this.formEditLotProduct.value;
      const newLots = this.lots.map((item, index) => index === this.postionEditLotProduct ? editedData : item);
      this.lots = newLots;
      this.itemLots.setValue(this.lots);
    }
  }

  /** xóa thuộc tính sản phẩm */
  deleteSubProductById(sub): void {
    this.vhComponent
      .alertConfirm('', this.languageService.translate('xac_nhan_xoa_thuoc_tinh_san_pham') + '?', sub[`name_${this.functionService.defaultLanguage}`], this.languageService.translate('dong_y'), this.languageService.translate('thoat'))
      .then(
        (ok) => {
          if (ok == 'OK') {
            this.subProducts = this.subProducts.filter((item) => item[`name_${this.functionService.defaultLanguage}`] !== sub[`name_${this.functionService.defaultLanguage}`]);
            this.addProductForm.controls['subProducts'].setValue(this.subProducts);
          }
        },
        (error) => {
          console.error(error);
        }
      );
  }
  public days_import_warning_subproduct: any;
  public days_exp_warning_subproduct: any;

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

  clearValueInForm(key: string) {
    if (typeof this.addProductForm.value[key] != 'number')
      this.addProductForm.controls[key].setValue('');
    else {
      this.addProductForm.controls[key].setValue(0);
    }
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
      this.addProductForm.controls['barcode'].setValue(newbarcode);
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


  createCategory() {
    const dialogRef = this.matdialog.open(AddCategoryComponent, {
      width: '50vw',
      height: '60vh',
      disableClose: true,
      data: {
        categories: this.categories,
        setupCategoryImg: this.data.setupCategoryImg
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.id_main_sectors.includes('ecommerce')) {
        this.data.categories.push(result);
        this.categories = [...this.categories, result];
      }
    });
  }

  /** Hàm nhận sự kiện trả về danh sách ảnh từ app-list-image
   *
   * @param event
   */
  sendImgs(event, field?: string) {
    if (event) {
      if (!field) {
        this.listImgProduct = event.imgs;
      } else {
        this.listImgNewFields[field] = event.imgs;
      }
    }
  }

  /**
 * hàm này để cập nhật resolution cho subproject
 */
  updateSetup() {
    this.vhQueryAutoWeb
      .updateSetup(this.data.setupProductImg._id, {
        upload_image: {
          compress_type: this.setupProductImg.upload_image.compress_type,
          source: this.setupProductImg.upload_image.source,
        }
      })
      .then((bool: any) => {
        // console.log('updateSetup', bool);
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  selectChange(event, field) {
    this.addProductForm.controls[field].setValue(event);
  }

  getFormControl(controlName: string): FormControl {
    return this.addProductForm.get(controlName) as FormControl;
  }


  handleLog() {
    console.log(this.addProductForm.value);
    console.log(this.reference_links);
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
      { title: 'mo_ta_ngan', field: 'webapp_sort_description' },

      { title: 'dac_ta_ky_thuat', field: 'technical_spec' },
      { title: 'thong_tin_khuyen_mai', field: 'promotion' },
      { title: 'thong_tin_hau_mai', field: 'after_sales' },
      { title: 'thong_tin_khac', field: 'other' },
    ];

    const dialogRef = this.matdialog.open(DescriptionByDeviceComponent, {
      width: '70vw',
      height: '80vh',
      disableClose: true,
      data: {
        formData: this.addProductForm,
        tabs: staticTabs.concat(dynamicTabs) // gộp tabs tĩnh và động
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        // xử lý sau khi đóng dialog
      }
    });
  }

  onChangeGoogleShopping() {
    const google_shopping = this.addProductForm.get('google_shopping')?.value;

    if (this.addProductForm.get('google_shopping_enable')?.value) {
      if (!google_shopping.image_link) {
        this.addProductForm.get('google_shopping.image_link')
          ?.setValue(this.listImgProduct[0]?.path);
      }
    }
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
          this.reference_links[`link${index}`] = data.href;
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

  handleEditCkeditor(item) {
    const dialogRef = this.matdialog.open(VhCkeditorModalComponent, {
      width: '60vw',
      height: '80vh',
      data: {
        formData: this.addProductForm,
        item: item,
        type: 'products' // để phân biệt upload ảnh cho danh mục hay sản phẩm
      }
    });

    dialogRef.afterClosed().subscribe(() => {

    });
  }

  getContentSafeHtml(field: string): any {
    const rawHtml = this.getFormControl(field).value;
    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  }

  // Getter to access google_shopping FormGroup
  get googleShopping(): FormGroup {
    return this.addProductForm.get('google_shopping') as FormGroup;
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

    editor.ui
      .getEditableElement()
      .parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
      );

    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) =>
      this.vhImage.MyUploadImageAdapter(loader, `images/database/products`);
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

  /**
   * Xử lý chuyển link youtube, iframe thành link nhúng
   */
  formatEmbedUrl(input: string): string {
    if (!input) return '';
    
    let videoId = '';
    const trimmedInput = input.trim();

    // 1. Nếu là code iframe, trích xuất thuộc tính src trước
    if (trimmedInput.includes('<iframe')) {
      const srcMatch = trimmedInput.match(/src=["']([^"']+)["']/i);
      if (srcMatch) {
        return this.formatEmbedUrl(srcMatch[1]); // Đệ quy để xử lý link trong src
      }
    }

    // 2. Các Regex để bắt Video ID từ các loại link khác nhau
    const patterns = [
      /youtube(?:-nocookie)?\.com\/watch\?v=([^&?/\s]+)/, // Link watch (full & nocookie)
      /youtu\.be\/([^&?/\s]+)/,                           // Link rút gọn
      /youtube(?:-nocookie)?\.com\/embed\/([^&?/\s]+)/,   // Link nhúng (full & nocookie)
    ];

    for (let pattern of patterns) {
      const match = trimmedInput.match(pattern);
      if (match && match[1]) {
        videoId = match[1];
        break;
      }
    }

    // Trả về link nhúng chuẩn nếu tìm thấy ID, ngược lại trả về input gốc hoặc chuỗi rỗng
    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}`
    } else {
      // Trường hợp link youtube chưa chuyển sang dạng nocookie thì chuyển
      if (trimmedInput && trimmedInput.includes("youtube.com/embed")) {
        return trimmedInput.replace("youtube.com", "youtube-nocookie.com")
      }
      return trimmedInput;
    }
  }

  /**
   * Xử lý khi nhập hoàn tất
   * @param field Trường dữ liệu
   */
  onInputBlur(field) {
    const value = this.addProductForm.get(field)?.value;

    // trường hợp chỉ điền khoảng cách
    if (!value?.trim()) {
      this.addProductForm.patchValue({ [field]: '' });
    }

    switch (field) {
      case 'youtube_url': 
        if (value.trim()) {
          this.addProductForm.patchValue({ youtube_url: this.formatEmbedUrl(value) });
        }
        break;
    }
  }

  /**
   * Hàm kiểm tra link youtube này thuộc loại nào
   * > Dùng cho trường hợp người dùng chưa blur ô nhập youtube_url mà 
   * > đã bấm thêm hoặc lưu làm cho link không chuyển thành link nhúng
   * @param input link youtube
   * @returns loại link `"EMBED_CODE" | "EMBED_LINK" | "VIDEO_LINK" | "UNKNOWN"`
   */
  identifyYoutubeType(input): "EMBED_CODE" | "EMBED_LINK" | "VIDEO_LINK" | "UNKNOWN" {
    if (!input) return "UNKNOWN";
    const trimmedInput = input.trim();

    // 1. Kiểm tra Code nhúng (iframe) - Hỗ trợ cả youtube.com và youtube-nocookie.com
    const iframeRegex = /<iframe.*src=["']https:\/\/www\.youtube(?:-nocookie)?\.com\/embed\/([^"']+)["'].*><\/iframe>/i;
    if (iframeRegex.test(trimmedInput)) {
      return "EMBED_CODE";
    }

    // 2. Kiểm tra Link nhúng (embed link) - Hỗ trợ cả youtube.com và youtube-nocookie.com
    const embedLinkRegex = /^https?:\/\/(www\.)?youtube(?:-nocookie)?\.com\/embed\/([\w-]+)(\?.*)?$/i;
    if (embedLinkRegex.test(trimmedInput)) {
      return "EMBED_LINK";
    }

    // 3. Kiểm tra Link video (watch link hoặc short link)
    // Bao gồm: youtube.com/watch, youtube-nocookie.com/watch và youtu.be/
    const videoLinkRegex = /^https?:\/\/((www\.)?youtube(?:-nocookie)?\.com\/watch\?v=|youtu\.be\/)([\w-]+)(&.*|\?.*)?$/i;
    if (videoLinkRegex.test(trimmedInput)) {
      return "VIDEO_LINK";
    }

    return "UNKNOWN";
  }
}
