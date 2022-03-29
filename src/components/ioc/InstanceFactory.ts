import "reflect-metadata";

import { LoginNet } from "modules/login/net/LoginNet";
import { LoginApplication } from "modules/login/application/LoginAppliction";
import { BaseRequest } from "components/http/impl/BaseRequest";
import { CacheManger } from "components/cache/impl/CacheManager";
import { HeaderPlugin } from "components/http/impl/HeaderPlugin";
import { WinstonLogger } from "components/logger/impl/WinstonLogger";
import { Repository } from "components/repository/impl/Repository";
import { ModuleUtil } from "components/util/ModuleUtil";
import { ConsoleLogger } from "components/logger/impl/ConsoleLogger";
import { TYPES } from "./Types";
import { container, Lifecycle } from "tsyringe";

export class InstanceFactory {
  public static initIOC() {
    //日志模块
    if (ModuleUtil.remote.getGlobal("NODE_ENV") !== "production") {
      this.inject(TYPES.ILogger, ConsoleLogger);
    } else {
      this.inject(TYPES.ILogger, WinstonLogger);
    }
    //数据库
    this.inject(TYPES.IRepository, Repository);

    //http基础模块
    this.inject(TYPES.IRequest, BaseRequest);
    this.inject(TYPES.IDefaultHeaderPlugin, HeaderPlugin);

    //cache模块
    this.injectLocal(TYPES.ICache, CacheManger);

    //登录模块
    this.inject(TYPES.ILoginNet, LoginNet);
    this.inject(TYPES.ILoginApplication, LoginApplication);
  }

  private static inject(symbol: Symbol, target: any) {
    container.register(
      symbol.toString(),
      { useClass: target },
      { lifecycle: Lifecycle.Singleton }
    );
  }

  private static injectLocal(symbol: Symbol, target: any) {
    container.register(
      symbol.toString(),
      { useClass: target },
      { lifecycle: Lifecycle.Transient }
    );
  }

  public static getInstance<T>(symbol: Symbol): T {
    return container.resolve(symbol.toString());
  }
}
