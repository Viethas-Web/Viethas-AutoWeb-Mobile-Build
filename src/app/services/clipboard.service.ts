import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { VhQueryAutoWeb } from 'vhautowebdb';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VhComponent } from '../components/vh-component/vh-component';

@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  public dataCopied: any; // Dữ liệu được lưu trữ khi thực hiện ctrl+C
  public typeDataCopied: string = ''; // Dữ liệu copy là loại block, frame, object
  public id_block_created: string = ''; // Id block vừa tạo được
  public id_frame_created: string = ''; // Id frame vừa tạo được
  public framesDataCopied = []; // Toàn bộ frame trong biến dataCopied
  public objectsDataCopied = []; // Toàn bộ object trong biến dataCopied
  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    private notification: NzNotificationService,
    private vhcomponent: VhComponent,
    private router: Router
  ) { }

  /** Gán dữ liệu muốn copy
   *
   * @param dataCopied
   */
  setDataCopy(dataCopied: any, typeDataCopied: string) {
    this.dataCopied = dataCopied;
    this.typeDataCopied = typeDataCopied;
  }

  /** Hàm thực hiện xử lí paste đối tượng sao chép
   *
   * @param to_page_or_block_or_frame // Đối tượng được paste
   * @param typePasted 'block', 'frame', 'page' kiểu đối tượng được paste vào
   */
  handlePaste(
    to_page_or_block_or_frame: any,
    typePasted: string
  ): Promise<unknown> {
    return new Promise((resolve) => {
      try {
        if (!this.dataCopied) resolve(false);
        switch (this.typeDataCopied) {
          case 'object':
            if (typePasted == 'block') {
              this.pasteObjectToBlock(to_page_or_block_or_frame);
            }
            if (typePasted == 'frame') {
              this.pasteObjectToFrame(to_page_or_block_or_frame);
            }
            break;
          case 'frame':
            if (typePasted == 'block') {
              this.pasteFrameToBlock(to_page_or_block_or_frame);
            }
            if (typePasted == 'frame') {
              this.pasteFrameToFrame(to_page_or_block_or_frame);
            }
            break;
          case 'block':
            if (typePasted == 'page') {
              this.pasteBlockToPage(to_page_or_block_or_frame);
              break;
            }
        }
        // this.getAllDataCopied(this.dataCopied);
        // if (to_page_or_block_or_frame === '') {
        //   // Trường hợp paste dữ liệu vào page
        //   this.handlePasteToPage(this.dataCopied);
        // } else {
        //   this.handlePasteToBlockOrFrame(this.dataCopied);
        //   // Trường hợp paste dữ liệu vào khối hoặc khung được chọn
        // }

        resolve(true);
      } catch (error) {
        resolve(false);
      }
    });
  }

  /**
   * hàm này để tạo nhân bản block
   * @param to_page_or_block_or_frame 
   */
  pasteBlockToPage(to_page_or_block_or_frame: any) {
    console.log('pasteBlockToPage');
    
    let data_block = { ...this.dataCopied }
    delete data_block.id_block; delete data_block.height; delete data_block.top; delete data_block.width; delete data_block.left;
    delete data_block._id; delete data_block.z_index; delete data_block.resizing;
    delete data_block.frames_of_block; delete data_block.objects_of_block;

    data_block.frames = [];
    // data_block.objects = [];
    data_block.desktop_position = {
      ...data_block.desktop_position,
      top: data_block.desktop_position.top + 10
    };
    data_block.mobile_position = {
      ...data_block.mobile_position,
      top: data_block.mobile_position.top + 10
    };
    this.vhQueryAutoWeb.addBlock(data_block)
      .then((block: any) => {
        console.log('addBlock', block);
        // for (let i in this.dataCopied.frames_of_block) {
        //   this.addFrames(this.dataCopied.frames_of_block[i], { id_block: block._id })
        // }
        // for (let i in this.dataCopied.objects_of_block) {
        //   this.addObjects(this.dataCopied.objects_of_block[i], { id_block: block._id })
        // }
        return
      }, (error: any) => {
        console.log('error', error);
      })
   
  }

  addFrames(frame: any, id_block_or_frame) {
    let data_frame = { ...frame }
    delete data_frame.id_block; delete data_frame.height; delete data_frame.top; delete data_frame.width; delete data_frame.left;
    delete data_frame.id_frame; delete data_frame._id; delete data_frame.z_index; delete data_frame.resizing;
    delete data_frame.frames_of_block; delete data_frame.objects_of_block;

    data_frame.frames = [];
    data_frame.objects = [];
    this.vhQueryAutoWeb.addFrame({ ...data_frame, ...id_block_or_frame })
      .then((frame_response: any) => {
        for (let i in frame.frames) {
          this.addFrames(frame.frames[i], { id_frame: frame_response._id })
        }
        for (let i in frame.objects) {
          this.addObjects(frame.objects[i], { id_frame: frame_response._id })
        }
      }, (error: any) => {
        console.log('error', error);
      })
  }

  addObjects(object, id_block_or_frame) {
    let data_object = { ...object }
    delete data_object.id_block; delete data_object.id_frame; delete data_object.isResize;
    this.vhQueryAutoWeb.addObject({ ...object, ...id_block_or_frame })
      .then((object) => {
        console.log('addObject', object);
      }, (error: any) => {
        console.log('error', error);
      })
  }




  pasteFrameToFrame(to_page_or_block_or_frame: any) {
    throw new Error('Method not implemented.');
  }
  pasteFrameToBlock(to_page_or_block_or_frame: any) {
    throw new Error('Method not implemented.');
  }
  pasteObjectToFrame(to_page_or_block_or_frame: any) {
    throw new Error('Method not implemented.');
  }

  async pasteObjectToBlock(to_page_or_block_or_frame: any) {
    let object = await this.vhQueryAutoWeb.getObject(this.dataCopied._id);
    Object.keys(object).forEach((key) => {
      if (['id_block', 'id_frame', '_id'].includes(key)) {
        delete object[key]
      }
    })
    object['id_block']
    console.log('pasteObjectToBlock\n', object);

  }

  async getAllDataCopied(dataCopied: any) {
    if (this.typeDataCopied == 'block') {
      const block = await this.vhQueryAutoWeb.getDetailBlock(dataCopied._id);
    }

    if (this.typeDataCopied == 'frame') {
      const frame = await this.vhQueryAutoWeb.getDetailFrame(dataCopied._id);
      console.log('frame \n', frame);
    }
    if (this.typeDataCopied == 'object') {
      const object = await this.vhQueryAutoWeb.getObject(dataCopied._id);
      console.log('object \n', object);
    }
  }

  traverse(data: any, type?: string) {
    // Object.keys(data).forEach((key) => {
    //   console.log(`${key} ${type}\n`, data[key]);
    //   if(['frames'])
    //   // if (Array.isArray(data[key])) {
    //   //   if (data[key].length > 0) {
    //   //     data[key].forEach((val) => {
    //   //       this.traverse(val);
    //   //     });
    //   //   }
    //   // }
    // });
  }
}
