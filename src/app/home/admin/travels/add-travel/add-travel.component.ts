import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb, VhImage } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import { AddCategoryComponent } from '../../categories/add-category/add-category.component';
import { ManageLibraryComponent } from 'vhobjects-service';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-add-travel',
  templateUrl: './add-travel.component.html',
  styleUrls: ['./add-travel.component.scss'],
})
export class AddTravelComponent implements OnInit {
  @Output() submitAddTravel = new EventEmitter();
  /** Palette màu cho CKEDITOR */
  colorPalette = [
    { color: 'hsl(0, 100%, 95%)', label: ' ' }, { color: 'hsl(0, 100%, 90%)', label: ' ' }, { color: 'hsl(0, 100%, 85%)', label: ' ' }, { color: 'hsl(0, 100%, 80%)', label: ' ' }, { color: 'hsl(0, 100%, 75%)', label: ' ' },{ color: 'hsl(0, 100%, 70%)', label: ' ' }, { color: 'hsl(0, 100%, 65%)', label: ' ' }, { color: 'hsl(0, 100%, 60%)', label: ' ' }, { color: 'hsl(0, 100%, 55%)', label: ' ' }, { color: 'hsl(0, 100%, 50%)', label: ' ' },{ color: 'hsl(0, 100%, 45%)', label: ' ' }, { color: 'hsl(0, 100%, 40%)', label: ' ' }, { color: 'hsl(0, 100%, 35%)', label: ' ' }, { color: 'hsl(0, 100%, 30%)', label: ' ' }, { color: 'hsl(0, 100%, 25%)', label: ' ' },{ color: 'hsl(0, 100%, 20%)', label: ' ' }, { color: 'hsl(0, 100%, 15%)', label: ' ' }, { color: 'hsl(0, 100%, 10%)', label: ' ' }, { color: 'hsl(0, 100%, 5%)', label: ' ' }, { color: 'hsl(0, 100%, 2%)', label: ' ' }, { color: 'hsl(120, 100%, 95%)', label: ' ' }, { color: 'hsl(120, 100%, 90%)', label: ' ' }, { color: 'hsl(120, 100%, 85%)', label: ' ' }, { color: 'hsl(120, 100%, 80%)', label: ' ' }, { color: 'hsl(120, 100%, 75%)', label: ' ' },{ color: 'hsl(120, 100%, 70%)', label: ' ' }, { color: 'hsl(120, 100%, 65%)', label: ' ' }, { color: 'hsl(120, 100%, 60%)', label: ' ' }, { color: 'hsl(120, 100%, 55%)', label: ' ' }, { color: 'hsl(120, 100%, 50%)', label: ' ' },{ color: 'hsl(120, 100%, 45%)', label: ' ' }, { color: 'hsl(120, 100%, 40%)', label: ' ' }, { color: 'hsl(120, 100%, 35%)', label: ' ' }, { color: 'hsl(120, 100%, 30%)', label: ' ' }, { color: 'hsl(120, 100%, 25%)', label: ' ' },{ color: 'hsl(120, 100%, 20%)', label: ' ' }, { color: 'hsl(120, 100%, 15%)', label: ' ' }, { color: 'hsl(120, 100%, 10%)', label: ' ' }, { color: 'hsl(120, 100%, 5%)', label: ' ' }, { color: 'hsl(120, 100%, 2%)', label: ' ' }, { color: 'hsl(240, 100%, 95%)', label: ' ' }, { color: 'hsl(240, 100%, 90%)', label: ' ' }, { color: 'hsl(240, 100%, 85%)', label: ' ' }, { color: 'hsl(240, 100%, 80%)', label: ' ' }, { color: 'hsl(240, 100%, 75%)', label: ' ' },{ color: 'hsl(240, 100%, 70%)', label: ' ' }, { color: 'hsl(240, 100%, 65%)', label: ' ' }, { color: 'hsl(240, 100%, 60%)', label: ' ' }, { color: 'hsl(240, 100%, 55%)', label: ' ' }, { color: 'hsl(240, 100%, 50%)', label: ' ' },{ color: 'hsl(240, 100%, 45%)', label: ' ' }, { color: 'hsl(240, 100%, 40%)', label: ' ' }, { color: 'hsl(240, 100%, 35%)', label: ' ' }, { color: 'hsl(240, 100%, 30%)', label: ' ' }, { color: 'hsl(240, 100%, 25%)', label: ' ' },{ color: 'hsl(240, 100%, 20%)', label: ' ' }, { color: 'hsl(240, 100%, 15%)', label: ' ' }, { color: 'hsl(240, 100%, 10%)', label: ' ' }, { color: 'hsl(240, 100%, 5%)', label: ' ' }, { color: 'hsl(240, 100%, 2%)', label: ' ' }, { color: 'hsl(60, 100%, 95%)', label: ' ' }, { color: 'hsl(60, 100%, 90%)', label: ' ' }, { color: 'hsl(60, 100%, 85%)', label: ' ' }, { color: 'hsl(60, 100%, 80%)', label: ' ' }, { color: 'hsl(60, 100%, 75%)', label: ' ' },{ color: 'hsl(60, 100%, 70%)', label: ' ' }, { color: 'hsl(60, 100%, 65%)', label: ' ' }, { color: 'hsl(60, 100%, 60%)', label: ' ' }, { color: 'hsl(60, 100%, 55%)', label: ' ' }, { color: 'hsl(60, 100%, 50%)', label: ' ' },{ color: 'hsl(60, 100%, 45%)', label: ' ' }, { color: 'hsl(60, 100%, 40%)', label: ' ' }, { color: 'hsl(60, 100%, 35%)', label: ' ' }, { color: 'hsl(60, 100%, 30%)', label: ' ' }, { color: 'hsl(60, 100%, 25%)', label: ' ' },{ color: 'hsl(60, 100%, 20%)', label: ' ' }, { color: 'hsl(60, 100%, 15%)', label: ' ' }, { color: 'hsl(60, 100%, 10%)', label: ' ' }, { color: 'hsl(60, 100%, 5%)', label: ' ' }, { color: 'hsl(60, 100%, 2%)', label: ' ' }, { color: 'hsl(30, 100%, 95%)', label: ' ' }, { color: 'hsl(30, 100%, 90%)', label: ' ' }, { color: 'hsl(30, 100%, 85%)', label: ' ' }, { color: 'hsl(30, 100%, 80%)', label: ' ' }, { color: 'hsl(30, 100%, 75%)', label: ' ' },{ color: 'hsl(30, 100%, 70%)', label: ' ' }, { color: 'hsl(30, 100%, 65%)', label: ' ' }, { color: 'hsl(30, 100%, 60%)', label: ' ' }, { color: 'hsl(30, 100%, 55%)', label: ' ' }, { color: 'hsl(30, 100%, 50%)', label: ' ' },{ color: 'hsl(30, 100%, 45%)', label: ' ' }, { color: 'hsl(30, 100%, 40%)', label: ' ' }, { color: 'hsl(30, 100%, 35%)', label: ' ' }, { color: 'hsl(30, 100%, 30%)', label: ' ' }, { color: 'hsl(30, 100%, 25%)', label: ' ' },{ color: 'hsl(30, 100%, 20%)', label: ' ' }, { color: 'hsl(30, 100%, 15%)', label: ' ' }, { color: 'hsl(30, 100%, 10%)', label: ' ' }, { color: 'hsl(30, 100%, 5%)', label: ' ' }, { color: 'hsl(30, 100%, 2%)', label: ' ' }, { color: 'hsl(330, 100%, 95%)', label: ' ' }, { color: 'hsl(330, 100%, 90%)', label: ' ' }, { color: 'hsl(330, 100%, 85%)', label: ' ' }, { color: 'hsl(330, 100%, 80%)', label: ' ' }, { color: 'hsl(330, 100%, 75%)', label: ' ' },{ color: 'hsl(330, 100%, 70%)', label: ' ' }, { color: 'hsl(330, 100%, 65%)', label: ' ' }, { color: 'hsl(330, 100%, 60%)', label: ' ' }, { color: 'hsl(330, 100%, 55%)', label: ' ' }, { color: 'hsl(330, 100%, 50%)', label: ' ' },{ color: 'hsl(330, 100%, 45%)', label: ' ' }, { color: 'hsl(330, 100%, 40%)', label: ' ' }, { color: 'hsl(330, 100%, 35%)', label: ' ' }, { color: 'hsl(330, 100%, 30%)', label: ' ' }, { color: 'hsl(330, 100%, 25%)', label: ' ' },{ color: 'hsl(330, 100%, 20%)', label: ' ' }, { color: 'hsl(330, 100%, 15%)', label: ' ' }, { color: 'hsl(330, 100%, 10%)', label: ' ' }, { color: 'hsl(330, 100%, 5%)', label: ' ' }, { color: 'hsl(330, 100%, 2%)', label: ' ' }, { color: 'hsl(270, 100%, 95%)', label: ' ' }, { color: 'hsl(270, 100%, 90%)', label: ' ' }, { color: 'hsl(270, 100%, 85%)', label: ' ' }, { color: 'hsl(270, 100%, 80%)', label: ' ' }, { color: 'hsl(270, 100%, 75%)', label: ' ' },{ color: 'hsl(270, 100%, 70%)', label: ' ' }, { color: 'hsl(270, 100%, 65%)', label: ' ' }, { color: 'hsl(270, 100%, 60%)', label: ' ' }, { color: 'hsl(270, 100%, 55%)', label: ' ' }, { color: 'hsl(270, 100%, 50%)', label: ' ' },{ color: 'hsl(270, 100%, 45%)', label: ' ' }, { color: 'hsl(270, 100%, 40%)', label: ' ' }, { color: 'hsl(270, 100%, 35%)', label: ' ' }, { color: 'hsl(270, 100%, 30%)', label: ' ' }, { color: 'hsl(270, 100%, 25%)', label: ' ' },{ color: 'hsl(270, 100%, 20%)', label: ' ' }, { color: 'hsl(270, 100%, 15%)', label: ' ' }, { color: 'hsl(270, 100%, 10%)', label: ' ' }, { color: 'hsl(270, 100%, 5%)', label: ' ' }, { color: 'hsl(270, 100%, 2%)', label: ' ' }, { color: 'hsl(0, 0%, 0%)', label: ' ' }, { color: 'hsl(0, 0%, 10%)', label: ' ' }, { color: 'hsl(0, 0%, 20%)', label: ' ' }, { color: 'hsl(0, 0%, 30%)', label: ' ' }, { color: 'hsl(0, 0%, 40%)', label: ' ' },{ color: 'hsl(0, 0%, 50%)', label: ' ' }, { color: 'hsl(0, 0%, 60%)', label: ' ' }, { color: 'hsl(0, 0%, 70%)', label: ' ' }, { color: 'hsl(0, 0%, 80%)', label: ' ' }, { color: 'hsl(0, 0%, 90%)', label: ' ' },{ color: 'hsl(0, 0%, 95%)', label: ' ' }, { color: 'hsl(0, 0%, 92%)', label: ' ' }, { color: 'hsl(0, 0%, 85%)', label: ' ' }, { color: 'hsl(0, 0%, 78%)', label: ' ' }, { color: 'hsl(0, 0%, 71%)', label: ' ' },{ color: 'hsl(0, 0%, 64%)', label: ' ' }, { color: 'hsl(0, 0%, 57%)', label: ' ' }, { color: 'hsl(0, 0%, 50%)', label: ' ' }, { color: 'hsl(0, 0%, 43%)', label: ' ' }, { color: 'hsl(0, 0%, 36%)', label: ' ' }, { color: 'hsl(0, 0%, 100%)', label: ' ' }, { color: 'hsl(0, 0%, 95%)', label: ' ' }, { color: 'hsl(0, 0%, 90%)', label: ' ' }, { color: 'hsl(0, 0%, 85%)', label: ' ' }, { color: 'hsl(0, 0%, 80%)', label: ' ' }, { color: 'hsl(0, 0%, 75%)', label: ' ' }, { color: 'hsl(0, 0%, 70%)', label: ' ' }, { color: 'hsl(0, 0%, 65%)', label: ' ' }, { color: 'hsl(0, 0%, 60%)', label: ' ' }, { color: 'hsl(0, 0%, 55%)', label: ' ' },{ color: 'hsl(0, 0%, 50%)', label: ' ' }, { color: 'hsl(0, 0%, 45%)', label: ' ' }, { color: 'hsl(0, 0%, 40%)', label: ' ' }, { color: 'hsl(0, 0%, 35%)', label: ' ' }, { color: 'hsl(0, 0%, 30%)', label: ' ' },{ color: 'hsl(0, 0%, 25%)', label: ' ' }, { color: 'hsl(0, 0%, 20%)', label: ' ' }, { color: 'hsl(0, 0%, 15%)', label: ' ' }, { color: 'hsl(0, 0%, 10%)', label: ' ' }, { color: 'hsl(0, 0%, 5%)', label: ' ' }, { color: 'hsl(30, 100%, 95%)', label: ' ' }, { color: 'hsl(30, 100%, 90%)', label: ' ' }, { color: 'hsl(30, 100%, 85%)', label: ' ' }, { color: 'hsl(30, 100%, 80%)', label: ' ' }, { color: 'hsl(30, 100%, 75%)', label: ' ' }, { color: 'hsl(30, 100%, 70%)', label: ' ' }, { color: 'hsl(30, 100%, 65%)', label: ' ' }, { color: 'hsl(30, 100%, 60%)', label: ' ' }, { color: 'hsl(30, 100%, 55%)', label: ' ' }, { color: 'hsl(30, 100%, 50%)', label: ' ' }, { color: 'hsl(30, 100%, 45%)', label: ' ' }, { color: 'hsl(30, 100%, 40%)', label: ' ' }, { color: 'hsl(30, 100%, 35%)', label: ' ' }, { color: 'hsl(30, 100%, 30%)', label: ' ' }, { color: 'hsl(30, 100%, 25%)', label: ' ' }, { color: 'hsl(30, 100%, 20%)', label: ' ' }, { color: 'hsl(30, 100%, 15%)', label: ' ' }, { color: 'hsl(30, 100%, 10%)', label: ' ' }, { color: 'hsl(30, 100%, 5%)', label: ' ' }, { color: 'hsl(30, 100%, 2%)', label: ' ' }
  ];
  public EDITOR: any = DecoupledEditor;
  public config: any = {
    toolbar: [
      'heading',
      '|',
      'alignment',
      '|',
      'bold',
      'italic',
      'strikethrough',
      'underline',
      'subscript',
      'superscript',
      '|',
      'link',
      '|',
      'bulletedList',
      'numberedList',
      'todoList',
      '-',
      'fontfamily',
      'fontsize',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'code',
      'codeBlock',
      '|',
      'insertTable',
      '|',
      'outdent',
      'indent',
      '|',
      'blockQuote',
      '|',
      'undo',
      'redo',
      'uploadImage',
    ],
    fontColor: {
      columns: 10,
      documentColors: 200,
      colors: this.colorPalette
    },
    fontBackgroundColor: {
      columns: 10,
      documentColors: 200,
      colors: this.colorPalette
    }
  };

