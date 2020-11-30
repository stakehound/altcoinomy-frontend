import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import SubscriptionList from './List';
import SubscriptionNew from './New';
import SubscriptionEdit from './Edit';
import SubscriptionPaymentStatus from './PaymentStatus';

function Subscription(props) {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path} component={SubscriptionList} />
      <Route path={`${path}/new`} component={SubscriptionNew} />
      <Route path={`${path}/payment-status/:id`} component={SubscriptionPaymentStatus} />
      <Route path={`${path}/:id`} component={SubscriptionEdit} />
    </Switch>
  );
}

export default Subscription;

