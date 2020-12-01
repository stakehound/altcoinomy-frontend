import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import SubscriptionList from './List';
import SubscriptionNew from './New';
import SubscriptionEdit from './Edit';
import SubscriptionPaymentStatus from './PaymentStatus';
import SubscriptionVideoConference from './VideoConference';
import SubscriptionVideoConferenceBooking from './VideoConferenceBooking';

function Subscription(props) {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path} component={SubscriptionList} />
      <Route path={`${path}/new`} component={SubscriptionNew} />
      <Route path={`${path}/payment-status/:id`} component={SubscriptionPaymentStatus} />
      <Route path={`${path}/video-conference/:id`} component={SubscriptionVideoConference} />
      <Route path={`${path}/video-conference-booking/:id`} component={SubscriptionVideoConferenceBooking} />
      <Route path={`${path}/:id`} component={SubscriptionEdit} />
    </Switch>
  );
}

export default Subscription;

