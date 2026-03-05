import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { VhAlgorithm, VhQueryAutoWeb } from 'vhautowebdb';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LanguageService } from 'src/app/services/language.service';
import { NzModalService } from 'ng-zorro-antd/modal'; // đảm bảo đã import
import { FunctionService } from 'vhobjects-service';

@Component({
  selector: 'app-sitemap',
  templateUrl: './sitemap.component.html',
  styleUrls: ['./sitemap.component.scss']
})
export class SitemapComponent implements OnInit {
  date_type: any = 'none';
  sitemap_type: any = 'all';
  dateRange :any={
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  }
  /* Biến này chứa danh sách URL */
  urls: any = [];
  initUrls: any = [];
  /* Biến này dùng để hiển thị loading khi tải dữ liệu */
  loading: boolean = false;
  /* Biến này hiển thị ở html xem sort theo trường nào */
  sortby: any = {
    name: false,
    email: false,
    date_register: false
  };
  /* Biến này dùng để tìm kiếm email URL */
  keySearch: any = '';
  /* Biến này truyền vào hàm để sort */
  sort: any = { name: 1 };
  /* Biến dùng để chứa chiều cao của bảng dữ liệu */
  tableHeight: string ='500px';
  /* Biến này lọc ngày đăng ký người dùng */
  date = [new Date(), new Date()];
  private listDetailPages: any = []


  /* Mảng chứa số lượng sản phẩm hiển thị trong 1 trang */
  dataSitemap: any = []
  filteredSitemap: any = []
  filteredUrls: any = []
  visibleModalReplaceDomain: any = false;
  visibleCreateSitemap: any = false;
  pageIndex: number = 1;
  pageSize: number = 20;
  priorities: any = ['0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1'];
  frequencies: any = ['daily', 'weekly', 'monthly', 'yearly'];
  fieldReplace: any = 'loc';
  domainInput: any = window.location.origin;
  locReplace = '';
  newLocReplace = '';
  priorityReplace = '';
  newPriorityReplace = '';
  changefreqReplace = '';
  newChangefreqReplace = '';
  lastmodReplace = '';
  newLastmodReplace = '';
  categories:any = [];
  isGetCategory:any = false;
  constructor(
    private vhQueryAutoWeb: VhQueryAutoWeb,
    public vhAlgorithm: VhAlgorithm,
    public translate: TranslateService,
    public languageService: LanguageService,
    private changeDetectorRef: ChangeDetectorRef,
    private message: NzMessageService,
    private modal: NzModalService,
    private functionService: FunctionService
  ) { }

  ngOnInit(): void {
  }

  /**
  * Hàm xử lý quét website
  */
  async handleScanWebsite() {
    this.keySearch = '';
    if(this.isGetCategory) {
      this.visibleCreateSitemap = true;
      this.urls = this.initUrls;
      return;
    }
    this.loading = true;
    setTimeout(async () => {
      try {
        const pages: any = await this.vhQueryAutoWeb.getPages_byFields({});
        for (const page of pages) {
          if (
            page.type !== 'detail_product' &&
            page.type !== 'detail_category' &&
            page.type !== 'not_found' &&
            page.type !== 'maintenance'
          ) {
            this.urls.push(`/${page.link}`);
          }
          const res: any = await this.vhQueryAutoWeb.getDetailPage(page._id);
          this.listDetailPages.push(res);
        }
        const res: any = await this.findItemsByComponent('AtwFrameCategories');
        for (const item of res) {
          const textNameComponent = this.findObjectInBlock(item, 'AtwTextCategoryName');
          if (textNameComponent?.staticdata?.link) {
            const link = textNameComponent.staticdata.link;
            const findCategories: any = await this.vhQueryAutoWeb.getCategorys_byFields(
              { [`${item._id}_hidden`]: { $eq: true } },
              {},
              { [item._id + '_ordinal_number']: 1 }
            );

            for (const category of findCategories.data) {
              this.urls.push(`/${link}/${category.link}`);
            }
          }
        }

        const resMenuHorizontal: any = await this.findItemsByComponent('AtwMenuHorizontal');
        for (const menu of resMenuHorizontal) {
          this.recursiveMenu(menu.staticdata.menu_data);
        }

        const resMenuVertical: any = await this.findItemsByComponent('AtwMenuVertical');
        for (const menu of resMenuVertical) {
          this.recursiveMenu(menu.staticdata.menu_data);
        }

        this.urls = [...new Set(this.urls)];
        this.initUrls = [...new Set(this.urls)];
        const links_category_detail = this.listDetailPages
          .filter((p: any) => p.type === 'detail_category')
          .flatMap((p: any) =>
            this.urls.filter((u: any) => u.split('/')[1] === p.link)
          );

        this.categories = (
          await Promise.all(
            links_category_detail.map(async (link) => {
              const res: any = await this.vhQueryAutoWeb.getCategorys_byFields({ link: { $eq: link.split('/')[2] } });
              const cat = res?.data?.[0];
              return cat
                ? {
                    _id: cat._id,
                    link: cat.link,
                    detail_page_link: link,
                    name: cat[`name_${this.functionService.selectedLanguageCode}`],
                    checked: true,
                  }
                : null;
            })
          )
        ).filter(Boolean);
        this.categories = this.vhAlgorithm.sortVietnamesebyASC(this.categories, 'name');
        this.visibleCreateSitemap = true;
        this.isGetCategory = true;
      } finally {
        this.loading = false;
      }
    });
  }


