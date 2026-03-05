import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FunctionService } from 'vhobjects-service';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-edit-embedded-script',
  templateUrl: './edit-embedded-script.component.html',
  styleUrls: ['./edit-embedded-script.component.scss']
})
export class EditEmbeddedScriptComponent implements OnInit {
  @Input() type_options: any;
  @Input() dataEdit: any;
  editEmbeddedScript: FormGroup;
  submitting: boolean = false;
  pages: any[] = [];
  blocks: any[] = [];
  objects: any[] = [];
  previousId: string | null = null; // Biến tạm để lưu id cũ
  previousDataType: string | null = null; // Biến tạm để lưu data_type cũ
  isLoadingBlocks = false;
  isLoadingObjects = false;
  constructor(
    private modal: NzModalRef,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    private message: NzMessageService
  ) { }

  ngOnInit() {
    this.initForm(this.dataEdit);
    this.loadPages();

    // Tải blocks trước, sau đó (nếu cần) mới load objects
    if (
      this.dataEdit?.data_type &&
      (this.dataEdit.data_type === 'block' || this.dataEdit.data_type === 'object') &&
      this.dataEdit.page_id
    ) {
      this.loadBlocks(this.dataEdit.page_id).then(() => {
        if (this.dataEdit?.data_type === 'object' && this.dataEdit.block_id) {
          this.loadObjects(this.dataEdit.block_id);
        }
      });
    }
  }

  /** Hàm khởi tạo form */
  initForm(value: any) {
    // Lưu id và data_type cũ vào biến tạm
    this.previousId = value?.data_type === 'page' ? value?.page_id :
      value?.data_type === 'block' ? value?.block_id :
      value?.data_type === 'object' ? value?.object_id : null;
    this.previousDataType = value?.data_type || null;
    this.editEmbeddedScript = new FormGroup({
      data: new FormControl(value?.data || '', Validators.compose([Validators.required])),
      active: new FormControl(value?.active || true, Validators.compose([Validators.required])),
      data_type: new FormControl(value?.data_type || '', Validators.compose([Validators.required])),
      page_id: new FormControl(value?.page_id || '', Validators.compose([])),
      block_id: new FormControl(value?.block_id || '', Validators.compose([])),
      object_id: new FormControl(value?.object_id || '', Validators.compose([])),
    });

    // Áp dụng validator dựa trên data_type ban đầu
    this.onDataTypeChange(value?.data_type || '');
  }

  /** Tải danh sách pages */
  loadPages() {
    this.vhQueryAutoWeb.getPages()
      .then((res: any) => {
        this.pages = res || [];
        if (this.pages.length === 0) {
          console.warn('No pages found');
        }
      })
      .catch(err => {
        console.error('Error fetching pages:', err);
        this.pages = [];
      });
  }

  /** Tải danh sách blocks */
  loadBlocks(pageId: string): Promise<any[]> {
    this.isLoadingBlocks = true; // bật loading

    return this.vhQueryAutoWeb.getDetailPage(pageId)
      .then((res: any) => {
        this.blocks = res.blocks || [];
        if (this.blocks.length === 0) {
          console.warn('No blocks found for page:', pageId);
        }
        this.isLoadingBlocks = false; // tắt loading
        return this.blocks;
      })
      .catch(err => {
        console.error('Error fetching blocks:', err);
        this.blocks = [];
        this.isLoadingBlocks = false; // tắt loading khi lỗi
        return [];
      });
  }

  /** Tải danh sách objects */
  loadObjects(blockId: string) {
    this.objects = [];
    this.isLoadingObjects = true; // bật loading

    const block = this.blocks.find((b: any) => b._id === blockId);

    if (block) {
      // nếu muốn nhìn rõ spinner hơn có thể để trong setTimeout, không bắt buộc
      setTimeout(() => {
        this.objects = this.getAllObjectsFromBlock(block);

        if (this.objects.length === 0) {
          console.warn('No objects found (flatten) for block:', blockId);
        }

        this.isLoadingObjects = false; // tắt loading
      }, 0);
    } else {
      console.warn('Block not found for blockId:', blockId);
      this.objects = [];
      this.isLoadingObjects = false; // tắt loading
    }
  }

