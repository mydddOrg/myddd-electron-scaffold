import { BaseResponse } from 'components/http/IRequest';

export abstract class ILoginNet {
    
    abstract endpoint():Promise<BaseResponse>;

    abstract login(username:string,password:string):Promise<BaseResponse>;

}