import React from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Spinner } from 'reactstrap';
import CollapsibleCard from '../CollapsibleCard';
import { toJS } from 'mobx';

function Step1bProofOfLiveness(props) {
  const groupName = 'pol';
  const fieldName = 'pol';
  const { PolStore, SubscriptionStore, fillStatus, ...otherProps } = props;
  const { loadingPol, polError } = PolStore;
  const { loading: loadingSubscriptions } = SubscriptionStore;

  const { header, fields } = fillStatus.groups[groupName];
  const pol = fields[fieldName];

  const polStatus = toJS(fields.pol.status)

  // Run the checkin iframe to start the proof of liveness
  const startPol = () => {
    if (window.checkin) {
      window.checkin.settings.setLang("en");
      const flow = toJS(fillStatus.groups.basics.fields.subscribed_as.value) === "individual" ? "alt-full" : "alt-doc-check";
      window.checkin.settings.setCustomData({ OCRFlow: flow });
      window.checkin.dataFlow.setOnComplete((data) => {
        checkinDataReceived(data);
      });
      window.checkin.signUp.open();
    }
  }

  // Received some data from checkin
  const checkinDataReceived = (received) => {
    const { data } = received;
    const ocrData = data.ocrData.data.attributes;

    PolStore.savePol(data.ocrData.id, ocrData, toJS(fillStatus.subscription_id)).then(result => {
      if (!result) {
        return;
      }

      if (!result.err_code) {
        SubscriptionStore.setModified(groupName, fieldName, result.checkin.id);
        SubscriptionStore.patchSubscription(groupName);
      }
    }).catch((err) => {
    });
  }

  // Display loader if pol is validating
  if (loadingPol || loadingSubscriptions) {
    return (
      <Spinner color="secondary" />
    );
  }

  // Display the form
  return (
    <CollapsibleCard
      active={header.active}
      name={groupName}
      header="Proof of liveness"
      fields={header.active ? { pol } : null}
      considerAsForm
      {...otherProps}
    >
      <p>We use an automated identity checking process.</p>
      <p>The self onboarding requires you to undergo proof of liveness process.</p>
      <p>Uploading an ID document containing an MRZ (passport or ID card)
        ensures the fastest on boarding. Any other documents will require our KYC
        officers to look into your application on a case by case, and might be refused.
      </p>
      <p>Do not worry if this one fails, a compliance officer will get back to you to resolve it.</p>

      {polError &&
        <div className='alert alert-danger'>{polError}</div>
      }

      {polStatus === "REFUSED" &&
        <div className='alert alert-danger'>Sorry, your proof of lveness did not pass. Please do it again.</div>
      }
      {polStatus === "ACCEPTED" &&
        <div className='alert alert-success'>You completed your proof of liveness.</div>
      }
      {polStatus === "FILLED" &&
        <div className='alert alert-info'>Your proof of liveness is being checked.</div>
      }

      <Button color="primary" onClick={() => startPol()}>
        {(polStatus === "REFUSED" || polError) && "Retry my proof of liveness"}
        {(polStatus === "FILLED" || polStatus === "ACCEPTED") && !polError && "Update my proof of liveness"}
        {polStatus === "EMPTY" && !polError && "Start the proof of liveness"}
      </Button>
    </CollapsibleCard>
  );
}

export default inject('SubscriptionStore', 'PolStore')(observer(Step1bProofOfLiveness));
