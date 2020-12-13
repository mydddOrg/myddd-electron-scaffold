import { ILogger } from "../ILogger";
import * as winston from 'winston';

import { FSDirUtil } from "components/util/FSDirUtil";

export class WinstonLogger extends ILogger {


    private logger: winston.Logger;

    public constructor() {

        super();
        const winston = window.require('winston');
        window.require('winston-daily-rotate-file');

        const transport = new winston.transports.DailyRotateFile({
            dirname: FSDirUtil.loggerPath(),
            filename: 'pcx-logger-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d'
        });

        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ dirname: FSDirUtil.loggerPath(), filename: 'error.log', level: 'error' }),
                transport
            ],
        });

        this.logger.add(new winston.transports.Console({
            format: winston.format.simple(),
        }));
    }

    error(message: string, ...meta: any[]): void {
        this.logger.error(message, ...meta);
    }

    warn(message: string, ...meta: any[]): void {
        this.logger.warn(message, ...meta);
    }

    info(message: string, ...meta: any[]): void {
        this.logger.info(message, ...meta);
    }

    log(message: string, ...meta: any[]): void {
        this.logger.info(message, ...meta);
    }

    debug(message: string, ...meta: any[]): void {
        this.logger.debug(message, ...meta);
    }

}