  public typeTravels = [
    {
      label: 'du_lich_tren_bo_bien',
      value: 0,
    },
    {
      label: 'du_lich_van_hoa',
      value: 1,
    },
    {
      label: 'du_lich_mao_hiem',
      value: 2,
    },
    {
      label: 'du_lich_nghi_duong',
      value: 3,
    },
    {
      label: 'du_lich_the_thao',
      value: 4,
    },
    {
      label: 'du_lich_canh_quan',
      value: 5,
    },
    {
      label: 'du_lich_am_thuc',
      value: 6,
    },
    {
      label: 'du_lich_dia_phuong',
      value: 7,
    },
    {
      label: 'du_lich_phieu_luu',
      value: 8,
    },
  ];
  public addTravelForm: FormGroup;
  public list_category: any;
  public list_search_category: any;
  public warning_number: any;
  public category: any;
  public img: string = '';
  public listImgProduct: Array<any> = [];
  public selectedListCategory = [];
  public selectedIndexTabset = 0;
  public price: any;
  public price_sales: any;
  submitting = false; // Trạng thái submit form để tránh submit nhiều lần

  constructor(
    public vhAlgorithm: VhAlgorithm,
    public functionService: FunctionService,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public vhImage: VhImage,
    public dialog: MatDialog,
    private languageService: LanguageService
  ) {
    this.getCategory();
    this.initForm();
    this.clearjs();
  }

