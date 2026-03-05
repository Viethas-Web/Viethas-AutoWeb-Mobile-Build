import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgZorroAntModule } from 'src/app/ng-zorro-ant.module';
import { TranslateModule } from '@ngx-translate/core';
import { RecruitmentComponent } from './recruitment.component';
import { InfoCandidatesComponent } from './info-candidates/info-candidates.component';
import { EditRecruitmentComponent } from './edit-recruitment/edit-recruitment.component';
import { AddRecruitmentComponent } from './add-recruitment/add-recruitment.component';
import { PaginationModule } from '../components/pagination/pagination.module';
import { SelectLanguageConfigModule } from 'vhobjects-admin';
import { NationalFlagModule } from 'vhobjects-service';
import { VhSelectModule } from '../components/vh-select/vh-select.module';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
  {
    path: '',
    component: RecruitmentComponent
  },
]
@NgModule({
  declarations: [
    RecruitmentComponent,
    InfoCandidatesComponent,
    EditRecruitmentComponent,
    AddRecruitmentComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CKEditorModule,
    NgZorroAntModule,
    PaginationModule,
    SelectLanguageConfigModule,
    NationalFlagModule,
    VhSelectModule
  ]
})
export class RecruitmentModule { }
