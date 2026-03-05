import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FunctionService } from 'vhobjects-service';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-add-embedded-script',
  templateUrl: './add-embedded-script.component.html',
  styleUrls: ['./add-embedded-script.component.scss']
})
export class AddEmbeddedScriptComponent implements OnInit {
  @Input() type_setup: any;
  @Input() type_options: any;
  addEmbeddedScript: FormGroup;
  submitting: boolean = false;
  pages: any[] = [];
  blocks: any[] = [];
  objects: any[] = [];
  isLoadingBlocks = false;
  isLoadingObjects = false;
  constructor(
    private modal: NzModalRef,
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public functionService: FunctionService,
    private message: NzMessageService
  ) { }

  ngOnInit() {
    this.initForm();
    this.loadPages();
  }

  /** Hàm khởi tạo form */
  initForm() {
    this.addEmbeddedScript = new FormGroup({
      data: new FormControl('', Validators.compose([Validators.required])),
      active: new FormControl(true, Validators.compose([Validators.required])),
      data_type: new FormControl('', Validators.compose([Validators.required])),
      page_id: new FormControl('', Validators.compose([])),
      block_id: new FormControl('', Validators.compose([])), // Dùng cho block
      object_id: new FormControl('', Validators.compose([])), // Dùng cho object khi data_type là 'object'
    });
  }

  /** Tải danh sách pages */
  loadPages() {
    this.vhQueryAutoWeb.getPages()
      .then((res: any) => {
        this.pages = res || [];
      })
      .catch(err => {
        console.error('Error fetching pages:', err);
        this.pages = [];
      });
  }

  /** Xử lý khi data_type thay đổi */
  onDataTypeChange(dataType: string) {
    const pageControl = this.addEmbeddedScript.get('page_id');
    const blockControl = this.addEmbeddedScript.get('block_id');
    const objectControl = this.addEmbeddedScript.get('object_id');

    // Reset các giá trị và validator
    pageControl?.setValue('');
    pageControl?.clearValidators();
    objectControl?.setValue('');
    objectControl?.clearValidators();
    blockControl?.setValue('');
    blockControl?.clearValidators();
    this.blocks = [];
    this.objects = [];

    if (dataType === 'page' || dataType === 'block' || dataType === 'object') {
      pageControl?.setValidators([Validators.required]);
    }
    if (dataType === 'block' || dataType === 'object') {
      objectControl?.setValidators([Validators.required]);
    }
    if (dataType === 'object') {
      blockControl?.setValidators([Validators.required]);
    }

    pageControl?.markAsUntouched();
    objectControl?.markAsUntouched();
    blockControl?.markAsUntouched();
    pageControl?.updateValueAndValidity();
    objectControl?.updateValueAndValidity();
    blockControl?.updateValueAndValidity();
  }

  /** Xử lý khi page_id thay đổi */
  onPageChange(pageId: string) {
    const dataType = this.addEmbeddedScript.get('data_type')?.value;

    this.blocks = [];
    this.objects = [];
    this.addEmbeddedScript.get('block_id')?.setValue('');
    this.addEmbeddedScript.get('object_id')?.setValue('');
    this.addEmbeddedScript.get('block_id')?.markAsUntouched();
    this.addEmbeddedScript.get('object_id')?.markAsUntouched();

    // reset loading
    this.isLoadingBlocks = false;
    this.isLoadingObjects = false;

    if ((dataType === 'block' || dataType === 'object') && pageId) {
      this.isLoadingBlocks = true; // bắt đầu loading block

      this.vhQueryAutoWeb.getDetailPage(pageId)
        .then((res: any) => {
          this.blocks = res.blocks || [];
          this.isLoadingBlocks = false; // tắt loading khi xong
        })
        .catch(err => {
          console.error('Error fetching blocks:', err);
          this.blocks = [];
          this.isLoadingBlocks = false; // tắt loading khi lỗi
        });
    }
  }

