import React, { forwardRef, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { FormGroup, Label, InputGroup, InputGroupAddon, InputGroupText, Input, Spinner } from 'reactstrap';
import CountriesSelect from './CountriesSelect';
import DatePicker from './DatePicker';
import FieldErrors from './FieldErrors';

function StepField(props) {
  const { SubscriptionStore, groupName, fieldName, fieldData } = props;
  const fieldId = groupName + '_' + fieldName;
  const [modifying, setModifying] = useState(false);
  const [loadState, setLoadState] = useState('pending');
  const loadErrorDefault = 'An error occurred, please try again';
  const [loadError, setLoadError] = useState(loadErrorDefault);

  const { errors } = SubscriptionStore;
  const hasError = SubscriptionStore.hasFieldError(`${groupName}.fields.${fieldName}`);

  function getFieldValue(name) {
    if (SubscriptionStore.modified[groupName] && SubscriptionStore.modified[groupName][name]) {
      return SubscriptionStore.modified[groupName][name].value;
    }

    return fieldData.value && !fieldData.crypted ? fieldData.value : '';
  }

  function handleChange(ev) {
    const value = ev.target && 'value' in ev.target ? ev.target.value : ev;

    if (fieldData.value !== value) {
      SubscriptionStore.setModified(groupName, fieldName, value);
    } else {
      SubscriptionStore.removeModified(groupName, fieldName);
    }
  }

  function handleModify() {
    setModifying(true);
    setLoadState('pending');
  }

  function handleReset() {
    if (loadState === 'loading') {
      return;
    }

    setModifying(false);
    SubscriptionStore.removeModified(groupName, fieldName);
  }

  function handleFileSelect(ev) {
    if (!ev.target.files || !ev.target.files[0]) {
      return;
    }

    const reader = new FileReader();
    const field = ev.target;
    const file = field.files[0];
    const fileName = file.name;
    const fullFieldName = field.dataset.fieldName;
    let fileType = field.id;

    if (fileType === 'id_card_front') {
      fileType = 'id_card_mrz_side';
    }
    if (fileType === 'id_card_back') {
      fileType = 'id_card_back_side';
    }

    if (fileType === 'screenshot_of_id_page') {
      fileType = 'screenshot_id_page';
    }
    if (fileType === 'supporting_document1' || fileType === 'supporting_document2' || fileType === 'supporting_document3') {
      fileType = 'supporting_document';
    }

    setLoadState('loading');

    reader.onload = () => {
      const fileBase64 = reader.result.split(',')[1];

      SubscriptionStore.uploadFile(fileName, fileBase64, fileType)
        .then(res => {
          SubscriptionStore.setModified(groupName, fieldName, res.id);
          if (res && res.identt_error && res.identt_error instanceof Array) {
            let identtError = "";
            switch (res.identt_error[0]) {
              case "not_recognized":
                identtError = "This ID can't be recognized. Ensure that it contains an MRZ and that the quality is sufficient";
                break;
              case "unable_to_certify_document":
              case "document_not_certified":
                identtError = "Unable to valid this document";
                break;
              case "used_by_someone_else":
                identtError = "This ID is already in use by another customer. Please use only one account for your subscriptions";
                break;
              default:
                identtError = res.identt_error;
                break;
            }
            SubscriptionStore.addFieldError(fullFieldName, identtError);
          }
          setLoadState('done');
        })
        .catch(err => {
          if (err.response && err.response.body && err.response.body.err_msg) {
            setLoadError(err.response.body.err_msg);
          } else {
            setLoadError(loadErrorDefault);
          }

          setLoadState('error');
        })
        ;
    }
    reader.readAsDataURL(file);
  }

  function getLabel() {
    return <Label for={fieldId} className={fieldData.required ? 'required' : ''}>{fieldData.description}</Label>;
  }

  if (fieldData.hidden) {
    return null;
  }

  if (!modifying && fieldData.crypted && fieldData.status && fieldData.status !== 'EMPTY') {
    return (
      <FormGroup>
        {getLabel()}
        <InputGroup className="crypted">
          <InputGroupAddon addonType="prepend">
            <InputGroupText
              className={`status-${fieldData.status}`}
              onClick={handleModify}
            >
              {fieldData.status} (click to change)
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </FormGroup>
    );
  }

  if (fieldData.type === 'enum') {
    const isMultiple = fieldData.multiple;
    const value = isMultiple
      ? (getFieldValue(fieldName) ? getFieldValue(fieldName) : [])
      : getFieldValue(fieldName);

    const labels = {
      im_trader: "I'm a trader",
      early_adopter: "I'm an early adopter",
      ico_investor: "I'm an ico investor",
      miner: "I'm a miner",
      goods_and_services: "Goods and services",
      exchange: "Exchange",
      otc: "Otc",
      mined: "Mined",
      other: "Other",
      "": "-- Select --",
    };

    return (
      <FormGroup>
        {getLabel()}
        <InputGroup>
          {
            modifying && fieldData.crypted && fieldData.status &&
            <InputGroupAddon addonType="prepend">
              <InputGroupText
                className="pointer"
                onClick={handleReset}
              >
                Reset
              </InputGroupText>
            </InputGroupAddon>
          }
          <Input
            className={fieldData.required ? 'required' : ''}
            required={fieldData.required}
            type="select"
            value={value}
            multiple={isMultiple}
            invalid={hasError}
            onChange={ev =>
              isMultiple
                ? handleChange(Array.from(ev.target.selectedOptions, (item) => item.value))
                : handleChange(ev.target.value)
            }
          >
            {
              (isMultiple ? [] : [""]).concat(fieldData.possible_values).map(val =>
                <option key={val} value={val}>
                  {
                    val in labels
                      ? labels[val]
                      : val
                  }
                </option>
              )
            }
          </Input>
          <FieldErrors errors={errors} field={`${groupName}.fields.${fieldName}`} />
        </InputGroup>
      </FormGroup>
    );
  }

  if (fieldData.type === 'date') {
    return (
      <FormGroup>
        {getLabel()}
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText
              className="pointer"
              onClick={handleReset}
            >
              Reset
            </InputGroupText>
          </InputGroupAddon>
          <DatePicker
            id={fieldId}
            className={`form-control ${fieldData.required ? 'required' : ''}`}
            required={fieldData.required}
            date={getFieldValue(fieldName)}
            invalid={hasError}
            onChange={handleChange}
            tillToday
          />
          <FieldErrors errors={errors} field={`${groupName}.fields.${fieldName}`} />
        </InputGroup>
      </FormGroup>
    );
  }

  if (fieldData.type === 'string') {
    return (
      <FormGroup>
        {getLabel()}
        <InputGroup>
          {
            modifying && fieldData.crypted && fieldData.status &&
            <InputGroupAddon addonType="prepend">
              <InputGroupText
                className="pointer"
                onClick={handleReset}
              >
                Reset
              </InputGroupText>
            </InputGroupAddon>
          }
          {
            (
              fieldName === 'country' &&
              <CountriesSelect
                id={fieldId}
                className={fieldData.required ? 'required' : ''}
                required={fieldData.required}
                value={getFieldValue(fieldName)}
                invalid={hasError}
                onChange={handleChange}
              />
            )
            ||
            (
              fieldName === 'nationality' &&
              <CountriesSelect
                id={fieldId}
                value={getFieldValue(fieldName)}
                className={fieldData.required ? 'required' : ''}
                required={fieldData.required}
                optionValue="alpha_code2"
                optionLabel="nationality"
                invalid={hasError}
                onChange={handleChange}
              />
            )
            ||
            <Input
              id={fieldId}
              type="text"
              value={getFieldValue(fieldName)}
              className={fieldData.required ? 'required' : ''}
              required={fieldData.required}
              invalid={hasError}
              onChange={handleChange}
            />

          }
          <FieldErrors errors={errors} field={`${groupName}.fields.${fieldName}`} />
        </InputGroup>
      </FormGroup>
    );
  }

  if (fieldData.type === 'longstring') {
    return (
      <FormGroup>
        {getLabel()}
        <InputGroup>
          {
            modifying && fieldData.crypted && fieldData.status &&
            <InputGroupAddon addonType="prepend">
              <InputGroupText
                className="pointer"
                onClick={handleReset}
              >
                Reset
              </InputGroupText>
            </InputGroupAddon>
          }
          {
            <Input
              id={fieldId}
              type="textarea"
              className={fieldData.required ? 'required' : ''}
              required={fieldData.required}
              value={getFieldValue(fieldName)}
              invalid={hasError}
              onChange={handleChange}
            />
          }
          <FieldErrors errors={errors} field={`${groupName}.fields.${fieldName}`} />
        </InputGroup>
      </FormGroup>
    );
  }

  if (fieldData.type === 'id') {
    return (
      <FormGroup>
        {getLabel()}
        <InputGroup className={`${fieldData.required ? 'file-input-required' : ''} ${fieldData.status === null || fieldData.status === 'EMPTY' ? 'status-empty' : ''}`}>
          {
            modifying && fieldData.crypted && fieldData.status &&
            <InputGroupAddon addonType="prepend">
              <InputGroupText
                className="pointer"
                onClick={handleReset}
              >
                Reset
              </InputGroupText>
            </InputGroupAddon>
          }
          <div className="custom-file">
            <input type="file"
              className={'custom-file-input' + (loadState === 'error' || hasError ? ' is-invalid' : '') + (fieldData.required ? ' required' : '')}
              id={fieldName}
              required={fieldData.required}
              data-field-name={`${groupName}.fields.${fieldName}`}
              disabled={loadState === 'loading'}
              onChange={handleFileSelect}
            />
            <label className="custom-file-label" htmlFor={fieldName}>
              {
                (loadState === 'pending' && 'Pick a file')
                ||
                (loadState === 'done' && 'File uploaded')
                ||
                (loadState === 'loading' && <><Spinner size="sm" className="mr-2" /> Uploading...</>)
                ||
                (loadState === 'error' && loadError)
              }
            </label>
          </div>
          <FieldErrors errors={errors} field={`${groupName}.fields.${fieldName}`} />
        </InputGroup>
      </FormGroup>
    );
  }

  return null;
}

export default inject('SubscriptionStore')(observer(StepField));
