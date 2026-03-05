import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VhAlgorithm } from 'vhautowebdb';

@Component({
  selector: 'app-url-uploader',
  templateUrl: './url-uploader.component.html',
  styleUrls: ['./url-uploader.component.scss']
})
export class UrlUploaderComponent implements OnInit {

  public url: any = '';

  constructor(
    public dialogRef: MatDialogRef<UrlUploaderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public vhAlgorithm: VhAlgorithm
  ) {}

  ngOnInit() {
  }

  close(): void {
    this.dialogRef.close();
  }

  handelOk() {
    this.dialogRef.close({ url: this.url });
  }

}
