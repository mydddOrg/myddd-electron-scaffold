import React from 'react'
import 'style/titlebar/TitleRightBar.module.css'
import { ModuleUtil } from 'components/util/ModuleUtil';
import { AuthStore } from 'stores/AuthStore';

/**
 * 工具栏右边的功能区
 */
export const TitleRightBar = () => {

    const remote = ModuleUtil.remote;



    const maxWin = () => {
        if (remote.getCurrentWindow().isFullScreen()) {
            remote.getCurrentWindow().setFullScreen(false);
            return;
        }
        remote.getCurrentWindow().setFullScreen(true); 
    }


    return (<div className="title_right_context">
        <div className="title_right_toolbar" onDoubleClick={maxWin}>
        </div>
    </div>
    )
}
