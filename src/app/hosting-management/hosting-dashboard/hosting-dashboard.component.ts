import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service/src/services';

@Component({
  selector: 'app-hosting-dashboard',
  templateUrl: './hosting-dashboard.component.html',
  styleUrls: ['./hosting-dashboard.component.scss']
})
export class HostingDashboardComponent implements OnInit {
  resources = [
    { name: 'CPU', value: '4 Cores', chartId: 'cpuChart', bgColor: 'bg-primary', data: [60, 40] },
    { name: 'RAM', value: '4GB', chartId: 'ramChart', bgColor: 'bg-success', data: [70, 30] },
    { name: 'Dung lượng', value: '5GB', chartId: 'storageChart', bgColor: 'bg-warning', data: [50, 50] }
  ];
  currentHosting:any = null;
  loading: boolean = true;
  constructor(
    private route: ActivatedRoute,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private functionService: FunctionService
  ) { }

  ngOnInit() {
    this.route.parent.params.subscribe((routeParam) => {
      this.vhQueryAutoWeb.getHosting_byEndUser(routeParam.id_hosting)
      .then((res) => {
        if(res.vcode != 0) return this.functionService.createMessage('error', res.msg);
        this.currentHosting = res.data
      })
      .finally(() => this.loading = false);
    });
  }

  ngAfterViewInit(): void {
    
  }

}
