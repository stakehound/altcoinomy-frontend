import React, { useEffect } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Container, Col, Row, Spinner } from 'reactstrap';
import Header from './Header'
import PrivateRoute from './PrivateRoute'
import Register from '../pages/Register';
import Validate from '../pages/Validate';
import ValidateResend from '../pages/ValidateResend';
import Login from '../pages/Login';
import Home from '../pages/Home';
import Subscription from '../pages/Subscription';

function App(props) {
  const { CommonStore, CustomerStore } = props;
  const history = useHistory();

  useEffect(() => {
    document.title = CommonStore.appName;

    if (CommonStore.token) {
      CustomerStore.loadCustomer()
        .catch(err => {
          if (err && err.response && err.response.status === 403) {
            history.replace('/validate')
          }
        })
        .finally(() => CommonStore.setAppLoaded());
    } else {
      CommonStore.setAppLoaded();
    }
  }, [CommonStore, CustomerStore, history]);

  if (CommonStore.appLoaded) {
    return (
      <>
        <Header />
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/validate" component={Validate} exact />
          <Route path="/validate/resend" component={ValidateResend} />
          <PrivateRoute path="/subscription" component={Subscription} />
          <Route path="/" component={Home} />
        </Switch>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container>
        <Row>
          <Col className="text-center">
            <Spinner color="secondary " className="m-5 p-5" />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default inject('CommonStore', 'CustomerStore')(observer(App));
