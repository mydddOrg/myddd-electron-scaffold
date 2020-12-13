import { action, observable } from 'mobx';
import { createContext } from 'react';


'use strict'


export class UIStore {

    public static instance: UIStore = new UIStore;


    public static getInstance(): UIStore {
        return UIStore.instance;
    }
    /**
     * 当前主界面选中的功能模块（消息，应用等)
     */
    @observable module: string = 'message';

    @observable sessionId: string;

    @observable createDiscusson: boolean = false;

    private constructor() {
        this.module = 'message';
    }

    /**s
     * 用户选中某个功能模块
     */
    @action setModule = (module: string) => {
        this.module = module;
    }

    /**
     * 用户选中某个SESSION
     */
    @action selectSession = (sessonId: string) => {
        this.sessionId = sessonId;
    }

    @action cancelSelect = () => {
        this.sessionId = null;
    }

    /**
     * 重置状态，登出时使用
     */
    @action reset = () => {
        this.module = 'message';
        this.sessionId = null;
    }
    
    public isContactModule() {
        return this.module == 'contact';
    }

    @action setCreateDiscussion(create: boolean) {
        this.createDiscusson = create;
    }

    @action selectMessageModule(){
        this.module = 'message';
    }

    @action selectContactModule(){
        this.module = 'contact';
    }

    @action selectAppModule(){
        this.module = 'app';
    }

    @action selectBingModule(){
        this.module = 'bing';
    }

    @action selctFvaorModule(){
        this.module = 'favor';
    }

}

export default createContext(UIStore.getInstance())

