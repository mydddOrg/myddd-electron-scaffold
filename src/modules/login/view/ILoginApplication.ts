import { BaseResponse } from "components/http/IRequest";

export abstract class ILoginApplication {

    /**
     * 请求endpoint接口
     */
    abstract endpoint():Promise<boolean>;

    /**
     * 使用用户名密码进行登录
     * @param username 用户名
     * @param password 密码
     */
    abstract login(username:string,password:string):Promise<BaseResponse>;


    abstract initLoginUser():Promise<boolean>;


    /**
     * 重置所有数据（仅开发阶段使用）
     */
    abstract resetAllData():Promise<boolean>;
    
}