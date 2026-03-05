import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb, VhImage } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { ManageLibraryComponent } from 'vhobjects-service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-edit-blog',
  templateUrl: './edit-blog.component.html',
  styleUrls: ['./edit-blog.component.scss'],
})
export class EditBlogComponent implements OnInit {
  public edtiNewsForm: FormGroup;
  /** Palette màu cho CKEDITOR */
  colorPalette = [
    { color: 'hsl(0, 100%, 95%)', label: ' ' }, { color: 'hsl(0, 100%, 90%)', label: ' ' }, { color: 'hsl(0, 100%, 85%)', label: ' ' }, { color: 'hsl(0, 100%, 80%)', label: ' ' }, { color: 'hsl(0, 100%, 75%)', label: ' ' },{ color: 'hsl(0, 100%, 70%)', label: ' ' }, { color: 'hsl(0, 100%, 65%)', label: ' ' }, { color: 'hsl(0, 100%, 60%)', label: ' ' }, { color: 'hsl(0, 100%, 55%)', label: ' ' }, { color: 'hsl(0, 100%, 50%)', label: ' ' },{ color: 'hsl(0, 100%, 45%)', label: ' ' }, { color: 'hsl(0, 100%, 40%)', label: ' ' }, { color: 'hsl(0, 100%, 35%)', label: ' ' }, { color: 'hsl(0, 100%, 30%)', label: ' ' }, { color: 'hsl(0, 100%, 25%)', label: ' ' },{ color: 'hsl(0, 100%, 20%)', label: ' ' }, { color: 'hsl(0, 100%, 15%)', label: ' ' }, { color: 'hsl(0, 100%, 10%)', label: ' ' }, { color: 'hsl(0, 100%, 5%)', label: ' ' }, { color: 'hsl(0, 100%, 2%)', label: ' ' }, { color: 'hsl(120, 100%, 95%)', label: ' ' }, { color: 'hsl(120, 100%, 90%)', label: ' ' }, { color: 'hsl(120, 100%, 85%)', label: ' ' }, { color: 'hsl(120, 100%, 80%)', label: ' ' }, { color: 'hsl(120, 100%, 75%)', label: ' ' },{ color: 'hsl(120, 100%, 70%)', label: ' ' }, { color: 'hsl(120, 100%, 65%)', label: ' ' }, { color: 'hsl(120, 100%, 60%)', label: ' ' }, { color: 'hsl(120, 100%, 55%)', label: ' ' }, { color: 'hsl(120, 100%, 50%)', label: ' ' },{ color: 'hsl(120, 100%, 45%)', label: ' ' }, { color: 'hsl(120, 100%, 40%)', label: ' ' }, { color: 'hsl(120, 100%, 35%)', label: ' ' }, { color: 'hsl(120, 100%, 30%)', label: ' ' }, { color: 'hsl(120, 100%, 25%)', label: ' ' },{ color: 'hsl(120, 100%, 20%)', label: ' ' }, { color: 'hsl(120, 100%, 15%)', label: ' ' }, { color: 'hsl(120, 100%, 10%)', label: ' ' }, { color: 'hsl(120, 100%, 5%)', label: ' ' }, { color: 'hsl(120, 100%, 2%)', label: ' ' }, { color: 'hsl(240, 100%, 95%)', label: ' ' }, { color: 'hsl(240, 100%, 90%)', label: ' ' }, { color: 'hsl(240, 100%, 85%)', label: ' ' }, { color: 'hsl(240, 100%, 80%)', label: ' ' }, { color: 'hsl(240, 100%, 75%)', label: ' ' },{ color: 'hsl(240, 100%, 70%)', label: ' ' }, { color: 'hsl(240, 100%, 65%)', label: ' ' }, { color: 'hsl(240, 100%, 60%)', label: ' ' }, { color: 'hsl(240, 100%, 55%)', label: ' ' }, { color: 'hsl(240, 100%, 50%)', label: ' ' },{ color: 'hsl(240, 100%, 45%)', label: ' ' }, { color: 'hsl(240, 100%, 40%)', label: ' ' }, { color: 'hsl(240, 100%, 35%)', label: ' ' }, { color: 'hsl(240, 100%, 30%)', label: ' ' }, { color: 'hsl(240, 100%, 25%)', label: ' ' },{ color: 'hsl(240, 100%, 20%)', label: ' ' }, { color: 'hsl(240, 100%, 15%)', label: ' ' }, { color: 'hsl(240, 100%, 10%)', label: ' ' }, { color: 'hsl(240, 100%, 5%)', label: ' ' }, { color: 'hsl(240, 100%, 2%)', label: ' ' }, { color: 'hsl(60, 100%, 95%)', label: ' ' }, { color: 'hsl(60, 100%, 90%)', label: ' ' }, { color: 'hsl(60, 100%, 85%)', label: ' ' }, { color: 'hsl(60, 100%, 80%)', label: ' ' }, { color: 'hsl(60, 100%, 75%)', label: ' ' },{ color: 'hsl(60, 100%, 70%)', label: ' ' }, { color: 'hsl(60, 100%, 65%)', label: ' ' }, { color: 'hsl(60, 100%, 60%)', label: ' ' }, { color: 'hsl(60, 100%, 55%)', label: ' ' }, { color: 'hsl(60, 100%, 50%)', label: ' ' },{ color: 'hsl(60, 100%, 45%)', label: ' ' }, { color: 'hsl(60, 100%, 40%)', label: ' ' }, { color: 'hsl(60, 100%, 35%)', label: ' ' }, { color: 'hsl(60, 100%, 30%)', label: ' ' }, { color: 'hsl(60, 100%, 25%)', label: ' ' },{ color: 'hsl(60, 100%, 20%)', label: ' ' }, { color: 'hsl(60, 100%, 15%)', label: ' ' }, { color: 'hsl(60, 100%, 10%)', label: ' ' }, { color: 'hsl(60, 100%, 5%)', label: ' ' }, { color: 'hsl(60, 100%, 2%)', label: ' ' }, { color: 'hsl(30, 100%, 95%)', label: ' ' }, { color: 'hsl(30, 100%, 90%)', label: ' ' }, { color: 'hsl(30, 100%, 85%)', label: ' ' }, { color: 'hsl(30, 100%, 80%)', label: ' ' }, { color: 'hsl(30, 100%, 75%)', label: ' ' },{ color: 'hsl(30, 100%, 70%)', label: ' ' }, { color: 'hsl(30, 100%, 65%)', label: ' ' }, { color: 'hsl(30, 100%, 60%)', label: ' ' }, { color: 'hsl(30, 100%, 55%)', label: ' ' }, { color: 'hsl(30, 100%, 50%)', label: ' ' },{ color: 'hsl(30, 100%, 45%)', label: ' ' }, { color: 'hsl(30, 100%, 40%)', label: ' ' }, { color: 'hsl(30, 100%, 35%)', label: ' ' }, { color: 'hsl(30, 100%, 30%)', label: ' ' }, { color: 'hsl(30, 100%, 25%)', label: ' ' },{ color: 'hsl(30, 100%, 20%)', label: ' ' }, { color: 'hsl(30, 100%, 15%)', label: ' ' }, { color: 'hsl(30, 100%, 10%)', label: ' ' }, { color: 'hsl(30, 100%, 5%)', label: ' ' }, { color: 'hsl(30, 100%, 2%)', label: ' ' }, { color: 'hsl(330, 100%, 95%)', label: ' ' }, { color: 'hsl(330, 100%, 90%)', label: ' ' }, { color: 'hsl(330, 100%, 85%)', label: ' ' }, { color: 'hsl(330, 100%, 80%)', label: ' ' }, { color: 'hsl(330, 100%, 75%)', label: ' ' },{ color: 'hsl(330, 100%, 70%)', label: ' ' }, { color: 'hsl(330, 100%, 65%)', label: ' ' }, { color: 'hsl(330, 100%, 60%)', label: ' ' }, { color: 'hsl(330, 100%, 55%)', label: ' ' }, { color: 'hsl(330, 100%, 50%)', label: ' ' },{ color: 'hsl(330, 100%, 45%)', label: ' ' }, { color: 'hsl(330, 100%, 40%)', label: ' ' }, { color: 'hsl(330, 100%, 35%)', label: ' ' }, { color: 'hsl(330, 100%, 30%)', label: ' ' }, { color: 'hsl(330, 100%, 25%)', label: ' ' },{ color: 'hsl(330, 100%, 20%)', label: ' ' }, { color: 'hsl(330, 100%, 15%)', label: ' ' }, { color: 'hsl(330, 100%, 10%)', label: ' ' }, { color: 'hsl(330, 100%, 5%)', label: ' ' }, { color: 'hsl(330, 100%, 2%)', label: ' ' }, { color: 'hsl(270, 100%, 95%)', label: ' ' }, { color: 'hsl(270, 100%, 90%)', label: ' ' }, { color: 'hsl(270, 100%, 85%)', label: ' ' }, { color: 'hsl(270, 100%, 80%)', label: ' ' }, { color: 'hsl(270, 100%, 75%)', label: ' ' },{ color: 'hsl(270, 100%, 70%)', label: ' ' }, { color: 'hsl(270, 100%, 65%)', label: ' ' }, { color: 'hsl(270, 100%, 60%)', label: ' ' }, { color: 'hsl(270, 100%, 55%)', label: ' ' }, { color: 'hsl(270, 100%, 50%)', label: ' ' },{ color: 'hsl(270, 100%, 45%)', label: ' ' }, { color: 'hsl(270, 100%, 40%)', label: ' ' }, { color: 'hsl(270, 100%, 35%)', label: ' ' }, { color: 'hsl(270, 100%, 30%)', label: ' ' }, { color: 'hsl(270, 100%, 25%)', label: ' ' },{ color: 'hsl(270, 100%, 20%)', label: ' ' }, { color: 'hsl(270, 100%, 15%)', label: ' ' }, { color: 'hsl(270, 100%, 10%)', label: ' ' }, { color: 'hsl(270, 100%, 5%)', label: ' ' }, { color: 'hsl(270, 100%, 2%)', label: ' ' }, { color: 'hsl(0, 0%, 0%)', label: ' ' }, { color: 'hsl(0, 0%, 10%)', label: ' ' }, { color: 'hsl(0, 0%, 20%)', label: ' ' }, { color: 'hsl(0, 0%, 30%)', label: ' ' }, { color: 'hsl(0, 0%, 40%)', label: ' ' },{ color: 'hsl(0, 0%, 50%)', label: ' ' }, { color: 'hsl(0, 0%, 60%)', label: ' ' }, { color: 'hsl(0, 0%, 70%)', label: ' ' }, { color: 'hsl(0, 0%, 80%)', label: ' ' }, { color: 'hsl(0, 0%, 90%)', label: ' ' },{ color: 'hsl(0, 0%, 95%)', label: ' ' }, { color: 'hsl(0, 0%, 92%)', label: ' ' }, { color: 'hsl(0, 0%, 85%)', label: ' ' }, { color: 'hsl(0, 0%, 78%)', label: ' ' }, { color: 'hsl(0, 0%, 71%)', label: ' ' },{ color: 'hsl(0, 0%, 64%)', label: ' ' }, { color: 'hsl(0, 0%, 57%)', label: ' ' }, { color: 'hsl(0, 0%, 50%)', label: ' ' }, { color: 'hsl(0, 0%, 43%)', label: ' ' }, { color: 'hsl(0, 0%, 36%)', label: ' ' }, { color: 'hsl(0, 0%, 100%)', label: ' ' }, { color: 'hsl(0, 0%, 95%)', label: ' ' }, { color: 'hsl(0, 0%, 90%)', label: ' ' }, { color: 'hsl(0, 0%, 85%)', label: ' ' }, { color: 'hsl(0, 0%, 80%)', label: ' ' }, { color: 'hsl(0, 0%, 75%)', label: ' ' }, { color: 'hsl(0, 0%, 70%)', label: ' ' }, { color: 'hsl(0, 0%, 65%)', label: ' ' }, { color: 'hsl(0, 0%, 60%)', label: ' ' }, { color: 'hsl(0, 0%, 55%)', label: ' ' },{ color: 'hsl(0, 0%, 50%)', label: ' ' }, { color: 'hsl(0, 0%, 45%)', label: ' ' }, { color: 'hsl(0, 0%, 40%)', label: ' ' }, { color: 'hsl(0, 0%, 35%)', label: ' ' }, { color: 'hsl(0, 0%, 30%)', label: ' ' },{ color: 'hsl(0, 0%, 25%)', label: ' ' }, { color: 'hsl(0, 0%, 20%)', label: ' ' }, { color: 'hsl(0, 0%, 15%)', label: ' ' }, { color: 'hsl(0, 0%, 10%)', label: ' ' }, { color: 'hsl(0, 0%, 5%)', label: ' ' }, { color: 'hsl(30, 100%, 95%)', label: ' ' }, { color: 'hsl(30, 100%, 90%)', label: ' ' }, { color: 'hsl(30, 100%, 85%)', label: ' ' }, { color: 'hsl(30, 100%, 80%)', label: ' ' }, { color: 'hsl(30, 100%, 75%)', label: ' ' }, { color: 'hsl(30, 100%, 70%)', label: ' ' }, { color: 'hsl(30, 100%, 65%)', label: ' ' }, { color: 'hsl(30, 100%, 60%)', label: ' ' }, { color: 'hsl(30, 100%, 55%)', label: ' ' }, { color: 'hsl(30, 100%, 50%)', label: ' ' }, { color: 'hsl(30, 100%, 45%)', label: ' ' }, { color: 'hsl(30, 100%, 40%)', label: ' ' }, { color: 'hsl(30, 100%, 35%)', label: ' ' }, { color: 'hsl(30, 100%, 30%)', label: ' ' }, { color: 'hsl(30, 100%, 25%)', label: ' ' }, { color: 'hsl(30, 100%, 20%)', label: ' ' }, { color: 'hsl(30, 100%, 15%)', label: ' ' }, { color: 'hsl(30, 100%, 10%)', label: ' ' }, { color: 'hsl(30, 100%, 5%)', label: ' ' }, { color: 'hsl(30, 100%, 2%)', label: ' ' }
  ];
  public EDITOR = DecoupledEditor;
  public config: any = {
    ckfinder: {
      options: {
        language: 'en',
        resourceType: 'Images',
        readonly: true,
      },
    },
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
  title: any = '';
  public listNewsCategory = [];
  public path: any = '';
  constructor(
    public dialogRef: MatDialogRef<EditBlogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public vhAlgorithm: VhAlgorithm,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    private vhImage: VhImage,
    public functionService: FunctionService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private nzMessageService: NzMessageService
  ) {}

  ngOnInit(): void {
    this.getCategory();
    this.initForm(this.data);
  }

  initForm(value) {
    this.edtiNewsForm = new FormGroup({
      title: new FormControl(
        value.title,
        Validators.compose([Validators.required, Validators.minLength(5)])
      ),
      description: new FormControl(value.description),
      content: new FormControl(value.content),
      date: new FormControl(value.date),
      img: new FormControl(value.img),
      webapp_seo_title: new FormControl(value.webapp_seo_title),
      webapp_seo_keyword: new FormControl(value.webapp_seo_keyword),
      webapp_seo_description: new FormControl(value.webapp_seo_description),
      hidden: new FormControl(value.hidden),
      link: new FormControl(value.link),
      id_newscategory: new FormControl(
        value.id_newscategory,
        Validators.required
      ),
    });
  }

  createMessage(type: string, key: string, duration: number = 2000) {
    this.translate.get(key).subscribe((translatedMessage: string) => {
      this.nzMessageService.create(type, translatedMessage, { nzDuration: duration });
    });
  }


  getCategory(): void {
    this.vhQueryAutoWeb
      .getNewsCategorys_byFields({ type: { $eq: 2 } }, {}, {}, 0)
      .then(
        (category: any) => {
          this.listNewsCategory = category.data;
        },
        (error) => {
          this.createMessage(
            'error',
            'da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu_vui_long_thu_lai'
          );
        }
      );
  }

  public onReady(editor: DecoupledEditor) {
    editor.ui
      .getEditableElement()
      .parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
      );
    editor.plugins.get('FileRepository').createUploadAdapter = function (
      loader: any
    ) {
      return this.vhImage.MyUploadImageAdapter(loader,'blogs')
    };
  }

