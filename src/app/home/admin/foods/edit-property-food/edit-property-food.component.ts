import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-property-food',
  templateUrl: './edit-property-food.component.html',
  styleUrls: ['./edit-property-food.component.scss']
})
export class EditPropertyFoodComponent implements OnInit {

  nameProperty: string = '';

  constructor(
    public dialogRef: MatDialogRef<EditPropertyFoodComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public matdialog: MatDialog,
  ) { }

  ngOnInit() {
    this.nameProperty = this.data;
  }


  editProperty() {
    if(!this.nameProperty) return;
    const valueAdd = [] 
    let value: string[] = this.nameProperty.split(',');
    for (let item of value) {
      let freshValue: string = item.trim();
      if (freshValue) {
        if (valueAdd.some((item) => item == freshValue))
          continue;
        else {
          valueAdd.push(freshValue);
        }
      } 
    }

    this.dialogRef.close(this.nameProperty);
  }
}
