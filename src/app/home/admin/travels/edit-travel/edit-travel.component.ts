import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb, VhImage } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import { AddCategoryComponent } from '../../categories/add-category/add-category.component';
import { ManageLibraryComponent } from 'vhobjects-service';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-edit-travel',
  templateUrl: './edit-travel.component.html',
  styleUrls: ['./edit-travel.component.scss']
})
export class EditTravelComponent implements OnInit {
  @Input() data: any;
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
  public editHotelForm: FormGroup;
  public list_category: any;
  public list_search_category: any;
  public warning_number: any;
  public category: any;
  public img: string = '';
  public listImgProduct: Array<any> = [];
  public selectedListCategory = [];
  public selectedIndexTabset = 0;
  public typeRooms = [
    {
      label: 'phong_don',
      value: 0,
    },
    {
      label: 'phong_doi',
      value: 1,
    },
    {
      label: 'phong_doi_2_giuong_don',
      value: 2,
    },
    {
      label: 'phong_ba_nguoi',
      value: 3,
    },
    {
      label: 'Suite',
      value: 4,
    },
    {
      label: 'phong_gia_dinh',
      value: 5,
    },
    {
      label: 'phong_sang_trong',
      value: 6,
    },
    {
      label: 'phong_hang_cao_cap',
      value: 7,
    },
    {
      label: 'biet_thu_nho',
      value: 8,
    },
    {
      label: 'biet_thu_villa',
      value: 9,
    },
    {
      label: 'can_ho_cao_cap',
      value: 10,
    },
  ];
  public date: Date[] = [new Date(), new Date()];
  public price: any;
  public price_sales: any;
  public units: Array<any> = []; // Mảng danh sách các đơn vị

  constructor(
    public vhAlgorithm: VhAlgorithm,
    public functionService: FunctionService,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public vhImage: VhImage,
    public matDialog: MatDialog,
    private languageService: LanguageService 
  ) {}

  ngOnInit() {
    if (this.data) {
      this.getCategory();
      this.inithotel(this.data);
      this.clearjs();
    }
  }

  /** Hàm thực hiện khởi tạo form với dữ liệu truyền vào
   *
   * @param data dữ liệu hotel truyền vào
   */
  inithotel(data: any) {
    this.editHotelForm = new FormGroup({
      _id: new FormControl(data._id),
      name: new FormControl(
        data.name,
        Validators.compose([Validators.required])
      ),
      link: new FormControl(data.link),

      address: new FormControl(
        data.address,
        Validators.compose([Validators.required])
      ),
      phone_number: new FormControl(
        data.phone_number,
        Validators.compose([
          Validators.required,
          Validators.pattern(
            '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)'
          ),
        ])
      ),
      email: new FormControl(data.email),
      room_type: new FormControl(data.room_type),
      quantity_room: new FormControl(data.quantity_room),
      id_category: new FormControl(
        data.id_category,
        Validators.compose([Validators.required])
      ),
      units: new FormControl(data.units),
      webapp_img: new FormControl(data.webapp_img),
      webapp_img1: new FormControl(data.webapp_img1),
      webapp_img2: new FormControl(data.webapp_img2),
      webapp_img3: new FormControl(data.webapp_img3),
      webapp_sort_description: new FormControl(
        data.webapp_sort_description
      ),
      webapp_description: new FormControl(
        data.webapp_description
      ),
      webapp_hidden: new FormControl(data.webapp_hidden),
      webapp_seo_title: new FormControl(
        data.webapp_seo_title
      ),
      webapp_seo_description: new FormControl(
        data.webapp_seo_description
      ),
      webapp_seo_keyword: new FormControl(
        data.webapp_seo_keyword
      ),
    });

    if (data.units) {
      this.units = data.units;
      const unit = this.getUnitsByRatio(data.units, 1);
      this.editHotelForm.addControl(
        'price',
        new FormControl(
          unit ? unit.price : 0,
          Validators.compose([
            Validators.required,
            Validators.pattern(
              '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)'
            ),
          ])
        )
      );
      this.editHotelForm.addControl(
        'webapp_price_sales',
        new FormControl(
          unit ? unit.webapp_price_sales : 0,
          Validators.compose([
            Validators.required,
            Validators.pattern(
              '(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)'
            ),
          ])
        )
      );
      this.editHotelForm.addControl(
        'barcode',
        new FormControl(unit ? unit.barcode : '')
      );
      this.editHotelForm.addControl(
        'unit',
        new FormControl(unit ? unit.unit : '', Validators.required)
      );
    }
    if(data.check_in_time && data.check_out_time)
      this.date = [new Date(data.check_in_time),new Date(data.check_out_time) ]
  }

  clearjs() {
    this.vhAlgorithm.waitingStack().then(() => {
      this.price = this.vhAlgorithm.vhnumeral('.price');
      this.price_sales = this.vhAlgorithm.vhnumeral('.price_sales');
    });
  }

  getUnitsByRatio(units: Array<any>, ratio: number) {
    return units.find((unit) => unit.ratio == ratio);
  }

