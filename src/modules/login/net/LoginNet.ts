import Config from 'components/Config';
import { BaseResponse, IRequest } from 'components/http/IRequest';
import { ILoginNet } from '../domain/ILoginNet';
import { AuthStore } from 'stores/AuthStore';
import { Inject } from 'typescript-ioc';
import { ModuleUtil } from 'components/util/ModuleUtil';

export class LoginNet extends ILoginNet{

    config:Config = Config.getInstance();

    static SYSTEM_MAC = 'Mac';
    static SYSTEM_WINDOW ='Windows';
    static SYSTEM_LINUX = 'Linux'

    @Inject
    request:IRequest;

    public constructor(){
        super()
    }

    /**
     * 请求endpoints
     * @param accessToken 
     */
    public async endpoint():Promise<BaseResponse> {
        const url:string = this.config.api + "/endpoints";

        const systemName = ModuleUtil.remote.process.platform == 'darwin'?LoginNet.SYSTEM_MAC:LoginNet.SYSTEM_WINDOW


        const params = {
            "locale":"zh_CN",
            "encrypt_type":0,
            "system_name":systemName
        }
        return await this.request.requestForPost<BaseResponse>(url,params);
    }


    /**
     * 登录
     */
    public async login(username:string,password:string):Promise<BaseResponse> {

        const url:string = this.config.api + "/token";
        const config:Config = this.config;

        const params = {
            "grant_type":"password",
            "scope":"user",
            "domain_id":config.domainId,
            "client_id":username,
            "client_secret":password,
            "client_secret_encrypt":false,
            "device_id":config.deviceId(),
            "device_platform":"PC"
        }
        return await this.request.requestForPost<BaseResponse>(url,params);
    }
}