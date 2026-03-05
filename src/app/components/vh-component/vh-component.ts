import { Component, Injectable } from '@angular/core';
import { Router } from '@angular/router';
// import DomToImage from "dom-to-image";
// import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx'
import { ToastController, LoadingController, ModalController, AlertController, ActionSheetController, PickerController, Platform } from '@ionic/angular';
import { ModalOptions, ComponentProps, ComponentRef, AlertOptions, AlertInput, ActionSheetOptions, PickerOptions } from '@ionic/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LanguageService } from 'src/app/services/language.service';


export interface vhActionSheetButton {
  attribute: {
    text?: string;
    role?: 'cancel' | 'destructive' | 'selected';
    icon?: string;
    cssClass?: 'action-sheet-red' | 'action-sheet-black' | 'action-sheet-current';
  },
  value: any
}


@Injectable({
  providedIn: 'root'
})

export class VhComponent {
  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private pickerCtrl: PickerController,
    private platform: Platform,
    // private barcodeScanner: BarcodeScanner,
    private socialSharing: SocialSharing,
    private router: Router,
    private message: NzMessageService,
    private languageService: LanguageService,
  ) { }




  /**
  * Copy giá trị
  * @param value 
  * @param message
  * @example
  * this.copyValue.("HELLO WORLD")
  */
  public copyValue(value) {
    navigator.clipboard.writeText(value);
    this.message.create('success', this.languageService.translate("Copied"));
  }
  /**
   * show message
   * @param type : 'success', 'error', 'warning'
   * @param content
   * @param duration default 1500
   * @example
   * this.alertMessageDesktop.("success",HELLO WORLD )
   */
   alertMessageDesktop(type, content, duration?) {
    this.message.create(type, content, duration)
  }


  /**
   * Thông báo
   * @param duration 
   * @param message
   * @param cssClass (default: "current-toast")
   * @example
   * this.functionUIService.showToast(2000,"HELLO WORLD", "success-toast")
      .then((toast => {
        toast.onWillDismiss().then(() => console.log('onWillDismiss'))
        toast.onDidDismiss().then(() => console.log('onDidDismiss'))
      }));
   */
  public showToast(
    duration: number,
    message: string,
    cssClass: "alert-toast" | "success-toast" | "current-toast" = "current-toast"
  ) {
    return new Promise<HTMLIonToastElement>(resolve => {
      this.toastCtrl.getTop().then(res => {
        if (res) {
          this.toastCtrl.dismiss()
        }
      }).then(() => {
        this.toastCtrl.create({ mode: "ios", duration, message, cssClass })
          .then(toast => { toast.present(), resolve(toast) })
      })

    })
  }
  /**
   * Show alert confirm
   * @param header 
   * @param subHeader 
   * @param message 
   * @param textSuccess 
   * @param textCancel 
   * @example
   * this.vhComponent
      .alertConfirm("",
        this.languageService.translate("Delete customer?"),
        this.item.name, "OK",
        this.languageService.translate("Cancel"))
      .then(ok => {
        console.log(ok)
      }, cancel => {
        console.log(cancel)
      })
   */
  public alertConfirm(header: string, subHeader: string, message: string, textSuccess: string = 'OK', textCancel: string = "Cancel", backdropDismiss: boolean = false) {
    return new Promise<any>((resolve, rejects) => {
      const option: AlertOptions = {
        header, subHeader, message, backdropDismiss, id: 'vh-alert',
        buttons: [
          {
            text: textCancel,
            role: 'cancel',
            handler: () => rejects('Cancel')
          },
          {
            text: textSuccess,
            handler: () => resolve('OK')
          }
        ]
      }
      this.alertCtrl.getTop().then(res => {
        if (res) this.alertCtrl.dismiss()
        else
          this.alertCtrl.create(option).then(alert => {
            alert.present()
          })
      })
    })
  }
  /**
   * Show alert message
   * @param header 
   * @param subHeader 
   * @param message 
   * @param textSuccess 
   * @param backdropDismiss 
   * @example 
   * this.vhComponent.alertMessage("Hello", "hello", "Hello world")
      .then(ok => console.log(ok))
   */
  public alertMessage(header: string, subHeader: string, message: string, textSuccess: string = 'OK', backdropDismiss: boolean = false) {
    return new Promise<any>((resolve) => {
      const option: AlertOptions = {
        header, subHeader, message, backdropDismiss, id: 'vh-alert',
        buttons: [
          {
            text: textSuccess,
            handler: () => resolve('OK')
          }
        ]
      }
      this.alertCtrl.getTop().then(res => {
        if (res) this.alertCtrl.dismiss()
        else
          this.alertCtrl.create(option).then(alert => {
            alert.present()
          })
      })
    })
  }
  /**
   * 
   * @param header 
   * @param subHeader 
   * @param textSuccess 
   * @param textCancel 
   * @param inputs 
   * @param backdropDismiss 
   * @param cssClass 
   * @example
   * this.vhComponent.alertInputRadioCheckbox("Hello", "Nhap vao input", "OK", "Cancel",
      [
        {
          name: "Name", type: 'text', placeholder: 'Input text'
        },
        {
          name: "CHECKBOX", type: 'checkbox', label: "CHECKBOX", value: 'CHECKBOX1', checked: true
        },
        {
          name: "radio", type: 'radio', label: "RADIO", value: 'radio1', checked: true
        },
        {
          name: "tel", type: 'tel', placeholder: 'Telephone'
        },
        {
          name: "Number", type: 'number', placeholder: 'Number'
        },
        {
          name: "TextArea", type: 'textarea', placeholder: 'TEXTAREA', attributes: { inputmode: 'decimal' }
        }
      ]).then(value => {
        console.log(value)
      }, err => {
        console.log(err)
      })
   */
  public alertInputRadioCheckbox(
    header: string,
    subHeader: string,
    textSuccess: string = 'OK',
    textCancel: string = "Cancel",
    inputs: AlertInput[],
    backdropDismiss: boolean = false,
    cssClass: string = null) {
    return new Promise<any>((resolve, rejects) => {
      const option: AlertOptions = {
        header, subHeader, inputs, backdropDismiss, id: 'vh-alert', cssClass: 'alert-input',
        buttons: [
          {
            text: textCancel,
            role: 'cancel',
            handler: () => rejects({ role: 'cancel' })
          },
          {
            text: textSuccess,
            handler: (value) => resolve({ role: 'Success', value })
          }
        ]
      }
      if (cssClass) option['cssClass'] = ['alert-input', cssClass]

      this.alertCtrl.getTop().then(res => {
        if (res) this.alertCtrl.dismiss()
        else
          this.alertCtrl.create(option).then(alert => {
            alert.present()
          })
      })
    })
  }
  /**
   * 
   * @param header 
   * @param subHeader 
   * @param textSuccess 
   * @param textCancel 
   * @param inputs 
   * @param backdropDismiss 
   * @param initCleaveJS 
   * @param cssClass 
   * @example 
   * this.vhComponent.alertInputMoney(
      this.languageService.translate("Edit"), detail.name, this.languageService.translate("Save"), this.languageService.translate('Cancel'),
      [
        {
          name: "price", type: 'tel', placeholder: this.languageService.translate('Purchase price'), value: detail.price, cssClass: "purchase-price", id: "purchase-price",
          attributes: {
            onBlur: () => {
              let regExpPrice: RegExp = /(^[0?=[.]] |^[^.,-][,0-9]*)(([.](?=[0-9]){1}[0-9]{0,5})|)/;
              let price = document.getElementById('purchase-price')['value']
              if (!regExpPrice.test(price)) {
                document.getElementById('purchase-price')['value'] = detail.price_origin;
                this.cleaveJS("purchase-price")
              }
            }
          }
        },
        {
          name: "quantity", type: 'number', placeholder: this.languageService.translate('Quantity'), value: detail.quantity, cssClass: "purchase-quantity", id: "purchase-quantity",
          attributes: {
            onKeyUp: () => {
              setTimeout(() => {
                let number: string = document.getElementById('purchase-quantity')['value']
                if (parseFloat(number) < 1 || !number.length) document.getElementById('purchase-quantity')['value'] = 1
              }, 200)
            }
          }
        }
      ], false, () => { this.cleaveJS("purchase-price") }
    ).then(result => {
      detail['quantity'] = result['value'].quantity.length ? parseFloat(result['value'].quantity) : 1
      detail['price'] = parseFloat(this.purchasePrice.getRawValue())
    }, () => { })
   */
  public alertInputMoney(
    header: string,
    subHeader: string,
    textSuccess: string = 'OK',
    textCancel: string = "Cancel",
    inputs: AlertInput[],
    backdropDismiss: boolean = false,
    initCleaveJS,
    cssClass: string = null) {
    return new Promise<any>((resolve, rejects) => {
      const option: AlertOptions = {
        header, subHeader, inputs, backdropDismiss, id: 'vh-alert', cssClass: 'alert-input',
        buttons: [
          {
            text: textCancel,
            role: 'cancel',
            handler: () => rejects({ role: 'cancel' })
          },
          {
            text: textSuccess,
            handler: (value) => resolve({ role: 'Success', value })
          }
        ]
      }
      if (cssClass) option['cssClass'] = ['alert-input', cssClass]

      this.alertCtrl.getTop().then(res => {
        if (res) this.alertCtrl.dismiss()
        else
          this.alertCtrl.create(option).then(alert => {
            alert.present()
            initCleaveJS()
          })
      })
    })
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
    cssClass?: "current-loading" | "transparent-loading",
    spinner?: "bubbles" | "circles" | "circular" | "crescent" | "dots" | "lines" | "lines-small",
    duration: number = 0,
    showBackdrop: boolean = true
  ) {
    return new Promise((resolve) => {
      this.loading = setTimeout(() => this.loadingCtrl.dismiss(), 30000)
      const option: any = { message, showBackdrop, duration }

      if (spinner) option['spinner'] = spinner;
      option['cssClass'] = cssClass ? cssClass : "current-loading";

      this.loadingCtrl.create(option).then(loading => {
        loading.present().then(() => resolve('Loading'));
      })
    })
  }
  /**
   * Dismiss Loading
   * @param latency 
   * @param data 
   * @example
   * this.functionUIService.hideLoading(200)
   */
  public hideLoading(latency: number = 0, value: any = {}) {
    return new Promise((resolve) => {
      clearTimeout(this.loading)
      setTimeout(() => this.loadingCtrl.dismiss(value).then(res => resolve(res)), latency)
    })
  }
  private _BACK_BTN: any[] = []
  /**
   * Show modal
   * @param component 
   * @param componentProps 
   * @param backdropDismiss 
   * @param swipeToClose: Android no support
   * @param cssClass 'modal-transparent' | string
   * @example
   * this.functionUIService.showModal(SearchProductsComponent, { a: 13 }, true, true)
      .then(modal => {
        modal.onWillDismiss().then(dataReturn => console.log(dataReturn))
        modal.onDidDismiss().then(dataReturn => console.log(dataReturn))
      })
   */

  public showModal(
    component: ComponentRef,
    componentProps: ComponentProps<ComponentRef>,
    backdropDismiss: boolean = false,
    swipeToClose: boolean = false,
    cssClass?: string | string[] | 'modal-transparent' | 'modal-print',
    showBackdrop: boolean = true) {
    return new Promise<HTMLIonModalElement>(resolve => {
      const options: ModalOptions = {
        backdropDismiss,
        showBackdrop,
        component,
        componentProps
      }

      if (swipeToClose) options['swipeToClose'] = swipeToClose
      if (cssClass) options['cssClass'] = cssClass
      this.modalCtrl.create(options).then(modal => {
        modal.present().then(() => {
          this._BACK_BTN.push(this.activeAndroidBackButton(this.router.url, () => {
            this.hideModal();
          }, 2))
        });
        resolve(modal)
      })
    })
  }
  /**
   * Hide modal
   * @param data 
   * @param latency 
   * @example
   * this.functionUIService.hideModal("21324234", 200)
   */
  public hideModal(data: any = null, latency: number = 0) {
    if (this._BACK_BTN.length) {
      this.dismissAndroidBackButton(this.router.url, this._BACK_BTN[this._BACK_BTN.length - 1])
      this._BACK_BTN.pop()
    }
    setTimeout(() => this.modalCtrl.dismiss(data), latency)
  }
  /**
   * ActionSheet button
   * @param header 
   * @param buttons 
   * @example
   * this.vhComponent.actionSheet("", "", [
    { attribute: { text: "Delete", icon: "trash", cssClass: 'action-sheet-red' }, value: () => this.deleteBill(124345) },
    { attribute: { text: "Success", role: "selected", cssClass: 'action-sheet-current' }, value: 2 },
  ]).then(action => action())
  
  deleteBill(res) {
    console.log(res)
  }
   */
  public actionSheet(header: string, subHeader: string, buttons: vhActionSheetButton[], backdropDismiss: boolean = true) {
    return new Promise<any>((resolve) => {
      const options: ActionSheetOptions = {
        backdropDismiss, id: 'vh-action-sheet',
        buttons: buttons.map(item => {
          return {
            ...item.attribute,
            handler: () => resolve(item.value)
          }
        })
      }

      if (header.length) options['header'] = header
      if (subHeader.length) options['subHeader'] = subHeader
      this.actionSheetCtrl.getTop().then(res => {
        if (res) this.actionSheetCtrl.dismiss()
        else this.actionSheetCtrl.create(options).then(actionSheet => actionSheet.present())
      })
    })
  }

  /**
   * Picker popup
   * @example
   *  this.vhComponent.picker("OK", "Hủy",
      "Col1", [{ text: 'test1', value: 1 }, { text: 'test2', value: 2 }, { text: 'test3', value: 3 }], 1,
      "Col2", [{ text: 'test1', value: 1 }, { text: 'test2', value: 2 }, { text: 'test3', value: 3 }], 2,
      "Col3", [{ text: 'test1', value: 1 }, { text: 'test2', value: 2 }, { text: 'test3', value: 3 }], 2
    ).then(res => console.log(res), cancel => console.log(cancel))
   */
  public picker(textSuccess: string = "OK", textCancel: string = "Cancel",
    colName1: string, colOption1: { text: string, value: any }[], selectedCol1Index: number = 0,
    colName2?: string, colOption2?: { text: string, value: any }[], selectedCol2Index: number = 0,
    colName3?: string, colOption3?: { text: string, value: any }[], selectedCol3Index: number = 0,
  ) {
    return new Promise((resolve, rejects) => {
      const options: PickerOptions = {
        id: 'vh-picker',
        columns: [{ name: colName1, options: colOption1, selectedIndex: selectedCol1Index }],
        buttons: [
          {
            text: textCancel,
            role: 'cancel',
            handler: () => rejects({ role: "cancel" })
          },
          {
            text: textSuccess,
            handler: (val) => resolve(val)
          }
        ]
      }
      if (colName2 && colOption2) options['columns'].push({ name: colName2, options: colOption2, selectedIndex: selectedCol2Index })
      if (colName3 && colOption3) options['columns'].push({ name: colName3, options: colOption3, selectedIndex: selectedCol3Index })

      this.pickerCtrl.getTop().then(res => {
        if (res) this.pickerCtrl.dismiss()
        else this.pickerCtrl.create(options).then(picker => picker.present())
      })
    })
  }
  /**Kích hoạt sự kiện back button trên android
   * @param path: đường dẫn url
   * @param action: hàm thực hiện
   * @example
   * ionViewDidEnter() {
    this.backButton = this.vhComponent.activeAndroidBackButton('mobile/management/invoice/purchase/cart', this.goToListInvoice)
  }
   */
  public activeAndroidBackButton(path: string, action?, priority: number = 1) {
    if (this.platform.platforms().includes("android") && this.router.url.includes(path)) {
      return this.platform.backButton.subscribeWithPriority(
        priority, () => action())
    }
    else return null
  }
  /**Vô hiệu hóa sự kiện back button trên android 
   * @param path: đường dẫn url
   * @param variable: biến lưu trữ sự kiện backButton
   * @example
   * ionViewWillLeave() {
    this.vhComponent.dismissAndroidBackButton('mobile/management/invoice/purchase/cart', this.backButton)
  }
  */
  public dismissAndroidBackButton(path, variable: any) {
    if (this.platform.platforms().includes("android")) variable.unsubscribe();
  }
  /** Quét mã vạch và QR 
   * @param textVisible: Văn bản hiểm thị
   * @example
   * this.vhComponent.barcodeQrScan("Quét  một barcode nào đó").then((value) => {
      alert(value)
    }, () => { })
  */
  // public barcodeQrScan(textVisible: string = "") {
  //   return new Promise((resolve, rejects) => {
  //     this.barcodeScanner.scan({
  //       orientation: "portrait",
  //       resultDisplayDuration: 10,
  //       prompt: textVisible
  //     }).then((barcodeQr) => {
  //       if (!barcodeQr.cancelled) resolve(barcodeQr.text)
  //       else rejects("cancel")
  //     })
  //   })
  // }

  // public downloadImg(id_element: string, name: string) {
  //   return new Promise((resolve) => {
  //     let img = document.getElementById(id_element);
  //     /// png
  //     DomToImage.toPng(img, { bgcolor: '#ffffff' }).then((dataUrl: string) => {
  //       if (this.platform.is("desktop") || this.platform.is("mobileweb")) {
  //         let link = document.createElement('a');
  //         link.download = name + '.jpeg';
  //         link.href = dataUrl;
  //         link.click();
  //         resolve("downloading")
  //       } else
  //         this.socialSharing.share(name, name, dataUrl, null)
  //           .then(() => resolve('Sharing')).catch(() => resolve('Share fail'));
  //     }).catch(err => resolve('Fail'))
  //   })
  // }

  /**
   * 
   * @param mode 
   * @param date 
   * @param textSuccess 
   * @param textCancel 
   * @example
   * 
      .then((date) => alert(date.value))
   */
  // public datePicker(mode: 'time' | 'date' | 'dateAndTime', date: string, textSuccess: string = "OK", textCancel: string = "Cancel", format: string = null,
  //   theme: 'light' | 'dark' | 'legacyLight' | 'legacyDark' = "light", min: string = null, max: string = null) {
  //   return DatePicker
  //     .present({
  //       format, mode, theme, date, min, max, doneText: textSuccess, cancelText: textCancel, is24h: true, mergedDateAndTime: true, buttonFontColor: 'var(--ion-color-vh-green)'
  //     })
  // }
}