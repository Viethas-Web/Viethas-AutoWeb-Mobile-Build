import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VhAlgorithm } from 'vhautowebdb';

@Component({
  selector: 'app-multiple-url-uploader',
  templateUrl: './multiple-url-uploader.component.html',
  styleUrls: ['./multiple-url-uploader.component.scss'],
})
export class MultipleUrlUploaderComponent implements OnInit {
  public urls: Array<any> = [];
  public url = {
    path: ''
  }
  constructor(
    public dialogRef: MatDialogRef<MultipleUrlUploaderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public vhAlgorithm: VhAlgorithm
  ) {}

  ngOnInit() {
    this.addUrl();
  }

  close(): void {
    this.dialogRef.close();
  }

  deleteUrl(position) {
    this.urls = this.urls.filter((_, index) => index != position);
  }

  addUrl() {
    const url = {
      path: ''
    }
    this.urls = [...this.urls,url]
  }

  handelOk() {
    this.dialogRef.close({ urls: this.urls.filter((filter) => filter.path != '').map((item) => item.path) });
  }

  accept(value, position){
    this.urls[position].path = value
  }
}
