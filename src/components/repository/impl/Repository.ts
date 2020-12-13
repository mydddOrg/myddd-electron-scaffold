import * as sqlite from 'sqlite3';
import { ITable } from '../ITable';
import { Stats } from 'fs';
import { Table } from '../Table';
import { FSDirUtil } from 'components/util/FSDirUtil';
import { IRepository } from '../IRepository';
import { Logger } from 'components/logger/Logger';


/**
 * 仓储类
 */
export class Repository extends IRepository {


    private static BEGIN_TRANSACTION = 'BEGIN TRANSACTION;';

    private static COMMIT_TRANSACTION = 'COMMIT;';

    private static ROLLBACK = 'ROLLBACK;';


    //创建版本控制的语句
    private static CREATE_VERSION_TABLE: string = "CREATE TABLE IF NOT EXISTS PCX_VERSION_ (VALUE_ INT NOT NULL)";

    //初始化版本控制的语句
    private static INIT_VERSION_TABLE_CONTENT: string = "INSERT INTO PCX_VERSION_ (VALUE_) values (?) ";

    //查询当前的版本号
    private static QUERY_CURRENT_VERSION: string = "SELECT VALUE_ FROM PCX_VERSION_ LIMIT 1";

    //更新版本SQL
    private static UPDATE_VERSION: string = "UPDATE PCX_VERSION_ SET VALUE_ = ?";

    private static QUERY_ALL_TABLES: string = "SELECT name FROM sqlite_master WHERE type='table'";

    //数据库仓库
    private db: sqlite.Database;

    //数据库表
    private tables: ITable[];

    //是否加密，预留
    private encrypt: boolean;

    //版本号，用来做更新
    private version: number;

    private dbPath: string;

    private dbName: string;


    public prepare(dbName: string, tables: ITable[], version: number = 1, encrypt: boolean = false) {
        this.tables = tables;
        this.version = version;
        this.encrypt = encrypt;
        this.dbName = dbName;
    }

    private prepareDB() {
        const sqlite3 = sqlite.verbose();
        const path = require('path');
        const userDataPath = FSDirUtil.userDataDir();
        this.dbPath = path.join(userDataPath, this.dbName);
        this.db = new sqlite3.Database(this.dbPath, () => { });
    }

    /**
     * 初始化或更新数据库
     */
    public async init(): Promise<boolean> {
        this.prepareDB();
        Logger.log("【数据库】数据库路径：" + this.dbPath);

        const fs = require('fs');

        return new Promise((resolve, rejects) => {
            fs.stat(this.dbPath, async (error: Error, stats: Stats) => {
                if (error || stats.size === 0) {
                    const success: boolean = await this.initRepository();
                    resolve(success);
                    return;
                }

                const success: boolean = await this.updateRepository();
                resolve(success);
            });
        });


    }


    private initData() {
    }

