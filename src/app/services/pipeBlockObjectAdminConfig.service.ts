import { Injectable } from "@angular/core";
import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import {
    AtwAnimateButtonAdminConfig, AtwButtonActiveAdminConfig, AtwButtonPreviewImageAdminConfig, AtwButtonSearchSnimeiAdminConfig,
    AtwCheckBoxChooseProductAdminConfig, AtwChooseSubproductAdminConfig, AtwProfileUserAdminConfig,
    AtwDateUpdateAdminConfig, AtwDynamicFilterAdminConfig, AtwFavoriteAdminConfig, AtwFrameProductsViewedAdminConfig,
    AtwFrameSnimeiDetailAdminConfig, AtwImageRepeatAdminConfig, AtwInputConfirmPasswordAdminConfig, AtwLineAdminConfig,
    AtwMenuVerticalAdminConfig, AtwNoteBillAdminConfig, AtwNoteProductAdminConfig, AtwProfileWebsiteAdminConfig,
    AtwQuantitySoldAdminConfig, AtwSearchSnimeiAdminConfig,
    AtwTextRepeatAdminConfig, AtwUploadFileAdminConfig, AtwWebsiteVersionAdminConfig,
    AtwBlockBlankAdminConfig,
    AtwBlockChatboxAdminConfig,
    AtwBlockHeaderAdminConfig,
    AtwBlockFooterAdminConfig,
    AtwPageAdminConfig,
    AtwButtonRepeatAdminConfig
} from 'vhobjects-admin';
import { AtwNumberCountingAdminConfig } from 'vhobjects-admin';
import { AtwShapeAdminConfig } from 'vhobjects-admin';
import { AtwIconAdminConfig } from 'vhobjects-admin';
import { AtwMapAdminConfig } from 'vhobjects-admin';
import { AtwTextAdminConfig } from 'vhobjects-admin';
import { AtwVideoAdminConfig } from 'vhobjects-admin';
import { AtwSearchAdminConfig } from 'vhobjects-admin';
import { AtwHoverAdminConfig } from 'vhobjects-admin';
import { AtwPopupAdminConfig } from 'vhobjects-admin';
import { AtwImageCategoryAdminConfig } from 'vhobjects-admin';
import { AtwDatePostedNewsAdminConfig } from 'vhobjects-admin';
import { AtwTextNewsTitleAdminConfig } from 'vhobjects-admin';
import { AtwViewersNewsAdminConfig } from 'vhobjects-admin';
import { AtwButtonQuantityAdminConfig } from 'vhobjects-admin';
import { AtwButtonViewDetailAdminConfig } from 'vhobjects-admin';
import { AtwImageDetailAdminConfig } from 'vhobjects-admin';
import { AtwImageProductAdminConfig } from 'vhobjects-admin';

import { AtwSortProductAdminConfig } from 'vhobjects-admin';
import { AtwTextBrandAdminConfig } from 'vhobjects-admin';
import { AtwTextDiscountAdminConfig } from 'vhobjects-admin';
import { AtwTextNameAdminConfig } from 'vhobjects-admin';
import { AtwTextPriceAdminConfig } from 'vhobjects-admin';
import { AtwTextPriceSaleAdminConfig } from 'vhobjects-admin';
import { AtwTextShortDescriptionAdminConfig } from 'vhobjects-admin';
import { AtwPopupDetailAdminConfig } from 'vhobjects-admin';
import { AtwUnitsAdminConfig } from 'vhobjects-admin';
import { AtwRangePriceAdminConfig } from 'vhobjects-admin';
import { AtwTextCollapseAdminConfig } from 'vhobjects-admin';
import { AtwInputEmailAdminConfig } from 'vhobjects-admin';
import { AtwBtnLoginLogout2StatesAdminConfig } from 'vhobjects-admin';
import { AtwInputPasswordAdminConfig } from 'vhobjects-admin';
import { AtwInputTelephoneAdminConfig } from 'vhobjects-admin';
import { AtwInputNameAdminConfig } from 'vhobjects-admin';
import { AtwInputAddressAdminConfig } from 'vhobjects-admin';
import { AtwInputContentAdminConfig } from 'vhobjects-admin';
import { AtwUserNameAdminConfig } from 'vhobjects-admin';
import { AtwButtonLogoutAdminConfig } from 'vhobjects-admin';
import { AtwPopupOpenFormAdminConfig } from 'vhobjects-admin';