  async processUrl() {
    const configs = [
      { blockType: "AtwFrameProductByCategory", linkComp: "AtwTextName", api: this.vhQueryAutoWeb.getProducts_byFields_byPages.bind(this.vhQueryAutoWeb), field_updated_at: "updated_at", field_created_at: "created_at"},
      { blockType: "AtwFrameNewsByCategory", linkComp: "AtwTextNewsTitle", api: this.vhQueryAutoWeb.getNewss_byFields.bind(this.vhQueryAutoWeb), field_updated_at: "updated_at", field_created_at: "date" },
      { blockType: "AtwFrameWebsiteByCategory", linkComp: "AtwTextName", api: this.vhQueryAutoWeb.getWebApps_byFields.bind(this.vhQueryAutoWeb), field_updated_at: "updated_at", field_created_at: "created_at" },
      { blockType: "AtwFrameServiceByCategory", linkComp: "AtwTextName", api: this.vhQueryAutoWeb.getServices_byFields.bind(this.vhQueryAutoWeb), field_updated_at: "updated_at", field_created_at: "created_at" },
      { blockType: "AtwFrameFoodsByCategory", linkComp: "AtwTextName", api: this.vhQueryAutoWeb.getFoods_byFields.bind(this.vhQueryAutoWeb), field_updated_at: "updated_at", field_created_at: "created_at" },
      { blockType: "AtwFrameRecruitmentByCategory", linkComp: "AtwPositionRecruitment", api: this.vhQueryAutoWeb.getRecruitments_byFields.bind(this.vhQueryAutoWeb), field_updated_at: "updated_at", field_created_at: "created_at" },
    ];


    const findCategories = this.categories.filter((cat: any) => cat.checked);
    //xóa các url khong phai trong danh sach category
    if(this.sitemap_type=='page_by_category'){
      this.urls = this.urls.filter((url: string) => {
        const slug = url.split('/')[2]; // slug[2]
        return findCategories.some((cat: any) => cat.link === slug);
      });
    }

    for (const page of this.listDetailPages) {
      if (page.type !== "detail_category") continue;
      for (const category of findCategories) {
        if(page.link!= category.detail_page_link.split('/')[1]) continue;
        for (const block of page.blocks) {
          for (const cfg of configs) {
            const frame = this.findObjectInBlock(block, cfg.blockType);
            if (!frame) continue;

            const textComp = this.findObjectInBlock(frame, cfg.linkComp);
            const link = textComp?.staticdata?.link;
            if (!link) continue;

            const query: any = {
              webapp_hidden: { $eq: false },
              id_categorys: { $all: [category._id] },
            };

            // Chỉ thêm điều kiện ngày khi date_type khác 'none'
            if (this.date_type && this.date_type !== 'none' && this.date) {
              query[cfg[`field_${this.date_type}`]] = {
                $gte: new Date(this.date[0]).toISOString(),
                $lte: new Date(this.date[1]).toISOString(),
              };
            }

            const res: any = await cfg.api(query, {}, {}, 0, 0);

            res?.data?.forEach((item: any) => {
              this.urls.push(`/${link}/${item.link}`);
            });
          }
        }
      }
    }

    this.urls = [...new Set(this.urls)];
    // xử lý nhiều ngôn ngữ
    if (this.functionService.multi_languages?.length > 1) {
      this.urls = this.functionService.multi_languages.flatMap((lang: any) =>
        this.urls.map((url) => `/${lang?.code}${url}`)
      );
    }
  }


