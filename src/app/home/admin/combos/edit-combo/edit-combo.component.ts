import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  selector: 'app-edit-combo',
  templateUrl: './edit-combo.component.html',
  styleUrls: ['./edit-combo.component.scss']
})
export class EditComboComponent implements OnInit {
  content: any = '';
  public editComboForm: FormGroup;
  public categories: any = [];
  public price: any;
  public barcode: boolean = false;
  public category: any;
  public img: string = '';
  public listImgProduct: Array<any> = [];
  public listBarcode = [];
  public visibleFormCombo = false;
  public selectedListCategory = [];
  public selectedIndexTabset = 0;
  public comboIngredients: Array<any> = []; // Chứa tất cả các thành phần trong combo
  public comboIngredientsTrash: Array<any> = []; // Biến dùng để chứa tất cả các thành phần trong combo trong quá trình chọn sản phẩm vào combo
  public comboIngredientsUpdate: Array<any> = []; //Mảng combo dùng cho việc cập nhật dữ liệu
  public total = 0; // Giá tổng combo
  public units: Array<any> = [];
  public products: Array<any> = []; // Danh sách sản phẩm được chọn
  public isASC = false;
  public id_category = 'all';
  public limitProduct: number = 10; // giới hạn sản phẩm trên 1 trang
  public pageCurrentProduct = 1;
  public loading_product = false;
  public totalPages = 1;
  public pageGotoProduct: number = 1; /** Trang người dùng chuyển tới hiển thị = */
  public pageShowChoose: any = [0, 1, 2]; /** Số trang hiển thị = */
  public categoryInProducts: Array<any> = []; // Danh sách danh mục có trong products được lấy về

  public path: any = ''; // Dùng để chứa đường dẫn ảnh trả về từ thư viện
  setupComboImg: any = {};
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
    public vhComponent: VhComponent,
    public functionService: FunctionService,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public vhImage: VhImage,
    public dialog: MatDialog,
    public languageService: LanguageService,
    public dialogRef: MatDialogRef<EditComboComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit() {
    this.categories = this.data.categories.filter(c => c._id != 'all');

    this.setupComboImg = this.data.setupComboImg;
    if (this.data) {
      this.getNewFileds();
    }

    // Lắng click ra ngoài (backdrop)
    // đoạn này để đóng mà modal và trả về result, nếu ko sẽ ko cập nhật giao diện
    this.dialogRef.backdropClick().subscribe(() => {
      this.close();
    });
  }


