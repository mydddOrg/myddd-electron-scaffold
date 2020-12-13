import { ICache } from '../ICache';
import Config from '../../Config';

export class CacheManger implements ICache {

    private cache?:any;

    private constructor(ttl:number,useClones:boolean){
      const NodeCache = require( "node-cache" );
      this.cache = new NodeCache( { stdTTL: ttl, checkperiod: 30 , useClones:useClones } );
    }

    public setData(key: string, data: any): void {
        if(Config.getInstance().disableCache()){
            return;
        }
        this.cache.set(key,data);
    }    
    
    public getData(key: string):any {
        if(Config.getInstance().disableCache()){
            return null;
        }
        return this.cache.get(key);
    }

    public clearData(key: string): void {
        this.cache.del(key);
    }

    public clearAll(): void {
        this.cache.flushAll();
    }

    public exists(key:string):boolean{
        if(Config.getInstance().disableCache()){
            return false;
        }
        return this.cache.has(key);
    }

    public static createInstnace(ttl:number = 0,useClones:boolean = false):ICache{
        return new CacheManger(ttl,useClones);
    }


}