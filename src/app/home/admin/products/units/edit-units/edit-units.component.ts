import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VhQueryAutoWeb, VhEventMediator } from 'vhautowebdb';
import { AddUnitsComponent } from '../add-units/add-units.component';
import { FunctionService } from 'vhobjects-service';
@Component({
  selector: 'app-edit-units',
  templateUrl: './edit-units.component.html',
  styleUrls: ['./edit-units.component.scss']
})
export class EditUnitsComponent implements OnInit {


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private vhEventMediator: VhEventMediator,
    public functionService: FunctionService,
    public dialogRef: MatDialogRef<EditUnitsComponent>,
  ) { }

  ngOnInit() {

  }

  checkRatioExist() {
    const ratio = this.data.formHandleUnit.value.ratio;
    if(this.data.dataUnits.find(e => e.ratio == ratio)) this.data.ratioExist = true;
    else this.data.ratioExist = false;
  }

  getFormControl(controlName: string): FormControl {
    return this.data.formHandleUnit.get(controlName) as FormControl;
  }
}