  /** Xử lý khi block_id (blockId) thay đổi */
  onBlockChange(blockId: string) {
    const dataType = this.addEmbeddedScript.get('data_type')?.value;
    this.objects = [];
    this.addEmbeddedScript.get('object_id')?.setValue('');
    this.addEmbeddedScript.get('object_id')?.markAsUntouched();

    this.isLoadingObjects = false; // reset

    if (dataType === 'object' && blockId) {
      // Nếu objects được lấy từ block (đồng bộ) thì loading chỉ để UX cho rõ ràng
      this.isLoadingObjects = true; // bật loading object

      const block = this.blocks.find((b: any) => b._id === blockId);

      if (block) {
        // cho vào setTimeout để Angular kịp detect change (nhìn loading rõ hơn, optional)
        setTimeout(() => {
          this.objects = this.getAllObjectsFromBlock(block);
          this.isLoadingObjects = false; // tắt loading
        }, 0);
      } else {
        this.objects = [];
        this.isLoadingObjects = false;
      }
    }
  }

  /** Gửi form */
  async onSubmitaddEmbeddedScript(value) {
    // Kiểm tra script có hợp lệ không
    if (this.functionService.checkInvalidScript(value.data)) {
      this.addEmbeddedScript.get('data')?.setErrors({ invalidScript: true });
      this.addEmbeddedScript.get('data')?.markAsTouched();
      this.message.error("Vui lòng nhập đúng cấu trúc cho script")
      return;
    }
    // Kiểm tra nếu data_type là chuỗi rỗng
    if (value.data_type === '') {
      this.addEmbeddedScript.get('data_type')?.setErrors({ required: true });
      this.addEmbeddedScript.get('data_type')?.markAsTouched();
      return;
    }

    // Kiểm tra nếu page_id là chuỗi rỗng khi data_type là 'page', 'block' hoặc 'object'
    if ((value.data_type === 'page' || value.data_type === 'block' || value.data_type === 'object') && value.page_id === '') {
      this.addEmbeddedScript.get('page_id')?.setErrors({ required: true });
      this.addEmbeddedScript.get('page_id')?.markAsTouched();
      return;
    }

    // Kiểm tra nếu block_id là chuỗi rỗng khi data_type là 'block' hoặc 'object'
    if ((value.data_type === 'block' || value.data_type === 'object') && value.block_id === '') {
      this.addEmbeddedScript.get('block_id')?.setErrors({ required: true });
      this.addEmbeddedScript.get('block_id')?.markAsTouched();
      return;
    }

    // Kiểm tra nếu object_id là chuỗi rỗng khi data_type là 'object'
    if (value.data_type === 'object' && value.object_id === '') {
      this.addEmbeddedScript.get('object_id')?.setErrors({ required: true });
      this.addEmbeddedScript.get('object_id')?.markAsTouched();
      return;
    }

    this.submitting = true;
    try {
      // Cập nhật is_embedded_script của id mới thành true
      const dataType = value.data_type;
      const newId = dataType === 'page' ? value.page_id :
        dataType === 'block' ? value.block_id :
        dataType === 'object' ? value.object_id : null;

      if (newId && dataType) {
        if (dataType === 'page') {
          await this.vhQueryAutoWeb.updatePage(newId, { is_embedded_script: value.active });
        } else if (dataType === 'block') {
          await this.vhQueryAutoWeb.updateBlock(newId, { is_embedded_script: value.active });
        } else if (dataType === 'object') {
          await this.vhQueryAutoWeb.updateObject(newId, { is_embedded_script: value.active });
        }
      }

      // Gửi payload để thêm mới setup
      const payload = {
        data: value.data,
        active: value.active,
        data_type: value.data_type,
        type: this.type_setup,
        page_id: value.page_id || undefined,
        block_id: value.block_id || undefined,
        object_id: value.object_id || undefined
      };

      const res:any = await this.vhQueryAutoWeb.addSetup(payload);
      this.submitting = false;
      this.modal.close(res.data);
    } catch (err) {
      console.error('Error adding setup:', err);
      this.submitting = false;
    }
  }

  close() {
    this.modal.close();
  }

  getAllObjectsFromBlock(block:any){
    const result: any[] = [];

    function traverse(objects: any[]) {
      for (const obj of objects) {
        result.push(obj);        // thêm object hiện tại

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