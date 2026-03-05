import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FunctionService } from 'vhobjects-service';
import { VhEventMediator } from 'vhautowebdb';

@Component({
  selector: 'app-add-property-food',
  templateUrl: './add-property-food.component.html',
  styleUrls: ['./add-property-food.component.scss']
})
export class AddPropertyFoodComponent implements OnInit {

  nameProperty: string = '';

  constructor(
    public dialogRef: MatDialogRef<AddPropertyFoodComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public matdialog: MatDialog,
    private vhEventMediator: VhEventMediator,
    public functionService: FunctionService
  ) { }

  ngOnInit() {
  }


  addProperty() {
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
    this.dialogRef.close(valueAdd);
  }

  handleNotifyChangeLanguage(language_code){
    this.vhEventMediator.notifyOnConfigChanged({ status: 'update-language', code: language_code });
  }
}
