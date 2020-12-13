import React, { useEffect } from "react";
import 'style/titlebar/TitleBar.module.css'

import { CloseBar } from 'views/titlebar/CloseBar'
import { TitleRightBar } from "views/titlebar/TitleRightBar";
import { ModuleUtil } from "components/util/ModuleUtil";
export const TitleBar = () => {
    
    return (
        <div className='title_bar_container '>

            {
                (() => {
                    const divs: any[] = [];
                    if (ModuleUtil.remote.process.platform == 'win32') {
                        divs.push(<div key='title_right_bar' className='title_right_bar'><TitleRightBar /></div>);
                        divs.push(<div key='title_empty_bar' className='title_empty_bar dray'></div>);
                        divs.push(<div key='close_bar' className='close_bar'><CloseBar /></div>);
                    } else {
                        divs.push(<div key='close_bar' className='close_bar'><CloseBar /></div>);
                        divs.push(<div key='title_empty_bar' className='title_empty_bar dray'></div>);
                        divs.push(<div key='title_right_bar' className='title_right_bar'><TitleRightBar /></div>);
                    }
                    return divs;
                })()
            }




        </div>
    );
}