import { AtwFeeAdminConfig } from 'vhobjects-admin';
import { AtwButtonShowModalAdminConfig } from 'vhobjects-admin';
import { AtwInputNewPasswordAdminConfig } from 'vhobjects-admin';
import { AtwMessengerAdminConfig } from 'vhobjects-admin';
import { AtwButtonQuantityCartAdminConfig } from 'vhobjects-admin';
import { AtwTotalPriceBillAdminConfig } from 'vhobjects-admin';
import { AtwDateBillAdminConfig } from 'vhobjects-admin';
import { AtwBillCodeAdminConfig } from 'vhobjects-admin';
import { AtwZaloShareAdminConfig } from 'vhobjects-admin';
import { AtwZaloFollowAdminConfig } from 'vhobjects-admin';
import { AtwButtonPreviewAdminConfig } from 'vhobjects-admin';
import { AtwCustomizeNewFieldAdminConfig } from 'vhobjects-admin';
import { AtwFrameBannerAdminConfig } from 'vhobjects-admin';
import { AtwFrameCollapseAdminConfig } from 'vhobjects-admin';
import { AtwFrameProductsAdminConfig } from 'vhobjects-admin';
import { AtwFrameProductByCategoryAdminConfig } from 'vhobjects-admin';
import { AtwFrameSearchByKeywordAdminConfig } from 'vhobjects-admin';
import { AtwFrameProductDetailAdminConfig } from 'vhobjects-admin';
import { AtwFrameTabsAdminConfig } from 'vhobjects-admin';
import { AtwFrameCartProductsAdminConfig } from 'vhobjects-admin';
import { AtwFrameCategoriesAdminConfig } from 'vhobjects-admin';
import { AtwFrameCategoryDetailAdminConfig } from 'vhobjects-admin';
import { AtwPdfViewerAdminConfig } from 'vhobjects-admin';
// import { AtwSearchCustomizeAdminConfig } from 'vhobjects-admin';
import { AtwFrameResultAdminConfig } from 'vhobjects-admin';
// import { AtwFrameTab2StatesAdminConfig } from 'vhobjects-admin';
import { AtwPaymentCartAdminConfig } from 'vhobjects-admin';
import { AtwTextParagraphAdminConfig } from 'vhobjects-admin';
// import { VhVirtualPositionConfigComponent } from 'vhobjects-admin';
import { AtwExportBillAdminConfig } from 'vhobjects-admin';
import { AtwDateDeliveryAdminConfig } from 'vhobjects-admin';
import { AtwRemainingTimeAdminConfig } from 'vhobjects-admin';
import { AtwBreadcrumbAdminConfig } from 'vhobjects-admin';
// import { AtwSelectAddressAdminConfig } from 'vhobjects-admin';
import { AtwNewFieldSnimeiAdminConfig } from 'vhobjects-admin';
import { AtwActiveDateAdminConfig } from 'vhobjects-admin';
import { AtwCustomizeObjectAdminConfig } from 'vhobjects-admin';
import { AtwNewFieldCkeditorAdminConfig } from 'vhobjects-admin'
import { AtwImageBeforeAfterSliderAdminConfig } from 'vhobjects-admin'
import { AtwFrameBlankAdminConfig } from 'vhobjects-admin';
import { AtwImageVideoDetailAdminConfig } from 'vhobjects-admin';
// import { AtwVideoUploadAdminConfig } from 'vhobjects-admin';
import { AtwImageAdminConfig } from 'vhobjects-admin';
import { AtwTableOfContentAdminConfig } from 'vhobjects-admin';
import { AtwMenuHorizontalAdminConfig } from 'vhobjects-admin';
import { AtwPopupInteractiveAdminConfig } from 'vhobjects-admin';
import { AtwButtonFavoriteAdminConfig } from 'vhobjects-admin';
import { AtwFrameProductByCategoryViewMoreAdminConfig } from 'vhobjects-admin';
import { AtwMultiLanguageAdminConfig } from 'vhobjects-admin';
import { AtwButtonAdminConfig } from 'vhobjects-admin';
import { AtwTextCategoryNameAdminConfig } from 'vhobjects-admin';

@Injectable({
    providedIn: 'root',
})
export class PipeBlockObjectAdminConfigService {
    constructor() {

    }

