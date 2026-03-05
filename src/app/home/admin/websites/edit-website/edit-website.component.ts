import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb, VhImage } from 'vhautowebdb';
import { AddCategoryComponent } from '../../categories/add-category/add-category.component';
import { LanguageService } from 'src/app/services/language.service';
import { FunctionService, ManageLibraryComponent } from 'vhobjects-service';
import { DescriptionByDeviceComponent } from '../../components/dialog/description-by-device/description-by-device.component';
import { DomSanitizer } from '@angular/platform-browser';
import { VhCkeditorModalComponent } from '../../components/vh-ckeditor-modal/vh-ckeditor-modal.component';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
@Component({
  selector: 'app-edit-website',
  templateUrl: './edit-website.component.html',
  styleUrls: ['./edit-website.component.scss'],
})
export class EditWebsiteComponent implements OnInit {
  public categories: any = [];
  public editWebsiteForm: FormGroup;
  public warning_number: any;
  public category: any;
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
    public vhAlgorithm: VhAlgorithm,
    private el: ElementRef,
    public functionService: FunctionService,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public vhImage: VhImage,
    public matDialog: MatDialog,
    public languageService: LanguageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditWebsiteComponent>,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    if (this.data) {
      this.categories = this.data.categories.filter(c => c._id !== 'all');
      this.getNewFileds();
      this.getSetup();
    }

