import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FunctionService } from 'vhobjects-service';
@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.scss'],
})
export class EditPageComponent implements OnInit {
  editPageForm: FormGroup
  @Input() page: any;
  @Input() pages: any;
  @Input() updateDB: boolean = true;

  constructor(
    private functionService: FunctionService,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private modal: NzModalRef
  ) {


  }
  ngOnInit(): void {
    this.editPageForm = new FormGroup({
      name: new FormControl({ value: this.page.name, disabled: this.page.type == 'homepage' }, Validators.compose([Validators.required])),
      link: new FormControl({ value: this.page.link, disabled: this.page.type == 'homepage' }, Validators.compose([Validators.required])),

      title: new FormControl(this.page.seo?.title || ''),
      description: new FormControl(this.page.seo?.description || ''),
      keywords: new FormControl(this.page.seo?.keywords || ''),
      og_title: new FormControl(this.page.seo?.og_title || ''),
      og_description: new FormControl(this.page.seo?.og_description || ''),
      og_type: new FormControl(this.page.seo?.og_type || ''),
    });


  }
  onNoClick(): void {
    this.modal.close();
  }

  editPage(): void {
    if (this.editPageForm.invalid) {
      return;
    }
    const { name, link, title, description, keywords, og_title, og_description, og_type } = this.editPageForm.value;
    const currrentPages = this.pages.filter(
      (page) => page.name === name
    );
    const currrentLinks = this.pages.filter(
      (page) => page.link === link
    );
    if (currrentPages.length > 0) {
      return this.functionService.createMessage('error', 'ten_trang_da_ton_tai');
    }
    if (currrentLinks.length > 0) {
      return this.functionService.createMessage('error', 'duong_dan_trang_da_ton_tai');
    }



    let data_update = {
      name: name || this.page.name,
      link: link || this.page.link,
      seo: {
        title,
        description,
        keywords,
        og_title,
        og_description,
        og_type,
      },
    }

    if(this.updateDB) {
      this.vhQueryAutoWeb.updatePage(this.page._id, data_update).then(
        (bool: any) => {
          this.modal.close(data_update);
        },
        (error) => {
          console.error(error);
        }
      );
    } else {
      this.modal.close(data_update);
    }
    
  }

  nonAccentVietnamese(str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // Huyền sắc hỏi ngã nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // Â, Ê, Ă, Ơ, Ư
    return str;
  }

  formatName(_value) {
    _value = this.nonAccentVietnamese(_value);
    return _value.split(' ').join('-');
  }
}