  getNewFileds() {
    this.vhQueryAutoWeb.getNewFields_byFields({ id_main_sector: { $eq: 'combo' } })
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
        this.initForm(this.data.dataEditCombo);
      });
  }

  ngAfterViewInit(): void {
    // Đoạn này sẽ giúp khởi tạo CKEDITOR không bị ẩn thanh tool
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

  trackByFn(index: number, item: any) {
    return item.id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }


  /** Hàm khởi tạo form
   *
   */
  initForm(comboData: any): void {
    const { languageTempCode, defaultLanguage } = this.functionService;
    this.editComboForm = new FormGroup({
      units: new FormControl(comboData.units),
      id_categorys: new FormControl(comboData.id_categorys && comboData.id_categorys.length > 0 ? comboData.id_categorys : []),
      webapp_img: new FormControl(comboData.webapp_img),
      webapp_img1: new FormControl(comboData.webapp_img1),
      webapp_img2: new FormControl(comboData.webapp_img2),
      webapp_img3: new FormControl(comboData.webapp_img3),
      webapp_hidden: new FormControl(comboData.webapp_hidden),
      link: new FormControl(comboData.link, [Validators.required, Validators.pattern('^(?!.*[\\/\\\\])[a-z0-9-]+$')]),
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
      this.editComboForm.addControl(field.field_custom, new FormControl(comboData[field.field_custom] || [], field.field_required ? [Validators.required] : []));
    });

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminEditHandleChangeMultiLanguage(
        this.editComboForm,
        language.code,
        [...this.newFields.filter((f: any) => f.field_input_type != "select-multiple"), ...this.newFieldsCKEditor],
        fieldNames,
        comboData,
        this.getUnitsByRatio.bind(this),
      );
    });

    if (comboData.units) {
      const unit = this.getUnitsByRatio(comboData.units, 1);
      const patternValidator = Validators.pattern(
        '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)'
      );

      // Các field cố định
      const fixedFields = [
        { name: 'price', value: unit?.price ?? 0 },
        { name: 'barcode', value: unit?.barcode ?? '', validators: [] },
      ];

      // Thêm các field cố định
      fixedFields.forEach(({ name, value, validators = [Validators.required, patternValidator] }) => {
        this.editComboForm.addControl(
          name,
          new FormControl(value, Validators.compose(validators))
        );
      });

      // Tự động thêm các field bắt đầu bằng `unit_`
      Object.keys(unit)
        .filter((key) => key.startsWith('unit_'))
        .forEach((key) => {
          if (!this.editComboForm.contains(key)) {
            this.editComboForm.addControl(key, new FormControl(unit[key] ?? '', Validators.required));
          }
        });
      if (!this.editComboForm.contains(`unit_${languageTempCode}`)) {
        this.editComboForm.addControl(`unit_${languageTempCode}`,
          new FormControl('', Validators.required)
        );
      }
    }

    if (comboData.combos) {
      this.handleComboIngredients(comboData.combos);
    }

    if (comboData.imgs.length) {
      this.listImgProduct = comboData.imgs.map((map) => ({
        path: map,
        visible: false,
      }));
    }
  }

  /** Hàm thực hiện xử lý thành phần combo, tính tổng combos
   *
   * @param combos
   */
  handleComboIngredients(combos: Array<any>) {

    combos.forEach((element) => {
      let id_sub_or_product = element.id_subproduct ? element.id_subproduct : element.id_product;

      let query = element.type == 1 ? this.vhQueryAutoWeb.getFood(id_sub_or_product) : this.vhQueryAutoWeb.getProduct(id_sub_or_product);

      Promise.all([query]).then(([result]: any) => {
        element['name'] = result.name;
        element['units'] = result.units;
        const unitData = this.vhQueryAutoWeb.getUnit_byRatio(result.units, element.ratio);
        // Lấy tất cả các trường bắt đầu bằng "unit_" và thêm vào element
        Object.keys(unitData).forEach((key) => {
          if (key.startsWith('unit_')) {
            element[key] = unitData[key]; // Thêm trực tiếp vào element
          }
        });
      });
    });
    this.comboIngredients = this.comboIngredientsTrash = combos;
    this.updateTotalCombo();
  }

  getUnitsByRatio(units: Array<any>, ratio: number) {
    return units.find((unit) => unit.ratio == ratio);
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
      this.editComboForm.controls['barcode'].setValue(newbarcode);
      this.updateProduct('barcode', {
        barcode: this.editComboForm.value.barcode,
      });
    }
  }

  /** Hàm thực hiện check barcode tự động có hợp lệ không
   *
   * @param barcode
   * @returns true: barcode hợp lệ, false: barcode không hợp lệ
   */
  async checkBarcode(barcode: string): Promise<boolean> {
    try {
      const product = await this.vhQueryAutoWeb.getCombos_byFields({
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
      if (result && result.id_main_sectors.includes('combo')) {
        this.data.categories.push(result);
        this.categories = [...this.categories, result];
      }
    });
  }

  /** Hàm thực hiện cập nhật dữ liệu thay đổi của sản phẩm
   *
   * @param field trường cập nhật
   * @param objectUpdate dữ liệu cập nhật. Vd: {field: 'aaa'}
   */
  updateProduct(field: string, objectUpdate) {
    if (!objectUpdate[field] && this.editComboForm.get(field)?.errors?.required) return;

    objectUpdate.updated_at = new Date().toISOString();
    if (!objectUpdate.created_at) objectUpdate.created_at = new Date().toISOString();

    if (['barcode', 'price'].includes(field) || field.startsWith('unit_')) {
      const { barcode } = this.editComboForm.value;
      const unitsNew = this.editComboForm.value.units;
      const index = unitsNew.findIndex(({ ratio }) => ratio === 1);
      // Khởi tạo đối tượng data
      let data: any = {
        barcode,
        ratio: 1,
        price: this.editComboForm.value.price,
        default: unitsNew[index]?.default || false,
      };

      // Thêm tất cả các trường bắt đầu bằng "unit_" vào data
      Object.keys(this.editComboForm.value)
        .filter((key) => key.startsWith('unit_'))
        .forEach((key) => {
          data[key] = this.editComboForm.value[key];
        });

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

      this.vhQueryAutoWeb.getCombos_byFields({ link: { $eq: objectUpdate.link.trim() } })
        .then((res: any) => {
          if (res.vcode === 0) {
            if (res.data.length > 0) {
              this.functionService.createMessage('error', 'duong_dan_da_ton_tai');
              return;
            }

            this.vhQueryAutoWeb
              .updateCombo(this.data.dataEditCombo._id, objectUpdate)
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
                  console.log(err);
                  this.functionService.createMessage(
                    'error',
                    'da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu_vui_long_thu_lai'
                  );
                }
              );

          }
        });
    } else {
      this.vhQueryAutoWeb.updateCombo(this.data.dataEditCombo._id, objectUpdate).then(
        (res: any) => {
          if (res.vcode === 11) {
            this.functionService.createMessage(
              'error',
              this.languageService.translate('phien_dang_nhap_da_het_han')
            );
          }
        },
        (err) => {
          console.log(err);
          this.functionService.createMessage(
            'error',
            this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_cap_nhat_du_lieu')
          );
        }
      );
    }
  }


  /** Hàm thực hiển chọn đơn vị
   *
   * @param item sản phẩm
   * @param event đơn vị chọn
   * @returns đơn vị chọn và gán vào unitDefault
   */
  selecUnit(item, event) {
    return (item.unitDefault = item.units.find((item) => item == event));
  }

  /** Thực hiện giảm số lượng item trong combo
   *
   * @param item
   */
  subQuantity(item) {
    item.quantity = item.quantity - 1;
    if (item.quantity < 0) item.quantity = 0;
    this.updateTotalCombo();
  }

  /** Thực hiện tăng số lượng item trong combo
   *
   * @param item
   */
  addQuantity(item) {
    item.quantity = item.quantity + 1;
    this.updateTotalCombo();
  }

  /** Hàm thực hiện sửa số lượng trong combo
   *
   * @param product
   */
  editQuantity(product) {
    this.vhComponent
      .alertInputMoney(
        this.languageService.translate('sua_so_luong'),
        '',
        'OK',
        'Cancel',
        [
          {
            name: 'quantity',
            type: 'text',
            placeholder: 'Số lượng',
            value: product.quantity,
            cssClass: 'selling-quantity',
            id: 'selling-quantity',
            attributes: {
              inputmode: 'numeric',
              maxLength: 10,
            },
          },
        ],
        false,
        () => { }
      )
      .then(
        (result: any) => {
          if (result) {
            if (result.value) {
              if (parseFloat(result.value.quantity) <= 0) {
                this.vhComponent.showToast(
                  3000,
                  this.languageService.translate('so_luong_phai_lon_hon_0'),
                  'alert-toast'
                );
              } else {
                product.quantity = parseFloat(result.value.quantity);
                this.updateTotalCombo();
              }
            }
          }
        },
        () => { }
      );
  }

  // Điều chỉnh giá bán của sản phẩm đã chọn
  editPrice(item) {
    this.vhComponent
      .alertInputMoney(
        this.languageService.translate('sua_gia_tien'),
        '',
        'OK',
        'Cancel',
        [
          {
            name: 'price',
            type: 'tel',
            placeholder: 'Giá tiền',
            value: item.price,
            cssClass: 'size-price',
            id: 'size-price',
            attributes: {
              maxLength: 15,
              onBlur: () => {
                let regExpPrice: RegExp =
                  /(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)/;
                let price = document.getElementById('size-price')['value'];
                if (!regExpPrice.test(price)) {
                  document.getElementById('size-price')['value'] = 0;
                  this.cleaveJS('size-price');
                }
              },
            },
          },
        ],
        false,
        () => {
          this.cleaveJS('size-price');
        }
      )
      .then(
        (result) => {
          let price = document.getElementById('size-price')['value'];
          if (price) {
            item.price = parseFloat(this.price.getRawValue());
            this.updateTotalCombo();
          }
        },
        () => { }
      );
  }

  cleaveJS(className) {
    this.price = this.vhAlgorithm.vhnumeral(`.${className}`);
  }

  /** Hàm thực hiện đóng modal chọn sản phẩm vào combo
   *
   */
  handleOkAddComboComponent() {
    this.visibleFormCombo = false;
    this.comboIngredients = this.comboIngredientsTrash;
    this.updateTotalCombo();
  }

  /** Hàm thực hiện cập nhật giá trị combo khi có thay đổi (số lượng, giá, đơn vị)
   *
   */
  updateTotalCombo() {
    this.total = this.comboIngredients.reduce(
      (prev: number, next) => prev + next.quantity * next.price,
      0
    );
    this.editComboForm.controls['price'].setValue(this.total);
    this.comboIngredientsUpdate = this.comboIngredients.map((item) => {
      const updatedItem: any = {
        id_product: item.id_product,
        type: item.type,
        quantity: item.quantity,
        price: item.price,
        ratio: item.ratio,
      };

      // Duyệt qua các khóa trong item và thêm các trường bắt đầu bằng "unit_" vào updatedItem
      Object.keys(item).forEach((key) => {
        if (key.startsWith('unit_')) {
          updatedItem[key] = item[key]; // Thêm tất cả các trường bắt đầu bằng "unit_" vào updatedItem
        }
      });

      if (item.id_subproduct) {
        updatedItem.id_subproduct = item.id_subproduct;
      }

      return updatedItem;
    });
    this.updateProduct('price', { price: this.editComboForm.value.price });
    this.updateProduct('combos', { combos: this.comboIngredientsUpdate });
  }

  /** Hàm thực hiện xóa thành phần bất kì trong combo
   *
   * @param product
   */
  daleteComboIngredients(product: any) {
    this.comboIngredients = this.comboIngredientsTrash =
      this.comboIngredients.filter(
        (filter) => filter.id_product !== product.id_product
      );
    this.updateTotalCombo();
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
      ...this.data.dataEditCombo,
      ...this.editComboForm.value,
    });
  }

  selectChange(event, field) {
    this.editComboForm.controls[field].setValue(event);
    this.updateProduct(field, { [field]: event });
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
    return this.editComboForm.get(controlName) as FormControl;
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
      width: '60vw',
      height: '80vh',
      disableClose: true,
      data: {
        formData: this.editComboForm,
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

  handleEditCkeditor(item) {
    const dialogRef = this.dialog.open(VhCkeditorModalComponent, {
      width: '60vw',
      height: '80vh',
      data: {
        formData: this.editComboForm,
        item: item,
        type: 'combos' // để phân biệt upload ảnh cho danh mục hay sản phẩm
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.updateDynamicField(item.field_custom, this.editComboForm.get(item.field_custom + '_' + this.functionService.languageTempCode).value);
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

    editor.plugins.get('FileRepository').createUploadAdapter = (
      loader: any
    ) => {
      return this.vhImage.MyUploadImageAdapter(loader, 'images/database/combos');
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
