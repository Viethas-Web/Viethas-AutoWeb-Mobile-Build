import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb, VhImage } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import { LanguageService } from 'src/app/services/language.service';
import { AddCategoryComponent } from '../../categories/add-category/add-category.component';
import { DescriptionByDeviceComponent } from '../../components/dialog/description-by-device/description-by-device.component';
import { DomSanitizer } from '@angular/platform-browser';
import { VhCkeditorModalComponent } from '../../components/vh-ckeditor-modal/vh-ckeditor-modal.component';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
@Component({
  selector: 'app-edit-service',
  templateUrl: './edit-service.component.html',
  styleUrls: ['./edit-service.component.scss'],
})
export class EditServiceComponent implements OnInit {
  public editProductForm: FormGroup;
  public price: any;
  public price_2: any;
  public price_sales: any;
  public price_import: any;
  public days_import_warning: any;
  public days_exp_warning: any;
  public warning_number: any;
  public subProducts: any = [];
  public nameProduct: any;
  public listImgProduct: any = [];
  public lots: Array<any> = []; // Danh sách lô dịch vụ
  public formSubProduct: FormGroup;
  public listBarcode: Array<any> = [];
  public unitsSubProduct: Array<any> = [];
  public visibleFormSubProduct = false;
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
  public openComponentUnits = false;
  public units: Array<any> = []; // Mảng danh sách các đơn vị
  public path: any = ''; // Dùng để chứa đường dẫn ảnh trả về từ thư viện
  public formEditLotProduct: FormGroup;
  public visibleFormEditLotProduct = false;
  public postionEditLotProduct: number;
  public categories: any = [];
  newFields = [];
  newFieldsCKEditor = [];
  doneLoad = false;
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
    public dialogRef: MatDialogRef<EditServiceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public vhAlgorithm: VhAlgorithm,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    public vhImage: VhImage,
    public dialog: MatDialog,
    public languageService: LanguageService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.categories = this.data.categories.filter(c => c._id != 'all');
    this.getNewFields();

