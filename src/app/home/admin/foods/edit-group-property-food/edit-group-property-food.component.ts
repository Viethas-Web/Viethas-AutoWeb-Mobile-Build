import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddPropertyFoodComponent } from '../add-property-food/add-property-food.component';
import { EditPropertyFoodComponent } from '../edit-property-food/edit-property-food.component';
import { FunctionService } from 'vhobjects-service';
import { VhEventMediator } from 'vhautowebdb';

@Component({
  selector: 'app-edit-group-property-food',
  templateUrl: './edit-group-property-food.component.html',
  styleUrls: ['./edit-group-property-food.component.scss']
})
export class EditGroupPropertyFoodComponent implements OnInit {

  groupProperty: any={}
  languageCode: any=''

  constructor(
    private matdialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditGroupPropertyFoodComponent>,
    private vhEventMediator: VhEventMediator,
    public functionService: FunctionService
  ) { }

  ngOnInit() {
    this.groupProperty = this.data;
    console.log(this.groupProperty)
    this.languageCode = this.functionService.languageTempCode;
    this.functionService.multi_languages.forEach((language: any) => {
      if (!this.groupProperty['name_' + language.code]) {
        this.groupProperty['name_' + language.code] = ''; // Đảm bảo thuộc tính luôn tồn tại
      }
      if (!this.groupProperty['value_' + language.code]) {
        this.groupProperty['value_' + language.code] = [];// Đảm bảo thuộc tính luôn tồn tại
      }
    });
  }

  deleteProperty(i) {
    this.groupProperty['value_' + this.languageCode].splice(i, 1);
  }

  editProperty(item, i) {
    const dialogRef = this.matdialog.open(EditPropertyFoodComponent, {
      width: '30vw',
      height: '26vh',
      data: item
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.groupProperty['value_' + this.languageCode][i] = result;
      }
    });
  }

  addProperty() {
    const dialogRef = this.matdialog.open(AddPropertyFoodComponent, {
      width: '30vw',
      height: '26vh',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.groupProperty['value_' + this.languageCode] = [...this.groupProperty['value_' + this.languageCode], ...result];
      }
    });
  }

  addPropertyGroup() {
    this.dialogRef.close(this.groupProperty);
  }
}