  // hàm đệ quy qua menu
  recursiveMenu(menu: any) {
    for (const item of menu) {
      if (item.group == 'category' && item.id_page_category) {
        if (item.children) {
          item.children.forEach((child: any) => {
            this.urls.push(`/${item.id_page_category}/${child.link}`);
          })
        }
      }

      // link_page có chứa 2 / ví dụ /about-us/contact-us
      // đệ quy qua tìm tất cả trong menu_data
      if (item.link_page && item.link_page.split('/').length == 3) {
        const findDetailPage = this.listDetailPages.find((page: any) => page.link === item.link_page.split('/')[1] && page.type == 'detail_category');
        if (findDetailPage) {
          this.urls.push(item.link_page);
        }
      }

      if (item.children) {
        this.recursiveMenu(item.children);
      }
    }
  }



  @HostListener('window:resize')
  onResize() {
    this.setTableHeight();
  }

  setTableHeight() {
    const container = document.querySelector('#purchase-invoice-today') as HTMLElement;
    const thead = document.querySelector('.ant-table-thead') as HTMLElement;
    const header = document.querySelector('.purchase-invoice-today-header') as HTMLElement;

    if (container && thead && header) {
      this.tableHeight = container.clientHeight - thead.clientHeight - header.clientHeight- 50 + 'px';
      this.changeDetectorRef.detectChanges();
    }
  }

  ngAfterViewInit() {
    const container = document.querySelector('#purchase-invoice-today') as HTMLElement;
    if (container) {
      const ro = new ResizeObserver(() => this.setTableHeight());
      ro.observe(container);
    }
  }

  async findItemsByComponent(component: string) {
    const results = []
    for (const page of this.listDetailPages) {
      for (const block of page.blocks) {
        await this.recursiveFindItemsByComponent(block, component, results);
      }

      for (const block of page.freeblocks) {
        await this.recursiveFindItemsByComponent(block, component, results);
      }
    }
    return results;
  }

  async recursiveFindItemsByComponent(block: any, component: string, results: any[] = []) {
    if (block.component === component && !results.some(item => item._id === block._id)) {
      results.push(block);
    }
    if (block.objects) {
      for (const childBlock of block.objects) {
        await this.recursiveFindItemsByComponent(childBlock, component, results);
      }
    }
  }

  /**
   *
   * hàm này trả về đối tượng muốn tìm kiếm trong cây block
   *
        this.recursiveFindItemsByComponent(childBlock, component, results);
      }
    }
    return results;
  }

  /**
   * 
   * hàm này trả về đối tượng muốn tìm kiếm trong cây block
   * 
   * @param block block cần kiểm tra
   * @param component component cần tìm
   * @returns 
   */
  findObjectInBlock(block: any, component: string): any {
    if (block.component == component) return block;
    if (block.objects) {
      const objectInBlock = block.objects.find((item) => item.component === component);
      if (objectInBlock) {
        return objectInBlock;
      } else {
        for (let childBlock of block.objects) {
          const result = this.findObjectInBlock(childBlock, component);
          if (result) {
            return result;
          }
        }
      }
    }
  }

  /**
   * Hàm lấy dữ liệu từ sitemap file (từ backend hoặc API)
   */
  handleCreateSitemap() {
    this.keySearch = '';
    this.pageIndex = 1;
    this.dataSitemap=[];
    this.loading = true;
    setTimeout(() => {
      this.onCreateSitemapData();
    });
    
  }

