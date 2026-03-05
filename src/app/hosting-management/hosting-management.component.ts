import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { VhEventMediator, VhQueryAutoWeb } from 'vhautowebdb';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
;
@Component({
  selector: 'app-hosting-management',
  templateUrl: './hosting-management.component.html',
  styleUrls: ['./hosting-management.component.scss']
})
export class HostingManagementComponent implements OnInit {

  subproject: any;
  id_subproject:any;
  id_hosting:any;
  resolution: any;
  tools = [
    {
      label: "tong_quan",
      route: "",
      nzType: "home"
    },
    {
      label: "lich_su_gia_han_hosting",
      route: "history-renewal",
      nzType: "home"
    },
    {
      label: "gia_han_hosting",
      route: "hosting-renewal",
      nzType: "profile"
    },
    {
      label: "thanh_toan_website",
      route: "payment-website",
      nzType: "profile"
    },
  ]

  currentHosting: any;

  type = 'preview-web';
  currentRoute: string = '';
  subscribe :Subscription
  
  constructor( 
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private router: Router,
    private route: ActivatedRoute ,
    private vhEventMediator: VhEventMediator,
  ) {}

  ngOnInit(): void {
    this.subproject = this.vhQueryAutoWeb.getlocalSubProject(this.vhQueryAutoWeb.getlocalSubProject_Working()._id);
    this.route.params.subscribe((routeParam) => {
      this.id_subproject = routeParam.id_project;
      this.id_hosting = routeParam.id_hosting;
      this.subproject = this.vhQueryAutoWeb.getlocalSubProject(this.vhQueryAutoWeb.getlocalSubProject_Working()._id);
      this.resolution = this.subproject.resolution;
      this.subscribe =  this.vhEventMediator.configChanged.subscribe((msg: any) => { 
        if(msg && msg.id_subproject == this.id_hosting && msg.paid_online){
          this.currentHosting.free_hosting = false
        }
       })
    });

    // Update currentRoute on navigation end
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateCurrentRoute();
    });
    // Update currentRoute on initial load
    this.updateCurrentRoute();
    

    // phần này kiểm tra đã có enduser chưa, nếu chưa phải authstatechange để get các dữ liệu về tương ứng
    if (!this.vhQueryAutoWeb.checkSigninEndUser())
      this.vhQueryAutoWeb.onAuthStateChangedEndUser()
        .then(res => {
          // console.log(res);
          if (res.vcode != 0) this.router.navigate([`${this.id_subproject}/preview-web/`]);
        }, (error: any) => {
          this.router.navigate([`${this.id_subproject}/preview-web/`]);
        })
        this.vhQueryAutoWeb.getHosting_byEndUser(this.id_hosting).then((res: any) => {
          if(res.vcode != 0) return console.error(res.msg)
          this.currentHosting = res.data;
          
        })
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if(this.subscribe) this.subscribe.unsubscribe()
  }
  
  updateCurrentRoute(): void {
    const urlSegments = this.router.url.split('/');
    if (urlSegments.length != 5) {
      this.currentRoute = '';
    } else {
      this.currentRoute = urlSegments.pop();
    }
  }


  /** Hàm chuyển về trang quản lý tài khoản website
   *
   */
  backToPage(): void { 
    let route = `${this.id_subproject}/preview-web`
    if(this.type === 'build') route = '';
    let route_tai_khoan = this.vhQueryAutoWeb.localStorageGET('route_tai_khoan') || 'tai-khoan'
    this.router.navigate([`${route}/${route_tai_khoan}`]);
  }

  /** Chuyện giao diện cài đặt
   *
   * @param path
   */
  routerToModule(path: string) {
    let route = `${this.id_subproject}/hosting-management/${this.id_hosting}` 
    if(this.type === 'build') route = `/hosting-management/${this.id_hosting}`;
    this.router.navigate([`${route}/${path}`]);
  }

}
