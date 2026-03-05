import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { FunctionService } from 'vhobjects-service';
import { LanguageService } from 'src/app/services/language.service';
import { AddComboComponent } from './add-combo/add-combo.component';
import { MatDialog } from '@angular/material/dialog';
import { EditComboComponent } from './edit-combo/edit-combo.component';
@Component({
  selector: 'app-combos',
  templateUrl: './combos.component.html',
  styleUrls: ['./combos.component.scss']
})
export class CombosComponent implements OnInit {
  /** biến dùng để chứa chiều cao của bảng dữ liệu */
  tableHeight: string; 
  /** setup Combo */
  setupComboImg
  /** setup category */
  setupCategoryImg
  /** danh sách danh mục để lọc */
  categories: Array<any> = [];
  /* Biến này hiển thị ở html xem sort theo trường nào */
  sortby: any = { 
    [this.nameField]: true,
  };
  /** get những sp theo danh mục */
  idCategory = 'all';
  /* Biến này truyền vào hàm để sort */
  sort: any = { [this.nameField]: 1 };
  /**Dùng tìm kiếm sản phẩm */
  keySearch: string = ''; 
  /** mảng chưa danh sách sp search */  
  dataSearched: any  = [] 
   /** Danh sách combos hiển thị */
   combos: any[] = []; // 
   /** biến ẩn hiện loading ở table khi get dữ liệu */
  loading = false;  
  loadingCategory = false;

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

  /** Lấy trường name theo ngôn ngữ đang được chọn */
  get nameField() {
    return 'name_' + this.functionService.selectedLanguageCode;
  }

  constructor(
    private vhComponent: VhComponent,
    public vhAlgorithm: VhAlgorithm,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    private changeDetectorRef: ChangeDetectorRef, 
    private languageService : LanguageService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.getCategory();

    
    this.vhQueryAutoWeb.getSetups_byFields({ type: { $in: ['combo_image', 'category_image'] } })
    .then((res: any) => {
      if (res.length) {
        this.setupComboImg = res.find(e => e.type == 'combo_image')
        this.setupCategoryImg = res.find(e => e.type == 'category_image')
      }
    })
  }

  ngOnDestroy(): void { }

  trackByFn(index: number, item: any) {
    return item._id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    if (
      document.querySelector('#purchase-invoice-today') &&
      document.querySelector('.ant-table-thead') &&
      document.querySelector('.purchase-invoice-today-header')
    ) {
      this.tableHeight =
        document.querySelector('#purchase-invoice-today').clientHeight -
        document.querySelector('.ant-table-thead').clientHeight -
        document.querySelector('.purchase-invoice-today-header').clientHeight -
        100 +
        'px';
    }
    this.changeDetectorRef.detectChanges();
  }

  /**
   * hàm này get danh sách category để chọn xem sp theo danh mục
   * @example this.getCategory()
   */
  getCategory() {
     this.loadingCategory = true;
    this.vhQueryAutoWeb.getCategorys_byFields({id_main_sectors: { $all: ['combo'] }  }, {}, {}, 0).then((res: any) => {
      if (res.vcode === 0) {
        this.vhQueryAutoWeb.getCategorySteps_byIdCategoryArray(res.data.map(e => { return e._id }))
          .then((response: any) => {
            if (response.vcode === 0) {
              response.data.forEach((e) => {
                this.categories = [
                  ...this.categories,
                  e
                ]
              });
            }
          }, (error: any) => {
            console.log('error', error)
          }).finally(() => this.loadingCategory = false);
      }
    });
  }

  /**
   * hàm này render option danh mục có dấu - thể hiện cấp độ
   * @param category danh mục cần render
   * @returns 
   */
  renderOptionCategory(category) {
    if(category.step) {
      return Array(category.step).fill(0).map((_, i) => i).map(() => '- ').join('') + category['name_' + this.functionService.languageTempCode]
    }
    return category['name_' + this.functionService.languageTempCode]
  }

