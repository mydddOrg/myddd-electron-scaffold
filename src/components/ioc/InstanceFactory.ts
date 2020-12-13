import { Container, Scope } from "typescript-ioc";
import { ILoginNet } from "modules/login/domain/ILoginNet";
import { LoginNet } from "modules/login/net/LoginNet";
import { ILoginApplication } from "modules/login/view/ILoginApplication";
import { LoginApplication } from "modules/login/application/LoginAppliction";
import { IRequest } from "components/http/IRequest";
import { BaseRequest } from "components/http/impl/BaseRequest";
import { ICache } from "components/cache/ICache";
import { CacheManger } from "components/cache/impl/CacheManager";
import { IDefaultHeaderPlugin } from 'components/http/IDefaultHeaderPlugin';
import { HeaderPlugin } from 'components/http/impl/HeaderPlugin';
import { ILogger } from 'components/logger/ILogger';
import { WinstonLogger } from 'components/logger/impl/WinstonLogger';
import { IRepository } from 'components/repository/IRepository';
import { Repository } from 'components/repository/impl/Repository';
import { ModuleUtil } from 'components/util/ModuleUtil';
import { ConsoleLogger } from 'components/logger/impl/ConsoleLogger';

export class InstanceFactory {

    public static initIOC() {

        //日志模块
        if (ModuleUtil.remote.getGlobal('NODE_ENV') !== 'production') {
            this.inject(ILogger, ConsoleLogger);
        } else {
            this.inject(ILogger, WinstonLogger);
        }
        //数据库
        this.inject(IRepository, Repository);

        //http基础模块
        this.inject(IRequest, BaseRequest);
        this.inject(IDefaultHeaderPlugin, HeaderPlugin);

        //cache模块
        this.injectLocal(ICache, CacheManger);

        //登录模块
        this.inject(ILoginNet, LoginNet);
        this.inject(ILoginApplication, LoginApplication);
    }





    private static inject(source: Function, target: Object) {
        Container.bind(source).to(target).scope(Scope.Singleton);
    }


    private static injectLocal(source: Function, target: Object) {
        Container.bind(source).to(target).scope(Scope.Local);
    }

    public static getInstance<T>(source: Function): T {
        return Container.get(source);
    }
}