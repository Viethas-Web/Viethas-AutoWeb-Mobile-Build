import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb, VhImage, VhEventMediator } from 'vhautowebdb';
import { AddCategoryComponent } from '../../categories/add-category/add-category.component';
import { LanguageService } from 'src/app/services/language.service';
import { UnitsComponent } from '../units/units.component';
import { AddSubproductComponent } from '../add-subproduct/add-subproduct.component';
import { EditSubproductComponent } from '../edit-subproduct/edit-subproduct.component';
import { EditProductLotsComponent } from '../edit-product-lots/edit-product-lots.component';
import { AddProductLotsComponent } from '../add-product-lots/add-product-lots.component';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { FunctionService } from 'vhobjects-service';
import { DescriptionByDeviceComponent } from '../../components/dialog/description-by-device/description-by-device.component';
import { ManageLibraryComponent } from 'vhobjects-service';
import { DomSanitizer } from '@angular/platform-browser';
import { VhCkeditorModalComponent } from '../../components/vh-ckeditor-modal/vh-ckeditor-modal.component';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss'],
})
export class EditProductComponent implements OnInit {
  // @Input() data: any;
  public editProductForm: FormGroup;
  public price: any;
  public price_2: any;
  public price_sales: any;
  public price_import: any;
  public days_import_warning: any;
  public days_exp_warning: any;
  public categories: any = [];
  public warning_number: any;
  public subProducts: any = [];
  public listImgProduct: any = [];
  public listImgNewFields = {};
  public lots: Array<any> = []; // Danh sách lô sản phẩm
  public formSubProduct: FormGroup;
  public listBarcode: Array<any> = [];
  public unitsSubProduct: Array<any> = [];
  public visibleEditFormSubProduct = false;
  public indexEditFormSubProduct: number;
  public priceSubProduct: any;
  public price2SubProduct: any;
  public priceImportSubProduct: any;
  public priceSalesSubProduct: any;
  public warningNumberSubProduct: any;
  public daysImportWarningSubProduct: any;
  public daysExpWarningSubProduct: any;
  public visibleFormLotProduct = false;
  public formAddLotProduct: FormGroup;
  public days_import_warning_subproduct: any;
  public days_exp_warning_subproduct: any;
  // public openComponentUnits = false;
  public units: Array<any> = []; // Mảng danh sách các đơn vị
  public path: any = ''; // Dùng để chứa đường dẫn ảnh trả về từ thư viện
  public formEditLotProduct: FormGroup;
  public postionEditLotProduct: number;
  setup_fields_google_shopping: any;
  newFields = [];
  newFieldsCKEditor = [];
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
  isOpenGuideVideo: boolean = false;

  constructor(
    public vhAlgorithm: VhAlgorithm,
    private el: ElementRef,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    private formBuilder: FormBuilder,
    public vhImage: VhImage,
    public matdialog: MatDialog,
    public languageService: LanguageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditProductComponent>,
    private vhComponent: VhComponent,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.categories = this.data.categories.filter(c => c._id !== 'all');
    if (this.data) {
      this.getNewFileds();
      this.getSetup();
    }

    // Lắng click ra ngoài (backdrop)
    // đoạn này để đóng mà modal và trả về result, nếu ko sẽ ko cập nhật giao diện
    this.dialogRef.backdropClick().subscribe(() => {
      this.close();
    });
  }

