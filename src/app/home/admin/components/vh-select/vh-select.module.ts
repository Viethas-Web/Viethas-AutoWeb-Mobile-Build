import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { NgZorroAntModule } from 'src/app/ng-zorro-ant.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { VhSelectComponent } from './vh-select.component';

@NgModule({
  imports: [
    CommonModule,
    NgZorroAntModule,
    TranslateModule,
    FormsModule,

  ],
  declarations: [
    VhSelectComponent
  ],
  exports: [
    VhSelectComponent // Đảm bảo rằng VhSelectComponent được export
  ]
})
export class VhSelectModule { }
