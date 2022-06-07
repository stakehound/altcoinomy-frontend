import React from 'react';
import { inject, observer } from 'mobx-react';
import { Link, useHistory } from 'react-router-dom';
import { Container, Jumbotron, Col, Row } from 'reactstrap';
import { Redirect } from 'react-router';

function Home(props) {
  return (
    <Jumbotron>
      <Container className="home-container">
        <Row>
          <Col xs="12" md={{ size: 8, offset: 2 }}>
            <h1>Welcome to {props.CommonStore.appName}</h1>
            <p>


            </p>
            <p>
              <strong>
              StakeHound delegates to Altcoinomy the KYC and AML process.
              Altcoinomy SA (CHE-209.239.695) is bound by Swiss laws on banking secrecy, and will never distribute confidential information about you.
              </strong>
            </p>
            <p>
              All data is encrypted and stored offline.
            </p>
            <p>
            <Link class="btn btn-primary" to="/register">Start</Link>
            </p>
          </Col>
        </Row>
      </Container>
    </Jumbotron>
  );
}

export default inject('CommonStore')(observer(Home));
