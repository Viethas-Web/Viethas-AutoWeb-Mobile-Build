import { ChangeDetectorRef, Component, Inject, OnInit,ViewChild } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { VhQueryAutoWeb, VhAlgorithm, VhImage } from 'vhautowebdb';
import { ManageLibraryAddFolderComponent } from './manage-library-add-folder/manage-library-add-folder.component';
import { ManageLibraryEditFolderComponent } from './manage-library-edit-folder/manage-library-edit-folder.component';
import { debounceTime } from 'rxjs/operators';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FunctionService } from 'vhobjects-service';
@Component({
  selector: 'app-manage-library',
  templateUrl: './manage-library.component.html',
  styleUrls: ['./manage-library.component.scss'],
})


export class ManageLibraryComponent  implements OnInit{
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;
  view: any = 'icon';
  path: any = '';
  fileNames: any = [];
  showFileNames: any = [];
  activeRight: any = '';
  activeSelect: any = '';
  activeLeft: any = '';
  counter: number = 0;
  imgsordinal: any = Array.from({ length: 36 }, (_, i) => i)
  totalimgs: number = 0;
  rows: any = 0;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ManageLibraryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public vhAlgorithm: VhAlgorithm,
    public vhImage: VhImage,
    private functionService: FunctionService,
    private cdr: ChangeDetectorRef
    
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

    this.viewport.scrolledIndexChange.pipe(
      debounceTime(500) // Chờ 1 giây sau khi kết thúc cuộn trước khi thực hiện thao tác
    ).subscribe((data) => {
      this.imgsordinal = Array.from({ length: 36 }, (_, i) => i)
      let numItems = data * 6;
      this.imgsordinal = this.imgsordinal.map((item) => item + numItems);
      this.loadImg();
    });

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