  validationDomain(baseUrl: string): boolean {
    const domainRegex = /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/)?$/;
    if (baseUrl === window.location.origin) return true
    if (!domainRegex.test(baseUrl)) return false;
    return true;
  }

  async onCreateSitemapData() {
    let baseUrl = this.domainInput?.trim();
    if (!baseUrl) {
      this.message.error('Vui lòng nhập tên miền');
      this.loading = false;
      return;
    }

    if (!this.validationDomain(baseUrl)) {
      this.message.error('Tên miền không hợp lệ. Vui lòng nhập dạng hợp lệ như https://example.com');
      this.loading = false;
    }

    // ✅ Chuẩn hóa về dạng https://example.com (xóa / cuối và đảm bảo https://)
    try {
      const url = new URL(baseUrl);
      baseUrl = url.origin; // trả về dạng chuẩn: https://example.com
    } catch (error) {
      this.message.error('Lỗi khi xử lý tên miền');
      this.loading = false;
      return;
    }

    await this.processUrl(); // đảm bảo đã có dữ liệu scan
    const currenDate = new Date().toISOString().split('T')[0];

    const dataSitemap = this.urls.map(path => ({
      loc: baseUrl + path,
      lastmod: currenDate,
      changefreq: "daily",
      priority: "0.8"
    }));
    this.saveFileSitemap(dataSitemap);
  }

  /**
   * Hàm reset sitemap về rỗng
   */
  resetSitemap() {
    this.saveFileSitemap([]);
  }

    /**
   * Hàm lưu dữ liệu sitemap đã chỉnh sửa
   * @param records - Dữ liệu sitemap cần lưu
   */
  saveFileSitemap(records: any[]) {
    const isInvalid = records.some((item: any) =>
      !item.loc?.trim() || !item.priority?.trim() || !item.changefreq?.trim()
    );

    if (isInvalid) {
      this.message.error('Vui lòng nhập đầy đủ các trường: loc, priority và changefreq!');
      this.loading = false;
      return;
    }

    const locMap = new Map<string, number>(); // Map<loc, dòng đầu tiên>
    const duplicateIndices = new Set<number>();

    for (let i = 0; i < records.length; i++) {
      const item = records[i];
      const loc = item.loc?.trim();

      if (loc) {
        if (locMap.has(loc)) {
          this.message.error(`Có nhiều hơn 1 giá trị loc: '${loc}'.`);
          duplicateIndices.add(i);
        } else {
          locMap.set(loc, i + 1);
        }
      }
    }

    // Xoá các dòng trùng
    const filteredRecords = records.filter((_, i) => !duplicateIndices.has(i));

    // Nếu không có dòng nào hợp lệ sau khi lọc
    if (filteredRecords.length === 0) {
      this.message.error('Không còn dòng nào hợp lệ để lưu sau khi loại bỏ các loc trùng!');
      this.loading = false;
      return;
    }

    this.dataSitemap = this.vhAlgorithm.sortStringbyASC(filteredRecords, 'loc');
    this.filteredSitemap = [...this.dataSitemap];
    this.visibleCreateSitemap = false;
    this.loading = false;
    this.changeDetectorRef.detectChanges();
    setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
  }
  
  /**
   * Thêm dòng mới vào sitemap tại vị trí chỉ định
   * @param index - Vị trí thêm dòng mới
   */
  addRow(index: number) {
    const baseUrl = this.domainInput?.trim() || '';
    const newRow = {
      loc: baseUrl + this.keySearch + '/',
      priority: '0.8',
      changefreq: 'daily',
      lastmod: new Date().toISOString().split('T')[0]
    };

    this.dataSitemap.splice(index + 1, 0, newRow);
    this.filteredSitemap = [...this.dataSitemap];

    // Focus sau khi DOM update
    setTimeout(() => {
      const input = document.getElementById('loc-input-' + (index + 1));
      input?.focus();
    }, 0);
  }

  /**
   * Xoá dòng khỏi sitemap
   * @param index - Vị trí dòng cần xoá
   */
  removeRow(index: number) {
    this.dataSitemap.splice(index, 1);
    this.filteredSitemap = [...this.dataSitemap];
  }

  /**
   * Hiển thị modal thay thế domain
   */
  replaceAllSitemap(type: any) {
    this.fieldReplace = type;
    this.visibleModalReplaceDomain = true;
  }

  /**
   * Xử lý thay thế domain trong tất cả các URL sitemap
   */
  handleReplaceAllSitemap() {
    // Lấy giá trị tìm kiếm và thay thế tương ứng field đang chọn
    const field = this.fieldReplace;

    const oldValue = this.getOldReplaceValue(field);
    const newValue = this.getNewReplaceValue(field);

    if (!oldValue || !newValue) return;

    this.dataSitemap = this.dataSitemap.map(item => {
      const fieldValue = item[field];

      // Chỉ áp dụng thay thế nếu là chuỗi (loc, changefreq, lastmod)
      if (fieldValue.includes(oldValue)) {
        item[field] = fieldValue.split(oldValue).join(newValue);
      }

      return item;
    });

    this.keySearch = '';
    this.visibleModalReplaceDomain = false;
  }

  getOldReplaceValue(field: string): any {
    return {
      loc: this.locReplace,
      priority: this.priorityReplace,
      changefreq: this.changefreqReplace,
      lastmod: this.lastmodReplace
    }[field];
  }

  getNewReplaceValue(field: string): any {
    return {
      loc: this.newLocReplace,
      priority: this.newPriorityReplace,
      changefreq: this.newChangefreqReplace,
      lastmod: this.newLastmodReplace
    }[field];
  }


  /**
   * Getter trả về dữ liệu sitemap phân trang
   */
  get paginatedDataSitemap() {
    const filtered = this.keySearch?.trim()
      ? this.dataSitemap.filter(item =>
          item.loc?.toLowerCase().includes(this.keySearch.trim().toLowerCase())
        )
      : this.dataSitemap;

    this.filteredSitemap = filtered;
    return filtered
  }

  /**
   * Reset về trang đầu tiên trong phân trang
   */
  resetPagination() {
    this.pageIndex = 1;
  }

  async refreshSitemap() {
    const oldDataSitemap = [...this.dataSitemap];
    const oldLocs = new Set(oldDataSitemap.map(item => item.loc));

    const baseUrl = window.location.origin;
    this.urls = [];
    await this.handleScanWebsite();

    const currenDate = new Date().toISOString().split('T')[0];

    const newDataSitemap = this.urls
      .map(path => ({
        loc: baseUrl + path,
        lastmod: currenDate,
        changefreq: "daily",
        priority: "0.8"
      }))
      .filter(item => !oldLocs.has(item.loc));

    const mergedData = [...oldDataSitemap, ...newDataSitemap];
    this.saveFileSitemap(mergedData);
  }

  deleteAllSitemap() {
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa tất cả Sitemap?',
      nzContent: 'Bạn có chắc chắn muốn xóa toàn bộ sitemap? Hành động này không thể hoàn tác.',
      nzOkText: 'Xóa',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.loading = true;
        this.vhQueryAutoWeb.saveFileSitemap([]).then((res: any) => {
          this.dataSitemap = [];
          this.filteredSitemap = [];
          this.message.success('Xóa hàng loạt thành công');
          this.loading = false;
        })
      }
    });
  }

  openInNewTab(url: string) {
    window.open(url, '_blank');
  }

  downloadSitemap() {
    if (!this.dataSitemap?.length) return;

    // Tạo XML string
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xmlContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    this.dataSitemap.forEach((item: any) => {
      xmlContent += `  <url>\n`;
      xmlContent += `    <loc>${item.loc}</loc>\n`;
      if (item.lastmod) {
        xmlContent += `    <lastmod>${item.lastmod}</lastmod>\n`;
      }
      if (item.changefreq) {
        xmlContent += `    <changefreq>${item.changefreq}</changefreq>\n`;
      }
      if (item.priority !== undefined) {
        xmlContent += `    <priority>${item.priority}</priority>\n`;
      }
      xmlContent += `  </url>\n`;
    });

    xmlContent += `</urlset>`;

    // Tạo Blob để tải file
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);

    // Tạo link ảo để tải
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();

    // Giải phóng bộ nhớ
    window.URL.revokeObjectURL(url);
  }

  onSiteMapTypeChange(value: string) {
    this.categories.forEach((cat: any) => {
      cat.checked = value === 'all';  // nếu all thì true, còn lại false
    });
  }

  trackByFn(index: number, item: any): any {
    return item.id ?? index;
  }
}
