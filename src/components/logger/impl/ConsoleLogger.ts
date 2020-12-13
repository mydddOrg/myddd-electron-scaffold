import { ILogger } from "../ILogger";

export class ConsoleLogger extends ILogger{

    error(message: string, ...meta: any[]): void {
        console.error(message,...meta);
    }

    warn(message: string, ...meta: any[]): void {
        console.warn(message,...meta);
    }

    info(message: string, ...meta: any[]): void {
        console.info(message,...meta);
    }

    log(message: string, ...meta: any[]): void {
        console.log(message,...meta);
    }

    debug(message: string, ...meta: any[]): void {
        console.debug(message,...meta);
    }

}