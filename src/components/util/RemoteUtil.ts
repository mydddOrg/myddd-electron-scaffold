
import { ModuleUtil } from "./ModuleUtil";

export class RemoteUtil {
    
    public static sendNoticeToMainProcess(notice: string, ...args: any[]) {
        const ipcRenderer = ModuleUtil.ipcRenderer;
        ipcRenderer.send(notice,...args);
    }

}