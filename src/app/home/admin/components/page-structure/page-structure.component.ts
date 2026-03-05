import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Input } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { VhEventMediator } from 'vhautowebdb';

@Component({
  selector: 'app-page-structure',
  templateUrl: './page-structure.component.html',
  styleUrls: ['./page-structure.component.scss'],
})
export class PageStructureComponent {
  /** Danh sách các block và object của trang hiện tại */
  @Input() blocks_of_page: any;
  /** Object đang được chọn */
  @Input() objectChoosing: any;
  /** Block đang được chọn */
  @Input() blockChoosing: any;

  treeControl = new NestedTreeControl<any>(node => node.objects);
  /** Dữ liệu sẽ hiển thị lên tree */
  dataSource = new MatTreeNestedDataSource<any>();
  /** Kiểm tra nếu node có child thì trả về true, ngược lại trả về false */
  hasChild = (_: number, node: any) => !!node.objects && node.objects.length > 0;

  /** Subcription để theo dõi sự kiện choose-selected-ruler */
  chooseSubscription: any;

  isVisibleModal: boolean = false;
  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisibleModal = false;
  }


  constructor(
    private vhEventMediator: VhEventMediator,
  ) { }


  ngOnInit() {
    console.log('blocks_of_page', this.blocks_of_page);
    // Theo dõi sự kiện choose-selected-ruler để bắt các action như delete,...
    this.chooseSubscription = this.vhEventMediator.configChanged.subscribe((message: any) => {
      if (message) {
        // console.log(message);
        // Nếu là sự kiện choose-selected-ruler và không phải từ chính component này thì reset lại tree data
        if (message?.status === "choose-selected-ruler" && !message?.is_from_tree) {
          this.resetTreeData();
        }
      }
    });
    // Lắng nghe sự kiện keydown để reset lại tree data khi có sự kiện paste
    window.addEventListener('keydown', this.handleKeydownEvent.bind(this));
  }


  ngOnChanges(changes: any) {
    if(changes.independentDesign && changes.independentDesign.currentValue) {
      this.dataSource.data = this.blocks_of_page;
    }
    else if(changes.blocks_of_page && changes.blocks_of_page.currentValue) {
      this.dataSource.data = this.blocks_of_page;
    }
  }


  ngOnDestroy() {
    this.chooseSubscription?.unsubscribe();
    window.removeEventListener('keydown', this.handleKeydownEvent.bind(this));
  }
  

  /**
   * Khi click vào 1 node trong tree, sẽ bắn sự kiện choose-selected-ruler
   * @param node - node được click 
   */
  picking(node: any) {
    // console.log(node);
    const isBlock = !node.otype;
    const id_parent_choose = !isBlock ? (node.id_block ?? node.id_object) : "";
    const config = {
      status: 'choose-selected-ruler',
      code: node._id,
      choose_block: isBlock,
      choose_object: !isBlock,
      block: isBlock ? node : undefined,
      object: !isBlock ? node : undefined,
      id_parent_choose: id_parent_choose,
      is_from_tree: true,
    };
    this.vhEventMediator.notifyOnConfigChanged(config);
  }
  
  
  /**
   * Xử lý sự kiện copy paste để reset lại tree data
   * @param event 
   */
  handleKeydownEvent(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && (event.key === 'v' || event.key === 'V')) {
      setTimeout(() => {
        this.resetTreeData();
      }, 2000);
    }
  }


  /**
   * Reset lại tree data để cập nhật lại tree
   */
  resetTreeData() {
    const updatedData = [...this.dataSource.data];
    this.dataSource.data = [];
    setTimeout(() => {
      this.dataSource.data = updatedData;
    }, 0);
  }

}
