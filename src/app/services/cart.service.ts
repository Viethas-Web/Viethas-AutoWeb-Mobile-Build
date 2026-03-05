import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VhQueryAutoWeb } from 'vhautowebdb';
@Injectable({
  providedIn: 'root',
})
export class CartService {
  public listProductInCart: any[] = [];
  public totalCart: number = 0;
  constructor(
    private translateService: TranslateService,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private notification: NzNotificationService,
    private router: Router,
  ) { }

  /**
   * createNotification
   * @param type: 'success' || 'error' || 'warning' || 'info'
   * @param title: "Có lỗi xảy ra, vui lòng thử lại"
   * @param duration: 1200
   * @example
   * this.createNotification('error', "Có lỗi xảy ra, vui lòng thử lại" , 1200);
   */
  createNotification(type: string, title?: string, duration?: number): void {
    this.notification.create(type, title, '', {
      nzStyle: {
        top: '100px',
        fontWeight: 'bold',
      },
      nzCloseIcon: '',
      nzDuration: duration,
    });
  }

  //-----------------------------------------Cart to DB----------------------------------------------//
  /**
   * addCartToDB(item): thêm sản phẩm vào giỏ hàng
   * @param item
   * @notice item là thông tin sản phẩm được thêm vào giỏ hàng
   * @notice truyền item kèm theo số lượng khách chọn
   */
  addCartToDB(item) {
    let isLogin = this.vhQueryAutoWeb.checkSigninEndUser()
    if (isLogin) {
      let index = this.getCart().findIndex((detail) => detail['id_product'] === item['_id']);
      if (index != -1) {
        let quantity = this.getCart()[index]['quantity'] + item['quantity'];
        let data = { ...this.getCart()[index] };
        data.quantity = quantity;
        this.updateCart(this.getCart()[index]['_id'], data, 'add');
      } else {
        let bill_detail: any = {
          id_customer: this.vhQueryAutoWeb.getlocalEndUser()._id,
          id_product: item._id,
          quantity: item.quantity,
          ptype: item.type,
          price: item.price,
          webapp_payment_payment_chose: true,
          price_origin: item.webapp_price_sales > item.price ? item.webapp_price_sales : item.price,
          id_category: item.id_category,
        };
        this.createBill_detail(item, bill_detail)
      }

    } else {
      this.createNotification('warning', 'Vui lòng đăng nhập để mua hàng', 1200);
    }

  }

  createBill_detail(item, bill_detail) {
    // console.log('bill_detail', bill_detail);
    this.vhQueryAutoWeb.createBill_Detail_35(bill_detail).then(
      (response: any) => {
        console.log('createBill_Detail_35', response);
        if (response.vcode === 0) {
          // this.getCartFromDB();
          this.createNotification('success', `Bạn đã thêm ${item.name} vào giỏ hàng thành công !!!`, 1200);
          let bill_details = this.getCart();
          bill_details.push({
            ...bill_detail,
            name: item.name,
            units: item.units,
            imgs: item.imgs,
            _id: response.data._id
          })
          // console.log(bill_details);

          this.setCartLocal(bill_details);
          console.log(this.getCart());

        }
      },
      (error) => {
        this.createNotification('error', 'Có lỗi xảy ra, vui lòng thử lại', 1200);
      }
    );
  }

  getCartFromDB(): any {
    return new Promise((resolve, rejects) => {
      this.vhQueryAutoWeb.getBill_detailsByFields({ bill_type: { $eq: 35 }, id_customer: { $eq: this.vhQueryAutoWeb.getlocalEndUser()._id },  }, {}, {})
        .then((response: any) => {
          if (response.vcode === 0) {
            let bill_details = response.data;
            if (bill_details.length) {
              for (let i in bill_details) {
                let id = bill_details[i].id_subproduct ? bill_details[i].id_subproduct : bill_details[i].id_product;
                this.vhQueryAutoWeb.getDetailProduct(id)
                  .then((product: any) => {
                    console.log(product);
                    
                    if (product.data) {
                      let name: string;
                      if (bill_details[i].units) {
                        name = product.data.name + ` (${bill_details[i].units.find(item => item.ratio == bill_details[i].ratio).unit})`;
                      } else {
                        name = product.data.name
                      }
                      bill_details[i].name = name
                      bill_details[i].link = product.data.link
                      bill_details[i].imgs = product.data.imgs
                    }
                    this.setCartLocal(bill_details);
                  },
                    (error) => {
                      this.createNotification('error', 'Có lỗi xảy ra, vui lòng thử lại', 1200);
                      localStorage.clear()
                      location.reload();
                    }
                  );
              }
            } else {
              this.setCartLocal([]);
            }
            resolve(true)
          }
        },
          (error) => {
            console.log('error', error);
            this.createNotification(
              'error',
              'Có lỗi xảy ra, vui lòng thử lại',
              1200
            );
            rejects(false)
          }
        );
    })
  }
  setCartLocal(value): any {
    localStorage.setItem('cart', JSON.stringify(value));
  }

