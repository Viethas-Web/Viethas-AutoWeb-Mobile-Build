import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb, VhImage } from 'vhautowebdb';
import { AddCategoryComponent } from '../../categories/add-category/add-category.component';
import { LanguageService } from 'src/app/services/language.service';
import { FunctionService } from 'vhobjects-service';
import { DescriptionByDeviceComponent } from '../../components/dialog/description-by-device/description-by-device.component';
import { VhCkeditorModalComponent } from '../../components/vh-ckeditor-modal/vh-ckeditor-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
@Component({
  selector: 'app-edit-side-dish',
  templateUrl: './edit-side-dish.component.html',
  styleUrls: ['./edit-side-dish.component.scss'],
})
export class EditSideDishComponent implements OnInit {
  content: any = '';

  public editSideDishForm: FormGroup;
  public categories: any = [];
  public price: any;
  public price_sales: any;
  public listImgProduct: Array<any> = [];
  public listBarcode = [];
  public selectedListCategory = [];
  public selectedIndexTabset = 0;
  public path: any = '';
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
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    public vhImage: VhImage,
    public dialog: MatDialog,
    private languageService: LanguageService,
    public dialogRef: MatDialogRef<EditSideDishComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.setupToppingImg = this.data.setupToppingImg;
    if (this.data) {
      this.categories = this.data.categories.filter(c => c._id !== 'all');
      this.getProduct();
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

  getProduct(): void {
    this.initForm(this.data.dataEditSideDish);
  }

  /** Hàm khởi tạo form
   *
   * @param value: object
   */
  initForm(product): void {
    const { languageTempCode, defaultLanguage } = this.functionService;
    this.editSideDishForm = new FormGroup({
      _id: new FormControl(product._id),
      id_categorys: new FormControl(product.id_categorys && product.id_categorys.length > 0 ? product.id_categorys : []),
      name: new FormControl(
        product.name,
        Validators.compose([Validators.required])
      ),
      link: new FormControl(product.link, [Validators.required, Validators.pattern('^(?!.*[\\/\\\\])[a-z0-9-]+$')]),
      units: new FormControl(product.units),
      webapp_sort_description: new FormControl(
        product.webapp_sort_description
      ),
      webapp_description: new FormControl(
        product.webapp_description
      ),
      webapp_hidden: new FormControl(product.webapp_hidden)
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
    });

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminEditHandleChangeMultiLanguage(
        this.editSideDishForm,
        language.code,
        [],
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
        { name: 'price_import', value: unit?.price_import ?? 0 },
        { name: 'price', value: unit?.price ?? 0 },
        { name: 'price2', value: unit?.price2 ?? 0 },
        { name: 'webapp_price_sales', value: unit?.webapp_price_sales ?? 0 },
        { name: 'barcode', value: unit?.barcode ?? '', validators: [] },
      ];

      // Thêm các field cố định
      fixedFields.forEach(({ name, value, validators = [Validators.required, patternValidator] }) => {
        this.editSideDishForm.addControl(
          name,
          new FormControl(value, Validators.compose(validators))
        );
      });

      // Tự động thêm các field bắt đầu bằng `unit_`
      Object.keys(unit)
        .filter((key) => key.startsWith('unit_'))
        .forEach((key) => {
          if (!this.editSideDishForm.contains(key)) {
            this.editSideDishForm.addControl(key, new FormControl(unit[key] ?? '', Validators.required));
          }
        });
      if (!this.editSideDishForm.contains(`unit_${languageTempCode}`)) {
        this.editSideDishForm.addControl(`unit_${languageTempCode}`,
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
    this.clearJs();
  }

  clearJs() {
    if (!this.data.subs) {
      this.vhAlgorithm.waitingStack().then(() => {
        this.price = this.vhAlgorithm.vhnumeral('.price');
        this.price_sales = this.vhAlgorithm.vhnumeral('.price_sales');
      });
    }
  }

  getUnitsByRatio(units: Array<any>, ratio: number) {
    return units.find((unit) => unit.ratio == ratio);
  }

  /** Hàm thực hiện cập nhật dữ liệu thay đổi của topping
   *
   * @param field trường cập nhật
   * @param objectUpdate dữ liệu cập nhật. Vd: {field: 'aaa'}
   */
  updateProduct(field: string, objectUpdate) {
    if (!objectUpdate[field] && this.editSideDishForm.get(field)?.errors?.required) return;

    objectUpdate.updated_at = new Date().toISOString();
    if (!objectUpdate.created_at) objectUpdate.created_at = new Date().toISOString();

    if (['barcode', 'price', 'price2', 'price_import', 'webapp_price_sales'].includes(field) || field.startsWith('unit_')) {
      const { barcode } = this.editSideDishForm.value;
      const unitsNew = this.editSideDishForm.value.units;

      // Lấy tất cả các trường bắt đầu bằng "unit_"
      const unitFields = Object.keys(this.editSideDishForm.value).filter((key) =>
        key.startsWith('unit_')
      );

      // Tìm index của phần tử có ratio === 1
      const index = unitsNew.findIndex(({ ratio }) => ratio === 1);

      // Tạo dữ liệu mới với từng trường `unit_*` tách riêng
      const data: any = {
        barcode,
        ratio: 1,
        price: parseFloat(this.price.getRawValue()),
        price2: 0,
        price_import: 0,
        webapp_price_sales: parseFloat(this.price_sales.getRawValue()),
        default: unitsNew[index].default,
      };

      // Thêm từng trường `unit_*` vào object `data`
      unitFields.forEach((unitField) => {
        data[unitField] = this.editSideDishForm.value[unitField];
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

      this.vhQueryAutoWeb.getToppings_byFields({ link: { $eq: objectUpdate.link.trim() } })
        .then((res: any) => {
          if (res.vcode === 0) {
            if (res.data.length > 0) {
              this.functionService.createMessage('error', 'duong_dan_da_ton_tai');
              return;
            }

            this.vhQueryAutoWeb
              .updateTopping(this.data.dataEditSideDish._id, objectUpdate)
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
      this.vhQueryAutoWeb.updateTopping(this.data.dataEditSideDish._id, objectUpdate).then(
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

  /** Hàm này thực hiện tự động tạo mã vạch
   *
   */
  generateBarcodesAutomatically() {
    let newbarcode = '';
    for (let index = 0; index < 12; index++) {
      newbarcode += Math.floor(Math.random() * 10);
    }
    if (this.checkBarcode(newbarcode)) {
      const targetForm = this.editSideDishForm;
      targetForm.controls['barcode'].setValue(newbarcode);
      this.updateProduct('barcode', { barcode: newbarcode });
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
      if (result && result.id_main_sectors.includes('recruitment')) {
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
  close() {
    this.dialogRef.close({
      ...this.data.dataEditSideDish,
      ...this.editSideDishForm.value
    });
  }

  selectChange(event) {
    this.editSideDishForm.controls['id_categorys'].setValue(event);
    this.updateProduct('id_categorys', { id_categorys: event });
  }

  updateDynamicField(fieldKey: string, value: any) {
    const dynamicKey = fieldKey + '_' + this.functionService.languageTempCode;
    const updatedValue = { [dynamicKey]: value };
    this.updateProduct(dynamicKey, updatedValue);
  }

  getFormControl(controlName: string): FormControl {
    return this.editSideDishForm.get(controlName) as FormControl;
  }

  openCKEditorByDevice(): void {

    const dialogRef = this.dialog.open(DescriptionByDeviceComponent, {
      width: '70vw',
      height: '80vh',
      disableClose: true,
      data: {
        formData: this.editSideDishForm,
        tabs: [{ title: 'mo_ta_chi_tiet', field: "webapp_description" }, { title: 'mo_ta_ngan', field: "webapp_sort_description" }],
        callUpdate: this.updateProduct.bind(this)
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
        formData: this.editSideDishForm,
        item: item,
        type: 'foods' // để phân biệt upload ảnh cho danh mục hay sản phẩm
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.updateDynamicField(item.field_custom, this.editSideDishForm.get(item.field_custom + '_' + this.functionService.languageTempCode).value);
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

    editor.ui
      .getEditableElement()
      .parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
      );
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

  ngOnDestroy() {
    for (const { element, event, handler } of this.editorListeners) {
      element.removeEventListener(event, handler);
    }
    this.editorListeners = [];
  }
}