    public pipeBlockObjectAdminConfigComponent(component_name): any {
        switch (component_name) {
            case 'AtwBlockBlankAdminConfig': return AtwBlockBlankAdminConfig;
            case 'AtwBlockHeaderAdminConfig': return AtwBlockHeaderAdminConfig;
            case 'AtwBlockFooterAdminConfig': return AtwBlockFooterAdminConfig;
            case 'AtwBlockChatboxAdminConfig': return AtwBlockChatboxAdminConfig;
            case 'AtwPageAdminConfig': return AtwPageAdminConfig;
            // case 'AtwCountdownAdminConfig': return AtwCountdownAdminConfig;
            case 'AtwSearchAdminConfig': return AtwSearchAdminConfig;
            // case 'AtwCountdownProductAdminConfig': return AtwCountdownProductAdminConfig;
            case 'AtwInputNameAdminConfig': return AtwInputNameAdminConfig;
            case 'AtwInputAddressAdminConfig': return AtwInputAddressAdminConfig;
            case 'AtwButtonAdminConfig': return AtwButtonAdminConfig;
            case 'AtwMapAdminConfig': return AtwMapAdminConfig;
            case 'AtwVideoAdminConfig': return AtwVideoAdminConfig;
            case 'AtwTextAdminConfig': return AtwTextAdminConfig;
            case 'AtwShapeAdminConfig': return AtwShapeAdminConfig;
            case 'AtwLineAdminConfig': return AtwLineAdminConfig;
            case 'AtwNumberCountingAdminConfig': return AtwNumberCountingAdminConfig;
            case 'AtwIconAdminConfig': return AtwIconAdminConfig;
            case 'AtwPopupAdminConfig': return AtwPopupAdminConfig;
            case 'AtwInputContentAdminConfig': return AtwInputContentAdminConfig;
            case 'AtwHoverAdminConfig': return AtwHoverAdminConfig;
            case 'AtwTextCollapseAdminConfig': return AtwTextCollapseAdminConfig;
            case 'AtwInputEmailAdminConfig': return AtwInputEmailAdminConfig;
            case 'AtwBtnLoginLogout2StatesAdminConfig' :return  AtwBtnLoginLogout2StatesAdminConfig ;
            case 'AtwInputPasswordAdminConfig' :return  AtwInputPasswordAdminConfig ;
            case 'AtwInputTelephoneAdminConfig' :return  AtwInputTelephoneAdminConfig ;
            case 'AtwButtonLogoutAdminConfig' :return  AtwButtonLogoutAdminConfig ;
            case 'AtwUserNameAdminConfig' :return  AtwUserNameAdminConfig ;
            case 'AtwImageCategoryAdminConfig' :return  AtwImageCategoryAdminConfig ;
            case 'AtwDatePostedNewsAdminConfig' :return  AtwDatePostedNewsAdminConfig ;
            case 'AtwTextNewsTitleAdminConfig' :return  AtwTextNewsTitleAdminConfig ;
            case 'AtwViewersNewsAdminConfig' :return  AtwViewersNewsAdminConfig ;    
            case 'AtwButtonQuantityAdminConfig' :return  AtwButtonQuantityAdminConfig ;
            case 'AtwButtonViewDetailAdminConfig' :return  AtwButtonViewDetailAdminConfig ;    
            case 'AtwImageDetailAdminConfig' :return  AtwImageDetailAdminConfig ;    
            case 'AtwImageProductAdminConfig' :return  AtwImageProductAdminConfig ;    
            case 'AtwSortProductAdminConfig' :return  AtwSortProductAdminConfig ;    
            case 'AtwTextBrandAdminConfig' :return  AtwTextBrandAdminConfig ;    
            case 'AtwTextDiscountAdminConfig' :return  AtwTextDiscountAdminConfig ;    
            case 'AtwTextNameAdminConfig' :return  AtwTextNameAdminConfig ;    
            case 'AtwTextPriceAdminConfig' :return  AtwTextPriceAdminConfig ;    
            case 'AtwTextPriceSaleAdminConfig' :return  AtwTextPriceSaleAdminConfig ;    
            case 'AtwTextShortDescriptionAdminConfig' :return  AtwTextShortDescriptionAdminConfig ;    
            case 'AtwUnitsAdminConfig' :return  AtwUnitsAdminConfig ;    
            case 'AtwPopupDetailAdminConfig' :return  AtwPopupDetailAdminConfig ;    
            case 'AtwRangePriceAdminConfig' :return  AtwRangePriceAdminConfig ;    
            case 'AtwButtonQuantityCartAdminConfig' :return  AtwButtonQuantityCartAdminConfig ;    
            case 'AtwPopupOpenFormAdminConfig' :return  AtwPopupOpenFormAdminConfig ;    
            case 'AtwMenuHorizontalAdminConfig' :return  AtwMenuHorizontalAdminConfig ;    
            case 'AtwMenuVerticalAdminConfig' :return  AtwMenuVerticalAdminConfig ;     
            case 'AtwFeeAdminConfig' :return  AtwFeeAdminConfig ;
            case 'AtwButtonShowModalAdminConfig' :return  AtwButtonShowModalAdminConfig ;
            case 'AtwInputNewPasswordAdminConfig' :return  AtwInputNewPasswordAdminConfig ;
            case 'AtwInputConfirmPasswordAdminConfig' :return  AtwInputConfirmPasswordAdminConfig ;
            case 'AtwMessengerAdminConfig' :return  AtwMessengerAdminConfig ;
            case 'AtwZaloShareAdminConfig' :return  AtwZaloShareAdminConfig ;
            case 'AtwZaloFollowAdminConfig' :return  AtwZaloFollowAdminConfig ;
            case 'AtwAnimateButtonAdminConfig' :return  AtwAnimateButtonAdminConfig ;
            case 'AtwTotalPriceBillAdminConfig' :return  AtwTotalPriceBillAdminConfig ;
            case 'AtwDateBillAdminConfig' :return  AtwDateBillAdminConfig ;
            case 'AtwBillCodeAdminConfig' :return  AtwBillCodeAdminConfig ;
            case 'AtwNoteBillAdminConfig' :return  AtwNoteBillAdminConfig ;
            case 'AtwNoteProductAdminConfig' :return  AtwNoteProductAdminConfig ;
            case 'AtwPaymentCartAdminConfig' :return  AtwPaymentCartAdminConfig ;
            case 'AtwButtonPreviewAdminConfig' :return  AtwButtonPreviewAdminConfig ;
            case 'AtwButtonPreviewImageAdminConfig' :return  AtwButtonPreviewImageAdminConfig ;
            case 'AtwDateUpdateAdminConfig' :return  AtwDateUpdateAdminConfig ;
            case 'AtwWebsiteVersionAdminConfig' :return  AtwWebsiteVersionAdminConfig ;
            case 'AtwQuantitySoldAdminConfig' :return  AtwQuantitySoldAdminConfig ;
            case 'AtwImageAdminConfig' :return  AtwImageAdminConfig ;
            case 'AtwFrameBlankAdminConfig' :return  AtwFrameBlankAdminConfig ;
            case 'AtwFrameBannerAdminConfig' :return  AtwFrameBannerAdminConfig ;
            case 'AtwFrameCollapseAdminConfig' :return  AtwFrameCollapseAdminConfig ;
            case 'AtwFrameProductsAdminConfig' :return  AtwFrameProductsAdminConfig ;
            case 'AtwFrameProductByCategoryAdminConfig' :return  AtwFrameProductByCategoryAdminConfig ;
            case 'AtwFrameSearchByKeywordAdminConfig' :return  AtwFrameSearchByKeywordAdminConfig ;
            case 'AtwFrameProductDetailAdminConfig' :return  AtwFrameProductDetailAdminConfig ;
            case 'AtwFrameTabsAdminConfig' :return  AtwFrameTabsAdminConfig ;
            case 'AtwFrameCartProductsAdminConfig' :return  AtwFrameCartProductsAdminConfig ;
            case 'AtwFrameCategoriesAdminConfig' :return  AtwFrameCategoriesAdminConfig ;
            case 'AtwFrameCategoryDetailAdminConfig' :return  AtwFrameCategoryDetailAdminConfig ;
            case 'AtwCustomizeNewFieldAdminConfig' :return  AtwCustomizeNewFieldAdminConfig ;
            case 'AtwProfileUserAdminConfig' :return  AtwProfileUserAdminConfig ;
            case 'AtwCheckBoxChooseProductAdminConfig' :return  AtwCheckBoxChooseProductAdminConfig ;
            case 'AtwButtonRepeatAdminConfig' :return  AtwButtonRepeatAdminConfig ;
            case 'AtwUploadFileAdminConfig' :return  AtwUploadFileAdminConfig ;
            case 'AtwPdfViewerAdminConfig' :return  AtwPdfViewerAdminConfig ;
            case 'AtwTextParagraphAdminConfig' :return  AtwTextParagraphAdminConfig ;
            // case 'AtwSearchCustomizeAdminConfig' :return  AtwSearchCustomizeAdminConfig ;
            case 'AtwFrameResultAdminConfig' :return  AtwFrameResultAdminConfig ;
            // case 'AtwFrameTab2StatesAdminConfig' :return  AtwFrameTab2StatesAdminConfig ;
            // case 'AtwSelectAddressAdminConfig' :return  AtwSelectAddressAdminConfig ;
            // case 'AtwOrdinalRecruitmentAdminConfig' :return  AtwOrdinalRecruitmentAdminConfig ;
            case 'AtwFavoriteAdminConfig' :return  AtwFavoriteAdminConfig ;
            case 'AtwImageRepeatAdminConfig' :return  AtwImageRepeatAdminConfig ;
            case 'AtwTextRepeatAdminConfig' :return  AtwTextRepeatAdminConfig ;
            case 'AtwDynamicFilterAdminConfig' :return  AtwDynamicFilterAdminConfig ;
            case 'AtwFrameProductsViewedAdminConfig' :return  AtwFrameProductsViewedAdminConfig ;
            case 'AtwBreadcrumbAdminConfig' :return  AtwBreadcrumbAdminConfig ;
            case 'AtwFrameSnimeiDetailAdminConfig' :return  AtwFrameSnimeiDetailAdminConfig ;
            case 'AtwButtonSearchSnimeiAdminConfig' :return  AtwButtonSearchSnimeiAdminConfig ;
            case 'AtwSearchSnimeiAdminConfig' :return  AtwSearchSnimeiAdminConfig ;
            case 'AtwProfileWebsiteAdminConfig' :return  AtwProfileWebsiteAdminConfig ;
            case 'AtwDateDeliveryAdminConfig' :return  AtwDateDeliveryAdminConfig ;
            case 'AtwExportBillAdminConfig' :return  AtwExportBillAdminConfig ;
            case 'AtwRemainingTimeAdminConfig' :return  AtwRemainingTimeAdminConfig ;
            case 'AtwButtonActiveAdminConfig' :return  AtwButtonActiveAdminConfig ;
            case 'AtwNewFieldSnimeiAdminConfig' :return  AtwNewFieldSnimeiAdminConfig ;
            // case 'AtwVideoUploadAdminConfig' :return  AtwVideoUploadAdminConfig ;
            case 'AtwImageVideoDetailAdminConfig' :return  AtwImageVideoDetailAdminConfig ;
            case 'AtwActiveDateAdminConfig' :return  AtwActiveDateAdminConfig ;
            case 'AtwPopupInteractiveAdminConfig' :return  AtwPopupInteractiveAdminConfig ;
            case 'AtwCustomizeObjectAdminConfig' :return  AtwCustomizeObjectAdminConfig ;
            case 'AtwImageBeforeAfterSliderAdminConfig' :return  AtwImageBeforeAfterSliderAdminConfig ;
            case 'AtwFrameProductByCategoryViewMoreAdminConfig' :return  AtwFrameProductByCategoryViewMoreAdminConfig ;
            case 'AtwChooseSubproductAdminConfig' :return  AtwChooseSubproductAdminConfig ;
            case 'AtwButtonFavoriteAdminConfig' :return  AtwButtonFavoriteAdminConfig ;
            case 'AtwNewFieldCkeditorAdminConfig' :return  AtwNewFieldCkeditorAdminConfig ;
            case 'AtwTableOfContentAdminConfig' :return  AtwTableOfContentAdminConfig ;
            case 'AtwMultiLanguageAdminConfig' :return  AtwMultiLanguageAdminConfig ;
            case 'AtwTextCategotyNameAdminConfig' :return  AtwTextCategoryNameAdminConfig ;
            case 'AtwTextCategoryNameAdminConfig' :return  AtwTextCategoryNameAdminConfig ;


 
             
            
        }
    }
}