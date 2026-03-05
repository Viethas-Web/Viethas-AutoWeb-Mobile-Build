import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { VhAuth, VhImage, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import { ManageLibraryComponent } from 'vhobjects-service';

@Component({
  selector: 'app-website-config',
  templateUrl: './website-config.component.html',
  styleUrls: ['./website-config.component.scss']
})
export class WebsiteConfigComponent implements OnInit {

  path = '';
  commonData: any = {}
  constructor(
    private http: HttpClient,
    private renderer: Renderer2, 
    private vhImage: VhImage,
    private functionService: FunctionService,
    private dialog: MatDialog,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private vhAuth: VhAuth
  ) { }

  ngOnInit(): void {
    this.vhQueryAutoWeb.getSetups_byFields({ type: { $eq: 'website-config' } })
      .then(
        (docs: any) => {
          if (docs.length) {
            this.commonData = docs[0];
          } else {
            this.vhQueryAutoWeb.addSetup({
              favicon: '',
              
              type: 'website-config'
            }).then((rsp: any) => {
              console.log('addCommonData');

              if (rsp.vcode === 0) {
                this.commonData = rsp.data;
              }
            }, error => {

            })

          }
        },
        (err) => {
          // chưa có dữu liệu
          console.log(err);
        });
  }

  getFile() {
    document.getElementById('file-upload').click();
  }

  /** Lấy hình ảnh từ Desktop */
  onUpload(e?) {
    const file = e.target.files[0];
    //console.log('onUpload file', file);
    this.vhImage.getImageFromDesktop(file, 'images/system/imgs', '', 2000000)
      .then(
        (rsp: any) => {
          if (rsp.vcode === 0) {

            this.commonData.favicon = rsp.data
            this.updateFavicon(this.commonData.favicon)
            this.functionService.createMessage(
              'success',
              'Hình ảnh đã được tải thành công !!!'
            );
          } else {
            this.functionService.createMessage(
              'error',
              `Tải ảnh thất bại! Lý do: ${rsp.message}`
            );
          }
        },
        () => {
          this.functionService.createMessage(
            'error',
            'Tải ảnh thất bại ! Vui lòng thử lại'
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
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(({ name, href, path }) => {
      if (name && href) {
        this.commonData.favicon = href;
        this.updateFavicon(this.commonData.favicon)
      }
      this.path = path;
    });
  }


  updateFavicon(url: string): void {
    const linkElement = document.querySelector("link[rel~='icon']");
    if (linkElement) {
      this.renderer.setAttribute(linkElement, 'href', url);
      this.updateSetup({ favicon: url })
    }
  } 
  updateSetup(value) {
    this.vhQueryAutoWeb.updateSetup(this.commonData._id, value).then((rsp: any) => {
      if (rsp.vcode === 0) {
        console.log('updateCommonData succeed');
      }
    }, error => {
      console.log('error', error);
    })
  }


}