    public async initRepository(): Promise<boolean> {
        Logger.log('【数据库】准备初始化数据库');
        this.initData();
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                try {
                    //开启一个事务
                    this.db.run(Repository.BEGIN_TRANSACTION);

                    this.runSQL(Repository.CREATE_VERSION_TABLE);

                    const stmt = this.db.prepare(Repository.INIT_VERSION_TABLE_CONTENT);
                    stmt.run(this.version);
                    stmt.finalize();

                    this.runSQL(Repository.INIT_VERSION_TABLE_CONTENT, this.version);
                    this.createTables();
                    //提交一个事务
                    this.db.run(Repository.COMMIT_TRANSACTION);
                    resolve(true);
                } catch (err) {
                    Logger.log(err);
                    this.db.run(Repository.ROLLBACK);
                }

            });
        });
    }

    private updateTableSQL(from: number, to: number) {
        for (const iTable of this.tables) {
            const updateSQLS = iTable.updateTable(from, to);
            updateSQLS.forEach(sql => {
                this.runSQL(sql);
            })
        }
    }

    private createTables(version: number = 1, tables: string[] = []) {
        for (const iTable of this.tables) {
            const table: Table = iTable.createTable();
            if (tables.includes(table.tableName)) {
                continue;
            }
            const createTableSQL: string = table.createTableSQL(version);
            const createIndexSQL: string = table.createIndexSQL(version);
            this.runSQL(createTableSQL + createIndexSQL);
        }
    }

    private runSQL(sql: string, ...params: any[]) {
        this.db.run(sql, params, function (err: Error, row: any) {
            if (err) {
                throw err;
            }
        });
    }

    private async updateRepository(): Promise<boolean> {
        Logger.log('【数据库】准备更新数据库')
        const result: any = await this.executeSingleQuery(Repository.QUERY_CURRENT_VERSION, {});
        const currentValue = result.VALUE_;
        Logger.log("【数据库】当前数据库版本", currentValue);

        const allTables: any[] = await this.executeQuery<string>(Repository.QUERY_ALL_TABLES, {});
        const tables: string[] = [];
        allTables.forEach(tableResult => {
            tables.push(tableResult.name);
        })
        Logger.log("【数据库】查出所有表", tables);

        return new Promise((resolve, reject) => {

            this.db.serialize(() => {
                try {
                    //开启一个事务
                    this.db.run(Repository.BEGIN_TRANSACTION);
                    //版本号一致，则只执行表创建逻辑 
                    if (currentValue == this.version) {
                        Logger.log("【数据库】数据库更新：版本一致，仅执行表创建工作");
                        this.createTables(this.version);
                    } else {
                        //版本号不一致，执行表创建+执行更新语句
                        for (let i = currentValue; i < this.version; i++) {
                            const from = i;
                            const to = from + 1;
                            this.createTables(to);
                            this.updateTableSQL(from, to);
                        }
                    }

                    //更新当前版本号至数据库
                    const stmt = this.db.prepare(Repository.UPDATE_VERSION);
                    stmt.run(this.version);
                    stmt.finalize();

                    this.runSQL(Repository.INIT_VERSION_TABLE_CONTENT, this.version);

                    //提交一个事务
                    this.db.run(Repository.COMMIT_TRANSACTION);
                    resolve(true);
                } catch (err) {
                    Logger.log(err);
                    this.db.run(Repository.ROLLBACK);
                    resolve(false);
                }
            });
        });

    }


    /**
     * 执行一条SQL
     * @param string 需要执行的SQL
     * @param params 参数
     */
    public executeUpdate(sql: string, params: any): Promise<boolean> {
        return new Promise((resolove, reject) => {
            this.db.serialize(() => {
                this.db.run(sql, params, function (err: Error, row: any) {
                    if (err) {
                        this.logger.error("DB ERROR", err);
                        reject();
                        return;
                    }
                    resolove(true);
                });
            });

        });
    }

    private executeUpdateInTransation(sql: string, params: any): boolean {
        this.db.run(sql, params, function (err: Error, row: any) {
            if (err) {
                this.logger.error("DB ERROR", err);
                return false;
            }
            return true;
        });
        return true;
    }


    public async executeQuery<T>(sql: string, params: any = {}): Promise<T[] | null> {
        return new Promise((resolove, reject) => {
            this.db.serialize(() => {
                let result: any[] = [];
                this.db.each(sql, params, function (err: Error, rows: any) {
                    if (err) {
                        Logger.error("DB ERROR", err,sql,params);
                        reject();
                        return;
                    }
                    result.push((rows as T));
                }, function (err: Error | null, count: number) {
                    if (err) {
                        Logger.error("DB ERROR", err);
                        reject();
                        return;
                    }
                    resolove(result);
                });
            });
        });
    }

    public executeSingleQuery<T>(sql: string, params: any): Promise<T | null> {

        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                // let result:any = null;
                this.db.get(sql, params, function (err: Error, rows: any) {
                    if (err) {
                        Logger.error("DB ERROR", err);
                        reject();
                        return;
                    }
                    resolve((rows as T));
                });
            });
        });
    }

    public executeBatchUpdate(sqls: string[], params: any[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                const begin: number = new Date().getTime();
                //开启一个事务
                this.db.run(Repository.BEGIN_TRANSACTION);
                try {
                    for (let i = 0; i < sqls.length; i++) {
                        const sql: string = sqls[i];
                        const param: any = params[i];
                        const success: boolean = this.executeUpdateInTransation(sql, param);
                        if (!success) {
                            throw new Error('sql error:' + sql + "");
                        }
                    }
                    //提交事务
                    this.db.run(Repository.COMMIT_TRANSACTION);
                    const end: number = new Date().getTime();
                    Logger.log("【数据库】总耗时:" + (end - begin));
                    resolve(true);
                } catch (err) {
                    Logger.error("DB ERROR", err);
                    this.db.run(Repository.ROLLBACK);

                    resolve(false);
                }

            });
        });
    }

    /**
     * 关闭数据库连接
     */
    public close() {
        this.db.close();
    }


}