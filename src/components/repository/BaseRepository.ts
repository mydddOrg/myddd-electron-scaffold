import { TYPES } from 'components/ioc/Types';
import { ITable } from './ITable';
import { IRepository } from './IRepository';
import { InstanceFactory } from 'components/ioc/InstanceFactory';

export class BaseRepository {

    private static DB_NAME = 'workplus.data';

    private static DB_VERSION = 1;

    private repository: IRepository;

    private tables: ITable[] = [];

    private static instance: BaseRepository;

    public static getInstance(): BaseRepository {
        if (!BaseRepository.instance) {
            BaseRepository.instance = new BaseRepository();
        }
        return BaseRepository.instance;
    }

    public getRepository(): IRepository {
        if (!this.repository) {
            this.repository = InstanceFactory.getInstance(TYPES.IRepository);
        }
        return this.repository;
    }

    public constructor() {

        //添加会话表
        // this.tables.push(new SessionTable());
    }

    public async initRepository(): Promise<boolean> {

        this.getRepository().prepare(BaseRepository.DB_NAME, this.tables, BaseRepository.DB_VERSION);
        const initResult: boolean = await this.repository.init();
        return initResult;
    }

    public close() {
        if (this.getRepository()) {
            this.repository.close();
            this.repository = null;
            BaseRepository.instance = null;
        }
    }

}

export default BaseRepository;