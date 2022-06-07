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

  let display = {
    msg: {
      refused: "Sorry, your proof of liveness did not pass. Please do it again.",
      accepted: "You completed your proof of liveness.",
      filled: "Your proof of liveness is being checked."
    },
    btns: {
      retry: "Retry my proof of liveness",
      update: "Update my proof of liveness",
      start: "Start the proof of liveness"
    }
  }

  if (toJS(fillStatus.groups.basics.fields.subscribed_as.value) !== "individual") {
    display = {
      msg: {
        refused: "Sorry, your documents were not valid. Please do it again.",
        accepted: "Your id documents have been accepted.",
        filled: "Your id documents are being checked."
      },
      btns: {
        retry: "Send my documents again",
        update: "Update my id documents",
        start: "Securely send my id documents"
      }
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
      header={toJS(fillStatus.groups.basics.fields.subscribed_as.value) === "individual" ? "Proof of liveness" : "Signatory identification documents"}
      fields={header.active ? { pol } : null}
      considerAsForm
      {...otherProps}
    >
      {toJS(fillStatus.groups.basics.fields.subscribed_as.value) === "individual" ?
        <>
          <p>We use an automated identity checking process.</p>
          <p>The self onboarding requires you to undergo proof of liveness process.</p>
          <p>Uploading an ID document containing an MRZ (passport or ID card)
            ensures the fastest on boarding. Any other documents will require our KYC
            officers to look into your application on a case by case, and might be refused.
          </p>
          <p>Do not worry if this one fails, a compliance officer will get back to you to resolve it.</p>

        </> :
        <>
          <p>Please upload the identifications documents of the signatory.</p>
          <p>Uploading an ID document containing an MRZ (passport or ID card)
            ensures the fastest on boarding. Any other documents will require our KYC
            officers to look into your application on a case by case, and might be refused.
          </p>
          <p>Do not worry if this one fails, a compliance officer will get back to you to resolve it.</p>

        </>
      }

      {polError &&
        <div className='alert alert-danger'>{polError}</div>
      }

      {polStatus === "REFUSED" &&
        <div className='alert alert-danger'>{display.msg.refused}</div>
      }
      {polStatus === "ACCEPTED" &&
        <div className='alert alert-success'>{display.msg.accepted}</div>
      }
      {polStatus === "FILLED" &&
        <div className='alert alert-info'>{display.msg.filled}</div>
      }

      <Button color="primary" onClick={() => startPol()}>
        {(polStatus === "REFUSED" || polError) && display.btns.retry}
        {(polStatus === "FILLED" || polStatus === "ACCEPTED") && !polError && display.btns.update}
        {polStatus === "EMPTY" && !polError && display.btns.start}
      </Button>
    </CollapsibleCard>
  );
}

export default inject('SubscriptionStore', 'PolStore')(observer(Step1bProofOfLiveness));
