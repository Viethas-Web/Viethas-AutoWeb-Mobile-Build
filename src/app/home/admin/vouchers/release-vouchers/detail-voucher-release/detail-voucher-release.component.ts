import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { VhComponent } from 'src/app/components/vh-component/vh-component';
import { LanguageService } from 'src/app/services/language.service';
@Component({
  selector: 'app-detail-voucher-release',
  templateUrl: './detail-voucher-release.component.html',
  styleUrls: ['./detail-voucher-release.component.scss']
})
export class DetailVoucherReleaseComponent implements OnInit {
  data: any; // Biến này lấy dữ liệu của voucher  release truyền về
  isOpenModal: boolean = false;
  isSortName: boolean = false;
  isSortQuantity: boolean = false;
  keySearch: string = ''; // biến này dùng trong modal
  keySearchVoucher: string = ''; // biến này dùng ở giao diện
  public listVoucher: any[] = [];                  // danh sách voucher
  public listVoucherChoosed: any[] = [];           // danh sách voucher đã chọn
  public listVoucherNotChoose: any[] = [];
  public listShow: any[] = [];                     // danh sách voucher hiển thị
  public listShowSearch: any[] = [];                // danh sách voucher ban đầu dùng để tìm kiếm
  public showVoucherModal: any[] = [];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private message: NzMessageService,
    public vhAlgorithm: VhAlgorithm, 
    private vhComponent: VhComponent,
    private languageService: LanguageService
  ) {
    this.data = this.router.getCurrentNavigation()?.extras.state;

    console.log('this.data', this.data)
  }

  ngOnInit(): void {
    if (this.data) {
      this.getListVoucher();
      this.getVoucherReleaseDetail(this.data.id_voucher_release);
    }
  }
  getListVoucher() {
    this.vhQueryAutoWeb.getVouchers_byFields({}, {}, {}, 0)
      .then((rsp: any) => {
        if (rsp.vcode == 0) {
          let vouchers = rsp.data;
          this.listVoucher = vouchers.map(item => {
            return { ...item, choose: false, display: 'flex' }
          })
          this.showVoucherModal = this.vhAlgorithm.sortStringbyDESC(this.listVoucher, ['name']);
        } else if (rsp.vcode == 11) {
          //phát thông báo lý do không lấy dữ liệu về được
        }
      }, error => {
        console.log('error', error);
      })
  }
  // Hàm này hiển thị danh sách voucher , chọn voucher hiển thị ra ngoài
  gotoAddVoucherToRelease() {
    this.isOpenModal = true;
    if (this.listShow.length) {
      for (let itemShow of this.listShow) {
        let index = this.showVoucherModal.findIndex(item => itemShow.id_voucher == item._id);
        this.showVoucherModal[index].choose = false;
        this.showVoucherModal[index].display = 'none';
      }
    }
  }
  // Thêm voucher vào release_details
  addVoucher_ReleaseDetails(item, id_release) {
    //  dữ liệu thêm vào voucher_release_details
    let data = {
      id_voucher: item._id,
      id_voucher_release: id_release,
      quantity_released: 0
    }
    this.vhQueryAutoWeb.addVoucherReleaseDetail(data).then((response: any) => {
      if (response) {
        let result = ''; // biến này gán tên sản phẩm của voucher
        let voucher_release_detail = response.data;
        voucher_release_detail['id_release'] = id_release;
        voucher_release_detail['name'] = item.name;
        // lấy chi tiết sản phẩm của voucher
        item.products.forEach((element) => {
          let id = element.id_subproduct ? element.id_subproduct : element.id_product;
          this.vhQueryAutoWeb.getDetailProduct(id)
            .then((detailproduct: any) => {
              if (result.length == 0) {
                result = detailproduct.name + ' x' + element.quantity;
              } else {
                result = result + ', ' + detailproduct.name + ' x' + element.quantity;
              }
              voucher_release_detail['products'] = result;
            }, (error: any) => {
              console.log('error', error)
            })
        })
        this.listShow = this.listShow.concat(voucher_release_detail);

        this.listShowSearch = this.listShow;
      }
    }, error => {
      console.log('error', error);
    })
  }
  getVoucherReleaseDetail(id_release) {
    this.vhComponent.showLoading("", "transparent-loading").then(() => {
    this.vhQueryAutoWeb.getVoucherReleaseDetails_byIdVoucherRelease(id_release)
      .then((rsp: any) => {
        console.log('getVoucherReleaseDetails_byIdVoucherRelease', rsp)
        if (rsp.vcode == 0) {
          let voucher_release_details = rsp.data;
          if (voucher_release_details) {
            const productDetails = [];
            for (const releaseDetail of voucher_release_details) {
              const voucher = this.listVoucher.find((item) => item._id == releaseDetail.id_voucher);
              if (voucher) {
                // Create an array to store product strings
                const productStrings = [];
                releaseDetail['name'] = voucher.name;
                // Loop through products in the voucher
                for (const product of voucher.products) {
                  const id = product.id_subproduct ? product.id_subproduct : product.id_product;
                  // Get product details and build the product string
                  this.vhQueryAutoWeb.getDetailProduct(id)
                    .then((detailproduct: any) => {
                      if (detailproduct) {
                        const productString = `${detailproduct.name} x${product.quantity}`;
                        productStrings.push(productString);
                        // Join the product strings with commas
                        releaseDetail['products'] = productStrings.join(', ');
                      }
                    }, (error: any) => {
                      console.log('error', error)
                    })
                }
              }
              // Add the releaseDetail to the list of product details
              productDetails.push(releaseDetail);
            }
            // Update the listShow and listShowSearch arrays
            this.listShow = this.listShow.concat(productDetails);
            this.listShowSearch = this.listShow;
            this.vhComponent.hideLoading(0);
          }else {
            this.listShow = [];
            this.listShowSearch = this.listShow;
            this.vhComponent.hideLoading(0);
          }
        }else if (rsp.vcode == 11) {
          //phát thông báo lý do không lấy dữ liệu về được
        }
      }, error => {
        console.log('error', error);
      })
    })
  }
  // Hàm này để chọn voucher để hiển thị ra
  chooseVoucherToRelease(position) {
    let voucher = this.showVoucherModal[position];
    if (voucher.choose == false) {
      this.showVoucherModal[position].choose = true
    } else if (voucher.choose == true) {
      this.showVoucherModal[position].choose = false
    }
  }
  // Xử lý thêm voucher vào đợt phát hành
  handleAdd() {
    this.listVoucherChoosed = this.listVoucher.filter(item => item.choose == true);                // lọc voucher đã chọn
    if (!this.listShow.length) {                                                                    // dữ liệu hiển thị không có
      this.listVoucherChoosed.forEach(element => {                                             // thêm toàn bộ voucher vừa lọc
        this.addVoucher_ReleaseDetails(element, this.data._id);
      })
    } else if (this.listShow.length) {                                                               // dữ liệu đã có
      if (this.listVoucherChoosed.length) {                                                         // thực hiện thêm dữ liệu voucher chưa có vào, còn đã tồn tại thì không cần thêm nữa
        this.listVoucherChoosed.forEach(element => {
          if (!this.listShow.filter(item => item.id_voucher === element._id).length) {
            this.addVoucher_ReleaseDetails(element, this.data._id);
          }
        })
      }
    }
    this.isOpenModal = false;
  }
  // Xử lý xóa voucher
  deleteVoucherReleased(data) {
    this.vhQueryAutoWeb.deleteVoucherReleaseDetail(data._id)
      .then((rsp: any) => {
        if (rsp.vcode == 0) {
          //phát thông báo xóa thành công
          this.message.success(this.languageService.translate('xoa_thanh_cong'));
          this.listShow = this.listShow.filter(item => item._id != data._id)
          this.listShowSearch = this.listShow;
          this.showVoucherModal.filter(item => item._id === data.id_voucher)[0].choose = false;
        } else if (rsp.vcode == 1) {
          //phát thông báo lý do xóa ko thành công (dùng câu từ dễ hiểu với khách hàng)
          this.message.error(this.languageService.translate('khong_the_xoa_vi_co_voucher_lien_quan_da_duoc_doi_diem_ban_hoac_su_dung_lay_hang_hoa'))
        }
      }, error => {
        console.log('error', error);
      })
  }
  handleCancel() {
    this.isOpenModal = false;
  }
  searchVoucherOutSide(key){
    if(key != ''){
      this.listShow = this.vhAlgorithm.searchList(
        this.vhAlgorithm.changeAlias(key.toLowerCase()),
        this.listShow, ["name"]
      );
    }else{
      this.listShow = this.listShowSearch;
    }
  }
  // Hàm này dùng để tìm kiếm trong modal
  searchVoucherRelease(key) {
    if (key != '') {
      this.showVoucherModal = this.vhAlgorithm.searchList(
        this.vhAlgorithm.changeAlias(key.toLowerCase()),
        this.listVoucher, ["name"]
      );
    } else {
      this.showVoucherModal = this.listVoucher
    }
  }
  /** Hàm thực hiện sắp xếp theo collection
   *
   * @param colName       // tên cột muôn sắp xếp
   */
  sortTable(colName) {
    switch (colName) {
      case 'name':
        if (this.isSortName) {
          this.listShow = this.vhAlgorithm.sortVietnamesebyASC([...this.listShow], colName);
        } else {
          this.listShow = this.vhAlgorithm.sortVietnamesebyDESC([...this.listShow], colName);
        }
        break;
      case 'quantity_released':
        if (this.isSortQuantity) {
          this.listShow = this.vhAlgorithm.sortNumberbyASC([...this.listShow], colName);
        } else {
          this.listShow = this.vhAlgorithm.sortNumberbyDESC([...this.listShow], colName);
        }
        break;
    }
  }
  goBack() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  releaseVoucher(item) {
    this.router.navigate(['voucher-code'], { relativeTo: this.route, state: {...item, name: this.data.name, date_validity : this.data.date_validity, date_expire : this.data.date_expire} });
  }
}