  //-----------------------------------------Local data----------------------------------------------//

  /**
   * getCart()
   * this.dataCart = this.getCart()
   */
  listCart: any = [];
  getCart(): any[] {
    let data = JSON.parse(localStorage.getItem('cart'));
    if (data) {
      return data;
    } else return [];
  }
  /**
   * setLocalCart(): thêm bill_detail vào local
   * @param value
   * let value = {
   *  name : "Iphone 12",
   *  price: 200000
   *  }
   *  this.setLocalCart(value)
   */
  setLocalCart(value) {
    let data = JSON.parse(localStorage.getItem('cart'));
    if (!data) {
      localStorage.setItem('cart', JSON.stringify([value]));
    } else {
      data.push(value);
      localStorage.setItem('cart', JSON.stringify(data));
    }
  }

  /**
   * deleteCart()
   * @param id
   *  this.deleteCart(id)
   */
  deleteCart(id) {
    return new Promise((resolve, rejects) => {
      this.vhQueryAutoWeb.deleteBill_Detail(id).then(
        (response: any) => {
          if (response.vcode === 0) {
            let data = JSON.parse(localStorage.getItem('cart'));
            for (let i = 0; i < data.length; i++) {
              if (data[i]._id == id) {
                data.splice(i, 1);
              }
            }
            localStorage.setItem('cart', JSON.stringify(data));
            resolve(true)
          }
        },
        (error) => {
          rejects(error)
          this.createNotification('', 'Có lỗi xảy ra, vui lòng thử lại', 1200);
        }
      );
    })
  }
  /**
   * updateCart()
   * @param id
   * @param value
   *  this.updateCart(id, value)
   */
  updateCart(id, value, type?) {
    let bill_detail: any = {
      id_customer: this.vhQueryAutoWeb.getlocalEndUser()._id,
      id_product: value.id_product,
      quantity: value.quantity,
      ptype: value.type,
      price: value.price,
      webapp_payment_payment_chose: value.webapp_payment_payment_chose,
      price_origin: value.webapp_price_sales,
      id_category: value.id_category,
    };
    this.vhQueryAutoWeb.updateBill_detail(id, bill_detail).then(
      (response: any) => {
        if (response.vcode === 0) {
          let data = JSON.parse(localStorage.getItem('cart'));
          for (let i = 0; i < data.length; i++) {
            if (data[i]._id == id) {
              data[i] = value;
            }
          }
          localStorage.setItem('cart', JSON.stringify(data));
          if (type == 'add') this.createNotification('success', `Bạn đã thêm ${value.name} vào giỏ hàng thành công !!!`, 1200)
          console.log(this.getCart());
        } else {
          alert('Có lỗi xảy ra, vui lòng thử lại');
          localStorage.clear()
          location.reload();
        }
      },
      (error) => {
        alert('Có lỗi xảy ra, vui lòng thử lại');
        localStorage.clear()
        location.reload();
      }
    );
  }

  /**
   *  hàm này trả về tổng của sản phẩm, khi khách đặt hàng
   * @return total
   */
  public getTotal(): number {
    let total = this.getCart().reduce((prev, next) => {
      let sub = prev + next.quantity * next.price;

      this.totalCart = sub;
      return sub;
    }, 0);
    return total;
  }
  /**
   *  hàm này trả về tổng của sản phẩm, khi khách đặt hàng
   * @return total
   */
  public getTotalToPayment(): number {
    let total = this.getCart()
      .filter((item) => item.webapp_payment_payment_chose == true)
      .reduce((prev, next) => {
        let sub = prev + next.quantity * next.price;

        this.totalCart = sub;
        return sub;
      }, 0);
    return total;
  }

