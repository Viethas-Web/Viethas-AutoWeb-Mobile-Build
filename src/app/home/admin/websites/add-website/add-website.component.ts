import { Component, ElementRef, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb, VhImage } from 'vhautowebdb';
import { AddCategoryComponent } from '../../categories/add-category/add-category.component';
import { LanguageService } from 'src/app/services/language.service';
import { FunctionService, ManageLibraryComponent } from 'vhobjects-service';
import { DescriptionByDeviceComponent } from '../../components/dialog/description-by-device/description-by-device.component';
import { VhCkeditorModalComponent } from '../../components/vh-ckeditor-modal/vh-ckeditor-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
@Component({
  selector: 'app-add-website',
  templateUrl: './add-website.component.html',
  styleUrls: ['./add-website.component.scss'],
})
export class AddWebsiteComponent implements OnInit {
  @Output() submitAddWebsite = new EventEmitter();
  public addWebsiteForm: FormGroup;
  public warning_number: any;
  public category: any;
  public categories: any = [];
  public img: string = '';
  public listImgProduct: Array<any> = [];
  public selectedListCategory = [];
  public selectedIndexTabset = 0;
  public imgIFrames: Array<any> = [];
  public imgIFrame: any = {
    path: '',
  };
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
    public vhAlgorithm: VhAlgorithm,
    public functionService: FunctionService,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public vhImage: VhImage,
    public dialog: MatDialog,
    private el: ElementRef,
    public languageService: LanguageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddWebsiteComponent>,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit(): void {
    this.categories = this.data.categories.filter(c => c._id != 'all');
    this.getNewFields();
  }


