import React, { useState, useRef, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { FormGroup, Button, InputGroup, InputGroupAddon, InputGroupText, Label, Input, Spinner, Col, Row } from 'reactstrap';
import SignaturePad from 'react-signature-pad-wrapper';
import FieldErrors from './FieldErrors';
import DatePicker from './DatePicker';
import CountriesSelect from './CountriesSelect';
import { asyncSessionStorage } from '../helpers/sessionStorage';

function Annex1Form(props) {
  const { SubscriptionStore, Annex1Store, groupName, fieldName, subscriptionId, annex, fieldData } = props;
  const { loading, data, errors, signatureData } = Annex1Store;
  const formId = groupName + '_' + fieldName;
  const [modifying, setModifying] = useState(fieldData.status === 'EMPTY');
  const [pdf, setPdf] = useState(null);
  const signaturePadRef = useRef(null);

  useEffect(() => {
    if (signaturePadRef.current && signatureData) {
      signaturePadRef.current.fromData(signatureData);
    } else if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  });

  useEffect(() => {
    asyncSessionStorage
      .getItems(subscriptionId)
      .then(sessionData => {
        if (('firstname' in sessionData || 'lastname' in sessionData) && !data.name) {
          data.name = [sessionData.firstname, sessionData.lastname].join(' ').trim();
        }
        if ('company_name' in sessionData && !data.name) {
          data.name = sessionData.company_name;
        }
        if ('residential_address' in sessionData && !data.address) {
          data.address = sessionData.residential_address;
        }
        if ('corporate_address' in sessionData && !data.address) {
          data.address = sessionData.corporate_address;
        }
        if ('nationality' in sessionData && !data.nationality) {
          data.nationality = sessionData.nationality;
        }
        if ('date_of_birth' in sessionData && !data.date_of_birth) {
          data.date_of_birth = sessionData.date_of_birth;
        }
      })
    ;
  }, [data, subscriptionId]);

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
                className={`status-${annex.status}`}
                onClick={() => {
                  setModifying(true);
                }}
              >
                {annex.status} (click to change)
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

        <Button
          color="primary"
          onClick={() => { SubscriptionStore.patchSubscription(groupName); }}
          disabled={!SubscriptionStore.isStepModified(groupName, fieldName)}
        >
          {
            SubscriptionStore.isStepModified(groupName, fieldName)
              ? 'I confirm that I\'ve read the generated document'
              : 'No changes'
          }
        </Button>
      </>
    );
  }

  return (
    <>
      <FormGroup>
        <Label className="required" for={formId + '_name'}>Name / Surname or Company name</Label>
        <Input type="text" id={formId + '_name'}
          required
          value={data['name']}
          invalid={Annex1Store.hasError('name')}
          onChange={ev => { Annex1Store.setData('name', ev.target.value); }}
        />
        <FieldErrors errors={errors} field="name" />
      </FormGroup>

      <FormGroup>
        <Label className="required" for={formId + '_date_of_birth'}>Date of birth or Date of incorporation</Label>
        <DatePicker
          id={formId + '_date_of_birth'}
          date={data['date_of_birth']}
          invalid={Annex1Store.hasError('date_of_birth')}
          onChange={date => { Annex1Store.setData('date_of_birth', date); }}
          tillToday
        />
        <FieldErrors errors={errors} field="date_of_birth" />
      </FormGroup>

      <FormGroup>
        <Label className="required" for={formId + '_address'}>Address</Label>
        <Input type="text" id={formId + '_address'}
          required
          value={data['address']}
          invalid={Annex1Store.hasError('address')}
          onChange={ev => { Annex1Store.setData('address', ev.target.value); }}
        />
        <FieldErrors errors={errors} field="address" />
      </FormGroup>

      <FormGroup>
        <Label className="required" for={formId + '_nationality'}>Nationality</Label>
        <CountriesSelect
          id={formId + '_nationality'}
          value={data['nationality']}
          optionValue="alpha_code2"
          optionLabel="nationality"
          invalid={Annex1Store.hasError('nationality')}
          onChange={ev => { Annex1Store.setData('nationality', ev.target.value); }}
        />
        <FieldErrors errors={errors} field="nationality" />
      </FormGroup>

      <FormGroup>
        <Label className="required" for={formId + '_place'}>Current Location</Label>
        <Input type="text" id={formId + '_place'}
          required
          value={data['place']}
          invalid={Annex1Store.hasError('place')}
          onChange={ev => { Annex1Store.setData('place', ev.target.value); }}
        />
        <FieldErrors errors={errors} field="place" />
      </FormGroup>

      <FormGroup>
        <Label className="required">Signature of the counterparty</Label>
        <div className={'wrapper-signature-pad' + (Annex1Store.hasError('sign') ? ' is-invalid' : '')}>
          <SignaturePad
            options={{
              onEnd: () => {
                const dataIRL = signaturePadRef.current.toDataURL('image/svg+xml'); // goes to server
                const data = signaturePadRef.current.toData(); // to store sign between component updates

                Annex1Store.setData('sign', dataIRL);
                Annex1Store.setSignatureData(data);
              }
            }}
            ref={signaturePadRef}
            height={350}
          />
        </div>

        <Row className="justify-content-md-between align-items-md-center">
          <Col xs="12" md={{ size: 'auto' }}>
            <FieldErrors errors={errors} field="sign" />
          </Col>
          <Col xs="12" md={{ size: 'auto' }}>
            <Button
              className="w-100"
              color="warning"
              onClick={() => {
                Annex1Store.setSignatureData(null);
                Annex1Store.setData('sign', '');
              }}
            >
              Clear
            </Button>
          </Col>
        </Row>
      </FormGroup>

      <Row className="justify-content-md-between align-items-md-center">
        <Col xs="12" md={{ size: 'auto' }} className="mb-3 mb-md-0">
          <Button
            className="w-100"
            color="primary"
            onClick={() => {
              Annex1Store.postAnnex1(subscriptionId)
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

export default inject('SubscriptionStore', 'Annex1Store')(observer(Annex1Form));
