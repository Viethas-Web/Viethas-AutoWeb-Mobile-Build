import { Component, Inject, OnInit } from '@angular/core';

import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';

import { LanguageService } from 'src/app/services/language.service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-import-data-by-excel',
  templateUrl: './import-data-by-excel.component.html',
  styleUrls: ['./import-data-by-excel.component.scss']
})
export class ImportDataByExcelComponent implements OnInit {
  formData: any = []
  formDataToCreate: any = []
  duplicateData: any = []
  duplicateDataFile: any = []
  fields: any = [
    { name: 'STT', db_field: 'id' },
    { name: 'so_snimei', db_field: 'sn_imei' },
    { name: 'ten_san_pham', db_field: `name_${this.functionService.defaultLanguage}` },
    { name: 'thuong_hieu', db_field: 'brand' },
    { name: 'ma_san_pham', db_field: 'product_id' },
    { name: 'nhom_tra_cuu', db_field: 'lookup_group' },
    { name: 'kich_hoat', db_field: 'active' },
    { name: 'ngay_xuat_hang', db_field: 'warehouse_release_date' },
    { name: 'ngay_kich_hoat', db_field: 'active_date' },
    { name: 'so_ngay_toi_da_duoc_phep_kich_hoat', db_field: 'max_activation_days' },
    { name: 'han_bao_hanh', db_field: 'warranty_period' },
  ];
  isFormValid = true;
  constructor(
    public dialogRef: MatDialogRef<ImportDataByExcelComponent>,
    public vhAlgorithm: VhAlgorithm,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public languageService: LanguageService,
    public matdialog: MatDialog,    
    public functionService: FunctionService,
    @Inject(MAT_DIALOG_DATA) public data: any // Inject data here
  ) {
  }

  ngOnInit(): void {
    this.getNewFileds();
  }

  createData() {
    let promise = [];
    for (let index = 0; index < this.formDataToCreate.length; index++) {
      const currentData = this.formDataToCreate[index];
      currentData.warehouse_release_date = this.parseDate(currentData.warehouse_release_date);
      currentData.active_date = this.parseDate(currentData.active_date);
      currentData.active = this.stringToBoolean(currentData.active)
      if (currentData.active) {
        const maxActivationDate = new Date(this.addDays(currentData.warehouse_release_date, Number(currentData.max_activation_days)))

        if (new Date(currentData.active_date) > maxActivationDate) {
          currentData.expiration_date = this.addDays(currentData.warehouse_release_date, Number(currentData.warranty_period))
        } else {
          currentData.expiration_date = this.addDays(currentData.active_date, Number(currentData.warranty_period))
        }
      }
      currentData.lookup_group = Number(currentData.lookup_group)
      currentData.date_created = new Date()
      promise[index] = this.vhQueryAutoWeb.addSNIMEI(currentData)
    }
    Promise.all(promise).then((res) => {
      this.close(res.map(e => { return e.data }))
    })
  }

  close(data): void {
    this.dialogRef.close(data)
  }

  /**Chọn file */
  openFile() {
    document.getElementById("file_excel_product")['value'] = '';
    document.getElementById("file_excel_product").click()
  }

  //hàm thực hiện import file và gán giá trị cho formdata để hiện thị
  openXLSXFile(events: any) {
    this.formData = [];
    this.duplicateData = [];
    this.duplicateDataFile = [];
    const file = events.target.files[0];
    // Tạo bản đồ kiểu dữ liệu
    const fieldTypeMap = new Map(this.fields.map(field => [this.languageService.translate(field?.name), this.languageService.translate(field?.name) === 'Nhóm tra cứu' ? 'number' : 'string']));
    return this.vhAlgorithm.importXLSX(file)
      .then((obj: any[]) => {
        for (let data of obj) {
          const convertedData: any = {};
          for (let key in data) {

            if (data.hasOwnProperty(key)) {
              // Chuyển đổi kiểu dữ liệu dựa trên bản đồ kiểu dữ liệu
              const type = fieldTypeMap.get(key) || 'string';
              convertedData[key] = type === 'number' ? Number(data[key]) : String(data[key]);
            }
          }
          this.formData.push(convertedData);
        }

        // Sau khi việc nhập dữ liệu hoàn tất, tiến hành xử lý dữ liệu
        this.inProcessData();
      });
  }

  async inProcessData() {
    const processPromises = this.formData.map(async (item) => {
      let formItem = {};
      let formItemDp = {};
      let formItemDpFile = {};
      this.fields.forEach(async (field) => {
        formItem[field.db_field] = item[this.languageService.translate(field.name)];
        formItemDp[field.db_field] = await this.checkIsExistItem(field.db_field, item[this.languageService.translate(field.name)]);
        formItemDpFile[field.db_field] = false;
      });

      await this.formDataToCreate.push(formItem);
      await this.duplicateData.push(formItemDp);
      await this.duplicateDataFile.push(formItemDpFile);
    });

    await Promise.all(processPromises);
    this.checkIsExistItemFile()
  }

