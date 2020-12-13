
export abstract class ILogger {

    /**
     * 记录错误日志
     * @param module 
     * @param message 
     */
    abstract error(message: string,...meta: any[]): void;


    /**
     * 记录警告日志
     * @param module 
     * @param message 
     */
    abstract warn(message: string,...meta: any[]): void;

    /**
     * 记录普通日志
     * @param module 
     * @param message 
     */
    abstract info(message: string,...meta: any[]): void;

    abstract log(message: string,...meta: any[]): void;

    /**
     * 记录Debug日志
     * @param module 
     * @param message 
     */
    abstract debug(message: string,...meta: any[]): void;

}