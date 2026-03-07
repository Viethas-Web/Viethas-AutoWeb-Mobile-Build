
import { Component, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { VhAuth, VhQueryAutoWeb, VhAlgorithm, VhOTP } from 'vhautowebdb';
import { LanguageService } from './services/language.service';
import { NavigationError, Router, Event } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private vhAuth: VhAuth,
    private vhAlgorithm: VhAlgorithm,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private router: Router,
    private vhOTP: VhOTP,
    private translateService: TranslateService,
    private languageService: LanguageService,
  ) {
      // this.initializeApp(localStorage.getItem('id_subproject') as string);
    this.setDefaultCurrency();
  }

  is_database = true;

  ngOnInit() {
    this.selectLang('vi')
    if (localStorage.getItem('id_subproject')) {
      this.is_database = true;
      this.initializeApp(localStorage.getItem('id_subproject') as string);
    }
    else{
      this.is_database = false;
    }
      // this.initializeApp(localStorage.getItem('id_subproject') as string);
  }

  /**Khởi tạo app */
  private initializeApp(id_subproject: string = '664483e744da7a03b4d5e1a2') {
    this.vhAuth.initializeBuildProject('vhdevweb', 'mongo', 'viethas', 'mongo', 'commercial', 'research', 240415, id_subproject)
      .then(() => {
        console.log('hello initializeApp');

        this.router.events.subscribe((event: Event) => {
          if (event instanceof NavigationError) {
            console.warn('Route not found:', event.url);
            if (event.error?.message.includes('Cannot match any routes')) {
              console.warn('Route not found:', event.url);
              this.router.navigate(['/page-not-found']);
            }
            else  this.router.navigate(['/']);
          }
        });
        this.vhQueryAutoWeb.localStorageSET('back_page_url', []);
        this.vhOTP.initializeProject('Youtube');
      })
  }

  /**Set default currency */
  private setDefaultCurrency() {
    if (!localStorage.getItem('vhsales_currencyFormat')) {
      localStorage.setItem(
        'vhsales_currencyFormat',
        JSON.stringify({
          symbol: { text: '₫', value: 295 },
          position: { text: '1 ' + 'VND', value: 1 },
          digitDecimal: { text: '0', value: 0 },
          digitGroup: { text: '123456', value: 0 },
        })
      );
    }
  }
  /**
   * thiết lập lại ngôn ngữ hiển thị trên app
   * @param value biến giá trị language đã chọn
   * @example this.selectLang('vi')
   */
  public selectLang(value: string) {
    localStorage.setItem("vh-autoweb-language", value)
    this.translateService.use(value)
    this.languageService.switchLanguage(value)
  }

  scanQR(){
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
        localStorage.setItem('id_subproject', scannedData as string);
        // alert('Quét QR successfully: ' + scannedData);
         this.initializeApp(scannedData as string);
         this.is_database = true;
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
