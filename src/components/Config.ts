
export class Config{

    private static instance:Config;
    target?:string;

    api:string;

    domainId:string;

    debugWSApi:string;

    name:string;

    amapRestKey:string;

    documentUrl:string;

    private constructor(config:string){
        const data = require('../../src/config/config-'+config+'.json');
        this.api = data.api;
        this.domainId = data.domainId;
        this.debugWSApi = data.debugWSApi;
        this.name = data.name;
        this.amapRestKey = data.amapRestKey;
        this.documentUrl = data.documentUrl;
    }

    public static getInstance():Config{
        const targetConfig = require('../../src/config/base.json');
        const target = targetConfig.target;
        if (!this.instance || this.instance.target !== target){
            this.instance = new Config(target);
        }
        return this.instance;
    }

    /**
     * 获取当前用户的Device ID
     */
    public deviceId():string {
        const deviceId = localStorage.deviceId;
        return localStorage.deviceId;
    }
    

    public disableCache():boolean{
        return false;
    }
} 


export default Config