  /** 
   * Hàm thực hiện lấy danh sách combo
   */
  getCombos() {
    this.loading = true;
    this.keySearch = '';
    let query:any = { type: { $eq: 5 } } 
    if(this.idCategory != 'all') {
      query = {
        ...query,
        id_categorys: { $all: [this.idCategory] }
      }
    } 
    this.vhQueryAutoWeb.getCombos_byFields(
      query,
      {},
      this.sort,
      this.limit,
      this.pageCurrent
    ).then((res: any) => {
      this.combos = this.proccessData(res.data);
      this.totalPages = res.totalpages;

      // new Event('resize') tạo ra một event có type = "resize".
      // Khi phát đi, tất cả các listener đang lắng nghe sự kiện resize của window sẽ được gọi.
      // height lúc chưa load sản phẩm sẽ khác height sau khi load sản phẩm xong nên cần trigger lại sự kiện resize để virtual scroll hoạt động chính xác
       window.dispatchEvent(new Event('resize'));
    })
    .finally(() => {
      this.loading = false;
    });
  }

  // biến đổi dữ liệu get về để hiển thị
  proccessData(data) {
    // const validCategoryIds = this.categories.map(c => c._id);
    const dataClone = JSON.parse(JSON.stringify(data));
    const dataReturn = dataClone.map((product) => {
      product.show_expand = false;

      if (product.units) {
        product.unitDefault = product.units.find(
          (item) => item.default == true
        );
      }

      if (product.subs?.length) {
        product.subs.forEach((sub) => {
          sub.unitDefault = sub?.units?.find((e) => e.default);
        });
      }
      // Cập nhật chuỗi tên danh mục
      const name = Array.isArray(product.id_categorys)
        ? product.id_categorys
          .map((idCate) => {
            if (idCate === '') {
              return 'Trống';
            } else {
              return this.categories.find((find) => find._id === idCate)?.['name_' + this.functionService.selectedLanguageCode];
            }
          })
          .join(', ')
        : this.categories.find((find) => find._id === product.id_categorys)?.['name_' + this.functionService.selectedLanguageCode];

      product.category_name = name;

      // xử lý id_category đã bị xóa 
      // let id_categorys = product.id_categorys.filter(id => validCategoryIds.includes(id));
      // if (id_categorys.length !== product.id_categorys.length) {
      //   this.vhQueryAutoWeb.updateCombo(product._id, { id_categorys: id_categorys })
      //     .then((res) => {
      //       console.log('Cập nhật id_categorys thành công', res);
      //       product.id_categorys = id_categorys;
      //     })
      //     .catch((err) => {
      //       console.error('Lỗi cập nhật id_categorys', err);
      //     });
      // }

      return product;
    });
    // console.log(dataReturn)
    return dataReturn;
  }

  /**
 * hàm này reset pagination về 1
 */
  resetPagination() {
    this.pageCurrent = 1;
    this.pageGoto = 1;
    this.pageShowChoose = [0, 1, 2];
  }
  

  /** Hàm thực hiển chọn đơn vị
   *
   * @param item combo
   * @param event đơn vị chọn
   * @returns đơn vị chọn và gán vào unitDefault
   */
  selecUnit(item, event) {
    return (item.unitDefault = item.units.find((item) => item == event));
  }

  /** Hàm thực hiện mở popup thêm combo
   *
   */
  addComboFn(): void {
    if (!this.setupComboImg) return;
    const dialogRef = this.dialog.open(AddComboComponent, {
      width: '70vw',
      height: '80vh',
      data: {
        categories: this.categories,
        setupComboImg: this.setupComboImg,
        setupCategoryImg: this.setupCategoryImg
      }

    });

    dialogRef.afterClosed().subscribe((result) => {
      this.functionService.languageTempCode = this.functionService.selectedLanguageCode;
      if (result) {
        if (this.idCategory == 'all' || result.id_categorys.includes(this.idCategory)) {
          this.combos = [...this.combos, this.proccessData([result])[0]];
        }
      }
    });
  }