  getFilenames_onViethas(path) {
    this.fileNames = []
    this.path = path

    if (this.imgsordinal[0] == 0) {
      for (let i = 0; i < 6; i++) {
        this.imgsordinal.push(this.imgsordinal[this.imgsordinal.length - 1] + 1)
      }
    }

    this.vhImage.getImageFilenames_byImgsOrdinal(path, this.imgsordinal)
      .then((data: any) => {
        this.vhAlgorithm.sortVietnamesebyASC(data.data, 'name')
        this.totalimgs = data.totalimgs;
        this.fileNames = data.data
        this.showFileNames = this.fileNames;
        let temp = data.totalimgs - data.data.length;
        for (let i = 0; i < temp; i++) {
          this.showFileNames.push({ name: i.toString(), href: '', type: 1, isLoading: true });
        }

        const itemsPerRow = 6; // Số lượng ô trên mỗi hàng
        const rows = [];

        for (let i = 0; i < this.showFileNames.length; i += itemsPerRow) {
          rows.push(this.showFileNames.slice(i, i + itemsPerRow));
        }
        this.rows = rows;
      }, error => {
        console.log('error', error);
      })


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
        rows: this.rows
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.sortAndGroupResults(result);
      }
    });
  }

  openEditFolder(item) {
    this.resetActive();
    let data = {
      path: this.path,
      name: item.name,
      rows: this.rows
    };
    const dialogRef = this.dialog.open(ManageLibraryEditFolderComponent, {
      width: '35%',
      maxWidth: '100%',
      data: data,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.sortAndGroupResults(result);
      }
    });
  }

  deleteFolder(item) {
    if (item.type == 0) {
      this.vhImage.deleteImageFolder(this.path, item.name)
        .then((res:any) => {
          this.sortAndGroupResults(res);
        }, err => {
         
          this.functionService.createMessage('error', 'không thể xóa folder có dữ liệu bên trong!!')
          console.log(err)
        })
    } else {
      this.vhImage.deleteImage(item.href)
        .then((res) => {
          this.showFileNames = this.showFileNames.filter((ele) => ele.href != item.href)
          this.rows = this.rows.map((ele) => {
            return ele.filter((e) => e.href != item.href)
          })
          
        }, err => {
          alert("Có lỗi xảy ra")
          console.log(err)
        })
    }
  }

  clickId() {
    document.getElementById('idUpload').click();
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
              this.showFileNames.push({ name: 'temp ', href: element.data, type: 1,  });
              this.functionService.createMessage('success', 'Upload thành công');
              console.log('check showfileNames', this.showFileNames);
            } else if (element.vcode === 1) {
              this.functionService.createMessage('error', 'lỗi import file ảnh');
            } else if (element.vcode === 2) {
              this.functionService.createMessage('error', 'lỗi upload file ảnh');
            } else if (element.vcode === 3) {
              this.functionService.createMessage('error', 'không thể upload file ảnh lớn hơn maxSize (byte)');
            }else if (element.vcode === 4) {
              this.functionService.createMessage('error', 'import file ảnh không đúng định dạng');
            }
          }) 
          event.target.value = '';
          this.sortAndGroupResults(this.showFileNames);
          
        } else {
          this.functionService.createMessage('error', 'upload ảnh không thành công!');
        }
      },
      (err) => {
        console.error(err);
        this.functionService.createMessage('error', 'upload ảnh không thành công!');
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
        this.dialogRef.close({ ...data, path: this.path });
      } else alert('Vui lòng chọn file');
    } else alert('Vui lòng chọn file');
  }

  close() {
    let data = {
      path: this.path,
      href: null
    };
    this.dialogRef.close(data);
  }

  activeFile(item) {
    // if (item.type === 0) this.path = item.path;
    if (item.type === 1) this.activeSelect = item;
    this.activeRight = '';
    this.activeLeft = item.name;
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
    if (arr.length > 1) arr.pop();
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


  loadImg() {
    // th1: đang ở đầu scroll xuống thì sẽ lấy thêm 6 ảnh và 6 ảnh dưới
    // ví dụ mảng imgsordinal = [0,1,2,3,4,5,] -> [0,1,2,3,4,5,6,7,8,9,10,11]
    // th2: đang ở cuối thì sẽ lấy thêm 6 ảnh trên
    // ví dụ mảng imgsordinal = [30,31,32,33,34,35] -> [24,25,26,27,28,29,30,31,32,33,34,35]
    // th3: đang ở giữa scroll lấy thêm 6 ảnh trên và 6 ảnh dưới
    // ví dụ mảng imgsordinal = [30,31,32,33,34,35] -> [24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41]

    // th1
    if (this.imgsordinal[0] == 0) {
      for (let i = 0; i < 6; i++) {
        this.imgsordinal.push(this.imgsordinal[this.imgsordinal.length - 1] + 1)
      }
    }
    // th2
    else if (this.imgsordinal[this.imgsordinal.length - 1] == this.totalimgs || this.imgsordinal[this.imgsordinal.length - 1] > this.totalimgs) {
      let start = this.imgsordinal[0] - 1;
      let end = this.imgsordinal[0] - 6;
      for (let i = start; i >= end; i--) {
        this.imgsordinal.unshift(i);
      }
    }
    // th3
    else {
      for (let i = 0; i < 6; i++) {
        this.imgsordinal.unshift(this.imgsordinal[0] - 1);
        this.imgsordinal.push(this.imgsordinal[this.imgsordinal.length - 1] + 1);
      }
    }

    /**
     * Lấy về danh sách thư mục, file trong thư mục định vị bởi đường dẫn path theo mảng số thứ ảnh imgsordinal trong đường dẫn thư mục
     */
    this.vhImage.getImageFilenames_byImgsOrdinal(this.path, this.imgsordinal)
      .then((data: any) => {
        this.vhAlgorithm.sortVietnamesebyASC(data.data, 'name')
        this.fileNames = data.data
        this.showFileNames = this.showFileNames.map((item, i) => {
          return { name: i.toString(), href: '', type: 1, isLoading: true }
        })

        this.imgsordinal.forEach((element, index) => {
          if(data.data[index]) {
            this.showFileNames[element] = data.data[index];
          }
        });

        const itemsPerRow = 6; // Số lượng ô trên mỗi hàng
        const rows = [];

        for (let i = 0; i < this.showFileNames.length; i += itemsPerRow) {
          let row = this.showFileNames.slice(i, i + itemsPerRow);
          row = row.filter(item => item !== undefined);
          if(row.length > 0) rows.push(row);
       
        }

        this.rows = rows;

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
  }


}
