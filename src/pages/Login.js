import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Container, Col, Row, Button, Spinner, Form, FormGroup, Input } from 'reactstrap';
import FormErrors from '../components/FormErrors';

function Login(props) {
  const { AccountStore } = props;
  const { values, errors, loading } = AccountStore;
  const history = useHistory();

  useEffect(() => {
    return () => {AccountStore.reset();}
  }, [AccountStore]);

  function handleUsernameChange(e) {AccountStore.setUsername(e.target.value);}
  function handlePasswordChange(e) {AccountStore.setPassword(e.target.value);}
  function handleSubmitForm(e) {
    e.preventDefault();

    AccountStore.login()
      .then(() => history.replace('/subscription'))
      .catch(err => {
        if (err && err.response && err.response.status === 403) {
          history.replace('/validate')
        }
      })
    ;
  };

  return (
    <Container>
      <Row>
        <Col xs="12" md={{size: 6, offset: 3}}>
          <h1>Sign In</h1>
          <p>
            <Link to="/register">Need an account?</Link>
          </p>

          <FormErrors errors={errors} />

          <Form onSubmit={handleSubmitForm}>
            <FormGroup>
              <Input type="text" placeholder="Email or Username" bsSize="lg" value={values.username} onChange={handleUsernameChange}></Input>
            </FormGroup>
            <FormGroup>
              <Input type="password" placeholder="Password" bsSize="lg" value={values.password} onChange={handlePasswordChange}></Input>
            </FormGroup>

            <Button color="primary" size="lg" disabled={loading} className="d-flex align-items-center">
              {loading && <Spinner size="sm" className="mr-2" />}
              Sign In
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default inject('AccountStore')(observer(Login));
