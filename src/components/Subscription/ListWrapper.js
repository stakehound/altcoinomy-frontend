import React from 'react';
import { Link } from 'react-router-dom';
import { Alert, Spinner, Table } from 'reactstrap';
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
            let subscriptionStatus = "";
            switch (subscription.status) {
              case "subscription_pending":
                subscriptionStatus = <div className='badge badge-info'>Subscription pending</div>;
                break;
              case "subscription_submitted":
                subscriptionStatus =  <div className='badge badge-warning'>Waiting for review</div>;
                break;
              case "subscription_onboarded":
                subscriptionStatus = <div className='badge badge-success'>Onboarded</div>;
                break;
              case "subscription_to_be_fixed":
                subscriptionStatus = <div className='badge badge-info'>Waiting your updates</div>;
                break;
              case "subscription_rejected":
                subscriptionStatus = <div className='badge badge-danger'>KYC rejected</div>;
                break;
              case "subscription_to_report":
                subscriptionStatus = <div className='badge badge-danger'>KYC rejected</div>;
                break;
              case "subscription_acknowledged":
                subscriptionStatus = <div className='badge badge-success'>Subscription accepted</div>;
                break;
              case "subscription_auto_wait_worldcheck":
                subscriptionStatus = <div className='badge badge-warning'>Verification pending</div>;
                break;
              default:
                subscriptionStatus = subscription.status.replace("_", " ");
                break;
            }

            return (
              <tr key={subscription.id}>
                <td>{subscription.ico_subscribed[0].ico.name}</td>
                <td>{moment(subscription.date_of_subscription).format('L')}</td>
                <td>{subscriptionStatus}</td>
                <td className="text-right">
                  <Link to={`subscription/${subscription.id}`} className="btn btn-primary">Edit</Link>
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
