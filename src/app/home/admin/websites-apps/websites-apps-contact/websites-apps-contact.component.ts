import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { VhComponent } from 'src/app/components/vh-component/vh-component';

@Component({
  selector: 'websites-apps-contact',
  templateUrl: './websites-apps-contact.component.html',
  styleUrls: ['./websites-apps-contact.component.scss'],
})
export class WebAppContactComponent implements OnInit {
  data: any = [];
  public pageShowChoose: any = [1, 2, 3]; /** Số trang hiển thị = */
  public pageGoto: number = 1; /** Trang người dùng chuyển tới hiển thị = */
  public isASC: boolean = true; // true. A->Z, false. Z->A
  public pageCurrent: number = 1; // Trang hiện tại
  public totalPages: number = 1; // Tổng số page của dịch vụ
  public limit: number = 10; // giới hạn dịch vụ trên 1 trang
  constructor(
    private router: Router,
    private vhComponent: VhComponent,
    private vhQueryAutoWeb: VhQueryAutoWeb
  ) { }


  ngOnInit(): void {
    this.getListdata();
    // this.vhQueryAutoWeb.addContact({
    //   name: 'test',
    //   type : 2,
    //   phone : '123456'
    // }).then((rsp:any)=>{
    //   console.log('addContact',rsp);

    //   if(rsp.vcode === 0){

    //   }
    //   }, error=>{

    //   })
  }

  getListdata() {
    this.vhQueryAutoWeb.getContacts_byFields({ type: { $eq: 3 } }, {}, {}, 6, this.pageCurrent)
      .then((res: any) => {
        this.data = res.data;
        this.totalPages = res.totalpages;
      })
  }
  deleteInfoCandidates(id) {
    this.vhQueryAutoWeb.deleteContact(id)
      .then((res: any) => {
        if (res.vcode === 0) {
          this.vhComponent.alertMessageDesktop("success", "xoa_thanh_cong")
          this.data.splice(this.data.findIndex(item => item.id == id), 1)
        }
      }).catch(err => console.error(err))
  }

  /// panigatior ///
  pageIndex: number = 0;
  pageSize: number = 5;
  lowValue: number = 0;
  highValue: number = 5;
  pageSizeOption: any = [5, 10, 15, 20, 25]
  getPaginatorData(event: PageEvent): PageEvent {
    this.lowValue = event.pageIndex * event.pageSize;
    this.highValue = this.lowValue + event.pageSize;
    return event;
  }
}
