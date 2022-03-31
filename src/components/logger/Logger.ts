import { ILogger } from "./ILogger";
import { InstanceFactory } from "components/ioc/InstanceFactory";
import { ModuleUtil } from "components/util/ModuleUtil";
import { FileUtil } from "components/util/FileUtil";
import { FSDirUtil } from "components/util/FSDirUtil";
import { TYPES } from "components/ioc/Types";

export class Logger {

    private static logger: ILogger;

    private static getLogger(): ILogger {
        if (!Logger.logger) {
            Logger.logger = InstanceFactory.getInstance(TYPES.ILogger);
        }
        return Logger.logger;
    }

    public static error(message: string, ...meta: any[]): void {
        if (Logger.getLogger()) {
            Logger.getLogger().error(message, meta);
        }
    }

    public static warn(message: string, ...meta: any[]): void {
        if (Logger.getLogger()) {
            Logger.getLogger().warn(message, meta);
        }
    }

    public static info(message: string, ...meta: any[]): void {
        if (Logger.getLogger()) {
            Logger.getLogger().info(message, meta);
        }
    }

    public static log(message: string, ...meta: any[]): void {
        if (Logger.getLogger()) {
            Logger.getLogger().log(message, meta);
        }
    }

    public static debug(message: string, ...meta: any[]): void {
        if (Logger.getLogger()) {
            Logger.getLogger().debug(message, meta);
        }
    }

    public static async getLoggerFile():Promise<string>{
        const { zip } = ModuleUtil.zipFolder;
        const loggerName = "logger_file.zip";
        const fullPath = FileUtil.fileInDownloadsDir(loggerName);
        await zip(FSDirUtil.loggerPath(), fullPath);
        return fullPath;
    }
}