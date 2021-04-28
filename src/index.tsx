import React, { useContext } from 'react';
import * as ReactDOM from "react-dom";

import { AuthStore } from 'stores/AuthStore';
import { LoginView } from 'views/login/LoginView'

import 'antd/dist/antd.css';
import 'style/common.css';
import 'style/antd.css';


import { HashRouter, Route } from "react-router-dom";
import { IntlProvider } from 'react-intl';
import { InstanceFactory } from "components/ioc/InstanceFactory";
import { observer } from "mobx-react-lite";
import I18Store from "stores/I18Store";

//初始化IOC容器
InstanceFactory.initIOC();

const Index = () => {
  const isLogin = AuthStore.getInstance().isTokenExists();
  if (isLogin) {
    return <div></div>
  } else {
    return <LoginView></LoginView>
  }
};

const App = observer((props?: any) => {

  const i18nStore = useContext(I18Store);

  return (
    <IntlProvider locale={i18nStore.locale} messages={i18nStore.language}>
      <HashRouter >
        <div className='full_div'>
          <Route path="/" exact component={Index} />
          <Route path="/login" component={LoginView} />
        </div>
      </HashRouter>
    </IntlProvider>
  );
});

ReactDOM.render(
  <App />,
  document.getElementById("app")
);