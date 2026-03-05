import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JsonDataService {
  constructor(private http: HttpClient) { }

  /** Hàm này thực hiện lấy dữ liệu block từ json
   *
   * @param typeBlock kiểu block
   * @returns dữ liệu block
   */
  getBlock(typeBlock: string) {
    const url = `assets/data/blocks/${typeBlock}.json`;
    return this.http.get(url);
  }

  /** Hàm này thực hiện lấy dữ liệu object từ json
   *
   * @param name tên object
   * @param type kiểu object
   * @returns
   */
  getObject(name: string, type: string) {
    let url = `assets/data/objects/object-${type}/${name}.json`;
    return this.http.get(url);
  }

  /** Hàm thực hiện lấy danh sách object từ json
   *
   * @returns
   */
  getObjectList(): Observable<any[]> {
    const url = `assets/data/menu/objects.json`;
    return this.http.get<any[]>(url);
  }

  /** Hàm thực hiện lấy danh sách block từ json
   *
   * @returns
   */
  getBlockList(): Observable<any[]> {
    const url = `assets/data/menu/blocks.json`;
    return this.http.get<any[]>(url);
  }

  /** Hàm thực hiện lấy danh sách frame từ json
   *
   * @returns
   */
  getFrameList(): Observable<any[]> {
    const url = `assets/data/menu/frames.json`;
    return this.http.get<any[]>(url);
  }

  /** Hàm này thực hiện lấy dữ liệu frame từ json
   *
   * @param nameFrame kiểu frame
   * @returns dữ liệu frame
   */
  getFrame(nameFrame: string) {
    const url = `assets/data/frames/${nameFrame}.json`;
    return this.http.get(url);
  }

  getFonts(): Observable<any[]> {
    const url = `assets/fonts/fonts.json`;
    return this.http.get<any[]>(url);
  }

  /**
   * hàm get danh sách lĩnh vực bộ công cụ thiết kế
   * @returns
   */
  getMainSectors(): Observable<any[]> {
    const url = `assets/data/group/main_sectors.json`;
    return this.http.get<any[]>(url);
  }
  getDesignTool(data_array) {
    const url = `assets/data/group/design_tools.json`;
    return new Promise((resolve) => {
      // biến này để gộp chung các dữ liệu get được thành 1 biến duy nhất để xử lý loại bỏ trùng lặp phần tử
      let group = {
        blocks: {
          blank: {
            group_frames: [],
            group_objects: [],
          },
          grid: {
            group_frames: [],
            group_objects: [],
          },

          header: {
            group_frames: [],
            group_objects: []
          },
          footer: {
            group_frames: [],
            group_objects: [],
          },
          chatbox: {
            group_frames: [],
            group_objects: []
          },
          popup_hover: {
            group_frames: [],
            group_objects: []
          },
          popup_tabs: {
            group_frames: [],
            group_objects: []
          },
          block_responsive: {
            group_frames: [],
            group_objects: []
          },
          hover_blank: {
            group_frames: [],
            group_objects: []
          },
          menu_hover: {
            group_frames: [],
            group_objects: []
          },
          popup_detail_product: {
            group_frames: [],
            group_objects: []
          }
        },
        frames: {
          frame_dev: {
            group_frames: [],
            group_objects: [],
          },
          frame_blank: {
            group_frames: [],
            group_objects: [],
          },
          frame_collapse: {
            group_frames: [],
            group_objects: [],
          },
          frame_mutil_blank: {
            group_frames: [],
            group_objects: [],
          },
          frame_cart_products: {
            group_frames: [],
            group_objects: []
          },
          frame_blogs: {
            group_frames: [],
            group_objects: [],
          },
          frame_category_detail: {
            group_frames: [],
            group_objects: []
          },
          frame_services: {
            group_frames: [],
            group_objects: []
          },
          frame_category: {
            group_frames: [],
            group_objects: []
          },
          frame_news_detail: {
            group_frames: [],
            group_objects: []
          },
          frame_news_group: {
            group_frames: [],
            group_objects: []
          },
          frame_news_relate: {
            group_frames: [],
            group_objects: []
          },
          frame_news: {
            group_frames: [],
            group_objects: []
          },
          frame_food_drink: {
            group_frames: [],
            group_objects: []
          },
          frame_food_drink_by_category: {
            group_frames: [],
            group_objects: []
          },
          frame_food_drink_detail: {
            group_frames: [],
            group_objects: []
          },
          frame_food_drink_relate: {
            group_frames: [],
            group_objects: []
          },

          frame_website: {
            group_frames: [],
            group_objects: []
          },
          frame_website_by_category: {
            group_frames: [],
            group_objects: []
          },
          frame_website_detail: {
            group_frames: [],
            group_objects: []
          },
          frame_website_relate: {
            group_frames: [],
            group_objects: []
          },
          frame_product: {
            group_frames: [],
            group_objects: []
          },
          frame_product_by_category: {
            group_frames: [],
            group_objects: []
          },
          frame_product_detail: {
            group_frames: [],
            group_objects: []
          },
          frame_product_relate: {
            group_frames: [],
            group_objects: []
          },
          frame_search_by_keyword: {
            group_frames: [],
            group_objects: []
          },
          frame_brand: {
            group_frames: [],
            group_objects: []
          },
          frame_hotel: {
            group_frames: [],
            group_objects: []
          },
          frame_banner: {
            group_frames: [],
            group_objects: []
          }
        }
      }

      this.http.get<any[]>(url).subscribe((data) => {
        data_array?.forEach(element => {
          if (data[element]) {
            group.blocks.grid.group_frames = group.blocks.grid.group_frames.concat(data[element].blocks.grid ? data[element].blocks.grid.group_frames : [])
            group.blocks.grid.group_objects = group.blocks.grid.group_objects.concat(data[element].blocks.grid ? data[element].blocks.grid.group_objects : [])
            group.blocks.blank.group_frames = group.blocks.blank.group_frames.concat(data[element].blocks.blank ? data[element].blocks.blank.group_frames : [])
            group.blocks.blank.group_objects = group.blocks.blank.group_objects.concat(data[element].blocks.blank ? data[element].blocks.blank.group_objects : [])
            group.blocks.header.group_frames = group.blocks.header.group_frames.concat(data[element].blocks.header ? data[element].blocks.header.group_frames : [])
            group.blocks.header.group_objects = group.blocks.header.group_objects.concat(data[element].blocks.header ? data[element].blocks.header.group_objects : [])
            group.blocks.footer.group_frames = group.blocks.footer.group_frames.concat(data[element].blocks.footer ? data[element].blocks.footer.group_frames : [])
            group.blocks.footer.group_objects = group.blocks.footer.group_objects.concat(data[element].blocks.footer ? data[element].blocks.footer.group_objects : [])
            group.blocks.chatbox.group_frames = group.blocks.chatbox.group_frames.concat(data[element].blocks.chatbox ? data[element].blocks.chatbox.group_frames : [])
            group.blocks.chatbox.group_objects = group.blocks.chatbox.group_objects.concat(data[element].blocks.chatbox ? data[element].blocks.chatbox.group_objects : [])
            group.blocks.popup_hover.group_frames = group.blocks.popup_hover.group_frames.concat(data[element].blocks.popup_hover ? data[element].blocks.popup_hover.group_frames : [])
            group.blocks.popup_hover.group_objects = group.blocks.popup_hover.group_objects.concat(data[element].blocks.popup_hover ? data[element].blocks.popup_hover.group_objects : [])
            group.blocks.popup_tabs.group_frames = group.blocks.popup_tabs.group_frames.concat(data[element].blocks.popup_tabs ? data[element].blocks.popup_tabs.group_frames : [])
            group.blocks.popup_tabs.group_objects = group.blocks.popup_tabs.group_objects.concat(data[element].blocks.popup_tabs ? data[element].blocks.popup_tabs.group_objects : [])
            group.blocks.popup_detail_product.group_frames = group.blocks.popup_detail_product.group_frames.concat(data[element].blocks.popup_detail_product ? data[element].blocks.popup_detail_product.group_frames : [])
            group.blocks.popup_detail_product.group_objects = group.blocks.popup_detail_product.group_objects.concat(data[element].blocks.popup_detail_product ? data[element].blocks.popup_detail_product.group_objects : [])
            group.blocks.hover_blank.group_frames = group.blocks.hover_blank.group_frames.concat(data[element].blocks.hover_blank ? data[element].blocks.hover_blank.group_frames : [])
            group.blocks.hover_blank.group_objects = group.blocks.hover_blank.group_objects.concat(data[element].blocks.hover_blank ? data[element].blocks.hover_blank.group_objects : [])
            group.blocks.menu_hover.group_frames = group.blocks.menu_hover.group_frames.concat(data[element].blocks.menu_hover ? data[element].blocks.menu_hover.group_frames : [])
            group.blocks.menu_hover.group_objects = group.blocks.menu_hover.group_objects.concat(data[element].blocks.menu_hover ? data[element].blocks.menu_hover.group_objects : [])

            group.frames.frame_dev.group_frames = group.frames.frame_dev.group_frames.concat(data[element].frames.frame_dev ? data[element].frames.frame_dev.group_frames : [])
            group.frames.frame_dev.group_objects = group.frames.frame_dev.group_objects.concat(data[element].frames.frame_dev ? data[element].frames.frame_dev.group_objects : [])
            group.frames.frame_blank.group_frames = group.frames.frame_blank.group_frames.concat(data[element].frames.frame_blank ? data[element].frames.frame_blank.group_frames : [])
            group.frames.frame_blank.group_objects = group.frames.frame_blank.group_objects.concat(data[element].frames.frame_blank ? data[element].frames.frame_blank.group_objects : [])
            group.frames.frame_collapse.group_frames = group.frames.frame_collapse.group_frames.concat(data[element].frames.frame_collapse ? data[element].frames.frame_collapse.group_frames : [])
            group.frames.frame_collapse.group_objects = group.frames.frame_collapse.group_objects.concat(data[element].frames.frame_collapse ? data[element].frames.frame_collapse.group_objects : [])
            group.frames.frame_mutil_blank.group_frames = group.frames.frame_mutil_blank.group_frames.concat(data[element].frames.frame_mutil_blank ? data[element].frames.frame_mutil_blank.group_frames : [])
            group.frames.frame_mutil_blank.group_objects = group.frames.frame_mutil_blank.group_objects.concat(data[element].frames.frame_mutil_blank ? data[element].frames.frame_mutil_blank.group_objects : [])
            group.frames.frame_blogs.group_frames = group.frames.frame_blogs.group_frames.concat(data[element].frames.frame_blogs ? data[element].frames.frame_blogs.group_frames : [])
            group.frames.frame_blogs.group_objects = group.frames.frame_blogs.group_objects.concat(data[element].frames.frame_blogs ? data[element].frames.frame_blogs.group_objects : [])
            group.frames.frame_brand.group_frames = group.frames.frame_brand.group_frames.concat(data[element].frames.frame_brand ? data[element].frames.frame_brand.group_frames : [])
            group.frames.frame_brand.group_objects = group.frames.frame_brand.group_objects.concat(data[element].frames.frame_brand ? data[element].frames.frame_brand.group_objects : [])
            group.frames.frame_cart_products.group_frames = group.frames.frame_cart_products.group_frames.concat(data[element].frames.frame_cart_products ? data[element].frames.frame_cart_products.group_frames : [])
            group.frames.frame_cart_products.group_objects = group.frames.frame_cart_products.group_objects.concat(data[element].frames.frame_cart_products ? data[element].frames.frame_cart_products.group_objects : [])
            group.frames.frame_category.group_frames = group.frames.frame_category.group_frames.concat(data[element].frames.frame_category ? data[element].frames.frame_category.group_frames : [])
            group.frames.frame_category.group_objects = group.frames.frame_category.group_objects.concat(data[element].frames.frame_category ? data[element].frames.frame_category.group_objects : [])
            group.frames.frame_category_detail.group_frames = group.frames.frame_category_detail.group_frames.concat(data[element].frames.frame_category_detail ? data[element].frames.frame_category_detail.group_frames : [])
            group.frames.frame_category_detail.group_objects = group.frames.frame_category_detail.group_objects.concat(data[element].frames.frame_category_detail ? data[element].frames.frame_category_detail.group_objects : [])
            group.frames.frame_news.group_frames = group.frames.frame_news.group_frames.concat(data[element].frames.frame_news ? data[element].frames.frame_news.group_frames : [])
            group.frames.frame_news.group_objects = group.frames.frame_news.group_objects.concat(data[element].frames.frame_news ? data[element].frames.frame_news.group_objects : [])
            group.frames.frame_news_detail.group_frames = group.frames.frame_news_detail.group_frames.concat(data[element].frames.frame_news_detail ? data[element].frames.frame_news_detail.group_frames : [])
            group.frames.frame_news_detail.group_objects = group.frames.frame_news_detail.group_objects.concat(data[element].frames.frame_news_detail ? data[element].frames.frame_news_detail.group_objects : [])
            group.frames.frame_news_group.group_frames = group.frames.frame_news_group.group_frames.concat(data[element].frames.frame_news_group ? data[element].frames.frame_news_group.group_frames : [])
            group.frames.frame_news_group.group_objects = group.frames.frame_news_group.group_objects.concat(data[element].frames.frame_news_group ? data[element].frames.frame_news_group.group_objects : [])
            group.frames.frame_news_relate.group_frames = group.frames.frame_news_relate.group_frames.concat(data[element].frames.frame_news_relate ? data[element].frames.frame_news_relate.group_frames : [])
            group.frames.frame_news_relate.group_objects = group.frames.frame_news_relate.group_objects.concat(data[element].frames.frame_news_relate ? data[element].frames.frame_news_relate.group_objects : [])
            group.frames.frame_product.group_frames = group.frames.frame_product.group_frames.concat(data[element].frames.frame_product ? data[element].frames.frame_product.group_frames : [])
            group.frames.frame_product.group_objects = group.frames.frame_product.group_objects.concat(data[element].frames.frame_product ? data[element].frames.frame_product.group_objects : [])
            group.frames.frame_product_detail.group_frames = group.frames.frame_product_detail.group_frames.concat(data[element].frames.frame_product_detail ? data[element].frames.frame_product_detail.group_frames : [])
            group.frames.frame_product_detail.group_objects = group.frames.frame_product_detail.group_objects.concat(data[element].frames.frame_product_detail ? data[element].frames.frame_product_detail.group_objects : [])
            group.frames.frame_product_by_category.group_frames = group.frames.frame_product_by_category.group_frames.concat(data[element].frames.frame_product_by_category ? data[element].frames.frame_product_by_category.group_frames : [])
            group.frames.frame_product_by_category.group_objects = group.frames.frame_product_by_category.group_objects.concat(data[element].frames.frame_product_by_category ? data[element].frames.frame_product_by_category.group_objects : [])
            group.frames.frame_product_relate.group_frames = group.frames.frame_product_relate.group_frames.concat(data[element].frames.frame_product_relate ? data[element].frames.frame_product_relate.group_frames : [])
            group.frames.frame_product_relate.group_objects = group.frames.frame_product_relate.group_objects.concat(data[element].frames.frame_product_relate ? data[element].frames.frame_product_relate.group_objects : [])
            group.frames.frame_search_by_keyword.group_frames = group.frames.frame_search_by_keyword.group_frames.concat(data[element].frames.frame_search_by_keyword ? data[element].frames.frame_search_by_keyword.group_frames : [])
            group.frames.frame_search_by_keyword.group_objects = group.frames.frame_search_by_keyword.group_objects.concat(data[element].frames.frame_search_by_keyword ? data[element].frames.frame_search_by_keyword.group_objects : [])
            group.frames.frame_services.group_frames = group.frames.frame_services.group_frames.concat(data[element].frames.frame_services ? data[element].frames.frame_services.group_frames : [])
            group.frames.frame_services.group_objects = group.frames.frame_services.group_objects.concat(data[element].frames.frame_services ? data[element].frames.frame_services.group_objects : [])
            group.frames.frame_hotel.group_frames = group.frames.frame_hotel.group_frames.concat(data[element].frames.frame_hotel ? data[element].frames.frame_hotel.group_frames : [])
            group.frames.frame_hotel.group_objects = group.frames.frame_hotel.group_objects.concat(data[element].frames.frame_hotel ? data[element].frames.frame_hotel.group_objects : [])
            group.frames.frame_banner.group_frames = group.frames.frame_banner.group_frames.concat(data[element].frames.frame_banner ? data[element].frames.frame_banner.group_frames : [])
            group.frames.frame_banner.group_objects = group.frames.frame_banner.group_objects.concat(data[element].frames.frame_banner ? data[element].frames.frame_banner.group_objects : [])
            group.frames.frame_website.group_frames = group.frames.frame_website.group_frames.concat(data[element].frames.frame_website ? data[element].frames.frame_website.group_frames : [])
            group.frames.frame_website.group_objects = group.frames.frame_website.group_objects.concat(data[element].frames.frame_website ? data[element].frames.frame_website.group_objects : [])
            group.frames.frame_website_by_category.group_frames = group.frames.frame_website_by_category.group_frames.concat(data[element].frames.frame_website_by_category ? data[element].frames.frame_website_by_category.group_frames : [])
            group.frames.frame_website_by_category.group_objects = group.frames.frame_website_by_category.group_objects.concat(data[element].frames.frame_website_by_category ? data[element].frames.frame_website_by_category.group_objects : [])
            group.frames.frame_website_detail.group_frames = group.frames.frame_website_detail.group_frames.concat(data[element].frames.frame_website_detail ? data[element].frames.frame_website_detail.group_frames : [])
            group.frames.frame_website_detail.group_objects = group.frames.frame_website_detail.group_objects.concat(data[element].frames.frame_website_detail ? data[element].frames.frame_website_detail.group_objects : [])
            group.frames.frame_website_relate.group_frames = group.frames.frame_website_relate.group_frames.concat(data[element].frames.frame_website_relate ? data[element].frames.frame_website_relate.group_frames : [])
            group.frames.frame_website_relate.group_objects = group.frames.frame_website_relate.group_objects.concat(data[element].frames.frame_website_relate ? data[element].frames.frame_website_relate.group_objects : [])
            
            group.frames.frame_food_drink.group_frames = group.frames.frame_food_drink.group_frames.concat(data[element].frames.frame_food_drink ? data[element].frames.frame_food_drink.group_frames : [])
            group.frames.frame_food_drink.group_objects = group.frames.frame_food_drink.group_objects.concat(data[element].frames.frame_food_drink ? data[element].frames.frame_food_drink.group_objects : [])
            group.frames.frame_food_drink_by_category.group_frames = group.frames.frame_food_drink_by_category.group_frames.concat(data[element].frames.frame_food_drink_by_category ? data[element].frames.frame_food_drink_by_category.group_frames : [])
            group.frames.frame_food_drink_by_category.group_objects = group.frames.frame_food_drink_by_category.group_objects.concat(data[element].frames.frame_food_drink_by_category ? data[element].frames.frame_food_drink_by_category.group_objects : [])
            group.frames.frame_food_drink_detail.group_frames = group.frames.frame_food_drink_detail.group_frames.concat(data[element].frames.frame_food_drink_detail ? data[element].frames.frame_food_drink_detail.group_frames : [])
            group.frames.frame_food_drink_detail.group_objects = group.frames.frame_food_drink_detail.group_objects.concat(data[element].frames.frame_food_drink_detail ? data[element].frames.frame_food_drink_detail.group_objects : [])
            group.frames.frame_food_drink_relate.group_frames = group.frames.frame_food_drink_relate.group_frames.concat(data[element].frames.frame_food_drink_relate ? data[element].frames.frame_food_drink_relate.group_frames : [])
            group.frames.frame_food_drink_relate.group_objects = group.frames.frame_food_drink_relate.group_objects.concat(data[element].frames.frame_food_drink_relate ? data[element].frames.frame_food_drink_relate.group_objects : [])
          }
        });
        // tiến hành loại bỏ phần tử trùng lặp trong mảng

        group.blocks.grid.group_frames = Array.from(new Set(group.blocks.grid.group_frames));
        group.blocks.grid.group_objects = Array.from(new Set(group.blocks.grid.group_objects));
        group.blocks.blank.group_frames = Array.from(new Set(group.blocks.blank.group_frames));
        group.blocks.blank.group_objects = Array.from(new Set(group.blocks.blank.group_objects));
        group.blocks.header.group_frames = Array.from(new Set(group.blocks.header.group_frames));
        group.blocks.header.group_objects = Array.from(new Set(group.blocks.header.group_objects));
        group.blocks.footer.group_frames = Array.from(new Set(group.blocks.footer.group_frames));
        group.blocks.footer.group_objects = Array.from(new Set(group.blocks.footer.group_objects));
        group.blocks.chatbox.group_frames = Array.from(new Set(group.blocks.chatbox.group_frames));
        group.blocks.chatbox.group_objects = Array.from(new Set(group.blocks.chatbox.group_objects));
        group.blocks.popup_hover.group_frames = Array.from(new Set(group.blocks.popup_hover.group_frames));
        group.blocks.popup_hover.group_objects = Array.from(new Set(group.blocks.popup_hover.group_objects));
        group.blocks.popup_tabs.group_frames = Array.from(new Set(group.blocks.popup_tabs.group_frames));
        group.blocks.popup_tabs.group_objects = Array.from(new Set(group.blocks.popup_tabs.group_objects));
        group.blocks.popup_detail_product.group_frames = Array.from(new Set(group.blocks.popup_detail_product.group_frames));
        group.blocks.popup_detail_product.group_objects = Array.from(new Set(group.blocks.popup_detail_product.group_objects));
        group.blocks.hover_blank.group_frames = Array.from(new Set(group.blocks.hover_blank.group_frames));
        group.blocks.hover_blank.group_objects = Array.from(new Set(group.blocks.hover_blank.group_objects));
        group.blocks.menu_hover.group_frames = Array.from(new Set(group.blocks.menu_hover.group_frames));
        group.blocks.menu_hover.group_objects = Array.from(new Set(group.blocks.menu_hover.group_objects));
        group.blocks.popup_detail_product.group_frames = Array.from(new Set(group.blocks.popup_detail_product.group_frames));
        group.blocks.popup_detail_product.group_objects = Array.from(new Set(group.blocks.popup_detail_product.group_objects));

        group.frames.frame_dev.group_frames = Array.from(new Set(group.frames.frame_dev.group_frames));
        group.frames.frame_dev.group_objects = Array.from(new Set(group.frames.frame_dev.group_objects));
        group.frames.frame_blank.group_frames = Array.from(new Set(group.frames.frame_blank.group_frames));
        group.frames.frame_blank.group_objects = Array.from(new Set(group.frames.frame_blank.group_objects));
        group.frames.frame_collapse.group_frames = Array.from(new Set(group.frames.frame_collapse.group_frames));
        group.frames.frame_collapse.group_objects = Array.from(new Set(group.frames.frame_collapse.group_objects));
        group.frames.frame_mutil_blank.group_frames = Array.from(new Set(group.frames.frame_mutil_blank.group_frames));
        group.frames.frame_mutil_blank.group_objects = Array.from(new Set(group.frames.frame_mutil_blank.group_objects));
        group.frames.frame_blogs.group_frames = Array.from(new Set(group.frames.frame_blogs.group_frames));
        group.frames.frame_blogs.group_objects = Array.from(new Set(group.frames.frame_blogs.group_objects));
        group.frames.frame_brand.group_frames = Array.from(new Set(group.frames.frame_brand.group_frames));
        group.frames.frame_brand.group_objects = Array.from(new Set(group.frames.frame_brand.group_objects));
        group.frames.frame_cart_products.group_frames = Array.from(new Set(group.frames.frame_cart_products.group_frames));
        group.frames.frame_cart_products.group_objects = Array.from(new Set(group.frames.frame_cart_products.group_objects));
        group.frames.frame_category.group_frames = Array.from(new Set(group.frames.frame_category.group_frames));
        group.frames.frame_category.group_objects = Array.from(new Set(group.frames.frame_category.group_objects));
        group.frames.frame_category_detail.group_frames = Array.from(new Set(group.frames.frame_category_detail.group_frames));
        group.frames.frame_category_detail.group_objects = Array.from(new Set(group.frames.frame_category_detail.group_objects));
        group.frames.frame_news.group_frames = Array.from(new Set(group.frames.frame_news.group_frames));
        group.frames.frame_news.group_objects = Array.from(new Set(group.frames.frame_news.group_objects));
        group.frames.frame_news_detail.group_frames = Array.from(new Set(group.frames.frame_news_detail.group_frames));
        group.frames.frame_news_detail.group_objects = Array.from(new Set(group.frames.frame_news_detail.group_objects));
        group.frames.frame_news_group.group_frames = Array.from(new Set(group.frames.frame_news_group.group_frames));
        group.frames.frame_news_group.group_objects = Array.from(new Set(group.frames.frame_news_group.group_objects));
        group.frames.frame_news_relate.group_frames = Array.from(new Set(group.frames.frame_news_relate.group_frames));
        group.frames.frame_news_relate.group_objects = Array.from(new Set(group.frames.frame_news_relate.group_objects));
        group.frames.frame_product.group_frames = Array.from(new Set(group.frames.frame_product.group_frames));
        group.frames.frame_product.group_objects = Array.from(new Set(group.frames.frame_product.group_objects));
        group.frames.frame_product_detail.group_frames = Array.from(new Set(group.frames.frame_product_detail.group_frames));
        group.frames.frame_product_detail.group_objects = Array.from(new Set(group.frames.frame_product_detail.group_objects));
        group.frames.frame_product_by_category.group_frames = Array.from(new Set(group.frames.frame_product_by_category.group_frames));
        group.frames.frame_product_by_category.group_objects = Array.from(new Set(group.frames.frame_product_by_category.group_objects));
        group.frames.frame_product_relate.group_frames = Array.from(new Set(group.frames.frame_product_relate.group_frames));
        group.frames.frame_product_relate.group_objects = Array.from(new Set(group.frames.frame_product_relate.group_objects));
        group.frames.frame_search_by_keyword.group_frames = Array.from(new Set(group.frames.frame_search_by_keyword.group_frames));
        group.frames.frame_search_by_keyword.group_objects =Array.from(new Set(group.frames.frame_search_by_keyword.group_objects));
        group.frames.frame_services.group_frames = Array.from(new Set(group.frames.frame_services.group_frames));
        group.frames.frame_services.group_objects = Array.from(new Set(group.frames.frame_services.group_objects));
        group.frames.frame_hotel.group_frames = Array.from(new Set(group.frames.frame_hotel.group_frames));
        group.frames.frame_hotel.group_objects = Array.from(new Set(group.frames.frame_hotel.group_objects));
        group.frames.frame_banner.group_frames = Array.from(new Set(group.frames.frame_banner.group_frames));
        group.frames.frame_banner.group_objects = Array.from(new Set(group.frames.frame_banner.group_objects));
        group.frames.frame_website.group_frames = Array.from(new Set(group.frames.frame_website.group_frames));
        group.frames.frame_website.group_objects = Array.from(new Set(group.frames.frame_website.group_objects));
        group.frames.frame_website_by_category.group_frames = Array.from(new Set(group.frames.frame_website_by_category.group_frames));
        group.frames.frame_website_by_category.group_objects = Array.from(new Set(group.frames.frame_website_by_category.group_objects));
        group.frames.frame_website_detail.group_frames = Array.from(new Set(group.frames.frame_website_detail.group_frames));
        group.frames.frame_website_detail.group_objects = Array.from(new Set(group.frames.frame_website_detail.group_objects));
        group.frames.frame_website_relate.group_frames = Array.from(new Set(group.frames.frame_website_relate.group_frames));
        group.frames.frame_website_relate.group_objects = Array.from(new Set(group.frames.frame_website_relate.group_objects));
        group.frames.frame_food_drink.group_frames = Array.from(new Set(group.frames.frame_food_drink.group_frames));
        group.frames.frame_food_drink.group_objects = Array.from(new Set(group.frames.frame_food_drink.group_objects));
        group.frames.frame_food_drink_by_category.group_frames = Array.from(new Set(group.frames.frame_food_drink_by_category.group_frames));
        group.frames.frame_food_drink_by_category.group_objects = Array.from(new Set(group.frames.frame_food_drink_by_category.group_objects));
        group.frames.frame_food_drink_detail.group_frames = Array.from(new Set(group.frames.frame_food_drink_detail.group_frames));
        group.frames.frame_food_drink_detail.group_objects = Array.from(new Set(group.frames.frame_food_drink_detail.group_objects));
        group.frames.frame_food_drink_relate.group_frames = Array.from(new Set(group.frames.frame_food_drink_relate.group_frames));
        group.frames.frame_food_drink_relate.group_objects = Array.from(new Set(group.frames.frame_food_drink_relate.group_objects));

        console.log();
        
        // tiến hành get dữ liệu group_objects, group_frames json từ group đã lọc
        Promise.all([
          this.handleGetDataBLock(group.blocks),
          this.handleGetDataFrames(group.frames)
        ]).then(() => {
          console.log(group);

          resolve(group)
        })
      })
    })
  }

  handleGetDataBLock(data_block) {
    return new Promise((resolve) => {
      // dữ liệu group_objects của grid
      let promise_group_objects_grid = []
      data_block.grid.group_objects.forEach((e, index) => {
        promise_group_objects_grid[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_grid).then((group_frames) => {
        data_block.grid.group_objects = group_frames
      })
      // dữ liệu group_frames của grid
      let promise_group_frames_grid = []
      data_block.grid.group_frames.forEach((e, index) => {

        promise_group_frames_grid[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_grid).then((group_frames) => {
        data_block.grid.group_frames = group_frames
      })

      // dữ liệu group_objects của blank
      let promise_group_objects_blank = []
      data_block.blank.group_objects.forEach((e, index) => {
        promise_group_objects_blank[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_blank).then((group_frames) => {
        data_block.blank.group_objects = group_frames
      })
      // dữ liệu group_frames của blank
      let promise_group_frames_blank = []
      data_block.blank.group_frames.forEach((e, index) => {

        promise_group_frames_blank[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_blank).then((group_frames) => {
        data_block.blank.group_frames = group_frames
      })


      // dữ liệu group_objects của header
      let promise_group_objects_header = []
      data_block.header.group_objects.forEach((e, index) => {
        promise_group_objects_header[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_header).then((group_frames) => {
        data_block.header.group_objects = group_frames
      })
      // dữ liệu group_frames của header
      let promise_group_frames_header = []
      data_block.header.group_frames.forEach((e, index) => {

        promise_group_frames_header[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_header).then((group_frames) => {
        data_block.header.group_frames = group_frames
      })


      // dữ liệu group_objects của footer
      let promise_group_objects_footer = []
      data_block.footer.group_objects.forEach((e, index) => {
        promise_group_objects_footer[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_footer).then((group_frames) => {
        data_block.footer.group_objects = group_frames
      })
      // dữ liệu group_frames của footer
      let promise_group_frames_footer = []
      data_block.footer.group_frames.forEach((e, index) => {

        promise_group_frames_footer[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_footer).then((group_frames) => {
        data_block.footer.group_frames = group_frames
      })


      // dữ liệu group_objects của popup_hover
      let promise_group_objects_popup_hover = []
      data_block.popup_hover.group_objects.forEach((e, index) => {
        promise_group_objects_popup_hover[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_popup_hover).then((group_frames) => {
        data_block.popup_hover.group_objects = group_frames
      })
      // dữ liệu group_frames của popup_hover
      let promise_group_frames_popup_hover = []
      data_block.popup_hover.group_frames.forEach((e, index) => {

        promise_group_frames_popup_hover[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_popup_hover).then((group_frames) => {
        data_block.popup_hover.group_frames = group_frames
      })


      // dữ liệu group_objects của popup_tabs
      let promise_group_objects_popup_tabs = []
      data_block.popup_tabs.group_objects.forEach((e, index) => {
        promise_group_objects_popup_tabs[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_popup_tabs).then((group_frames) => {
        data_block.popup_tabs.group_objects = group_frames
      })
      // dữ liệu group_frames của popup_tabs
      let promise_group_frames_popup_tabs = []
      data_block.popup_tabs.group_frames.forEach((e, index) => {

        promise_group_frames_popup_tabs[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_popup_tabs).then((group_frames) => {
        data_block.popup_tabs.group_frames = group_frames
      })



      // dữ liệu group_objects của block_responsive
      let promise_group_objects_block_responsive = []
      data_block.block_responsive.group_objects.forEach((e, index) => {
        promise_group_objects_block_responsive[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_block_responsive).then((group_frames) => {
        data_block.block_responsive.group_objects = group_frames
      })
      // dữ liệu group_frames của block_responsive
      let promise_group_frames_block_responsive = []
      data_block.block_responsive.group_frames.forEach((e, index) => {

        promise_group_frames_block_responsive[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_block_responsive).then((group_frames) => {
        data_block.block_responsive.group_frames = group_frames
      })

      // dữ liệu group_objects của hover_blank
      let promise_group_objects_hover_blank = []
      data_block.hover_blank.group_objects.forEach((e, index) => {
        promise_group_objects_hover_blank[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_hover_blank).then((group_frames) => {
        data_block.hover_blank.group_objects = group_frames
      })
      // dữ liệu group_frames của hover_blank
      let promise_group_frames_hover_blank = []
      data_block.hover_blank.group_frames.forEach((e, index) => {

        promise_group_frames_hover_blank[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_hover_blank).then((group_frames) => {
        data_block.hover_blank.group_frames = group_frames
      })


      // dữ liệu group_objects của menu_hover
      let promise_group_objects_menu_hover = []
      data_block.menu_hover.group_objects.forEach((e, index) => {
        promise_group_objects_menu_hover[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_menu_hover).then((group_frames) => {
        data_block.menu_hover.group_objects = group_frames
      })
      // dữ liệu group_frames của menu_hover
      let promise_group_frames_menu_hover = []
      data_block.menu_hover.group_frames.forEach((e, index) => {

        promise_group_frames_menu_hover[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_menu_hover).then((group_frames) => {
        data_block.menu_hover.group_frames = group_frames
      })

      // dữ liệu group_objects của popup_detail_product
      let promise_group_objects_popup_detail_product = []
      data_block.popup_detail_product.group_objects.forEach((e, index) => {
        promise_group_objects_popup_detail_product[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_popup_detail_product).then((group_frames) => {
        data_block.popup_detail_product.group_objects = group_frames
      })
      // dữ liệu group_frames của popup_detail_product
      let promise_group_frames_popup_detail_product = []
      data_block.popup_detail_product.group_frames.forEach((e, index) => {

        promise_group_frames_popup_detail_product[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_popup_detail_product).then((group_frames) => {
        data_block.popup_detail_product.group_frames = group_frames
      })

      // dữ liệu group_objects của chatbox
      let promise_group_objects_chatbox = []
      data_block.chatbox.group_objects.forEach((e, index) => {
        promise_group_objects_chatbox[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_chatbox).then((group_frames) => {
        data_block.chatbox.group_objects = group_frames
      })
      // dữ liệu group_frames của chatbox
      let promise_group_frames_chatbox = []
      data_block.chatbox.group_frames.forEach((e, index) => {

        promise_group_frames_chatbox[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_chatbox).then((group_frames) => {
        data_block.chatbox.group_frames = group_frames
      })
      resolve(true)
    })

  }


  handleGetDataFrames(data_frame) {
    return new Promise((resolve) => {
      
      // dữ liệu group_objects của frame_dev
      let promise_group_objects_frame_dev = []
      data_frame.frame_dev.group_objects.forEach((e, index) => {
        promise_group_objects_frame_dev[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_dev).then((group_frames) => {
        data_frame.frame_dev.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_dev
      let promise_group_frames_frame_dev = []
      data_frame.frame_dev.group_frames.forEach((e, index) => {

        promise_group_frames_frame_dev[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_dev).then((group_frames) => {
        data_frame.frame_dev.group_frames = group_frames
      })


      // dữ liệu group_objects của frame_blank
      let promise_group_objects_frame_blank = []
      data_frame.frame_blank.group_objects.forEach((e, index) => {
        promise_group_objects_frame_blank[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_blank).then((group_frames) => {
        data_frame.frame_blank.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_blank
      let promise_group_frames_frame_blank = []
      data_frame.frame_blank.group_frames.forEach((e, index) => {

        promise_group_frames_frame_blank[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_blank).then((group_frames) => {
        data_frame.frame_blank.group_frames = group_frames
      })




      // dữ liệu group_objects của frame_collapse
      let promise_group_objects_frame_collapse = []
      data_frame.frame_collapse.group_objects.forEach((e, index) => {
        promise_group_objects_frame_collapse[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_collapse).then((group_frames) => {
        data_frame.frame_collapse.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_collapse
      let promise_group_frames_frame_collapse = []
      data_frame.frame_collapse.group_frames.forEach((e, index) => {

        promise_group_frames_frame_collapse[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_collapse).then((group_frames) => {
        data_frame.frame_collapse.group_frames = group_frames
      })

      // dữ liệu group_objects của frame_mutil_blank
      let promise_group_objects_frame_mutil_blank = []
      data_frame.frame_mutil_blank.group_objects.forEach((e, index) => {
        promise_group_objects_frame_mutil_blank[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_mutil_blank).then((group_frames) => {
        data_frame.frame_mutil_blank.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_mutil_blank
      let promise_group_frames_frame_mutil_blank = []
      data_frame.frame_mutil_blank.group_frames.forEach((e, index) => {

        promise_group_frames_frame_mutil_blank[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_mutil_blank).then((group_frames) => {
        data_frame.frame_mutil_blank.group_frames = group_frames
      })

      // dữ liệu group_objects của frame_blogs
      let promise_group_objects_frame_blogs = []
      data_frame.frame_blogs.group_objects.forEach((e, index) => {
        promise_group_objects_frame_blogs[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_blogs).then((group_frames) => {
        data_frame.frame_blogs.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_blogs
      let promise_group_frames_frame_blogs = []
      data_frame.frame_blogs.group_frames.forEach((e, index) => {

        promise_group_frames_frame_blogs[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_blogs).then((group_frames) => {
        data_frame.frame_blogs.group_frames = group_frames
      })




      // dữ liệu group_objects của frame_news
      let promise_group_objects_frame_news = []
      data_frame.frame_news.group_objects.forEach((e, index) => {
        promise_group_objects_frame_news[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_news).then((group_frames) => {
        data_frame.frame_news.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_news
      let promise_group_frames_frame_news = []
      data_frame.frame_news.group_frames.forEach((e, index) => {

        promise_group_frames_frame_news[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_news).then((group_frames) => {
        data_frame.frame_news.group_frames = group_frames
      })


      // dữ liệu group_objects của frame_services
      let promise_group_objects_frame_services = []
      data_frame.frame_services.group_objects.forEach((e, index) => {
        promise_group_objects_frame_services[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_services).then((group_frames) => {
        data_frame.frame_services.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_services
      let promise_group_frames_frame_services = []
      data_frame.frame_services.group_frames.forEach((e, index) => {

        promise_group_frames_frame_services[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_services).then((group_frames) => {
        data_frame.frame_services.group_frames = group_frames
      })



      // dữ liệu group_objects của frame_category_detail
      let promise_group_objects_frame_category_detail = []
      data_frame.frame_category_detail.group_objects.forEach((e, index) => {
        promise_group_objects_frame_category_detail[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_category_detail).then((group_frames) => {
        data_frame.frame_category_detail.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_category_detail
      let promise_group_frames_frame_category_detail = []
      data_frame.frame_category_detail.group_frames.forEach((e, index) => {

        promise_group_frames_frame_category_detail[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_category_detail).then((group_frames) => {
        data_frame.frame_category_detail.group_frames = group_frames
      })

      // dữ liệu group_objects của frame_category
      let promise_group_objects_frame_category = []
      data_frame.frame_category.group_objects.forEach((e, index) => {
        promise_group_objects_frame_category[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_category).then((group_frames) => {
        data_frame.frame_category.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_category
      let promise_group_frames_frame_category = []
      data_frame.frame_category.group_frames.forEach((e, index) => {

        promise_group_frames_frame_category[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_category).then((group_frames) => {
        data_frame.frame_category.group_frames = group_frames
      })


      // dữ liệu group_objects của frame_news_detail
      let promise_group_objects_frame_news_detail = []
      data_frame.frame_news_detail.group_objects.forEach((e, index) => {
        promise_group_objects_frame_news_detail[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_news_detail).then((group_frames) => {
        data_frame.frame_news_detail.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_news_detail
      let promise_group_frames_frame_news_detail = []
      data_frame.frame_news_detail.group_frames.forEach((e, index) => {

        promise_group_frames_frame_news_detail[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_news_detail).then((group_frames) => {
        data_frame.frame_news_detail.group_frames = group_frames
      })

      // dữ liệu group_objects của frame_news_group
      let promise_group_objects_frame_news_group = []
      data_frame.frame_news_group.group_objects.forEach((e, index) => {
        promise_group_objects_frame_news_group[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_news_group).then((group_frames) => {
        data_frame.frame_news_group.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_news_group
      let promise_group_frames_frame_news_group = []
      data_frame.frame_news_group.group_frames.forEach((e, index) => {

        promise_group_frames_frame_news_group[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_news_group).then((group_frames) => {
        data_frame.frame_news_group.group_frames = group_frames
      })

      // dữ liệu group_objects của frame_news_relate
      let promise_group_objects_frame_news_relate = []
      data_frame.frame_news_relate.group_objects.forEach((e, index) => {
        promise_group_objects_frame_news_relate[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_news_relate).then((group_frames) => {
        data_frame.frame_news_relate.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_news_relate
      let promise_group_frames_frame_news_relate = []
      data_frame.frame_news_relate.group_frames.forEach((e, index) => {

        promise_group_frames_frame_news_relate[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_news_relate).then((group_frames) => {
        data_frame.frame_news_relate.group_frames = group_frames
      })
      
      // dữ liệu group_objects của frame_product
      let promise_group_objects_frame_product = []
      data_frame.frame_product.group_objects.forEach((e, index) => {
        promise_group_objects_frame_product[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_product).then((group_frames) => {
        data_frame.frame_product.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_product
      let promise_group_frames_frame_product = []
      data_frame.frame_product.group_frames.forEach((e, index) => {

        promise_group_frames_frame_product[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_product).then((group_frames) => {
        data_frame.frame_product.group_frames = group_frames
      })

      // dữ liệu group_objects của frame_product_by_category
      let promise_group_objects_frame_product_by_category = []
      data_frame.frame_product_by_category.group_objects.forEach((e, index) => {
        promise_group_objects_frame_product_by_category[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_product_by_category).then((group_frames) => {
        data_frame.frame_product_by_category.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_product_by_category
      let promise_group_frames_frame_product_by_category = []
      data_frame.frame_product_by_category.group_frames.forEach((e, index) => {

        promise_group_frames_frame_product_by_category[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_product_by_category).then((group_frames) => {
        data_frame.frame_product_by_category.group_frames = group_frames
      })

      // dữ liệu group_objects của frame_product_detail
      let promise_group_objects_frame_product_detail = []
      data_frame.frame_product_detail.group_objects.forEach((e, index) => {
        promise_group_objects_frame_product_detail[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_product_detail).then((group_frames) => {
        data_frame.frame_product_detail.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_product_detail
      let promise_group_frames_frame_product_detail = []
      data_frame.frame_product_detail.group_frames.forEach((e, index) => {

        promise_group_frames_frame_product_detail[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_product_detail).then((group_frames) => {
        data_frame.frame_product_detail.group_frames = group_frames
      })

      // dữ liệu group_objects của frame_product_relate
      let promise_group_objects_frame_product_relate = []
      data_frame.frame_product_relate.group_objects.forEach((e, index) => {
        promise_group_objects_frame_product_relate[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_product_relate).then((group_frames) => {
        data_frame.frame_product_relate.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_product_relate
      let promise_group_frames_frame_product_relate = []
      data_frame.frame_product_relate.group_frames.forEach((e, index) => {

        promise_group_frames_frame_product_relate[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_product_relate).then((group_frames) => {
        data_frame.frame_product_relate.group_frames = group_frames
      })

      //------
       // dữ liệu group_objects của frame_product
       let promise_group_objects_frame_website = []
       data_frame.frame_website.group_objects.forEach((e, index) => {
         promise_group_objects_frame_website[index] = this.getDataObjectGroup(e);
       })
       Promise.all(promise_group_objects_frame_website).then((group_frames) => {
         data_frame.frame_website.group_objects = group_frames
       })
       // dữ liệu group_frames của frame_website
       let promise_group_frames_frame_website = []
       data_frame.frame_website.group_frames.forEach((e, index) => {
 
         promise_group_frames_frame_website[index] = this.getDataFrameGroup(e);
       })
       Promise.all(promise_group_frames_frame_website).then((group_frames) => {
         data_frame.frame_website.group_frames = group_frames
       })
 
       // dữ liệu group_objects của frame_website_by_category
       let promise_group_objects_frame_website_by_category = []
       data_frame.frame_website_by_category.group_objects.forEach((e, index) => {
         promise_group_objects_frame_website_by_category[index] = this.getDataObjectGroup(e);
       })
       Promise.all(promise_group_objects_frame_website_by_category).then((group_frames) => {
         data_frame.frame_website_by_category.group_objects = group_frames
       })
       // dữ liệu group_frames của frame_website_by_category
       let promise_group_frames_frame_website_by_category = []
       data_frame.frame_website_by_category.group_frames.forEach((e, index) => {
 
         promise_group_frames_frame_website_by_category[index] = this.getDataFrameGroup(e);
       })
       Promise.all(promise_group_frames_frame_website_by_category).then((group_frames) => {
         data_frame.frame_website_by_category.group_frames = group_frames
       })
 
       // dữ liệu group_objects của frame_website_detail
       let promise_group_objects_frame_website_detail = []
       data_frame.frame_website_detail.group_objects.forEach((e, index) => {
         promise_group_objects_frame_website_detail[index] = this.getDataObjectGroup(e);
       })
       Promise.all(promise_group_objects_frame_website_detail).then((group_frames) => {
         data_frame.frame_website_detail.group_objects = group_frames
       })
       // dữ liệu group_frames của frame_website_detail
       let promise_group_frames_frame_website_detail = []
       data_frame.frame_website_detail.group_frames.forEach((e, index) => {
 
         promise_group_frames_frame_website_detail[index] = this.getDataFrameGroup(e);
       })
       Promise.all(promise_group_frames_frame_website_detail).then((group_frames) => {
         data_frame.frame_website_detail.group_frames = group_frames
       })
 
       // dữ liệu group_objects của frame_website_relate
       let promise_group_objects_frame_website_relate = []
       data_frame.frame_website_relate.group_objects.forEach((e, index) => {
         promise_group_objects_frame_website_relate[index] = this.getDataObjectGroup(e);
       })
       Promise.all(promise_group_objects_frame_website_relate).then((group_frames) => {
         data_frame.frame_website_relate.group_objects = group_frames
       })
       // dữ liệu group_frames của frame_website_relate
       let promise_group_frames_frame_website_relate = []
       data_frame.frame_website_relate.group_frames.forEach((e, index) => {
 
         promise_group_frames_frame_website_relate[index] = this.getDataFrameGroup(e);
       })
       Promise.all(promise_group_frames_frame_website_relate).then((group_frames) => {
         data_frame.frame_website_relate.group_frames = group_frames
       })
      //  ------


      //------
       // dữ liệu group_objects của frame_product
       let promise_group_objects_frame_food_drink = []
       data_frame.frame_food_drink.group_objects.forEach((e, index) => {
         promise_group_objects_frame_food_drink[index] = this.getDataObjectGroup(e);
       })
       Promise.all(promise_group_objects_frame_food_drink).then((group_frames) => {
         data_frame.frame_food_drink.group_objects = group_frames
       })
       // dữ liệu group_frames của frame_food_drink
       let promise_group_frames_frame_food_drink = []
       data_frame.frame_food_drink.group_frames.forEach((e, index) => {
 
         promise_group_frames_frame_food_drink[index] = this.getDataFrameGroup(e);
       })
       Promise.all(promise_group_frames_frame_food_drink).then((group_frames) => {
         data_frame.frame_food_drink.group_frames = group_frames
       })
 
       // dữ liệu group_objects của frame_food_drink_by_category
       let promise_group_objects_frame_food_drink_by_category = []
       data_frame.frame_food_drink_by_category.group_objects.forEach((e, index) => {
         promise_group_objects_frame_food_drink_by_category[index] = this.getDataObjectGroup(e);
       })
       Promise.all(promise_group_objects_frame_food_drink_by_category).then((group_frames) => {
         data_frame.frame_food_drink_by_category.group_objects = group_frames
       })
       // dữ liệu group_frames của frame_food_drink_by_category
       let promise_group_frames_frame_food_drink_by_category = []
       data_frame.frame_food_drink_by_category.group_frames.forEach((e, index) => {
 
         promise_group_frames_frame_food_drink_by_category[index] = this.getDataFrameGroup(e);
       })
       Promise.all(promise_group_frames_frame_food_drink_by_category).then((group_frames) => {
         data_frame.frame_food_drink_by_category.group_frames = group_frames
       })
 
       // dữ liệu group_objects của frame_food_drink_detail
       let promise_group_objects_frame_food_drink_detail = []
       data_frame.frame_food_drink_detail.group_objects.forEach((e, index) => {
         promise_group_objects_frame_food_drink_detail[index] = this.getDataObjectGroup(e);
       })
       Promise.all(promise_group_objects_frame_food_drink_detail).then((group_frames) => {
         data_frame.frame_food_drink_detail.group_objects = group_frames
       })
       // dữ liệu group_frames của frame_food_drink_detail
       let promise_group_frames_frame_food_drink_detail = []
       data_frame.frame_food_drink_detail.group_frames.forEach((e, index) => {
 
         promise_group_frames_frame_food_drink_detail[index] = this.getDataFrameGroup(e);
       })
       Promise.all(promise_group_frames_frame_food_drink_detail).then((group_frames) => {
         data_frame.frame_food_drink_detail.group_frames = group_frames
       })
 
       // dữ liệu group_objects của frame_food_drink_relate
       let promise_group_objects_frame_food_drink_relate = []
       data_frame.frame_food_drink_relate.group_objects.forEach((e, index) => {
         promise_group_objects_frame_food_drink_relate[index] = this.getDataObjectGroup(e);
       })
       Promise.all(promise_group_objects_frame_food_drink_relate).then((group_frames) => {
         data_frame.frame_food_drink_relate.group_objects = group_frames
       })
       // dữ liệu group_frames của frame_food_drink_relate
       let promise_group_frames_frame_food_drink_relate = []
       data_frame.frame_food_drink_relate.group_frames.forEach((e, index) => {
 
         promise_group_frames_frame_food_drink_relate[index] = this.getDataFrameGroup(e);
       })
       Promise.all(promise_group_frames_frame_food_drink_relate).then((group_frames) => {
         data_frame.frame_food_drink_relate.group_frames = group_frames
       })
      //  ------
      // dữ liệu group_objects của frame_search_by_keyword
      let promise_group_objects_frame_search_by_keyword = []
      data_frame.frame_search_by_keyword.group_objects.forEach((e, index) => {
        promise_group_objects_frame_search_by_keyword[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_search_by_keyword).then((group_frames) => {
        data_frame.frame_search_by_keyword.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_search_by_keyword
      let promise_group_frames_frame_search_by_keyword = []
      data_frame.frame_search_by_keyword.group_frames.forEach((e, index) => {

        promise_group_frames_frame_search_by_keyword[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_search_by_keyword).then((group_frames) => {
        data_frame.frame_search_by_keyword.group_frames = group_frames
      })


      // dữ liệu group_objects của frame_brand
      let promise_group_objects_frame_brand = []
      data_frame.frame_brand.group_objects.forEach((e, index) => {
        promise_group_objects_frame_brand[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_brand).then((group_frames) => {
        data_frame.frame_brand.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_brand
      let promise_group_frames_frame_brand = []
      data_frame.frame_brand.group_frames.forEach((e, index) => {

        promise_group_frames_frame_brand[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_brand).then((group_frames) => {
        data_frame.frame_brand.group_frames = group_frames
      })

      // dữ liệu group_objects của frame_hotel
      let promise_group_objects_frame_hotel = []
      data_frame.frame_hotel.group_objects.forEach((e, index) => {
        promise_group_objects_frame_hotel[index] = this.getDataObjectGroup(e);
      })
      Promise.all(promise_group_objects_frame_hotel).then((group_frames) => {
        data_frame.frame_hotel.group_objects = group_frames
      })
      // dữ liệu group_frames của frame_hotel
      let promise_group_frames_frame_hotel = []
      data_frame.frame_hotel.group_frames.forEach((e, index) => {

        promise_group_frames_frame_hotel[index] = this.getDataFrameGroup(e);
      })
      Promise.all(promise_group_frames_frame_hotel).then((group_frames) => {
        data_frame.frame_hotel.group_frames = group_frames
      })

       // dữ liệu group_objects của frame_banner
       let promise_group_objects_frame_banner = []
       data_frame.frame_banner.group_objects.forEach((e, index) => {
         promise_group_objects_frame_banner[index] = this.getDataObjectGroup(e);
       })
       Promise.all(promise_group_objects_frame_banner).then((group_frames) => {
         data_frame.frame_banner.group_objects = group_frames
       })
       // dữ liệu group_frames của frame_banner
       let promise_group_frames_frame_banner = []
       data_frame.frame_banner.group_frames.forEach((e, index) => {

         promise_group_frames_frame_banner[index] = this.getDataFrameGroup(e);
       })
       Promise.all(promise_group_frames_frame_banner).then((group_frames) => {
         data_frame.frame_banner.group_frames = group_frames
       })

       // dữ liệu group_objects của frame_cart_products
       let promise_group_objects_frame_cart_products = []
       data_frame.frame_cart_products.group_objects.forEach((e, index) => {
         promise_group_objects_frame_cart_products[index] = this.getDataObjectGroup(e);
       })
       Promise.all(promise_group_objects_frame_cart_products).then((group_frames) => {
         data_frame.frame_cart_products.group_objects = group_frames
       })
       // dữ liệu group_frames của frame_cart_products
       let promise_group_frames_frame_cart_products = []
       data_frame.frame_cart_products.group_frames.forEach((e, index) => {

         promise_group_frames_frame_cart_products[index] = this.getDataFrameGroup(e);
       })
       Promise.all(promise_group_frames_frame_cart_products).then((group_frames) => {
         data_frame.frame_cart_products.group_frames = group_frames
       })


      resolve(true)
    })

  }

  // get dữ liệu của nhóm object
  getDataObjectGroup(file_name) {
    const url = `assets/data/group/object_group/${file_name}.json`;
    return new Promise((resolve) => {
      this.http.get<any[]>(url).subscribe(data => {
        resolve(data)
      })
    })
  }
  // get dữ liệu của nhóm frame
  getDataFrameGroup(file_name) {

    const url = `assets/data/group/frame_group/${file_name}.json`;
    return new Promise((resolve) => {
      this.http.get<any[]>(url).subscribe(data => {
        resolve(data)
      })
    })
  }
}
