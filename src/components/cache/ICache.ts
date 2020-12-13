export abstract class ICache {
    /**
     * 存储对象到CACHE中
     * @param key 
     * @param data 
     */
    abstract setData(key:string,data:any):void;

    /**
     * 从CACHE中获取数据
     * @param key 
     */
    abstract getData(key:string):any;

    /**
     * 查询指定的KEY是否存在
     * @param key 
     */ 
    abstract exists(key:string):boolean;

    /**
     * 清除指定KEY的缓存
     * @param key 
     */
    abstract clearData(key:string):void;

    /**
     * 清除所有缓存
     */
    abstract clearAll():void;

}