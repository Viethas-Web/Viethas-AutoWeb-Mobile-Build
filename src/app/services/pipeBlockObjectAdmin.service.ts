import { Injectable } from "@angular/core";
import { AtwFreeblockAdmin, AtwPagesAdmin } from "vhobjects-user";

@Injectable({
    providedIn: 'root',
})
export class PipeBlockObjectAdminService {
    constructor() {

    }

    public pipeBlockObjectAdminComponent(component_name): any {
        switch (component_name) {
            
            case 'AtwPagesAdmin': return AtwPagesAdmin;
            case 'AtwBlockBlankAdmin': return AtwFreeblockAdmin;
            case 'AtwBlockChatboxAdmin': return AtwFreeblockAdmin;
            case 'AtwBlockFooterAdmin': return AtwFreeblockAdmin;
            case 'AtwBlockHeaderAdmin': return AtwFreeblockAdmin;
            case 'HoverBlankAdminComponent': return AtwFreeblockAdmin;
            case 'PopupDetailProductAdminComponent': return AtwFreeblockAdmin;
            case 'PopupHoverBlankAdminComponent': return AtwFreeblockAdmin;
             
            
        }
    }
}