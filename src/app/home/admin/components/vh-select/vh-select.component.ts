import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { VhAlgorithm } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-vh-select',
  templateUrl: './vh-select.component.html',
  styleUrls: ['./vh-select.component.scss']
})
export class VhSelectComponent implements OnInit {
  @Input() listCategories = [];
  @Input() listMainSectors = [];
  @Input() categoriesChoosing:any = [];
  @Input() multiple:boolean = false;
  @Input() allowEmpty:boolean = true;
  @Input() allowSearch:boolean = true;
  @Input() fieldValue:string = '_id';
  @Input() fieldLabel:string = 'name';
  @Input() labelSearch: string = 'tim_danh_muc';
  @Input() loading: boolean = false;
  /**
   * isObject == true là lưu object, ko lưu trường nữa 
   * ví dụ [
   * {
   *  name: 'name1',
   *  value: 'value1'
   * },
   * {
   *  name: 'name2',
   *  value: 'value2'
   * },
   * ]
   * 
   * categoriesChoosing sẽ là {
   *  name: 'name1',
   *  value: 'value1'
   * }
   * 
   * chứ ko phải là name1
   * 
   */
  @Input() isObject: boolean = false;
  @Output() selectChange = new EventEmitter();
  @Output() selectChangeMainSector = new EventEmitter();
  @ViewChild('emptyCategory') emptyCategory: any;
  showCategory = false;
  labelCategory = '';
  listSearchCategory = [];

  constructor(
    private vhAlgorithm: VhAlgorithm,
    public functionService: FunctionService,
  ) { }

  ngOnInit() {
    if(!this.allowEmpty && this.listCategories?.length && !this.categoriesChoosing.length) {
      this.chooseCategory(null, this.listCategories[0]);
    }
  }

  ngOnChanges( changes ) {
    if(changes.listCategories?.currentValue || changes.fieldValue?.currentValue) {
      this.listSearchCategory = [...this.listCategories];
      this.updateCategoryName()
    }
  }

  toggleSelectCategory(event) {
    event.stopPropagation();
    this.showCategory = !this.showCategory;
  }

  searchCate(value) {
    if (value) {
      this.listCategories = this.vhAlgorithm.searchList(
        this.vhAlgorithm.changeAlias(value),
        this.listSearchCategory,
        [this.fieldLabel + '_' + this.functionService.languageTempCode, this.fieldLabel]
      );
    } else this.listCategories = [...this.listSearchCategory];
  }

  // chooseCategory(event, item) { 
  //   if(!item && this.multiple) return;
  //   event?.stopPropagation();
  //   if(this.multiple) {
  //     if(!this.isObject) {
  //       if (this.categoriesChoosing.includes(item?.[this.fieldValue])) {
  //         this.categoriesChoosing = this.categoriesChoosing.filter((cate) => cate !== item?.[this.fieldValue]);
  //       } else {
  //         this.categoriesChoosing = [...this.categoriesChoosing, item?.[this.fieldValue]];
  //       }
  //     } else {
  //       if (this.categoriesChoosing.find(cate => cate[this.fieldValue] == item?.[this.fieldValue])) {
  //         this.categoriesChoosing = this.categoriesChoosing.filter((cate) => cate[this.fieldValue] !== item?.[this.fieldValue]);
  //       } else {
  //         this.categoriesChoosing = [...this.categoriesChoosing, item];
  //       }
  //     }
  //     this.emptyCategory.nativeElement.checked = this.categoriesChoosing.length == 0;
  //   } else {
  //     this.categoriesChoosing = item?.[this.fieldValue] ? [item?.[this.fieldValue]] : [''];
  //   }
  //   this.updateCategoryName() 
  //   this.showCategory = this.multiple
  //   this.selectChange.emit(this.multiple ? this.categoriesChoosing : this.categoriesChoosing[0]);
  // }

  chooseCategory(event, item) { 
    if(!item && this.multiple) return;
    event?.stopPropagation();
    
    if(this.multiple) {
      if(!this.isObject) {
        if (this.categoriesChoosing.includes(item?.[this.fieldValue])) {
          this.categoriesChoosing = this.categoriesChoosing.filter((cate) => cate !== item?.[this.fieldValue]);
        } else {
          this.categoriesChoosing = [...this.categoriesChoosing, item?.[this.fieldValue]];
        }
      } else {
        // So sánh theo _id
        const existingIndex = this.categoriesChoosing.findIndex(
          cate => cate._id === item?._id
        );
        
        if (existingIndex !== -1) {
          // Đã tồn tại -> XÓA (bỏ chọn)
          this.categoriesChoosing = this.categoriesChoosing.filter(
            (cate) => cate._id !== item?._id
          );
        } else {
          // Chưa tồn tại -> THÊM
          this.categoriesChoosing = [...this.categoriesChoosing, item];
        }
      }
      this.emptyCategory.nativeElement.checked = this.categoriesChoosing.length == 0;
    } else {
      this.categoriesChoosing = item?.[this.fieldValue] ? [item?.[this.fieldValue]] : [''];
    }
    
    this.updateCategoryName() 
    this.showCategory = this.multiple
    this.selectChange.emit(this.multiple ? this.categoriesChoosing : this.categoriesChoosing[0]);
  }

  generateSymBol(array: []) {
    let string = '';
    array.forEach((_) => {
      string = string + `- `;
    });
    return string;
  }

  updateCategoryName() {
    if(!this.categoriesChoosing) return;
    if(!this.isObject) { 
      this.labelCategory = this.listCategories.map(category => {
        return this.categoriesChoosing.includes(category[this.fieldValue]) ? category[this.fieldLabel + '_' + this.functionService.languageTempCode] ? `${category[this.fieldLabel + '_' + this.functionService.languageTempCode]}, ` : `${category[this.fieldLabel]}, ` : ''
      }).filter(item => item !== '').join('') || 'trong';
    } else {
      this.labelCategory = this.listCategories.map(category => {
        return this.categoriesChoosing.find(cate => cate[this.fieldValue] == category[this.fieldValue]) ? category[this.fieldLabel + '_' + this.functionService.languageTempCode] ? `${category[this.fieldLabel + '_' + this.functionService.languageTempCode]}, ` : `${category[this.fieldLabel]}, ` : ''
      }).filter(item => item !== '').join('') || 'trong';
    }

    if(this.categoriesChoosing.length && this.labelCategory != 'trong') {
      this.labelCategory = this.labelCategory.slice(0, -2);
    }
  }

  // isSelected(item:any) {
  //   return this.isObject ? this.categoriesChoosing.filter((c: any) => c[this.fieldValue] == item[this.fieldValue]).length > 0 : this.categoriesChoosing.includes(item[this.fieldValue])
  // }

  isSelected(item: any) {
    return this.isObject 
      ? this.categoriesChoosing.filter((c: any) => c._id == item._id).length > 0 
      : this.categoriesChoosing.includes(item[this.fieldValue])
  }

  getAllCategoryItems(): any[] {
    if (!this.listCategories?.length) return [];
    return this.listCategories.filter(c => c._id === 'all');
  }

  getCategoriesBySector(sectorValue: any): any[] {
    if (!sectorValue || !Array.isArray(this.listCategories)) {
      return [];
    }

    return this.listCategories.filter(
      c => Array.isArray(c.id_main_sectors) && c.id_main_sectors.includes(sectorValue)
    );
  }

  chooseMainSector(event, item){
    if(!item) return;
    event?.stopPropagation();
    this.showCategory = false
    this.labelCategory = item.label || item.name;
    this.selectChangeMainSector.emit(item);
  }
}