  ngOnDestroy() {
    for (const { element, event, handler } of this.editorListeners) {
      element.removeEventListener(event, handler);
    }
    this.editorListeners = [];
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
            this.listImgNewFields[item.field_custom] = this.data.dataEditProduct[item.field_custom];
          }
        });
        this.initForm(this.data.dataEditProduct);
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

  selectChange(event, field) {
    this.editProductForm.controls[field].setValue(event);
    this.updateProduct(field, { [field]: event });
  }

  doneLoad = false;
  /** Hàm khởi tạo form
   *
   * @param value: object
   */
  initForm(product): void {
    const { languageTempCode } = this.functionService;
    this.editProductForm = new FormGroup({
      _id: new FormControl(product._id),
      id_categorys: new FormControl(product.id_categorys && product.id_categorys.length > 0 ? product.id_categorys : []),
      link: new FormControl(product.link, [Validators.required, Validators.pattern('^(?!.*[\\/\\\\])[a-z0-9-]+$')]),
      manysize: new FormControl(product.manysize),
      units: new FormControl(product.units),
      manylot: new FormControl(product.manylot),
      warning_number: new FormControl(product.warning_number),
      availability: new FormControl(product.availability),
      days_import_warning: new FormControl(product.days_import_warning),
      days_exp_warning: new FormControl(product.days_exp_warning),
      brand: new FormControl(product.brand),
      webapp_hidden: new FormControl(product.webapp_hidden),
      google_shopping_enable: new FormControl(product?.google_shopping_enable ?? false),
      google_shopping: new FormGroup({
        id: new FormControl(product?.google_shopping?.id ?? ''),
        title: new FormControl(product?.google_shopping?.title ?? ''),
        description: new FormControl(product?.google_shopping?.description ?? ''),
        link: new FormControl(product?.google_shopping?.link ?? ''),
        image_link: new FormControl(product?.google_shopping?.image_link ?? ''),
        additional_image_links: (product.google_shopping?.additional_image_links && Array.isArray(product.google_shopping?.additional_image_links)) ? this.formBuilder.array(
          product.google_shopping.additional_image_links.map(link => new FormControl(link))
        ) : this.formBuilder.array(Array.from({ length: 10 }).map(() => new FormControl(''))),
        price: new FormControl(product?.google_shopping?.price ?? ''),
        availability: new FormControl(product?.google_shopping?.availability ?? ''),
        brand: new FormControl(product?.google_shopping?.brand ?? ''),
        condition: new FormControl(product?.google_shopping?.condition ?? ''),
        type_product: new FormControl(product?.google_shopping?.type_product ?? ''),
        google_product_category: new FormControl(product?.google_shopping?.google_product_category ?? ''),
      }),
      url_canonical: new FormControl(product?.url_canonical ?? ''),
      youtube_url: new FormControl(product?.youtube_url ?? ''), // Đường dẫn video youtube giới thiệu sản phẩm
      position_video_youtube: new FormControl(product?.position_video_youtube ?? 1), // Vị trí video youtube trong nhóm ảnh
    });

    let fieldNames: any = [
      { field: 'name', validators: { required: true, pattern: '' } },
      { field: 'webapp_sort_description', validators: { required: false, pattern: '' } },
      { field: 'webapp_description', validators: { required: false, pattern: '' } },

      { field: 'technical_spec', validators: { required: false, pattern: '' } },
      { field: 'promotion', validators: { required: false, pattern: '' } },
      { field: 'after_sales', validators: { required: false, pattern: '' } },
      { field: 'other', validators: { required: false, pattern: '' } },

      { field: 'webapp_seo_title', validators: { required: false, pattern: '' } },
      { field: 'webapp_seo_description', validators: { required: false, pattern: '' } },
      { field: 'webapp_seo_keyword', validators: { required: false, pattern: '' } }
    ];

    this.reference_links = {
      link1: product?.reference_links?.[0] || '',
      link2: product?.reference_links?.[1] || '',
      link3: product?.reference_links?.[2] || '',
      link4: product?.reference_links?.[3] || '',
      link5: product?.reference_links?.[4] || '',
    };

    this.newFields.filter((f: any) => ["select-multiple", "image"].includes(f.field_input_type)).forEach((field: any) => {
      this.editProductForm.addControl(field.field_custom, new FormControl(product[field.field_custom] || [], field.field_required ? [Validators.required] : []));
    });

    this.devices.forEach(device => {
      // Thêm các field mặc định
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

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminEditHandleChangeMultiLanguage(
        this.editProductForm,
        language.code,
        [...this.newFields.filter((f: any) => !["select-multiple", "image"].includes(f.field_input_type)), ...this.newFieldsCKEditor],
        fieldNames,
        this.data.dataEditProduct,
        this.getUnitsByRatio.bind(this),
      );
    });

    if (!product.manysize) {
      this.editProductForm.addControl('warning_number', new FormControl(product.warning_number, Validators.required));
      this.editProductForm.addControl('availability', new FormControl(product.availability, Validators.required));

      const unit = product.units ? this.getUnitsByRatio(product.units, 1) : null;
      const patternValidator = Validators.pattern(
        '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)'
      );
      const fixedFields = [
        { name: 'price_import', value: unit?.price_import || product.price_import || 0 },
        { name: 'price', value: unit?.price || product.price || 0 },
        { name: 'price2', value: unit?.price2 || product.price2 || 0 },
        { name: 'webapp_price_sales', value: unit?.webapp_price_sales || product.webapp_price_sales || 0 },
        { name: 'barcode', value: unit?.barcode || product.barcode || '', validators: [] },
      ];

      // Thêm các field cố định
      fixedFields.forEach(({ name, value, validators = [Validators.required, patternValidator] }) => {
        this.editProductForm.addControl(name, new FormControl(value, Validators.compose(validators)));
      });

      // Tự động thêm các field bắt đầu bằng `unit_`
      Object.keys(unit)
        .filter((key) => key.startsWith('unit_'))
        .forEach((key) => {
          if (!this.editProductForm.contains(key)) {
            this.editProductForm.addControl(key, new FormControl(unit[key] ?? '', Validators.required));
          }
        });
      if (!this.editProductForm.contains(`unit_${languageTempCode}`)) {
        this.editProductForm.addControl(`unit_${languageTempCode}`,
          new FormControl('', Validators.required)
        );
      }
    } else {
      this.subProducts = product.subs || [];
      this.subProducts.forEach(subProduct => {
        const unit = this.getUnitsByRatio(subProduct.units, 1);
        Object.assign(subProduct, {
          price: unit.price,
          price2: unit.price2,
          price_import: unit.price_import,
          webapp_price_sales: unit.webapp_price_sales,
          barcode: unit.barcode
        });
      });
    }

    if (product.manylot) {
      ['lots', 'days_import_warning', 'days_exp_warning'].forEach(field =>
        this.editProductForm.addControl(
          field,
          new FormControl(product[field] || 0, Validators.required)
        )
      );
      this.lots = product.lots;
    }

    if (product.imgs?.length) {
      this.listImgProduct = product.imgs.map(map => ({ path: map, visible: false }));
    }

    this.clearJs();
    this.doneLoad = true;
  }

  clearJs() {
    if (!this.data.dataEditProduct.subs) {
      this.vhAlgorithm.waitingStack().then(() => {
        this.units = this.data.dataEditProduct.units;
        this.price = this.vhAlgorithm.vhnumeral('.price');
        this.price_import = this.vhAlgorithm.vhnumeral('.price_import');
        this.price_2 = this.vhAlgorithm.vhnumeral('.price_2');
        this.price_sales = this.vhAlgorithm.vhnumeral('.price_sales');
        this.warning_number = this.vhAlgorithm.vhnumeral('.warning_number');
        if (this.editProductForm.value.manylot) {
          this.days_import_warning = this.vhAlgorithm.vhnumeral(
            '.days_import_warning'
          );
          this.days_exp_warning =
            this.vhAlgorithm.vhnumeral('.days_exp_warning');
        }
      });
    }
  }

  getUnitsByRatio(units: Array<any>, ratio: number) {
    return units.find((unit) => unit.ratio == ratio);
  }

  // Getter to access google_shopping FormGroup
  get googleShopping(): FormGroup {
    return this.editProductForm.get('google_shopping') as FormGroup;
  }

  // Getter to access additional_image_links FormArray
  get additionalImageLinksControls() {
    return (this.googleShopping.get('additional_image_links') as any).controls as FormControl[];
  }


  /** Hàm thực hiện cập nhật dữ liệu thay đổi của sản phẩm
   *
   * @param field trường cập nhật
   * @param objectUpdate dữ liệu cập nhật. Vd: {field: 'aaa'}
   */
  updateProduct(field: string, objectUpdate) {
    if (!objectUpdate[field] && this.editProductForm.get(field)?.errors?.required) return;

    objectUpdate.updated_at = new Date().toISOString();
    if (!objectUpdate.created_at) objectUpdate.created_at = new Date().toISOString();

    if (
      ['barcode', 'price', 'price2', 'price_import', 'webapp_price_sales'].includes(field) || field.startsWith('unit_')
    ) {
      const { barcode } = this.editProductForm.value;
      const unitsNew = this.editProductForm.value.units;

      // Lấy tất cả các trường bắt đầu bằng "unit_"
      const unitFields = Object.keys(this.editProductForm.value).filter((key) =>
        key.startsWith('unit_')
      );

      // Tìm index của phần tử có ratio === 1
      const index = unitsNew.findIndex(({ ratio }) => ratio === 1);

      // Tạo dữ liệu mới với từng trường `unit_*` tách riêng
      const data: any = {
        barcode,
        ratio: 1,
        price: parseFloat(this.price.getRawValue()),
        price2: parseFloat(this.price_2.getRawValue()),
        price_import: parseFloat(this.price_import.getRawValue()),
        webapp_price_sales: parseFloat(this.price_sales.getRawValue()),
        default: unitsNew[index].default,
      };

      // Thêm từng trường `unit_*` vào object `data`
      unitFields.forEach((unitField) => {
        data[unitField] = this.editProductForm.value[unitField];
      });

      // Cập nhật lại `unitsNew`
      unitsNew.splice(index, 1, data);
      objectUpdate = { units: unitsNew };
    }

    if (field == 'imgs') {
      objectUpdate = {
        imgs: this.listImgProduct.map((item) => item.path),
      };
    }

    if (field == 'youtube_url') {
      objectUpdate = {
        youtube_url: this.formatEmbedUrl(this.editProductForm.get(field).value),
      }
    }

    if (field == 'link') {
      // check link only have a-z and không dấu, 0-9, - if not return error
      if (!/^[a-zA-Z0-9-]*$/.test(objectUpdate.link.trim())) {
        this.functionService.createMessage('error', this.languageService.translate('link_chi_duoc_phep_chua_a_z_0_9_va_dau_gach_ngang'));
        return;
      }

      this.vhQueryAutoWeb.getProducts_byFields({ link: { $eq: objectUpdate.link.trim() } })
        .then((res: any) => {
          if (res.vcode === 0) {
            if (res.data.length > 0) {
              this.functionService.createMessage('error', 'duong_dan_da_ton_tai');
              return;
            }
            this.vhQueryAutoWeb.updateProduct(this.data.dataEditProduct._id, objectUpdate).then(
              (res: any) => {
                if (res.vcode === 11) {
                  this.functionService.createMessage(
                    'error',
                    'phien_dang_nhap_da_het_han_vui_long_dang_nhap_lai'
                  );
                }
              },
              (err) => {
                this.functionService.createMessage(
                  'error',
                  'da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu_vui_long_thu_lai'
                );
              }
            );
          }
        });
    } else {
      this.vhQueryAutoWeb.updateProduct(this.data.dataEditProduct._id, objectUpdate).then(
        (res: any) => {
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
            this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_cap_nhat_du_lieu')
          );
        }
      );
    }
  }

  updateNewField(field, value) {

    this.vhQueryAutoWeb.updateProduct(this.data.dataEditProduct._id, { [field]: value }).then(
      (res: any) => {
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
          this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_cap_nhat_du_lieu')
        );
      }
    );
  }

  /** Hàm cập nhật dữ liệu thuộc tính sản phẩm
   *
   * @param field  trường cập nhật
   * @param objectUpdate  dữ liệu cập nhật. Vd: {field: 'aaa'}
   */
  updateSubProduct(field: string, objectUpdate) {
    if (['barcode', 'price', 'price2', 'price_import', 'webapp_price_sales'].includes(field) || field.startsWith('unit_')) {
      const { barcode, ...rest } = this.formSubProduct.value;
      const unitsNew = this.formSubProduct.value.units;
      const index = unitsNew.findIndex(({ ratio }) => ratio === 1);

      // Lấy tất cả các trường bắt đầu bằng 'unit_'
      const unitFields = Object.keys(rest)
        .filter((key) => key.startsWith('unit_'))
        .reduce((acc, key) => {
          acc[key] = rest[key];
          return acc;
        }, {});

      // Tạo object `data` bao gồm các trường cần thiết
      const data = {
        barcode,
        ratio: 1,
        price: parseFloat(this.priceSubProduct?.getRawValue() || 0),
        price2: parseFloat(this.price2SubProduct?.getRawValue() || 0),
        price_import: parseFloat(this.priceImportSubProduct?.getRawValue() || 0),
        webapp_price_sales: parseFloat(this.priceSalesSubProduct?.getRawValue() || 0),
        default: unitsNew[index]?.default || false,
        ...unitFields, // Thêm các trường `unit_` vào đây
      };

      // Cập nhật unitsNew
      unitsNew.splice(index, 1, data);
      objectUpdate = { units: unitsNew };
    }

    delete objectUpdate.price;
    delete objectUpdate.price2;
    delete objectUpdate.price_import;
    // Xóa tất cả các field bắt đầu bằng 'unit_'
    Object.keys(objectUpdate).forEach((key) => {
      if (key.startsWith('unit_')) {
        delete objectUpdate[key];
      }
    });
    delete objectUpdate.webapp_price_sales;
    delete objectUpdate.barcode;
    delete objectUpdate._id;
    delete objectUpdate.name_textsearch;
    delete objectUpdate.price_search;

    this.vhQueryAutoWeb
      .updateSubProduct(this.formSubProduct.value._id, objectUpdate)
      .then(
        (res: any) => {
          if (res.vcode === 0) {
            this.functionService.createMessage('success', this.languageService.translate('cap_nhat_san_pham_thanh_cong'));
          }
          if (res.vcode === 11) {
            this.functionService.createMessage(
              'error',
              this.languageService.translate('phien_dang_nhap_da_het_han')
            );
          }
        },
        (error) => {
          this.functionService.createMessage(
            'error',
            this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_cap_nhat_du_lieu')
          );
        }
      );
  }

  public unitByRatio1: any = {}; // Đơn vị chính
  /** Hàm thực hiện khởi tạo form sub-product và mở popup thêm sub-product
   *
   */
  openFormAddSubProduct() {
    this.initFormSubProduct();

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
        formLotProduct: this.formAddLotProduct,
        days_exp_warning: this.days_exp_warning,
        // itemLots: this.itemLots,
        formEditLotProduct: this.formEditLotProduct,
        addProductForm: this.editProductForm,
        postionEditLotProduct: this.postionEditLotProduct,
        unitByRatio1: this.unitByRatio1,
        units: this.units,
        priceSubProduct: this.priceSubProduct,
        priceImportSubProduct: this.priceImportSubProduct,
        price2SubProduct: this.price2SubProduct,
        priceSalesSubProduct: this.priceSalesSubProduct,
        listBarcode: this.listBarcode
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.handleAddSubProduct();
      }
    });
  }

  /** Hàm thực hiện khởi tạo form sub-product và mở popup sửa sub-product
   *
   * @param subproduct: dữ liệu sub-product chọn sửa
   * @param index: vị trí sub-product trong mảng sub-product của sản phẩm đang chọn
   */
  openFormEditSubProduct(subproduct, index): void {
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
        formLotProduct: this.formAddLotProduct,
        days_exp_warning: this.days_exp_warning,
        formEditLotProduct: this.formEditLotProduct,
        addProductForm: this.editProductForm,
        postionEditLotProduct: this.postionEditLotProduct,
        unitByRatio1: this.unitByRatio1,
        units: this.units,
        priceSubProduct: this.priceSubProduct,
        priceImportSubProduct: this.priceImportSubProduct,
        price2SubProduct: this.price2SubProduct,
        priceSalesSubProduct: this.priceSalesSubProduct,
        listBarcode: this.listBarcode,
        warningNumberSubProduct: this.warningNumberSubProduct,
        daysImportWarningSubProduct: this.daysImportWarningSubProduct,
        daysExpWarningSubProduct: this.daysExpWarningSubProduct,
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.handleEditSubProduct();
      }
    });

  }

  handleEditSubProduct() {
    const objectUpdate = { ...this.formSubProduct.value };

    objectUpdate.warning_number = parseFloat(this.warningNumberSubProduct.getRawValue() || 0);

    const unitByRatio1 = objectUpdate.units.find((unit) => unit.ratio === 1);
    if (unitByRatio1) {

      unitByRatio1.price = parseFloat(this.priceSubProduct.getRawValue() || 0);
      unitByRatio1.price2 = parseFloat(this.price2SubProduct.getRawValue() || 0);
      unitByRatio1.price_import = parseFloat(this.priceImportSubProduct.getRawValue() || 0);
      unitByRatio1.webapp_price_sales = parseFloat(this.priceSalesSubProduct.getRawValue() || 0);
      unitByRatio1.barcode = this.formSubProduct.value.barcode;

      Object.keys(objectUpdate).forEach((key) => {
        if (key.startsWith('unit_')) {
          unitByRatio1[key] = objectUpdate[key];
        }
      });

    }


    delete objectUpdate.price;
    delete objectUpdate.price2;
    delete objectUpdate.price_import;
    Object.keys(objectUpdate).forEach((key) => {
      if (key.startsWith('unit_')) {
        delete objectUpdate[key];
      }
    });
    delete objectUpdate.webapp_price_sales;
    delete objectUpdate.barcode;
    delete objectUpdate._id;
    delete objectUpdate.name_textsearch;
    delete objectUpdate.price_search;


    this.vhQueryAutoWeb
      .updateSubProduct(this.formSubProduct.value._id, objectUpdate)
      .then(
        (res: any) => {
          if (res.vcode === 0) {
            this.subProducts = this.subProducts.map((map, index) => index === this.indexEditFormSubProduct ? {
              ...this.formSubProduct.value,
              price: parseFloat(this.priceSubProduct.getRawValue() || 0),
              price2: parseFloat(this.price2SubProduct.getRawValue() || 0),
              price_import: parseFloat(this.priceImportSubProduct.getRawValue() || 0),
              webapp_price_sales: parseFloat(this.priceSalesSubProduct.getRawValue() || 0),
              warning_number: parseFloat(this.warningNumberSubProduct.getRawValue() || 0),
            }
              :
              map);
            this.functionService.createMessage('success', this.languageService.translate('cap_nhat_san_pham_thanh_cong'));
          }
          if (res.vcode === 11) {
            this.functionService.createMessage('error', this.languageService.translate('phien_dang_nhap_da_het_han'));
          }
        },
        (error) => {
          console.error(error);
          this.functionService.createMessage('error', this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_cap_nhat_du_lieu'));
        }
      );
  }



  /** Hàm thực hiện thêm sub-product vào sản phẩm chỉnh sửa
   *
   */
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
        ),
      };
      dataSub.units = [
        {
          ...Object.keys(dataSub)
            .filter((key) => key.startsWith('unit_'))
            .reduce((obj, key) => ({ ...obj, [key]: dataSub[key] }), {}),
          ratio: 1,
          price: parseFloat(dataSub.price),
          price2: parseFloat(dataSub.price2),
          price_import: parseFloat(dataSub.price_import),
          barcode: dataSub.barcode,
          webapp_price_sales: parseFloat(dataSub.webapp_price_sales),
          default: this.units.length > 1 ? this.units[0].default : true,
        },
        ...this.units.filter((filter) => filter.ratio != 1),
      ];

      if (dataSub.manylot) {
        dataSub.lots = this.formSubProduct.value.lots;
        dataSub.days_import_warning = this.parseStringToNumber(this.formSubProduct.value.days_import_warning);
        dataSub.days_exp_warning = this.parseStringToNumber(this.formSubProduct.value.days_exp_warning);
      }
      this.vhQueryAutoWeb.addSubProduct(this.data.dataEditProduct._id, dataSub).then(
        (res: any) => {
          this.subProducts = [...this.subProducts, { ...dataSub, _id: res.data._id }];
        },
        (error) => {
          this.functionService.createMessage(
            'error',
            this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_cap_nhat_du_lieu')
          );
        }
      );
    }
  }

  parseStringToNumber(value: string): number {
    if (!value) return 0;
    if (typeof value !== 'string') return 0;
    if (typeof value == 'number') return value;
    return Number(value.replace(/,/g, ''));
  }

  /** Hàm này thực hiện khởi tạo form sub-product
   *
   * @param subproduct: subproduct được khởi tạo
   */
  initFormSubProduct(subproduct?: any) {
    this.lots = [];
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
    };

    // Tạo form với các controls đã tối ưu
    this.formSubProduct = new FormGroup(controls);
    if (subproduct) {
      this.formSubProduct.addControl('_id', createControl(subproduct._id, [Validators.required]));

      if (subproduct.manylot && subproduct.lots?.length > 0) {
        this.formSubProduct.addControl('lots', createControl(subproduct.lots || []));
        this.formSubProduct.addControl(
          'days_import_warning',
          createControl(subproduct.days_import_warning || 0, [Validators.required])
        );
        this.formSubProduct.addControl(
          'days_exp_warning',
          createControl(subproduct.days_exp_warning || 0, [Validators.required])
        );
        this.lots = subproduct.lots;
      }
    }

    this.clearjsSubProduct();
  }

  /** Hàm thực hiện mở popup danh sách đơn vị của sup-product
   *
   */
  openUnitsSubProduct() {
    const unitByRatio1 = this.functionService.multi_languages.reduce((acc: any, language: any) => {
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
      this.units = [unitByRatio1];
    } else {
      this.units = this.units.filter((filter) => filter.ratio != 1);
      this.units = [unitByRatio1, ...this.units];
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

  /** Hàm thực hiện xóa sub-product trong sản phẩm
   *
   * @param sub: sub-product xóa
   */
  deleteSubProduct(sub): void {
    this.vhComponent
      .alertConfirm('', this.languageService.translate('xac_nhan_xoa_thuoc_tinh_san_pham') + '?', sub[`name_${this.functionService.defaultLanguage}`], this.languageService.translate('dong_y'), this.languageService.translate('thoat'))
      .then(
        (ok) => {
          if (ok == 'OK') {
            this.vhQueryAutoWeb.deleteSubProduct(sub._id)
              .then((res: any) => {
                if (res.vcode != 0) return this.functionService.createMessage('error', res.message);
                this.subProducts = this.subProducts.filter((item) => item[`name_${this.functionService.defaultLanguage}`] !== sub[`name_${this.functionService.defaultLanguage}`]);
                this.functionService.createMessage('success', 'xoa_san_pham_thanh_cong');
              },
              )
              .catch((error) => {
                console.error('error', error);
                this.functionService.createMessage('error', 'da_xay_ra_loi_trong_qua_trinh_xoa_du_lieu_vui_long_thu_lai');
              });
          }
        },
        (error) => {
          console.error(error);
        }
      );

  }

  /** Hàm thực hiện đóng popup chỉnh sửa sản phẩm
   *
   */
  close() {
    let product = {
      ...this.data.dataEditProduct,
      ...this.editProductForm.value,
    };
    if (product.manysize) {
      product.subs = this.subProducts;
    } else {
      this.subProducts = [];
      if (product.manylot) {
        product.lots = this.lots;
      }
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

    if (product.youtube_url?.trim() && this.identifyYoutubeType(product?.youtube_url) !== 'EMBED_LINK') {
      product.youtube_url = this.formatEmbedUrl(product.youtube_url);
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
    this.dialogRef.close(product);
  }

  /** Hàm này thực khởi tạo form thêm lô và mở popup
   *
   */
  openFormAddLotProduct() {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10);
    this.formAddLotProduct = this.formBuilder.group({
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
        formLotProduct: this.formAddLotProduct,
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.handleAddLotProduct();
      }
    });


  }

  /** Hàm này thực hiện khởi tạo form sửa lô và mở popup
   *
   * @param lot
   * @param index
   */
  openEditLotProduct(lot, index) {
    this.formEditLotProduct = new FormGroup({
      lot_number: new FormControl(lot.lot_number, [Validators.required]),
      barcode: new FormControl(lot.barcode),
      date_mfg: new FormControl(lot.date_mfg, [Validators.required]),
      date_exp: new FormControl(lot.date_exp, [Validators.required]),
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

  /** Hàm này thực hiện mở danh sách đơn vị
   *
   */
  openUnits() {
    const unitByRatio1 = this.functionService.multi_languages.reduce((acc: any, language: any) => {
      acc[`unit_${language.code}`] = this.editProductForm.value[`unit_${language.code}`];
      acc[`name_${language.code}`] = this.editProductForm.value[`name_${language.code}`];
      return acc;
    }, {
      ratio: 1,
      barcode: this.editProductForm.value.barcode,
      price: parseFloat(this.price.getRawValue() || 0),
      price2: parseFloat(this.price_2.getRawValue() || 0),
      price_import: parseFloat(this.price_import.getRawValue() || 0),
      webapp_price_sales: parseFloat(this.price_sales.getRawValue() || 0),
      default: this.units.length > 1 ? this.units.find(unit => unit.ratio == 1).default : true,
    });

    if (this.units.length === 0) {
      this.units = [unitByRatio1];
    } else {
      this.units = this.units.filter((filter) => filter.ratio != 1);
      this.units = [unitByRatio1, ...this.units];
    }
    if (this.units.length === 1) this.units[0].default = true;
    // this.listBarcode = !this.addProductForm.value.manysize
    //   ? [
    //     this.addProductForm.value.barcode,
    //     ...this.units.map((item) => item.barcode),
    //     ...this.lots.map((lot) => lot.barcode),
    //   ]
    //   : [];

    // this.openComponentUnits = !this.openComponentUnits;
    // console.log('unitRatio1', unitRatio1);
    // console.log('this.units 1', this.units);
    // this.units.splice(0, 1, unitRatio1);
    // console.log('this.units 2', this.units);

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
    this.units = event;
    if (this.formSubProduct?.value._id) {
      this.updateSubProduct('units', { units: this.units });
      this.formSubProduct.controls['units'].setValue(this.units);
    } else {
      this.updateProduct('units', { units: this.units });
      this.editProductForm.controls['units'].setValue(this.units);
    }
    // this.openComponentUnits = !this.openComponentUnits;
  }

  /** Hàm thực hiện cập nhật lại dữ liệu các trương khi chuyển từ manylot: true/ false
   *
   * @param e
   */
  changeManyLotSubProduct(e) {
    if (!e) {
      this.formSubProduct.removeControl('days_exp_warning');
      this.formSubProduct.removeControl('days_import_warning');
      if (this.formSubProduct.value.lots)
        this.formSubProduct.removeControl('lots');
    } else {
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

  /** Hàm thực hiện sửa lô sản phẩm
   *
   */
  handleEditLotProduct() {
    if (this.formEditLotProduct.valid) {
      const editData = { ...this.formEditLotProduct.value };
      this.lots = [
        ...this.lots.slice(0, this.postionEditLotProduct),
        editData,
        ...this.lots.slice(this.postionEditLotProduct + 1),
      ];


      if (this.formSubProduct?.value._id) {
        this.updateSubProduct('lots', { lots: this.lots });
        this.formSubProduct.controls['lots'].setValue(this.lots);
      } else {
        this.updateProduct('lots', { lots: this.lots });
        this.editProductForm.controls['lots'].setValue(this.lots);
      }

    }
  }

  /** Hàm thực hiện thêm lô sản phẩm
   *
   */
  handleAddLotProduct() {
    if (this.formAddLotProduct.valid) {
      let dataLot = {
        ...this.formAddLotProduct.value,
      };
      this.lots = [dataLot, ...this.lots];
      if (this.formSubProduct?.value._id) {
        this.updateSubProduct('lots', { lots: this.lots });
        this.formSubProduct.controls['lots'].setValue(this.lots);
      } else {
        this.updateProduct('lots', { lots: this.lots });
        this.editProductForm.controls['lots'].setValue(this.lots);
      }
    }
    this.visibleFormLotProduct = !this.visibleFormLotProduct;
  }

  /** Hàm này thực hiện xóa lô
   *
   * @param indexLot
   */
  openDeleteLotProduct(lot, indexLot) {
    if (this.lots.length == 1)
      return this.functionService.createMessage(
        'error',
        'danh_sach_lo_khong_the_trong'
      );

    this.vhComponent
      .alertConfirm('', this.languageService.translate('xac_nhan_xoa_lo_san_pham') + '?', lot.lot_number, this.languageService.translate('dong_y'), this.languageService.translate('thoat'))
      .then(
        (ok) => {
          if (ok == 'OK') {
            this.lots = this.lots.filter((filter, index) => index == indexLot);
            if (this.formSubProduct?.value._id) {
              this.updateSubProduct('lots', { lots: this.lots });
              this.formSubProduct.controls['lots'].setValue(this.lots);
            } else {
              this.updateProduct('lots', { lots: this.lots });
              this.editProductForm.controls['lots'].setValue(this.lots);
            }
          }
        },
        (error) => {
          console.error(error);
        }
      );
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
      const targetForm = this.visibleFormLotProduct
        ? this.formAddLotProduct
        : !this.editProductForm.value.manysize
          ? this.editProductForm
          : this.formSubProduct;
      targetForm.controls['barcode'].setValue(newbarcode);
      if (!this.editProductForm.value.manysize) {
        this.updateProduct('barcode', { barcode: newbarcode });
      }
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
      width: '60vw',
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
        this.updateProduct('imgs', { img: this.listImgProduct });
      } else {
        this.listImgNewFields[field] = event.imgs;
        this.updateProduct(field, { [field]: this.listImgNewFields[field] });
      }
    }
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
    return this.editProductForm.get(controlName) as FormControl;
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
        formData: this.editProductForm,
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


  pathFile = '/images/database/products';
  openFromLibrary(index: number, type: string | 'reference_links' | 'additional_image_links' | 'image_link' = 'reference_links'): void {
    const dialogRef = this.matdialog.open(ManageLibraryComponent, {
      width: '85%',
      maxWidth: '100%',
      disableClose: true,
      data: {
        startPath: this.pathFile ? this.pathFile : '/images/database/products',
        scopeData: '/images',
      },
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data.href) {
        if (type === 'reference_links') {
          this.reference_links[`link${index}`] = data.href;
          this.updateReferenceLinks();
        } else if (type === 'additional_image_links') {
          const pos = index - 1;
          const arr = this.googleShopping.get('additional_image_links');
          if (arr && pos >= 0 && pos < 10) {
            (arr as any).at(pos).setValue(data.href);
          }
          this.updateProduct('google_shopping', { google_shopping: this.editProductForm.value.google_shopping });
        } else if (type === 'image_link') {
          this.googleShopping.get('image_link')?.setValue(data.href);
          this.updateProduct('google_shopping', { google_shopping: this.editProductForm.value.google_shopping });
        }
      }
      this.pathFile = data.path;
    });
  }

  updateReferenceLinks() {
    this.vhQueryAutoWeb.updateProduct(this.data.dataEditProduct._id, { reference_links: Object.values(this.reference_links) });
  }

  handleEditCkeditor(item) {
    const dialogRef = this.matdialog.open(VhCkeditorModalComponent, {
      width: '60vw',
      height: '80vh',
      data: {
        formData: this.editProductForm,
        item: item,
        type: 'products' // để phân biệt upload ảnh cho danh mục hay sản phẩm
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.updateDynamicField(item.field_custom, this.editProductForm.get(item.field_custom + '_' + this.functionService.languageTempCode).value);
    });
  }

  getContentSafeHtml(field: string): any {
    const rawHtml = this.getFormControl(field).value;
    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  }

  // Tạo dữ liệu Google Shopping từ setup_fields_google_shopping
  generateGoogleShoppingData() {
    const enabled = this.editProductForm.value.google_shopping_enable;

    // Nếu chưa bật thì không cho tạo, tuỳ bạn muốn warning hay im lặng
    if (!enabled) {
      // Ví dụ dùng notification:
      // this.notification.warning('Thông báo', 'Bạn cần bật Google Shopping trước.');
      return;
    }

    if (!this.setup_fields_google_shopping) {
      return;
    }

    const formData = this.editProductForm.value;
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
    this.editProductForm.patchValue({
      google_shopping: googleShoppingData
    });

    // Cập nhật lên server
    this.updateProduct('google_shopping', {
      google_shopping: googleShoppingData
    })
    this.functionService.createMessage('success', this.languageService.translate('cap_nhat_du_lieu_thanh_cong'));
  }

  getSetup() {
    this.vhQueryAutoWeb.getSetups_byFields({ type: 'fields_google_shopping', mainSector: 'ecommerce' }).then((res: any) => {
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
  selectedIndexTabset = 0;
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
   * @param input
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
    const value = this.editProductForm.get(field)?.value;

    // trường hợp chỉ điền khoảng cách
    if (!value?.trim()) {
      this.editProductForm.patchValue({ [field]: '' });
    }

    switch (field) {
      case 'youtube_url': 
        if (value.trim()) {
          const embedUrl = this.formatEmbedUrl(value);
          this.editProductForm.patchValue({ youtube_url: embedUrl });
          this.updateProduct(field, { [field]: embedUrl });
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
