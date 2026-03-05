import { Injectable } from "@angular/core";
// import { AtwBlockBlank, AtwBlockChatbox, AtwBlockFooter, AtwBlockHeader, AtwBlockHoverBlank, AtwBlockMobileTabs, AtwBlockPopupDetailProduct, AtwBlockPopupHoverBlank } from "vhobjects-user";

@Injectable({
    providedIn: 'root',
})
export class PipeBlockService {
    constructor() {

    }

    public pipeBlockComponent(component_name): any {
        switch (component_name) {
            // case 'AtwBlockBlank': return AtwBlockBlank;
            // case 'AtwBlockHeader': return AtwBlockHeader;
            // case 'AtwBlockPopupHoverBlank': return AtwBlockPopupHoverBlank;
            // case 'AtwBlockHoverBlank': return AtwBlockHoverBlank;
            // case 'AtwBlockPopupDetailProduct': return AtwBlockPopupDetailProduct;
            // case 'AtwBlockFooter': return AtwBlockFooter;
            // case 'AtwBlockChatbox': return AtwBlockChatbox;
            // case 'AtwBlockMobileTabs': return AtwBlockMobileTabs;
            
        }
    }
}