  /** Xử lý khi data_type thay đổi */
  onDataTypeChange(dataType: string) {
    const pageControl = this.editEmbeddedScript.get('page_id');
    const blockControl = this.editEmbeddedScript.get('block_id');
    const objectControl = this.editEmbeddedScript.get('object_id');

    // Reset
    pageControl?.setValue('');
    blockControl?.setValue('');
    objectControl?.setValue('');

    pageControl?.clearValidators();
    blockControl?.clearValidators();
    objectControl?.clearValidators();

    this.blocks = [];
    this.objects = [];

    // PAGE / BLOCK / OBJECT → đều cần page_id
    if (dataType === 'page' || dataType === 'block' || dataType === 'object') {
      pageControl?.setValidators([Validators.required]);

      // Khôi phục page_id nếu đang edit đúng loại
      if (this.dataEdit?.page_id && dataType === this.dataEdit.data_type) {

        pageControl?.setValue(this.dataEdit.page_id);

        // Nếu là block hoặc object thì load blocks
        if (dataType === 'block' || dataType === 'object') {

          // load blocks trước
          this.loadBlocks(this.dataEdit.page_id).then(() => {

            // Nếu là OBJECT mới tiếp tục load objects
            if (dataType === 'object' && this.dataEdit?.block_id) {
              this.editEmbeddedScript.get('block_id')?.setValue(this.dataEdit.block_id);

              this.loadObjects(this.dataEdit.block_id);

              // Khôi phục object_id
              if (this.dataEdit.object_id) {
                objectControl?.setValue(this.dataEdit.object_id);
              }
            } else if (dataType === 'block' && this.dataEdit?.block_id) {
              // Với BLOCK → sau khi load blocks thì chỉ cần khôi phục block_id
              blockControl?.setValue(this.dataEdit.block_id);
            }

          }); // end loadBlocks.then()
        }
      }
    }

    // BLOCK / OBJECT cần block_id
    if (dataType === 'block' || dataType === 'object') {
      blockControl?.setValidators([Validators.required]);
    }

    // OBJECT cần object_id
    if (dataType === 'object') {
      objectControl?.setValidators([Validators.required]);
    }

    pageControl?.updateValueAndValidity();
    blockControl?.updateValueAndValidity();
    objectControl?.updateValueAndValidity();
  }

  /** Xử lý khi page_id thay đổi */
  onPageChange(pageId: string) {
    const dataType = this.editEmbeddedScript.get('data_type')?.value;
    this.blocks = [];
    this.objects = [];
    this.editEmbeddedScript.get('block_id')?.setValue('');
    this.editEmbeddedScript.get('object_id')?.setValue('');
    this.editEmbeddedScript.get('block_id')?.markAsUntouched();
    this.editEmbeddedScript.get('object_id')?.markAsUntouched();

    // reset loading
    this.isLoadingBlocks = false;
    this.isLoadingObjects = false;

    if ((dataType === 'block' || dataType === 'object') && pageId) {
      this.loadBlocks(pageId);
    }
  }

  /** Xử lý khi block_id thay đổi */
  onBlockChange(blockId: string) {
    const dataType = this.editEmbeddedScript.get('data_type')?.value;
    this.objects = [];
    this.editEmbeddedScript.get('object_id')?.setValue('');
    this.editEmbeddedScript.get('object_id')?.markAsUntouched();

    this.isLoadingObjects = false; // reset

    if (dataType === 'object' && blockId) {
      this.loadObjects(blockId);
    }
  }

  /** Gửi form */
  async onSubmiteditEmbeddedScript() {
    // Kiểm tra script có hợp lệ không
    if (this.functionService.checkInvalidScript(this.editEmbeddedScript.get('data')?.value)) {
      this.editEmbeddedScript.get('data')?.setErrors({ invalidScript: true });
      this.editEmbeddedScript.get('data')?.markAsTouched();
      this.message.error("Vui lòng nhập đúng cấu trúc cho script")
      return;
    }
    // Kiểm tra nếu data_type là chuỗi rỗng
    if (this.editEmbeddedScript.get('data_type')?.value === '') {
      this.editEmbeddedScript.get('data_type')?.setErrors({ required: true });
      this.editEmbeddedScript.get('data_type')?.markAsTouched();
      return;
    }

    // Kiểm tra nếu page_id là chuỗi rỗng khi data_type là 'page', 'block' hoặc 'object'
    if ((this.editEmbeddedScript.get('data_type')?.value === 'page' || 
         this.editEmbeddedScript.get('data_type')?.value === 'block' || 
         this.editEmbeddedScript.get('data_type')?.value === 'object') && 
        this.editEmbeddedScript.get('page_id')?.value === '') {
      this.editEmbeddedScript.get('page_id')?.setErrors({ required: true });
      this.editEmbeddedScript.get('page_id')?.markAsTouched();
      return;
    }

    // Kiểm tra nếu block_id là chuỗi rỗng khi data_type là 'block' hoặc 'object'
    if ((this.editEmbeddedScript.get('data_type')?.value === 'block' || 
         this.editEmbeddedScript.get('data_type')?.value === 'object') && 
        this.editEmbeddedScript.get('block_id')?.value === '') {
      this.editEmbeddedScript.get('block_id')?.setErrors({ required: true });
      this.editEmbeddedScript.get('block_id')?.markAsTouched();
      return;
    }

    // Kiểm tra nếu object_id là chuỗi rỗng khi data_type là 'object'
    if (this.editEmbeddedScript.get('data_type')?.value === 'object' && 
        this.editEmbeddedScript.get('object_id')?.value === '') {
      this.editEmbeddedScript.get('object_id')?.setErrors({ required: true });
      this.editEmbeddedScript.get('object_id')?.markAsTouched();
      return;
    }

    this.submitting = true;
    try {
      // Cập nhật is_embedded_script của id cũ thành false
      if (this.previousId && this.previousDataType) {
        if (this.previousDataType === 'page') {
          await this.vhQueryAutoWeb.updatePage(this.previousId, { is_embedded_script: false });
        } else if (this.previousDataType === 'block') {
          await this.vhQueryAutoWeb.updateBlock(this.previousId, { is_embedded_script: false });
        } else if (this.previousDataType === 'object') {
          await this.vhQueryAutoWeb.updateObject(this.previousId, { is_embedded_script: false });
        }
      }

      // Cập nhật is_embedded_script của id mới thành true
      const dataType = this.editEmbeddedScript.get('data_type')?.value;
      const newId = dataType === 'page' ? this.editEmbeddedScript.get('page_id')?.value :
        dataType === 'block' ? this.editEmbeddedScript.get('block_id')?.value :
        dataType === 'object' ? this.editEmbeddedScript.get('object_id')?.value : null;
      const isActive:any = this.editEmbeddedScript.get('active')?.value
      if (newId && dataType) {
        if (dataType === 'page') {
          await this.vhQueryAutoWeb.updatePage(newId, { is_embedded_script: isActive });
        } else if (dataType === 'block') {
          await this.vhQueryAutoWeb.updateBlock(newId, { is_embedded_script: isActive });
        } else if (dataType === 'object') {
          await this.vhQueryAutoWeb.updateObject(newId, { is_embedded_script: isActive });
        }
      }

      // Gửi payload để cập nhật setup
      const payload = {
        data: this.editEmbeddedScript.value.data,
        active: this.editEmbeddedScript.value.active,
        data_type: this.editEmbeddedScript.value.data_type,
        page_id: this.editEmbeddedScript.value.page_id || undefined,
        block_id: this.editEmbeddedScript.value.block_id || undefined,
        object_id: this.editEmbeddedScript.value.object_id || undefined
      };

      const res = await this.vhQueryAutoWeb.updateSetup(this.dataEdit._id, payload);
      this.submitting = false;
      this.modal.close({
        _id: this.dataEdit._id,
        ...payload
      });
    } catch (err) {
      console.error('Error updating setup:', err);
      this.submitting = false;
    }
  }

  close() {
    this.modal.close();
  }

  getAllObjectsFromBlock(block: any) {
    const result: any[] = [];

    function traverse(objects: any[]) {
      for (const obj of objects) {
        result.push(obj); // thêm object hiện tại

        if (obj.objects && obj.objects.length > 0) {
          traverse(obj.objects); // gọi đệ quy nếu có object con
        }
      }
    }

    if (block.objects) {
      traverse(block.objects);
    }

    return result;
  }

}