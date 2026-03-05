import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { SitemapComponent } from './sitemap/sitemap.component';
import { CanonicalComponent } from './canonical/canonical.component';
import { InfoCandidatesComponent } from './recruitment/info-candidates/info-candidates.component';
import { WebAppContactComponent } from './websites-apps/websites-apps-contact/websites-apps-contact.component';
import { FieldsGoogleShoppingComponent } from './google-shopping/fields-google-shopping/fields-google-shopping.component';
import { ProductsGoogleShoppingComponent } from './google-shopping/products-google-shopping/products-google-shopping.component';
import { ListScriptsComponent } from './google-shopping/list-scripts/list-scripts.component';
import { FieldsEmbeddedScriptComponent } from './google-shopping/fields-embedded-script/fields-embedded-script.component';
import { ListScriptsObjectComponent } from './google-shopping/list-scripts-object/list-scripts-object.component';
import { FoldersManagerComponent } from './folders-manager/folders-manager.component';
import { InvoicesOnlineComponent } from './invoices-online/invoices-online.component';


const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [
            {
                path: 'new-fields',
                loadChildren: () => import('./new-fields/new-fields.module').then((m) => m.NewFieldsModule),
            },
            {
                path: 'products',
                loadChildren: () => import('./products/products.module').then((m) => m.ProductsModule),
            },
            {
                path: 'combo',
                loadChildren: () => import('./combos/combos.module').then((m) => m.CombosModule),
            },
            {
                path: 'snimei',
                loadChildren: () => import('./snimei/snimei.module').then((m) => m.SnimeiModule),
            },
            {
                path: 'services',
                loadChildren: () => import('./services/services.module').then((m) => m.ServicesModule),
            },
            {
                path: 'news',
                loadChildren: () => import('./news/news.module').then((m) => m.NewsModule),
            },
            {
                path: 'blogs',
                loadChildren: () => import('./blogs/blogs.module').then((m) => m.BlogsModule),
            },
            {
                path: 'invoices',
                loadChildren: () => import('./invoices/invoices.module').then((m) => m.InvoicesModule),
            },
            {
                path: 'invoices-of-sale',
                loadChildren: () => import('./invoices-of-sale/invoices-of-sale.module').then((m) => m.InvoicesOfSaleModule),
            },
            {
                path: 'invoices-online',
                component: InvoicesOnlineComponent,
            },
            {
                path: 'list-coupons',
                loadChildren: () => import('./coupons/list-coupons/list-coupons.module').then((m) => m.ListCouponsModule),
            },
            {
                path: 'release-coupons',
                loadChildren: () => import('./coupons/release-coupons/release-coupons.module').then((m) => m.ReleaseCouponsModule)
            },
            {
                path: 'list-voucher',
                loadChildren: () => import('./vouchers/list-voucher/list-voucher.module').then((m) => m.ListVoucherModule)
            },
            {
                path: 'release-vouchers',
                loadChildren: () => import('./vouchers/release-vouchers/release-vouchers.module').then((m) => m.ReleaseVouchersModule)
            },
            {
                path: 'zalo',
                loadChildren: () => import('./zalo-config/zalo-config.module').then((m) => m.ZaloConfigModule)
            },
            {
                path: 'categories',
                loadChildren: () => import('./categories/categories.module').then((m) => m.CategoriesModule),
            },
            {
                path: 'websites',
                loadChildren: () => import('./websites/websites.module').then((m) => m.WebsitesModule),
            },
            {
                path: 'websites-apps',
                loadChildren: () => import('./websites-apps/websites-apps.module').then((m) => m.WebsitesAppModule),
            },
            {
                path: 'websites-contact',
                component: WebAppContactComponent,
            },
            {
                path: '',
                loadChildren: () => import('./home-admin/home-admin/home-admin.module').then((m) => m.HomeAdminModule),
            },
            {
                path: 'foods',
                loadChildren: () => import('./foods/foods.module').then((m) => m.FoodsModule),
            },
            {
                path: 'side-dishes',
                loadChildren: () => import('./side-dish/side-dish.module').then((m) => m.SideDishsModule),
            },
            {
                path: 'travels',
                loadChildren: () => import('./travels/travels.module').then((m) => m.TravelsModule),
            },
            {
                path: 'customer-class',
                loadChildren: () => import('./customer-group/customer-group.module').then((m) => m.CustomerGroupModule),
            },
            {
                path: 'manage-point',
                loadChildren: () => import('./reward-points/manage-point/manage-point.module').then((m) => m.ManagePointModule),
            },
            {
                path: 'reward-point-by-bill',
                loadChildren: () => import('./reward-points/by-bill/reward-points-by-bill.module').then(m => m.RewardPointByBillModule),
            },
            {
                path: 'reward-point-by-product',
                loadChildren: () => import('./reward-points/by-product/reward-points-by-product.module').then(m => m.RewardPointByProductModule),
            },
            {
                path: 'recruitment',
                loadChildren: () => import('./recruitment/recruitment.module').then(m => m.RecruitmentModule),
            },
            {
                path: 'info-candidate',
                component: InfoCandidatesComponent,
            },
            {
                path: 'info-contact',
                loadChildren: () => import('./info-contact/info-contact.module').then(m => m.InfoContactModule),
            },
            {
                path: 'branchs',
                loadChildren: () => import('./branchs/branchs.module').then(m => m.BranchsModule),
            },
            {
                path: 'config-maintenance',
                loadChildren: () => import('./components/config-maintenance/config-maintenance.module').then(m => m.ConfigMaintenanceModule),
            },
            {
                path: 'config-website',
                loadChildren: () => import('./config-website/website-config/website-config.module').then(m => m.ConfigWebsiteModule),
            },
            {
                path: 'config-hosting',
                loadChildren: () => import('./config-website/hosting-config/hosting-config.module').then(m => m.HostingConfigModule),
            },
            {
                path: 'config-ssl',
                loadChildren: () => import('./config-website/ssl-config/ssl-config.module').then(m => m.SslConfigModule),
            },
            {
                path: 'config-administrator',
                loadChildren: () => import('./config-website/administrator-config/administrator-config.module').then(m => m.AdministratorConfigModule),
            },
            {
                path: 'sitemap',
                component: SitemapComponent,
            },
            {
                path: 'canonical',
                component: CanonicalComponent,
            },
            {
                path: 'folders-manager',
                component: FoldersManagerComponent,
            },
            {
                path: 'customers',
                loadChildren: () => import('./customer-list/customer-list.module').then((m) => m.CustomerModule),
            },
            {
                path: 'casso',
                loadChildren: () => import('./casso/casso.module').then((m) => m.CassoModule),
            },
            {
                path: 'fields-embedded-script',
                component: FieldsEmbeddedScriptComponent,
            },
            {
                path: 'fields-google-shopping',
                component: FieldsGoogleShoppingComponent,
            },
            {
                path: 'products-google-shopping',
                component: ProductsGoogleShoppingComponent,
            },
            {
                path: 'list-scripts',
                component: ListScriptsComponent,
            },
            {
                path: 'list-scripts-object',
                component: ListScriptsObjectComponent,
            },
            {
                path: 'redirect-page',
                loadChildren: () => import('./redirect-page/redirect-page.module').then((m) => m.RedirectPageModule),
            },
        ],
    },
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule { }