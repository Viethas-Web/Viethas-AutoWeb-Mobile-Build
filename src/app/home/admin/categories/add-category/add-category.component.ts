import { Component, Inject, ViewEncapsulation, OnInit, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { VhAlgorithm, VhImage, VhQueryAutoWeb } from 'vhautowebdb';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ManageLibraryComponent } from 'vhobjects-service';
import { JsonDataService } from 'src/app/services/json-data.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';
import { ChooseImageComponent } from 'vhobjects-service';
import { TransferImageToServerComponent } from '../../components/dialog/transfer-image-to-server/transfer-image-to-server.component';
import { FunctionService } from 'vhobjects-service';
import { DescriptionByDeviceComponent } from '../../components/dialog/description-by-device/description-by-device.component';
import { VhCkeditorModalComponent } from '../../components/vh-ckeditor-modal/vh-ckeditor-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss'],
})
export class AddCategoryComponent implements OnInit {
  content: any = '';
  public addCategoryForm: FormGroup;
  public fileIcon;
  public fileBanner: File;
  public selecetdFile: File;
  public imagePreview: string;
  public listNoShow: any;
  public img: any = {
    path: '',
    visible: false,
  };
  public path: any = '';
  categorys = [];
  type_main_sectors = [];
  submitting = false; // Trạng thái submit form để tránh submit nhiều lần

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
  resolution;

  deviceWidthMax: number = 0;

  compressWidth: number = 100;
  compressHeight: number = 100;
  id_subproject: string = '';
  isShowConfirmPopup: boolean = false;
  visible_config_tool: boolean = false;
  openPopover: boolean = false;
  imageUrl: string = '';
  newFields = [];
  newFieldsCKEditor = [];
  ckeditorFields = [
    {
      field_custom: 'description',
      field_lable: 'mo_ta_danh_muc'
    },
    {
      field_custom: 'description_short',
      field_lable: 'mo_ta_danh_muc_ngan'
    }
  ];


  constructor(
    private el: ElementRef,
    public dialogRef: MatDialogRef<AddCategoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public vhAlgorithm: VhAlgorithm,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public matdialog: MatDialog,
    public functionService: FunctionService,
    public vhImage: VhImage,
    private jsonDataService: JsonDataService,
    private translate: TranslateService,
    private nzMessageService: NzMessageService,
    public languageService: LanguageService,
    private sanitizer: DomSanitizer
  ) {

  }

  ngOnInit(): void {
    this.setupCategoryImg = this.data.setupCategoryImg;
    this.resolution = this.vhQueryAutoWeb.getlocalSubProject(this.vhQueryAutoWeb.getlocalSubProject_Working()._id).resolution;
    this.id_subproject = this.vhQueryAutoWeb.getlocalSubProject_Working()._id;
    this.devices.forEach(device => {
      if (this.deviceWidthMax < this.resolution[device.value + '_width']) {
        this.deviceWidthMax = this.resolution[device.value + '_width'];
      }
    });

    this.getNewFileds();
  }

  getNewFileds() {
    this.vhQueryAutoWeb.getNewFields_byFields({ id_main_sector: { $eq: 'category' } }).then((newfields: any) => {
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
      this.getMainSectors();

      this.vhQueryAutoWeb.getCategorySteps_byIdFatherCategory("", {}, {}, {}, 0, 1).then((response: any) => {
        if (response.vcode === 0) {
          //-----------your code-----------
          this.categorys = response.data.map((e) => {
            return {
              ...e,
              array_step: Array(e.step)
                .fill(0)
                .map((x, i) => i),
            };
          });
          this.data.categories = this.categorys;
        }
      }, (error: any) => {
        console.log('error', error);
      });
    });
  }

  createMessage(type: string, key: string, duration: number = 2000) {
    this.translate.get(key).subscribe((translatedMessage: string) => {
      this.nzMessageService.create(type, translatedMessage, { nzDuration: duration });
    });
  }

