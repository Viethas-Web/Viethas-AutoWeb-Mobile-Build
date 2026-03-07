import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationError, NavigationEnd, Router, Event } from '@angular/router';
import { Platform } from '@ionic/angular';
import { VhAlgorithm, VhAuth, VhEventMediator, VhOTP, VhQueryAutoWeb } from 'vhautowebdb';
import { forkJoin } from 'rxjs';
import { CartService } from 'vhobjects-user';
import { FunctionService } from 'vhobjects-service/src/services';
import { AtwBlockPopupHoverBlank } from 'vhobjects-user';
import { Meta, Title } from '@angular/platform-browser';
// import { PipeBlockService } from 'src/app/services/pipeBlock.service';
import { SelectBranchComponent } from 'src/app/components/select-branch/select-branch.component';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-home-blank',
  templateUrl: './home-blank.component.html',
  styleUrls: ['./home-blank.component.scss'],
})
export class HomeBlankComponent implements OnInit {
  private embeddedScripts: HTMLScriptElement[] = [];
  currentDeviceShow: any = 'desktop';
  resolution: any = {};
  heightBodyDesign = 0 //biến này để tính height các block thiết kế mỗi khi có sự thay đổi vị trí của block
  block_header: any;
  block_footer: any;
  deviceDisplay: any = 'desktop';
  orderDisplay = {
    desktop: ['tablet_landscape', 'mobile_landscape', 'tablet_portrait', 'mobile_portrait'],
    tablet_landscape: ['desktop', 'mobile_landscape', 'tablet_portrait', 'mobile_portrait'],
    tablet_portrait: ['mobile_portrait', 'mobile_landscape', 'tablet_landscape', 'desktop'],
    mobile_landscape: ['tablet_landscape', 'desktop', 'tablet_portrait', 'mobile_portrait'],
    mobile_portrait: ['tablet_portrait', 'mobile_landscape', 'tablet_landscape', 'desktop'],
  }
  subproject: any;
  maintenance: any = '';
  block_popup_welcome: any;
  block_chat_boxs: any;
  detailPage: any = new Array();
  thefirst = 0; // biến cờ kiểm tra có phải lần đầu tải trang hay ko
  marginData: any = []; // danh sách margin của từng block trong page
  blocks_of_page: Array<any> = []; // Danh sách blocks trong trang hiện tại  
  /** Vị trí ban đầu của #device (viewport), dùng để hiển thị chatbox đúng khi preview */
  deviceElementPosition: any;
  @ViewChildren('blockRef') blockRefs: QueryList<ElementRef>;
  start = performance.now();
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public platform: Platform,
    private http: HttpClient,
    public matDialog: MatDialog,
    private renderer: Renderer2,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private functionService: FunctionService,
    private cartService: CartService,
    private changeDetectorRef: ChangeDetectorRef,
    private vhEventMediator: VhEventMediator,
    private vhAuth: VhAuth,
    private vhOTP: VhOTP,
    // public pipeBlockService: PipeBlockService
  ) {
    this.syncData();
  }

  syncData() {
    this.vhQueryAutoWeb.syncCollections_Desktop()
      .then(() => {
        this.vhQueryAutoWeb.localStorageSET('back_page_url', []);
        this.checkOnAuthStateChangedEndUser();

        this.checkBranch()
        /*************************************************************************************************************************/
        //phần này get dữ liệu getlocalSubProject
        this.subproject = this.vhQueryAutoWeb.getlocalSubProject_Working();
        if (!this.subproject) {
          return;

        }
        this.resolution = this.subproject.resolution;
        // gán dữ liệu scrollbar mặc định cho page  nếu chưa có
        if (!this.subproject.resolution[this.deviceDisplay + '_class']['scrollbar']) {
          this.subproject.resolution[this.deviceDisplay + '_class']['scrollbar'] = {
            width_scrollbar: '0px',
            height_scrollbar: '0px',
            background_color_track: '#ffffff',
            border_radius_track: '0px',
            background_color_thumb: '#00a859',
            border_radius_thumb: '0px',
          }
        }
        this.resolution.zoom = 1
        // gán thiết bị thiết kế cần hiển thị
        if (this.platform.is('ipad') || this.platform.is('tablet') && !this.platform.is('desktop')) {
          if (this.platform.isLandscape()) this.currentDeviceShow = 'tablet_landscape';
          else this.currentDeviceShow = 'tablet_portrait';
        }
        else if (this.platform.is('iphone') || this.platform.is('ios') || this.platform.is('android') || this.platform.is('mobileweb') || this.platform.is('mobile') || this.platform.is('phablet')) {
          if (this.platform.isLandscape()) this.currentDeviceShow = 'mobile_landscape';
          else this.currentDeviceShow = 'mobile_portrait';
        }
        else this.currentDeviceShow = 'desktop';

        Promise.resolve().then(() => {

          this.route.params.subscribe((routeParam) => {
            // gán lại thiết bị cần hiển thị hợp lý, vd: đang ở thiet bị tablet ngang nhưng ko thiết kế giao diện này sẽ hiển thị desktop
            this.handleGetDeviceValid().then((device) => {
              this.deviceDisplay = device;
              // load lần đầu tiên vào trang web sẽ get dữ liệu page ở fontend
              if (!this.thefirst) {
                this.thefirst++;
                this.checkMaintenance(routeParam)
                this.handleSetLanguageCode()
              } else { // khi router qua các trang khác sẽ pipeDetailPage_byLink trong fw để hiển thị các blocks của trang đó  
                this.vhQueryAutoWeb.pipeDetailPage_byLink(routeParam.link_page ? routeParam.link_page : '')
                  .then(() => {
                    //Loại bỏ những block ko được phép hiển thị
                    this.detailPage.blocks = this.detailPage.blocks.filter(e => !e[this.deviceDisplay + '_hidden'])
                    // sort lại danh sách block theo position từ nhỏ tới lớn 
                    this.detailPage.blocks.sort((a: any, b: any) => {
                      const aPosition = a?.[`${this.deviceDisplay}_position_${this.detailPage._id}`]?.top ?? 0;
                      const bPosition = b?.[`${this.deviceDisplay}_position_${this.detailPage._id}`]?.top ?? 0;

                      return aPosition - bPosition; // Sắp xếp tăng dần theo giá trị top
                    });
                    let exist = true;
                    //Giữ lại các block giống nhau trong this.blocks_of_page và this.detailPage.blocks
                    for (let i = 0; i < this.blocks_of_page.length; i++) {
                      exist = false;
                      for (let j = 0; j < this.detailPage.blocks.length; j++) {
                        if (this.blocks_of_page[i]._id == this.detailPage.blocks[j]._id) {
                          this.blocks_of_page[i] = this.detailPage.blocks[j];
                          exist = true;
                          break;
                        }
                      }
                      if (!exist) this.blocks_of_page[i] = null;
                    }
                    this.blocks_of_page = [...this.blocks_of_page.filter(e => e != null)];
                    //Thêm vào các block mới mà this.detailPage.blocks có và this.blocks_of_page ko có
                    for (let i = 0; i < this.detailPage.blocks.length; i++) {
                      exist = false;
                      for (let j = 0; j < this.blocks_of_page.length; j++) {
                        if (this.detailPage.blocks[i]._id == this.blocks_of_page[j]._id) {
                          exist = true;
                        }
                      }
                      if (!exist) this.blocks_of_page.push(this.detailPage.blocks[i]);
                    }
                    this.processConvert();

                    // gán lại header footer nếu có sự thay đổi
                    this.handleFreeBlocks();

                  })
              }
            })
          })

        })

      })
  }


  ngOnInit(): void {
  }

  handleSetLanguageCode() {
    this.vhQueryAutoWeb.localStorageSET('multi_languages', { multi_languages: [] });
    if (!this.vhQueryAutoWeb.localStorageGET('language_code')?.code || !this.vhQueryAutoWeb.localStorageGET('default_language')) {
      this.vhQueryAutoWeb.getSetups_byFields({ type: { $eq: 'multi_languages' } }).then((res: any) => {

        this.vhQueryAutoWeb.localStorageSET('language_code', { code: res[0]?.default_language?.code ?? 'vn' });
        this.vhQueryAutoWeb.localStorageSET('default_language', res[0]?.default_language?.code ?? 'vn');
      })
    }
  }

  ngAfterContentInit() {
    // phần này kiểm tra đã có enduser chưa để lấy dữ liệu cart, nếu chưa thì set rỗng
    if (this.vhQueryAutoWeb.checkSigninEndUser()) {
      this.cartService.getCartFromDB();
    } else {
      this.cartService.getDataCart();
    }
  }
  @ViewChild('zaloWidget', { static: false }) zaloWidget!: ElementRef;
  private observer?: IntersectionObserver;
  ngAfterViewInit(): void {

    // gán danh sách blockRefs vào service để các object có thể click để cuộn tới block
    this.functionService.setBlockRefs(this.blockRefs)

  }


  /**
   * kiểm tra và gán defaultBranch
   */
  checkBranch() {
    let defaultBranch = this.vhQueryAutoWeb.getDefaultBranch();
    if (defaultBranch) {
      let localBranch = this.vhQueryAutoWeb.getlocalBranch(defaultBranch._id)

      if (!localBranch) this.getBranchs()
    } else this.getBranchs()
  }

  /**
   * get danh sách chi nhánh và hiện popup chọn nếu có 2 chi nhánh trở lên
   */
  getBranchs() {
    let branchs = this.vhQueryAutoWeb.getlocalBranchs();
    if (!branchs.length) return
    // 1 chi nhánh, set luôn kg hiện popup
    if (branchs.length <= 1) {
      this.vhQueryAutoWeb.setDefaultBranch(branchs[0]._id)

    }
    // show popup chọn chi nhánh
    else this.showPopupSelectBranch(branchs)
  }

  /**
   * mở popup chọn chi nhánh
   * @param branchs 
   */
  showPopupSelectBranch(branchs) {
    const dialogRef = this.matDialog.open(SelectBranchComponent, {
      width: '400px',
      maxWidth: '100%',
      data: branchs,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.vhQueryAutoWeb.setDefaultBranch(result)

      }
    });
  }

  checkOnAuthStateChangedEndUser() {
    this.vhQueryAutoWeb.onAuthStateChangedEndUser()
      .then(response => {
        this.vhEventMediator.notifyOnConfigChanged({ status: 'change-signin-signout' });
        if (response.vcode === 0) {
          this.cartService.getCartFromDB();
        }
      })
  }

  /**
   * kiểm tra nếu có chọn trang bảo trì thì chỉ hiển thị trang bảo trì, nếu không thì hiển thị trang theo link_page
   * @param routeParam 
   */
  checkMaintenance(routeParam) {
    this.getPage('');
    // kiểm tra có cấu hình hiển thị trang bảo trì thì chuyển qua trang bảo trì
    this.vhQueryAutoWeb
      .getSetups_byFields({ type: { $eq: 'maintenance' } })
      .then((docs: any) => {
        if (docs.length && docs[0]?.link) {
          this.getPage(docs[0]?.link);
        }
      });
  }


  data_oaid = '';
  loadZaloScript() {
    this.vhQueryAutoWeb
      .getSetups_byFields({ type: { $eq: 'zalo' } })
      .then((docs: any) => {
        // console.log('docs zalo', docs);
        if (docs.length && docs[0].oaid) {

          this.data_oaid = docs[0].oaid;
          this.scriptElement = this.renderer.createElement('script');
          this.scriptElement.src =
            'https://sp.zalo.me/plugins/sdk.js';
          this.renderer.appendChild(
            document.head,
            this.scriptElement
          );
        }
      });
  }
  private scriptElement: any;
  // Lấy dữ liệu page
  getPage(link_page: any) {
    // this.vhQueryAutoWeb.getPages_byFields({ link: { $eq: link_page } }).then((pages: any) => {
    // if (pages.length) {
    this.vhQueryAutoWeb.getDetailPage_byLink(link_page ? link_page : '').then((page: any) => {
      // lấy trang theo link_page
      if (page) {
        this.detailPage = page;
        this.getBlockPage();
        // đoạn này để xử lý load zalo widget khi nó nằm trong viewport
        // chỉ khi user thao tác scroll thì mới load zalo widget còn ggbot thì bỏ qua => fix lỗi trong pagespeed
        if (!this.zaloWidget) return;
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (this.detailPage[this.currentDeviceShow + '_config'].zalo_display) {
                this.loadZaloScript();
              }
              this.observer?.disconnect();
            }
          });
        });

        this.observer.observe(this.zaloWidget.nativeElement);

      } else {
        this.vhQueryAutoWeb.getURLRedirects_byFields_byPages({ old_url: { $eq: link_page } }).then((res: any) => {
          if (res.data.length) {
            window.location.href = res.data[0].current_url;
          } else {
            // lấy trang 404 nếu không tìm thấy trang
            this.vhQueryAutoWeb.getPages_byFields({
              type: { $eq: 'not_found' },
              default: { $eq: true },
            })
              .then((pages: Array<any>) => {

                if (pages.length != 0) {
                  this.vhQueryAutoWeb.getDetailPage(pages[0]._id)
                    .then((page) => {
                      this.detailPage = page;
                      this.getBlockPage();
                    })

                }
                else {
                  this.router.navigate(['/page-not-found']);
                }
              });
          }
        })

      }
    });
  }
  isBot(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return /googlebot|crawler|spider|robot|crawling/i.test(userAgent);
  }

  getBlockPage() {
    this.block_popup_welcome = null;
    document.getElementById('loading-screen').style['display'] = 'none';
    // thực hiện gán danh sách freeblocks vào service để các object dạng gọi hộp thoại gán dữ liệu 
    // vì ở bản build ko sử dụng getBlock(id_block) được
    this.functionService.setFreeBlocks(this.detailPage.freeblocks)

    // xử lý gán lại header footer chatbox mới nếu trang mới sử dụng block header footer khác
    this.handleFreeBlocks()
    // sort lại danh sách block theo position từ nhỏ tới lớn 
    this.detailPage.blocks.sort((a: any, b: any) => {
      const aPosition = a?.[`${this.deviceDisplay}_position_${this.detailPage._id}`]?.top ?? 0;
      const bPosition = b?.[`${this.deviceDisplay}_position_${this.detailPage._id}`]?.top ?? 0;

      return aPosition - bPosition; // Sắp xếp tăng dần theo giá trị top
    });
    this.changeDetectorRef.detectChanges();
    this.blocks_of_page = this.detailPage.blocks;
    // thực thi chuyển đổi để lấy các chỉ số margin từ position
    this.processConvert();
    if (this.isFirstLoad) this.handleZoomFirstLoad();
    // this.calculateHeightBody(blocks_of_page);
    //this.vhQueryAutoWeb.displayBocksOfPage_byScroll_toEnd(this, 0, true);
    // if (this.block_popup_welcome) {
    //   this.openModal()
    // }

    // Nếu có block chatbox thì lấy vị trí của #device để hiển thị chatbox đúng
    if (this.block_chat_boxs) {
      setTimeout(() => {
        this.deviceElementPosition = document.getElementById("device")?.getBoundingClientRect();
      }, 0);
    }

  }
  trackByFn(index: number, item: any) {
    return item._id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }
  trackByBlockId(index: number, block: any): string {
    return block._id;
  }

  /**
   * hàm này xử lý gán dữ liệu block header footer chatbox cho page
   */
  handleFreeBlocks() {
    if (this.detailPage[this.deviceDisplay + '_config'].id_block_header) {
      this.block_header = this.detailPage.freeblocks.find(e => e._id == this.detailPage[this.deviceDisplay + '_config'].id_block_header);
    }
    // if (this.detailPage[this.deviceDisplay + '_config'].id_block_chatbox) {
    //   this.block_chat_box = this.detailPage.freeblocks.find(e => e._id == this.detailPage[this.deviceDisplay + '_config'].id_block_chatbox);
    // }
    if (this.detailPage[this.deviceDisplay + '_config'].id_block_chatboxs?.length) {
      this.block_chat_boxs = this.detailPage.freeblocks.filter(block =>
        this.detailPage[this.deviceDisplay + '_config'].id_block_chatboxs.includes(block._id)
      );
    } else this.block_chat_boxs = [];
    if (this.detailPage[this.deviceDisplay + '_config'].id_block_popup_welcome) {
      this.block_popup_welcome = this.detailPage.freeblocks.find(e => e._id == this.detailPage[this.deviceDisplay + '_config'].id_block_popup_welcome);
    }
    else this.block_popup_welcome = null;
    if (this.detailPage[this.deviceDisplay + '_config'].id_block_footer) {
      this.block_footer = this.detailPage.freeblocks.find(e => e._id == this.detailPage[this.deviceDisplay + '_config'].id_block_footer);
    }
    if (this.block_popup_welcome) {
      this.openModal()
    }
  }


  zoom_value = '1'
  isFirstLoad = true
  /**
   * hàm này xử lý khi lần đầu load trang để zoom đúng với kich thước thiết bị
   */
  handleZoomFirstLoad() {
    this.isFirstLoad = false
    let deviceFound = false;
    // đoạn này để xử lý thiết bị đang dùng ko có trong thiết kế
    if (!this.subproject[this.currentDeviceShow + '_template_display']) {

      let timeout = setTimeout(() => {
        this.orderDisplay[this.currentDeviceShow].map((item) => {
          if (!deviceFound && this.subproject[item + '_template_display'] && this.subproject[item + '_template_display'] == true) {
            this.deviceDisplay = item;
            this.currentDeviceShow = item
            if (this.currentDeviceShow == 'desktop') {
              let zoom: any = (document.getElementById('preview_blank').clientWidth) / this.resolution[this.deviceDisplay + '_width'] * this.resolution.zoom;
              document.getElementById('preview_blank').style['zoom'] = zoom;
              document.getElementById('zoom-zone').style['zoom'] = '1';
              this.resolution.zoom = zoom;
              this.zoom_value = zoom
            }
            else {
              let zoom: any = 1;
              zoom = (this.resolution[this.currentDeviceShow + '_width'] / this.resolution[this.deviceDisplay + '_width']) * this.resolution.zoom.toString();
              document.getElementById('zoom-zone').style['zoom'] = zoom;
              this.zoom_value = zoom
              // this.resolution.zoom = zoom;
            }

            deviceFound = true;

            return;
          }
        })
        clearTimeout(timeout)
      }, 0);
    } else {

      let timeout = setTimeout(() => {
        this.deviceDisplay = this.currentDeviceShow
        localStorage.setItem('currentDeviceShow', this.currentDeviceShow)

        let zoom: any = (document.getElementById('preview_blank').clientWidth) / this.resolution[this.deviceDisplay + '_width'] * this.resolution.zoom;
        document.getElementById('preview_blank').style['zoom'] = zoom;
        this.resolution.zoom = zoom;
        document.getElementById('zoom-zone').style['zoom'] = '1';
        this.zoom_value = zoom
        clearTimeout(timeout)
        return;
      }, 0);
    }
  }


  /**
   * bắt sự kiện reisze window để chọn giao diện phù hợp hiển thị
   * @param event 
   */
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (document.getElementById('preview_blank') && document.getElementById('zoom-zone')) {
      if (this.platform.width() >= this.resolution.desktop_width)
        this.currentDeviceShow = 'desktop' // bắt web đang ở chế độ nào chuyền dữ liệu cho đúng
      if (this.platform.width() < this.resolution.desktop_width && this.platform.width() >= this.resolution.tablet_landscape_width)
        this.currentDeviceShow = 'tablet_landscape'
      if (this.platform.width() < this.resolution.tablet_landscape_width && this.platform.width() >= this.resolution.tablet_portrait_width)
        this.currentDeviceShow = 'tablet_portrait'
      if (this.platform.width() < this.resolution.tablet_portrait_width && this.platform.width() >= this.resolution.mobile_landscape_width)
        this.currentDeviceShow = 'mobile_landscape'
      if (this.platform.width() <= this.resolution.mobile_portrait_width)
        this.currentDeviceShow = 'mobile_portrait';

      this.handleGetDeviceValid().then((device) => {
        this.currentDeviceShow = device
        if (this.deviceDisplay != device) {
          this.deviceDisplay = device;
          this.getBlockPage();
        }
        let zoom: any = ((document.getElementById('preview_blank').clientWidth) / this.resolution[this.deviceDisplay + '_width']) * this.resolution.zoom;
        document.getElementById('preview_blank').style['zoom'] = zoom;

        this.resolution.zoom = zoom;
        document.getElementById('zoom-zone').style['zoom'] = '1';
        this.zoom_value = zoom
      })
    }
  }

  /**
   * gán lại thiết bị cần hiển thị hợp lý, vd: đang ở thiet bị tablet ngang nhưng ko thiết kế giao diện này sẽ hiển thị desktop
   * @returns string = 'desktop' | 'tablet_portrait' | 'mobile_portrait' ...
   */
  handleGetDeviceValid() {
    return new Promise((resolve) => {
      let deviceFound = false;
      // trường hợp ko có thiết kế giao diện cho thiết bị này
      if (!this.subproject[this.currentDeviceShow + '_template_display']) {
        // setTimeout(() => {
        // tìm thiết giao diện thiết bị phù hợp
        this.orderDisplay[this.currentDeviceShow].map((item) => {
          if (!deviceFound && this.subproject[item + '_template_display'] && this.subproject[item + '_template_display'] == true) {
            // this.deviceDisplay = item;
            deviceFound = true;
            resolve(item)
            return;
          }
        })
        // }, 0);

      } else {
        // this.deviceDisplay = this.currentDeviceShow;
        resolve(this.currentDeviceShow)
        return;

      }
    })

  }

  handleZoom() {
    let deviceFound = false;
    // đoạn này để xử lý thiết bị đang dùng ko có trong thiết kế
    if (!this.subproject[this.currentDeviceShow + '_template_display']) {

      let timeout = setTimeout(() => {
        this.orderDisplay[this.currentDeviceShow].map((item) => {
          if (!deviceFound && this.subproject[item + '_template_display'] && this.subproject[item + '_template_display'] == true) {
            if (item != this.deviceDisplay) {
              this.deviceDisplay = item;
              this.getBlockPage()
            }
            if (this.deviceDisplay == 'desktop') {
              let zoom: any = (document.getElementById('preview_blank').clientWidth) / this.resolution[this.deviceDisplay + '_width'] * this.resolution.zoom;
              document.getElementById('preview_blank').style['zoom'] = zoom;
              document.getElementById('zoom-zone').style['zoom'] = '1';
              this.zoom_value = zoom
              this.resolution.zoom = zoom;
            }
            else {
              let zoom: any = 1;
              zoom = (this.resolution[this.currentDeviceShow + '_width'] / this.resolution[this.deviceDisplay + '_width']) * this.resolution.zoom.toString();
              document.getElementById('zoom-zone').style['zoom'] = zoom;
              this.zoom_value = zoom
              // this.resolution.zoom = zoom;
            }

            deviceFound = true;

            return;
          }
        })
        clearTimeout(timeout)
      }, 0);
    } else {

      let timeout = setTimeout(() => {
        this.deviceDisplay = this.currentDeviceShow
        localStorage.setItem('currentDeviceShow', this.currentDeviceShow)

        let zoom: any = (document.getElementById('preview_blank').clientWidth) / this.resolution[this.deviceDisplay + '_width'] * this.resolution.zoom;
        document.getElementById('preview_blank').style['zoom'] = zoom;
        this.resolution.zoom = zoom;
        document.getElementById('zoom-zone').style['zoom'] = '1';
        this.zoom_value = zoom
        clearTimeout(timeout)
        return;
      }, 0);
    }
  }

  /**
   * mở popup hiển thị block quảng cáo/thông báo khi vừa tải xong trang nếu có thiết kế
   */
  openModal() {
    setTimeout(() => {
      this.matDialog.open(AtwBlockPopupHoverBlank, {
        data: {
          block_popup: this.block_popup_welcome,
          type: 'build',
          selectedDevice: this.deviceDisplay,
        },
        width:
          this.block_popup_welcome[
            this.deviceDisplay + '_position_'
          ].width + 'px',
        height:
          this.block_popup_welcome[
            this.deviceDisplay + '_position_'
          ].height + 'px',
        panelClass: 'popup',
        disableClose: this.block_popup_welcome?.staticdata?.disableCloseModal ?? false,
      });
    }, this.detailPage[this.deviceDisplay + '_config'].duration_hide_popup ?? 3000);
  }

  scrollTimeout: any;
  private lastScrollTop = 0;



  handleScroll(event: any) {
    /*console.log('event.target.scrollTop',1)
    // let isFullBlockRender: any = this.vhQueryAutoWeb.checkFullBocksOfPage_byScroll();
    // if (isFullBlockRender) return
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    this.scrollTimeout = setTimeout(() => {
      console.log('event.target.scrollTop', event.target.scrollTop)
      this.vhQueryAutoWeb.displayBocksOfPage_byScroll_toEnd(this, event.target.scrollTop, false);
      // Sau khi gọi, clone lại mảng blocks_of_page để đổi reference block và mảng
      this.blocks_of_page = this.detailPage.blocks
        .filter(block => !block[this.deviceDisplay + '_hidden'])
        .map(block => {
          if (block.objects && Array.isArray(block.objects)) {
            return { ...block, objects: [...block.objects] };
          }
          return block;
        });
      this.processConvert()
    }, 0);*/
  }


  public outputs = {
    // output nhận sự kiện 1 object vượt quá chiều dài được thiết kế
    // event : là biến dữ liệu truyền từ object gồm { data : dữ liệu object thay đổi, deltaHeight : chiều dài delta vượt quá thiết kế}
    hanldleProcessResizeOffset: (event) => {
      if (event.data.hidden) {
        this.blocks_of_page = this.blocks_of_page.filter(block => block._id != event.data._id)
        this.processConvert()
        this.changeDetectorRef.detectChanges()
        return
      }
      this.hanldleProcessResizeOffsetPage(event.data, event.deltaHeight, this.marginData, this.blocks_of_page)
    },
  }; // Biến dùng để nhận tất cả các output trong block nhận được


  hanldleProcessResizeOffset(event) {
    if (event.data.hidden) {
      this.blocks_of_page = this.blocks_of_page.filter(block => block._id != event.data._id)
      this.processConvert()
      this.changeDetectorRef.detectChanges()
      return
    }
    this.hanldleProcessResizeOffsetPage(event.data, event.deltaHeight, this.marginData, this.blocks_of_page)
  }

  /**
   * hàm xử lý chuyển đổi cách hiển thị bằng position với top và left thành margin
   */
  processConvert() {
    if (!this.deviceDisplay || !this.detailPage?._id) {
      console.warn('Thiếu dữ liệu để xử lý.');
      return;
    }

    // sort lại danh sách block theo position từ nhỏ tới lớn 
    this.blocks_of_page.sort((a: any, b: any) => {
      const aPosition = a?.[`${this.deviceDisplay}_position_${this.detailPage._id}`]?.top ?? 0;
      const bPosition = b?.[`${this.deviceDisplay}_position_${this.detailPage._id}`]?.top ?? 0;

      return aPosition - bPosition; // Sắp xếp tăng dần theo giá trị top
    });
    // danh sách margin của từng object trong block sau khi đã tính từ postion
    this.marginData = this.functionService.calculateObjects(this.blocks_of_page, this.deviceDisplay);
  }

  /**
   * hàm xử lý tính toán lại vị trí những objects cần dịch chuyển và những objects không bị ảnh hưởng
   */
  hanldleProcessResizeOffsetPage(object: any, deltaHeight: any, marginData: any, blocks: any) {
    let index = this.blocks_of_page.findIndex(block => block._id === object._id);
    if (index >= marginData.length) return;
    this.functionService.recursiveAdjustMargin(marginData, blocks, index, this.deviceDisplay, deltaHeight);
  }

  scanQR() {
    this.scanQRCode();
  }

  async scanQRCode() {
    try {
      // Kiểm tra xem camera có được hỗ trợ không
      const { supported } = await BarcodeScanner.isSupported();
      if (!supported) {
        alert('Camera không được hỗ trợ trên thiết bị này.');
        console.error('Camera không được hỗ trợ trên thiết bị này.');
        return;
      }

      // Yêu cầu quyền camera
      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera !== 'granted') {
        alert('Vui lòng cấp quyền truy cập camera để quét QR code.\n\nBạn có thể cấp quyền trong Cài đặt ứng dụng.');
        console.error('Quyền truy cập camera bị từ chối.');
        return;
      }

      // Mở camera để quét barcode
      const { barcodes } = await BarcodeScanner.scan();
      if (barcodes && barcodes.length > 0) {
        const scannedData = barcodes[0].rawValue;
        console.log('Dữ liệu QR code:', scannedData);
        // alert('Quét QR successfully: ' + scannedData);
        this.vhAuth.initializeBuildProject('vhdevweb', 'mongo', 'viethas', 'mongo', 'commercial', 'research', 240415, scannedData)
          .then(() => {
            console.log('hello initializeApp');

            this.vhQueryAutoWeb.localStorageSET('back_page_url', []);
            this.vhOTP.initializeProject('Youtube');
            this.syncData();
          })

        // Bạn có thể xử lý dữ liệu ở đây, ví dụ: điều hướng hoặc hiển thị
      } else {
        alert('Không tìm thấy QR code nào. Vui lòng thử lại.');
        console.log('Không tìm thấy barcode nào.');
      }
    } catch (error) {
      console.error('Lỗi khi quét QR code:', error);
      alert('Lỗi khi quét QR code: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}