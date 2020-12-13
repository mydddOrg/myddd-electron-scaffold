import { IDefaultHeaderPlugin } from "../IDefaultHeaderPlugin";
import { AuthStore } from "stores/AuthStore";
import { ModuleUtil } from "components/util/ModuleUtil";

export class HeaderPlugin extends IDefaultHeaderPlugin {

    private version: string;

    defaultHeaders(): Map<string, string> {
        const headers = new Map();
        headers.set("X-WP-TOKEN", AuthStore.getInstance().token);
        headers.set("X-WP-VERSION", this.getVersion());
        headers.set("X-WP-LANG", "zh_CN");
        return headers;
    }

    private getVersion() {
        if (!this.version) {
            const development: boolean = ModuleUtil.remote.process.env.NODE_ENV === 'development'
            if (development) {
                const pjson = window.require('./package.json');
                this.version = pjson.version;
            } else {
                this.version = ModuleUtil.remote.app.getVersion();
            }

        }
        return this.version;
    }
}