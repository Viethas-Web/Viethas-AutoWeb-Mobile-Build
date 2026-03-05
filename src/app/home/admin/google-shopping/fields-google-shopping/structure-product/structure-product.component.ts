import { Component, ElementRef, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import JSONEditor, { JSONEditorOptions } from 'jsoneditor';

@Component({
  selector: 'app-structure-product',
  templateUrl: './structure-product.component.html',
  styleUrls: ['./structure-product.component.scss']
})
export class StructureProductComponent implements OnInit, AfterViewInit {
  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<StructureProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {}

  close() {
    this.dialogRef.close();
  }

  ngAfterViewInit() {
    const options: JSONEditorOptions = {
      mode: 'view', // chỉ xem
      mainMenuBar: false,
      navigationBar: true,
      statusBar: false,
    };

    const editor = new JSONEditor(this.editorContainer.nativeElement, options);

    // 🔒 Deep clone tránh ảnh hưởng dữ liệu gốc
    const product = JSON.parse(JSON.stringify(this.data?.product || {}));

    // 🧹 Danh sách từ khóa cần ẩn
    const hiddenKeywords = [
      'allow_sell',
      'selling',
      'manysize',
      'manylot',
      'type',
      'ordinal_number',
      'hidden',
      'created_at',
      'updated_at',
      'date_update',
      'version',
      'sub_type',
      'tax',
      'cost_stock_last',
      'warning_number',
      'item_code',
      'days_import_warning',
      'days_exp_warning',
    ];

    // Xóa các field có chứa từ khóa
    for (const key of Object.keys(product)) {
      const lowerKey = key.toLowerCase();
      if (hiddenKeywords.some(k => lowerKey.includes(k.toLowerCase()))) {
        delete product[key];
      }
    }

    // Nếu chưa có product.data hoặc product.data.google_shopping thì thêm mới
    if (!product.data) {
      product.data = {};
    }

    if (!product.data.google_shopping) {
      product.data.google_shopping = {
        id: '',
        title: '',
        description: '',
        link: '',
        image_link: '',
        price: '',
        availability: 'in stock',
        brand: '',
        condition: 'new',
        product_type: '',
        google_product_category: '',
      };
    }

    // Hiển thị object đã làm sạch
    editor.set(product || {});
  }

}
