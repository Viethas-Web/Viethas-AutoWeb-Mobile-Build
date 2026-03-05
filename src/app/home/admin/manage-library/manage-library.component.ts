import { Component, HostListener, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { VhQueryAutoWeb, VhAlgorithm, VhImage } from 'vhautowebdb';
import { ManageLibraryAddFolderComponent } from './manage-library-add-folder/manage-library-add-folder.component';
import { ManageLibraryEditFolderComponent } from './manage-library-edit-folder/manage-library-edit-folder.component';
import { FunctionService } from 'vhobjects-service';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-manage-library',
  templateUrl: './manage-library.component.html',
  styleUrls: ['./manage-library.component.scss'],
})
export class ManageLibraryComponent implements OnInit {
  view: any = 'icon';
  path: any = '';
  /**
   * biến này lưu tất cả file trong thư mục để search, lúc search gán lại biến hiển 
   * thị là fileNames, xóa key thì gắn lại biến này để hiện tất cả file
   */
  allFiles: any = [];

  /**
   * biến này để lưu từ khóa search
   */
  keySearch:string = '';

  fileNames: any = [];
  showFileNames: any = [];

  activeRight: any = '';
  activeSelect: any = '';
  activeLeft: any = '';
  rows: any = 0;
  selectedImages = new Set<string>();
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ManageLibraryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public vhAlgorithm: VhAlgorithm,
    public vhImage: VhImage,
    private functionService: FunctionService,
    private languageService : LanguageService,
    
  ) {
    let view = JSON.parse(localStorage.getItem('viewFilenames'));
    if (view) this.view = view;
  }

  ngOnInit(): void {
    this.path = this.data.startPath;    
    this.getFilenames_onViethas(this.path);
  }

  ngAfterViewInit() {
    this.clickRightBackground();
  }



  //** hàm click chuột phải để tạo folder, tải file tại thư mục đó */
  clickRightBackground() {
    let ele = document.getElementById('element');
    let menu = document.getElementById('menu');
    ele.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    ele.addEventListener('contextmenu', (e) => {
      const rect = ele.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Set the position for menu
      menu.style.top = `${y}px`;
      menu.style.left = `${x}px`;

      // Show the menu
      menu.classList.remove('hidden');
      this.resetActive();
    });
    ele.addEventListener('contextmenu', (e) => {
      document.addEventListener('click', documentClickHandler);
    });

    // Hide the menu when clicking outside of it
    const documentClickHandler = (e) => {
      const isClickedOutside = !menu.contains(e.target);
      if (isClickedOutside) {
        // Hide the menu
        menu.classList.add('hidden');
        this.resetActive();
        // Remove the event handler
        document.removeEventListener('click', documentClickHandler);
      }
    };
  }

  fileTypeImgs = {
    pdf: '/assets/root/images/system/imgs/pdf.png',
    docx: '/assets/root/images/system/imgs/docx.png',
    doc: '/assets/root/images/system/imgs/docx.png',
    txt: '/assets/root/images/system/imgs/txt.png',
    zip: '/assets/root/images/system/imgs/zip.png',
    rar: '/assets/root/images/system/imgs/rar.png',
  };

  getFilenames_onViethas(path) {
    this.fileNames = []
    this.path = path
    this.vhImage.getImageFilenames(path)
      .then((data:any) => {
        console.log('data', data); 
        this.fileNames = data.data
        this.showFileNames = this.fileNames;
        this.allFiles = JSON.parse(JSON.stringify(this.fileNames));
        this.sortAndGroupResults(this.showFileNames);
      }, error => {
        console.log('error', error);
      })
  }

  sortAndGroupResults(result: any[]) {
    this.vhAlgorithm.sortVietnamesebyASC(result, 'name');
    const itemsPerRow = 6; // Số lượng ô trên mỗi hàng
    const rows = [];
    for (let i = 0; i < result.length; i += itemsPerRow) {
      let row = result.slice(i, i + itemsPerRow);
      row = row.filter(item => item !== undefined);
      if(row.length > 0) rows.push(row);
    }
    this.rows = rows;
    this.showFileNames = result;
  }

  openImage(href) {
    window.open(href, '_blank');
  }

  openAddFolder() {
    const dialogRef = this.dialog.open(ManageLibraryAddFolderComponent, {
      width: '35%',
      maxWidth: '100%',
      data: {
        path:this.path,
        showFileNames: this.showFileNames
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.allFiles = JSON.parse(JSON.stringify(result));
        this.sortAndGroupResults(result);
      }
    });
  }

  

  openEditFolder(item) {
    this.resetActive();
    let data = {
      path: this.path,
      name: item.name,
      showFileNames: this.showFileNames
    };
    const dialogRef = this.dialog.open(ManageLibraryEditFolderComponent, {
      width: '35%',
      maxWidth: '100%',
      data: data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.allFiles = JSON.parse(JSON.stringify(result));
        this.sortAndGroupResults(result);
      }
    });
  }

  @HostListener('window:keydown.delete', ['$event'])
  deleteSelectedImages(event: KeyboardEvent) {
    this.handleDelete(event);
  }

  handleDelete(e:any) {
    if (this.selectedImages.size > 0) {
      if (!confirm(`${this.languageService.translate('ban_co_chac_chan_muon_xoa')} ${this.selectedImages.size} ${this.languageService.translate('hinh_anh_da_chon')}?`)) return;

      this.selectedImages.forEach(item => {
        this.vhImage.deleteImage(item)
          .then(() => {
            this.getFilenames_onViethas(this.path)
          }, err => {
            alert(this.languageService.translate('co_loi_xay_ra_vui_long_thu_lai'))
            console.log(err)
          })
      });
      this.selectedImages.clear();
      e?.preventDefault();
    } else if(this.activeLeft) {
      const findItem = this.showFileNames.find(i => i.name === this.activeLeft);
      if(findItem) {
          if (findItem.type == 0) {
          this.vhImage.deleteImageFolder(this.path, findItem.name)
            .then(() => {
              this.getFilenames_onViethas(this.path)
            }, err => {
              this.functionService.createMessage('error', this.languageService.translate('khong_the_xoa_folder_co_du_lieu_ben_trong'))
              console.log(err)
            })
        } else {
          this.vhImage.deleteImage(findItem.href)
            .then(() => {
              this.getFilenames_onViethas(this.path)
            }, err => {
              alert(this.languageService.translate('co_loi_xay_ra_vui_long_thu_lai'))
              console.log(err)
            })
        }
        this.activeLeft = '';
        this.activeRight = '';
      }
    }
  }

  clickId(id:string) {
    document.getElementById(id).click();
  }

  uploadImg(event) {
    let files: any = event.target.files;
    let promise: any = [];
    for (let i = 0; i < files.length; i++) {
      promise.push(this.vhImage.getImageFromDesktop(files[i], this.path, null, 2000000));
    }
    Promise.all(promise).then(
      (rsp: any) => {
        if(rsp.length > 0) {
          rsp.forEach((element, index) => {
            if (element.vcode === 0) {
              this.showFileNames.push({ name: decodeURI(element.data).split('/').pop(), href: element.data, type: 1, type_file: 'img' });
              this.functionService.createMessage('success', this.languageService.translate('upload_thanh_cong'));
            } else if (element.vcode === 1) {
              this.functionService.createMessage('error', this.languageService.translate('loi_import_file_anh'));
            } else if (element.vcode === 2) {
              this.functionService.createMessage('error', this.languageService.translate('loi_upload_file_anh'));
            } else if (element.vcode === 3) {
              this.functionService.createMessage('error', this.languageService.translate('khong_the_upload_file_anh_lon_hon_maxsize'));
            }else if (element.vcode === 4) {
              this.functionService.createMessage('error', this.languageService.translate('import_file_anh_khong_dung_dinh_dang'));
            }
          }) 
          event.target.value = '';
          this.allFiles = JSON.parse(JSON.stringify(this.showFileNames));
          this.sortAndGroupResults(this.showFileNames);
        } else {
          this.functionService.createMessage('error', this.languageService.translate('upload_anh_khong_thanh_cong'));
        }
      },
      (err) => {
        console.error(err);
        this.functionService.createMessage('error', this.languageService.translate('upload_anh_khong_thanh_cong'));
      }
    );
  }

  uploadDoc(event: any) { 

    let files: any = event.target.files;
    let promise: any = [];
    for (let i = 0; i < files.length; i++) { 
      promise.push(this.vhImage.uploadFileFromDesktop(files[i], this.path, null, 2000000));
    }
    Promise.all(promise).then(
      (rsp: any) => {
        console.log('rsp', rsp);
        if(rsp.length > 0) {
          rsp.forEach((element, index) => {
            if (element.vcode === 0) { 
              this.showFileNames.push({ name: decodeURI(element.data).split('/').pop(), href: element.data, type: 1, type_file: 'doc' });
              this.functionService.createMessage('success', this.languageService.translate('upload_thanh_cong'));
            } else  {
              this.functionService.createMessage('error', element.message || this.languageService.translate('loi_import_file'));
            } 
          }) 
          event.target.value = '';
          this.allFiles = JSON.parse(JSON.stringify(this.showFileNames));
          this.sortAndGroupResults(this.showFileNames);
        } else {
          this.functionService.createMessage('error', this.languageService.translate('upload_anh_khong_thanh_cong'));
        }
      },
      (err) => {
        console.error(err);
        this.functionService.createMessage('error', this.languageService.translate('upload_anh_khong_thanh_cong'));
      }
    ); 
  }

  //** hàm click chuột phải vô folder để chỉnh sửa hoặc xóa */
  openRightFile(item, event) {
    event.stopPropagation();
    event.preventDefault();
    document.getElementById('element').click();
    this.activeLeft = item.name;
    this.activeRight = item.name;
  }

  //** truyền status true or false, để đóng chọn có dữ liệu hoặc kg có dữ liệu */
  selectFile(data) {
    if (this.activeSelect != '') {
      if (this.activeSelect.type == 1) {
        this.dialogRef.close({...data, path : this.path});
      } else alert(this.languageService.translate('vui_long_chon_file'));
    } else alert(this.languageService.translate('vui_long_chon_file'));
  }

  getEndFileName(href:string) {
    return href.split('.').pop();
  }

  close() {
    let data = {
      path: this.path,
      href: null
    };
    this.dialogRef.close(data);
  }

  /**
   * type: 0: folder
   * type: 1: file
   */
  activeFile(item, event) {
    // if(item.type === 0) this.path = item.path;
    if(item.type === 1) {
      // Ctrl/Cmd + Click: toggle selection
      if (event.ctrlKey || event.metaKey) {
        if (this.selectedImages.has(item.href)) {
          this.selectedImages.delete(item.href);
        } else {
          this.selectedImages.add(item.href);
        }
      } else {
        // Click thường: chọn duy nhất hình này
        this.selectedImages.clear();
        this.selectedImages.add(item.href);
        this.activeSelect = item;
      } 

      this.activeRight = '';
      this.activeLeft = item.name;
    } else {
      this.selectedImages.clear();
      this.activeSelect = '';
      this.activeRight = '';
      this.activeLeft = item.name;
    }
   
  }



  resetActive(event?) {
    if (event) event.preventDefault();
    this.activeLeft = '';
    this.activeRight = '';
  }

  backPath() {
    let list: any = [];
    let pathBack = '';
    if (this.path.length > 0) list = this.path.split('/');
    let arr = list.filter((item) => item != '');
    if(arr.length >1) arr.pop();
    for (let i in arr) pathBack += '/' + arr[i];
    this.getFilenames_onViethas(pathBack);
    this.path = pathBack;    
  }

  viewFilenames(value) {
    this.view = value;
    localStorage.setItem('viewFilenames', JSON.stringify(this.view));
  }

  statusName: boolean = true;
  statusType: boolean = true;
  statusSize: boolean = true;
  sort(status, value) {
    switch (value) {
      case 'name': {
        if (status) this.showFileNames = this.vhAlgorithm.sortVietnamesebyASC(this.fileNames, 'name')
        else this.showFileNames = this.vhAlgorithm.sortVietnamesebyDESC(this.fileNames, 'name')
        break;
      }
      case 'type': {
        if (status) this.showFileNames = this.vhAlgorithm.sortNumberbyASC(this.fileNames, 'type')
        else this.showFileNames = this.vhAlgorithm.sortNumberbyDESC(this.fileNames, 'type')
        break;
      }
      case 'size': {
        if (status) this.showFileNames = this.vhAlgorithm.sortNumberbyASC(this.fileNames, 'size')
        else this.showFileNames = this.vhAlgorithm.sortNumberbyDESC(this.fileNames, 'size')
      }
    }
  }

  onSearch() {

    if(this.keySearch.trim() === '') {
      this.fileNames = JSON.parse(JSON.stringify(this.allFiles));
      this.sortAndGroupResults(this.fileNames);
      return;
    }


    this.fileNames = this.vhAlgorithm.searchList(this.keySearch, JSON.parse(JSON.stringify(this.allFiles)), ['name'])
    this.sortAndGroupResults(this.fileNames);
  }
}