  ngOnInit(): void {}

  ngDestroy(): void {
    this.submitAddTravel.emit({ data: 'Dữ liệu trả về' });
  }
  /** Hàm khởi tạo form
   *
   */
  initForm(): void {
    this.addTravelForm = new FormGroup({
      name: new FormControl('', Validators.compose([Validators.required])),
      address: new FormControl('', Validators.compose([Validators.required])),
      phone_number: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(
            '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)'
          ),
        ])
      ),
      email: new FormControl(''),
      iframe: new FormControl(''),
      price: new FormControl(
        0,
        Validators.compose([
          Validators.required,
          Validators.pattern(
            '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)'
          ),
        ])
      ),
      webapp_price_sales: new FormControl(
        0,
        Validators.compose([
          Validators.pattern(
            '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)'
          ),
        ])
      ),
      quantity_room: new FormControl(''),
      barcode: new FormControl(''),
      id_category: new FormControl(
        [],
        Validators.compose([Validators.required])
      ),
      unit: new FormControl('', [Validators.required]),
      units: new FormControl([]),
      webapp_img: new FormControl(''),
      webapp_img1: new FormControl(''),
      webapp_img2: new FormControl(''),
      webapp_img3: new FormControl(''),
      webapp_sort_description: new FormControl(''),
      webapp_description: new FormControl(''),
      webapp_hidden: new FormControl(false),
      webapp_seo_title: new FormControl(''),
      webapp_seo_description: new FormControl(''),
      webapp_seo_keyword: new FormControl(''),
    });
  }

  clearjs() {
    this.vhAlgorithm.waitingStack().then(() => {
      this.price = this.vhAlgorithm.vhnumeral('.price');
      this.price_sales = this.vhAlgorithm.vhnumeral('.price_sales');
    });
  }

  getCategory(): void {
    this.vhQueryAutoWeb
      .getCategorys_byFields({}, {}, {}, 0)
      .then((category: any) => {
        this.list_category = category.data.map((e) => {
          return {
            ...e,
            array_step: Array(e.step)
              .fill(0)
              .map((_, i) => i),
          };
        });
        this.list_search_category = category.data;
      });
  }

  backPageFn(): void {
    this.submitAddTravel.emit(false);
  }

  public onReady(editor: any): void {
    editor.ui
      .getEditableElement()
      .parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
      );
    editor.plugins.get('FileRepository').createUploadAdapter = (
      loader: any
    ) => {
      return this.vhImage.MyUploadImageAdapter(loader, 'products');
    };
  }

  enterPrice(): void {
    let data = this.addTravelForm.value;
    if (data.units.length != 0) {
      this.addTravelForm.value.units.find((item) => item.default).price =
        parseFloat(this.price.getRawValue());
      this.addTravelForm.value.units.find(
        (item) => item.default
      ).webapp_price_sales = parseFloat(
        this.price_sales.getRawValue()
      );
      this.addTravelForm.value.units.find((item) => item.default).unit =
        data.unit;
    } else {
      let units = [
        {
          unit: this.addTravelForm.value.unit,
          ratio: 1,
          default: true,
          price: parseFloat(this.price.getRawValue()),

          webapp_price_sales: parseFloat(
            this.price_sales.getRawValue()
          ),
          barcode: '',
        },
      ];
      if (this.addTravelForm.value.units.length == 0)
        this.addTravelForm.controls['units'].setValue(units);
    }
  }

  onSubmitAddProduct(value): void {
    this.submitting = true;
    this.functionService.showLoading(this.languageService.translate('dang_them'));

    const hotel = {
      ...value,
      type: 51,
      id_category: this.categoriesChoice,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.addTravelForm.valid) {
      hotel.link = this.functionService.nonAccentVietnamese(hotel.name.trim());
      hotel.link = hotel.link.replace(/[^a-z0-9-]/g, '');
      this.vhQueryAutoWeb
        .getProducts_byFields({ link: { $eq: hotel.link } })
        .then(
          (response: any): void => {
            if (response.vcode === 0 && response.data.length !== 0) {
              hotel.link = hotel.link + '-1';
            }

            hotel.price = parseFloat(
              this.price.getRawValue() ? this.price.getRawValue() : 0
            );

            hotel.webapp_price_sales = parseFloat(
              this.price_sales.getRawValue()
                ? this.price_sales.getRawValue()
                : 0
            );
            hotel.units = [
              {
                barcode: value.barcode,
                price: hotel.price,
                price2: 0,
                webapp_price_sales: hotel.webapp_price_sales,
                unit: value.unit,
                ratio: 1,
                default: true,
              },
            ];

            Object.keys(hotel).forEach((key) => {
              if (
                key == 'unit' ||
                key == 'ratio' ||
                key == 'price' ||
                key == 'webapp_price_sales' ||
                key == 'barcode'
              )
                delete hotel[key];
            });
            this.vhQueryAutoWeb.addProduct(hotel).then(
              (res: any) => {
                if (res.vcode === 0) {
                  this.functionService.createMessage(
                    'success',
                    'Thêm sản phẩm thành công'
                  );
                  this.submitAddTravel.emit(true);
                }
                if (res.vcode === 11) {
                  this.functionService.createMessage(
                    'error',
                    'Phiên đăng nhập đã hết hạn vui lòng đăng nhập lại'
                  );
                }
              },
              (err) => {
                this.functionService.createMessage(
                  'error',
                  'Có lỗi vui lòng thử lại'
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
              'Có lỗi vui lòng thử lại'
            );
            this.functionService.hideLoading();
            this.submitting = false;
          }
        );
    } else {
      this.functionService.createMessage('error', 'Vui lòng điền đủ thông tin');
      this.functionService.hideLoading();
      this.submitting = false;
    }
  }

  /** Hàm thực hiện gán dữ liệu ảnh và form sản phẩm
   *
   */
  setAllImageForm() {
    this.listImgProduct.forEach((image, index) => {
      this.addTravelForm.controls[
        `webapp_img` + (index == 0 ? '' : index)
      ].setValue(image.src);
    });
  }

  /**
   *
   * @param index vị trí ảnh trong sản phẩm
   */
  getFile() {
    document.getElementById('file_upload').click();
  }
  /** Thực hiện click vị trí ảnh
   *
   * @param position
   */
  getFileImageItem(position) {
    document.getElementById('file_upload_item' + position).click();
  }

  public path: any = '';
  openLibrary() {
    const dialogRef = this.dialog.open(ManageLibraryComponent, {
      width: '85%',
      maxWidth: '100%',
      data: this.path,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.href) {
        const object = { src: result.href };
        this.listImgProduct = [...this.listImgProduct, object];
        this.setAllImageForm();
      }
      this.path = result.path;
    });
  }

  /** Hàm thực hiện lấy hình ảnh từ Desktop
   *
   * @param e sự kiện tải ảnh lên
   */
  onUpload(e) {
    let files: Array<any> = Array.from(e.target.files);
    let promise = [];
    if (files.length) {
      files.forEach((file: any, index) => {
        promise.push(
          this.vhImage.getImageFromDesktop(
            file,
          
            'products',
            this.addTravelForm.value[
              `webapp_img${index != 0 ? index : ''}`
            ] || null
          )
        );
      });
    }
    Promise.all(promise).then(
      (response: Array<any>) => {
        if (response) {
          response.forEach((item) => {
            const object = { src: item };
            this.listImgProduct = [...this.listImgProduct, object];
          });
          this.setAllImageForm();
          this.functionService.createMessage(
            'success',
            'Hình ảnh đã được tải thành công !!!'
          );
        } else {
          this.functionService.createMessage(
            'error',
            'Tải ảnh thất bại ! Vui lòng thử lại'
          );
        }
      },
      (error) => {
        this.functionService.createMessage(
          'error',
          'Tải ảnh thất bại ! Vui lòng thử lại'
        );
      }
    );
  }

  /** Hàm thực hiện cập nhật ảnh tại vị trí đã chọn
   *
   * @param e
   * @param position
   */
  onUploadItemImage(e, position) {
    let file = Array.from(e.target.files)[0];
    this.vhImage
      .getImageFromDesktop(
        file,
       
        'products',
        this.addTravelForm.value[
          `webapp_img${position != 0 ? position : ''}`
        ] || ''
      )
      .then(
        (url) => {
          if (url) {
            const object = { src: url };
            this.listImgProduct[position] = object;
            this.setAllImageForm();
            this.functionService.createMessage(
              'success',
              'Hình ảnh đã được tải thành công !!!'
            );
          } else {
            this.functionService.createMessage(
              'error',
              'Tải ảnh thất bại ! Vui lòng thử lại'
            );
          }
        },
        (error) => {
          this.functionService.createMessage(
            'error',
            'Tải ảnh thất bại ! Vui lòng thử lại'
          );
        }
      );
  }

  /** Hàm thực hiện xóa file ảnh với vị trí chọn
   *
   * @param position vị trí trong mảng ảnh
   */
  deleteFileImageByIndex(position) {
    this.listImgProduct = this.listImgProduct.filter(
      (_, index) => index != position
    );
    this.setAllImageForm();
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
      this.addTravelForm.controls['barcode'].setValue(newbarcode);
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

  categoriesChoice: Array<any> = [];
  changeSelect(event) {
    this.categoriesChoice = event;
  }

  generateSymBol(array: []) {
    let string = '';
    array.forEach((_) => {
      string = string + `- `;
    });
    return string;
  }

  createCategory() {
    const dialogRef = this.dialog.open(AddCategoryComponent, {
      width: '60vw',
      height: '60vh',
      disableClose: true,
      data: this.list_category,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (typeof result === 'object') {
          this.getCategory();
        }
      }
    });
  }
}
