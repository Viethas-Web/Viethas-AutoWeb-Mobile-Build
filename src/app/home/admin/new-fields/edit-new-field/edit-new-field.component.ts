import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb, VhImage } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import { JsonDataService } from 'src/app/services/json-data.service';
import { LanguageService } from 'src/app/services/language.service'; 
@Component({
  selector: 'app-edit-new-field',
  templateUrl: './edit-new-field.component.html',
  styleUrls: ['./edit-new-field.component.scss']
})
export class EditNewFieldComponent implements OnInit {

  public editNewFieldForm: FormGroup;
  public nameNewField: string;

  type_main_sectors = [{label : 'Danh mục', value: 'category', type: 0}];
  lookupGroupArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
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

  submitting = false; // Trạng thái submit form để tránh submit nhiều lần

  constructor(
    public dialogRef: MatDialogRef<EditNewFieldComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public vhAlgorithm: VhAlgorithm,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    public vhImage: VhImage,
    public dialog: MatDialog,
    private jsonDataService: JsonDataService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.getMainSectors();

    if (this.data) {
      this.initForm(this.data.newField);

      this.nameNewField = this.data.name;
    }
  }

  getMainSectors() {
    this.jsonDataService.getMainSectors().subscribe((data) => {
      let subproject = this.vhQueryAutoWeb.getlocalSubProject(
        this.vhQueryAutoWeb.getlocalSubProject_Working()._id
      );
      data.forEach((element) => {
        if (subproject.main_sectors?.includes(element.value) && element.type)
          this.type_main_sectors.push(element);
        if (element.value == 'basic') this.type_main_sectors.push(element)
      });
      this.type_main_sectors = this.vhAlgorithm.sortVietnamesebyASC(this.type_main_sectors, 'label')

    });
  }
  /** Khới tạo form
   *
   * @param value
   */
  initForm(value) {
    this.editNewFieldForm = new FormGroup({
      name: new FormControl({ value: value.name, disabled: true }, [Validators.required]),
      field_custom: new FormControl({ value: value.field_custom, disabled: true }),
      field_lable: new FormControl(value.field_lable, Validators.compose([Validators.required])),
      field_placeholder: new FormControl(value.field_placeholder),
      field_required: new FormControl(value.field_required),
      field_start_value: new FormControl(value.field_start_value),
      field_order_number: new FormControl(value.field_order_number),
      id_main_sector: new FormControl(value.id_main_sector),
      lookup_group: new FormControl(value.lookup_group || 1),
      field_input_type: new FormControl(value.field_input_type),
      field_display_type: new FormControl(value.field_display_type),
      field_input_location: new FormControl(value.field_input_location),
      _id: new FormControl(value._id),
    });


    this.dataList = value.data_list || [];

  }

  updateNewField(objectUpdate) {

    if (!this.editNewFieldForm.valid) {
      this.functionService.createMessage('error', this.languageService.translate('vui_long_dien_du_thong_tin'));
      return
    }

    if (objectUpdate.id_main_sector != 'snimei') {
      delete objectUpdate.lookup_group;
    }

    if (objectUpdate.field_input_type.includes('select')) {
      objectUpdate.data_list = this.dataList;
    }

    if (
      objectUpdate.field_input_type == 'image' && 
      !Array.isArray(objectUpdate.field_start_value) &&
      typeof objectUpdate.field_start_value == 'string'
    ) {
      objectUpdate.field_start_value = objectUpdate.field_start_value ? [ objectUpdate.field_start_value ] : [];
    }

    if (objectUpdate.id_main_sector == this.data.newField.id_main_sector) {
      this.submitting = true;
      this.vhQueryAutoWeb
        .updateNewField(this.data.newField._id, objectUpdate)
        .then(
          (res: any) => {
            if (res.vcode === 11) {
              this.functionService.createMessage(
                'error',
                this.languageService.translate('phien_dang_nhap_da_het_han')
              );
            }
            this.dialogRef.close({ ...this.editNewFieldForm.getRawValue() });
          },
          (err) => {
            this.functionService.createMessage(
              'error',
              this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu')
            );
          }
        )
        .finally(() => this.submitting = false)
    } else {
      this.submitting = true;
      this.vhQueryAutoWeb.getNewFields_byFields({ id_main_sector: { $eq: objectUpdate.id_main_sector }, field_custom: { $eq: objectUpdate.field_custom } })
        .then((newfields: any) => {
          if (newfields.length > 0) {
            this.functionService.createMessage(
              'error',
              this.languageService.translate('trung_ten_truong_co_so_du_lieu')
            );
          } else {
            this.vhQueryAutoWeb
              .updateNewField(this.data.newField._id, objectUpdate)
              .then(
                (res: any) => {
                  if (res.vcode === 11) {
                    this.functionService.createMessage(
                      'error',
                      this.languageService.translate('phien_dang_nhap_da_het_han')
                    );
                  }

                  this.dialogRef.close({ ...this.editNewFieldForm.getRawValue() });
                },
                (err) => {
                  this.functionService.createMessage(
                    'error',
                    this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu')
                  );
                }
              );
          }
        }).finally(() => this.submitting = false)
    }
  }

  close() {
    this.dialogRef.close(null);
  }

  addData() {
    this.dataList = [...this.dataList, {
      _id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      ['label_' + this.functionService.languageTempCode]: '',
      ['value_' + this.functionService.languageTempCode]: '',
    }]
  }

  deleteRow(_id: any) {
    this.dataList = this.dataList.filter((item: any) => item._id !== _id);
  }

  onChangeMainSector(value: any) {
    if (value == 'basic') {
      this.editNewFieldForm.controls['field_input_location'].setValue('user')
      this.editNewFieldForm.controls['field_display_type'].setValue('input')
    } else {
      this.editNewFieldForm.controls['field_input_location'].setValue('admin')
      this.editNewFieldForm.controls['field_display_type'].setValue('text')
    }
  }

  onChangeInputLocation(value: any) {
    if (value == 'user') {
      this.editNewFieldForm.controls['field_display_type'].setValue('text')
    } else {
      this.editNewFieldForm.controls['field_display_type'].setValue('input')
    }
  }

  onChangeInputType(value:any) {
    if (value == 'select-multiple') {
      this.editNewFieldForm.controls['field_display_type'].setValue('radio')
    } else if (value == 'image') {
      this.editNewFieldForm.controls['field_display_type'].setValue('image')
    } else {
      this.editNewFieldForm.controls['field_display_type'].setValue('text')
    }
  }
}
