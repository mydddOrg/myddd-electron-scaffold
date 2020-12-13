

/**
 * 数据库列的类型
 */
export enum ColumnType {
    Text,
    Integer,
    Blob,
    Real
}

class Column {

    name: string;

    type: ColumnType;

    notNull: boolean;

    version: number = 1;

    constructor(name: string, type: ColumnType = ColumnType.Text, notNull: boolean = false) {
        this.name = name;
        this.type = type;
        this.notNull = notNull;
    }

    public columnCreateSQL(): string {
        return this.name + " " + this.columnTypeString() + " " + (this.notNull ? " NOT NULL" : "");
    }

    private columnTypeString(): string {
        if (this.type == ColumnType.Text) {
            return "text";
        }
        else if (this.type == ColumnType.Integer) {
            return "int";
        }
        else if (this.type == ColumnType.Blob) {
            return "blob";
        }
        else if (this.type == ColumnType.Real) {
            return "real";
        }

        return "text";
    }
}

export class Table {

    public constructor(tableName: string) {
        this.tableName = tableName;
    }
    /**
     * 表名
     */
    tableName?: string;

    /**
     * 所有列
     */
    columns: Column[] = [];

    /**
     * 主键
     */
    primaryColumns: Column[] = [];

    /**
     * 索引列
     */
    indexColumns: Column[] = [];

    /**
     * 定义表中新增加一个普通列
     * @param name 
     * @param type 
     * @param notNull 
     */
    public addColumn(name: string, type: ColumnType = ColumnType.Text, notNull: boolean = false): Table {
        const column = new Column(name, type, notNull);
        this.columns.push(column);
        return this;
    }

    /**
     * 增加一个带版本的普通列，表明创建表时，需要根据列版本来执行
     * @param name 
     * @param version 
     * @param type 
     * @param notNull 
     */
    public addColumnWithVersion(name: string, version: number = 1, type: ColumnType = ColumnType.Text, notNull: boolean = false) {
        const column = new Column(name, type, notNull);
        column.version = version;
        this.columns.push(column);
        return this;
    }

    /**
     * 定义表中新增加一个主键
     * @param name 
     * @param type 
     * @param notNull 
     */
    public addPrimaryColumn(name: string, type: ColumnType = ColumnType.Text): Table {
        const column = new Column(name, type, false);
        this.primaryColumns.push(column);
        this.columns.push(column);
        return this;
    }

    /**
     * 定义增加一个索引列
     * @param name 
     * @param type 
     * @param notNull 
     */
    public addIndexColumn(name: string, type: ColumnType = ColumnType.Text, notNull: boolean = false): Table {
        const column = new Column(name, type, notNull);
        this.indexColumns.push(column);
        this.columns.push(column);
        return this;
    }

    public addIndexColumnWithVersion(name: string, version: number = 1, type: ColumnType = ColumnType.Text, notNull: boolean = false) {
        const column = new Column(name, type, notNull);
        column.version = version;
        this.indexColumns.push(column);
        this.columns.push(column);
        return this;
    }

    /**
     * 组装建表语句
     */
    public createTableSQL(verson: number = 1): string {
        let createTableSQL: string = '';

        createTableSQL += "create table if not exists ";
        //表名
        createTableSQL += this.tableName;
        //左括号
        createTableSQL += "(";

        //遍历列定义
        for (const column of this.columns) {
            if(column.version > verson){
                continue;
            }
            createTableSQL += column.columnCreateSQL();
            createTableSQL += " ,";
        }

        //获取主键定义
        createTableSQL += this.primayKeyString();

        //右括号
        createTableSQL += ");";

        return createTableSQL;
    }

    /**
     * 组装索引语句
     */
    public createIndexSQL(verson: number = 1): string {
        let createIndexSQL: string = "";
        for (const indexColumn of this.indexColumns) {
            if(indexColumn.version > verson){
                continue;
            }
            createIndexSQL += "CREATE INDEX IF NOT EXISTS index_" + this.tableName + "_" + indexColumn.name + " ON " + this.tableName + " (" + indexColumn.name + ");";
        }
        return createIndexSQL;
    }

    /**
     * 组装主键语句
     */
    private primayKeyString(): string {
        let primaryKey: string = "";
        if (this.primaryColumns.length > 0) {
            primaryKey += "PRIMARY KEY(";
            for (let i = 0; i < this.primaryColumns.length; i++) {
                const primaryColumn = this.primaryColumns[i];
                primaryKey += primaryColumn.name;
                if (i != this.primaryColumns.length - 1) {
                    primaryKey += ",";
                }
            }
            primaryKey += ")";
        }
        //如果表格未定义主键，则生成一个默认主键
        else {
            primaryKey = "_id " + " integer PRIMARY KEY autoincrement"
        }
        return primaryKey;
    }
}