  /**
   *  hàm này thực hiện đặt hàng
   * @param value thông tin của blll: id_branch, ghi chú
   */
  public payment(value): any {
    let isLogin = this.vhQueryAutoWeb.checkSigninEndUser()
    if (isLogin) {
      let details = this.getCart().filter(item => item.webapp_payment_payment_chose == true) // lấy dữ liệu giỏ hang trong local vô
      if (details.length == 0) {
        this.createBillFromDB(value)
      } else {
        this.createBillFromLocal(value, details)
      }
    } else {
      this.createNotification('warning', 'Vui lòng đăng nhập để mua hàng', 1200);
    }

  }
  /**
    *  hàm tạo lên db, get lại dữ liệu từ db
    */
  createBillFromDB(value) {
    this.vhQueryAutoWeb
      .getBill_detailsByFields({ bill_type: { $eq: 35 }, webapp_payment_payment_chose: { $eq: true }, id_customer: { $eq: this.vhQueryAutoWeb.getlocalEndUser()._id }, }, {}, {})
      .then((response: any) => {
        if (response.vcode === 0) {
          let bill_details = response.data;
          if (bill_details.length != 0) {
            let total = bill_details.reduce((prev, next) => { return prev + next.quantity * next.price }, 0);
            let bill = {
              id_customer: this.vhQueryAutoWeb.getlocalEndUser()._id,
              id_branch: value.id_branch,
              tax: 0,
              fee: 0,
              note: value.note,
              total: total,
              payment: total
            }
            this.vhQueryAutoWeb.createBill_Billdetail_36(bill, bill_details).then(
              (bill: any) => {
                for (let i in bill_details) {
                  this.removeLocalPaymentChose(bill_details[i]._id)
                }
                this.createNotification('success', 'Đặt hàng thành công', 2000);
              },
              (error: any) => {
                this.createNotification('error', 'Có lỗi xảy ra, vui lòng thử lại', 1200);
                console.log('error ', error);
              });
          } else {
            this.createNotification('warning', 'Đặt hàng không thành công', 1200);
          }
        }
      },
        (error) => {
          this.createNotification('error', 'Có lỗi xảy ra, vui lòng thử lại', 1200);
        }
      );
  }

  /**
  *  hàm tạo lên db, lấy dữ liệu từ local 
  */
  createBillFromLocal(value, details) {
    if (details.length != 0) {
      let bill_details = details.map((item) => {
        let data = {
          id_customer: this.vhQueryAutoWeb.getlocalEndUser()._id,
          id_product: item.id_product,
          quantity: item.quantity,
          ptype: item.ptype,
          price: item.price,
          price_origin: item.price_origin,
          id_category: item.id_category,
          ratio: item.ratio
        }
        return data
      })
      let bill = {
        id_customer: this.vhQueryAutoWeb.getlocalEndUser()._id,
        id_branch: value.id_branch,
        tax: 0,
        fee: 0,
        note: value.note,
        total: this.getTotalToPayment(),
        payment: this.getTotalToPayment()
      };
      this.vhQueryAutoWeb.createBill_Billdetail_36(bill, bill_details).then(
        (bill: any) => {
          for (let i in details) {
            this.removeLocalPaymentChose(details[i]._id)
          }
          this.createNotification('success', 'Đặt hàng thành công', 2000);
        },
        (error: any) => {
          this.createNotification('error', 'Có lỗi xảy ra, vui lòng thử lại', 1200);
          console.log('error ', error);
        });
    } else {
      this.createNotification('warning', 'Giỏ hàng chưa có sản phẩm, vui lòng kiểm tra lại', 1200);
    }
  }

  removeLocalPaymentChose(id) {
    let data = JSON.parse(localStorage.getItem('cart'));
    for (let i = 0; i < data.length; i++) {
      if (data[i]._id == id) {
        data.splice(i, 1);
      }
    }
    localStorage.setItem('cart', JSON.stringify(data));
  }

  getTotalCoupon(coupons) {
    let total = coupons
      .filter((item) => item.webapp_payment_payment_chose == true)
      .reduce((prev, next) => {
        let sub = prev + next.value;
        return sub;
      }, 0);
    return total;
  }

  updateCouponCode(bill, couponUsed) {
    console.log("Sử dụng couponUsed", bill, couponUsed)
    let value = {
      status: 5,
      id_bill: bill._id,
      date_used: new Date(),
      id_customer_used: this.vhQueryAutoWeb.getlocalEndUser()._id
    }
    let promise = new Array()
    for (let i = 0; i < couponUsed.length; i++) {
      promise[i] = this.vhQueryAutoWeb.updateCouponCode(couponUsed[i]._id, value)
    }
    Promise.all(promise).then((value) => {
      // this.vhcomponent.hideLoading(0)
      this.createNotification('success', 'Đặt hàng thành công', 2000);
      this.router.navigate(['/profile/purchase'])
    })

  }

}
