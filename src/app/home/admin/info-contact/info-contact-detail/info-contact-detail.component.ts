import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { LanguageService } from 'src/app/services/language.service';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-info-contact-detail',
  templateUrl: './info-contact-detail.component.html',
  styleUrls: ['./info-contact-detail.component.scss']
})
export class InfoContactDetailComponent implements OnInit {
  @Input() data: any;
  contactDetailForm: any;
  newFields: any[] = [];
  // Biến quản lý trạng thái mở rộng nội dung
  isContentExpanded: boolean = false;
  isContentLong: boolean = false;
  private readonly CONTENT_MAX_LENGTH = 150;
  constructor(
    private modal: NzModalRef,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private vhAlgorithm: VhAlgorithm,
    public functionService: FunctionService,
    public languageService: LanguageService,
  ) { }

  ngOnInit() {
    this.getNewFileds();
    this.checkContentLength();
  }

  getNewFileds() {
    this.vhQueryAutoWeb.getNewFields_byFields({ id_main_sector: { $eq: 'basic' } })
      .then((newfields: any) => {
        this.newFields = this.vhAlgorithm.sortNumberbyASC(newfields, 'field_order_number')
        this.initForm(this.data);
      })
  }

  /** Hàm khởi tạo form
   *
   */
  initForm(data) {
    this.contactDetailForm = new FormGroup({
      name: new FormControl({ value: data.name, disabled: true }),
      telephone: new FormControl({ value: data.telephone, disabled: true }, Validators.compose([Validators.required])),
      email: new FormControl({ value: data.email, disabled: true }, Validators.compose([Validators.required])),
      content: new FormControl({ value: data.content, disabled: true }),
      date: new FormControl({ value: this.formatDate(data.date), disabled: true }),
    });

    this.newFields.forEach((field: any) => {
      let value = data[field.field_custom];
      // Nếu là ISO date string thì format lại
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        value = this.formatDate(value, false);
      }

      if(Array.isArray(value)) {
        value = value.map((item:any) => item['label_' + this.functionService.languageTempCode]).join(', ')
      }

      this.contactDetailForm.addControl(field['field_custom'] , new FormControl({ value: value, disabled: true }));
    })


    console.log(this.contactDetailForm.value)
  }

  close() {
    this.modal.close()
  }

  formatDate(dateString: string, isTime = true): string {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0'); // Lấy ngày (dd)
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Lấy tháng (mm)
    const year = date.getFullYear(); // Lấy năm (yyyy)

    const hours = String(date.getHours()).padStart(2, '0'); // Lấy giờ (HH)
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Lấy phút (mm)
    const seconds = String(date.getSeconds()).padStart(2, '0'); // Lấy giây (ss)
    if (!isTime) {
      return `${day}/${month}/${year}`;
    }
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  checkContentLength() {
    const content = this.data?.content || '';
    this.isContentLong = content.length > this.CONTENT_MAX_LENGTH;
  }

  toggleContent() {
    this.isContentExpanded = !this.isContentExpanded;
  }

}
