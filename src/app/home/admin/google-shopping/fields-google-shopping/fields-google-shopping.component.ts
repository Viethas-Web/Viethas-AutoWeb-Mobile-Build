import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { StructureProductComponent } from './structure-product/structure-product.component';
import { FunctionService } from 'vhobjects-service';

interface Tab {
  title: string;
  sector: string;
  type: string;
}

interface ShoppingFieldData {
  key: string;
  label: string;
  type: 'value' | 'field';
  field?: string;
  value?: string;
}

@Component({
  selector: 'app-fields-google-shopping',
  templateUrl: './fields-google-shopping.component.html',
  styleUrls: ['./fields-google-shopping.component.scss'],
})
export class FieldsGoogleShoppingComponent implements OnInit {
  tabs: Tab[] = [
    { title: 'san_pham', sector: 'ecommerce', type: 'fields_google_shopping' },
    { title: 'mon_an', sector: 'food_drink', type: 'fields_google_shopping' },
    { title: 'webapp', sector: 'web_app', type: 'fields_google_shopping' },
  ];

  // giống cách bạn làm với embedded-script
  dataSetups: { [key: string]: { _id?: string; data: ShoppingFieldData[] } } = {};
  loadings: { [key: string]: boolean } = {};
  productSamples: { [key: string]: any } = {};
  fieldsBySector: { [key: string]: any[] } = {};

  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private dialog: MatDialog,
    public vhAlgorithm: VhAlgorithm,
    public functionService: FunctionService,
  ) {
    this.tabs.forEach(tab => {
      this.dataSetups[tab.sector] = { data: [] };
      this.productSamples[tab.sector] = {};
      this.fieldsBySector[tab.sector] = [];
      this.loadings[tab.sector] = false;
    });
  }

  ngOnInit(): void {
    this.tabs.forEach((tab) => {
      this.loadings[tab.sector] = true;
      this.getSetups(tab.sector, tab.type);
      this.getSampleData(tab.sector);
    });
  }

  getData(sector: string): { _id?: string; data: ShoppingFieldData[] } {
    const setup = this.dataSetups[sector] || { data: [] };
    return {
      _id: setup._id,
      data: Array.isArray(setup.data) ? setup.data : [],
    };
  }

  getLoading(sector: string): boolean {
    return this.loadings[sector] || false;
  }

  /** Dữ liệu default: đã dùng type + value giống embedded-script */
  getDefaultData(): ShoppingFieldData[] {
    return [
      { key: 'id',                      label: 'id',                   type: 'field', value: '', field: '' },
      { key: 'title',                   label: 'tieu_de',              type: 'field', value: '', field: '' },
      { key: 'description',             label: 'mo_ta',                type: 'field', value: '', field: '' },
      { key: 'link',                    label: 'duong_dan_san_pham',   type: 'field', value: '', field: '' },
      { key: 'image_link',              label: 'duong_dan_hinh_anh',   type: 'field', value: '', field: '' },
      { key: 'price',                   label: 'gia',                  type: 'field', value: '', field: '' },
      { key: 'availability',            label: 'tinh_trang_trong_kho', type: 'value', value: 'in stock', field: '' },
      { key: 'brand',                   label: 'thuong_hieu',          type: 'field', value: '', field: '' },
      { key: 'condition',               label: 'tinh_trang_san_pham',  type: 'value', value: 'new', field: '' },
      { key: 'product_type',            label: 'nhom_san_pham',        type: 'field', value: '', field: '' },
      { key: 'google_product_category', label: 'ma_danh_muc',          type: 'field', value: '', field: '' },
    ];
  }

  /** 
   * Lấy setup, nếu chưa có thì add default,
   * nếu có format cũ (defaultValue) thì convert sang format mới (type + value + field)
   */
  getSetups(sector: string, type: string) {
    this.vhQueryAutoWeb
      .getSetups_byFields({ type, mainSector: sector })
      .then((res: any) => {
        if (res.length === 0) {
          // tạo mới với data đã dùng type + value
          this.vhQueryAutoWeb
            .addSetup({
              mainSector: sector,
              type,
              data: this.getDefaultData(),
            })
            .then((resAdd: any) => {
              // Đảm bảo field/value không undefined
              resAdd.data.data.forEach((item: ShoppingFieldData) => {
                if (item.type === 'field' && !item.field) item.field = '';
                if (item.type === 'value' && !item.value) item.value = '';
              });
              this.dataSetups[sector] = resAdd.data;
              this.loadings[sector] = false;
            });
        } else if (res.length > 1) {
          console.error('Có nhiều hơn 1 setup', res);
          this.loadings[sector] = false;
        } else {
          // Chuẩn hoá dữ liệu cũ/new
          const raw = res[0];
          const normalized: ShoppingFieldData[] = (raw.data || []).map((item: any) => {
            // Nếu chưa có type: auto suy ra
            const type: 'value' | 'field' =
              item.type ||
              (item.field && item.field !== '' ? 'field' : 'value');

            return {
              key: item.key,
              label: item.label,
              type,
              field: item.field || '',
              // ưu tiên value, nếu không có thì lấy defaultValue cũ, cuối cùng là ''
              value: item.value != null ? item.value : (item.defaultValue != null ? item.defaultValue : ''),
            };
          });

          normalized.forEach((item) => {
            if (item.type === 'field' && !item.field) item.field = '';
            if (item.type === 'value' && !item.value) item.value = '';
          });

          this.dataSetups[sector] = {
            ...raw,
            data: normalized,
          };
          this.loadings[sector] = false;
        }
      })
      .catch((error: any) => {
        console.error('Error in getSetups:', error);
        this.dataSetups[sector] = { data: [] };
        this.loadings[sector] = false;
      });
  }

  onDataChange(sector: string) {
    const dataSetup = this.getData(sector);
    this.vhQueryAutoWeb
      .updateSetup(dataSetup._id, { data: dataSetup.data })
      .then(() => {
        console.log('Cập nhật thành công');
      })
      .catch((error: any) => {
        console.error('Lỗi khi cập nhật:', error);
      });
  }

  showStructureProduct(sector: string) {
    this.dialog.open(StructureProductComponent, {
      width: '80vw',
      height: '700px',
      data: { product: this.productSamples[sector] },
    });
  }

  getSampleData(sector: string) {
    let apiCall: Promise<any>;
    switch (sector) {
      case 'ecommerce':
        apiCall = this.vhQueryAutoWeb.getProducts_byFields(
          {},
          {},
          { ['name_' + this.functionService.selectedLanguageCode]: 1 },
          1,
          1
        );
        break;
      case 'food_drink':
        apiCall = this.vhQueryAutoWeb.getFoods_byFields(
          {},
          {},
          { ['name_' + this.functionService.selectedLanguageCode]: 1 },
          1,
          1
        );
        break;
      case 'web_app':
        apiCall = this.vhQueryAutoWeb.getWebApps_byFields(
          {},
          {},
          { ['name_' + this.functionService.selectedLanguageCode]: 1 },
          1,
          1
        );
        break;
      default:
        return;
    }

    apiCall
      .then((res: any) => {
        this.productSamples[sector] = res.data[0] || {};
        this.fieldsBySector[sector] = this.getFields(sector);
        this.fieldsBySector[sector] = this.vhAlgorithm.sortStringbyASC(
          this.fieldsBySector[sector],
          'field_custom'
        );
      })
      .catch((error: any) => {
        console.error(`Lỗi khi lấy sample data cho ${sector}:`, error);
        this.productSamples[sector] = {};
        this.fieldsBySector[sector] = [];
      });
  }

  getFields(sector: string): any[] {
    const sample = this.productSamples[sector] || {};
    const fields: any[] = [];

    const extractFields = (obj: any, prefix: string = ''): void => {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        const currentPath = prefix ? `${prefix}.${key}` : key;

        fields.push({
          field_custom: currentPath,
          field_label: currentPath,
        });

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          extractFields(value, currentPath);
        } else if (Array.isArray(value)) {
          if (value.length > 0 && typeof value[0] !== 'object') {
            value.forEach((_: any, index: number) => {
              fields.push({
                field_custom: `${currentPath}[${index}]`,
                field_label: `${currentPath}[${index}]`,
              });
            });
          } else if (value.length > 0 && typeof value[0] === 'object') {
            extractFields(value[0], `${currentPath}[0]`);
          }
        }
      });
    };

    extractFields(sample);
    return fields;
  }

  groupedFields(sector: string): any[] {
    const fields = this.fieldsBySector[sector] || [];
    const groups: { [key: string]: any } = {};

    fields.forEach((field) => {
      const parts = field.field_custom.split('.');
      const groupName = parts.length > 1 ? parts[0] : 'Fields';
      if (!groups[groupName]) {
        groups[groupName] = { label: groupName, fields: [] };
      }
      groups[groupName].fields.push(field);
    });

    return Object.values(groups);
  }

  trackByGroup(_: number, group: any): string {
    return group.label;
  }

  trackByField(_: number, field: any): string {
    return field.field_custom;
  }
}
