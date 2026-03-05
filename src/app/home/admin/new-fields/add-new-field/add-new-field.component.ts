import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { JsonDataService } from 'src/app/services/json-data.service';
import { LanguageService } from 'src/app/services/language.service'; 
@Component({
  selector: 'app-add-new-field',
  templateUrl: './add-new-field.component.html',
  styleUrls: ['./add-new-field.component.scss']
})
export class AddNewFieldComponent implements OnInit {
  addNewFieldForm: FormGroup;
  lookupGroupArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  type_main_sectors = [{label : 'Danh mục', value: 'category', type: 0}];
  submitting = false; // Trạng thái submit form để tránh submit nhiều lần
  dataList = [];

  list_fieldInputType = [
    {
      label: 'o_nhap_van_ban',
      value: 'input'
    },
    {
      label: 'soan_thao_van_ban',
      value: 'ckeditor'
    },
     {
      label: 'o_nhap_doan_van_ban',
      value: 'textarea'
    },
    {
      label: 'o_nhap_so',
      value: 'input-number'
    },
    {
      label: 'o_chon_mot',
      value: 'select',
    },
    {
      label: 'o_chon_ngay_thang',
      value: 'input-date',
    },
    {
      label: 'hinh_anh',
      value: 'image',
    },
    {
      label: 'o_chon_nhieu',
      value: 'select-multiple',
    },
    
    // {
    //   label: 'o_chon_thoi_gian',
    //   value: 'input-time',
    // },

  ]


  list_fieldInputLocation = [
    {
      label: 'Quản trị(admin)',
      value: 'admin',
    },
    {
      label: 'Giao diện người dùng(user)',
      value: 'user',
    }
  ]




  constructor(
    public dialogRef: MatDialogRef<AddNewFieldComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public vhAlgorithm: VhAlgorithm,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public dialog: MatDialog,
    public functionService: FunctionService,
    private jsonDataService: JsonDataService,
    private languageService: LanguageService
  ) {

  }

  ngOnInit(): void {
    this.initForm();
    this.getMainSectors()

  }

  changName() {
    let new_field = 'vh_' + this.vhAlgorithm.changeAlias(this.addNewFieldForm.value.name).replace(/ /g, "_");
    this.addNewFieldForm.controls['field_custom'].setValue(new_field)

  }

  getMainSectors() {
    let subproject = this.vhQueryAutoWeb.getlocalSubProject(this.vhQueryAutoWeb.getlocalSubProject_Working()._id);
    this.jsonDataService.getMainSectors().subscribe((data) => {
      data.forEach((element) => {
        if (subproject.main_sectors?.includes(element.value) && element.type)
          this.type_main_sectors.push(element)
        if (element.value == 'basic') this.type_main_sectors.push(element)
      });

      this.type_main_sectors = this.vhAlgorithm.sortVietnamesebyASC(this.type_main_sectors, 'label')
    })
  }


  /** Hàm khởi tạo form
   *
   */
  initForm() {
    this.addNewFieldForm = new FormGroup({
      name: new FormControl('', Validators.compose([Validators.required])),
      field_lable: new FormControl('', Validators.compose([Validators.required])),
      field_custom: new FormControl(''),
      field_placeholder: new FormControl(''),
      field_required: new FormControl(false),
      field_start_value: new FormControl(''),
      field_order_number: new FormControl(1),
      id_main_sector: new FormControl('', Validators.compose([Validators.required])),
      lookup_group: new FormControl(1),
      field_input_type: new FormControl('input'),
      field_display_type: new FormControl('input'),
      field_input_location: new FormControl('admin'),
    });
  }



  /** Hàm thực hiện xử lí thêm trường mới
   *
   * @param value
   */
  onSubmitAddNewField(value): void {

    if (!this.addNewFieldForm.valid) {
      this.functionService.createMessage('error', this.languageService.translate('vui_long_dien_du_thong_tin'));
      return;
    }

    if (value.id_main_sector != 'snimei') {
      delete value.lookup_group
    }

    if (value.field_input_type.includes('select')) {
      value.data_list = this.dataList
    }

    if (
      value.field_input_type == 'image' && 
      !Array.isArray(value.field_start_value) &&
      typeof value.field_start_value == 'string'
    ) {
      value.field_start_value = value.field_start_value ? [ value.field_start_value ] : [];
    }

    this.submitting = true;

    let new_field = {
      ...value,
    };
    
    new_field.field_custom = 'fcustom_' + this.vhAlgorithm.changeAlias(new_field.name).replace(/ /g, "_");
    this.vhQueryAutoWeb
      .getNewFields_byFields({ field_custom: { $eq: new_field.field_custom }, id_main_sector: { $eq: new_field.id_main_sector } })
      .then((response: any) => {
        if (response.length == 0) {
          this.vhQueryAutoWeb.addNewField(new_field).then(
            (res: any) => {
              this.functionService.createMessage(
                'success',
                this.languageService.translate('them_truong_moi_thanh_cong')
              );
              this.dialogRef.close(res);
            },
            (error) => {
              this.functionService.createMessage(
                'error',
                this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_them_du_lieu')
              );
            }
          ).finally(() => {
            this.submitting = false;
          });
        } else {
          this.functionService.createMessage(
            'error',
            this.languageService.translate('trung_ten_truong_co_so_du_lieu')
          );
          this.submitting = false;
        }
      },
        (error) => {
          this.functionService.createMessage(
            'error',
            this.languageService.translate('co_loi_xay_ra_vui_long_thu_lai')
          );
          this.submitting = false;
        });

  }

  close(): void {
    this.dialogRef.close();
  }

  addData() {
    this.dataList = [
      ...this.dataList,
      {
        _id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        ['label_' + this.functionService.languageTempCode]: '',
        ['value_' + this.functionService.languageTempCode]: '',
      }
    ]
  }

  deleteRow(_id: any) {
    this.dataList = this.dataList.filter((item: any) => item._id !== _id);
  }

  onChangeMainSector(value: any) {
    if (value == 'basic') {
      this.addNewFieldForm.controls['field_input_location'].setValue('user')
      this.addNewFieldForm.controls['field_display_type'].setValue('input')
    } else {
      this.addNewFieldForm.controls['field_input_location'].setValue('admin')
      this.addNewFieldForm.controls['field_display_type'].setValue('text')
    }
  }

  onChangeInputLocation(value: any) {
    if (value == 'user') {
      this.addNewFieldForm.controls['field_display_type'].setValue('text')
    } else {
      this.addNewFieldForm.controls['field_display_type'].setValue('input')
    }
  }

  onChangeInputType(value:any) {
    if (value == 'select-multiple') {
      this.addNewFieldForm.controls['field_display_type'].setValue('radio')
    } else if (value == 'image') {
      this.addNewFieldForm.controls['field_display_type'].setValue('image')
    } else {
      this.addNewFieldForm.controls['field_display_type'].setValue('text')
    }
  }
}