  getMainSectors() {
    this.jsonDataService.getMainSectors().subscribe((data) => {
      let subproject = this.vhQueryAutoWeb.getlocalSubProject(this.vhQueryAutoWeb.getlocalSubProject_Working()._id);
      data.forEach((element) => {
        if (subproject.main_sectors?.includes(element.value) && element.type)
          this.type_main_sectors.push(element);

      });

      this.type_main_sectors = this.vhAlgorithm.sortVietnamesebyASC(this.type_main_sectors, 'label');

    });
  }


  /** Hàm khởi tạo form
   *
   */
  initForm() {
    this.addCategoryForm = new FormGroup({
      id_father_category: new FormControl(''),
      step: new FormControl(0),
      id_main_sectors: new FormControl([]),
    });

    let fieldNames: any = [
      { field: 'name', validators: { required: true, pattern: '' } },

      { field: 'description', validators: { required: false, pattern: '' } },
      { field: 'description_short', validators: { required: false, pattern: '' } },

      { field: 'webapp_seo_title', validators: { required: false, pattern: '' } },
      { field: 'webapp_seo_description', validators: { required: false, pattern: '' } },
      { field: 'webapp_seo_keyword', validators: { required: false, pattern: '' } },
    ];

    this.devices.forEach(device => {
      fieldNames.push(
        { field: `${device.value}_description`, validators: { required: false, pattern: '' } },
        { field: `${device.value}_description_short`, validators: { required: false, pattern: '' } },
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
        this.addCategoryForm.addControl(field.field_custom, new FormControl(field.field_start_value || [], field.field_required ? [Validators.required] : []));
      });

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminAddHandleChangeMultiLanguage(
        this.addCategoryForm,
        language.code,
        [...this.newFields.filter((f: any) => f.field_input_type != "select-multiple"), ...this.newFieldsCKEditor],
        fieldNames,
      );
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



  /** Hàm thực hiện xử lí thêm danh mục
   *
   * @param value
   */
  onSubmitAddCategory(value): void {
    this.submitting = true;
    this.functionService.showLoading(this.languageService.translate('dang_them'));

    if (this.addCategoryForm.valid) {
      let category = {
        ...value,
        imgs: [this.img.path],
      };
      category.link = this.functionService.nonAccentVietnamese(category['name_' + this.functionService.defaultLanguage].trim());
      category.link = category.link.replace(/[^a-z0-9-]/g, '');
      this.vhQueryAutoWeb
        .getCategorys_byFields({ link: { $eq: category.link } })
        .then((response: any) => {
          if (response.vcode === 0 && response.data.length != 0)
            category.link = category.link + '-1';
          this.vhQueryAutoWeb.addCategory(category).then(
            (res: any) => {
              console.log('res', res);
              if (res.vcode === 0) {
                this.createMessage(
                  'success',
                  'them_danh_muc_thanh_cong'
                );
                this.dialogRef.close(res.data);
              }
              if (res.vcode === 11) {
                this.createMessage(
                  'error',
                  'phien_dang_nhap_da_het_han_vui_long_dang_nhap_lai'
                );
              }
            },
            (error) => {
              this.createMessage(
                'error',
                'da_xay_ra_loi_trong_qua_trinh_them_du_lieu'
              );
              this.functionService.hideLoading();
              this.submitting = false;
            }
          ).finally(() => {
            this.functionService.hideLoading();
            setTimeout(() => {
              this.submitting = false;
            }, 100);
          });
        });
    }
    else {
      this.createMessage(
        'error',
        'vui_long_dien_du_thong_tin'
      );
      this.functionService.hideLoading();
      this.submitting = false;
    }
  }


  close(): void {
    this.dialogRef.close();
  }


  getTypeInput(item: any): string {
    if (item.field_input_type === 'input') return 'text';
    if (item.field_input_type === 'input-time') return 'time';
    if (item.field_input_type === 'input-date') return 'date';
    if (item.field_input_type === 'input-number') return 'number';
    return 'text';
  }

  selectChange(event, field) {
    this.addCategoryForm.controls[field].setValue(event);
  }

  getFile() {
    document.getElementById('file-upload').click();
  }

  /** Lấy hình ảnh từ Desktop */
  onUpload(e?) {

    const file = e.target.files[0];
    if (!file) return;
    const inputEle = document.getElementById('file-upload') as HTMLInputElement;

    let resolution = {};

    let compress_type = this.setupCategoryImg.upload_image.compress_type;

    switch (this.setupCategoryImg.upload_image.compress_type) {
      case 'compress-screen':
        resolution = {
          width: this.deviceWidthMax,
          height: 0
        };

        break;
      case 'custom':
        resolution = {
          width: +this.compressWidth,
          height: +this.compressHeight
        };
        compress_type = 'compress-frame';
        break;
    }

    this.vhImage.getImageFromDesktop_Autoweb(file, 'images/database/categories', {
      compress_type: compress_type,
      resolution: resolution
    })
      .then(
        (rsp: any) => {

          console.log(rsp);
          if (rsp.vcode != 0) {
            rsp.mess.error('Tải ảnh thất bại! Lý do: ' + rsp.message);
            return;
          }

          if (rsp.vcode === 0) {
            const object = {
              path: rsp.data,
            };
            this.img = object;
            this.createMessage(
              'success',
              'hinh_anh_da_duoc_tai_thanh_cong'
            );
          } else {
            this.createMessage(
              'error',
              `Tải ảnh thất bại! Lý do: ${rsp.message}`
            );
          }
        },

      );

    inputEle.value = '';
  }

  openLibrary() {
    const dialogRef = this.matdialog.open(ManageLibraryComponent, {
      width: '85%',
      maxWidth: '100%',
      data: {
        startPath: this.path ? this.path : "/images",
        scopeData: "/images"
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(({ name, href, path }) => {
      if (name && href) {
        // Xử lý thêm mặc định
        const object = {
          path: href,
          visible: false,
        };
        this.img = object;
      }
      this.path = path;
    });
  }


  generateSymBol(array: []) {
    let string = '';
    array.forEach((_) => {
      string = string + `- `;
    });
    return string;
  }

  deleteFileImage() {
    this.img.path = '';
  }

  accpectLinkIFrame(item, value) {
    item.path = value;
    item.visible = false;
  }

  /**
 * hàm này để cập nhật resolution cho subproject
 */
  updateSetup() {
    this.vhQueryAutoWeb
      .updateSetup(this.data.setupCategoryImg._id, {
        upload_image: {
          compress_type: this.setupCategoryImg.upload_image.compress_type,
          source: this.setupCategoryImg.upload_image.source,
        }
      })
      .then((bool: any) => {

      });
  }

  deleteImage() {
    this.img = {
      path: '',
      visible: false,
    };
  }

  handleChangeImage() {
    switch (this.setupCategoryImg.upload_image.source) {
      case 'device':
        this.getFile();
        break;
      case 'library':
        this.openLibrary();
        break;
      case 'free_img':
        this.openDialogChooseIcon();
        break;
      case 'url':
        this.openPopover = true;
        break;
    }
  }

  closePopover(e) {
    e?.stopPropagation();
    this.openPopover = false;
  }

  /**
   * update trường mobile_portrait_hidden or desktop_hidden cho object
   * @param value
   */
  /**
   * Hàm mở ra hộp thoại chọn icon
   */
  openDialogChooseIcon() {
    this.visible_config_tool = false;
    const dialogRef = this.matdialog.open(ChooseImageComponent, {
      width: '80vw',
      height: '90vh',
      disableClose: false,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

        // Xử lý thêm mặc định
        const object = {
          path: result,
          visible: false,
        };
        this.img = object;
      }
      this.visible_config_tool = true;
    });
  }



  handleCancelConfirm() {
    this.isShowConfirmPopup = false;
  }

  /**
   * Lấy hình ảnh từ url đẩy lên server với kích thước hình thay đổi
   * */
  handleOkConfirm() {

    let resolution = {};

    let compress_type = this.setupCategoryImg.upload_image.compress_type;

    // nén theo màn hình thì lấy kích thước màn hình lớn nhất
    switch (this.setupCategoryImg.upload_image.compress_type) {
      case 'compress-screen':
        resolution = {
          width: this.deviceWidthMax,
          height: 0
        };

        break;
      case 'custom':
        resolution = {
          width: +this.compressWidth,
          height: +this.compressHeight
        };
        compress_type = 'compress-frame';
        break;
    }
    // console.log('resolution', resolution);
    this.vhImage.getImageFromURL_Autoweb(this.img?.path, "images/database/categories", {
      compress_type: compress_type,
      resolution: resolution
    })
      .then((rsp: any) => {
        if (rsp.vcode != 0) {
          this.functionService.createMessage('error', 'tai_anh_that_bai_ly_do' + rsp.msg);
          return;
        }

        const object = {
          path: rsp.data,
        };
        this.img = object;

        this.functionService.createMessage('success', 'hinh_anh_da_duoc_tai_thanh_cong');

      })
      .catch((error: any) => {
        console.error('Error:', error);
        this.functionService.createMessage('error', 'tai_anh_that_bai_ly_do' + error.message);
      });

    this.isShowConfirmPopup = false;

  }



  handleShowTransferImageToServer() {
    const dialogRef = this.matdialog.open(TransferImageToServerComponent, {
      width: '40vw',
      height: '40vh',
      disableClose: true,
      data: {
        setupsImage: this.setupCategoryImg,
        compressWidth: this.compressWidth,
        compressHeight: this.compressHeight,
      },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.handleOkConfirm();
      }
    });
  }

  updateUrlImage() {
    this.img.path = this.imageUrl;
  }


  /**
 * bắt sk thay đổi danh mục cha để gán lại step cho danh mục cần thêm
 */
  changeFatherCategory(id_father_category) {
    if (id_father_category) {
      let step = this.categorys.find(e => e._id == id_father_category).step + 1;
      this.addCategoryForm.controls['step'].setValue(step);
    }
    else this.addCategoryForm.controls['step'].setValue(0);
  }


  onMainSectorChange(event): void {
    if (event.value.length) {
      this.categorys = this.data.categories.filter(e => event.value.some(mst => e.id_main_sectors.includes(mst)));
    } else this.categorys = this.data.categories;

    const idFatherCategory = this.addCategoryForm.controls['id_father_category'].value;
    const exists = this.categorys.some(category => category._id === idFatherCategory);

    if (!exists) {
      this.addCategoryForm.controls['id_father_category'].setValue('');
    }
  }

  getFormControl(controlName: string): FormControl {
    return this.addCategoryForm.get(controlName) as FormControl;
  }

  openCKEditorByDevice(): void {
    const dynamicTabs = this.newFieldsCKEditor?.map((item: any) => ({
      title: item?.field_lable,
      field: item?.field_custom
    })) || [];

    const staticTabs = [
      { title: 'mo_ta_danh_muc', field: 'description' },
      { title: 'mo_ta_danh_muc_ngan', field: 'description_short' },
    ];

    const dialogRef = this.matdialog.open(DescriptionByDeviceComponent, {
      width: '60vw',
      height: '80vh',
      disableClose: true,
      data: {
        formData: this.addCategoryForm,
        tabs: staticTabs.concat(dynamicTabs)
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
      }
    });
  }

  handleEditCkeditor(item) {
    const dialogRef = this.matdialog.open(VhCkeditorModalComponent, {
      width: '60vw',
      height: '80vh',
      data: {
        formData: this.addCategoryForm,
        item: item,
        type: 'categories' // để phân biệt upload ảnh cho danh mục hay sản phẩm
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
    const main = this.el.nativeElement.querySelector('.form-container');
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
      return this.vhImage.MyUploadImageAdapter(loader, 'images/database/categories');
    };
  }

  scrollToEditor(editor: any, main) {
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
