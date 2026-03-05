import { Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb, VhImage } from 'vhautowebdb';
import { ManageLibraryComponent } from 'vhobjects-service';
import { JsonDataService } from 'src/app/services/json-data.service';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LanguageService } from 'src/app/services/language.service';
import { ChooseImageComponent } from 'vhobjects-service';
import { TransferImageToServerComponent } from '../../components/dialog/transfer-image-to-server/transfer-image-to-server.component';
import { FunctionService } from 'vhobjects-service';
import { DescriptionByDeviceComponent } from '../../components/dialog/description-by-device/description-by-device.component';
import { VhCkeditorModalComponent } from '../../components/vh-ckeditor-modal/vh-ckeditor-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.scss'],
})
export class EditCategoryComponent implements OnInit {
  content: any = '';
  public editCategoryForm: FormGroup;
  public nameCategory: string;
  public path: any = '';
  categorys = [];
  type_main_sectors = [];
  public img: any = {
    path: '',
    visible: false,
  };

  imageUrl: string = '';
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

  setupCategoryImg;
  resolution;
  deviceWidthMax: number = 0;
  compressWidth: number = 100;
  compressHeight: number = 100;
  id_subproject: string = '';
  isShowConfirmPopup: boolean = false;
  visible_config_tool: boolean = false;
  openPopover: boolean = false;
  categorysSearch: any = [];
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
    public dialogRef: MatDialogRef<EditCategoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public vhAlgorithm: VhAlgorithm,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    public vhImage: VhImage,
    public dialog: MatDialog,
    private jsonDataService: JsonDataService,
    private translate: TranslateService,
    private nzMessageService: NzMessageService,
    public languageService: LanguageService,
    private sanitizer: DomSanitizer

  ) { }

  ngOnInit(): void {
    this.setupCategoryImg = this.data.setupCategoryImg;
    this.getNewFields();
    this.getMainSectors();

    this.resolution = this.vhQueryAutoWeb.getlocalSubProject(this.vhQueryAutoWeb.getlocalSubProject_Working()._id).resolution;
    this.id_subproject = this.vhQueryAutoWeb.getlocalSubProject_Working()._id;
    // console.log('this.resolution', this.resolution);
    this.devices.forEach(device => {
      if (this.deviceWidthMax < this.resolution[device.value + '_width']) {
        this.deviceWidthMax = this.resolution[device.value + '_width'];
      }
    });


  }

  getNewFields() {
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
      // get dữ liệu danh mục hợp lệ được phép cập nhật
      this.vhQueryAutoWeb.getCategorySteps_byDeleteBranchOfNode(this.data.category._id).then(
        (response: any) => {
          if (response.vcode === 0) {
            this.categorys = response.data.map((e) => {
              return {
                ...e,
                array_step: Array(e.step) // chuyển từ number sang array 0 -> number
                  .fill(0)
                  .map((x, i) => i),
              };
            });
            this.categorysSearch = [...this.categorys];
          }
          if (this.data) {
            this.initForm(this.data.category);
            this.nameCategory = this.data.name;
          }
        },
        (error: any) => {
          console.error(error);
        }
      );
    });
  }

  getMainSectors() {
    this.jsonDataService.getMainSectors().subscribe((data) => {
      let subproject = this.vhQueryAutoWeb.getlocalSubProject(
        this.vhQueryAutoWeb.getlocalSubProject_Working()._id
      );
      data.forEach((element) => {
        if (subproject.main_sectors?.includes(element.value) && element.type)
          this.type_main_sectors.push(element);
      });

      this.type_main_sectors = this.vhAlgorithm.sortVietnamesebyASC(this.type_main_sectors, 'label');
    });
  }

  selectChange(event, field) {
    this.editCategoryForm.controls[field].setValue(event);
    this.updateCategory(field, { [field]: event });
  }

  /** Khới tạo form
   *
   * @param value
   */
  initForm(value) {
    this.editCategoryForm = new FormGroup({
      link: new FormControl(value.link, [Validators.required, Validators.pattern('^(?!.*[\\/\\\\])[a-z0-9-]+$')]),
      id_father_category: new FormControl(value.id_father_category),
      step: new FormControl(value.step),
      id_main_sectors: new FormControl(value.id_main_sectors),
    });

    let fieldNames: any = [
      { field: 'name', validators: { required: true, pattern: '' } },
      { field: 'description', validators: { required: false, pattern: '' } },
      { field: 'description_short', validators: { required: false, pattern: '' } },

      { field: 'webapp_seo_title', validators: { required: false, pattern: '' } },
      { field: 'webapp_seo_description', validators: { required: false, pattern: '' } },
      { field: 'webapp_seo_keyword', validators: { required: false, pattern: '' } },
    ];

    this.newFields.filter((f: any) => f.field_input_type == "select-multiple").forEach((field: any) => {
      this.editCategoryForm.addControl(field.field_custom, new FormControl(value[field.field_custom] || [], field.field_required ? [Validators.required] : []));
    });

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

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminEditHandleChangeMultiLanguage(
        this.editCategoryForm,
        language.code,
        [...this.newFields.filter((f: any) => f.field_input_type != "select-multiple"), ...this.newFieldsCKEditor],
        fieldNames,
        value,
      );
    });

    if (value?.imgs?.length) {
      this.img = {
        path: value.imgs[0],
        visible: false,
      };
    }

    if (value.id_main_sectors.length) {
      this.categorys = this.categorysSearch.filter(e => value.id_main_sectors.some(mst => e.id_main_sectors.includes(mst)));
    }
  }

  createMessage(type: string, key: string, duration: number = 2000) {
    this.translate.get(key).subscribe((translatedMessage: string) => {
      this.nzMessageService.create(type, translatedMessage, { nzDuration: duration });
    });
  }

  checkName(value) {
    if (value !== this.nameCategory) return true;
    else return false;
  }

  updateCategory(field, objectUpdate) {
    if (!objectUpdate[field] && this.editCategoryForm.get(field)?.errors?.required) return;
    if (field == 'imgs') {
      objectUpdate = {
        imgs: [this.img.path],
      };
    }

    if (field == 'link') {
      // check link only have a-z and không dấu, 0-9, - if not return error
      if (!/^[a-zA-Z0-9-]*$/.test(objectUpdate.link.trim())) {
        this.functionService.createMessage('error', this.languageService.translate('duong_dan_chi_duoc_phep_chua_a_z_0_9_va_dau_gach_ngang'));
        return;
      }

      if (!this.editCategoryForm.valid) {
        return this.createMessage(
          'error',
          'vui_long_dien_du_thong_tin'
        );
      }

      this.vhQueryAutoWeb.getCategorys_byFields({ link: { $eq: objectUpdate.link.trim() } })
        .then((res: any) => {
          if (res.vcode === 0) {
            if (res.data.length > 0) {
              this.createMessage('error', 'duong_dan_da_ton_tai');
              return;
            }

            this.vhQueryAutoWeb
              .updateCategory(this.data.category._id, objectUpdate)
              .then(
                (res: any) => {
                  if (res.vcode === 11) {
                    this.createMessage(
                      'error',
                      'phien_dang_nhap_da_het_han_vui_long_dang_nhap_lai'
                    );
                  }
                },
                (err) => {
                  console.log('updateCategory error', err);
                  this.createMessage(
                    'error',
                    'da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu_vui_long_thu_lai'
                  );
                }
              );

          }
        });
    } else {
      if (!this.editCategoryForm.valid) {
        return this.createMessage(
          'error',
          'vui_long_dien_du_thong_tin'
        );
      }

      this.vhQueryAutoWeb
        .updateCategory(this.data.category._id, objectUpdate)
        .then(
          (res: any) => {
            if (res.vcode === 11) {
              this.createMessage(
                'error',
                'phien_dang_nhap_da_het_han_vui_long_dang_nhap_lai'
              );
            }
          },
          (err) => {
            console.log('updateCategory error', err);
            this.createMessage(
              'error',
              'da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu_vui_long_thu_lai'
            );
          }
        );
    }
  }

  updateNewField(field, value) {

    this.vhQueryAutoWeb.updateCategory(this.data.category._id, { [field]: value }).then(
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

  close() {
    this.dialogRef.close({
      ...this.data,
      ...this.editCategoryForm.value,
    });
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
      .then((rsp: any) => {
        console.log(rsp);
        if (rsp.vcode != 0) {
          rsp.mess.error('Tải ảnh thất bại! Lý do: ' + rsp.message);
          return;
        }


        if (rsp.vcode === 0) {
          const object = {
            path: rsp.data,
            visible: false,
          };
          this.img = object;
          this.updateCategory('imgs', { imgs: [this.img] });
          this.createMessage(
            'success',
            'hinh_anh_da_duoc_tai_thanh_cong'
          );
        } else {
          this.createMessage(
            'error',
            `${this.languageService.translate('tai_anh_that_bai_li_do')}: ${rsp.message}`
          );
        }

      }, () => {
        this.createMessage(
          'error',
          'tai_anh_that_bai_vui_long_thu_lai'
        );
      });

    inputEle.value = '';
  }

  openLibrary() {
    const dialogRef = this.dialog.open(ManageLibraryComponent, {
      width: '85%',
      maxWidth: '100%',
      data: {
        startPath: this.path ? this.path : "/images",
        scopeData: "/images"
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.href) {
        const object = {
          path: result.href,
          visible: false,
        };
        this.img = object;
        this.updateCategory('imgs', { imgs: [this.img] });
      }
      this.path = result.path;
    });
  }



  deleteFileImage() {
    this.img.path = '';
    this.updateCategory('imgs', { imgs: [this.img] });
  }

  accpectLinkIFrame(item, value) {
    item.path = value;
    item.visible = false;
    this.updateCategory('imgs', { imgs: [this.img] });
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

  /**
   * update trường mobile_portrait_hidden or desktop_hidden cho object
   * @param value
   */
  /**
   * Hàm mở ra hộp thoại chọn icon
   */
  openDialogChooseIcon() {
    this.visible_config_tool = false;
    const dialogRef = this.dialog.open(ChooseImageComponent, {
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
        this.updateCategory('imgs', { imgs: [this.img] });
        this.functionService.createMessage('success', 'hinh_anh_da_duoc_tai_thanh_cong');

      })
      .catch((error: any) => {
        console.error('Error:', error);
        this.functionService.createMessage('error', 'tai_anh_that_bai_ly_do' + error.message);
      });

    this.isShowConfirmPopup = false;

  }

  changeUrl() {
    this.updateCategory('imgs', { imgs: [this.img] });
  }

  closePopover(e) {
    e?.stopPropagation();
    this.openPopover = false;
  }

  handleShowTransferImageToServer() {
    const dialogRef = this.dialog.open(TransferImageToServerComponent, {
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
    this.updateCategory('imgs', { imgs: [this.img] });
  }



  onMainSectorChange(event): void {
    if (event.value.length) {
      this.categorys = this.categorysSearch.filter(e => event.value.some(mst => e.id_main_sectors.includes(mst)));
    } else this.categorys = this.categorysSearch;
    const idFatherCategory = this.editCategoryForm.controls['id_father_category'].value;
    const exists = this.categorys.some(category => category._id === idFatherCategory);
    if (!exists && idFatherCategory) {
      this.editCategoryForm.controls['id_father_category'].setValue('');
      this.changeFatherCategory('');
    }
  }

  /**
   * bắt sk thay đổi danh mục cha để gán lại step cho danh mục cần thêm
   */
  changeFatherCategory(id_father_category) {
    if (id_father_category) {
      let step =
        this.categorys.find((e) => e._id == id_father_category).step + 1;
      this.editCategoryForm.controls['step'].setValue(step);
    } else this.editCategoryForm.controls['step'].setValue(0);
    this.vhQueryAutoWeb
      .updateCategory(this.data.category._id, {
        id_father_category: id_father_category,
        step: this.editCategoryForm.value.step,
      })
      .then(
        (res: any) => {
          if (res.vcode === 11) {
            this.createMessage(
              'error',
              'phien_dang_nhap_da_het_han_vui_long_dang_nhap_lai'
            );
          }
        },
        (err) => {
          console.log('updateCategory error', err);
          this.createMessage(
            'error',
            'da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu_vui_long_thu_lai'
          );
        }
      );
  }

  updateDynamicField(fieldKey: string, value: any) {
    const dynamicKey = fieldKey + '_' + this.functionService.languageTempCode;
    const updatedValue = { [dynamicKey]: value };
    this.updateCategory(dynamicKey, updatedValue);
  }

  getFormControl(controlName: string): FormControl {
    return this.editCategoryForm.get(controlName) as FormControl;
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
      { title: 'mo_ta_danh_muc', field: 'description' },
      { title: 'mo_ta_danh_muc_ngan', field: 'description_short' },

      { title: 'dac_ta_ky_thuat', field: 'technical_spec' },
      { title: 'thong_tin_khuyen_mai', field: 'promotion' },
      { title: 'thong_tin_hau_mai', field: 'after_sales' },
      { title: 'thong_tin_khac', field: 'other' },
    ];

    const dialogRef = this.dialog.open(DescriptionByDeviceComponent, {
      width: '60vw',
      height: '80vh',
      disableClose: true,
      data: {
        formData: this.editCategoryForm,
        tabs: staticTabs.concat(dynamicTabs),
        callUpdate: this.updateCategory.bind(this)
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
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

  handleEditCkeditor(item) {
    const dialogRef = this.dialog.open(VhCkeditorModalComponent, {
      width: '60vw',
      height: '80vh',
      data: {
        formData: this.editCategoryForm,
        item: item,
        type: 'categories' // để phân biệt upload ảnh cho danh mục hay sản phẩm
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.updateCategory(item.field_custom + '_' + this.functionService.languageTempCode, { [item.field_custom + '_' + this.functionService.languageTempCode]: this.getFormControl(item.field_custom + '_' + this.functionService.languageTempCode).value });
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

    if (Math.abs(scrollTop - main.scrollTop) > 1) {
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
