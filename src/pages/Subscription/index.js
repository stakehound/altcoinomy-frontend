import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import SubscriptionList from './List';
import SubscriptionNew from './New';
import SubscriptionEdit from './Edit';

function Subscription(props) {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path} component={SubscriptionList} />
      <Route path={`${path}/new`} component={SubscriptionNew} />
      <Route path={`${path}/:id`} component={SubscriptionEdit} />
    </Switch>
  );
}

export default Subscription;

