import React, { useEffect } from 'react';
import { useRouteMatch, Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Container, Col, Row } from 'reactstrap';
import ListWrapper from '../../components/Subscription/ListWrapper';

function SubscriptionList(props) {
  const { url } = useRouteMatch();
  const { SubscriptionStore } = props;
  const { subscriptions, loading } = SubscriptionStore;

  useEffect(() => {
    SubscriptionStore.loadSubscriptions();
  }, [SubscriptionStore]);

  return (
    <Container className="subscriptions-container">
      <Row>
        <Col>
          <Row className="justify-content-md-between align-items-md-center mb-3">
            <Col xs="12" md={{size: 'auto'}}>
              <h1>My participations</h1>
            </Col>
            
          </Row>

          <ListWrapper
            subscriptions={subscriptions}
            loading={loading}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default inject('SubscriptionStore')(observer(SubscriptionList));
