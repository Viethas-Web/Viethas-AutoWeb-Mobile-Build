import { ChangeDetectorRef, Component, OnInit,  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-list-voucher',
  templateUrl: './list-voucher.component.html',
  styleUrls: ['./list-voucher.component.scss']
})
export class ListVoucherComponent implements OnInit {
  listVoucher = []; // danh sách voucher lấy về
  listVoucherSearch: any = []; // danh sách voucher lấy về
  keySearch: any = ''; // Tìm kiếm voucher
  selectedValue: any = '1'; //theo menu
  selectedIndex: number = 0; // theo index của tab
  tableHeight: string; // biến dùng để chứa chiều cao của bảng dữ liệu
  pageSize : number = 20;// giới hạn sản phẩm trên 1 trang
  pageIndex = 1;
  /** biến ẩn hiện loading ở table khi get dữ liệu */
  loading = false 
  listOfColumn:any = [
    {
      name: 'ten_voucher',
      width: '35%',
      sort: true, 
      align: 'left'
    }, 
    {
      name: 'san_pham_trong_voucher',
      width: '25%',
      align: 'left',
      compare: null,
    }, 
    {
      name: 'gia_tri_voucher',
      width: '25%',
      align: 'center',
      sort: true,
    },
    {
      name: 'thao_tac',
      width: '15%',
      align: 'center',
      sort: true,
    }
  ]
  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    public vhAlgorithm: VhAlgorithm,
    private functionService: FunctionService,
  ) { }

  ngOnInit(): void {
  }
  //Router đến trang thêm
  addVoucher(){
    this.router.navigate(['add-voucher'],{relativeTo: this.route});
  }
  // Get danh sách voucher
  getListVoucher(){
    this.loading = true;
    this.keySearch = ''
    this.vhQueryAutoWeb.getVouchers_byFields({},{},{},0)
    .then((rsp: any)=>{
      console.log('rsp', rsp);
      if(rsp.vcode == 0){
        let vouchers = rsp.data;
        this.listVoucher = this.vhAlgorithm.sortVietnamesebyDESC(vouchers,['name']).map((item,index)=>{
         this.getAllName_fromProductInVoucher(item.products,index);
          return {...item}
        })
        this.listVoucherSearch = this.listVoucher;
      }else if(rsp.vcode == 11){
        //phát thông báo lý do không lấy dữ liệu về được
      }
    }, error=>{
      console.log('error', error);
    })
    .finally(()=>{
      this.loading = false;
    })
  }
  /**
   * trả về chuỗi tên danh sách sp trong voucher
   */
   getAllName_fromProductInVoucher(products: any[],position) {
    let resultArray= [];
    let value: string = '';
    for (const element of products) {
        const id = element.id_subproduct ? element.id_subproduct : element.id_product;
        resultArray.push(this.vhQueryAutoWeb.getDetailProduct(id));
    }
    Promise.all(resultArray).then((resolve)=>{
      resolve.forEach((item, index)=>{
        const el = products[index];
        value = value + (index === 0 ? '' : ', ') + item.name + ' x' + el.quantity;
        this.listVoucher[position]['nameProduct'] = value
      })
    })
  }
  // Đi tới trang chi tiết
  gotoDetail(voucher){
    let dataRestore = { keySearch: this.keySearch, selectedValue: this.selectedValue, selectedIndex: this.selectedIndex }
    this.router.navigate(['detail-voucher'],{relativeTo: this.route, state:{
      voucher,
      dataRestore
    }})
  }
  // Tìm kiếm voucher
  search_Voucher(key){
    let tempVal: string = key.toLowerCase();
    if (key.length) {
      this.listVoucher = this.vhAlgorithm.searchList(
        this.vhAlgorithm.changeAlias(tempVal),
        this.listVoucherSearch, ["name"]
      );
    } else {
      this.listVoucher = this.listVoucherSearch
    }
  }

  handleSort(name, value) {
    console.log('name', name);
    console.log('value', value);
    console.log('listVoucher', this.listVoucher);
  
    let sortedList = [...this.listVoucher]; // Tạo bản sao mới của danh sách để đảm bảo Angular nhận diện thay đổi
  
    switch (name) {
      case 'ten_voucher': 
        if (value) {
          sortedList = sortedList.sort((a, b) => a.name.localeCompare(b.name));
        } else {  
          sortedList = sortedList.sort((a, b) => b.name.localeCompare(a.name));
        }
        break; 
  
      case 'gia_tri_voucher': {
        if (value) {
          sortedList = sortedList.sort((a, b) => {
            const priceA = a.units[0]?.price || 0;
            const priceB = b.units[0]?.price || 0;
            return priceA - priceB;
          });
        } else {
          sortedList = sortedList.sort((a, b) => {
            const priceA = a.units[0]?.price || 0;
            const priceB = b.units[0]?.price || 0;
            return priceB - priceA;
          });
        }
        break;
      }
    }
  
    this.listVoucher = sortedList; // Cập nhật lại danh sách sau khi sắp xếp
    this.cdr.detectChanges(); // Kích hoạt Change Detection để cập nhật giao diện
  }

  trackByFn(index: number, item: any) {
    return item.id; // hoặc sử dụng một thuộc tính duy nhất khác của item
  }

  deleteVoucher(item) { 
    this.vhQueryAutoWeb.deleteVoucher(item._id).then((res:any) => {
      if(res.vcode != 0) {
        this.functionService.createMessage('error', res.msg, 3000)
        console.error(res);
        return;
      }
      this.listVoucher = this.listVoucher.filter(voucher => voucher._id != item._id)
      this.functionService.createMessage('success', res.msg, 3000)
    })
  }
}
