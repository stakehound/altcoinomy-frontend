import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Container, Col, Row } from 'reactstrap';
import NewWrapper from '../../components/Subscription/NewWrapper';

function SubscriptionNew(props) {
  const { IcoStore, SubscriptionStore } = props;
  const history = useHistory();

  useEffect(() => {
    IcoStore.loadIcos();
  }, [IcoStore]);

  function participate(icoId, registerAs) {
    SubscriptionStore.createSubscription(icoId, registerAs)
      .then(subscription => {
        history.replace(`/subscription/${subscription.id}`);
      })
      ;
  }

  return (
    <Container className="new-subscription-container">
      <Row>
        <Col>
          <Row className="justify-content-md-between align-items-md-center mb-3">
            <Col xs="12" md={{size: 'auto'}}>
              <h1>Staked Tokens</h1>
            </Col>
            <Col xs="12" md={{ size: 'auto' }}>
              <Link to="/subscription" className="btn btn-secondary w-100">Cancel</Link>
            </Col>
          </Row>

          <NewWrapper
            icos={IcoStore.icos}
            loadingIco={IcoStore.loading}
            loadingSubscription={SubscriptionStore.loading}
            participate={participate}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default inject('IcoStore', 'SubscriptionStore')(observer(SubscriptionNew));
