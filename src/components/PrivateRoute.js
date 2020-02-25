import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

function PrivateRoute(props) {
  const { CustomerStore, ...restProps } = props;

  if (!CustomerStore.currentCustomer) {
    return <Redirect to="/" />;
  };

  if (!CustomerStore.currentCustomer.roles) {
    return <Redirect to="/validate" />;
  };

  if (!CustomerStore.currentCustomer.roles.includes("ROLE_USER_CONFIRMED")) {
    return <Redirect to="/" />;
  };

  return <Route {...restProps} />
}

export default inject('CustomerStore')(observer(PrivateRoute));
