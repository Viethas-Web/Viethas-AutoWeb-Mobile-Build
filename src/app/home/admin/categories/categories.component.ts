import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { FunctionService } from 'vhobjects-service';
import { AddCategoryComponent } from './add-category/add-category.component';
import { EditCategoryComponent } from './edit-category/edit-category.component';
import { LanguageService } from 'src/app/services/language.service';
import { JsonDataService } from 'src/app/services/json-data.service';
@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  /** danh sách danh mục để hiển thị */
  categories: any[] = [];
  /** mảng main sector để lọc */
  mainSectors = []
  /** lọc theo main sector */
  idMainSector = 'all'
  /** setup category */
  setupCategoryImg = null
  /** mảng chưa danh sách sp search */  
  dataSearched: any  = [] 
  /** biến ẩn hiện loading ở table của sp khi get dữ liệu */
  loading = false;  
  /* Biến này truyền vào hàm để sort */
  sort: any = { [this.nameField]: 1 };

  /**Dùng tìm kiếm sản phẩm */
  keySearch: string = ''; 
  /* Biến này hiển thị ở html xem sort theo trường nào */
  sortby: any = { 
    [this.nameField]: true,
  };

  /** ------------------------Pagination------------------------ */
  /** Trang hiện tại */
  pageCurrent: number = 1;
  /** Tổng số trang */
  totalPages: number = 1;
  /** Số lượng bản ghi trên 1 trang */
  limit: number = 20;
  /** Số trang hiển thị = */
  pageShowChoose: any = [0, 1, 2]; 
  /** Trang đi đến  */
  pageGoto: number = 1;
  get nameField() {
    return 'name_' + this.functionService.selectedLanguageCode;
  }

  constructor(
    private vhComponent: VhComponent,
    public vhAlgorithm: VhAlgorithm,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private jsonDataService: JsonDataService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.getMainSectors()
    this.vhQueryAutoWeb.getSetups_byFields({type: {$eq: 'category_image'}})
    .then((res:any) => {
      if(res.length) {
        this.setupCategoryImg = res[0]
      }
    })
  }
  getMainSectors() {
    this.jsonDataService.getMainSectors().subscribe((data) => {
      let subproject = this.vhQueryAutoWeb.getlocalSubProject(this.vhQueryAutoWeb.getlocalSubProject_Working()._id);
      data.forEach((element) => {
        if (subproject.main_sectors?.includes(element.value) && element.type)
          this.mainSectors.push(element)
      });
    })
  }

  trackByFn(index: number, item: any) {
    return item._id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }


  tableHeight: string;
  ngAfterViewInit(): void {
    // ko được để đoạn logic này trong ngAfterViewChecked vì sẽ gây lag
    setTimeout(() => {
      if (
        document.querySelector('#purchase-invoice-today') &&
        document.querySelector('.ant-table-thead') &&
        document.querySelector('.purchase-invoice-today-header')
      ) {
        this.tableHeight =
          document.querySelector('#purchase-invoice-today').clientHeight -
          document.querySelector('.ant-table-thead').clientHeight -
          document.querySelector('.purchase-invoice-today-header').clientHeight -
          105 +
          'px';
      }
      this.changeDetectorRef.detectChanges();
    }, 0);
  }



  /** Hàm thực hiện lấy danh sách danh mục
   *
   */
  getCategorys() {
    this.loading = true
    this.keySearch = ''
    let query = {}
    if(this.idMainSector != 'all') {
      query['id_main_sectors'] = {$all: [this.idMainSector]}
    }
    this.vhQueryAutoWeb
      .getCategorySteps_byIdFatherCategory(
        '',
        query,
        {},
        this.sort,
        this.limit,
        this.pageCurrent
      )
      .then(
        (rsp: any) => {
          console.log(rsp);
          if (rsp.vcode === 0) {
            this.totalPages = rsp.totalpages;
            this.categories = rsp.data.map((e) => {
              // this.vhQueryAutoWeb.deleteCategory(e._id)
              return {
                ...e,
                array_step: Array(e.step)
                  .fill(0)
                  .map((x, i) => i),
              };
            });

            // new Event('resize') tạo ra một event có type = "resize".
            // Khi phát đi, tất cả các listener đang lắng nghe sự kiện resize của window sẽ được gọi.
            // height lúc chưa load sản phẩm sẽ khác height sau khi load sản phẩm xong nên cần trigger lại sự kiện resize để virtual scroll hoạt động chính xác
            window.dispatchEvent(new Event('resize'));
          }
        },
        (error) => {
          console.error(error)
          this.functionService.createMessage('error','da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu_vui_long_thu_lai');
        }
      ).finally(() => this.loading = false)
  }


  renderBussiness(id_main_sectors: string[]): string {
    const itemMappings = {
      'basic': 'Cơ bản, ',
      'member': 'Thành viên mua sắm, ',
      'category': 'Phân cấp theo danh mục, ',
      'ecommerce': 'Sản phẩm mua bán, ',
      'food_drink': 'Món ăn nước uống, ',
      'combo': 'Nhóm sản phẩm (combo), ',
      'news': 'Tin tức - sự kiện, ',
      'webapp': 'Thiết kế webapp, ',
      'service': 'Dịch vụ theo công, ',
      'recruitment': 'Tuyển dụng, ',
      'branchs': 'Chuỗi cửa hàng, ',
      'snimei': 'Tra cứu SN/IMEI, ', 
      'hotel': 'Dịch vụ lưu trú, ', 
    };
  
    let value = '';
  
    if (!Array.isArray(id_main_sectors)) {
      id_main_sectors = id_main_sectors ? [id_main_sectors] : [];
    }

    for (const item of id_main_sectors) {
      if (item in itemMappings) {
        value += itemMappings[item];
      }
    }

    value = value.slice(0, -2);
  
    return value || '';
  }

  
  /** 
   *  a Huy đang làm thêm xóa sửa sẽ tác động đến nguyên một nhánh nền CRUD xong phải get lại để danh sách mới nhất
   */
  addCategory(): void {
    if(!this.setupCategoryImg) return;
    const dialogRef = this.dialog.open(AddCategoryComponent, {
      width: '60vw',
      height: '80vh',
      disableClose: true,
      data: {
        categories: this.categories,
        setupCategoryImg: this.setupCategoryImg
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.functionService.languageTempCode = this.functionService.selectedLanguageCode;
      if (result) {
        if (typeof result === 'object') {
          this.getCategorys();
        }
      }
    });
  }

  /** 
   * a Huy đang làm thêm xóa sửa sẽ tác động đến nguyên một nhánh nền CRUD xong phải get lại để danh sách mới nhất
   * @param category: dữ liệu danh mục được truyền cho popup
   */
  editCategory(category): void {
    if(!this.setupCategoryImg) return;
    const dialogRef = this.dialog.open(EditCategoryComponent, {
      width: '60vw',
      height: '80vh',
      data: { 
        category: category,
        setupCategoryImg: this.setupCategoryImg,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.functionService.languageTempCode = this.functionService.selectedLanguageCode;
      if (result) {
        if (typeof result === 'object') {
          this.getCategorys();
        }
      }
    });
  }

  /**
   * a Huy đang làm thêm xóa sửa sẽ tác động đến nguyên một nhánh nền CRUD xong phải get lại để danh sách mới nhất
   * @param category 
   */
  deleteCategory(category) {
    this.vhComponent
      .alertConfirm('', this.languageService.translate('xoa_danh_muc'), category[this.nameField], this.languageService.translate('dong_y'), this.languageService.translate('thoat'))
      .then(
        (ok) => {
          if (ok == 'OK') {
            this.vhQueryAutoWeb.deleteCategory(category._id).then(
              (res: any) => {
                if (res.vcode === 0) {
                  this.functionService.createMessage(
                    'success',
                    'xoa_danh_muc_thanh_cong'
                  );
                  this.getCategorys();
                }
                if (res.vcode === 11) {
                  this.functionService.createMessage('error','phien_dang_nhap_da_het_han_vui_long_dang_nhap_lai');
                }
              },
              (error) => {
                console.error(error)
                this.functionService.createMessage('error','da_xay_ra_loi_trong_qua_trinh_xoa_du_lieu');
              }
            );
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  onSearchCategory(): void {
    this.idMainSector = 'all'
    this.resetPagination();
    this.vhQueryAutoWeb.searchList_likeSearch('categorys', this.nameField, this.keySearch, {}, {})
      .then((res: any) => {
        console.log('res', res);
        if (res.vcode === 0) {
          this.dataSearched = res.data;
          this.categories = this.dataSearched.map((e) => {
            return {
              ...e,
              array_step: Array(e.step)
                .fill(0)
                .map((x, i) => i),
            };
          });

           this.handlePaginateLocal();
        }
      }, (error: any) => {
        console.log('error', error)
      })
  }

  updateHiddenCategory(category, objectUpdate) {
    this.vhQueryAutoWeb.updateCategory(category._id, objectUpdate).then(
      (bool: any) => {
        if (!bool)
          return this.functionService.createMessage(
            'error',
            'cap_nhat_that_bai'
          );
      },
      (err) => {
        this.functionService.createMessage(
          'error',
          'da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu_vui_long_thu_lai'
        );
      }
    );
  }

  /**
   * hàm này reset pagination về 1
   */
  resetPagination() {
    this.pageCurrent = 1;
    this.pageGoto = 1;
    this.pageShowChoose = [0, 1, 2];
  }

  handlePaginateLocal() {
    let data_filter = this.dataSearched 
    switch (true) {
      case this.sort.hasOwnProperty(this.nameField): {
        data_filter = this.sort[this.nameField] == 1 ?  this.vhAlgorithm.sortStringbyASC(data_filter, this.nameField)  : this.vhAlgorithm.sortStringbyDESC(data_filter, this.nameField)
        break;
      }
    }
    let data_page = new Array(); //mảng dữ liệu phân theo page
    for (let i = 0; i < data_filter.length; i++) {
      if ((i >= this.limit * (this.pageCurrent - 1)) && (i < this.limit * this.pageCurrent)) data_page.push(data_filter[i]);
    }
    this.totalPages = Math.ceil(data_filter.length / this.limit); // tổng số page
    this.categories = data_page
  }

  handleSort(field) {
    this.sortby[field] = !this.sortby[field];
    this.sort = { [field]: this.sortby[field] ? 1 : -1 }

    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }else {
      this.getCategorys();
    }
  }
  /** pageCurrent thay đổi */
  pageIndexChange(event) {
    this.pageCurrent = event;
    if (this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }
    else 
      this.getCategorys();
  }

  /** limit thay đổi */
  limitChange(event) {
    this.resetPagination();
    this.limit = event;
    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    } else {
      this.getCategorys()
    }
  }
}
