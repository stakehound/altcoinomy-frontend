import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Container, Col, Row, Button, Spinner, Form, FormGroup, Input } from 'reactstrap';
import FormErrors from '../components/FormErrors';
import FieldErrors from '../components/FieldErrors';

function Validate(props) {
  const { AccountStore } = props;
  const { values, errors, loading } = AccountStore;
  const history = useHistory();

  useEffect(() => {
    return () => {AccountStore.reset();}
  }, [AccountStore]);

  function handleCodeChange(e) {AccountStore.setCode(e.target.value);}
  function handleSubmitForm(e) {
    e.preventDefault();

    AccountStore.validate()
      .then(() => history.replace('/'))
      .catch(err => {
        if (err && err.response && err.response.status === 401) {
          history.replace('/')
        }
      })
    ;
  };

  return (
    <Container>
      <Row>
        <Col xs="12" md={{size: 6, offset: 3}}>
          <h1>Validate account</h1>
          <div class="alert alert-success" role="alert">
              The code has been sent to your email by Altcoinomy.
          </div>
          <p>
            <Link to="/validate/resend">Resend validation code?</Link>
          </p>


          <FormErrors errors={errors} />

          <Form onSubmit={handleSubmitForm}>
            <FormGroup>
              <Input
                type="text" placeholder="Code" bsSize="lg" value={values.code} onChange={handleCodeChange}
                className={errors && errors.fields && errors.fields.code && 'is-invalid'}
              ></Input>
              <FieldErrors errors={errors} field="code" />
            </FormGroup>

            <Button color="primary" size="lg" disabled={loading} className="d-flex align-items-center">
              {loading && <Spinner size="sm" className="mr-2" />}
              Validate
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default inject('AccountStore')(observer(Validate));