    // Lắng click ra ngoài (backdrop)
    // đoạn này để đóng mà modal và trả về result, nếu ko sẽ ko cập nhật giao diện
    this.dialogRef.backdropClick().subscribe(() => {
      this.close();
    });
  }
  getNewFields() {
    this.vhQueryAutoWeb.getNewFields_byFields({ id_main_sector: { $eq: 'service' } })
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
        this.getProduct();
      });
  }
  getProduct(): void {
    const product = this.data.dataEditService;
    this.nameProduct = product.name;
    this.initForm(product);
  }

  /** Hàm khởi tạo form
   *
   * @param value: object
   */
  initForm(product): void {
    const { languageTempCode, defaultLanguage } = this.functionService;
    this.editProductForm = new FormGroup({
      _id: new FormControl(product._id),
      id_categorys: new FormControl(product.id_categorys && product.id_categorys.length > 0 ? product.id_categorys : []),
      name: new FormControl(product.name, Validators.compose([Validators.required])),
      link: new FormControl(product.link, [Validators.required, Validators.pattern('^(?!.*[\\/\\\\])[a-z0-9-]+$')]),
      units: new FormControl(product.units),
      warning_number: new FormControl(product.warning_number),
      webapp_sort_description: new FormControl(product.webapp_sort_description),
      webapp_description: new FormControl(product.webapp_description),
      webapp_hidden: new FormControl(product.webapp_hidden),
      url_canonical: new FormControl(product.url_canonical || ''),
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
      this.editProductForm.addControl(field.field_custom, new FormControl(product[field.field_custom] || [], field.field_required ? [Validators.required] : []));
    });

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminEditHandleChangeMultiLanguage(
        this.editProductForm,
        language.code,
        [...this.newFields.filter((f: any) => f.field_input_type != "select-multiple"), ...this.newFieldsCKEditor],
        fieldNames,
        product,
        this.getUnitsByRatio.bind(this),
      );
    });

    if (product.units) {
      const unit = this.getUnitsByRatio(product.units, 1);
      const patternValidator = Validators.pattern(
        '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)'
      );

      // Các field cố định
      const fixedFields = [
        { name: 'price', value: unit?.price ?? 0 },
        { name: 'webapp_price_sales', value: unit?.webapp_price_sales ?? 0 },
        { name: 'barcode', value: unit?.barcode ?? '', validators: [] },
      ];

      // Thêm các field cố định
      fixedFields.forEach(({ name, value, validators = [Validators.required, patternValidator] }) => {
        this.editProductForm.addControl(
          name,
          new FormControl(value, Validators.compose(validators))
        );
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
    }
    if (product.imgs.length) {
      this.listImgProduct = product.imgs.map((map) => ({
        path: map,
        visible: false,
      }));
    }

    this.doneLoad = true;
    this.clearJs();
  }

  getUnitsByRatio(units: Array<any>, ratio: number) {
    return units.find((unit) => unit.ratio == ratio);
  }

  clearJs() {
    if (!this.data.dataEditService.subs) {
      this.vhAlgorithm.waitingStack().then(() => {
        this.price = this.vhAlgorithm.vhnumeral('.price');
        this.price_sales = this.vhAlgorithm.vhnumeral('.price_sales');
      });
    }
  }

  updateNewField(field, value) {

    this.vhQueryAutoWeb.updateService(this.data.dataEditService._id, { [field]: value }).then(
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


  /** Hàm thực hiện cập nhật dữ liệu thay đổi của dịch vụ
   *
   * @param field trường cập nhật
   * @param objectUpdate dữ liệu cập nhật. Vd: {field: 'aaa'}
   */
  updateService(field: string, objectUpdate) {
    objectUpdate.updated_at = new Date().toISOString();
    if (!objectUpdate.created_at) objectUpdate.created_at = new Date().toISOString();
    if (['barcode', 'price', 'webapp_price_sales'].includes(field) || field.startsWith('unit_')) {
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

    if (field == 'link') {
      // check link only have a-z and không dấu, 0-9, - if not return error
      if (!/^[a-zA-Z0-9-]*$/.test(objectUpdate.link.trim())) {
        this.functionService.createMessage('error', this.languageService.translate('link_chi_duoc_phep_chua_a_z_0_9_va_dau_gach_ngang'));
        return;
      }

      this.vhQueryAutoWeb.getServices_byFields({ link: { $eq: objectUpdate.link.trim() } })
        .then((res: any) => {
          if (res.vcode === 0) {
            if (res.data.length > 0) {
              this.functionService.createMessage('error', 'duong_dan_da_ton_tai');
              return;
            }

            this.vhQueryAutoWeb
              .updateService(this.data.dataEditService._id, objectUpdate)
              .then(
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
      this.vhQueryAutoWeb.updateService(this.data.dataEditService._id, objectUpdate).then(
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


  /** Hàm thực hiện đóng popup chỉnh sửa dịch vụ
   *
   */
  close() {
    let product = {
      ...this.data.dataEditService,
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

    Object.keys(product).forEach((key) => {
      if (key == 'manysize') {
        if (product[key] == true) {
          delete product['allow_sell'];
          delete product['selling'];
          delete product['warning_number'];
          delete product['subProducts'];
        }
      }
      const keysToDelete = [
        'ratio',
        'price',
        'price2',
        'price_import',
        'webapp_price_sales',
        'barcode',
      ];

      Object.keys(product).forEach(key => {
        if (keysToDelete.includes(key) || key.startsWith('unit_')) {
          delete product[key];
        }
      });
    });
    this.dialogRef.close(product);
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
      const targetForm = this.editProductForm;
      targetForm.controls['barcode'].setValue(newbarcode);
      this.updateService('barcode', { barcode: newbarcode });
    }
  }

  /** Hàm thực hiện check barcode tự động có hợp lệ không
   *
   * @param barcode
   * @returns true: barcode hợp lệ, false: barcode không hợp lệ
   */
  async checkBarcode(barcode: string): Promise<boolean> {
    try {
      const product = await this.vhQueryAutoWeb.getServices_byFields({
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
  /** Hàm nhận sự kiện trả về danh sách ảnh từ app-list-image
  *
  * @param event
  */
  sendImgs(event) {
    if (event) {
      this.listImgProduct = event.imgs;
      this.updateService('imgs', { img: this.listImgProduct });
    }
  }

  forcusInput() {
    setTimeout(() => {
      document.getElementById('inputSearch').focus();
    }, 500);

  }

  createCategory() {
    const dialogRef = this.dialog.open(AddCategoryComponent, {
      width: '50vw',
      height: '60vh',
      disableClose: true,
      data: {
        categories: this.categories,
        setupCategoryImg: this.data.setupCategoryImg
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.id_main_sectors.includes('service')) {
        this.data.categories.push(result);
        this.categories = [...this.categories, result];
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

  selectChange(event, field) {
    this.editProductForm.controls[field].setValue(event);
    this.updateService(field, { [field]: event });
  }



  updateDynamicField(fieldKey: string, value: any) {
    const dynamicKey = fieldKey + '_' + this.functionService.languageTempCode;
    const updatedValue = { [dynamicKey]: value };
    this.updateService(dynamicKey, updatedValue);
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

    const dialogRef = this.dialog.open(DescriptionByDeviceComponent, {
      width: '70vw',
      height: '80vh',
      disableClose: true,
      data: {
        formData: this.editProductForm,
        tabs: [{ title: 'mo_ta_chi_tiet', field: "webapp_description" }, { title: 'mo_ta_ngan', field: "webapp_sort_description" }],
        callUpdate: this.updateService.bind(this)
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
      }
    });
  }


  handleEditCkeditor(item) {
    const dialogRef = this.dialog.open(VhCkeditorModalComponent, {
      width: '60vw',
      height: '80vh',
      data: {
        formData: this.editProductForm,
        item: item,
        type: 'services' // để phân biệt upload ảnh cho danh mục hay sản phẩm
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
      this.vhImage.MyUploadImageAdapter(loader, `images/database/services`);
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
