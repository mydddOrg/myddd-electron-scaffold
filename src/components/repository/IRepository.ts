import { ITable } from "./ITable";

export abstract class IRepository {


  abstract prepare(dbName: string, tables: ITable[], version?: number, encrypt?: boolean): void;
  /**
   * 执行一条查询，返回数组或空
   * @param sql 
   * @param params 
   */
  abstract executeQuery<T>(sql: string, params?: any): Promise<T[] | null>;

  /**
 * 执行一条查询，返回单个对像或空
 * @param sql 
 * @param params 
 */
  abstract executeSingleQuery<T>(sql: string, params?: any): Promise<T | null>;

  /**
   * 执行一条数据库更新操作，返回是否执行成功
   * @param sql 
   * @param params 
   */
  abstract executeUpdate(sql: string, params?: any): Promise<boolean>;

  /**
   * 执行一个事务内的批量数据库操作
   * @param sqls 批量执行的数组
   * @param params 批量参数组
   */
  abstract executeBatchUpdate(sqls: string[], params?: any[]): Promise<boolean>;

  /**
   * 关闭数据库连接
   */
  abstract close(): void;


  abstract init(): Promise<boolean>;
}