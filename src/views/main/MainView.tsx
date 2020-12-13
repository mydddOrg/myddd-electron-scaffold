import { ModuleUtil } from 'components/util/ModuleUtil';
import { observer } from 'mobx-react-lite';
import React, {useEffect} from 'react';
import { useHistory } from "react-router-dom";

import 'style/main/MainView.module.css';
import { TitleBar } from './TitleBar';

/**
 * 主界面
 */
export const MainView = observer(() => {

    let history = useHistory();

        /**
     * 显示主窗口，需要设置大小及其它行为
     */
    const show = () => {
        const remote = ModuleUtil.remote;
        remote.getCurrentWindow().setSize(1000, 720, true);
        remote.getCurrentWindow().setMinimumSize(1000, 720);
        remote.getCurrentWindow().center();
        remote.getCurrentWindow().resizable = true;
        remote.getCurrentWindow().show();
    };

    useEffect(()=>{
        show()
    },[])

    return (
        <div className='main_container'>
            <div className='main_wrapper'>
            <div className='title_bar'>
                    <TitleBar />
                </div>
                <div className='main'>
                    <div className='module'>
                    </div>
                </div>
            </div>
        </div>
    )
});