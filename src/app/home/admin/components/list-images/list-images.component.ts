import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { CdkDragEnter, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MultipleUrlUploaderComponent } from '../multiple-url-uploader/multiple-url-uploader.component';
import { ManageLibraryComponent } from 'vhobjects-service';
import { VhImage, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import { LanguageService } from 'src/app/services/language.service';
import { ChooseImageComponent } from 'vhobjects-service';
import { TransferImageToServerComponent } from '../dialog/transfer-image-to-server/transfer-image-to-server.component';
@Component({
  selector: 'app-list-images',
  templateUrl: './list-images.component.html',
  styleUrls: ['./list-images.component.scss'],
})
export class ListImagesComponent implements OnInit {
  @ViewChild('dropListContainer') dropListContainer?: ElementRef;
  @Input() imgs: Array<any>;
  @Input() folderName: string;
  @Input() setupsImage: any;
  @Input() isMultiple: boolean = true;
  @Output() sendImgs = new EventEmitter();

  // Lấy tham chiếu đến element có tên #fileUpload
  @ViewChild('fileUpload') fileUpload!: ElementRef<HTMLInputElement>;
  @ViewChild('fileUploadSingle') fileUploadSingle!: ElementRef<HTMLInputElement>;

  dropListReceiverElement?: HTMLElement;
  dragDropInfo?: {
    dragIndex: number;
    dropIndex: number;
  };

  compressWidth: any = '100';
  compressHeight: any = '100';
  deviceWidthMax: number = 0
  path: any = '';

  resolution
  id_subproject
  devices = [
    {
      value: 'desktop', 
      label: 'may_tinh',
      width: 1920,
      height: 1080,
      display: false,
    }, 
    {
      value: 'tablet_landscape', 
      label: 'may_tinh_bang_ngang',
      width: 1920,
      height: 1080,
      display: false,
    }, 
    {
      value: 'tablet_portrait', 
      label: 'may_tinh_bang_doc',
      width: 1920,
      height: 1080,
      display: false,
    }, 
    {
      value: 'mobile_landscape', 
      label: 'dien_thoai_ngang',
      width: 1920,
      height: 1080,
      display: false,
    }, 
    {
      value: 'mobile_portrait', 
      label: 'dien_thoai_doc',
      width: 1920,
      height: 1080,
      display: false,
    }
  ]
  visible_config_tool:boolean = false;

  imageChoosed: any = null;
  newUrlImage: any = null;
  isShowConfirmPopup:boolean = false;
  indexImage: any = 0;

  constructor(
    public matdialog: MatDialog,
    public vhImage: VhImage,
    public functionService: FunctionService,
    public languageService: LanguageService,
    private vhQueryAutoWeb: VhQueryAutoWeb
  ) { }

  ngOnInit() {
    this.resolution = this.vhQueryAutoWeb.getlocalSubProject(this.vhQueryAutoWeb.getlocalSubProject_Working()._id).resolution
    this.id_subproject = this.vhQueryAutoWeb.getlocalSubProject_Working()._id;
    this.devices.forEach(device => {
      if(this.deviceWidthMax < this.resolution[device.value + '_width'] ) {
        this.deviceWidthMax = this.resolution[device.value + '_width']
      }
    })  
  }

  dragEntered(event: CdkDragEnter<number>) {
    const drag = event.item;
    const dropList = event.container;
    const dragIndex = drag.data;
    const dropIndex = dropList.data;

    this.dragDropInfo = { dragIndex, dropIndex };

    const phContainer = dropList.element.nativeElement;
    const phElement = phContainer.querySelector('.cdk-drag-placeholder');

    if (phElement) {
      phContainer.removeChild(phElement);
      phContainer.parentElement?.insertBefore(phElement, phContainer);
      moveItemInArray(this.imgs, dragIndex, dropIndex);
      this.sendImgs.emit({ imgs: this.imgs });
    }
  }

  dragMoved() {
    if (!this.dropListContainer || !this.dragDropInfo) return;

    const placeholderElement =
      this.dropListContainer.nativeElement.querySelector(
        '.cdk-drag-placeholder'
      );

    const receiverElement =
      this.dragDropInfo.dragIndex > this.dragDropInfo.dropIndex
        ? placeholderElement?.nextElementSibling
        : placeholderElement?.previousElementSibling;

    if (!receiverElement) {
      return;
    }

    receiverElement.style.display = 'none';
    this.dropListReceiverElement = receiverElement;
  }

  dragDropped() {
    if (!this.dropListReceiverElement) {
      return;
    }

    this.dropListReceiverElement.style.removeProperty('display');
    this.dropListReceiverElement = undefined;
    this.dragDropInfo = undefined;
  }

  /**
   *
   * @param index vị trí ảnh trong sản phẩm
   */
  getFile() {
    if (this.isMultiple) {
      this.fileUpload.nativeElement.click();
    } else {
      this.fileUploadSingle.nativeElement.click();
    }
  }


  /** 
   * Thực hiện click vị trí ảnh
   */
  getFileImageItem(inputEle: HTMLInputElement) {
    inputEle.click();
  }

  multipleUrlUploader() {
    this.matdialog
      .open(MultipleUrlUploaderComponent, {
        width: '30vw',
        height: '60vh',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resutl) => {
        if (resutl?.urls.length) {
          this.imgs = [
            ...this.imgs,
            ...resutl.urls.map((map) => {
              return { path: map, visible: false };
            }),
          ];
          this.sendImgs.emit({ imgs: this.imgs });
        }
      });
  }

  /** Hàm thực hiện mở thư viện của dự án để chọn ảnh
   *
   * @param indexImage vị trí ảnh trong danh sách ảnh sản phẩm
   */
  openLibrary(indexImage?) {
    const dialogRef = this.matdialog.open(ManageLibraryComponent, {
      width: '85%',
      maxWidth: '100%',
      data: {
        startPath: this.path ? this.path : "/images",
        scopeData: "/images"
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(({ name, href, path }) => {
      if (name && href) {
        if (indexImage !== undefined) {
          // Xử lý cập nhật ảnh
          const object = {
            ...this.imgs[indexImage],
            path: href,
          };
          this.imgs[indexImage] = object;
        } else {
          // nếu nhiều ảnh thì thêm vào mảng, không thì gán vào phần tử thứ 0

          // Xử lý thêm mặc định
          if(this.isMultiple) {
            const object = {
              path: href,
              visible: false,
            };
            this.imgs = [...this.imgs, object];
          } else {
           this.imgs = [
             {
               path: href,
               visible: false,
             }
           ]
          }
        }
        this.sendImgs.emit({ imgs: this.imgs });
      }

      this.path = path;
    });
  }

 

  /** Hàm thực hiện xóa file ảnh với vị trí chọn
   *
   * @param position vị trí trong mảng ảnh
   */
  deleteFileImageByIndex(position) {
    this.imgs = this.imgs.filter((_, index) => index != position);
    this.sendImgs.emit({ imgs: this.imgs });
  }

  accpectLinkIFrame(item, value) {
    item.path = value;
    item.visible = false;
    this.sendImgs.emit({ imgs: this.imgs });
  }

  /** Hàm thực hiện cập nhật ảnh tại vị trí đã chọn
   *
   * @param e
   * @param position
   */
  onUploadItemImage(e, position) {
    let file: any = Array.from(e.target.files)[0];

    let resolution = {} 

    let compress_type = this.setupsImage.upload_image.compress_type

    switch(this.setupsImage.upload_image.compress_type) {
      case 'compress-screen':
        resolution = {
          width: this.deviceWidthMax,
          height: 0
        }

        break;
      case 'custom':
        resolution = {
          width: +this.compressWidth,
          height: +this.compressHeight
        }
        compress_type = 'compress-frame'
        break;
    }



    this.vhImage
      .getImageFromDesktop_Autoweb(file, this.folderName, {
        compress_type: compress_type,
        resolution: resolution
      })
      .then(
        (rsp: any) => {

          if (rsp.vcode === 0) {
            const object = {
              path: rsp.data,
              visible: false,
            };

            this.imgs[position] = object;
            this.sendImgs.emit({ imgs: this.imgs });
            this.functionService.createMessage(
              'success',
              this.languageService.translate('hinh_anh_da_duoc_tai_thanh_cong')
            );
          } else {
            this.functionService.createMessage(
              'error',
              `${this.languageService.translate('tai_anh_that_bai_li_do')} ${rsp.message}`
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

   /** Hàm thực hiện lấy hình ảnh từ Desktop
   *
   * @param e sự kiện tải ảnh lên
   */
   onUpload(e) {
    let files: Array<any> = Array.from(e.target.files);

    
    let resolution = {} 

    let compress_type = this.setupsImage.upload_image.compress_type

    switch(this.setupsImage.upload_image.compress_type) {
      case 'compress-screen':
        resolution = {
          width: this.deviceWidthMax,
          height: 0
        }

        break;
      case 'custom':
        resolution = {
          width: +this.compressWidth,
          height: +this.compressHeight
        }
        compress_type = 'compress-frame'
        break;
    }



    let promise = [];
    if (files.length) {
      files.forEach((file: any) => {
        promise.push(
          this.vhImage.getImageFromDesktop_Autoweb(
            file,
            this.folderName,
            {
              compress_type: compress_type,
              resolution: resolution
            }
          )
        );
      });
    }
    Promise.all(promise).then(
      (response: Array<any>) => {
        response.forEach((item) => {
          if (item.vcode === 0) {
            if(this.isMultiple) {
              const object = {
                path: item.data,
                visible: false,
              };
              this.imgs = [...this.imgs, object];
            } else {
              this.imgs = [
                {
                  path: item.data,
                  visible: false,
                }
              ]
            }

            this.functionService.createMessage('success',this.languageService.translate('hinh_anh_da_duoc_tai_thanh_cong'));
          } else {
            this.functionService.createMessage('error',`${this.languageService.translate('tai_anh_that_bai_ly_do')} ${item.msg}`);
          }
        });
        this.sendImgs.emit({ imgs: this.imgs });
      },
      (error) => {
        console.log('error\n', error);
        this.functionService.createMessage(
          'error',
          this.languageService.translate('tai_anh_that_bai_vui_long_thu_lai')
        );
      }
    );
  }

    /**
 * hàm này để cập nhật resolution cho subproject
 */
    updateSetup() {
      this.vhQueryAutoWeb
        .updateSetup(this.setupsImage._id, {
          upload_image: {
            compress_type: this.setupsImage.upload_image.compress_type,
            source: this.setupsImage.upload_image.source,
          }
        })
        .then((bool: any) => {
          
        });
    }

    handleChangeImage() {
      switch(this.setupsImage.upload_image.source) {
        case 'device':
          this.getFile()
          break;
        case 'library':
          this.openLibrary()
          break
        case 'free_img':
          this.openFreeImage()
          break
        case 'url':
          this.imageChoosed = 'new'
          break
      }
    }

    /**
   * update trường mobile_portrait_hidden or desktop_hidden cho object
   * @param value
   */
  /**
   * Hàm mở ra hộp thoại chọn icon
   */
  openFreeImage(indexImage?) {
    this.visible_config_tool = false;
    const dialogRef = this.matdialog.open(ChooseImageComponent, {
      width: '80vw',
      height: '90vh',
      disableClose: false,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

        if (indexImage !== undefined) {
          // Xử lý cập nhật ảnh
          const object = {
            ...this.imgs[indexImage],
            path: result,
          };
          this.imgs[indexImage] = object;
        } else {
         if(this.isMultiple) {
           // Xử lý thêm mặc định
           const object = {
            path: result,
            visible: false,
          };
          this.imgs = [...this.imgs, object];
         } else {
          this.imgs = [
            {
              visible: false,
              path: result
            }
          ]
         }
        }
        this.sendImgs.emit({ imgs: this.imgs });
      }
      this.visible_config_tool = true;
    });
  }

  handleChangeUrlImage(e) {
    e?.stopPropagation();  
    if(!this.newUrlImage) {
      this.functionService.createMessage('error', 'vui_long_nhap_link_anh');
      return;
    }

    if(this.isMultiple) {
      // Xử lý thêm mặc định
      const object = {
        path: this.newUrlImage,
        visible: false,
      };
      this.imgs = [...this.imgs, object];
    } else {
      this.imgs = [
        {
          visible: false,
          path: this.newUrlImage
        }
      ]
    }
    this.sendImgs.emit({ imgs: this.imgs });
    this.newUrlImage = '';
    this.closePopover()
  }

  closePopover(e?) {
    e?.stopPropagation();  
    this.imageChoosed = null
  }

  /** 
   * Lấy hình ảnh từ url đẩy lên server với kích thước hình thay đổi
   * */
  handleOkConfirm(e?) {
    e?.stopPropagation();

    let resolution = {} 

    let compress_type = this.setupsImage.upload_image.compress_type

    // nén theo màn hình thì lấy kích thước màn hình lớn nhất
    switch(this.setupsImage.upload_image.compress_type) {
      case 'compress-screen':
        resolution = {
          width: this.deviceWidthMax,
          height: 0
        }

        break;
      case 'custom':
        resolution = {
          width: +this.compressWidth,
          height: +this.compressHeight
        }
        compress_type = 'compress-frame'
        break;
    }

    const url = (this.indexImage != null && this.indexImage != undefined) ? this.imgs[this.indexImage].path : this.newUrlImage

    this.vhImage.getImageFromURL_Autoweb(url, "images/design/objects", {
      compress_type: compress_type, 
      resolution: resolution
    })
    .then((rsp: any) => {  
      if(rsp.vcode != 0) {
        this.functionService.createMessage('error', 'tai_anh_that_bai_ly_do' + rsp.msg);
        return;
      }

      if (this.indexImage !== undefined) {
        // Xử lý cập nhật ảnh
        const object = {
          ...this.imgs[this.indexImage],
          path: rsp.data,
        };
        this.imgs[this.indexImage] = object;
      } else {
        // Xử lý thêm mặc định
        const object = {
          path: rsp.data,
          visible: false,
        };
        this.imgs = [...this.imgs, object];
      }
      this.sendImgs.emit({ imgs: this.imgs });
      
      this.functionService.createMessage('success','hinh_anh_da_duoc_tai_thanh_cong');
      this.indexImage = null;
     
    })
    .catch((error: any) => {
      console.error('Error:', error);
      this.functionService.createMessage('error', 'tai_anh_that_bai_ly_do' + error.message);
    });

    this.isShowConfirmPopup = false;
   
  }

  handleCancelConfirm() {
    this.isShowConfirmPopup = false;
  }

  handleShowTransferImageToServer() {
    const dialogRef = this.matdialog.open(TransferImageToServerComponent, {
      width: '40vw',
      height: '40vh',
      disableClose: true,
      data: {
        setupsImage: this.setupsImage,
        compressWidth: this.compressWidth,
        compressHeight: this.compressHeight, 
      },
    });

    dialogRef.afterClosed().subscribe((result:boolean) => {
      if (result) {
        this.handleOkConfirm();
      }
    });
  }


}
