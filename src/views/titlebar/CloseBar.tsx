import React from "react";
import { useHistory } from "react-router-dom";
import 'style/titlebar/CloseBar.module.css'
import BaseRepository from "components/repository/BaseRepository";
import { RemoteUtil } from "components/util/RemoteUtil";
import { ModuleUtil } from "components/util/ModuleUtil";
import { useIntl } from 'react-intl';

/**
 * 主界面左上角的关闭，最小化，最大化等功能
 */
export const CloseBar = () => {

    const intl = useIntl();

    let history = useHistory();
    const remote = ModuleUtil.remote;

    /**
     * 关闭主界面
     */
    const closeWin = () => {
        BaseRepository.getInstance().close();
        history.push("/login");

        RemoteUtil.sendNoticeToMainProcess('USE_LOGOUT');
    }

    const hidden = () => {
        remote.getCurrentWindow().hide();
    }

    /**
     * 最小化窗口
     */
    const minWin = () => {
        remote.getCurrentWindow().minimize();
    };

    /**
     * 最大化窗口
     */
    const maxWin = () => {
        if (remote.getCurrentWindow().isFullScreen()) {
            remote.getCurrentWindow().setFullScreen(false);
            return;
        }
        remote.getCurrentWindow().setFullScreen(true);
    }

    return (
        <div className="no_dray close_bar_container">
            
            {
                (() => {
                    const divs: any[] = [];
                    if (ModuleUtil.remote.process.platform == 'win32') {

                        divs.push(<div key='closebar_min' className="closebar_min cursor" title={intl.formatMessage({ id: 'minimize_tip' })} onClick={minWin}></div>);
                        divs.push(<div key='closebar_max' className="closebar_max cursor" title={intl.formatMessage({ id: 'maximize_tip' })} onClick={maxWin}></div>);
                        divs.push(<div key='closebar_close' className="closebar_close cursor" title={intl.formatMessage({ id: 'close_tip' })} onClick={hidden}></div>);
                    } else { 

                        divs.push(<div key='closebar_close' className="closebar_close cursor" title={intl.formatMessage({ id: 'close_tip' })} onClick={hidden}></div>);
                        divs.push(<div key='closebar_min' className="closebar_min cursor" title={intl.formatMessage({ id: 'minimize_tip' })} onClick={minWin}></div>);
                        divs.push(<div key='closebar_max' className="closebar_max cursor" title={intl.formatMessage({ id: 'maximize_tip' })} onClick={maxWin}></div>);
                    }
                    return divs;
                })()
            }

        </div>
    );
}