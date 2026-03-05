import { Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VhQueryAutoWeb, VhAlgorithm, VhImage } from 'vhautowebdb';
import { ManageLibraryComponent } from 'vhobjects-service';
import { AddCategoryComponent } from '../../categories/add-category/add-category.component';
import { LanguageService } from 'src/app/services/language.service';
import { ChooseImageComponent } from 'vhobjects-service';
import { TransferImageToServerComponent } from '../../components/dialog/transfer-image-to-server/transfer-image-to-server.component';
import { FunctionService } from 'vhobjects-service';
import { DescriptionByDeviceComponent } from '../../components/dialog/description-by-device/description-by-device.component';
import { VhCkeditorModalComponent } from '../../components/vh-ckeditor-modal/vh-ckeditor-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
@Component({
  selector: 'app-add-news',
  templateUrl: './add-news.component.html',
  styleUrls: ['./add-news.component.scss'],
})
export class AddNewsComponent implements OnInit {
  @Output() submitAddNew = new EventEmitter();
  public addNewsForm: FormGroup;
  public img: any = {
    path: '',
    visible: false,
  };
  public categories: any = [];
  public selectedListCategory = [];
  public path: any = '/images/database/news';
  newFields = [];
  newFieldsCKEditor = [];
  doneLoad = false;
  submitting = false; // Trạng thái submit form để tránh submit nhiều lần
  setupNewsImg;
  openPopover = false;
  visible_config_tool: boolean = false;
  compressWidth: number = 100;
  compressHeight: number = 100;
  id_subproject: string = '';
  resolution: any = {};

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
  isShowConfirmPopup: boolean = false;
  deviceWidthMax: number = 0;
  imageUrl: string = '';

  ckeditorFields = [
    {
      field_custom: 'content',
      field_lable: 'noi_dung_tin_tuc'
    },
    {
      field_custom: 'description',
      field_lable: 'mo_ta_ngan_tin_tuc'
    },
  ];
  
  reference_links = {
      link1: '',
      link2: '',
      link3: '',
      link4: '',
      link5: '',
    };


