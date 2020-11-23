import React, { useState } from 'react';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Trash2 as IconRemove } from 'react-feather';
import { FormGroup, Button, InputGroup, InputGroupAddon, InputGroupText, Label, Input, Spinner, Col, Row } from 'reactstrap';
import FieldErrors from './FieldErrors';
import TiersSelect from './TiersSelect';
import CurrencySelect from './CurrencySelect';

function ContributionForm(props) {
  const { SubscriptionStore, ContributionStore, groupName, fieldName, subscriptionId, contribution, fieldData, ico } = props;
  const { loading, data, errors } = ContributionStore;
  const formId = groupName + '_' + fieldName;
  const [modifying, setModifying] = useState(fieldData.status === 'EMPTY');
  const [pdf, setPdf] = useState(null);

  async function b64toBlob(base64, type = 'application/octet-stream') {
    const res = await fetch(`data:${type};base64,${base64}`);
    return await res.blob();
  }

  if (loading) {
    return (
      <Spinner color="secondary" />
    );
  }

  if (!modifying) {
    return (
      <>
        <FormGroup>
          <InputGroup className="crypted">
            <InputGroupAddon addonType="prepend">
              <InputGroupText
                className={`status-${contribution.status}`}
                onClick={() => {
                  setModifying(true);
                }}
              >
                {contribution.status} (click to change)
              </InputGroupText>
            </InputGroupAddon>

            {
              pdf &&
              <>
                <InputGroupAddon addonType="append">
                  <InputGroupText>
                    <a href={pdf.href} download={pdf.name}>Download</a>
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupAddon addonType="append">
                  <InputGroupText>
                    <a href={pdf.href} rel="noopener noreferrer" target="_blank">Open</a>
                  </InputGroupText>
                </InputGroupAddon>
              </>
            }
          </InputGroup>
        </FormGroup>

        {/* <Button
          color="primary"
          onClick={() => { SubscriptionStore.patchSubscription(groupName); }}
          disabled={!SubscriptionStore.isStepModified(groupName, fieldName)}
        >
          {
            SubscriptionStore.isStepModified(groupName, fieldName)
              ? 'Submit'
              : 'No changes'
          }
        </Button> */}
      </>
    );
  }

  const getTiersList = (ico) => {
    let tiersList = [];
    let currencies = {};
    ico.tiers_configuration.forEach((tier, id) => {
      if (!tier.hidden) {
        tiersList[`tier${id + 1}`] = {
          id,
          name: `tier${id + 1}`,
          amounts: toJS(tier.amounts),
          currencies: {
            fiat: toJS(ico.investment_potential[id].currencies_fiat),
            crypto: toJS(ico.investment_potential[id].currencies_crypto),
          }
        };
      }
      ico.investment_potential[id].currencies_fiat.forEach(el => {
        currencies[el.currency.code] = el.currency;
      });
      ico.investment_potential[id].currencies_crypto.forEach(el => {
        currencies[el.currency.code] = el.currency;
      });
    });
    return {
      tiersList,
      currencies
    };
  }

  const { tiersList, currencies } = getTiersList(ico);

  const isCrypto = (currencyCode) => {
    if (!currencies[currencyCode]) {
      return true;
    } else {
      return toJS(currencies[currencyCode].type) === 'TYPE_CRYPTO';
    }
  }

  return (
    <>
      <FormGroup>
        <Label className="required" for={formId + 'tier'}>Tiers</Label>
        <TiersSelect
          id={formId + 'tier'}
          value={data['tier']}
          tiers={tiersList}
          invalid={ContributionStore.hasError('tier')}
          onChange={ev => {
            ContributionStore.setData('tier', ev.target.value);
            ContributionStore.getContributionEstimation(subscriptionId);
          }}
        />
        <FieldErrors errors={errors} field="tier" />
      </FormGroup>

      {ContributionStore.getData("currencies").map((currency, index) => {
        return <Row key={currency.id} className="justify-content-md-between align-items-md-center">
          <Col xs="4" className="mb-4 mb-md-0">
            <FormGroup>
              <Label className="required" for={formId + '_amount'}>Amount</Label>
              <Input type="text" id={formId + '_amount'}
                required
                value={currency.amount}
                invalid={ContributionStore.hasError(['currencies', index, 'amount'])}
                onChange={ev => {
                  ContributionStore.setInvestment(currency, 'amount', ev.target.value);
                  ContributionStore.getContributionEstimation(subscriptionId);
                }}
              />
              <FieldErrors errors={errors} field={['currencies', index, 'amount']} />
            </FormGroup>
          </Col>
          <Col xs="2" className="mb-4 mb-md-0">
            <FormGroup>
              <Label className="required" for={formId + '_currency_code'}>Currency</Label>
              <CurrencySelect
                id={formId + 'currency_code'}
                value={currency.currency_code}
                fiat={data['tier'] ? tiersList[data['tier']].currencies.fiat : []}
                crypto={data['tier'] ? tiersList[data['tier']].currencies.crypto : []}
                invalid={ContributionStore.hasError(['currencies', index, 'currency_code'])}
                onChange={ev => {
                  ContributionStore.setInvestment(currency, 'currency_code', ev.target.value);
                  ContributionStore.getContributionEstimation(subscriptionId);
                }}
              />
              <FieldErrors errors={errors} field={['currencies', index, 'currency_code']} />
            </FormGroup>
          </Col>
          <Col xs="5" className="mb-4 mb-md-0">
            {isCrypto(toJS(ContributionStore.getData('currencies')[index].currency_code)) && <FormGroup>
              <Label className="required" for={formId + '_address'}>Address</Label>
              <Input type="text" id={formId + '_address'}
                required
                value={currency.address}
                invalid={ContributionStore.hasError(['currencies', index, 'address'])}
                onChange={ev => {
                  ContributionStore.setInvestment(currency, 'address', ev.target.value);
                }}
              />
              <FieldErrors errors={errors} field={['currencies', index, 'address']} />
            </FormGroup>}
          </Col>
          <Col xs="1" className="mb-4 mb-md-0">
            <Button
              className="w-100"
              color="danger"
              onClick={() => {
                ContributionStore.removeInvestment(currency);
              }}
            >
              <IconRemove></IconRemove>
            </Button>
          </Col>
        </Row>
      })}

      <Row className="justify-content-md-between align-items-md-center">
        <Col xs="12" md={{ size: 'auto' }} className="mb-3">
          <Button
            className="w-100"
            color="primary"
            onClick={() => {
              ContributionStore.addInvestment();
            }}
          >
            Add
          </Button>
        </Col>
      </Row>

      <Row className="justify-content-md-between align-items-md-center">
        <Col xs="12" md={{ size: 'auto' }} className="mb-3">
          <strong>CHF equivalent :</strong> {ContributionStore.getTotalChf()}
        </Col>
      </Row>

      {ContributionStore.getFormErrors().map((err, index) => {
        return <div className="error" key={index}>{err}</div>
      })}

      <Row className="justify-content-md-between align-items-md-center">
        <Col xs="12" md={{ size: 'auto' }} className="mb-3 mb-md-0">
          <Button
            className="w-100"
            color="primary"
            onClick={() => {
              ContributionStore.postContribution(subscriptionId)
                .then(res => {
                  b64toBlob(res.clear_binary_content, 'application/pdf')
                    .then(blob => {
                      setPdf({
                        name: res.original_filename,
                        href: URL.createObjectURL(blob)
                      });
                    })
                    ;

                  SubscriptionStore.setModified(groupName, fieldName, res.id);
                  setModifying(false);
                })
                .catch(err => { })
                ;
            }}
          >
            Submit
          </Button>
        </Col>
        <Col xs="12" md={{ size: 'auto' }}>
          <Button
            className="w-100"
            color="secondary"
            onClick={() => { setModifying(false); }}
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </>
  );

}

export default inject('SubscriptionStore', 'ContributionStore')(observer(ContributionForm));
