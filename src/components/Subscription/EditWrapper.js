import React, { useState } from 'react';
import { observer, inject } from 'mobx-react';
import { Alert, Media, Spinner, Row, Col, Button } from 'reactstrap';
import IcoLogo from '../IcoLogo';
import Step1RegisterAs from '../Step/Step1RegisterAs';
import Step2Individual from '../Step/Step2Individual';
import Step2Company from '../Step/Step2Company';
import Step2Annex1 from '../Step/Step2Annex1';
import Step2Annex2 from '../Step/Step2Annex2';
import Step2ExtraDocument from '../Step/Step2ExtraDocument';
import Step3Contribution from '../Step/Step3Contribution';
import Step4Crypto from '../Step/Step4Crypto';
import Step4Fiat from '../Step/Step4Fiat';
import Step5TokenDeliveryAddress from '../Step/Step5TokenDeliveryAddress';
import Step6VideoConference from '../Step/Step6VideoConference';
import GlobalErrors from '../GlobalErrors';
import moment from 'moment';
import CustomInput from 'reactstrap/lib/CustomInput';

function SubscriptionEditWrapper(props) {
  const { subscription, fillStatus, loading, SubscriptionStore, finalizing } = props;
  const [stepOpen, setStepOpen] = useState();
  const [shown, setShown] = useState();
  const [globalErrors, setGlobalErrors] = useState();
  const [successMessage, setSuccessMessage] = useState();

  const stepComponents = [
    Step1RegisterAs,
    Step2Individual,
    Step2Company,
    Step2Annex1,
    Step2Annex2,
    Step2ExtraDocument,
    Step3Contribution,
    Step4Crypto,
    Step4Fiat,
    Step5TokenDeliveryAddress,
    Step6VideoConference,
  ];

  if (loading) {
    return (
      <Spinner color="secondary" />
    );
  }

  if (!subscription) {
    return (
      <Alert color="danger">
        Can't load subscription!
      </Alert>
    );
  }

  if (!fillStatus) {
    return (
      <Alert color="danger">
        Can't load current subscription state!
      </Alert>
    );
  }


  let subscriptionStatus = "";
  switch (fillStatus.status) {
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

  const terms = SubscriptionStore.getTerms();


  return (
    <>
      <Media className="mb-3">
        <Media left top className="align-self-start mr-3">
          <IcoLogo icoId={subscription.ico_subscribed[0].ico.id} />
        </Media>
        <Media body>
          <Media heading tag="h3">
            {subscription.ico_subscribed[0].ico.name}
          </Media>
          {subscription.ico_subscribed[0].ico.description}
        </Media>
      </Media>

      <Row className="justify-content-md-between align-items-md-center">
        <Col xs="12" className="mb-12 mb-md-3 text-right">
          <strong>Status of your subscription: </strong>
          {subscriptionStatus}
        </Col>
      </Row>

      {
        fillStatus.video_conference_date &&
        <Row className="justify-content-md-between align-items-md-center">
          <Col xs="12" className="mb-12 mb-md-3 text-right">
            <strong>Video conference date: </strong>
            <div className="badge badge-info">
              {
                moment(fillStatus.video_conference_date).format('DD/MM/YYYY HH:mm')
              }
            </div>
          </Col>
        </Row>
      }

      {stepComponents.map((Component, index) =>
        <Component key={index}
          subscription={subscription}
          fillStatus={fillStatus}
          stepOpen={stepOpen}
          setStepOpen={setStepOpen}
          shown={shown}
          setShown={setShown}
          ico={subscription.ico_subscribed[0].ico}
        />)
      }

      <GlobalErrors errors={globalErrors}></GlobalErrors>
      {successMessage && <Alert color="success">{successMessage}</Alert>}


      <Row className="justify-content-md-between align-items-md-center">
        <Col xs="12" md={{ size: 'auto' }} className="mb-3 mb-md-4">
          <CustomInput type="checkbox" id={'terms'}
            required={true}
            label="I have read the terms and conditions"
            checked={terms}
            onChange={(ev) => {
              SubscriptionStore.setTerms(ev.target.checked);
            }}
            invalid={false}
          >
            <span className="required"></span>
          </CustomInput>
          <Button
            className={`w-100 ${finalizing ? "loading" : ''}`}
            color="primary"
            disabled={finalizing}
            onClick={() => {
              setSuccessMessage(null);
              setGlobalErrors(null);
              SubscriptionStore.finalize(subscription.id, terms)
                .then(res => {
                  SubscriptionStore.setFillStatus(res);
                  setSuccessMessage("Thanks for your submission. You will be updated soon.");
                })
                .catch(err => {
                  setGlobalErrors(err.response ? err.response.body : "Unknown error occurred. Please try again or contact us.")
                });
            }}
          >
            {finalizing ? 'Submission in progress...' : 'Finalize my KYC'}
          </Button>
        </Col>
      </Row>
    </>
  );
}

export default inject('SubscriptionStore')(observer(SubscriptionEditWrapper));
