import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { VhImage, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import { ManageLibraryComponent } from 'vhobjects-service';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent implements OnInit {
  public EDITOR = DecoupledEditor;
  content: any = '';
  config: any = {
    ckfinder: {
      options: {
        language: 'en',
        resourceType: 'Images',
      },
    },
  };
  public configForm: FormGroup;
  public path: any = '';

  constructor(
    public vhImage: VhImage,
    public functionService: FunctionService,
    public dialog: MatDialog,
    public vhComponent: VhComponent,
    private vhQueryAutoWeb:VhQueryAutoWeb,
    public languageService: LanguageService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.configForm = new FormGroup({
      name: new FormControl('', Validators.compose([Validators.required])),
      logo_path: new FormControl(''),
      favicon_path: new FormControl(''),
      short_description: new FormControl(''),
      email: new FormControl(''),
      phone_number: new FormControl(''),
      address: new FormControl(''),
      youtube: new FormControl(''),
      facebook: new FormControl(''),
      instagram: new FormControl(''),
      twitter: new FormControl(''),
      tiktok: new FormControl(''),
    });
  }

  /** Lấy hình ảnh từ Desktop */
  onUpload(field, e) {
    const file = e.target.files[0];
    const image = new Image();
    image.src = window.URL.createObjectURL(file);
    image.onload = () => {
      const width = image.width;
      const height = image.height;

      if (width < 16 || height < 16) {
        this.vhComponent.alertMessage('', this.languageService.translate('kich_thuoc_anh_qua_nho'), '');
      } else {
        this.vhImage
          .getImageFromDesktop(
            file,
            
            'configuration',
            this.configForm.value[field] || ''
          )
          .then(
            (photoURL) => {
              this.configForm.controls[field].setValue(photoURL);
              this.functionService.createMessage(
                'success',
                'hinh_anh_da_duoc_tai_thanh_cong'
              );
            },
            () => {
              this.functionService.createMessage(
                'error',
                'tai_anh_that_bai_vui_long_thu_lai'
              );
            }
          );
      }
    };
  }

  saveOnConfig() {
    if (this.configForm.valid) {
      let data = { ...this.configForm.value };
      // this.vhQueryAutoWeb.getlocal
    }
  }

  getFile(id_tag: string) {
    document.getElementById(id_tag).click();
  }

  openLibrary(field: string) {
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
        this.configForm.controls[field].setValue(result.href);
      }
      this.path = result.path;
    });
  }
}
