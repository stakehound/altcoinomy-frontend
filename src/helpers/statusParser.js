import React, { Component }  from 'react';

export default function (statusRaw) {
    let status = '';

    switch (statusRaw) {
      case "subscription_pending":
        status = <div className='badge badge-inf'>Subscription pending</div>;
        break;
      case "subscription_submitted":
        status =  <div className='badge badge-warning'>Waiting for review</div>;
        break;
      case "subscription_onboarded":
        status = <div className='badge badge-success'>Onboarded</div>;
        break;
      case "subscription_to_be_fixed":
        status = <div className='badge badge-inf'>Waiting your updates</div>;
        break;
      case "subscription_rejected":
        status = <div className='badge badge-danger'>KYC rejected</div>;
        break;
      case "subscription_to_report":
        status = <div className='badge badge-danger'>KYC rejected</div>;
        break;
      case "subscription_acknowledged":
        status = <div className='badge badge-success'>Subscription accepted</div>;
        break;
      case "subscription_auto_wait_worldcheck":
        status = <div className='badge badge-warning'>Verification pending</div>;
        break;
      default:
        status = statusRaw.replace("_", " ");
        break;
    }

    return status;
}
