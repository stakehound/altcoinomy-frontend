import React, { useState, useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import { Alert, Media, Spinner, Row, Col, Button, CustomInput, Input, FormGroup} from 'reactstrap';
import IcoLogo from '../IcoLogo';
import FormErrors from '../../components/FormErrors';
import statusParser from '../../helpers/statusParser'

function SubscriptionPaymentStatusWrapper(props) {
  const { id, SubscriptionStore } = props;
  const { loading, errors } = SubscriptionStore;
  const subscription = SubscriptionStore.getSubscription(id);

  const [currencies, setCurrencies] = useState([]);
  const [successMessage, setSuccessMessage] = useState();
  
  useEffect(() => {
    SubscriptionStore.loadSubscription(id, { acceptCached: false });
  }, [SubscriptionStore, id]);

  useEffect(() => {
    let currenciesData = [];

    if (subscription && subscription.ico_subscribed[0].investment.fiat && subscription.ico_subscribed[0].investment.fiat.currency) {
      currenciesData.push({
        currency: subscription.ico_subscribed[0].investment.fiat.currency,
        payment_label: subscription.ico_subscribed[0].investment.fiat.payment_label,
        payment_status: subscription.ico_subscribed[0].investment.fiat.payment
      });
    }


    if (subscription && subscription.ico_subscribed[0].investment.cryptos) {
      currenciesData = currenciesData.concat(subscription.ico_subscribed[0].investment.cryptos.map(crypto => {
        return {
          currency: crypto.currency.value,
          payment_label: crypto.payment_label,
          payment_status: crypto.payment
        };
      }));
    }

    setCurrencies(currenciesData);
  }, [subscription]);

  function updateFormData(currency, field, value) {
    setCurrencies(prevState => prevState.map(currencyData => {
      if (currencyData.currency !== currency) {
        return currencyData;
      }

      return {
        currency: currencyData.currency,
        payment_label: field === 'label' ? value : currencyData.payment_label,
        payment_status: field === 'status' ? value : currencyData.payment_status
      }
    }));
  }

  function getFiatCurrency() {
    if (!subscription || !subscription.ico_subscribed[0].investment.fiat || !subscription.ico_subscribed[0].investment.fiat.currency) {
      return false;
    }

    return subscription.ico_subscribed[0].investment.fiat.currency;
  }

  function getCurrencyData(currency) {
    return currencies.filter(currencyData => currencyData.currency === currency)[0];
  }

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

  if (!currencies.length) {
    return (
      <Alert color="danger">
        No investment specified!
      </Alert>
    );
  }

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
          <div className="badge badge-info">
            {statusParser(subscription.status)}
          </div>
        </Col>
      </Row>

      <FormErrors errors={errors} />
      {successMessage && <Alert color="success">{successMessage}</Alert>}

      {
        getFiatCurrency()
        &&
        <Row className="mb-4">
          <Col xs="12">
            <h3 className="font-weight-light">Account details to transfer your funds in <span className="font-weight-bold">{getCurrencyData(getFiatCurrency()).currency}</span></h3>
            <FormGroup>
              <CustomInput inline type="radio" name={`payment_status_${getCurrencyData(getFiatCurrency()).currency}`} label="Not paid yet" id={`payment_status_${getCurrencyData(getFiatCurrency()).currency}_to_be_checked`} value="status.to_be_checked" checked={getCurrencyData(getFiatCurrency()).payment_status === 'status.to_be_checked'} onChange={ev => {updateFormData(getCurrencyData(getFiatCurrency()).currency, 'status', ev.target.value)}} />
              <CustomInput inline type="radio" name={`payment_status_${getCurrencyData(getFiatCurrency()).currency}`} label="Notify that I made the payment" id={`payment_status_${getCurrencyData(getFiatCurrency()).currency}_announced`} value="status.announced" checked={getCurrencyData(getFiatCurrency()).payment_status === 'status.announced'} onChange={ev => {updateFormData(getCurrencyData(getFiatCurrency()).currency, 'status', ev.target.value)}} />
            </FormGroup>
            <FormGroup>
              <Input
                type="text"
                name={`payment_label_${getCurrencyData(getFiatCurrency()).currency}`}
                label={`Reference used for the transfer (please update this field only if you did not use ${getCurrencyData(getFiatCurrency()).payment_label})`}
                id={`payment_label_${getCurrencyData(getFiatCurrency()).currency}`}
                value={getCurrencyData(getFiatCurrency()).payment_label ?? ''}
                onChange={ev => {updateFormData(getCurrencyData(getFiatCurrency()).currency, 'label', ev.target.value)}}
              />
            </FormGroup>
          </Col>
        </Row>
      }

      {
        subscription.ico_subscribed[0].investment.cryptos.map(crypto =>
          <Row key={crypto.currency.value} className="mb-4">
            <Col xs="12">
              <h3 className="font-weight-light">Account details to transfer your funds in <span className="font-weight-bold">{getCurrencyData(crypto.currency.value).currency}</span></h3>
              <FormGroup>
                <CustomInput inline type="radio" name={`payment_status_${getCurrencyData(crypto.currency.value).currency}`} label="Not paid yet" id={`payment_status_${getCurrencyData(crypto.currency.value).currency}_to_be_checked`} value="status.to_be_checked" checked={getCurrencyData(crypto.currency.value).payment_status === 'status.to_be_checked'} onChange={ev => {updateFormData(getCurrencyData(crypto.currency.value).currency, 'status', ev.target.value)}} />
                <CustomInput inline type="radio" name={`payment_status_${getCurrencyData(crypto.currency.value).currency}`} label="Notify that I made the payment" id={`payment_status_${getCurrencyData(crypto.currency.value).currency}_announced`} value="status.announced" checked={getCurrencyData(crypto.currency.value).payment_status === 'status.announced'} onChange={ev => {updateFormData(getCurrencyData(crypto.currency.value).currency, 'status', ev.target.value)}} />
              </FormGroup>
              <FormGroup>
                <Input
                  type="text"
                  name={`payment_label_${getCurrencyData(crypto.currency.value).currency}`}
                  label={`Reference used for the transfer (please update this field only if you did not use ${getCurrencyData(crypto.currency.value).payment_label})`}
                  id={`payment_label_${getCurrencyData(crypto.currency.value).currency}`}
                  value={getCurrencyData(crypto.currency.value).payment_label ?? ''}
                  onChange={ev => {updateFormData(getCurrencyData(crypto.currency.value).currency, 'label', ev.target.value)}}
                />
              </FormGroup>
            </Col>
          </Row>
        )
      }

      <Button color="primary"
        onClick={() => {
          setSuccessMessage(null);
          SubscriptionStore.setGlobalErrors(null);

          SubscriptionStore.patchPaymentStatus(subscription.id, currencies)
          .then(res => {
            if (res) {
              setSuccessMessage("Thanks for your submission. Your payment status has been updated.");
              SubscriptionStore.loadSubscription(id, { acceptCached: false });
            }
          })
        }}
      >
        Confirm payment status
      </Button>
    </>
  );
}

export default inject('SubscriptionStore')(observer(SubscriptionPaymentStatusWrapper));
