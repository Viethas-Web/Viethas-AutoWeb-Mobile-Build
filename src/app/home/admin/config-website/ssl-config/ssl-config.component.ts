import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { VhImage, VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service'; 
@Component({
  selector: 'app-ssl-config',
  templateUrl: './ssl-config.component.html',
  styleUrls: ['./ssl-config.component.scss']
})
export class SslConfigComponent implements OnInit {

  commonData: any = {}
  constructor( 
    private renderer: Renderer2,
    private titleService: Title,
    private vhImage: VhImage,
    private functionService: FunctionService,
    private dialog: MatDialog,
    private vhQueryAutoWeb: VhQueryAutoWeb
  ) { }

  ngOnInit(): void {
    this.vhQueryAutoWeb.getSetups_byFields({ type: { $eq: 'hosting-config' } })
      .then(
        (docs: any) => {
          console.log('getSetups_byFields',docs);
          
          if (docs.length) {
            this.commonData = docs[0];
          } else {
            this.vhQueryAutoWeb.addSetup({
           
              ssl: '',
              type : 'hosting-config'
            }).then((rsp: any) => {
              console.log('addCommonData');
              
              if (rsp.vcode === 0) {
                this.commonData = rsp.data;
              }
            }, error => {

            })

          }
        },
        (err) => {
          // chưa có dữu liệu
          console.log(err);
        });
  }
 

  updateCommonData(value) {
    this.vhQueryAutoWeb.updateSetup(this.commonData._id, value).then((rsp: any) => {
      if (rsp.vcode === 0) {
        console.log('updateCommonData succeed');
      }
    }, error => {
      console.log('error', error);
    })
  }
}
