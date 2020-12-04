import React from 'react';
import { Link } from 'react-router-dom';
import { Alert, Spinner, Table, ButtonGroup } from 'reactstrap';
import statusParser from '../../helpers/statusParser'
import moment from 'moment';
import { Redirect } from 'react-router';


function SubscriptionListWrapper(props) {
  const { subscriptions, loading } = props;

  if (loading) {
    return (
      <Spinner color="secondary" />
    );
  }

  if (!subscriptions.length) {
    return (
      <Redirect to="/subscription/new" />
    );
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Project</th>
          <th>Date of subscription</th>
          <th>Status</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>

      <tbody>
        {
          subscriptions.map(subscription => {
            return (
              <tr key={subscription.id}>
                <td>{subscription.ico_subscribed[0].ico.name}</td>
                <td>{moment(subscription.date_of_subscription).format('L')}</td>
                <td>{statusParser(subscription.status)}</td>
                <td className="text-right">
                <ButtonGroup vertical size="sm">
                    <Link to={`/subscription/${subscription.id}`} className="btn btn-primary">Edit</Link>
                    {
                      subscription.status !== 'subscription_pending'
                      &&
                      <>
                        <Link to={`/subscription/video-conference/${subscription.id}`} className="btn btn-outline-primary mr-1">Join the call</Link>
                        <Link to={`/subscription/video-conference-booking/${subscription.id}`} className="btn btn-outline-primary mr-1">Reschedule the call</Link>
                        <Link to={`/subscription/payment-status/${subscription.id}`} className="btn btn-outline-primary mr-1">Payment status</Link>
                      </>
                    }
                  </ButtonGroup>
                </td>
              </tr>
            )
          })
        }
      </tbody>
    </Table>
  );
}

export default SubscriptionListWrapper;
