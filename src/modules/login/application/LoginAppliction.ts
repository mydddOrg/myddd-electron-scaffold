import { InstanceFactory } from './../../../components/ioc/InstanceFactory';
import { ILoginApplication } from '../view/ILoginApplication';
import { ILoginNet } from '../domain/ILoginNet';
import { BaseResponse } from 'components/http/IRequest';

import { AuthStore } from 'stores/AuthStore';
import BaseRepository from 'components/repository/BaseRepository';
import { FSDirUtil } from 'components/util/FSDirUtil';
import { FileUtil } from 'components/util/FileUtil';

export class LoginApplication extends ILoginApplication{

    private loginNet:ILoginNet = InstanceFactory.getInstance(ILoginNet);

    public async endpoint(): Promise<boolean> {
        const response:BaseResponse = await this.loginNet.endpoint();
        if(response.resultSuccess()){
            AuthStore.getInstance().setSession(response.result);
        }
        return response.resultSuccess();
    }

    public async login(username: string, password: string): Promise<BaseResponse> {
        // const response:BaseResponse = await this.loginNet.login(username,password);
        // if (response.resultSuccess()){
        //     AuthStore.getInstance().setAuth(response.result);
        //     AuthStore.getInstance().setLoginName(username);
        // }
        // return response;
        //Mock数据
        return null;
    }

    public async initLoginUser():Promise<boolean>{
        let success:boolean = await FSDirUtil.createUserDataDir();
        if(!success){
            return false;
        }
        success = await FSDirUtil.createDirs();
        if(!success){
            return false;
        }
        success = await BaseRepository.getInstance().initRepository();
        if(!success){
            return false;
        }
        return success;
    }

    public async resetAllData():Promise<boolean> {
        return FileUtil.rmDir(FSDirUtil.documentPath());
    }
}