  //hàm dowload file mẫu
  downloadSampleFile() {
    let data = [];
    let name = 'File product sample';
    // Tạo dữ liệu mẫu
    let sampleData: any = {};

    // Lấy ngày hiện tại
    let currentDate = new Date();

    // Tạo ngày hiện tại dưới định dạng dd/mm/yyyy
    let currentDateFormatted = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;

    for (let field of this.fields) {
      switch (field?.name) {
        case 'STT':
          sampleData[this.languageService.translate(field?.name)] = '1'; // Ví dụ giá trị mẫu cho '#'
          break;
        case 'ten_san_pham':
          sampleData[this.languageService.translate(field?.name)] = 'IPhone 15 ProMax'; // Ví dụ giá trị mẫu cho 'Mã sản phẩm'
          break;
        case 'ma_san_pham':
          sampleData[this.languageService.translate(field?.name)] = 'IP15PM'; // Ví dụ giá trị mẫu cho 'Mã sản phẩm'
          break;
        case 'nhom_tra_cuu':
          sampleData[this.languageService.translate(field?.name)] = 1; // Ví dụ giá trị mẫu cho 'Nhóm tìm kiếm'
          break;
        case 'so_snimei':
          sampleData[this.languageService.translate(field?.name)] = 'IMEI123456789'; // Ví dụ giá trị mẫu cho 'Imei'
          break;
        case 'kich_hoat':
          sampleData[this.languageService.translate(field?.name)] = true; // Ví dụ giá trị mẫu cho 'Kích hoạt'
          break;
        case 'ngay_xuat_hang':
          sampleData[this.languageService.translate(field?.name)] = currentDateFormatted; // Ngày xuất hàng là ngày hiện tại
          break;
        case 'ngay_kich_hoat':
          sampleData[this.languageService.translate(field?.name)] = currentDateFormatted; // Ngày kích hoạt là ngày hiện tại + 30 ngày
          break;
        case 'so_ngay_toi_da_duoc_phep_kich_hoat':
          sampleData[this.languageService.translate(field?.name)] = '30'; // Ví dụ giá trị mẫu cho 'Số ngày tối đa được phép kích hoạt'
          break;
        case 'han_bao_hanh':
          sampleData[this.languageService.translate(field?.name)] = '365'; // Ví dụ giá trị mẫu cho 'Hạn bảo hành'
          break;
        case 'thuong_hieu':
          sampleData[this.languageService.translate(field?.name)] = 'Viethas'; // Ví dụ giá trị mẫu cho 'Thương hiệu'
          break;
        default:
          sampleData[this.languageService.translate(field?.name)] = `Giá trị mẫu ${this.languageService.translate(field?.name)}`; // Giá trị mặc định nếu không khớp với bất kỳ trường hợp nào
      }
    }

    data.push(sampleData); // Thêm dòng dữ liệu mẫu
    // Xuất file XLSX
    this.vhAlgorithm.exportXLSX(data, name);
  }

  //hàm lấy các trường cần thiết để tạo ra file mẫu và hiển thị
  getNewFileds() {
    this.vhQueryAutoWeb.getNewFields_byFields({ id_main_sector: { $eq: 'snimei' } })
      .then((newfields: any) => {
        let newfieldsArr = [];
        newfields = this.vhAlgorithm.sortNumberbyASC(newfields, 'field_order_number');
        newfields.map((item) => {
          newfieldsArr.push({
            name: item.field_lable,
            db_field: item.field_custom + `_${this.functionService.defaultLanguage}`,
            field_required: item.field_required,
            lookup_group: item.lookup_group,
          });
        });
        this.fields = [...this.fields, ...newfieldsArr];
      });
  }

  async onInputChange(index: number, field: any, value: any) {
    this.isFormValid = true;
    const { db_field } = field;
    // Cập nhật giá trị của trường hiện tại
    this.formDataToCreate[index][db_field] = value;
    this.duplicateData[index][db_field] = false;

    await this.checkIsExistItemFile();
    // Kiểm tra sự tồn tại của giá trị hiện tại trong dữ liệu
    const exists = await this.checkIsExistItem(db_field, value);
    this.duplicateData[index] = {
      ...this.duplicateData[index],
      [db_field]: exists
    };

  }



  checkIsExistItem(item: any, value: any): Promise<boolean> {
    if (item === 'sn_imei') {
      const query = { [item]: { $eq: value } };
      return this.vhQueryAutoWeb.getSNIMEIs_byFields_byPages(query)
        .then((snimeis: any) => {
          const exists = snimeis.data.length > 0;
          if (snimeis.data.length > 0) {
            this.isFormValid = false;
          }
          return exists;
        })
    }
    return Promise.resolve(false);
  }