  /** Hàm thực hiện lấy danh mục (Category)
   *
   */
  getCategory(): void {
    this.vhQueryAutoWeb
      .getCategorys_byFields({}, {}, {}, 0)
      .then((category: any) => {
        this.list_category = category.data;
        this.list_search_category = category.data;
      });
  }

  /** Hàm thực hiện cập nhật dữ liệu thay đổi của sản phẩm
   *
   * @param field trường cập nhật
   * @param objectUpdate dữ liệu cập nhật. Vd: {field: 'aaa'}
   */
  updateHotel(field: string, objectUpdate) {
    objectUpdate.updated_at = new Date().toISOString();
    if(!objectUpdate.created_at) objectUpdate.created_at = new Date().toISOString();
    if (
      ['barcode', 'price', 'unit', 'webapp_price_sales'].includes(
        field
      )
    ) {
      const { barcode, unit } = this.editHotelForm.value;
      const unitsNew = this.editHotelForm.value.units;
      const index = unitsNew.findIndex(({ ratio }) => ratio === 1);
      const data = {
        barcode,
        ratio: 1,
        unit,
        price: parseFloat(
          this.price.getRawValue() ? this.price.getRawValue() : 0
        ),
        webapp_price_sales: parseFloat(
          this.price_sales.getRawValue() ? this.price_sales.getRawValue() : 0
        ),
        default: unitsNew[index].default,
      };
      unitsNew.splice(index, 1, data);
      objectUpdate = { units: unitsNew };
    }
    if (field == 'name') {
      this.editHotelForm.controls['link'].setValue(
        this.functionService.nonAccentVietnamese(objectUpdate.name.trim()).replace(/[^a-z0-9-]/g, '')
      );
      objectUpdate = {
        name: objectUpdate.name,
        link: this.editHotelForm.value.link,
      };
    }
    this.vhQueryAutoWeb.updateProduct(this.data._id, objectUpdate).then(
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
  public onReady(editor: any) {
    editor.ui
      .getEditableElement()
      .parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
      );
    editor.plugins.get('FileRepository').createUploadAdapter =   (
      loader: any
    ) =>{
      return this.vhImage.MyUploadImageAdapter(loader, 'products');
    };
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
    const dialogRef = this.matDialog.open(ManageLibraryComponent, {
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

  /** Hàm thực hiện gán dữ liệu ảnh và form sản phẩm
   *
   */
  setAllImageForm() {
    let promise = [];
    this.listImgProduct.forEach((image, index) => {
      this.editHotelForm.controls[
        `webapp_img` + (index == 0 ? '' : index)
      ].setValue(image.src);
      promise.push(
        this.updateHotel(`webapp_img` + (index == 0 ? '' : index), {
          [`webapp_img` + (index == 0 ? '' : index)]: image.src,
        })
      );
    });
    Promise.all(promise).then(() => {});
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
            this.editHotelForm.value[
              `webapp_img${index != 0 ? index : ''}`
            ] || ''
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
            this.languageService.translate('hinh_anh_da_duoc_tai_thanh_cong')
          );
        } else {
          this.functionService.createMessage(
            'error',
            this.languageService.translate('tai_anh_that_bai_vui_long_thu_lai')
          );
        }
      },
      (error) => {
        this.functionService.createMessage(
          'error',
          this.languageService.translate('tai_anh_that_bai_vui_long_thu_lai')
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
        this.editHotelForm.value[
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
              this.languageService.translate('hinh_anh_da_duoc_tai_thanh_cong')
            );
          } else {
            this.functionService.createMessage(
              'error',
              this.languageService.translate('tai_anh_that_bai_vui_long_thu_lai')
            );
          }
        },
        (error) => {
          this.functionService.createMessage(
            'error',
            this.languageService.translate('tai_anh_that_bai_vui_long_thu_lai')
          );
        }
      );
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
      this.editHotelForm.controls['barcode'].setValue(newbarcode);
      this.updateHotel('barcode', { barcode: newbarcode });
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

  /**
   * lọc danh sách danh mục theo tên
   * @param value
   */
  searchCate(value) {
    if (value) {
      this.list_category = this.vhAlgorithm.searchList(
        this.vhAlgorithm.changeAlias(value),
        this.list_search_category,
        ['name']
      );
    } else this.list_category = [...this.list_search_category];
  }

  changeSelect(event) {
    if (event) {
      this.updateHotel('id_category', { id_category: event });
    }
  }

  generateSymBol(array: []) {
    let string = '';
    array.forEach((item) => {
      string = string + `- `;
    });
    return string;
  }

  createCategory() {
    const dialogRef = this.matDialog.open(AddCategoryComponent, {
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
  changeDate(event) {
    this.date = event;
    this.vhQueryAutoWeb
      .updateProduct(this.data._id, {
        check_in_time: new Date(this.date[0]).getTime(),
        check_out_time: new Date(this.date[1]).getTime(),
      })
      .then(
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
