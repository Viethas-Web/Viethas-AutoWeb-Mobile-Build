import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgZorroAntModule } from 'src/app/ng-zorro-ant.module';
import { MaterialModule } from 'src/app/material.module';
import { ColorPickerModule } from 'ngx-color-picker';
import { VhStringPercentPipeModule } from 'vhobjects-user';
import { ManagePointComponent } from './manage-point.component';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { PaginationModule } from '../../components/pagination/pagination.module';
// import { PaginationModule } from '../components/pagination/pagination.module';


@NgModule({
    declarations: [
        ManagePointComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        NgZorroAntModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        ColorPickerModule,
        VhStringPercentPipeModule,
        TranslateModule,
        PaginationModule,
        IonicModule
    ],
    exports: []
})
export class ManagePointModule { }