import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhImage, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import { AddCategoryComponent } from '../../categories/add-category/add-category.component';
import { LanguageService } from 'src/app/services/language.service';
import { DescriptionByDeviceComponent } from '../../components/dialog/description-by-device/description-by-device.component';
import { VhCkeditorModalComponent } from '../../components/vh-ckeditor-modal/vh-ckeditor-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
@Component({
  selector: 'app-add-service',
  templateUrl: './add-service.component.html',
  styleUrls: ['./add-service.component.scss'],
})
export class AddServiceComponent implements OnInit {

  content: any = '';

  public addProductForm: FormGroup;
  public editProduct;
  public categoryProduct;
  public price: any;
  public price_sales: any;
  public warning_number: any;
  public barcode: boolean = false;
  public category: any;
  public listImgProduct: Array<any> = [];
  path: any = '';
  public selectedListCategory = [];
  public categories: any = [];
  newFields = [];
  newFieldsCKEditor = [];
  doneLoad = false;
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


  constructor(
    public dialogRef: MatDialogRef<AddServiceComponent>,
    public vhAlgorithm: VhAlgorithm,
    private el: ElementRef,
    public dialog: MatDialog,
    public functionService: FunctionService,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public vhImage: VhImage,
    public languageService: LanguageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer

  ) { }

  ngOnInit(): void {
    this.categories = this.data.categories.filter(c => c._id != 'all');
    this.getNewFields();
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
        this.initForm();
      });
  }


  /** Hàm khởi tạo form
   *
   */
  initForm(): void {
    this.addProductForm = new FormGroup({
      price: new FormControl(0, Validators.compose([Validators.required, Validators.pattern('(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)')])),
      units: new FormControl([]),
      barcode: new FormControl(''),
      allow_sell: new FormControl(true),
      selling: new FormControl(true),
      type: new FormControl(2),
      warning_number: new FormControl(0),
      id_categorys: new FormControl([]),
      webapp_price_sales: new FormControl(0, Validators.compose([Validators.required, Validators.pattern('(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)')])),
      webapp_hidden: new FormControl(false),
      webapp_seo_title: new FormControl(''),
      webapp_seo_description: new FormControl(''),
      webapp_seo_keyword: new FormControl(''),
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
      this.addProductForm.addControl(field.field_custom, new FormControl(field.field_start_value || [], field.field_required ? [Validators.required] : []));
    });


    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminAddHandleChangeMultiLanguage(
        this.addProductForm,
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
      this.price_sales = this.vhAlgorithm.vhnumeral('.price_sales');
    });
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

  backPageFn(): void {
    this.dialogRef.close(true);
  }

  onSubmitAddProduct(value): void {
    this.submitting = true;
    this.functionService.showLoading(this.languageService.translate('dang_them'));

    const product = {
      ...value,
      imgs: this.listImgProduct.map((item) => item.path),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.addProductForm.valid) {
      product.link = this.functionService.nonAccentVietnamese(product[`name_${this.functionService.defaultLanguage}`].trim());
      product.link = product.link.replace(/[^a-z0-9-]/g, '');
      this.vhQueryAutoWeb
        .getServices_byFields({ link: { $eq: product.link } })
        .then(
          (response: any): void => {
            if (response.vcode === 0 && response.data.length !== 0) {
              product.link = product.link + '-1';
            }

            // Khởi tạo mảng units
            product['units'] = [
              {
                ratio: 1,
                default: true,
                price: parseFloat(this.price.getRawValue()),
                webapp_price_sales: parseFloat(
                  this.price_sales.getRawValue()
                ),
                barcode: '',
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
              if (key == 'ratio' || key == 'price' || key == 'webapp_price_sales' || key == 'barcode' || key.startsWith('unit_')) {
                delete product[key];
              }
            });
            this.vhQueryAutoWeb.addService(product).then(
              (res: any) => {
                if (res.vcode === 0) {
                  this.functionService.createMessage(
                    'success',
                    this.languageService.translate('them_dich_vu_thanh_cong')
                  );
                  let dataClose = { ...res.data };
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
                  this.languageService.translate('co_loi_vui_long_thu_lai')
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
    } else {
      this.functionService.createMessage('error', this.languageService.translate('vui_long_dien_du_thong_tin'));
    }
  }

  close(): void {
    this.dialogRef.close(false);
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
      const targetForm = this.addProductForm;
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
    }
  }


  selectChange(event, field) {
    this.addProductForm.controls[field].setValue(event);
  }

  getFormControl(controlName: string): FormControl {
    return this.addProductForm.get(controlName) as FormControl;
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

  handleEditCkeditor(item) {
    const dialogRef = this.dialog.open(VhCkeditorModalComponent, {
      width: '60vw',
      height: '80vh',
      data: {
        formData: this.addProductForm,
        item: item,
        type: 'services' // để phân biệt upload ảnh cho danh mục hay sản phẩm
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

    editor.plugins.get('FileRepository').createUploadAdapter = (
      loader: any
    ) => {
      return this.vhImage.MyUploadImageAdapter(loader, 'images/database/services');
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

  ngOnDestroy() {
    for (const { element, event, handler } of this.editorListeners) {
      element.removeEventListener(event, handler);
    }
    this.editorListeners = [];
  }
}
