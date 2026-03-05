import { Component, ElementRef, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb, VhImage } from 'vhautowebdb';
import { AddCategoryComponent } from '../../categories/add-category/add-category.component';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { LanguageService } from 'src/app/services/language.service';
import { FunctionService } from 'vhobjects-service';
import { DescriptionByDeviceComponent } from '../../components/dialog/description-by-device/description-by-device.component';
import { VhCkeditorModalComponent } from '../../components/vh-ckeditor-modal/vh-ckeditor-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
@Component({
  selector: 'app-add-side-dish',
  templateUrl: './add-side-dish.component.html',
  styleUrls: ['./add-side-dish.component.scss'],
})
export class AddSideDishComponent implements OnInit {
  @Output() submitAddSideDish = new EventEmitter();
  content: any = '';

  public addSideDishForm: FormGroup;
  public price: any;
  public price_sales: any;
  public listImgProduct: Array<any> = [];
  public listBarcode = [];
  public selectedListCategory = [];
  public selectedIndexTabset = 0;
  public path: any = '';
  public categories: any = [];
  submitting = false; // Trạng thái submit form để tránh submit nhiều lần
  setupToppingImg;
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
    private languageService: LanguageService,
    public dialogRef: MatDialogRef<AddSideDishComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit(): void {
    this.categories = this.data.categories.filter(c => c._id != 'all');
    this.setupToppingImg = this.data.setupToppingImg;
    this.initForm();
    this.clearjs();
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


  ngDestroy(): void {
    this.submitAddSideDish.emit({ data: 'Dữ liệu trả về' });
  }
  /** Hàm khởi tạo form
   *
   */
  initForm(): void {
    this.addSideDishForm = new FormGroup({
      time_warning: new FormControl(0),
      id_categorys: new FormControl([]),
      units: new FormControl([]),
      allow_sell: new FormControl(true),
      selling: new FormControl(true),
      price: new FormControl(0),
      price2: new FormControl(0),
      price_import: new FormControl(0),
      barcode: new FormControl(''),
      webapp_price_sales: new FormControl(
        0,
        Validators.compose([
          Validators.pattern(
            '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)'
          ),
        ])
      ),
      webapp_hidden: new FormControl(false)
    });

    let fieldNames: any = [
      { field: 'name', validators: { required: true } },
      { field: 'webapp_sort_description', validators: { required: false } },
      { field: 'webapp_description', validators: { required: false } },
      { field: 'unit', validators: { required: true } },
      { field: 'webapp_seo_title', validators: { required: false } },
      { field: 'webapp_seo_description', validators: { required: false } },
      { field: 'webapp_seo_keyword', validators: { required: false } },
    ];

    this.devices.forEach(device => {
      fieldNames.push(
        { field: `${device.value}_webapp_description`, validators: { required: false, pattern: '' } },
        { field: `${device.value}_webapp_sort_description`, validators: { required: false, pattern: '' } },
      );
    });

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminAddHandleChangeMultiLanguage(
        this.addSideDishForm,
        language.code,
        [],
        fieldNames,
      );
    });
  }

  clearjs() {
    this.vhAlgorithm.waitingStack().then(() => {
      this.price = this.vhAlgorithm.vhnumeral('.price');
      this.price_sales = this.vhAlgorithm.vhnumeral('.price_sales');
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
    this.submitAddSideDish.emit(false);
  }

  onSubmitAddProduct(value): void {
    const sideDish = {
      ...value,
      type: 4,
      imgs: this.listImgProduct.map((item) => item.path),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.addSideDishForm.valid) {
      this.submitting = true;
      this.functionService.showLoading(this.languageService.translate('dang_them'));

      sideDish.link = this.functionService.nonAccentVietnamese(sideDish['name_' + this.functionService.defaultLanguage].trim());
      sideDish.link = sideDish.link.replace(/[^a-z0-9-]/g, '');
      this.vhQueryAutoWeb.getToppings_byFields({ link: { $eq: sideDish.link } })
        .then((response: any): void => {
          if (response.vcode === 0 && response.data.length !== 0) {
            sideDish.link = sideDish.link + '-1';
          }
          Object.keys(sideDish).forEach((key) => {
            if (key == 'manysize') {
              if (sideDish[key] == true) {
                delete sideDish['allow_sell'];
                delete sideDish['selling'];
                delete sideDish['warning_number'];
                delete sideDish['subProducts'];
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

            Object.keys(sideDish).forEach(key => {
              if (keysToDelete.includes(key) || key.startsWith('unit_')) {
                delete sideDish[key];
              }
            });
          });

          this.vhQueryAutoWeb.addTopping(sideDish).then(
            (res: any) => {
              if (res.vcode === 0) {
                this.functionService.createMessage(
                  'success',
                  this.languageService.translate('them_topping_thanh_cong')
                );
                // this.submitAddSideDish.emit(true);
                let dataClose = { ...res.data, _id: res.data._id, };

                // this.submitAddSideDish.emit(dataClose);
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
            this.functionService.hideLoading();
            this.submitting = false;
            this.functionService.createMessage(
              'error',
              this.languageService.translate('co_loi_vui_long_thu_lai')
            );
          }
        );
    } else {
      this.functionService.createMessage('error', this.languageService.translate('vui_long_dien_du_thong_tin'));
    }
  }

  enterPrice(): void {
    const data = this.addSideDishForm.value;
    if (data.units.length) {
      const defaultUnit = data.units.find((item) => item.default);
      if (defaultUnit) {
        Object.assign(defaultUnit, {
          price: parseFloat(this.price.getRawValue()),
          webapp_price_sales: parseFloat(this.price_sales.getRawValue()),
          ...Object.keys(data)
            .filter((key) => key.startsWith('unit_'))
            .reduce((acc, key) => ({ ...acc, [key]: data[key] }), {}),
        });
      }
    } else {
      this.addSideDishForm.controls['units'].setValue([
        {
          ratio: 1,
          default: true,
          price: parseFloat(this.price.getRawValue()),
          price2: 0,
          price_import: 0,
          webapp_price_sales: parseFloat(this.price_sales.getRawValue()),
          barcode: '',
          ...Object.keys(data)
            .filter((key) => key.startsWith('unit_'))
            .reduce((acc, key) => ({ ...acc, [key]: data[key] }), {}),
        },
      ]);
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
      this.addSideDishForm.controls['barcode'].setValue(newbarcode);
    }
  }

  /** Hàm thực hiện check barcode tự động có hợp lệ không
   *
   * @param barcode
   * @returns true: barcode hợp lệ, false: barcode không hợp lệ
   */
  async checkBarcode(barcode: string): Promise<boolean> {
    try {
      const product = await this.vhQueryAutoWeb.getFoods_byFields({
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
    }
  }

  close() {
    this.dialogRef.close(false);
  }

  selectChange(event) {
    this.addSideDishForm.controls['id_categorys'].setValue(event);
  }

  getFormControl(controlName: string): FormControl {
    return this.addSideDishForm.get(controlName) as FormControl;
  }

  openCKEditorByDevice(): void {

    const dialogRef = this.dialog.open(DescriptionByDeviceComponent, {
      width: '70vw',
      height: '80vh',
      disableClose: true,
      data: {
        formData: this.addSideDishForm,
        tabs: [{ title: 'mo_ta_chi_tiet', field: "webapp_description" }, { title: 'mo_ta_ngan', field: "webapp_sort_description" }]
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
        formData: this.addSideDishForm,
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
      this.vhImage.MyUploadImageAdapter(loader, `images/database/foods`);
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
