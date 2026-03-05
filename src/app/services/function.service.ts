import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject } from 'rxjs';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class FunctionService {
  uploadedFile: File | undefined;
  city: any;
  province: any;
  district: any;

  animationConfigChanged = new Subject<string>();
/** Palette màu cho CKEDITOR */
colorPalette = [
  { color: 'hsl(0, 100%, 95%)', label: ' ' }, { color: 'hsl(0, 100%, 90%)', label: ' ' }, { color: 'hsl(0, 100%, 85%)', label: ' ' }, { color: 'hsl(0, 100%, 80%)', label: ' ' }, { color: 'hsl(0, 100%, 75%)', label: ' ' },{ color: 'hsl(0, 100%, 70%)', label: ' ' }, { color: 'hsl(0, 100%, 65%)', label: ' ' }, { color: 'hsl(0, 100%, 60%)', label: ' ' }, { color: 'hsl(0, 100%, 55%)', label: ' ' }, { color: 'hsl(0, 100%, 50%)', label: ' ' },{ color: 'hsl(0, 100%, 45%)', label: ' ' }, { color: 'hsl(0, 100%, 40%)', label: ' ' }, { color: 'hsl(0, 100%, 35%)', label: ' ' }, { color: 'hsl(0, 100%, 30%)', label: ' ' }, { color: 'hsl(0, 100%, 25%)', label: ' ' },{ color: 'hsl(0, 100%, 20%)', label: ' ' }, { color: 'hsl(0, 100%, 15%)', label: ' ' }, { color: 'hsl(0, 100%, 10%)', label: ' ' }, { color: 'hsl(0, 100%, 5%)', label: ' ' }, { color: 'hsl(0, 100%, 2%)', label: ' ' }, { color: 'hsl(120, 100%, 95%)', label: ' ' }, { color: 'hsl(120, 100%, 90%)', label: ' ' }, { color: 'hsl(120, 100%, 85%)', label: ' ' }, { color: 'hsl(120, 100%, 80%)', label: ' ' }, { color: 'hsl(120, 100%, 75%)', label: ' ' },{ color: 'hsl(120, 100%, 70%)', label: ' ' }, { color: 'hsl(120, 100%, 65%)', label: ' ' }, { color: 'hsl(120, 100%, 60%)', label: ' ' }, { color: 'hsl(120, 100%, 55%)', label: ' ' }, { color: 'hsl(120, 100%, 50%)', label: ' ' },{ color: 'hsl(120, 100%, 45%)', label: ' ' }, { color: 'hsl(120, 100%, 40%)', label: ' ' }, { color: 'hsl(120, 100%, 35%)', label: ' ' }, { color: 'hsl(120, 100%, 30%)', label: ' ' }, { color: 'hsl(120, 100%, 25%)', label: ' ' },{ color: 'hsl(120, 100%, 20%)', label: ' ' }, { color: 'hsl(120, 100%, 15%)', label: ' ' }, { color: 'hsl(120, 100%, 10%)', label: ' ' }, { color: 'hsl(120, 100%, 5%)', label: ' ' }, { color: 'hsl(120, 100%, 2%)', label: ' ' }, { color: 'hsl(240, 100%, 95%)', label: ' ' }, { color: 'hsl(240, 100%, 90%)', label: ' ' }, { color: 'hsl(240, 100%, 85%)', label: ' ' }, { color: 'hsl(240, 100%, 80%)', label: ' ' }, { color: 'hsl(240, 100%, 75%)', label: ' ' },{ color: 'hsl(240, 100%, 70%)', label: ' ' }, { color: 'hsl(240, 100%, 65%)', label: ' ' }, { color: 'hsl(240, 100%, 60%)', label: ' ' }, { color: 'hsl(240, 100%, 55%)', label: ' ' }, { color: 'hsl(240, 100%, 50%)', label: ' ' },{ color: 'hsl(240, 100%, 45%)', label: ' ' }, { color: 'hsl(240, 100%, 40%)', label: ' ' }, { color: 'hsl(240, 100%, 35%)', label: ' ' }, { color: 'hsl(240, 100%, 30%)', label: ' ' }, { color: 'hsl(240, 100%, 25%)', label: ' ' },{ color: 'hsl(240, 100%, 20%)', label: ' ' }, { color: 'hsl(240, 100%, 15%)', label: ' ' }, { color: 'hsl(240, 100%, 10%)', label: ' ' }, { color: 'hsl(240, 100%, 5%)', label: ' ' }, { color: 'hsl(240, 100%, 2%)', label: ' ' }, { color: 'hsl(60, 100%, 95%)', label: ' ' }, { color: 'hsl(60, 100%, 90%)', label: ' ' }, { color: 'hsl(60, 100%, 85%)', label: ' ' }, { color: 'hsl(60, 100%, 80%)', label: ' ' }, { color: 'hsl(60, 100%, 75%)', label: ' ' },{ color: 'hsl(60, 100%, 70%)', label: ' ' }, { color: 'hsl(60, 100%, 65%)', label: ' ' }, { color: 'hsl(60, 100%, 60%)', label: ' ' }, { color: 'hsl(60, 100%, 55%)', label: ' ' }, { color: 'hsl(60, 100%, 50%)', label: ' ' },{ color: 'hsl(60, 100%, 45%)', label: ' ' }, { color: 'hsl(60, 100%, 40%)', label: ' ' }, { color: 'hsl(60, 100%, 35%)', label: ' ' }, { color: 'hsl(60, 100%, 30%)', label: ' ' }, { color: 'hsl(60, 100%, 25%)', label: ' ' },{ color: 'hsl(60, 100%, 20%)', label: ' ' }, { color: 'hsl(60, 100%, 15%)', label: ' ' }, { color: 'hsl(60, 100%, 10%)', label: ' ' }, { color: 'hsl(60, 100%, 5%)', label: ' ' }, { color: 'hsl(60, 100%, 2%)', label: ' ' }, { color: 'hsl(30, 100%, 95%)', label: ' ' }, { color: 'hsl(30, 100%, 90%)', label: ' ' }, { color: 'hsl(30, 100%, 85%)', label: ' ' }, { color: 'hsl(30, 100%, 80%)', label: ' ' }, { color: 'hsl(30, 100%, 75%)', label: ' ' },{ color: 'hsl(30, 100%, 70%)', label: ' ' }, { color: 'hsl(30, 100%, 65%)', label: ' ' }, { color: 'hsl(30, 100%, 60%)', label: ' ' }, { color: 'hsl(30, 100%, 55%)', label: ' ' }, { color: 'hsl(30, 100%, 50%)', label: ' ' },{ color: 'hsl(30, 100%, 45%)', label: ' ' }, { color: 'hsl(30, 100%, 40%)', label: ' ' }, { color: 'hsl(30, 100%, 35%)', label: ' ' }, { color: 'hsl(30, 100%, 30%)', label: ' ' }, { color: 'hsl(30, 100%, 25%)', label: ' ' },{ color: 'hsl(30, 100%, 20%)', label: ' ' }, { color: 'hsl(30, 100%, 15%)', label: ' ' }, { color: 'hsl(30, 100%, 10%)', label: ' ' }, { color: 'hsl(30, 100%, 5%)', label: ' ' }, { color: 'hsl(30, 100%, 2%)', label: ' ' }, { color: 'hsl(330, 100%, 95%)', label: ' ' }, { color: 'hsl(330, 100%, 90%)', label: ' ' }, { color: 'hsl(330, 100%, 85%)', label: ' ' }, { color: 'hsl(330, 100%, 80%)', label: ' ' }, { color: 'hsl(330, 100%, 75%)', label: ' ' },{ color: 'hsl(330, 100%, 70%)', label: ' ' }, { color: 'hsl(330, 100%, 65%)', label: ' ' }, { color: 'hsl(330, 100%, 60%)', label: ' ' }, { color: 'hsl(330, 100%, 55%)', label: ' ' }, { color: 'hsl(330, 100%, 50%)', label: ' ' },{ color: 'hsl(330, 100%, 45%)', label: ' ' }, { color: 'hsl(330, 100%, 40%)', label: ' ' }, { color: 'hsl(330, 100%, 35%)', label: ' ' }, { color: 'hsl(330, 100%, 30%)', label: ' ' }, { color: 'hsl(330, 100%, 25%)', label: ' ' },{ color: 'hsl(330, 100%, 20%)', label: ' ' }, { color: 'hsl(330, 100%, 15%)', label: ' ' }, { color: 'hsl(330, 100%, 10%)', label: ' ' }, { color: 'hsl(330, 100%, 5%)', label: ' ' }, { color: 'hsl(330, 100%, 2%)', label: ' ' }, { color: 'hsl(270, 100%, 95%)', label: ' ' }, { color: 'hsl(270, 100%, 90%)', label: ' ' }, { color: 'hsl(270, 100%, 85%)', label: ' ' }, { color: 'hsl(270, 100%, 80%)', label: ' ' }, { color: 'hsl(270, 100%, 75%)', label: ' ' },{ color: 'hsl(270, 100%, 70%)', label: ' ' }, { color: 'hsl(270, 100%, 65%)', label: ' ' }, { color: 'hsl(270, 100%, 60%)', label: ' ' }, { color: 'hsl(270, 100%, 55%)', label: ' ' }, { color: 'hsl(270, 100%, 50%)', label: ' ' },{ color: 'hsl(270, 100%, 45%)', label: ' ' }, { color: 'hsl(270, 100%, 40%)', label: ' ' }, { color: 'hsl(270, 100%, 35%)', label: ' ' }, { color: 'hsl(270, 100%, 30%)', label: ' ' }, { color: 'hsl(270, 100%, 25%)', label: ' ' },{ color: 'hsl(270, 100%, 20%)', label: ' ' }, { color: 'hsl(270, 100%, 15%)', label: ' ' }, { color: 'hsl(270, 100%, 10%)', label: ' ' }, { color: 'hsl(270, 100%, 5%)', label: ' ' }, { color: 'hsl(270, 100%, 2%)', label: ' ' }, { color: 'hsl(0, 0%, 0%)', label: ' ' }, { color: 'hsl(0, 0%, 10%)', label: ' ' }, { color: 'hsl(0, 0%, 20%)', label: ' ' }, { color: 'hsl(0, 0%, 30%)', label: ' ' }, { color: 'hsl(0, 0%, 40%)', label: ' ' },{ color: 'hsl(0, 0%, 50%)', label: ' ' }, { color: 'hsl(0, 0%, 60%)', label: ' ' }, { color: 'hsl(0, 0%, 70%)', label: ' ' }, { color: 'hsl(0, 0%, 80%)', label: ' ' }, { color: 'hsl(0, 0%, 90%)', label: ' ' },{ color: 'hsl(0, 0%, 95%)', label: ' ' }, { color: 'hsl(0, 0%, 92%)', label: ' ' }, { color: 'hsl(0, 0%, 85%)', label: ' ' }, { color: 'hsl(0, 0%, 78%)', label: ' ' }, { color: 'hsl(0, 0%, 71%)', label: ' ' },{ color: 'hsl(0, 0%, 64%)', label: ' ' }, { color: 'hsl(0, 0%, 57%)', label: ' ' }, { color: 'hsl(0, 0%, 50%)', label: ' ' }, { color: 'hsl(0, 0%, 43%)', label: ' ' }, { color: 'hsl(0, 0%, 36%)', label: ' ' }, { color: 'hsl(0, 0%, 100%)', label: ' ' }, { color: 'hsl(0, 0%, 95%)', label: ' ' }, { color: 'hsl(0, 0%, 90%)', label: ' ' }, { color: 'hsl(0, 0%, 85%)', label: ' ' }, { color: 'hsl(0, 0%, 80%)', label: ' ' }, { color: 'hsl(0, 0%, 75%)', label: ' ' }, { color: 'hsl(0, 0%, 70%)', label: ' ' }, { color: 'hsl(0, 0%, 65%)', label: ' ' }, { color: 'hsl(0, 0%, 60%)', label: ' ' }, { color: 'hsl(0, 0%, 55%)', label: ' ' },{ color: 'hsl(0, 0%, 50%)', label: ' ' }, { color: 'hsl(0, 0%, 45%)', label: ' ' }, { color: 'hsl(0, 0%, 40%)', label: ' ' }, { color: 'hsl(0, 0%, 35%)', label: ' ' }, { color: 'hsl(0, 0%, 30%)', label: ' ' },{ color: 'hsl(0, 0%, 25%)', label: ' ' }, { color: 'hsl(0, 0%, 20%)', label: ' ' }, { color: 'hsl(0, 0%, 15%)', label: ' ' }, { color: 'hsl(0, 0%, 10%)', label: ' ' }, { color: 'hsl(0, 0%, 5%)', label: ' ' }, { color: 'hsl(30, 100%, 95%)', label: ' ' }, { color: 'hsl(30, 100%, 90%)', label: ' ' }, { color: 'hsl(30, 100%, 85%)', label: ' ' }, { color: 'hsl(30, 100%, 80%)', label: ' ' }, { color: 'hsl(30, 100%, 75%)', label: ' ' }, { color: 'hsl(30, 100%, 70%)', label: ' ' }, { color: 'hsl(30, 100%, 65%)', label: ' ' }, { color: 'hsl(30, 100%, 60%)', label: ' ' }, { color: 'hsl(30, 100%, 55%)', label: ' ' }, { color: 'hsl(30, 100%, 50%)', label: ' ' }, { color: 'hsl(30, 100%, 45%)', label: ' ' }, { color: 'hsl(30, 100%, 40%)', label: ' ' }, { color: 'hsl(30, 100%, 35%)', label: ' ' }, { color: 'hsl(30, 100%, 30%)', label: ' ' }, { color: 'hsl(30, 100%, 25%)', label: ' ' }, { color: 'hsl(30, 100%, 20%)', label: ' ' }, { color: 'hsl(30, 100%, 15%)', label: ' ' }, { color: 'hsl(30, 100%, 10%)', label: ' ' }, { color: 'hsl(30, 100%, 5%)', label: ' ' }, { color: 'hsl(30, 100%, 2%)', label: ' ' }
];
/** biến config ckeditor trong quản lý admin */
CKEDITORConfig: any = {
  toolbar: [
    'heading',
    '|',
    'alignment',
    '|',
    'bold',
    'italic',
    'strikethrough',
    'underline',
    'subscript',
    'superscript',
    '|',
    'link',
    '|',
    'bulletedList',
    'numberedList',
    'todoList',
    '-',
    'fontfamily',
    'fontsize',
    'fontColor',
    'fontBackgroundColor',
    '|',
    'code',
    'codeBlock',
    '|',
    'insertTable',
    '|',
    'outdent',
    'indent',
    '|',
    'blockQuote',
    '|',
    'undo',
    'redo',
    'uploadImage',
  ],
  fontSize: {
    options: [
      '10px',
      '12px',
      '14px',
      '16px',
      '18px',
      '20px',
      '22px',
    ],  
    supportAllValues: true, // Enable support for custom inline font sizes
  },
  fontColor: {
    columns: 10,
    documentColors: 200,
    colors: this.colorPalette
  },
  fontBackgroundColor: {
    columns: 10,
    documentColors: 200,
    colors: this.colorPalette
  },
};
  constructor(
    private datePipe: DatePipe,
    private titleService: Title,
    private metaTagService: Meta,
    private notification: NzNotificationService,
    private loadingCtrl: LoadingController,
    private message: NzMessageService
  ) { }

  formatDate(date) {
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
  /**
    * Active Loading
    * @param message
    * @param cssClass
    * @param spinner
    * @param duration
    * @param showBackdrop
    * @example
    * this.vhComponent.showLoading("", "transparent-loading", null, 0, false).then(() => action())
    */
  private loading: any;
  public showLoading(
    message: string,
    cssClass?: 'current-loading' | 'transparent-loading',
    spinner?:
      | 'bubbles'
      | 'circles'
      | 'circular'
      | 'crescent'
      | 'dots'
      | 'lines'
      | 'lines-small',
    duration: number = 0,
    showBackdrop: boolean = true,
    hideLoading?: number,
    mode?: 'ios' | 'md'
  ) {
    return new Promise((resolve) => {
      this.loading = setTimeout(
        () => this.loadingCtrl.dismiss(),
        hideLoading || 30000
      );
      const option: any = { message, showBackdrop, duration };

      if (spinner) option['spinner'] = spinner;
      option['cssClass'] = cssClass ? cssClass : 'current-loading';
      if (mode) option['mode'] = mode;
      else option['mode'] = 'ios';
      this.loadingCtrl.create(option).then((loading) => {
        loading.present().then(() => resolve('Loading'));
      });
    });
  }
  /**
   * Dismiss Loading
   * @param latency
   * @param data
   * @example
   * this.functionUIService.hideLoading(200)
   */
  public hideLoading(latency: number = 0, value: any = {}) {
    return new Promise((resolve, rejects) => {
      clearTimeout(this.loading);
      setTimeout(
        () =>
          this.loadingCtrl
            .dismiss(value)
            .then((res) => resolve(res))
            .catch((error) => {
              if (!this.loading) return;

              console.log(error);
            }),
        latency
      );
    }).catch(err => {
      console.log(err);
    });
  }


  /**
   * SEO
   * @param title
   * @param description
   * @param keywords
   */

  setSEO(title, description, keywords) {
    this.titleService.setTitle(title);
    this.metaTagService.addTags([
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'robots', content: 'index, follow' },
      { name: 'revisit - after', content: '1 days' },
      { name: 'content - language', content: 'vi' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'google', content: 'nositelinkssearchbox' },
      { charset: 'text/html; charset=utf-8' },
    ]);
  }

  initSEOFavicon(title, favIcon_img?, logo?, description?) {
    let favIcon: HTMLLinkElement = document.querySelector('#appIcon');
    favIcon.href = favIcon_img;
    if (title != '') this.titleService.setTitle(title);
    this.metaTagService.addTags([
      { property: 'og:image', itemprop: 'thumbnailUrl', content: logo },
      { name: 'robots', content: 'index, follow' },
      { name: 'revisit - after', content: '1 days' },
      { name: 'content - language', content: 'vi' },
      { name: 'description', content: description },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'google', content: 'nositelinkssearchbox' },
      { charset: 'text/html; charset=utf-8' },
    ]);
  }
  setFavicon(favIcon_img) {
    let favIcon: HTMLLinkElement = document.querySelector('#appIcon');
    favIcon.href = favIcon_img;
    this.metaTagService.addTags([
      { property: 'og:image', itemprop: 'thumbnailUrl', content: favIcon_img },
    ]);
  }

  createNotification(
    type: string,
    title?: string,
    duration: number = 2000
  ): void {
    this.notification.create(type, title, '', {
      nzStyle: {
        top: '100px',
        fontWeight: 'bold',
      },
      nzCloseIcon: '',
      nzDuration: duration,
    });
  }
  /**
   * createNotification
   * @param type: 'success' || 'error' || 'warning' || 'info'
   * @param content: "Có lỗi xảy ra, vui lòng thử lại"
   * @example
   * this.createMessage('error', "Có lỗi xảy ra, vui lòng thử lại" , 1200);
   */
  createMessage(type: 'success' | 'error' | 'warning' | 'info', content: string, duration: number = 2000): void {
    this.message.create(type, content, {
      nzDuration: duration,
    });
  }
  nonAccentVietnamese(str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // Huyền sắc hỏi ngã nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // Â, Ê, Ă, Ơ, Ư
    str = str.replace(/,|\+/g, '');
    return str.split(' ').join('-');
  }

  setUploadedFileURL(file) {
    this.uploadedFile = file;
  }

  getUploadedFileURL() {
    return this.uploadedFile;
  }



  /**
   * unsubscribe biến subscription và disconnect biến observer.
   *
   * @param _this đối tượng hiện tại
   */
  destroyAnimationVisible(_this) {
    if (_this.subscription) {
      _this.subscription.unsubscribe();
      _this.subscription = null;
    }
    if (_this.observer) {
      _this.observer.disconnect();
      _this.observer = undefined;
    }
  }

  /**
   * subscribe thay đổi của biến animationConfigChanged.
   *
   * @param _this đối tượng hiện tại
   * @param setAnimationVisible hàm gọi setAnimationVisible()
   */
  initAnimationVisible(_this, setAnimationVisible) {
    setAnimationVisible();

    if (_this.type != 'page') return;

    _this.subscription = _this.functionService.animationConfigChanged.subscribe((id: string) => {
      if (id == _this.data._id) {
        const animationType = _this.staticdata[_this.device + '_animation_type'];
        if (animationType == 'visible' && !_this.observer) {
          setAnimationVisible();
        }
        else if (_this.observer) {
          _this.observer.disconnect();
          _this.observer = undefined;
        }
      }
    });
  }

  /**
   * Set hiệu ứng xuất hiện (visible)
   *
   * *Lưu ý: có thể gọi ở ngOnInit và sau khi đã set this.staticdata (1 số frame/block/object có thể sẽ gọi sau khi load dữ liệu xong), phải khai báo public element: ElementRef ở constructor
   *
   * @param _this đối tượng hiện tại
   * @param targetObject object class sẽ set các thuộc tính
   * @param animationConfig tên bộ animation (VD: 'animation-0') (bộ này cùng cấp với id) chứa thuộc tính ['--0-animation-delay'], ['--0-animation'],...
   */
  setAnimationVisible(_this, targetObject, animationConfig) {
    if (!_this.data || !_this.staticdata) {
      return;
    }

    const animationType = _this.staticdata[_this.device + '_animation_type'];

    // Kiểm tra xem element đã render nếu render rồi thì thêm hiệu ứng animation khi xuất hiện
    if (animationType == 'visible') {
      // set mặc định sẽ ẩn để không bị chớp
      targetObject['opacity'] = '0';
      targetObject['visibility'] = 'hidden';

      _this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          // Kiểm tra nếu entry trong vùng có thể nhìn thấy (trong viewport)
          if (entry.isIntersecting) {
            const objectElement = document.querySelectorAll<HTMLElement>(`[id="${_this.data._id}"]`);

            // dùng settimeout tương đương delay cho lần animation đầu tiên (đã set ẩn khi mới xuất hiện lần đầu ở ngOnInit)
            const animationData = _this.staticdata[_this.device + '_animation'][animationConfig];
            const delay = animationData['--0-animation-delay'] || '0s';
            if (objectElement.length > 0) {
              setTimeout(() => {
                targetObject['opacity'] = '1';
                targetObject['visibility'] = 'visible';

                // reset animation
                objectElement.forEach(e => {
                  e.style.animation = 'none';
                  e.offsetHeight;
                  e.style.animation = animationData['--0-animation'];
                })
              }, parseFloat(delay) * 1000);
            }
          }
          else {
            targetObject['opacity'] = '0';
            targetObject['visibility'] = 'hidden';
          }
        });
      });

      // observing phần tử objectElement
      if (_this.element.nativeElement) _this.observer.observe(_this.element.nativeElement);
    }
  }


  setCity(item) {
    this.city = item;
  }
  getCity() {
    return this.city;
  }

  setProvince(item) {
    this.province = item;
  }

  getProvince() {
    return this.province;
  }

  setDistrict(item) {
    this.district = item
  }

  getDistrict() {
    return this.district;
  }

  freeblocks: any = []
  setFreeBlocks(freeblocks) {
    this.freeblocks = freeblocks
  }

  getFreeBLocks(){
    return this.freeblocks;
  }

}
