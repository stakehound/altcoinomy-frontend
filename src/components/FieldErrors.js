import React from 'react';
import { FormFeedback } from 'reactstrap';

function FieldErrors(props) {
  const errors = findError();

  function findError() {
    const path = Array.isArray(props.field) ? props.field : [props.field];
    const errorFields = props.errors && props.errors.fields;
    if (!errorFields) {
      return null;
    }

    let errors = path.reduce((prev, curr) => {
      if (null === prev || typeof prev !== 'object') {
        return null;
      }

      return curr in prev ? prev[curr] : null;
    }, errorFields);

    return errors;
  }

  if (errors) {
    if (typeof errors === 'string') {
      return (
        <FormFeedback>{errors}</FormFeedback>
      );
    }

    if (Array.isArray(errors)) {
      return errors.map((error, index) => {
        return (
          <FormFeedback key={index}>{error && error.msg ? error.msg : error}</FormFeedback>
        );
      });
    }
  }

  return null;
}

export default FieldErrors;
