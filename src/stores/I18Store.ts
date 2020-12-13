import { observable, action } from "mobx";


import en_US from 'locales/en_US'
import zh_CN from 'locales/zh_CN'
import zh_TW from 'locales/zh_TW'

import { createContext } from "react";

class I18Store {

    @observable locale: string = 'zh';

    @observable language: any = zh_CN;

    @action public switchLanguage(language: string) {
        if (language == 'zh_CN') {
            this.locale = 'zh';
            this.language = zh_CN
        } else if (language == 'en_US') {
            this.locale = 'en';
            this.language = en_US;
        }
        else if (language == 'zh_TW') {
            this.locale = 'zh-tw';
            this.language = zh_TW;
        }
        else {
            //默认为简体中文
            this.locale = 'en';
            this.language = zh_CN
        }
    }

    public getCurrentLanguage() {
        if (this.locale == 'zh') {
            return "简体中文";
        }
        if (this.locale == 'zh-tw') {
            return "繁體中文";
        }
        else {
            return 'English';
        }
    }
}

export default createContext(new I18Store())