    // Lắng click ra ngoài (backdrop)
    // đoạn này để đóng mà modal và trả về result, nếu ko sẽ ko cập nhật giao diện
    this.dialogRef.backdropClick().subscribe(() => {
      this.close();
    });
  }
  getNewFileds() {
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
        this.initWebsite(this.data.dataEditWebsite);
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

  /** Hàm thực hiện khởi tạo form với dữ liệu truyền vào
   *
   * @param data dữ liệu website truyền vào
   */
  initWebsite(data: any) {
    console.log(data);
    this.editWebsiteForm = new FormGroup({
      _id: new FormControl(data._id),
      barcode: new FormControl(data.units[0].barcode),
      id_categorys: new FormControl(data.id_categorys && data.id_categorys.length > 0 ? data.id_categorys : []),
      link_website_demo: new FormControl(data.link_website_demo),
      id_subproject: new FormControl(
        data.id_subproject
      ),
      webapp_hidden: new FormControl(data.webapp_hidden),
      date_update: new FormControl(data.date_update),
      quantity: new FormControl(''),
      version: new FormControl(data.version),
      price: new FormControl(data.units[0].price),
      webapp_price_sales: new FormControl(data.units[0].webapp_price_sales),
      link: new FormControl(data.link, [Validators.required, Validators.pattern('^(?!.*[\\/\\\\])[a-z0-9-]+$')]),
      google_shopping_enable: new FormControl(data?.google_shopping_enable ?? false),
      google_shopping: new FormGroup({
        id: new FormControl(data?.google_shopping?.id ?? ''),
        title: new FormControl(data?.google_shopping?.title ?? ''),
        description: new FormControl(data?.google_shopping?.description ?? ''),
        link: new FormControl(data?.google_shopping?.link ?? ''),
        image_link: new FormControl(data?.google_shopping?.image_link ?? ''),
        additional_image_links: (data.google_shopping?.additional_image_links && Array.isArray(data.google_shopping?.additional_image_links)) ? this.formBuilder.array(
          data.google_shopping.additional_image_links.map(link => new FormControl(link))
        ) : this.formBuilder.array(Array.from({ length: 10 }).map(() => new FormControl(''))),
        price: new FormControl(data?.google_shopping?.price ?? ''),
        availability: new FormControl(data?.google_shopping?.availability ?? ''),
        brand: new FormControl(data?.google_shopping?.brand ?? ''),
        condition: new FormControl(data?.google_shopping?.condition ?? ''),
        type_product: new FormControl(data?.google_shopping?.type_product ?? ''),
        google_product_category: new FormControl(data?.google_shopping?.google_product_category ?? '')
      }),
      url_canonical: new FormControl(data?.url_canonical ?? ''),
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
      this.functionService.adminEditHandleChangeMultiLanguage(
        this.editWebsiteForm,
        language.code,
        [...this.newFields, ...this.newFieldsCKEditor],
        fieldNames,
        data,
      );
    });

    if (data.imgs.length) {
      this.listImgProduct = data.imgs.map((map) => ({
        path: map,
        visible: false,
      }));
    }
    if (data.img_iframes.length) {
      this.imgIFrames = data.img_iframes;
    }

    // Phần Dữ liệu tự định nghĩa
    const newFields = [...this.newFields, ...this.newFieldsCKEditor];
    newFields.forEach((field) => {
      this.editWebsiteForm.addControl(
        field['field_custom'] + '_' + this.functionService.defaultLanguage,
        new FormControl(
          data[field['field_custom'] + '_' + this.functionService.defaultLanguage],
          [field.field_required ? Validators.required : Validators.nullValidator]
        )
      );
      if (this.functionService.defaultLanguage !== this.functionService.languageTempCode) {
        this.editWebsiteForm.addControl(
          field['field_custom'] + '_' + this.functionService.languageTempCode,
          new FormControl(data[field['field_custom'] + '_' + this.functionService.languageTempCode])
        );
      }
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
    this.updateWebsite('img_iframes', { img_iframes: this.imgIFrame });
  }
  updateNewField(field, value) {

    this.vhQueryAutoWeb.updateWebApp(this.data.dataEditWebsite._id, { [field]: value }).then(
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

  /** Hàm thực xóa đường dẫn liên kết
   *
   * @param position
   */
  deleteIFrame(position: number) {
    this.imgIFrames = this.imgIFrames.filter((_, index) => index != position);
    this.updateWebsite('img_iframes', { img_iframes: this.imgIFrame });
  }

  /** Hàm thực hiện cập nhật dữ liệu thay đổi của sản phẩm
   *
   * @param field trường cập nhật
   * @param objectUpdate dữ liệu cập nhật. Vd: {field: 'aaa'}
   */
  updateWebsite(field: string, objectUpdate) {
    if (!objectUpdate[field] && this.editWebsiteForm.get(field)?.errors?.required) return;

    objectUpdate.updated_at = new Date().toISOString();
    if (!objectUpdate.created_at) objectUpdate.created_at = new Date().toISOString();

    if (field == 'imgs') {
      objectUpdate = {
        imgs: this.listImgProduct.map((item) => item.path),
      };
    }
    if (field == 'img_iframes') {
      objectUpdate = {
        img_iframes: this.imgIFrames.filter((filter) => filter.path.length),
      };
    }


    if (field == 'link') {
      // check link only have a-z and không dấu, 0-9, - if not return error
      if (!/^[a-zA-Z0-9-]*$/.test(objectUpdate.link.trim())) {
        this.functionService.createMessage('error', this.languageService.translate('link_chi_duoc_phep_chua_a_z_0_9_va_dau_gach_ngang'));
        return;
      }

      this.vhQueryAutoWeb.getWebApps_byFields({ link: { $eq: objectUpdate.link.trim() } })
        .then((res: any) => {
          if (res.vcode === 0) {
            if (res.data.length > 0) {
              this.functionService.createMessage('error', 'duong_dan_da_ton_tai');
              return;
            }

            this.vhQueryAutoWeb
              .updateWebApp(this.data.dataEditWebsite._id, objectUpdate)
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
                  console.log('updateCategory error', err);
                  this.functionService.createMessage(
                    'error',
                    'da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu_vui_long_thu_lai'
                  );
                }
              );

          }
        });
    } else {

      if (field == 'units') {
        objectUpdate = {
          units: [
            {
              barcode: this.editWebsiteForm.get('barcode').value,
              price: parseFloat(this.vhAlgorithm.vhnumeral('.price')?.getRawValue() || 0),
              webapp_price_sales: parseFloat(this.vhAlgorithm.vhnumeral('.webapp_price_sales')?.getRawValue() || 0),
              default: true,
              ratio: 1
            },
          ]
        };
      }

      this.vhQueryAutoWeb.updateWebApp(this.data.dataEditWebsite._id, objectUpdate).then(
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
  /** Hàm này thực hiện tự động tạo mã vạch
   *
   */
  generateBarcodesAutomatically() {
    let newbarcode = '';
    for (let index = 0; index < 12; index++) {
      newbarcode += Math.floor(Math.random() * 10);
    }
    if (this.checkBarcode(newbarcode)) {
      this.editWebsiteForm.controls['barcode'].setValue(newbarcode);
      this.updateWebsite('barcode', { barcode: newbarcode });
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
    const dialogRef = this.matDialog.open(AddCategoryComponent, {
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
      this.updateWebsite('imgs', { img: this.listImgProduct });
    }
  }

  close(): void {
    this.dialogRef.close({
      ...this.data.dataEditWebsite,
      ...this.editWebsiteForm.value
    });
  }

  // selectChange(event) {
  //   this.editWebsiteForm.controls['id_categorys'].setValue(event);
  //   this.updateWebsite('id_categorys', { id_categorys: event });
  // }

  selectChange(event, field) {
    this.editWebsiteForm.controls[field].setValue(event);
    this.updateWebsite(field, { [field]: event });
  }

  updateFieldCKEditor(field, value) {
    this.updateWebsite(field, { [field]: value });
  }

  updateDynamicField(fieldKey: string, value: any) {
    const dynamicKey = fieldKey + '_' + this.functionService.languageTempCode;
    const updatedValue = { [dynamicKey]: value };
    this.updateWebsite(dynamicKey, updatedValue);
  }

  getFormControl(controlName: string): FormControl {
    return this.editWebsiteForm.get(controlName) as FormControl;
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

    const dialogRef = this.matDialog.open(DescriptionByDeviceComponent, {
      width: '70vw',
      height: '80vh',
      disableClose: true,
      data: {
        formData: this.editWebsiteForm,
        tabs: staticTabs.concat(dynamicTabs), // gộp tabs tĩnh và động
        callUpdate: this.updateWebsite.bind(this)
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        // xử lý sau khi đóng dialog
      }
    });
  }

  handleEditCkeditor(item) {
    const dialogRef = this.matDialog.open(VhCkeditorModalComponent, {
      width: '60vw',
      height: '80vh',
      data: {
        formData: this.editWebsiteForm,
        item: item,
        type: 'websites' // để phân biệt upload ảnh cho danh mục hay sản phẩm
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.updateDynamicField(item.field_custom, this.editWebsiteForm.get(item.field_custom + '_' + this.functionService.languageTempCode).value);
    });
  }

  getContentSafeHtml(field: string): any {
    const rawHtml = this.getFormControl(field).value;
    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  }

  path = '/images/database/products';
  openFromLibrary(index: number, type: string | 'reference_links' | 'additional_image_links' | 'image_link' = 'reference_links'): void {
    const dialogRef = this.matDialog.open(ManageLibraryComponent, {
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
          this.updateWebsite('google_shopping', { google_shopping: this.editWebsiteForm.value.google_shopping });
        } else if (type === 'image_link') {
          this.googleShopping.get('image_link')?.setValue(data.href);
          this.updateWebsite('google_shopping', { google_shopping: this.editWebsiteForm.value.google_shopping });
        }
      }
      this.path = data.path;
    });
  }

  // Getter to access google_shopping FormGroup
  get googleShopping(): FormGroup {
    return this.editWebsiteForm.get('google_shopping') as FormGroup;
  }

  // Getter to access additional_image_links FormArray
  get additionalImageLinksControls() {
    return (this.googleShopping.get('additional_image_links') as any).controls as FormControl[];
  }

  // Tạo dữ liệu Google Shopping từ setup_fields_google_shopping
  generateGoogleShoppingData() {
    const enabled = this.editWebsiteForm.value.google_shopping_enable;

    // Nếu chưa bật thì không cho tạo, tuỳ bạn muốn warning hay im lặng
    if (!enabled) {
      // Ví dụ dùng notification:
      // this.notification.warning('Thông báo', 'Bạn cần bật Google Shopping trước.');
      return;
    }

    if (!this.setup_fields_google_shopping) {
      return;
    }

    const formData = this.editWebsiteForm.value;
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
    this.editWebsiteForm.patchValue({
      google_shopping: googleShoppingData
    });

    // Cập nhật lên server
    this.updateWebsite('google_shopping', {
      google_shopping: googleShoppingData
    });
    this.functionService.createMessage('success', this.languageService.translate('cap_nhat_du_lieu_thanh_cong'));
  }

  getSetup() {
    this.vhQueryAutoWeb.getSetups_byFields({ type: 'fields_google_shopping', mainSector: 'web_app' }).then((res: any) => {
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
