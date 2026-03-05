import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VhAlgorithm, VhEventMediator, VhQueryAutoWeb } from 'vhautowebdb';
import { forkJoin, Subscription } from 'rxjs';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { FunctionService } from 'vhobjects-service';
import { MatDialog } from '@angular/material/dialog';
import { SingleImageComponent } from './settings/single-image/single-image.component';
import { CategoryImageComponent } from './settings/category-image/category-image.component';
import { ProductImageComponent } from './settings/product-image/product-image.component';
import { FoodImageComponent } from './settings/food-image/food-image.component';
import { NewsImageComponent } from './settings/news-image/news-image.component';
import { ServiceImageComponent } from './settings/service-image/service-image.component';
import { WebsiteImageComponent } from './settings/website-image/website-image.component';
import { Title } from '@angular/platform-browser';
import { LanguageService } from 'src/app/services/language.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { PipeBlockObjectAdminConfigService } from 'src/app/services/pipeBlockObjectAdminConfig.service';
import { PipeBlockObjectAdminService } from 'src/app/services/pipeBlockObjectAdmin.service';
import { SelectBranchComponent } from 'src/app/components/select-branch/select-branch.component';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  public valueSelect = 2; // 1: quản lý trang | 2: quản lý admin | 3: quản lý block
  public blocks: Array<any> = []; // Danh block của toàn dự án
  public configType = ''; // Kiểu cài đặt
  public typeData = 'products'; // Dùng để chuyện link
  public openMap: { [name: string]: boolean } = {
    sub1: true,
    sub2: false,
    sub3: false,
    sub4: false,
    sub5: false,
    sub6: false,
    sub7: false,
    sub8: false,
  };
  public loading = false;
  public pages: Array<any> = []; // Danh sách trang
  public blockIndependentDesign: any = {
    headers: [],
    footers: [],
    popups: [],
  }; // Danh sách block thiết kế tự do
  public itemSelected: any = { _id: '' };
  display: any = {};
  public passwordVisible: boolean = false;
  passwordVisible2 = false;
  public email: any = '';
  public password: any = '';
  public oldpassword: any = '';
  chooseSubscription: any;
  public multi_languages: any = {}; // lưu các giá trị của đa ngôn ngữ
  /** Quản lý page trước đó để quay lại */
  backToPageObject: {
    /** Nếu trang vừa chọn là page */
    wasPreviousSelectedItemPage: boolean;
    /** Trạng thái hiển thị nút quay lại trang */
    isVisibleBackToPage: boolean;
    previousTypeData: string;
    previousConfigType: string;
    previousItemSelected: any;
  } = {
      wasPreviousSelectedItemPage: false,
      isVisibleBackToPage: false,
      previousTypeData: '',
      previousConfigType: '',
      previousItemSelected: null,
    };

  /**
   * Mảng chứa danh sánh các đối tượng và khối đã được chọn để chỉnh sửa
   * Xử lý việc người dùng ấn nút không lưu, lặp qua mảng objectsAndBlocksUpdated và tìm các đối tượng trong biến này để cập nhật lại dữ liệu
   */
  objectsAndBlocksClone: any[] = [];
  /**
   * Biến này xử lý khi người dùng chọn trang thiết kế
   * true: là đang thiết kế
   * false: là không thiết kế
   */
  designMode: boolean = false;
  objectChoosing: any = null;
  blockChoosing: any = null;
  detailCurrentPage: any = null;

  itemChoosingClone: any = null; // biến này để khi người dùng bấm hủy sẽ gán lại object, block hay page từ biến này
  id_parent_choose: string = ''

  syncStatus = false
  selectedDevice = 'desktop'
  subProjectClone: any = null;
  updateUISubs: Subscription;
  previousWrapper: any = null;
  objectsAndBlocksUpdated: any = [];
  constructor(
    private vhEventMediator: VhEventMediator,
    private vhComponent: VhComponent,
    private router: Router,
    private vhAlgorithm: VhAlgorithm,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    private dialog: MatDialog,
    private titleService: Title,
    private renderer: Renderer2,
    private languageService: LanguageService,
    private matDialog: MatDialog,
    private nzModalService: NzModalService,
    public pipeBlockObjectAdminConfigService: PipeBlockObjectAdminConfigService,
    public pipeBlockObjectAdminService: PipeBlockObjectAdminService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.vhQueryAutoWeb.syncCollections_Desktop()
        .then(() => {
          this.checkOnAuthStateChangedAdmin();
          this.vhQueryAutoWeb.getSetups_byFields({ type: { $eq: 'website-config' } })
            .then((docs: any) => {
              if (docs.length) {
                this.updateFavicon(docs[0].favicon)

              }
            }, (err) => {
              // chưa có dữu liệu
              console.log(err);
            });

          /*************************************************************************************************************************/
          //phần này get dữ liệu getlocalSubProject
          this.subproject = this.vhQueryAutoWeb.getlocalSubProject_Working();
          this.subproject.main_sectors.forEach((element) => {
            this.display[element] = true;
          });
          this.getSetups()
          this.handleAddLanguageCode()
        })
    }
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.functionService.setTypeConfig('admin')
      this.chooseSubscription = this.vhEventMediator.configChanged
        .subscribe((message: any) => {
          if (message) {
            console.log(message)
            if (message.status === "choose-selected-ruler" && message.code && message.code != this.objectChoosing?._id && message.code != this.blockChoosing?._id && message.code != this.detailCurrentPage?._id) {
              this.designMode = true;
              if (message.choose_object) {
                this.blockChoosing = null
                this.objectChoosing = message.object;
                this.id_parent_choose = message.id_parent_choose
                this.addObjectOrBlockClone(this.objectChoosing)
              }

              if (message.choose_block) {
                this.objectChoosing = null
                this.blockChoosing = message.block;
                this.id_parent_choose = message.id_parent_choose
                this.addObjectOrBlockClone(this.blockChoosing)
              }
            }

            if (message.status == 'change-page') {
              //xử lý showPosition
              this.previousWrapper?.remove(); // Xóa viền cũ
              this.detailCurrentPage = message.detailCurrentPage;

              console.log(this.detailCurrentPage);
              this.designMode = true;
              this.blockChoosing = this.objectChoosing = null;
              this.subProjectClone = JSON.parse(JSON.stringify(this.vhQueryAutoWeb.getlocalSubProject(this.vhQueryAutoWeb.getlocalSubProject_Working()._id)));
            }
            if (message.status == 'update-objects-and-blocks') {
              this.functionService.objectsAndBlocksUpdated = message.data;
            }
          }

        });
    }
  }
  handleAddLanguageCode() {
    this.vhQueryAutoWeb.getSetups_byFields({ type: { $eq: 'multi_languages' } }).then((res: any) => {
      if (!this.vhQueryAutoWeb.localStorageGET('language_code')) this.vhQueryAutoWeb.localStorageSET('language_code', { code: res[0].multi_languages[0].code });
      this.multi_languages = res[0].multi_languages;

      if (!this.vhQueryAutoWeb.localStorageGET('multi_languages')) this.vhQueryAutoWeb.localStorageSET('multi_languages', { multi_languages: res[0]?.multi_languages });
      this.functionService.multi_languages = res[0].multi_languages;
      this.functionService.defaultLanguage = res[0].default_language?.code;
      this.functionService.selectedLanguageCode = this.vhQueryAutoWeb.localStorageGET('language_code')?.code;
      this.functionService.languageTempCode = this.functionService.selectedLanguageCode;
    })
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.chooseSubscription) this.chooseSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
  }
  checkOnAuthStateChangedAdmin() {
    this.vhQueryAutoWeb.onAuthStateChangedAdmin()
      .then((response: any) => {
        this.syncStatus = true

        // document.getElementById('loading-screen').style['display'] = 'none';
        // console.log(document.getElementById('loading-screen').style['display']);

        if (response.vcode === 0) {
          this.checkBranch()
          this.email = this.vhQueryAutoWeb.getlocalAdmin().email
        } else {
        }
      }, error => {
        console.log('error', error)
      })
  }
  getData() {
    Promise.all([
      this.vhQueryAutoWeb.getBlocks_byFields({ type: { $eq: 'header' } }),
      this.vhQueryAutoWeb.getBlocks_byFields({ type: { $eq: 'footer' } }),
      this.vhQueryAutoWeb.getBlocks_byFields({ type: { $in: ['chatbox', 'popup_hover', 'hover_blank', 'popup_detail_product', 'popup_detail_snimei', 'popup_detail_food_drink', 'popup_detail_recruitment', 'popup_detail_news', 'popup_detail_service', 'popup_detail_website', 'popup_welcome'] } }),
      this.vhQueryAutoWeb.getPages(),
      this.vhComponent.showLoading('')
    ])
      .then(([header, footer, others, pages]: any) => {
        this.pages = pages.map((page) => {
          // if (!page.name) console.warn('Không có name', page)
          if (!page['name_' + this.functionService.defaultLanguage] && page.name) {
            return {
              ...page,
              ['name_' + this.functionService.defaultLanguage]: page.name
            };
          } else return page;
        });
        this.pages = this.vhAlgorithm.sortVietnamesebyASC(this.pages, 'name_' + this.functionService.defaultLanguage);
        this.routerToModule('');
        this.loading = true;
        let promisesHeader = [];
        for (let i in header) {
          promisesHeader[i] = this.vhQueryAutoWeb.getDetailBlock(header[i]?._id);
        }
        Promise.all(promisesHeader).then((blockHeaders) => {
          this.blockIndependentDesign.headers = blockHeaders
        })

        let promisesFooter = [];
        for (let i in footer) {
          promisesFooter[i] = this.vhQueryAutoWeb.getDetailBlock(footer[i]?._id);
        }
        Promise.all(promisesFooter).then((blockFooters) => {
          this.blockIndependentDesign.footers = blockFooters
        })

        let promisesOther = [];
        for (let i in others) {
          promisesOther[i] = this.vhQueryAutoWeb.getDetailBlock(others[i]?._id);
        }
        Promise.all(promisesOther).then((blockOther) => {
          this.blockIndependentDesign.popups = blockOther
        })


        this.vhComponent.hideLoading(0)
      });
  }

  /** Hàm kiểm tra và trả về những block chung không chưa id_page như popup, hover,(Tên bắt đầu bằng từ popup, hover)
   *
   * @param blockType
   */
  isGeneraltype(blockType: string): boolean {
    return (
      /^popup/.test(blockType) ||
      /^hover/.test(blockType) ||
      /^menu_hover/.test(blockType) ||
      /^chatbox/.test(blockType)
    );
  }


  /** Chuyện giao diện cài đặt
   *
   * @param path
   */
  routerToModule(path: string) {
    this.configType = '';
    this.typeData = path;
    this.router.navigate([`admin/${path}`]);
  }



  /** Hàm thực hiện chọn block
     *
     * @param item
     */
  choosePage(item): void {
    this.backToPageObject.wasPreviousSelectedItemPage = true;
    this.backToPageObject.isVisibleBackToPage = true;
    this.itemSelected = item;
    this.itemSelected.component_admin = 'AtwPagesAdmin';
    this.typeData = 'page';
    this.configType = 'page';
    this.handleStoreBackToPage('page', 'page', this.itemSelected);
  }

  /** Hàm thực hiện chọn block
   *
   * @param item
   */
  chooseBlock(item): void {
    this.backToPageObject.wasPreviousSelectedItemPage = true;
    this.backToPageObject.isVisibleBackToPage = true;
    this.typeData = 'block';
    this.configType = 'block';
    this.itemSelected = item;
    this.handleStoreBackToPage('block', 'block', this.itemSelected);
  }

  /** Hàm thực hiện chọn object
   *
   * @param object
   */
  chooseObject(object) {
    this.handleSetupBackToPage();
    this.backToPageObject.wasPreviousSelectedItemPage = false;
    this.itemSelected = object;
    this.configType = 'object';
  }

  /** Hàm thực hiện chọn frame
   *
   * @param frame
   * @param fromChooseSubscription true nếu chọn từ subscription, tức là chọn từ trong page chứ không phải khi hover ở left menu
   */
  chooseFrame(frame: any, fromChooseSubscription?: boolean) {
    console.log(frame);
    if (fromChooseSubscription) {
      this.handleSetupBackToPage();
    }
    else {
      this.backToPageObject.isVisibleBackToPage = false;
    }
    this.backToPageObject.wasPreviousSelectedItemPage = false;
    this.itemSelected = frame;
    this.configType = 'frame';
  }

  /** Hàm thực hiện chọn đối tượng
  *
  * @param object
  */
  handleChooseObject(object: any) {
    if (object.type == 'frame') {
      console.log(object.object)
      this.chooseFrame(object.object);
    } else if (object.type == 'object') {
      this.chooseObject(object.object);
    } else if (object.type == 'block') {
      this.chooseBlock(object.object);
    }
  }

  public outputs = {
    handleChoosePage: () => {
      this.objectChoosing = this.blockChoosing = null;
      //xử lý showPosition
      this.previousWrapper?.remove(); // Xóa viền cũ
    },
    handleChangeDevice: (device) => {
      this.loading = false;
      this.selectedDevice = device;
      setTimeout(() => {
        this.loading = true;
      }, 0)
      this.objectChoosing = this.blockChoosing = null;
    },
  }


  change(value: boolean): void {
    console.log(value);
  }


  login() {
    this.vhComponent.showLoading('', 'transparent-loading').then(() => {
      if (/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/.test(this.email)) {
        this.vhQueryAutoWeb.signin_Admin_byEmail(this.email, this.password)
          .then((response) => {
            if (response.vcode === 0) {
              setTimeout(() => {
                this.checkBranch()
              }, 1000);
            } else if (response.vcode === 1) {
              this.functionService.createMessage('error', 'Email không tồn tại vui lòng thử lại');
            } else if (response.vcode === 2) {
              this.functionService.createMessage('error', 'Mật khẩu không đúng');
            } else if (response.vcode === 3) {
              this.functionService.createMessage('error', 'Vui lòng reset mật khẩu');

            }
            this.vhComponent.hideLoading(0);

          },
            (error) => {
              console.error(error);
              this.functionService.createMessage('error', 'Có lỗi vui lòng reload lại trang');
            }
          )
          .finally(() => this.vhComponent.hideLoading(0));
      } else {
        this.vhComponent.hideLoading(0);
        this.functionService.createMessage('error', 'Email không tồn tại vui lòng thử lại');
      }
    });


  }
  public checkKey(event) {
    if (event.keyCode == 13) {
      this.login();
    }
  }
  //-----------------------------------------Chọn chi nhánh mặc định----------------------------------------------//

  checkBranch() {
    let defaultBranch = this.vhQueryAutoWeb.getDefaultBranch();
    if (defaultBranch) {
      let localBranch = this.vhQueryAutoWeb.getlocalBranch(defaultBranch._id)
      this.getData();
      if (!localBranch) this.getBranchs()
    } else this.getBranchs()
  }

  getBranchs() {
    let branchs = this.vhQueryAutoWeb.getlocalBranchs();
    if (!branchs.length) return
    // 1 chi nhánh, set luôn kg hiện popup
    if (branchs.length <= 1) {
      this.vhQueryAutoWeb.setDefaultBranch(branchs[0]._id)
      this.getData();
    }
    // show popup chọn chi nhánh
    else this.showPopupSelectBranch(branchs)
  }

  showPopupSelectBranch(branchs) {
    const dialogRef = this.dialog.open(SelectBranchComponent, {
      width: '400px',
      maxWidth: '100%',
      data: branchs,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.vhQueryAutoWeb.setDefaultBranch(result)
        this.getData();
      }
    });
  }

  logout() {
    this.vhQueryAutoWeb.signoutAdmin();
  }



  handleSetupBackToPage() {
    if (this.backToPageObject.wasPreviousSelectedItemPage) {
      this.backToPageObject.isVisibleBackToPage = true;
    }
    else {
      this.backToPageObject.isVisibleBackToPage = false;
    }
  }


  /**
   * Hàm lưu lại thông tin sau khi chuyển đến page
   * @param typeData 
   * @param configType 
   * @param item 
   */
  handleStoreBackToPage(typeData: string, configType: string, item: any) {
    if (typeData) this.backToPageObject.previousTypeData = typeData;
    if (configType) this.backToPageObject.previousConfigType = configType;
    if (item) this.backToPageObject.previousItemSelected = item;
  }

  /** 
   * Hàm thực hiện hành động Trở lại trang trước đó
   */
  goBackToPreviousPage() {
    this.backToPageObject.wasPreviousSelectedItemPage = true;
    this.backToPageObject.isVisibleBackToPage = true;
    this.itemSelected = this.backToPageObject.previousItemSelected;
    if (this.backToPageObject.previousTypeData === 'page') this.itemSelected.component_admin = 'AtwPagesAdmin'; // Nếu là page thì set component_admin
    this.typeData = this.backToPageObject.previousTypeData;
    this.configType = this.backToPageObject.previousConfigType;
    this.handleStoreBackToPage(this.backToPageObject.previousTypeData, this.backToPageObject.previousConfigType, this.itemSelected);
  }

  /**
   * Kiểm tra đệ quy bên trong objects có chứa object có dynamic_data hay không
   *
   * @param objects - Mảng chứa các object
   * @returns True nếu có bất kỳ object nào bên trong objects có dynamic_data, nếu không trả về false.
   */
  hasDynamicData(objects: any[]): boolean {
    return objects.some(obj => obj.dynamic_data === true || (obj.objects && this.hasDynamicData(obj.objects)));
  }

  subproject
  mapSettings = {
    'hinh_anh_danh_muc': 'category',
    'hinh_anh_san_pham': "ecommerce",
    'hinh_anh_mon_an_thuc_uong': "food_drink",
    'hinh_anh_tin_tuc': 'news',
    'hinh_anh_dich_vu': 'service',
    'hinh_anh_du_an': 'webapp',
    'hinh_anh_don': 'basic',
  }
  settings = [

    {
      label: "hinh_anh_don",
      component: SingleImageComponent,
      icon: 'picture'
    },
    {
      label: "hinh_anh_danh_muc",
      component: CategoryImageComponent,
      icon: 'appstore'
    },
    {
      label: "hinh_anh_san_pham",
      component: ProductImageComponent,
      icon: 'shopping'
    },
    {
      label: "hinh_anh_mon_an_thuc_uong",
      component: FoodImageComponent,
      icon: 'shopping-cart'
    },
    {
      label: "hinh_anh_tin_tuc",
      component: NewsImageComponent,
      icon: 'file-text'
    },
    {
      label: "hinh_anh_dich_vu",
      component: ServiceImageComponent,
      icon: 'tool'
    },
    {
      label: "hinh_anh_du_an",
      component: WebsiteImageComponent,
      icon: 'project'
    }

  ]
  conditionToShow(setting) {
    return this.subproject.main_sectors.some((sector) => sector == this.mapSettings[setting.label]);
  }

  handleChooseSettings(item): void {
    const component = item.component;
    this.dialog.open(component, {
      width: '30vw',
      height: '570px',
      data: {
        subproject: this.subproject,
        resolution: this.subproject.resolution,
        setupSingleImage: this.setupSingleImage,
        setupCategoryImage: this.setupCategoryImage,
        setupProductImage: this.setupProductImage,
        setupFoodImage: this.setupFoodImage,
        setupNewsImage: this.setupNewsImage,
        setupServiceImage: this.setupServiceImage,
        setupWebsiteImage: this.setupWebsiteImage
      },
    });
  }


  setupSingleImage;
  setupCategoryImage;
  setupProductImage;
  setupFoodImage;
  setupNewsImage;
  setupServiceImage;
  setupWebsiteImage;
  setupComboImage;
  setupToppingImage;
  setupHotelImage
  getSetups() {

    this.vhQueryAutoWeb.getSetups_byFields({ type: { $in: ['single_image', 'category_image', 'product_image', 'food_image', 'news_image', 'service_image', 'website_image', 'combo_image', 'topping_image', 'hotel_image'] } })
      .then((res: any) => {
        if (res.length) {

          this.setupSingleImage = res.find((element) => element.type == 'single_image');
          this.setupCategoryImage = res.find((element) => element.type == 'category_image');
          this.setupProductImage = res.find((element) => element.type == 'product_image');
          this.setupFoodImage = res.find((element) => element.type == 'food_image');
          this.setupNewsImage = res.find((element) => element.type == 'news_image');
          this.setupServiceImage = res.find((element) => element.type == 'service_image');
          this.setupWebsiteImage = res.find((element) => element.type == 'website_image');
          this.setupComboImage = res.find((element) => element.type == 'combo_image');
          this.setupToppingImage = res.find((element) => element.type == 'topping_image');
          this.setupHotelImage = res.find((element) => element.type == 'hotel_image');
        }
        if (!this.setupSingleImage) {
          this.vhQueryAutoWeb.addSetup({
            upload_image: {
              compress_type: 'compress-screen',
              display: 'shared',
              source: "device",
            },
            type: 'single_image'
          }).then((res: any) => {
            console.log('addSetup');
            this.setupSingleImage = res.data;
          })

        }

        this.setupImage('category_image', 'setupCategoryImage');
        this.setupImage('product_image', 'setupProductImage');
        this.setupImage('food_image', 'setupFoodImage');
        this.setupImage('news_image', 'setupNewsImage');
        this.setupImage('service_image', 'setupServiceImage');
        this.setupImage('website_image', 'setupWebsiteImage');
        this.setupImage('combo_image', 'setupComboImage');
        this.setupImage('topping_image', 'setupToppingImage');
        this.setupImage('hotel_image', 'setupHotelImage');
      })

  }
  setupImage(type: string, setupProperty: string) {
    if (!this[setupProperty]) {
      this.vhQueryAutoWeb.addSetup({
        upload_image: {
          compress_type: 'compress-screen',
          source: "device",
        },
        type: type
      }).then((res: any) => {
        console.log('addSetup');

        this[setupProperty] = res.data;
      });
    }
  }

  updateFavicon(url: string): void {
    const linkElement = document.querySelector("link[rel~='icon']");

    // Xác định type dựa vào phần mở rộng file
    const extension = url.split('.').pop()?.toLowerCase();
    let type = 'image/png'; // Mặc định

    switch (extension) {
      case 'png':
        type = 'image/png';
        break;
      case 'jpg':
      case 'jpeg':
        type = 'image/jpeg';
        break;
      case 'ico':
        type = 'image/x-icon';
        break;
      case 'svg':
        type = 'image/svg+xml';
        break;
      default:
        type = 'image/png'; // fallback nếu không rõ
        break;
    }

    if (linkElement) {
      this.renderer.setAttribute(linkElement, 'href', url);
      this.renderer.setAttribute(linkElement, 'type', type);
    }
  }


  toggleDesignMode(value) {
    this.designMode = value;
  }


  handleSave() {
    console.log(this.detailCurrentPage);
    return new Promise((resolve, reject) => {
      this.functionService.showLoading(this.languageService.translate('dang_lu_thay_doi'))
        .then(() => {
          if (!this.functionService.objectsAndBlocksUpdated.length) return resolve(true)
          let promises = []
          this.functionService.objectsAndBlocksUpdated.forEach((item) => {
            let fieldUpdate: any = {}

            item.fieldUpdate?.forEach((field) => {
              fieldUpdate[field] = item[field]
            })

            delete item.fieldUpdate

            // Nếu item là object(vật thể và khung)
            if (item.otype == 'object' || item.otype == 'frame') {
              promises.push(this.vhQueryAutoWeb.updateObject(item._id, fieldUpdate))
            }

            // Nếu item là block(khối)
            if (!item.hasOwnProperty('otype') && item.hasOwnProperty('objects')) {
              promises.push(this.vhQueryAutoWeb.updateBlock(item._id, fieldUpdate))
            }

            // Nếu item là page(trang)
            if (!item.hasOwnProperty('otype') && item.hasOwnProperty('blocks')) {
              promises.push(this.vhQueryAutoWeb.updatePage(item._id, fieldUpdate))
            }
          })

          Promise.all(promises).then(() => {
            this.functionService.objectsAndBlocksUpdated.forEach((item) => {
              if (item.is_child_banner || item.is_child_tabs || item.is_child_collapse) {
                this.vhEventMediator.notifyOnConfigChanged({ code: item.id_object, status: 'config-changed' });
              }
            })

            this.functionService.createMessage('success', 'cap_nhat_thanh_cong')
            this.functionService.objectsAndBlocksUpdated = []
            this.objectsAndBlocksClone = []

            this.objectChoosing = this.blockChoosing = null
            this.functionService.hideLoading();
            console.log(this.detailCurrentPage);

            resolve(true);
          })
        })

    })
  }

  handleExit() {
    return new Promise((resolve, reject) => {
      if (this.functionService.objectsAndBlocksUpdated.length) {
        this.nzModalService.create({
          nzTitle: this.languageService.translate('ban_co_muon_luu_lai_thay_doi_khong'),
          nzContent: this.languageService.translate('nhung_thay_doi_cua_ban_se_mat_neu_ban_khong_luu_lai'),
          nzClosable: false,
          nzMaskClosable: false,
          nzFooter: [
            {
              label: this.languageService.translate('luu'),
              type: 'primary',
              onClick: () => {
                this.handleSave()
                  .then(() => {
                    this.nzModalService.closeAll()
                    resolve(true)

                  })
              }
            },
            {
              label: this.languageService.translate('khong_luu'),
              onClick: () => {
                this.functionService.objectsAndBlocksUpdated.forEach((item) => {
                  const foundedItemClone = this.objectsAndBlocksClone.find((itemClone) => itemClone._id == item._id)
                  if (foundedItemClone) {
                    item.fieldUpdate?.forEach((field) => {
                      item[field] = foundedItemClone[field]
                    })

                    delete item.fieldUpdate
                    this.vhEventMediator.notifyOnConfigChanged({ code: item._id, status: 'update-UI', id_parent: item.id_page || item.id_block || item.id_object });
                  }
                })

                this.functionService.objectsAndBlocksUpdated = []
                this.objectsAndBlocksClone = []
                this.objectChoosing = this.blockChoosing = null
                this.previousWrapper?.remove(); // Xóa viền cũ

                this.configType = ''
                this.designMode = false;

                setTimeout(() => {
                  if (!this.detailCurrentPage) return;
                  let currentPage: any = document.getElementById(this.detailCurrentPage._id);
                  this.detailCurrentPage = null
                  if (currentPage) {
                    // cuộn đến ngay giữa phần tử
                    currentPage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }, 100);


                this.nzModalService.closeAll()
                resolve(true)
              }
            },
            {
              label: this.languageService.translate('huy'),
              onClick: () => {
                this.nzModalService.closeAll()
                resolve(true)
              }
            }

          ]
        })
      } else {
        this.configType = ''
        this.designMode = false;
        this.objectChoosing = this.blockChoosing = this.detailCurrentPage = null
        this.previousWrapper?.remove(); // Xóa viền cũ
      }
    })
  }
  addObjectOrBlockClone(objectOrBlock) {
    if (!this.objectsAndBlocksClone.some((item) => item._id == objectOrBlock._id)) {
      let itemClone = JSON.parse(JSON.stringify(objectOrBlock))
      delete itemClone.objects
      this.objectsAndBlocksClone.push(itemClone)
    }
  }


  isVisible = false
  isVisibleChangePass = false
  /**
   * Quên mật khẩu 
   * @param email   
   * @param password 
   */
  forgotPassword() {
    this.functionService.showLoading('')
      .then(() => {
        this.vhQueryAutoWeb.forgotPassword_Admin_byEmail(this.email, this.password)
          .then((response: any) => {
            console.log(response);

            this.functionService.hideLoading(0)
            if (response.vcode == 0) {
              this.functionService.createMessage('success', this.languageService.translate('Vui_long_vao_email_de_reset_mat_khau'))
            } else {
              this.functionService.createMessage('error', this.languageService.translate("email_khong_ton_tai"))
            }
          })
      })
  }

  /**
   * Thay doi mat khau
   * @param email   
   * @param oldpassword   
   * @param password   
   */
  changePassword() {
    this.functionService.showLoading('')
      .then(() => {
        this.vhQueryAutoWeb.changePassword_Admin_byEmail(this.email, this.oldpassword, this.password)
          .then((response: any) => {
            console.log(response);

            this.functionService.hideLoading(0)
            if (response.vcode == 0) {
              this.functionService.createMessage('success', this.languageService.translate('Vui_long_vao_email_de_reset_mat_khau'))
            }
            else if (response.vcode === 1) {
              this.functionService.createMessage('error', this.languageService.translate("email_khong_ton_tai"))
            } else if (response.vcode === 2) {
              this.functionService.createMessage('error', this.languageService.translate("mat_khau_cu_khong_dung"))
            } else if (response.vcode === 3) {
              this.functionService.createMessage('error', this.languageService.translate("vui_long_reset_mat_khau"))
            }
          })
      })
  }

  signout() {
    this.vhQueryAutoWeb.signoutAdmin()
  }
}