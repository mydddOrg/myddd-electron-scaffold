
import { useHistory } from "react-router-dom";
import styles from 'style/login/LoginView.module.less'

import { FormattedMessage } from 'react-intl';
import { Alert, Input, Checkbox, Spin } from 'antd';
import { ILoginApplication } from "modules/login/view/ILoginApplication";
import { useIntl } from 'react-intl';
import { InstanceFactory } from "components/ioc/InstanceFactory";
import { BaseResponse } from "components/http/IRequest";
import { RemoteUtil } from "components/util/RemoteUtil";
import { ModuleUtil } from "components/util/ModuleUtil";
import { Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { observer } from "mobx-react-lite";
import I18Store from "stores/I18Store";
import { KeyCode } from "components/util/KeyCode";
import React, { useContext, useEffect, useState } from 'react';
import { AuthStore } from "stores/AuthStore";

/**
 * 登录界面
 */
export const LoginView = observer(() => {


  const SHOW_ALERT: string = 'alert';
  const HIDDEN_ALERT: string = 'alert_hidden';

  const loginAppliction: ILoginApplication = InstanceFactory.getInstance(ILoginApplication);

  const intl = useIntl();

  const history = useHistory();

  const i18nStore = useContext(I18Store);

  const [username, setUsername] = useState(localStorage.getItem('login_username'));
  const [password, setPassword] = useState(localStorage.getItem('login_password'));
  const [alert, setAlert] = useState(HIDDEN_ALERT);
  const [loginError, setLogError] = useState(intl.formatMessage({ id: "login_error" }));

  const [isLoading, setLoading] = useState(false);

  const [enableDevelope, setEnableDevelope] = useState(false);


  useEffect(() => {
    show();
  }, []);

  /**
   * 显示主窗口，需要设置大小及其它行为
   */
  const show = () => {
    const remote = ModuleUtil.remote;
    remote.getCurrentWindow().setMinimumSize(280, 380);
    remote.getCurrentWindow().setSize(280, 380, false);
    remote.getCurrentWindow().center();
    remote.getCurrentWindow().show();
  };

  /**
   * 关闭登录界面功能
   */
  const exit = () => {
    const remote = ModuleUtil.remote;
    const win = remote.getCurrentWindow();
    win.close();
  }

  /**
   * 登录功能
   * @param e 
   */
  const login = (e: any) => {
    if (e.metaKey && e.keyCode == KeyCode.KeyCode_Q) {
      RemoteUtil.sendNoticeToMainProcess('QUITE_APP');
    }

    if (e.metaKey && e.keyCode == KeyCode.KeyCode_W) {
      RemoteUtil.sendNoticeToMainProcess('HIDDEN_APP');
    }

    if (e.nativeEvent.shiftKey && e.nativeEvent.keyCode == KeyCode.KeyCode_Enter) {
      setEnableDevelope(true);
      return;
    }
    if (e.nativeEvent.keyCode == KeyCode.KeyCode_Enter) {
      setLoading(true);
      loginAppliction.login(username, password).then((response: BaseResponse) => {
        setLoading(false);

        //MOCK 这只是模拟，用户名和密码相同则允许登录
        if (username == password) {
          setAlert(HIDDEN_ALERT);
          loginAppliction.initLoginUser().then((success: boolean) => {
            if (success) {
              history.push("/main");
              localStorage.setItem('login_username', AuthStore.getInstance().loginName);
              localStorage.setItem('login_password', password);

              RemoteUtil.sendNoticeToMainProcess('USE_LOGIN');

            } else {
              setLogError('error');
            }
          });
        } else {
          setLogError('用户名和密码一样');
          setAlert(SHOW_ALERT);
          //2秒后自动隐藏
          setTimeout(() => {
            setAlert(HIDDEN_ALERT);
          }, 2 * 1000);
        }
      });
    }
  }

  const handleMenuClick = (e: any) => {
    i18nStore.switchLanguage(e.key);
  }


  const handleDevMenuClick = (e: any) => {
    const key = e.key;
    if (key == 'openDevTool') {
      openDevTool();
    }
    else if (key == 'clearAllData') {
      clearUserData();
    }
  }

  const openDevTool = () => {
    RemoteUtil.sendNoticeToMainProcess('OPEN_DEV_TOOLS');
  }

  const clearUserData = () => {
    loginAppliction.resetAllData().then(success => {
    })
  }

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="zh_CN">
        简体中文
      </Menu.Item>
      <Menu.Item key="zh_TW">
        繁體中文
      </Menu.Item>
      <Menu.Item key="en_US">
        English
      </Menu.Item>
    </Menu>
  );


  const developeMenu = (
    <Menu onClick={handleDevMenuClick}>
      <Menu.Item key="openDevTool">
        开发工具
      </Menu.Item>
      <Menu.Item key="clearAllData">
        重置数据
      </Menu.Item>
    </Menu>
  );


  const keyDown = (e: any) => {
    if (e.metaKey && e.keyCode == KeyCode.KeyCode_Q) {
      RemoteUtil.sendNoticeToMainProcess('QUITE_APP');
    }

    if (e.metaKey && e.keyCode == KeyCode.KeyCode_W) {
      RemoteUtil.sendNoticeToMainProcess('HIDDEN_APP');
    }

    if (e.keyCode == KeyCode.KeyCode_Cancel) {
      setLoading(false);
    }
  }

  return (
    <div className={styles.login} onKeyPress={login} onKeyDown={keyDown} tabIndex={0}>
      {/* <div className={styles.alert}><Alert message={loginError} type="error" showIcon /></div> */}
      <div className={`${styles.bg} ${'drag'}`}></div>
      <div className={styles.input_username}><Input value={username} onChange={e => setUsername(e.target.value)} /></div>
      <div className={styles.input_password}><Input value={password} onChange={e => setPassword(e.target.value)} type='password' /></div>
      <div className={styles.remeber_passwd}><Checkbox checked={true}><FormattedMessage id="login_remember_password" /></Checkbox></div>
      {/* <div className="auto_login"><Checkbox><FormattedMessage id="login_auto_login" /></Checkbox></div> */}
      <div className={styles.login_tool}>
        <div className={styles.switch_language}>
          <Dropdown overlay={menu}>
            <Button>
              {i18nStore.getCurrentLanguage()} <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        {
          (() => {
            if (enableDevelope) {
              return (
                <div className={styles.developer_tool}>
                  <Dropdown overlay={developeMenu}>
                    <Button>
                      开发选项
                </Button>
                  </Dropdown>
                </div>
              )
            }
          })()
        }

      </div>

      <div className={`${styles.avatar} 'drag'`}></div>
      <div className={`${styles.close} 'no_dray'`} onClick={exit}></div>
    </div>
  );
});