import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VhQueryAutoWeb, VhAlgorithm, VhImage } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { ManageLibraryComponent } from 'vhobjects-service';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-add-blog',
  templateUrl: './add-blog.component.html',
  styleUrls: ['./add-blog.component.scss'],
})
export class AddBlogComponent implements OnInit {
  /** Palette màu cho CKEDITOR */
  colorPalette = [
    { color: 'hsl(0, 100%, 95%)', label: ' ' }, { color: 'hsl(0, 100%, 90%)', label: ' ' }, { color: 'hsl(0, 100%, 85%)', label: ' ' }, { color: 'hsl(0, 100%, 80%)', label: ' ' }, { color: 'hsl(0, 100%, 75%)', label: ' ' },{ color: 'hsl(0, 100%, 70%)', label: ' ' }, { color: 'hsl(0, 100%, 65%)', label: ' ' }, { color: 'hsl(0, 100%, 60%)', label: ' ' }, { color: 'hsl(0, 100%, 55%)', label: ' ' }, { color: 'hsl(0, 100%, 50%)', label: ' ' },{ color: 'hsl(0, 100%, 45%)', label: ' ' }, { color: 'hsl(0, 100%, 40%)', label: ' ' }, { color: 'hsl(0, 100%, 35%)', label: ' ' }, { color: 'hsl(0, 100%, 30%)', label: ' ' }, { color: 'hsl(0, 100%, 25%)', label: ' ' },{ color: 'hsl(0, 100%, 20%)', label: ' ' }, { color: 'hsl(0, 100%, 15%)', label: ' ' }, { color: 'hsl(0, 100%, 10%)', label: ' ' }, { color: 'hsl(0, 100%, 5%)', label: ' ' }, { color: 'hsl(0, 100%, 2%)', label: ' ' }, { color: 'hsl(120, 100%, 95%)', label: ' ' }, { color: 'hsl(120, 100%, 90%)', label: ' ' }, { color: 'hsl(120, 100%, 85%)', label: ' ' }, { color: 'hsl(120, 100%, 80%)', label: ' ' }, { color: 'hsl(120, 100%, 75%)', label: ' ' },{ color: 'hsl(120, 100%, 70%)', label: ' ' }, { color: 'hsl(120, 100%, 65%)', label: ' ' }, { color: 'hsl(120, 100%, 60%)', label: ' ' }, { color: 'hsl(120, 100%, 55%)', label: ' ' }, { color: 'hsl(120, 100%, 50%)', label: ' ' },{ color: 'hsl(120, 100%, 45%)', label: ' ' }, { color: 'hsl(120, 100%, 40%)', label: ' ' }, { color: 'hsl(120, 100%, 35%)', label: ' ' }, { color: 'hsl(120, 100%, 30%)', label: ' ' }, { color: 'hsl(120, 100%, 25%)', label: ' ' },{ color: 'hsl(120, 100%, 20%)', label: ' ' }, { color: 'hsl(120, 100%, 15%)', label: ' ' }, { color: 'hsl(120, 100%, 10%)', label: ' ' }, { color: 'hsl(120, 100%, 5%)', label: ' ' }, { color: 'hsl(120, 100%, 2%)', label: ' ' }, { color: 'hsl(240, 100%, 95%)', label: ' ' }, { color: 'hsl(240, 100%, 90%)', label: ' ' }, { color: 'hsl(240, 100%, 85%)', label: ' ' }, { color: 'hsl(240, 100%, 80%)', label: ' ' }, { color: 'hsl(240, 100%, 75%)', label: ' ' },{ color: 'hsl(240, 100%, 70%)', label: ' ' }, { color: 'hsl(240, 100%, 65%)', label: ' ' }, { color: 'hsl(240, 100%, 60%)', label: ' ' }, { color: 'hsl(240, 100%, 55%)', label: ' ' }, { color: 'hsl(240, 100%, 50%)', label: ' ' },{ color: 'hsl(240, 100%, 45%)', label: ' ' }, { color: 'hsl(240, 100%, 40%)', label: ' ' }, { color: 'hsl(240, 100%, 35%)', label: ' ' }, { color: 'hsl(240, 100%, 30%)', label: ' ' }, { color: 'hsl(240, 100%, 25%)', label: ' ' },{ color: 'hsl(240, 100%, 20%)', label: ' ' }, { color: 'hsl(240, 100%, 15%)', label: ' ' }, { color: 'hsl(240, 100%, 10%)', label: ' ' }, { color: 'hsl(240, 100%, 5%)', label: ' ' }, { color: 'hsl(240, 100%, 2%)', label: ' ' }, { color: 'hsl(60, 100%, 95%)', label: ' ' }, { color: 'hsl(60, 100%, 90%)', label: ' ' }, { color: 'hsl(60, 100%, 85%)', label: ' ' }, { color: 'hsl(60, 100%, 80%)', label: ' ' }, { color: 'hsl(60, 100%, 75%)', label: ' ' },{ color: 'hsl(60, 100%, 70%)', label: ' ' }, { color: 'hsl(60, 100%, 65%)', label: ' ' }, { color: 'hsl(60, 100%, 60%)', label: ' ' }, { color: 'hsl(60, 100%, 55%)', label: ' ' }, { color: 'hsl(60, 100%, 50%)', label: ' ' },{ color: 'hsl(60, 100%, 45%)', label: ' ' }, { color: 'hsl(60, 100%, 40%)', label: ' ' }, { color: 'hsl(60, 100%, 35%)', label: ' ' }, { color: 'hsl(60, 100%, 30%)', label: ' ' }, { color: 'hsl(60, 100%, 25%)', label: ' ' },{ color: 'hsl(60, 100%, 20%)', label: ' ' }, { color: 'hsl(60, 100%, 15%)', label: ' ' }, { color: 'hsl(60, 100%, 10%)', label: ' ' }, { color: 'hsl(60, 100%, 5%)', label: ' ' }, { color: 'hsl(60, 100%, 2%)', label: ' ' }, { color: 'hsl(30, 100%, 95%)', label: ' ' }, { color: 'hsl(30, 100%, 90%)', label: ' ' }, { color: 'hsl(30, 100%, 85%)', label: ' ' }, { color: 'hsl(30, 100%, 80%)', label: ' ' }, { color: 'hsl(30, 100%, 75%)', label: ' ' },{ color: 'hsl(30, 100%, 70%)', label: ' ' }, { color: 'hsl(30, 100%, 65%)', label: ' ' }, { color: 'hsl(30, 100%, 60%)', label: ' ' }, { color: 'hsl(30, 100%, 55%)', label: ' ' }, { color: 'hsl(30, 100%, 50%)', label: ' ' },{ color: 'hsl(30, 100%, 45%)', label: ' ' }, { color: 'hsl(30, 100%, 40%)', label: ' ' }, { color: 'hsl(30, 100%, 35%)', label: ' ' }, { color: 'hsl(30, 100%, 30%)', label: ' ' }, { color: 'hsl(30, 100%, 25%)', label: ' ' },{ color: 'hsl(30, 100%, 20%)', label: ' ' }, { color: 'hsl(30, 100%, 15%)', label: ' ' }, { color: 'hsl(30, 100%, 10%)', label: ' ' }, { color: 'hsl(30, 100%, 5%)', label: ' ' }, { color: 'hsl(30, 100%, 2%)', label: ' ' }, { color: 'hsl(330, 100%, 95%)', label: ' ' }, { color: 'hsl(330, 100%, 90%)', label: ' ' }, { color: 'hsl(330, 100%, 85%)', label: ' ' }, { color: 'hsl(330, 100%, 80%)', label: ' ' }, { color: 'hsl(330, 100%, 75%)', label: ' ' },{ color: 'hsl(330, 100%, 70%)', label: ' ' }, { color: 'hsl(330, 100%, 65%)', label: ' ' }, { color: 'hsl(330, 100%, 60%)', label: ' ' }, { color: 'hsl(330, 100%, 55%)', label: ' ' }, { color: 'hsl(330, 100%, 50%)', label: ' ' },{ color: 'hsl(330, 100%, 45%)', label: ' ' }, { color: 'hsl(330, 100%, 40%)', label: ' ' }, { color: 'hsl(330, 100%, 35%)', label: ' ' }, { color: 'hsl(330, 100%, 30%)', label: ' ' }, { color: 'hsl(330, 100%, 25%)', label: ' ' },{ color: 'hsl(330, 100%, 20%)', label: ' ' }, { color: 'hsl(330, 100%, 15%)', label: ' ' }, { color: 'hsl(330, 100%, 10%)', label: ' ' }, { color: 'hsl(330, 100%, 5%)', label: ' ' }, { color: 'hsl(330, 100%, 2%)', label: ' ' }, { color: 'hsl(270, 100%, 95%)', label: ' ' }, { color: 'hsl(270, 100%, 90%)', label: ' ' }, { color: 'hsl(270, 100%, 85%)', label: ' ' }, { color: 'hsl(270, 100%, 80%)', label: ' ' }, { color: 'hsl(270, 100%, 75%)', label: ' ' },{ color: 'hsl(270, 100%, 70%)', label: ' ' }, { color: 'hsl(270, 100%, 65%)', label: ' ' }, { color: 'hsl(270, 100%, 60%)', label: ' ' }, { color: 'hsl(270, 100%, 55%)', label: ' ' }, { color: 'hsl(270, 100%, 50%)', label: ' ' },{ color: 'hsl(270, 100%, 45%)', label: ' ' }, { color: 'hsl(270, 100%, 40%)', label: ' ' }, { color: 'hsl(270, 100%, 35%)', label: ' ' }, { color: 'hsl(270, 100%, 30%)', label: ' ' }, { color: 'hsl(270, 100%, 25%)', label: ' ' },{ color: 'hsl(270, 100%, 20%)', label: ' ' }, { color: 'hsl(270, 100%, 15%)', label: ' ' }, { color: 'hsl(270, 100%, 10%)', label: ' ' }, { color: 'hsl(270, 100%, 5%)', label: ' ' }, { color: 'hsl(270, 100%, 2%)', label: ' ' }, { color: 'hsl(0, 0%, 0%)', label: ' ' }, { color: 'hsl(0, 0%, 10%)', label: ' ' }, { color: 'hsl(0, 0%, 20%)', label: ' ' }, { color: 'hsl(0, 0%, 30%)', label: ' ' }, { color: 'hsl(0, 0%, 40%)', label: ' ' },{ color: 'hsl(0, 0%, 50%)', label: ' ' }, { color: 'hsl(0, 0%, 60%)', label: ' ' }, { color: 'hsl(0, 0%, 70%)', label: ' ' }, { color: 'hsl(0, 0%, 80%)', label: ' ' }, { color: 'hsl(0, 0%, 90%)', label: ' ' },{ color: 'hsl(0, 0%, 95%)', label: ' ' }, { color: 'hsl(0, 0%, 92%)', label: ' ' }, { color: 'hsl(0, 0%, 85%)', label: ' ' }, { color: 'hsl(0, 0%, 78%)', label: ' ' }, { color: 'hsl(0, 0%, 71%)', label: ' ' },{ color: 'hsl(0, 0%, 64%)', label: ' ' }, { color: 'hsl(0, 0%, 57%)', label: ' ' }, { color: 'hsl(0, 0%, 50%)', label: ' ' }, { color: 'hsl(0, 0%, 43%)', label: ' ' }, { color: 'hsl(0, 0%, 36%)', label: ' ' }, { color: 'hsl(0, 0%, 100%)', label: ' ' }, { color: 'hsl(0, 0%, 95%)', label: ' ' }, { color: 'hsl(0, 0%, 90%)', label: ' ' }, { color: 'hsl(0, 0%, 85%)', label: ' ' }, { color: 'hsl(0, 0%, 80%)', label: ' ' }, { color: 'hsl(0, 0%, 75%)', label: ' ' }, { color: 'hsl(0, 0%, 70%)', label: ' ' }, { color: 'hsl(0, 0%, 65%)', label: ' ' }, { color: 'hsl(0, 0%, 60%)', label: ' ' }, { color: 'hsl(0, 0%, 55%)', label: ' ' },{ color: 'hsl(0, 0%, 50%)', label: ' ' }, { color: 'hsl(0, 0%, 45%)', label: ' ' }, { color: 'hsl(0, 0%, 40%)', label: ' ' }, { color: 'hsl(0, 0%, 35%)', label: ' ' }, { color: 'hsl(0, 0%, 30%)', label: ' ' },{ color: 'hsl(0, 0%, 25%)', label: ' ' }, { color: 'hsl(0, 0%, 20%)', label: ' ' }, { color: 'hsl(0, 0%, 15%)', label: ' ' }, { color: 'hsl(0, 0%, 10%)', label: ' ' }, { color: 'hsl(0, 0%, 5%)', label: ' ' }, { color: 'hsl(30, 100%, 95%)', label: ' ' }, { color: 'hsl(30, 100%, 90%)', label: ' ' }, { color: 'hsl(30, 100%, 85%)', label: ' ' }, { color: 'hsl(30, 100%, 80%)', label: ' ' }, { color: 'hsl(30, 100%, 75%)', label: ' ' }, { color: 'hsl(30, 100%, 70%)', label: ' ' }, { color: 'hsl(30, 100%, 65%)', label: ' ' }, { color: 'hsl(30, 100%, 60%)', label: ' ' }, { color: 'hsl(30, 100%, 55%)', label: ' ' }, { color: 'hsl(30, 100%, 50%)', label: ' ' }, { color: 'hsl(30, 100%, 45%)', label: ' ' }, { color: 'hsl(30, 100%, 40%)', label: ' ' }, { color: 'hsl(30, 100%, 35%)', label: ' ' }, { color: 'hsl(30, 100%, 30%)', label: ' ' }, { color: 'hsl(30, 100%, 25%)', label: ' ' }, { color: 'hsl(30, 100%, 20%)', label: ' ' }, { color: 'hsl(30, 100%, 15%)', label: ' ' }, { color: 'hsl(30, 100%, 10%)', label: ' ' }, { color: 'hsl(30, 100%, 5%)', label: ' ' }, { color: 'hsl(30, 100%, 2%)', label: ' ' }
  ];
  public EDITOR = DecoupledEditor;
  content: any = '';
  public config: any = {
    ckfinder: {
      options: {
        language: 'en',
        resourceType: 'Images',
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
  public addNewsForm: FormGroup;
  public linkListBlog: any = 'admin/blog/page/1';
  public listBlogCategory: any;
  public img = '';
  public listNewsCategory = [];
  public path: any = '';
  submitting = false; // Trạng thái submit form để tránh submit nhiều lần

  constructor(
    public dialogRef: MatDialogRef<AddBlogComponent>,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public vhAlgorithm: VhAlgorithm,
    public functionService: FunctionService,
    public vhImage: VhImage,
    public dialog: MatDialog,
    private translate: TranslateService,
    private nzMessageService: NzMessageService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.getCategory();
    this.initForm();
  }

  initForm(): void {
    this.addNewsForm = new FormGroup({
      title: new FormControl(
        '',
        Validators.compose([Validators.required, Validators.minLength(5)])
      ),
      description: new FormControl(''),
      content: new FormControl(''),
      date: new FormControl(new Date()),
      img: new FormControl(''),
      webapp_seo_title: new FormControl(''),
      webapp_seo_keyword: new FormControl(''),
      webapp_seo_description: new FormControl(''),
      hidden: new FormControl(true),
      view: new FormControl(1),
      id_newscategory: new FormControl('', Validators.required),
    });

  }

  getCategory(): void {
    this.vhQueryAutoWeb
      .getNewsCategorys_byFields({ type: { $eq: 2 } }, {}, {}, 0)
      .then((category: any) => {
        this.listNewsCategory = category.data;
      });
  }

  createMessage(type: string, key: string, duration: number = 2000) {
    this.translate.get(key).subscribe((translatedMessage: string) => {
      this.nzMessageService.create(type, translatedMessage, { nzDuration: duration });
    });
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
      console.log(btoa(loader.file));
    };
  }

  /** Thực hiện tạo bài viết mới
   *
   */
  onSubmitAddNews(value) {
    this.submitting = true;
    this.functionService.showLoading(this.languageService.translate('dang_them'));

    if (this.addNewsForm.valid) {
      let blog = { ...value, type: 2 };
      blog.link = this.vhAlgorithm.changeAlias(blog.title);
      this.vhQueryAutoWeb.getNewss_byFields({ link: { $eq: blog.link } }).then(
        (res: any) => {
          if (res.vcode === 0 && res.data.length != 0)
            blog.link = blog.link + '-1';
          this.vhQueryAutoWeb
            .addNews(blog)
            .then(
              (res: any) => {
                console.log('res', res);
                if (res.vcode === 0) {
                  this.createMessage(
                    'success',
                    'them_bai_viet_thanh_cong'
                  );
                  this.dialogRef.close(res.data);
                }
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
                  'da_xay_ra_loi'
                );
              }
            )
            .catch((error) => {
              this.createMessage(
                'error',
                'da_xay_ra_loi'
              );
            }).finally(() => {
              this.functionService.hideLoading();
              setTimeout(() => {
                this.submitting = false;
              }, 100);
            });
        },
        (err) => {
          this.createMessage(
            'error',
            'da_xay_ra_loi'
          );
          this.functionService.hideLoading();
          this.submitting = false;
        }
      );
    } 
    else {
      this.functionService.createMessage('error', this.languageService.translate('vui_long_dien_du_thong_tin'));
      this.functionService.hideLoading();
      this.submitting = false;
    }
  }

  close() {
    this.dialogRef.close(false);
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
        this.addNewsForm.value['img'] || '',
        2000000
      )
      .then(
        (rsp: any) => {

          if (rsp.vcode === 0) {
            this.addNewsForm.controls['img'].setValue(rsp.data);
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
        this.addNewsForm.controls['img'].setValue(result.href);
      }
      this.path = result.path;
    });
  }
}
