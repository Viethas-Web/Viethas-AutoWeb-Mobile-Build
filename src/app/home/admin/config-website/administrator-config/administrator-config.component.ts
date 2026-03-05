import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VhAuth, VhQueryAutoWeb } from 'vhautowebdb';
import { VhComponent } from 'src/app/components/vh-component/vh-component';

@Component({
  selector: 'app-administrator-config',
  templateUrl: './administrator-config.component.html',
  styleUrls: ['./administrator-config.component.scss']
})
export class AdministratorConfigComponent implements OnInit {
  isVisibleEditEmail = false;
  data: any;
  detailEmployee: FormGroup;
  newPassword = ''
  oldPassword = ''
  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private vhComponent: VhComponent
  ) { }

  ngOnInit(): void {
    this.data = this.vhQueryAutoWeb.getlocalAdmin();
    console.log(this.data);

    this.initForm()
  }

  initForm() {
    this.detailEmployee = new FormGroup({
      name: new FormControl(this.data.name, Validators.compose([Validators.required, Validators.compose([Validators.minLength(6)])])),
      email: new FormControl(this.data.email, Validators.email),
     
      phoneNumber: new FormControl(this.data.phoneNumber),
      gender: new FormControl(this.data.gender),
      address: new FormControl(this.data.address),
      dateofbirth: new FormControl(this.data.dateofbirth  ),
      datework: new FormControl(this.data.datework )
    });
  }


  /**Cập nhật thông tin thay đổi */
  updateEmployee(value) {
    if (this.detailEmployee.valid) {
      console.log('value',value);
      
      this.vhQueryAutoWeb.updateAdmin(value).then((rsp: any) => {
        console.log('updateAdmin', rsp);
        if (rsp.vcode === 0) {
          //-----------your code-----------
        }
      }, (error: any) => {
        console.log('error', error)
      }).catch(err => { console.error(err) })
    }
  }

  /**
   * hàm này để thay đổi pass của admin
   */
  changePassWord() {
    this.vhQueryAutoWeb.changePassword_Admin_byEmail(this.data.email, this.oldPassword, this.newPassword)
      .then(response => {
        console.log('response', response);
        if (response.vcode === 0) {
          //-----------your code 0-----------
          this.vhComponent.alertMessageDesktop("success", "Đổi mật khẩu thành công")
        } else if (response.vcode === 1) {
          this.vhComponent.alertMessageDesktop("error", "Địa chỉ email không tồn tại")
          //-----------your code 1-----------
        } else if (response.vcode === 2) {
          this.vhComponent.alertMessageDesktop("error", "Mật khẩu cũ không đúng")
          //-----------your code 2-----------
        } else if (response.vcode === 3) {
          this.vhComponent.alertMessageDesktop("error", "Vui lòng đặt lại mật khẩu")
          //-----------your code 3-----------
        }
      }, (error: any) => {
        console.log('error', error)
      })
  }
}
