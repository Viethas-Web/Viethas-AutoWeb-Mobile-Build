import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
 

@Component({
  selector: 'app-select-branch',
  templateUrl: './select-branch.component.html',
  styleUrls: ['./select-branch.component.scss']
})
export class SelectBranchComponent implements OnInit {
  branchs: any = []
  id_branch_selected: any = ""
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<SelectBranchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
     
  ) {
    this.id_branch_selected = this.data[0]._id
  }

  ngOnInit(): void {
    this.branchs = this.data
  }

  handleOkBranch() {
    this.dialogRef.close(this.id_branch_selected)
  }

}