  getNewFields() {
    this.vhQueryAutoWeb.getNewFields_byFields({ id_main_sector: { $eq: 'webapp' } })
      .then((newfields: any) => {
        this.newFields = newfields;
        this.newFields.forEach((field: any) => {
          if (!field.hasOwnProperty('field_input_location')) {
            field.field_input_location = 'admin';
            field.field_input_type = 'input';
            field.field_display_type = 'text';
          }
        });
        this.newFields = this.vhAlgorithm.sortNumberbyASC(newfields, 'field_order_number').filter(e => !e.display_type || e.display_type == 'text');
        this.newFieldsCKEditor = this.vhAlgorithm.sortNumberbyASC(newfields, 'field_order_number').filter(e => e.display_type == 'ckeditor');
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


  /** Hàm khởi tạo form
   *
   */
  initForm(): void {
    this.imgIFrames = [...this.imgIFrames, this.imgIFrame];
    this.addWebsiteForm = new FormGroup({
      barcode: new FormControl(''),
      type: new FormControl(11),
      id_categorys: new FormControl([]),
      link_website_demo: new FormControl(
        '',
        Validators.compose([Validators.required])
      ),
      id_subproject: new FormControl(''),
      webapp_hidden: new FormControl(false),
      date_update: new FormControl(new Date()),
      quantity: new FormControl(''),
      version: new FormControl(''),
      id_main_sector: new FormControl('webapp'),
      price: new FormControl(1990000),
      webapp_price_sales: new FormControl(10000000),
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
      { field: 'name', validators: { required: true } },
      { field: 'webapp_sort_description', validators: { required: false } },
      { field: 'webapp_description', validators: { required: false } },
      { field: 'webapp_seo_title', validators: { required: false } },
      { field: 'webapp_seo_description', validators: { required: false } },
      { field: 'webapp_seo_keyword', validators: { required: false } },
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

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminAddHandleChangeMultiLanguage(
        this.addWebsiteForm,
        language.code,
        [...this.newFields, ...this.newFieldsCKEditor],
        fieldNames,
      );
    });

    this.doneLoad = true;

    this.vhAlgorithm.waitingStack().then(() => {
      this.vhAlgorithm.vhnumeral('.price');
      this.vhAlgorithm.vhnumeral('.webapp_price_sales');
    });
  }

  /** Hàm thực hiện thêm liên kết
   *
   */
  addIFrame() {
    this.imgIFrame = {
      path: '',
    };
    this.imgIFrames = [...this.imgIFrames, this.imgIFrame];
  }

  /** Hàm thực xóa đường dẫn liên kết
   *
   * @param position
   */
  deleteIFrame(position: number) {
    this.imgIFrames = this.imgIFrames.filter((_, index) => index != position);
  }

  backPageFn(): void {
    this.submitAddWebsite.emit(false);
  }

  onSubmitAddProduct(value): void {
    this.submitting = true;
    this.functionService.showLoading(this.languageService.translate('dang_them'));

    const product = {
      ...value,
      sub_type: 1,
      imgs: this.listImgProduct.map((item) => item.path),
      img_iframes: this.imgIFrames.filter((filter) => filter.path.length),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.addWebsiteForm.valid) {
      product.link = this.functionService.nonAccentVietnamese(product['name_' + this.functionService.defaultLanguage].trim());
      product.link = product.link.replace(/[^a-z0-9-]/g, '');
      this.vhQueryAutoWeb
        .getWebApps_byFields({ link: { $eq: product.link } })
        .then(
          (response: any): void => {
            if (response.vcode === 0 && response.data.length !== 0) {
              product.link = product.link + '-1';
            }

            const units = [
              {
                barcode: product.barcode,
                ratio: 1,
                default: true,
                price: parseFloat(this.vhAlgorithm.vhnumeral('.price')?.getRawValue() || 0),
                webapp_price_sales: parseFloat(this.vhAlgorithm.vhnumeral('.webapp_price_sales')?.getRawValue() || 0),
              }
            ];

            product.units = units;
            delete product.barcode;
            delete product.price;
            delete product.webapp_price_sales;

            this.vhQueryAutoWeb.addWebApp(product).then(
              (res: any) => {
                if (res.vcode === 0) {
                  this.functionService.createMessage(
                    'success',
                    this.languageService.translate('them_website_thanh_cong')
                  );
                  // this.submitAddWebsite.emit({...res.data});
                  this.dialogRef.close({ ...res.data });
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
              this.languageService.translate('co_loi_vui_long_thu_lai')
            );
            this.functionService.hideLoading();
            this.submitting = false;
          }
        );
    } else {
      this.functionService.createMessage('error', this.languageService.translate('vui_long_dien_du_thong_tin'));
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
      this.addWebsiteForm.controls['barcode'].setValue(newbarcode);
    }
  }

  /** Hàm thực hiện check barcode tự động có hợp lệ không
   *
   * @param barcode
   * @returns true: barcode hợp lệ, false: barcode không hợp lệ
   */
  async checkBarcode(barcode: string): Promise<boolean> {
    try {
      const product = await this.vhQueryAutoWeb.getWebApps_byFields({
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
      if (result && result.id_main_sectors.includes('webapp')) {
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

  selectChange(event, field) {
    this.addWebsiteForm.controls[field].setValue(event);
  }

  getFormControl(controlName: string): FormControl {
    return this.addWebsiteForm.get(controlName) as FormControl;
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
        formData: this.addWebsiteForm,
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
    const google_shopping = this.addWebsiteForm.get('google_shopping')?.value;

    if (this.addWebsiteForm.get('google_shopping_enable')?.value) {
      if (!google_shopping.image_link) {
        this.addWebsiteForm.get('google_shopping.image_link')
          ?.setValue(this.listImgProduct[0]?.path);
      }
    }
  }

  handleEditCkeditor(item) {
    const dialogRef = this.dialog.open(VhCkeditorModalComponent, {
      width: '60vw',
      height: '80vh',
      data: {
        formData: this.addWebsiteForm,
        item: item,
        type: 'websites' // để phân biệt upload ảnh cho danh mục hay sản phẩm
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
    const dialogRef = this.dialog.open(ManageLibraryComponent, {
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
    return this.addWebsiteForm.get('google_shopping') as FormGroup;
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

    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) =>
      this.vhImage.MyUploadImageAdapter(loader, `images/database/websites`);
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
