import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VhAlgorithm, VhEventMediator, VhQueryAutoWeb } from 'vhautowebdb';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { FunctionService } from 'vhobjects-service';
import { AddServiceComponent } from './add-service/add-service.component';
import { EditServiceComponent } from './edit-service/edit-service.component';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements OnInit {
  /** biến dùng để chứa chiều cao của bảng dữ liệu */
  tableHeight: string; 
  /** setup service */
  setupServiceImg
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
    /** Danh sách services hiển thị */
  services: any[] = []; // 
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
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private vhEventMediator: VhEventMediator,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.vhQueryAutoWeb.getSetups_byFields({type: {$in: ['service_image', 'category_image'] }})
    .then((res:any) => {
      if(res.length) {
        for(let i of res) {
          this.setupServiceImg = res.find(e => e.type == 'service_image')
          this.setupCategoryImg = res.find(e => e.type == 'category_image')
        }
      }
    })
    this.getCategory();
  }

  ngOnDestroy(): void {}

  trackByFn(index: number, item: any) {
    return item._id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }

  /**
   * hàm này get danh sách category để chọn xem sp theo danh mục
   * @example this.getCategory()
   */
  getCategory() {
    this.vhQueryAutoWeb
      .getCategorys_byFields(
        { id_main_sectors: { $all: ['service'] } },
        {},
        {},
        0
      )
      .then((res: any) => {
        if (res.vcode === 0) {
          this.vhQueryAutoWeb
            .getCategorySteps_byIdCategoryArray(
              res.data.map((e) => {
                return e._id;
              })
            )
            .then(
              (response: any) => {
                if (response.vcode === 0) {
                   response.data.forEach((e) => {
                     this.categories.push(e)
                  });
                }
              },
              (error: any) => {
                console.log('error', error);
              }
            );
        }
      });
  }

  languageChangedSubscription
  ngAfterViewInit(): void {
    this.languageChangedSubscription = this.vhEventMediator.configChanged.subscribe((message: any) => {
      if (message?.status === 'update-language') {
        this.keySearch=''; 
        this.services=[]; 
        this.totalPages=0
      }
    });

    // ko được để đoạn logic này trong ngAfterViewChecked vì sẽ gây lag
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

  /** Hàm thực hiện lấy danh sách dịch vụ
   *
   */
  getServices() {
    this.loading = true;
    this.keySearch = '';
    let query:any = { type: { $eq: 2 } } 
    if(this.idCategory != 'all') {
      query = {
        ...query,
        id_categorys: { $all: [this.idCategory] }
      }
    } 
    this.vhQueryAutoWeb.getServices_byFields(
      query,
      {},
      this.sort,
      this.limit,
      this.pageCurrent
    ).then((res: any) => {

      this.services = this.proccessData(res.data);
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
      // map mảng _id danh mục sang tên danh mục
      product.category_name = product.id_categorys?.map((id) => {
        if (id === null || id === undefined) {
          return 'Trống';
        }
        return this.categories.find((category) => category._id === id)?.['name_' + this.functionService.selectedLanguageCode] || 'Trống';
      })
      .join(', ');
      
      // xử lý id_category đã bị xóa 
      // let id_categorys = product.id_categorys.filter(id => validCategoryIds.includes(id));
      // if (id_categorys.length !== product.id_categorys.length) {
      //   this.vhQueryAutoWeb.updateService(product._id, { id_categorys: id_categorys })
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

    return dataReturn
  }

  
  

  /** Hàm thực hiển chọn đơn vị
   *
   * @param item dịch vụ
   * @param event đơn vị chọn
   * @returns đơn vị chọn và gán vào unitDefault
   */
  selecUnit(item, event) {
    return (item.unitDefault = item.units.find((item) => item == event));
  }

  handleSort(field) {
    this.sortby[field] = !this.sortby[field];
    switch (field) {
      case this.nameField: {
        this.sort = { [this.nameField]: this.sortby[field] ? 1 : -1 };
        break;
      }
    }

    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }else {
      this.getServices();
    }
  }
 

  /** Hàm thực hiện mở popup thêm dịch vụ
   *
   */
  addProductFn(): void {
    if (!this.setupServiceImg) return;
    const dialogRef = this.dialog.open(AddServiceComponent, {
      width: '70vw',
      height: '95vh', 
      data: {
        categories: this.categories,
        setupServiceImg: this.setupServiceImg,
        setupCategoryImg: this.setupCategoryImg,
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.functionService.languageTempCode = this.functionService.selectedLanguageCode;
      if (result) {
        if (typeof result != 'boolean' && (this.idCategory == 'all' || result.id_categorys.includes(this.idCategory))) {
          this.services = [this.proccessData([result])[0], ...this.services];
        }
      }
    });
  }

  /** Hàm thực hiện mở popup edit với id
   *
   * @param product: dữ liệu dịch vụ được truyền cho popup
   */
  editProduct(product): void {
    if (!this.setupServiceImg) return;
    const dialogRef = this.dialog.open(EditServiceComponent, {
      width: '70vw',
      height: '95vh',
      data: {
        dataEditService: product,
        categories: this.categories,
        setupServiceImg: this.setupServiceImg,
        setupCategoryImg: this.setupCategoryImg
      }, 
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.functionService.languageTempCode = this.functionService.selectedLanguageCode;
      if (result) {
        this.services = this.services.map(p => p._id === result._id ? this.proccessData([result])[0] : p)
      }
    });
  }

  /** Hàm thực hiện xác nhận xóa dịch vụ và thực hiện xóa dịch vụ
   *
   * @param product
   */
  deleteProduct(product) {
    this.vhComponent
      .alertConfirm('', `${this.languageService.translate('xoa_dich_vu')} ?` , product[this.nameField], `${this.languageService.translate('dong_y')}`, `${this.languageService.translate('thoat')}`)
      .then(
        (ok) => {
          if (ok == 'OK') {
            this.vhQueryAutoWeb.deleteService(product._id).then(
              (res: any) => {
                console.log('res', res);
                if (res.vcode === 0) {
                  this.services = this.services.filter(
                    (item) => item._id != product._id
                  );
                  this.functionService.createMessage(
                    'success',
                    this.languageService.translate('xoa_dich_vu_thanh_cong')
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
                  this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_xoa_du_lieu')
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


  /** Hàm thực hiện cập nhật trạng thái dịch vụ
   *
   * @param item
   * @param objectUpdate
   */
  updateHiddenProduct(item, objectUpdate) {
    this.vhQueryAutoWeb
      .updateService(item._id, objectUpdate)
      .then((res: any) => {
        console.log('res', res);
        if (res.vcode === 0) {
          this.functionService.createMessage(
            'success',
            this.languageService.translate('cap_nhat_dich_vu_thanh_cong')
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
          this.languageService.translate('da_xay_ra_loi_trong_qua_trinh_truyen_du_lieu_vui_long_thu_lai')
        );
      });
  }
 
  onSearch(): void {
    this.loading = true;
    this.idCategory = 'all';
    this.resetPagination();
    this.vhQueryAutoWeb.searchList_likeSearch('services', this.nameField, this.keySearch, {}, {})
      .then((res: any) => {
        console.log('res', res);
        if (res.vcode === 0) {
          this.dataSearched = res.data;

          // cập nhật lại dữ liệu     
          this.dataSearched.forEach((product) => {
            product.show_expand = false;
      
            if (product.units) {
              product.unitDefault = product.units.find(
                (item) => item.default == true
              );
            }
      
            if (product.subs && product.subs.length) {
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
          });

          this.handlePaginateLocal();
        }
      }, (error: any) => {
        console.log('error', error)
      })
      .finally(() => {
        this.loading = false;
      });

  }

  /** Hàm thực hiện cập nhật trạng thái của sub product
   *
   * @param subproduct
   * @param objectUpdate
   */
  updateHiddenSubproduct(subproduct, objectUpdate) {
    this.vhQueryAutoWeb.updateService(subproduct._id, objectUpdate).then(
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
   * hàm này reset pagination về 1
   */
  resetPagination() {
    this.pageCurrent = 1;
    this.pageGoto = 1;
    this.pageShowChoose = [0, 1, 2];
  }

  handlePaginateLocal() {
    let data_filter = this.dataSearched;
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

    this.services = data_page;
  }

   
  /** pageCurrent thay đổi */
  pageIndexChange(event) {
    this.pageCurrent = event;
    if (this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    }
    else 
      this.getServices();
  }

  /** limit thay đổi */
  limitChange(event) {
    this.resetPagination();
    this.limit = event;
    if(this.keySearch && this.dataSearched.length) {
      this.handlePaginateLocal();
    } else {
      this.getServices()
    }
  }


}
