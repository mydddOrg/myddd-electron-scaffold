import { observable, action } from 'mobx';
import { createContext } from 'react';
'use strict'

export class AuthStore {
    @observable token: string = ''
    @observable loginName: string = ''
    @observable password: string = ''
    @observable userId: string = ''

    @observable sessionEndpoint: string = ''
    @observable secret: string = '';


    private static instance: AuthStore;

    private constructor() {

    }

    @action setAuth(auth: any) {
        this.token = auth.access_token;
        this.userId = auth.client_id;
        this.secret = auth.secret;
    }

    @action setLoginName(loginName: string) {
        this.loginName = loginName;
    }

    @action setUserId(userId: string) {
        this.userId = userId;
    }

    @action setSession(sessionAuth: any) {
        this.sessionEndpoint = sessionAuth.session_endpoint;
        this.secret = sessionAuth.session_secret;
    }

    public fromJson(auth: AuthStore) {
        this.token = auth.token;
        this.userId = auth.userId;
    }

    public static getInstance(): AuthStore {
        if (!AuthStore.instance) {
            AuthStore.instance = new AuthStore();
        }
        return AuthStore.instance;
    }

    /**
     * 检测当前登录是否存在
     */
    public isTokenExists(): Boolean {
        if (this.token === '') {
            return false;
        }
        return true;
    }

}

export default createContext(AuthStore.getInstance());
