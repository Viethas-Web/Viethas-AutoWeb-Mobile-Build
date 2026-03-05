import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgZorroAntModule } from 'src/app/ng-zorro-ant.module';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationModule } from '../components/pagination/pagination.module';
import { BlogsComponent } from './blogs.component';
import { EditBlogComponent } from './edit-blog/edit-blog.component';
import { AddBlogComponent } from './add-blog/add-blog.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ManageLibraryModule } from '../manage-library/manage-library.module';

const routes: Routes = [
  {
    path: '',
    component: BlogsComponent
  },
]

@NgModule({
  declarations: [
    BlogsComponent,
    EditBlogComponent,
    AddBlogComponent,
  ],
  imports: [
    CommonModule,
    NgZorroAntModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    PaginationModule,
    CKEditorModule,
    ManageLibraryModule
  ]
})
export class BlogsModule { }