  updateNews(field: string, objectUpdate) {
    if (field == 'name') {
      if (objectUpdate.name == this.title) return;
      let link = this.functionService.nonAccentVietnamese(
        objectUpdate.name.trim()
      );
      if (!this.checkLinkTitleByName(link)) return;
      else {
        link = link + '-1';
      }
      this.edtiNewsForm.controls['link'].setValue(
        this.functionService.nonAccentVietnamese(link)
      );
      objectUpdate = {
        name: objectUpdate.name,
        link: this.edtiNewsForm.value.link,
      };
    }
    this.vhQueryAutoWeb.updateNews(this.data._id, objectUpdate).then(
      (res: any) => {
        if (res.vcode === 11) {
          this.createMessage(
            'error',
            'phien_dang_nhap_da_het_han_vui_long_dang_nhap_lai'
          );
        }
      },
      (error) => {
        this.createMessage(
          'error',
          'da_xay_ra_loi_trong_qua_trinh_cap_nhat'
        );
      }
    );
  }

  /** Hàm này thực hiện kiểm tra barcode hợp lệ
   *
   * @param barcode
   * @returns
   */
  checkLinkTitleByName(link): boolean {
    const promise = this.vhQueryAutoWeb.getNewss_byFields({
      link: { $eq: link },
    });
    return true;
  }

  close() {
    this.dialogRef.close({
      ...this.data,
      ...this.edtiNewsForm.value,
    });
  }

  getFile() {
    document.getElementById('file-upload').click();
  }

  /** Lấy hình ảnh từ Desktop */
  onUpload(e?) {
    const file = e.target.files[0];
    this.vhImage
      .getImageFromDesktop(
        file,
        
        'news',
        this.edtiNewsForm.value['img'] || '',
        2000000
      )
      .then(
        (rsp: any) => {

          if (rsp.vcode === 0) {
            this.edtiNewsForm.controls['img'].setValue(rsp.data);
            this.updateNews('img', { img: this.edtiNewsForm.value.img });
            this.createMessage(
              'success',
              'hinh_anh_da_duoc_tai_thanh_cong'
            );
          } else {
            this.createMessage(
              'error',
              `Tải ảnh thất bại! Lý do: ${rsp.message}`
            );
          }
          
        },
        () => {
          this.createMessage(
            'error',
            'tai_anh_that_bai_vui_long_thu_lai'
          );
        }
      );
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
        this.edtiNewsForm.controls['img'].setValue(result.href);
      }
      this.path = result.path;
    });
  }
}
