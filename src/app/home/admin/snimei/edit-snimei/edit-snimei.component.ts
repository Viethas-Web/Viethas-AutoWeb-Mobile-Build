import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { VhAlgorithm, VhQueryAutoWeb, VhImage } from 'vhautowebdb';
import { FunctionService } from 'vhobjects-service';
import { LanguageService } from 'src/app/services/language.service';
import { VhCkeditorModalComponent } from '../../components/vh-ckeditor-modal/vh-ckeditor-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'app-edit-snimei',
  templateUrl: './edit-snimei.component.html',
  styleUrls: ['./edit-snimei.component.scss']
})
export class EditSnimeiComponent implements OnInit {
  editSnimeiForm: FormGroup;
  newFields = [];
  newFieldsCKEditor = [];
  doneLoad = false;
  lookupGroup = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  showModal = false;

  constructor(
    public dialogRef: MatDialogRef<EditSnimeiComponent>,
    public vhAlgorithm: VhAlgorithm,
    private el: ElementRef,
    public functionService: FunctionService,
    public vhQueryAutoWeb: VhQueryAutoWeb,
    public vhImage: VhImage,
    public matdialog: MatDialog,
    public languageService: LanguageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit(): void {
    this.getNewFileds();

  }

  ngAfterViewInit(): void {
    // Đoạn này sẽ giúp khởi tạo CKEDITOR không bị ẩn thanh tool lúc khởi tạo
    const webapp_description = document.getElementById('webapp_description');
    if (webapp_description) {
      webapp_description.style.display = 'none';
      setTimeout(() => {
        webapp_description.style.display = 'block';
      }, 500);
    }
  }

  getNewFileds() {
    this.vhQueryAutoWeb.getNewFields_byFields({ id_main_sector: { $eq: 'snimei' } })
      .then((newfields: any) => {
        this.newFields = this.vhAlgorithm.sortNumberbyASC(newfields, 'field_order_number').filter(e => e.field_input_type != 'ckeditor');
        this.newFieldsCKEditor = this.vhAlgorithm.sortNumberbyASC(newfields, 'field_order_number').filter(e => e.field_input_type == 'ckeditor');
        this.initForm();
      });
  }

  /** Hàm khởi tạo form
   *
   */
  initForm(): void {
    this.editSnimeiForm = new FormGroup({
      lookup_group: new FormControl(this.data.lookup_group, Validators.compose([Validators.required])),
      product_id: new FormControl(this.data.product_id, Validators.compose([Validators.required])),
      brand: new FormControl(this.data.brand, Validators.compose([Validators.required])),
      sn_imei: new FormControl(this.data.sn_imei, Validators.compose([Validators.required])),
      warehouse_release_date: new FormControl(this.data.warehouse_release_date, Validators.compose([Validators.required])),
      active: new FormControl(this.data.active),
      warranty_period: new FormControl(this.data.warranty_period, Validators.compose([Validators.required])),
      max_activation_days: new FormControl(this.data.max_activation_days, Validators.compose([Validators.required])),
      active_date: new FormControl(this.data.active_date),
      expiration_date: new FormControl({ value: this.data.expiration_date, disabled: true }),
      date_created: new FormControl(this.data.date_created),
    }, { validators: this.dateComparisonValidator() });

    let fieldNames: any = [
      { field: 'name', validators: { required: true } },
    ];

    this.newFields.filter((f: any) => f.field_input_type == "select-multiple").forEach((field: any) => {
      this.editSnimeiForm.addControl(field.field_custom, new FormControl(this.data[field.field_custom] || [], field.field_required ? [Validators.required] : []));
    });

    this.functionService.multi_languages.forEach((language: any) => {
      this.functionService.adminEditHandleChangeMultiLanguage(
        this.editSnimeiForm,
        language.code,
        [...this.newFields.filter((f: any) => f.field_input_type != "select-multiple"), ...this.newFieldsCKEditor],
        fieldNames,
        this.data,
      );
    });

    this.doneLoad = true;
  }

  dateComparisonValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.get('active')?.value) {
        const purchaseDate = new Date(control.get('warehouse_release_date')?.value);
        const activeDate = new Date(control.get('active_date')?.value);
        const maxActivationDate = new Date(this.addDays(control.get('warehouse_release_date')?.value, Number(control.get('max_activation_days')?.value)));
        purchaseDate.setHours(0, 0, 0, 0); // Set purchaseDate to start of the day
        maxActivationDate.setHours(23, 59, 59, 999); // Set maxActivationDate to end of the day
        if (activeDate < purchaseDate || activeDate > maxActivationDate) {
          return { invalidDates: true };
        }
      }
      return null;
    };
  }

  onClone(): void {
    this.editSnimeiForm.reset();
    this.dialogRef.close(false);
  }

  onEditSnimei(value): void {

    if (value.max_activation_days == null || value.max_activation_days == '' || value.max_activation_days == undefined) {
      value.max_activation_days = 0;
    }



    this.vhQueryAutoWeb.getSNIMEIs_byFields_byPages({ sn_imei: { $eq: value.sn_imei } })
      .then((res: any) => {
        if (res.vcode == 0) {
          if (res.data.length > 0 && res.data[0]._id !== this.data._id) {
            const hasDuplicateSerialNumber = res.data.some(item => item['sn_imei'] === value.sn_imei);

            if (hasDuplicateSerialNumber) {
              this.editSnimeiForm.get('sn_imei').setErrors({ 'incorrect': true });
            }
          } else {
            this.vhQueryAutoWeb.updateSNIMEI(this.data._id, {
              ...value
            })
              .then((res: any) => {
                if (res.vcode == 0) {
                  this.dialogRef.close({ ...value, _id: this.data._id });
                  this.functionService.createMessage('success', 'cap_nhat_thanh_cong');
                }
              })
              .catch((err) => {
                console.error(err.message);
              });
          }
        }
      });


  }

  /**
 *
  // Ví dụ sử dụng:
  const inputDate = 'Sat Aug 24 2024 09:15:49 GMT+0700 (Indochina Time)';
  const days = 365;  // Số ngày cần cộng thêm
  const resultDate = addDaysToFormattedDate(inputDate, days);
  console.log(resultDate);  // Kết quả: "Sun Aug 24 2025 09:15:49 GMT+0700 (Indochina Time)"
  */
  addDays(dateString, daysToAdd): Date {
    // Tạo đối tượng Date từ chuỗi ngày
    const date = new Date(dateString);

    // Cộng thêm số ngày
    date.setDate(date.getDate() + daysToAdd);
    return new Date(date);
  }

  calculateExpirationDate() {
    // Kích hoạt thì sẽ kiểm tra ngày mua cộng với số ngày tối đa được phép kích hoạt có lớn hơn ngày hiện tại không
    // Nếu ngày hiện tại lớn hơn thì sẽ tính ngày hết hạn bằng ngày mua
    // Nếu ngày hiện tại nhỏ hơn thì tính ngày hết hạn bằng ngày kích hoạt

    const maxActivationDate = new Date(this.addDays(this.editSnimeiForm.value.warehouse_release_date, Number(this.editSnimeiForm.value.max_activation_days)));
    let expirationDate;
    if (new Date(this.editSnimeiForm.value.active_date) > maxActivationDate) {
      expirationDate = this.addDays(this.editSnimeiForm.value.warehouse_release_date, Number(this.editSnimeiForm.value.warranty_period));
    } else {
      expirationDate = this.addDays(this.editSnimeiForm.value.active_date, Number(this.editSnimeiForm.value.warranty_period));
    }

    this.editSnimeiForm.patchValue({
      expiration_date: expirationDate
    });


  }

  handleChangeActive(event) {
    if (event) {
      // Kích hoạt thì sẽ kiểm tra ngày mua cộng với số ngày tối đa được phép kích hoạt có lớn hơn ngày hiện tại không
      // Nếu ngày hiện tại lớn hơn thì sẽ tính ngày hết hạn bằng ngày mua
      // Nếu ngày hiện tại nhỏ hơn thì tính ngày hết hạn bằng ngày kích hoạt
      const maxActivationDate = this.addDays(this.editSnimeiForm.value.warehouse_release_date, Number(this.editSnimeiForm.value.max_activation_days)).getTime();
      const currentDate = new Date().getTime();

      let activeDate = new Date();
      let expirationDate;

      if (currentDate > maxActivationDate) {
        expirationDate = this.addDays(this.editSnimeiForm.value.warehouse_release_date, Number(this.editSnimeiForm.value.warranty_period));
      } else {
        expirationDate = this.addDays(activeDate, Number(this.editSnimeiForm.value.warranty_period));
      }
      this.editSnimeiForm.patchValue({
        active_date: activeDate,
        expiration_date: expirationDate
      });
    } else {
      this.editSnimeiForm.patchValue({
        active_date: null,
        expiration_date: null
      });
    }
  }

  getFormControl(controlName: string): FormControl {
    return this.editSnimeiForm.get(controlName) as FormControl;
  }


  selectChange(event, field) {
    this.editSnimeiForm.controls[field].setValue(event);
  }

  getTypeInput(item: any): string {
    if (item.field_input_type === 'input') return 'text';
    if (item.field_input_type === 'input-time') return 'time';
    if (item.field_input_type === 'input-date') return 'date';
    if (item.field_input_type === 'input-number') return 'number';
    return 'text';
  }

  handleEditCkeditor(item) {
    const dialogRef = this.matdialog.open(VhCkeditorModalComponent, {
      width: '60vw',
      height: '80vh',
      data: {
        formData: this.editSnimeiForm,
        item: item,
        type: 'snimeis' // để phân biệt upload ảnh cho danh mục hay sản phẩm
      }
    });

    dialogRef.afterClosed().subscribe(() => {

    });
  }

  getContentSafeHtml(field: string): any {
    const rawHtml = this.getFormControl(field).value;
    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  }

  // CKEDITOR
  selectedIndexTabset = 0;
  private scrollTimer: any;
  public EDITOR = DecoupledEditor;
  private editorListeners: { element: HTMLElement; event: string; handler: any; }[] = [];

  public onReady(editor: any) {
    const main = this.el.nativeElement.querySelector('.main');
    const editable = editor.ui.view.editable.element;
    const ignoredKeys = new Set([
      'Shift', 'Control', 'Alt', 'Meta', 'ArrowUp', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'CapsLock', 'Tab', 'Escape'
    ]);

    /** Debounced scroll trigger */
    const triggerScrollToEditor = () => {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = setTimeout(() => this.scrollToEditor(editor, main), 100);
    };

    /** Only scroll on real typing (ignore modifiers and navigation keys) */
    const handleKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.altKey || event.metaKey || ignoredKeys.has(event.key)) return;
      triggerScrollToEditor();
    };

    editable.addEventListener('keyup', handleKey);
    editable.addEventListener('click', triggerScrollToEditor);

    this.editorListeners.push(
      { element: editable, event: 'keyup', handler: handleKey },
      { element: editable, event: 'click', handler: triggerScrollToEditor }
    );

    const editableEl = editor.ui.getEditableElement();
    editableEl.parentElement.insertBefore(editor.ui.view.toolbar.element, editableEl);

    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) =>
      this.vhImage.MyUploadImageAdapter(loader, `images/database/snimeis`);
  }

  scrollToEditor(editor: any, main: any) {
    const editorEl = editor.ui.view.editable.element;
    if (!main && !editor) return;

    const editorRect = editorEl.getBoundingClientRect();
    const containerRect = main.getBoundingClientRect();

    const data = editor.getData();
    let targetRect: DOMRect;

    if (!data) {
      targetRect = editorRect;
    } else {
      const view = editor.editing.view;
      const domConverter = editor.editing.view.domConverter;
      const selection = view.document.selection;
      const range = selection.getFirstRange();

      if (!range) {
        targetRect = editorRect;
      } else {
        const domRange = domConverter.viewRangeToDom(range);
        const rects = domRange.getClientRects();
        if (rects.length > 0) {
          targetRect = rects[0];
        } else {
          // Handle case when caret is in an empty line or paragraph
          const endContainer = domRange.endContainer as HTMLElement;
          const caretEl = endContainer.nodeType === 3
            ? endContainer.parentElement
            : endContainer;

          if (caretEl) {
            const caretRect = caretEl.getBoundingClientRect();
            // Create a small virtual rect around the caret position
            targetRect = new DOMRect(caretRect.left, caretRect.top + caretRect.height / 2, 1, 1);
          } else {
            targetRect = editorRect;
          }
        }
      }
    }

    const targetTop = targetRect.top - containerRect.top + main.scrollTop;
    const targetBottom = targetRect.bottom - containerRect.top + main.scrollTop;
    const editorTop = editorRect.top - containerRect.top + main.scrollTop;
    const editorBottom = editorRect.bottom - containerRect.top + main.scrollTop;

    const containerHeight = containerRect.height;
    const maxScrollTop = main.scrollHeight - containerHeight;

    let scrollTop: number;

    // Show as much editor content as possible while keeping target visible
    const editorHeight = editorBottom - editorTop;

    if (editorHeight <= containerHeight) {
      // Editor fits entirely - center it
      scrollTop = editorTop - (containerHeight - editorHeight) / 2;
    } else {
      // Editor is larger than container - position to show maximum context around target
      const targetPosition = (targetTop + targetBottom) / 2;

      // Try to center target but ensure we show as much editor as possible
      const idealTop = targetPosition - containerHeight / 2;

      // Adjust to not cut off editor content
      if (idealTop < editorTop) {
        scrollTop = editorTop; // Show from top of editor
      } else if (idealTop + containerHeight > editorBottom) {
        scrollTop = editorBottom - containerHeight; // Show up to bottom of editor
      } else {
        scrollTop = idealTop; // Center target
      }
    }

    const caretRelativeTop = targetTop - scrollTop;
    if (caretRelativeTop < 40) scrollTop -= 40;
    scrollTop = Math.max(0, Math.min(scrollTop, maxScrollTop));

    if (Math.abs(scrollTop - main.scrollTop) > 100) {
      main.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }

  ngOnDestroy() {
    for (const { element, event, handler } of this.editorListeners) {
      element.removeEventListener(event, handler);
    }
    this.editorListeners = [];
  }
}
