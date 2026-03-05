import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';

interface FieldData {
  key: string;
  type: string;
  value: string;
  field?: string;
  label: string;
  hidden: boolean;
}

@Component({
  selector: 'app-detail-product',
  templateUrl: './detail-product.component.html',
  styleUrls: ['./detail-product.component.scss']
})
export class DetailProductComponent implements OnInit {
  @Input() product: any;
  dataSetup: any;
  newFields: any = [];
  ldJsonProduct: any;
  loading: boolean = false;
  updatedProduct: any = {};

  constructor(
    public vhQueryAutoWeb: VhQueryAutoWeb,
    private modal: NzModalRef,
    public functionService: FunctionService
  ) { }

  ngOnInit() {
    this.getSetups();
  }

  getSetups() {
    this.loading = true;
    this.vhQueryAutoWeb.getSetups_byFields({ type: 'fields_embedded_script', mainSector: this.product.mainSector })
      .then((res: any) => {
        console.log('getSetups_byFields', res);
        if (res.length === 0) {
          this.vhQueryAutoWeb.addSetup({
            type: 'fields_embedded_script',
            mainSector: this.product.mainSector,
            data: [
              { key: 'name', type: 'field', value: '', field: 'name_vn', label: 'Tên sản phẩm', hidden: false },
              { key: '@context', type: 'value', value: 'https://schema.org/', label: 'https://schema.org/', hidden: false },
              { key: '@type', type: 'value', value: 'Product', label: 'Product', hidden: false },
              { key: 'image', type: 'field', value: '', field: 'imgs[0]', label: 'Hình ảnh sản phẩm', hidden: false },
              { key: 'sku', type: 'value', value: '', label: 'Mã sản phẩm', hidden: false },
              { key: 'brand.@type', type: 'value', value: 'Brand', label: 'Loại thương hiệu', hidden: false },
              { key: 'brand.name', type: 'value', value: '', label: 'Tên thương hiệu', hidden: false },
              { key: 'description', type: 'value', value: '', label: 'Mô tả sản phẩm', hidden: false },
              { key: 'aggregateRating.@type', type: 'value', value: 'AggregateRating', label: 'Loại đánh giá', hidden: false },
              { key: 'aggregateRating.ratingValue', type: 'value', value: '5.0', label: 'Giá trị đánh giá', hidden: false },
              { key: 'aggregateRating.reviewCount', type: 'value', value: '50', label: 'Số lượt đánh giá', hidden: false },
              { key: 'offers.@type', type: 'value', value: 'Offer', label: 'Loại ưu đãi', hidden: false },
              { key: 'offers.priceCurrency', type: 'value', value: 'VND', label: 'Loại tiền tệ', hidden: false },
              { key: 'offers.price', type: 'value', value: '1000000', label: 'Giá sản phẩm', hidden: false },
              { key: 'offers.availability', type: 'value', value: 'https://schema.org/InStock', label: 'Tình trạng hàng', hidden: false },
              { key: 'offers.url', type: 'value', value: '', label: 'URL sản phẩm', hidden: false }
            ]
          }).then((resAdd: any) => {
            this.dataSetup = resAdd.data;
            this.updateJson();
          })
            .finally(() => this.loading = false);
        } else if (res.length > 1) {
          console.error('Có nhiều hơn 1 setup', res);
          this.loading = false;
        } else {
          this.dataSetup = res[0];
          this.loading = false;
          this.updateJson();
        }
      });
  }

  updateJson() {
    this.updatedProduct = {};

    this.dataSetup.data.forEach((item: FieldData) => {
      if (item.hidden) {
        return;
      }

      const key = item.key;
      const field = item.field;
      const defaultValue = item.value ?? '';

      let value = defaultValue;

      // Nếu type === 'value' → lấy value luôn, bỏ qua field
      if (item.type === 'value') {
        value = defaultValue;
      }
      else {
        // Trường hợp đặc biệt cho 'imgs[0]'
        if (field === 'imgs[0]') {
          value = this.product.imgs?.[0] ?? defaultValue;
        }
        // Xử lý các field khác
        else if (field) {
          value = this.getValueByPath(this.product, field, defaultValue);
        }
      }

      // Xử lý key phân cấp
      const keys = key.split('.');
      let current = this.updatedProduct;

      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!current[k]) {
          current[k] = {};
        }
        current = current[k];
      }

      current[keys[keys.length - 1]] = value;
    });

    // Tạo chuỗi JSON+LD
    this.ldJsonProduct = `<script type="application/ld+json">\n${JSON.stringify(this.updatedProduct, null, 2)}\n</script>`;
  }

  getValueByPath(obj: any, path: string, defaultValue: any): any {
    const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let current = obj;

    for (const key of keys) {
      if (current == null) {
        return defaultValue;
      }
      current = current[key];
    }

    return current ?? defaultValue;
  }

  close() {
    this.modal.close();
  }
}