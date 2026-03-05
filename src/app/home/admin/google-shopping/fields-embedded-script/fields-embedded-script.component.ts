import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { StructureScriptComponent } from './structure-script/structure-script.component';
import { StructureProductComponent } from '../fields-google-shopping/structure-product/structure-product.component';
import { FunctionService } from 'vhobjects-service';

interface Tab {
  title: string;
  sector: string;
  type: string;
}

interface FieldData {
  key: string;
  type: 'value' | 'field';
  value?: string | object;
  field?: string;
}

@Component({
  selector: 'app-fields-embedded-script',
  templateUrl: './fields-embedded-script.component.html',
  styleUrls: ['./fields-embedded-script.component.scss']
})
export class FieldsEmbeddedScriptComponent implements OnInit {
  tabs: Tab[] = [
    { title: 'san_pham', sector: 'ecommerce', type: 'fields_embedded_script' },
    { title: 'mon_an', sector: 'food_drink', type: 'fields_embedded_script' },
    { title: 'webapp', sector: 'web_app', type: 'fields_embedded_script' }
  ];

  dataSetups: { [key: string]: { _id?: string; data: FieldData[] } } = {};
  productSamples: { [key: string]: any } = {};
  fieldsBySector: { [key: string]: any[] } = {};
  loadings: { [key: string]: boolean } = {};
  editIndices: { [key: string]: number | null } = {};
  keyErrorIndices: { [key: string]: number | null } = {};

  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private dialog: MatDialog,
    private vhAlgorithm: VhAlgorithm,
    public functionService: FunctionService,
  ) {
    this.tabs.forEach(tab => {
      this.dataSetups[tab.sector] = { data: [] };
      this.productSamples[tab.sector] = {};
      this.fieldsBySector[tab.sector] = [];
      this.loadings[tab.sector] = false;
      this.editIndices[tab.sector] = null;
      this.keyErrorIndices[tab.sector] = null;
    });
  }

  ngOnInit(): void {
    this.tabs.forEach(tab => {
      this.loadings[tab.sector] = true;
      this.getSetups(tab.sector, tab.type);
      this.getSampleData(tab.sector);
    });
  }

  getData(sector: string): { _id?: string; data: FieldData[] } {
    return this.dataSetups[sector] || { data: [] };
  }

  getSetups(sector: string, type: string): void {
    this.vhQueryAutoWeb.getSetups_byFields({ type, mainSector: sector })
      .then((res: any) => {
        if (res.length === 0) {
          this.vhQueryAutoWeb.addSetup({
            mainSector: sector,
            type,
            data: this.getDefaultData()
          }).then((resAdd: any) => {
            resAdd.data.data.forEach((item: FieldData) => {
              if (item.type === 'field' && !item.field) item.field = '';
              if (item.type === 'value' && !item.value) item.value = '';
            });
            this.dataSetups[sector] = resAdd.data;
            this.loadings[sector] = false;
          });
        } else {
          res[0].data.forEach((item: FieldData) => {
            if (item.type === 'field' && !item.field) item.field = '';
            if (item.type === 'value' && !item.value) item.value = '';
          });
          this.dataSetups[sector] = res[0];
          this.loadings[sector] = false;
        }
      })
      .catch((error: any) => {
        console.error('Error in getSetups:', error);
        this.dataSetups[sector] = { data: [] };
        this.loadings[sector] = false;
      });
  }

  getDefaultData(): FieldData[] {
    return [
      { key: 'name', type: 'value', value: '' },
      { key: '@context', type: 'value', value: 'https://schema.org/' },
      { key: '@type', type: 'value', value: 'Product' },
      { key: 'image', type: 'value', value: '' },
      { key: 'sku', type: 'value', value: '' },
      { key: 'brand.@type', type: 'value', value: 'Brand' }, // Thêm @type của brand
      { key: 'brand.name', type: 'value', value: '' },
      { key: 'description', type: 'value', value: '' },
      { key: 'aggregateRating.@type', type: 'value', value: 'AggregateRating' }, // Thêm @type của aggregateRating
      { key: 'aggregateRating.ratingValue', type: 'value', value: '5.0' },
      { key: 'aggregateRating.reviewCount', type: 'value', value: '50' },
      { key: 'offers.@type', type: 'value', value: 'Offer' }, // Thêm @type của offers
      { key: 'offers.priceCurrency', type: 'value', value: 'VND' },
      { key: 'offers.price', type: 'value', value: '1000000' },
      { key: 'offers.availability', type: 'value', value: 'https://schema.org/InStock' },
      { key: 'offers.url', type: 'value', value: '' }
    ];
  }

  startEdit(index: number, sector: string): void {
    this.editIndices[sector] = index;
  }

  stopEdit(sector: string): void {
    const editIndex = this.editIndices[sector];
    if (editIndex !== null) {
      const dataSetup = this.getData(sector);
      const currentKey = dataSetup.data[editIndex].key;
      if (dataSetup.data.some((d, idx) => d.key === currentKey && idx !== editIndex)) {
        this.keyErrorIndices[sector] = editIndex;
        return;
      }
      this.keyErrorIndices[sector] = null;
      this.editIndices[sector] = null;
      this.updateSetup(sector);
    }
  }

  addRow(sector: string, index: number): void {
    const dataSetup = this.getData(sector);
    const newRow: FieldData = {
      key: `name_${dataSetup.data.length + 1}`,
      type: 'value',
      value: ''
    };
    // Chèn hàng mới ngay sau index hiện tại
    dataSetup.data.splice(index + 1, 0, newRow);
    this.updateSetup(sector);
  }

  deleteRow(key: string, sector: string): void {
    const dataSetup = this.getData(sector);
    dataSetup.data = dataSetup.data.filter(d => d.key !== key);
    this.updateSetup(sector);
  }

  updateSetup(sector: string): void {
    const dataSetup = this.getData(sector);
    this.vhQueryAutoWeb.updateSetup(dataSetup._id, { data: dataSetup.data })
  }

  onDataChange(sector: string): void {
    this.updateSetup(sector);
  }

  showStructure(sector: string): void {
    this.dialog.open(StructureScriptComponent, {
      width: '850px',
      height: '700px',
      data: { dataSetup: this.getData(sector) }
    });
  }

  showStructureProduct(sector: string): void {
    this.dialog.open(StructureProductComponent, {
      width: '80vw',
      height: '700px',
      data: { product: this.productSamples[sector] }
    });
  }

  getSampleData(sector: string) {
    let apiCall: Promise<any>;
    switch (sector) {
      case 'ecommerce':
        apiCall = this.vhQueryAutoWeb.getProducts_byFields({}, {}, { ['name_'+ this.functionService.selectedLanguageCode]: 1 }, 1, 1);
        break;
      case 'food_drink':
        apiCall = this.vhQueryAutoWeb.getFoods_byFields({}, {}, { ['name_'+ this.functionService.selectedLanguageCode]: 1 }, 1, 1);
        break;
      case 'web_app':
        apiCall = this.vhQueryAutoWeb.getWebApps_byFields({}, {}, { ['name_'+ this.functionService.selectedLanguageCode]: 1 }, 1, 1);
        break;
      default:
        return;
    }

    apiCall
      .then((res: any) => {
        this.productSamples[sector] = res.data[0] || {};
        this.fieldsBySector[sector] = this.getFields(sector);
        this.fieldsBySector[sector] = this.vhAlgorithm.sortStringbyASC(this.fieldsBySector[sector], 'field_custom');
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

    // Hàm đệ quy để xử lý các trường con
    const extractFields = (obj: any, prefix: string = ''): void => {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        const currentPath = prefix ? `${prefix}.${key}` : key;

        // Thêm trường hiện tại
        fields.push({
          field_custom: currentPath,
          field_label: currentPath,
        });

        // Kiểm tra nếu giá trị là object (không phải mảng)
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          extractFields(value, currentPath);
        }
        // Kiểm tra nếu giá trị là mảng
        else if (Array.isArray(value)) {
          // Mảng giá trị đơn giản (không phải object)
          if (value.length > 0 && typeof value[0] !== 'object') {
            value.forEach((_, index) => {
              fields.push({
                field_custom: `${currentPath}[${index}]`,
                field_label: `${currentPath}[${index}]`,
              });
            });
          }
          // Mảng object
          else if (value.length > 0 && typeof value[0] === 'object') {
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