  /** Hàm thực hiện mở popup edit với id
   *
   * @param product: dữ liệu combo được truyền cho popup
   */
  editCombo(product): void {
    const dialogRef = this.dialog.open(EditComboComponent, {
      width: '70vw',
      height: '80vh',
      data: {
        categories: this.categories,
        setupComboImg: this.setupComboImg,
        dataEditCombo: product,
        setupCategoryImg: this.setupCategoryImg
      }

    });

    dialogRef.afterClosed().subscribe((result) => {
      this.functionService.languageTempCode = this.functionService.selectedLanguageCode;
      if(result) {
        this.combos = this.combos.map(p => p._id === result._id ? this.proccessData([result])[0] : p)
      }
    });

  }

  /** Hàm thực hiện xác nhận xóa combo và thực hiện xóa combo
   *
   * @param product
   */
  deleteCombo(product) {
    this.vhComponent
      .alertConfirm('', this.languageService.translate('xoa_combo'), product[this.nameField], this.languageService.translate('dong_y'), this.languageService.translate('thoat'))
      .then(
        (ok) => {
          if (ok == 'OK') {
            this.vhQueryAutoWeb.deleteCombo(product._id).then(
              (res: any) => {
                if (res.vcode === 0) {
                  this.combos = this.combos.filter(
                    (item) => item._id != product._id
                  );
                  this.functionService.createMessage(
                    'success',
                    this.languageService.translate('xoa_combo_thanh_cong')
                  );
                }
                if (res.vcode === 11) {
                  this.functionService.createMessage(
                    'error',
                    this.languageService.translate('phien_dang_nhap_da_het_han')
                  );
                }
              },
              (error) => {
                this.functionService.createMessage(
                  'error',
                  this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_xoa_du_lieu_vui_long_thu_lai')
                );
              }
            );
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  /** Hàm thực hiện cập nhật trạng thái combo
   *
   * @param item
   * @param objectUpdate
   */
  updateHiddenCombo(item, objectUpdate) {
    this.vhQueryAutoWeb
      .updateCombo(item._id, objectUpdate)
      .then((res: any) => {
        if (res.vcode === 0) {
          this.functionService.createMessage(
            'success',
            this.languageService.translate('cap_nhat_combo_thanh_cong')
          );
        }
        if (res.vcode === 11) {
          this.functionService.createMessage(
            'error',
            this.languageService.translate('phien_dang_nhap_da_het_han')
          );
        }
      })
      .catch((err) => {
        this.functionService.createMessage(
          'error',
          this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_cap_nhat_du_lieu')
        );
      });
  }
 
  onSearch(): void {
    this.loading = true;
    this.idCategory = 'all';
    this.resetPagination();
    this.vhQueryAutoWeb.searchList_likeSearch('combos', this.nameField, this.keySearch, {}, {})
      .then((res: any) => {
        if (res.vcode === 0) {
          this.dataSearched = this.proccessData(res.data);
          this.handlePaginateLocal();
        }
      }, (error: any) => {
        console.error('error', error)
      })
      .finally(() => {
        this.loading = false;
      });
  }



  handlePaginateLocal() {
    let data_filter =  this.dataSearched 
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

    this.combos = data_page;
  }

  /** Hàm thực hiện cập nhật trạng thái của sub product
   *
   * @param subproduct
   * @param objectUpdate
   */
  updateHiddenSubproduct(subproduct, objectUpdate) {
    this.vhQueryAutoWeb.updateCombo(subproduct._id, objectUpdate).then(
      (response: any) => {
        if (!response) {
          this.functionService.createMessage(
            'error',
            this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_cap_nhat_du_lieu')
          );
        }
      },
      (error) => {
        this.functionService.createMessage(
          'error',
          this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_cap_nhat_du_lieu')
        );
      }
    );
  }

  handleSort(field) {
    this.sortby[field] = !this.sortby[field];
    this.sort = { [field]: this.sortby[field] ? 1 : -1 }

    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }else {
      this.getCombos();
    }
  }

  /** pageCurrent thay đổi */
  pageIndexChange(event) {
    this.pageCurrent = event;
    if (this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }
    else 
      this.getCombos();
  }

  /** limit thay đổi */
  limitChange(event) {
    this.resetPagination();
    this.limit = event;
    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    } else {
      this.getCombos()
    }
  }

}
