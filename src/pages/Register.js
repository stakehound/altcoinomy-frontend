import React, { useEffect} from 'react';
import { Link, useHistory } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Container, Col, Row, Button, Spinner, Form, FormGroup, Input } from 'reactstrap';
import FormErrors from '../components/FormErrors';
import FieldErrors from '../components/FieldErrors';

function Register(props) {
  const { AccountStore } = props;
  const { values, errors, loading } = AccountStore;
  const history = useHistory();

  useEffect(() => {
    return () => {AccountStore.reset();}
  }, [AccountStore]);

  function handleUsernameChange(e) {AccountStore.setUsername(e.target.value);}
  function handleEmailChange(e) {AccountStore.setEmail(e.target.value);}
  function handlePasswordChange(e) {AccountStore.setPassword(e.target.value);}
  function handleSubmitForm(e) {
    e.preventDefault();

    AccountStore.register()
      .then(() => history.replace('/validate'))
      .catch(err => {})
    ;
  }

  return (
    <Container>
      <Row>
        <Col xs="12" md={{size: 6, offset: 3}}>
          <h1>Start KYC process</h1>
          <p>
            <Link to="/login">Have an Altcoinomy account?</Link>
          </p>

          <FormErrors errors={errors} />

          <Form onSubmit={handleSubmitForm}>

            <FormGroup>
              <Input
                type="email" placeholder="Email" bsSize="lg" value={values.username = values.email} onChange={handleEmailChange}
                className={errors && errors.fields && errors.fields.email && 'is-invalid'}
              ></Input>
              <FieldErrors errors={errors} field="email" />
            </FormGroup>

            <FormGroup>
              <Input
                type="password" placeholder="Password" bsSize="lg" value={values.password} onChange={handlePasswordChange}
                className={errors && errors.fields && errors.fields.plainPassword && 'is-invalid'}
              ></Input>
              <FieldErrors errors={errors} field="plainPassword" />
            </FormGroup>

            <FormGroup>
              <Input
                type="hidden" placeholder="Username" bsSize="lg" value={values.username} onChange={handleUsernameChange}
                className={errors && errors.fields && errors.fields.username && 'is-invalid'}
              ></Input>
            </FormGroup>

            <Button color="primary" size="lg" disabled={loading} className="d-flex align-items-center">
              {loading && <Spinner size="sm" className="mr-2" />}
              Start KYC
            </Button>
            <div class="alert alert-light " role="alert">
            <p>
              StakeHound delegates to Altcoinomy the KYC and AML process.
              Altcoinomy SA (CHE-209.239.695) is bound by Swiss laws on banking secrecy, and will never distribute confidential information about you.
            </p>
            <p>
              All data is encrypted and stored offline.
            </p>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default inject('AccountStore')(observer(Register));