  checkIsExistItemFile(): void {
    this.formDataToCreate.forEach((item, index) => {
      let hasDuplicate = false;
      for (const field of this.fields) {
        if (field?.db_field === 'sn_imei') {
          const fieldValue = item[field?.db_field];
          this.duplicateDataFile[index][field.db_field] = false;
          // Kiểm tra xem giá trị này có trùng lặp trong formDataToCreate không (trừ chính nó)
          const isDuplicate = this.formDataToCreate.some((data, i) => i !== index && data[field?.db_field] === fieldValue);
          if (isDuplicate) {
            hasDuplicate = true;
            this.isFormValid = false;
            this.duplicateDataFile[index][field?.db_field] = true;
          }
        }

        // kiểm tra không được để trống, nếu trống thì không cho tạo
        if (
          (['sn_imei',
            'warehouse_release_date',
            'active',
            'max_activation_days',
            'warranty_period',
            'lookup_group',
            `name_${this.functionService.defaultLanguage}`,
            'product_id'
          ]
            .includes(field?.db_field) || field?.field_required)
          &&
          !item[field?.db_field]
        ) {
          this.isFormValid = false;

        }
      }
      // Nếu không tìm thấy giá trị trùng lặp, gán giá trị false cho duplicateDataFile[index][field?.db_field]
      if (!hasDuplicate) {
        for (const field of this.fields) {
          if (field?.db_field == 'sn_imei') {
            this.duplicateDataFile[index][field?.db_field] = false;
          }
        }
      }

      if (this.stringToBoolean(item.active)) {
        const purchaseDate = new Date(this.parseDate(item.warehouse_release_date));
        const activeDate = new Date(this.parseDate(item.active_date));
        const maxActivationDate = new Date(this.addDays(this.parseDate(item.warehouse_release_date), Number(item.max_activation_days)));
        purchaseDate.setHours(0, 0, 0, 0); // Set purchaseDate to start of the day
        activeDate.setHours(23, 59, 59, 999); // Set maxActivationDate to end of the day
        if (activeDate < purchaseDate || activeDate > maxActivationDate) {
          this.isFormValid = false;
        }
      }

      if (item.lookup_group < 1 || item.lookup_group > 10) {
        this.isFormValid = false;
      }

    });
  }

  isDuplicateData(index: number, fieldName: string): boolean {
    return this.duplicateData[index]?.[fieldName] ?? false;
  }

  isDuplicateFile(index: number, fieldName: string): boolean {
    return this.duplicateDataFile[index][fieldName] ?? false;
  }

  // Hàm chuyển đổi chuỗi ngày tháng 'dd-mm-yyyy' thành đối tượng Date
  parseDate(dateString: string): Date | null {
    if (!dateString) {
      return null;
    }

    const parts = dateString.toString().split('/');
    if (parts.length !== 3) {
      return null;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Tháng trong JavaScript bắt đầu từ 0
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return null;
    }

    const date = new Date(year, month, day);
    return date;
  }

  /**
 * 
  // Ví dụ sử dụng:
  const inputDate = 'Sat Aug 24 2024 09:15:49 GMT+0700 (Indochina Time)';
  const days = 365;  // Số ngày cần cộng thêm
  const resultDate = addDaysToFormattedDate(inputDate, days);
  console.log(resultDate);  // Kết quả: "Sun Aug 24 2025 09:15:49 GMT+0700 (Indochina Time)"
  */
  addDays(dateString, daysToAdd): Date {
    // Tạo đối tượng Date từ chuỗi ngày
    const date = new Date(dateString);

    // Cộng thêm số ngày
    date.setDate(date.getDate() + daysToAdd);
    return date
  }

  /**
   *  Hàm chuyển đổi chuỗi thành boolean 
   * 
   * @param 
   * @returns 
   */
  stringToBoolean = (stringValue) => {

    if (!stringValue) {
      return false;
    }

    if (typeof stringValue === 'boolean') {
      return stringValue;
    }

    if (typeof stringValue == 'string' && (stringValue?.toLowerCase() == 'true' || stringValue?.toLowerCase() == 'false')) {
      switch (stringValue?.toLowerCase()?.trim()) {
        case "true":
        case "yes":
        case "1":
          return true;

        case "false":
        case "no":
        case "0":
        case null:
        case undefined:
          return false;

        default:
          return false;
      }
    } else return false
  }

  isInvalidActiveDate(i, item) {
    if (this.stringToBoolean(item.active)) {
      const purchaseDate = new Date(this.parseDate(item.warehouse_release_date));
      const activeDate = new Date(this.parseDate(item.active_date));
      const maxActivationDate = new Date(this.addDays(this.parseDate(item.warehouse_release_date), Number(item.max_activation_days)));

      purchaseDate.setHours(0, 0, 0, 0); // Set purchaseDate to start of the day
      maxActivationDate.setHours(23, 59, 59, 999); // Set maxActivationDate to end of the day

      return activeDate < purchaseDate || activeDate > maxActivationDate;
    }
    return false
  }
}
