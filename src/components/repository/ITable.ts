import { Table } from './Table';

/**
 * 仓储接口协议
 */
export interface ITable {

    /**
     * 创建表的语句
     */
    createTable():Table;

    /**
     * 更新表的语句
     * @param from 从哪个版本 
     * @param to 到哪个版本
     */
    updateTable(from:number,to:number):string[];
    

}