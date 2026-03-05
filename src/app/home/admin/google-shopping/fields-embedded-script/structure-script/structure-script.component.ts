import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-structure-script',
  templateUrl: './structure-script.component.html',
  styleUrls: ['./structure-script.component.scss']
})
export class StructureScriptComponent implements OnInit {
  product:any = {
  }
  dataSetup:any;
  ldJsonProduct:any;

  constructor(
    public dialogRef: MatDialogRef<StructureScriptComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.dataSetup = this.data.dataSetup;

    // Chuyển đổi mảng FieldData thành object lồng nhau
    this.product = this.transformToNestedObject(this.dataSetup.data);

    // Tạo chuỗi JSON+LD
    this.ldJsonProduct = `<script type="application/ld+json">\n${JSON.stringify(this.product, null, 2)}\n</script>`;
  }

  // Hàm chuyển đổi mảng FieldData thành object lồng nhau
  transformToNestedObject(data: any): { [key: string]: any } {
    const result: { [key: string]: any } = {};

    data.forEach((item) => {
      // Bỏ qua các item có hidden = true
      if (item.hidden) {
        return;
      }

      const keys = item.key.split('.');
      let current = result;

      // Tạo cấu trúc lồng nhau
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }

      // Gán giá trị cho key cuối cùng
      current[keys[keys.length - 1]] = item.value;
    });

    return result;
  }

  close() {
    this.dialogRef.close();
  }

}
