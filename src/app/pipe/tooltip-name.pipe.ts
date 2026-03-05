import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';

const componentMap = {
  /* ---------------------------------- Frame --------------------------------- */
  
  // co_ban
  AtwFrameBlank: 'co_ban/mot_khung_trong',
  AtwFrameCollapse: 'co_ban/khung_collapse',
  AtwFrameMutilBlank: 'co_ban/nhieu_khung_trong',
  AtwFrameBanner: 'co_ban/banner',
  AtwFrameTabs: 'co_ban/chuyen_tabs',
  AtwFrameRepeat: 'co_ban/frame_repeat',
  AtwFrameTab2States: 'co_ban/khung_chuyen_trang_2_trang_thai',

  // du_an_app
  EwaFrameApp: 'du_an_app/du_an_app_tu_chon',
  AtwFrameAppByCategory: 'du_an_app/du_an_app_theo_danh_muc',

  // tin_tuc
  AtwFrameNews: 'tin_tuc/tin_tuc_tu_chon',
  AtwFrameNewsByCategory: 'tin_tuc/tin_tuc_theo_danh_muc',
  AtwFrameNewsDetail: 'tin_tuc/chi_tiet_tin_tuc',
  AtwFrameNewsRelate: 'tin_tuc/tin_tuc_lien_quan',
  AtwFrameSearchByKeywordNews: 'tin_tuc/tim_kiem_tin_tuc',
  AtwFrameNewsFavorited: 'tin_tuc/tin_tuc_yeu_thich',

  // mon_an_thuc_uong
  AtwFrameFoods: 'mon_an_thuc_uong/mon_an_tu_chon',
  AtwFrameFoodsByCategory: 'mon_an_thuc_uong/mon_an_theo_danh_muc',
  AtwFrameFoodsDetail: 'mon_an_thuc_uong/chi_tiet_mon_an_thuc_uong',
  AtwFrameFoodsRelate: 'mon_an_thuc_uong/mon_an_lien_quan',
  AtwFrameSearchByKeywordFoods: 'mon_an_thuc_uong/tim_kiem_mon_an',

  // du_an
  AtwFrameWebsite: 'du_an/du_an_tu_chon',
  AtwFrameWebsiteByCategory: 'du_an/du_an_theo_danh_muc',
  AtwFrameWebsiteDetail: 'du_an/chi_tiet_du_an',
  AtwFrameWebsiteRelate: 'du_an/du_an_lien_quan',
  AtwFrameSearchByKeywordWebsite: 'du_an/tim_kiem_ung_dung',

  // san_pham
  AtwFrameProducts: 'san_pham/san_pham_tu_chon',
  AtwFrameProductByCategory: 'san_pham/san_pham_theo_danh_muc',
  AtwFrameProductDetail: 'san_pham/chi_tiet_san_pham',
  AtwFrameProductRelate: 'san_pham/san_pham_lien_quan',
  AtwFrameProductsFavorited: 'san_pham/san_pham_yeu_thich',
  AtwFrameProductsViewed: 'san_pham/san_pham_vua_xem',
  AtwFrameCartProductsChoosed: 'san_pham/gio_hang_da_chon',
  AtwFrameCartProducts: 'san_pham/gio_hang_chua_san_pham',
  AtwFrameSearchByKeyword: 'san_pham/tim_kiem',
  AtwFrameResult: 'san_pham/ket_qua_tim_kiem',

  // dich_vu
  AtwFrameService: 'dich_vu/dich_vu_tu_chon',
  AtwFrameServiceByCategory: 'dich_vu/dich_vu_theo_danh_muc',
  AtwFrameServiceDetail: 'dich_vu/chi_tiet_dich_vu',
  AtwFrameServiceRelate: 'dich_vu/dich_vu_lien_quan',
  AtwFrameSearchByKeywordServices: 'dich_vu/tim_kiem_dich_vu',

  // danh_muc
  AtwFrameCategories: 'danh_muc/danh_muc_tu_chon',
  AtwFrameCategoryDetail: 'danh_muc/chi_tiet_danh_muc',

  // tuyen_dung
  AtwFrameRecruitment: 'tuyen_dung/tuyen_dung_tu_chon',
  AtwFrameRecruitmentDetail: 'tuyen_dung/chi_tiet_tuyen_dung',

  // chi_tiet_bao_hanh
  AtwFrameSnimeiDetail: 'chi_tiet_bao_hanh/khung_chi_tiet_bao_hanh',


  /* --------------------------------- Object --------------------------------- */

  // co_ban
  AtwText: 'co_ban/van_ban',
  AtwButton: 'co_ban/nut_dieu_huong',
  AtwBackPageButton: 'co_ban/nut_tro_lai_trang_truoc',
  AtwButtonBacktop: 'co_ban/nut_scroll_lai_dau_trang',
  AtwImage:'co_ban/hinh_anh',
  AtwIcon: 'co_ban/icon',
  AtwShape: 'co_ban/hinh_dang',
  AtwLine: 'co_ban/duong_ke',
  AtwPdfViewer: 'co_ban/hien_thi_file_pdf',
  AtwTextParagraph: 'co_ban/doan_van_ban',
  AtwBreadcrumb: 'co_ban/duong_dan_dieu_huong',

  // dem_so
  AtwNumberCounting: 'dem_so/dem_so',

  // video
  AtwVideo: "Video/Video Youtube",
  AtwVideoUpload: "Video/Video",

  // lien_lac
  AtwZaloFollow: 'lien_lac/zalo_theo_doi',
  AtwZaloShare: 'lien_lac/zalo_chia_se',
  AtwMessengerUser: 'lien_lac/Messenger',
  AtwAnimateButton: 'lien_lac/bong_bong_lien_he',
  AtwMap: 'lien_lac/nhung_google_map',
  FacebookComponent: 'lien_lac/nhung_facebook',

  // khoi_hop_thoai
  AtwPopup: 'khoi_hop_thoai/nut_goi_hop_thoai_noi_dung_cua_so_moi',
  AtwHover: 'khoi_hop_thoai/van_ban_goi_hop_thoai_noi_dung_di_chuot',
  AtwButtonShowModal: 'khoi_hop_thoai/nut_goi_hop_thoai_noi_dung_nhan_chuot',
  AtwButtonClosePopup: 'khoi_hop_thoai/nut_dong_noi_dung_hop_thoai',

  // mo_rong_noi_dung
  AtwTextCollapse: 'mo_rong_noi_dung/an_thu_van_ban',

  // dang_nhap_va_dang_ki
  AtwButtonRegister: 'dang_nhap_va_dang_ki/nut_dang_ki',
  AtwBtnLogin: 'dang_nhap_va_dang_ki/nut_dang_nhap',
  AtwBtnLoginLogout2States: 'dang_nhap_va_dang_ki/nut_dang_nhap_va_dang_xuat',
  AtwButtonLogout: 'dang_nhap_va_dang_ki/nut_dang_xuat',
  AtwButtonForgotPassword: 'dang_nhap_va_dang_ki/quen_mat_khau',
  AtwButtonConfirm: 'dang_nhap_va_dang_ki/nut_doi_mat_khau',
  AtwButtonShowFormLogged: 'dang_nhap_va_dang_ki/nut_goi_hop_thoai_da_dang_nhap_nhan_chuot',
  AtwButtonShowForm: 'dang_nhap_va_dang_ki/nut_goi_hop_thoai_dang_nhap_dang_ky_nhan_chuot',
  AtwPopupOpenForm: 'dang_nhap_va_dang_ki/nut_goi_hop_thoai_dang_nhap_cua_so',
  AtwButtonLoggedComponent: 'dang_nhap_va_dang_ki/nut_dieu_huong_khi_da_dang_nhap',

  // form
  AtwInputEmail: 'form/o_nhap_email',
  AtwInputPassword: 'form/o_nhap_mat_khau',
  AtwInputNewPassword: 'form/o_nhap_mat_khau_moi',
  AtwInputConfirmPassword: 'form/o_nhap_xac_nhan_mat_khau_moi',
  AtwInputTelephone: 'form/o_nhap_so_dien_thoai',
  AtwInputName: 'form/o_nhap_ten_nguoi_dung',
  AtwInputAddress: 'form/o_nhap_dia_chi',
  AtwInputContent: 'form/o_nhap_noi_dung',
  AtwUserName: 'form/o_hien_thi_ten_nguoi_dung',
  AtwSendContact: 'form/nut_gui_thong_tin_lien_he',
  AtwButtonSave: 'form/luu_thong_tin_thay_doi',
  AtwUploadFile: 'form/nut_upload_file',

  // chon_doi_tuong
  AtwSelectAddress: "chon_doi_tuong/chon_dia_chi",
  SelectDateComponent: "chon_doi_tuong/chon_ngay_thang",

  // menu
  AtwMenuHorizontal: 'menu/menu_ngang',
  AtwMenuVertical: 'menu/menu_doc',

  // tra_cuu_sn_imei
  AtwSearchSnimei: "tra_cuu_sn_imei/o_tim_kiem_sn_imei",
  AtwButtonSearchSnimei: "tra_cuu_sn_imei/nut_bam_tim_kiem",

  // thong_tin_khach_hang
  AtwProfileUser: "thong_tin_khach_hang/quan_ly_tai_khoan",
  AtwProfileWebsite: "thong_tin_khach_hang/quan_ly_website",

  // danh_muc
  AtwMenuCategory: 'danh_muc/menu_danh_muc',

  // sap_xep_san_pham
  AtwSortProduct: "sap_xep_san_pham/sap_xep_san_pham",
  AtwRangePrice: "sap_xep_san_pham/loc_gia_san_pham",
  AtwDynamicFilter: "sap_xep_san_pham/loc_theo_du_lieu_tu_dinh_nghia",

  // gio_hang_co_ban
  AtwTextProductDiscountValue: 'gio_hang_co_ban/tong_tien_giam_trong_gio_hang',
  tAtwTotalPriceCart: 'gio_hang_co_ban/tong_tien_thanh_toan',
  AtwSubTotalPriceCart: 'gio_hang_co_ban/tong_tien',
  AtwTotalQuantityProducts: 'gio_hang_co_ban/tong_so_luong_san_pham',
  AtwFee: 'gio_hang_co_ban/phi',
  AtwNoteBill: 'gio_hang_co_ban/ghi_chu_hoa_don',
  AtwButtonPayment: 'gio_hang_co_ban/nut_thanh_toan',
  AtwPaymentCart: 'gio_hang_co_ban/tong_tien_gio_hang_duoc_chon',
  AtwDateDelivery: 'gio_hang_co_ban/ngay_giao_hang',
  AtwExportBill: 'gio_hang_co_ban/xuat_hoa_don',

  // tim_kiem
  AtwSearch: "tim_kiem/thanh_tim_kiem",
  AtwSearchCustomize: "tim_kiem/thanh_tim_kiem_tuy_chinh",

  // hoa_don
  AtwBillCode: 'hoa_don/ma_hoa_don',
  AtwDateBill: 'hoa_don/ngay_tao_don',
  AtwTotalPriceBill: 'hoa_don/tong_tien',

  // san_pham
  AtwCustomizeNewField: "san_pham/du_lieu_tu_dinh_nghia",
  AtwTextName: "san_pham/ten_san_pham",
  AtwImageProduct: 'san_pham/hinh_anh_san_pham',
  AtwTextPrice: 'san_pham/gia_san_pham',
  TextPriceDiscountValueComponent: "san_pham/so_tien_giam",
  AtwTextPriceSale: 'san_pham/gia_chua_khuyen_mai',
  AtwTextDiscount: "san_pham/tag_giam_gia",
  AtwTextShortDescription: "san_pham/mo_ta_san_pham",
  AtwUnits: "san_pham/don_vi",
  AtwButtonAddToCart: "san_pham/nut_them_vao_gio_hang",
  AtwButtonViewDetail: "san_pham/nut_xem_chi_tiet_san_pham",
  AtwRate: "san_pham/danh_gia",
  AtwTextBrand: "san_pham/ten_chi_nhanh",
  AtwFavorite: "san_pham/nut_yeu_thich",
  AtwPopupDetail: "san_pham/nut_goi_hop_thoai_chi_tiet",
  AtwDetailedDescription: "san_pham/noi_dung_san_pham",
  AtwImageDetail: "san_pham/nhom_anh_san_pham",
  AtwCountDownProduct: "san_pham/thoi_gian_dem_nguoc",
  AtwMenuProduct: 'san_pham/menu',
  AtwImageVideoDetail: "san_pham/video_va_hinh_anh",

  // danh_muc
  AtwTextCategoryName: 'danh_muc/ten_danh_muc',
  AtwImageCategory: 'danh_muc/hinh_anh_danh_muc',
  AtwDescribeCategory: 'danh_muc/mo_ta_danh_muc',

  // tin_tuc
  AtwTextNewsTitle: 'tin_tuc/tieu_de_tin_tuc',
  AtwDescriptionNews: 'tin_tuc/mo_ta_tin_tuc',
  AtwContentNews: 'tin_tuc/noi_dung_tin_tuc',
  AtwDatePostedNews: 'tin_tuc/thoi_gian_dang_bai',
  AtwViewersNews: 'tin_tuc/so_luot_xem_bo_dem',

  // tuyen_dung
  AtwPositionRecruitment: "tuyen_dung/vi_tri_tuyen_dung",
  AtwLevelRecruitment: "tuyen_dung/cap_bac_tuyen_dung",
  AtwAddressRecruitment: "tuyen_dung/dia_chi_tuyen_dung",
  AtwSpecializedRecruitment: "tuyen_dung/nganh_nghe_tuyen_dung",
  AtwSalaryRecruitment: "tuyen_dung/luong_tuyen_dung",
  AtwDateExpire: "tuyen_dung/ngay_het_han",
  AtwContentRecruitment: "tuyen_dung/noi_dung_tuyen_dung",
  AtwSendCV: "tuyen_dung/nut_gui_cv",
  AtwOrdinalRecruitment: "tuyen_dung/so_thu_tu",
  DescriptionRecruitmentComponent: "tuyen_dung/mo_ta_tuyen_dung",

  // gio_hang
  AtwCheckBoxChooseProduct: 'gio_hang/checkbox_chon_san_pham',
  AtwTotalPriceProduct: 'gio_hang/tam_tinh_moi_san_pham',
  AtwNoteProduct: 'gio_hang/ghi_chu',
  AtwDeleteCartProduct: 'gio_hang/nut_xoa_san_pham',
  AtwButtonQuantityCart: 'gio_hang/nut_so_luong',

  // chi_tiet_bao_hanh
  AtwButtonActive: "chi_tiet_bao_hanh/nut_kich_hoat",
  AtwTextProductId: "chi_tiet_bao_hanh/ma_san_pham",
  AtwTextImei: "chi_tiet_bao_hanh/so_snimei",
  AtwPurchaseDate: "chi_tiet_bao_hanh/ngay_xuat_hang",
  AtwExpirationDate: "chi_tiet_bao_hanh/ngay_het_han",
  AtwTextWarrantyPeriod: "chi_tiet_bao_hanh/han_bao_hanh",
  AtwRemainingTime: "chi_tiet_bao_hanh/thoi_gian_con_lai",
  AtwTextActive: "chi_tiet_bao_hanh/kich_hoat",
  AtwMaxActivationDays: "chi_tiet_bao_hanh/so_ngay_toi_da_duoc_phep_kich_hoat",

  // lap_lai
  AtwTextRepeat: "lap_lai/van_ban",
  AtwImageRepeat: "lap_lai/hinh_anh",

  // mon_an_thuc_uong
  AtwSearchFoods: "mon_an_thuc_uong/thanh_tim_kiem",

  // du_an
  AtwButtonPreviewImage: "du_an/nut_xem_anh_demo_website",
  AtwWebsiteVersion: "du_an/phien_ban_website",
  AtwButtonPreview: "du_an/nut_xem_anh_website_thuc_te",
  AtwUseTemplate: "du_an/nut_su_dung_giao_dien_cua_so_moi",
  AtwSearchWebsite: "du_an/thanh_tim_kiem",
  AtwDateUpdate: "du_an/ngay_cap_nhat_du_an",
  AtwQuantitySold: "du_an/so_luong_da_dat",

  // dich_vu
  PopupTabsObjectComponent: "dich_vu/nut_goi_hop_thoai_dich_vu_chia_tab",


  
  // AtwTextMediaLength: "chieu_dai_thiet_bi",
  // AtwTextMediaWidth: "chieu_rong_thiet_bi",
  // AtwTextMediaRollSize: "kich_thuoc_cuon_thiet_bi",
  // AtwTextMediaThickness: "do_day_thiet_bi",
  // AtwTextMediaTypes: "loai_thiet_bi",
  // AtwTextOperatingTemp: "nhiet_do_hoat_dong",
  // AtwTextStorageTemp: "nhiet_do_luu_tru",
  // AtwTextOperatingHumidity: "do_am_hoat_dong",
  // AtwTextStorageHumidity: "do_am_luu_tru",
  // AtwTextBarcodes1d: "ma_vach_1d",
  // AtwTextBarcodes2d: "ma_vach_2d",
  // AtwTextFontsAndGraphics: "phong_chu_va_do_hoa",
  // AtwTextDriver: "trinh_dieu_khien",
  // AtwTextSdk: "sdk",
  // AtwTextSoftware: "phan_mem",
  // AtwTextStandardAccessories: "phu_kien_tieu_chuan",
  // AtwTextFactoryInstalledOptions: "tuy_chon_cai_dat_tai_nha_may",
  // AtwTextUserOptions: "tuy_chon_nguoi_dung",
  // AtwTextPrintheadLife: "tuoi_tho_dau_in",
  // AtwTextPlatenRollerLife: "tuoi_tho_truc_lan",
  // AtwTextPrinterWarranty: "bao_hanh_may_in",
  // AtwTextDimension: "kich_thuoc",
  // AtwTextWeight: "trong_luong",


  /* ---------------------------------- Block --------------------------------- */

  // co_ban
  AtwBlockBlank: "co_ban/khoi_trong",
  BlockGridComponent: "co_ban/khoi_luoi",

  // khoi_hop_thoai
  AtwBlockPopupHoverBlank: "khoi_hop_thoai/khoi_hop_thoai_noi_dung_cua_so_moi",
  AtwBlockHoverBlank: "khoi_hop_thoai/khoi_hop_thoai_noi_dung_di_chuot",
  AtwBlockPopupDetailProduct: "khoi_hop_thoai/khoi_hop_thoai_noi_dung_chi_tiet_san_pham_cua_so_moi",
  AtwBlockMobileTabs: "khoi_hop_thoai/khoi_mobile_tabs",

  // header_footer
  AtwBlockHeader: "header_footer/khoi_header",
  AtwBlockFooter: "header_footer/khoi_footer",
  AtwBlockChatbox: "header_footer/hop_thoai_chua_bieu_tuong_chat",
}

@Pipe({ name: 'tooltipNamePipe' })
export class TooltipNamePipe implements PipeTransform {
  transform(value: string): any {
    if (!value) return ''
    if (componentMap[value]) {
      return componentMap[value];

    }
    return (`${value} component was not found`);
  }
}

@NgModule({
  declarations: [TooltipNamePipe],
  imports: [],
  exports: [TooltipNamePipe],
})
export class TooltipNamePipeModule { }
