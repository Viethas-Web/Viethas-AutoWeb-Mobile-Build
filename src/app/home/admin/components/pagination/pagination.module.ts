import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from './pagination.component';
import { NgZorroAntModule } from 'src/app/ng-zorro-ant.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    NgZorroAntModule,
    TranslateModule,
    FormsModule,

  ],
  declarations: [
    PaginationComponent
  ],
  exports: [
    PaginationComponent // Đảm bảo rằng PaginationComponent được export
  ]
})
export class PaginationModule { }