  constructor(
    private el: ElementRef,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public vhAlgorithm: VhAlgorithm,
    public functionService: FunctionService,
    public vhImage: VhImage,
    public dialog: MatDialog,
    public languageService: LanguageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddNewsComponent>,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.addNewsForm = this.fb.group({
      ['title_' + functionService.languageTempCode]: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
      ]),
    });
  }

  ngOnInit(): void {
    this.categories = this.data.categories.filter(c => c._id != 'all');
    this.setupNewsImg = this.data.setupNewsImg;

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
    this.vhQueryAutoWeb.getNewFields_byFields({ id_main_sector: { $eq: 'news' } })
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

  initForm(): void {
    this.addNewsForm = new FormGroup({
      date: new FormControl(new Date()),
      webapp_hidden: new FormControl(false),
      views: new FormControl(1),
      id_categorys: new FormControl([]),
      url_canonical: new FormControl(''),
    });

    let fieldNames: any = [
      { field: 'title', validators: { required: true, minLength: 5 } },
      { field: 'description', validators: { required: false } },
      { field: 'content', validators: { required: false } },
      { field: 'webapp_seo_title', validators: { required: false } },
      { field: 'webapp_seo_keyword', validators: { required: false } },
      { field: 'webapp_seo_description', validators: { required: false } },
    ];

    this.devices.forEach(device => {
      fieldNames.push(
        { field: `${device.value}_description`, validators: { required: false, pattern: '' } },
        { field: `${device.value}_content`, validators: { required: false, pattern: '' } },
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
      this.addNewsForm.addControl(field.field_custom, new FormControl(field.field_start_value || [], field.field_required ? [Validators.required] : []));
    });

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminAddHandleChangeMultiLanguage(
        this.addNewsForm,
        language.code,
        [...this.newFields.filter((f: any) => f.field_input_type != "select-multiple"), ...this.newFieldsCKEditor],
        fieldNames,
      );
    });

    this.doneLoad = true;
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

  /** Thực hiện tạo tin tức mới
   *
   */
  onSubmitAddNews(value) {
    if (this.addNewsForm.valid) {
      this.submitting = true;
      this.functionService.showLoading(this.languageService.translate('dang_them'));

      let blog = {
        ...value,
        type: 7,
        imgs: [this.img.path],
      };
      blog.link = this.functionService.nonAccentVietnamese(blog['title_' + this.functionService.defaultLanguage].trim());
      blog.link = blog.link.replace(/[^a-z0-9-]/g, '');
      this.vhQueryAutoWeb
        .getNewss_byFields({ link: { $eq: blog.link } })
        .then(
          (res: any) => {
            if (res.vcode === 0 && res.data.length != 0)
              blog.link = blog.link + '-1';
            blog.reference_links = Object.values(this.reference_links);
            this.vhQueryAutoWeb
              .addNews(blog)
              .then(
                (res: any) => {
                  console.log(res);

                  if (res.vcode === 0) {
                    // this.submitAddNew.emit(res.data);
                    this.dialogRef.close(res.data);
                    this.functionService.createMessage(
                      'success',
                      this.languageService.translate('tao_tin_tuc_moi_thanh_cong')
                    );
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
                    this.languageService.translate('da_xay_ra_loi')
                  );
                }
              )
              .catch((error) => {
                this.functionService.createMessage(
                  'error',
                  this.languageService.translate('da_xay_ra_loi')
                );
              }).finally(() => {
                this.functionService.hideLoading();
                setTimeout(() => {
                  this.submitting = false;
                }, 100);
              });
          },
          (err) => {
            this.functionService.createMessage(
              'error',
              this.languageService.translate('da_xay_ra_loi')
            );
            this.functionService.hideLoading();
            this.submitting = false;
          }
        );
    }
  }

  close(): void {
    this.dialogRef.close();
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

    let compress_type = this.setupNewsImg.upload_image.compress_type;

    switch (this.setupNewsImg.upload_image.compress_type) {
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



    this.vhImage.getImageFromDesktop_Autoweb(file, 'images/database/newss', {
      compress_type: compress_type,
      resolution: resolution
    })
      .then(
        (rsp: any) => {

          if (rsp.vcode === 0) {

            const object = {
              path: rsp.data,
            };
            this.img = object;
            this.functionService.createMessage(
              'success',
              this.languageService.translate('hinh_anh_da_duoc_tai_thanh_cong')
            );
          } else {
            this.functionService.createMessage(
              'error',
              `${this.languageService.translate('tai_anh_that_bai_li_do')}: ${rsp.message}`
            );
          }

        },
        () => {
          this.functionService.createMessage(
            'error',
            this.languageService.translate('tai_anh_that_bai_li_do')
          );
        }
      );

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
      if (result && result.id_main_sectors.includes('news')) {
        this.data.categories.push(result);
        this.categories = [...this.categories, result];
      }
    });
  }

  deleteFileImage() {
    this.img.path = '';
  }

  accpectLinkIFrame(item, value) {
    item.path = value;
    item.visible = false;
  }

  handleChangeImage() {
    switch (this.setupNewsImg.upload_image.source) {
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


  closePopover(e) {
    e?.stopPropagation();
    this.openPopover = false;
  }

  /**
* hàm này để cập nhật resolution cho subproject
*/
  updateSetup() {
    this.vhQueryAutoWeb
      .updateSetup(this.setupNewsImg._id, {
        upload_image: {
          compress_type: this.setupNewsImg.upload_image.compress_type,
          source: this.setupNewsImg.upload_image.source,
        }
      })
      .then((bool: any) => {

      });
  }


  /**
 * Lấy hình ảnh từ url đẩy lên server với kích thước hình thay đổi
 * */
  handleOkConfirm() {

    let resolution = {};

    let compress_type = this.setupNewsImg.upload_image.compress_type;

    // nén theo màn hình thì lấy kích thước màn hình lớn nhất
    switch (this.setupNewsImg.upload_image.compress_type) {
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
    this.vhImage.getImageFromURL_Autoweb(this.img?.path, "images/database/newss", {
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
    const dialogRef = this.dialog.open(TransferImageToServerComponent, {
      width: '40vw',
      height: '40vh',
      disableClose: true,
      data: {
        setupsImage: this.setupNewsImg,
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


  updateUrl() {
    this.img.path = this.imageUrl;
  }

  selectChange(event, field) {
    this.addNewsForm.controls[field].setValue(event);
  }

  getFormControl(controlName: string): FormControl {
    return this.addNewsForm.get(controlName) as FormControl;
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
      { title: 'noi_dung_tin_tuc', field: 'content' },
      { title: 'mo_ta_ngan', field: 'description' }
    ];

    const dialogRef = this.dialog.open(DescriptionByDeviceComponent, {
      width: '60vw',
      height: '80vh',
      disableClose: true,
      data: {
        formData: this.addNewsForm,
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
        formData: this.addNewsForm,
        item: item,
        type: 'news' // để phân biệt upload ảnh cho danh mục hay sản phẩm
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
  public EDITOR = DecoupledEditor;
  private scrollTimer: any;
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

    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) =>
      this.vhImage.MyUploadImageAdapter(loader, `images/database/news`);
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
 
  openFromLibrary(index: number, type: string | 'reference_links' | 'additional_image_links' | 'image_link' = 'reference_links'): void {
    const dialogRef = this.dialog.open(ManageLibraryComponent, {
      width: '85%',
      maxWidth: '100%',
      disableClose: true,
      data: {
        startPath: this.path ? this.path : "/images",
        scopeData: '/images',
      },
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data.href) {
        if (type === 'reference_links') {
          this.reference_links[`link${index}`] = data.href;
        } 
      }
      this.path = data.path;
    });
  }
}
