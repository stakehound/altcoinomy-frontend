const asyncSessionStorage = {
  setItem: async function (subscriptionId, field, value) {
    const fieldsJSON = sessionStorage.getItem(subscriptionId);
    const fields = fieldsJSON ? JSON.parse(fieldsJSON) : {};

    fields[field] = value;

    sessionStorage.setItem(subscriptionId, JSON.stringify(fields));
  },
  getItems: async function (subscriptionId) {
    const fieldsJSON = sessionStorage.getItem(subscriptionId);

    return fieldsJSON ? await JSON.parse(fieldsJSON) : {};
  },
  getItem: async function (subscriptionId, field) {
    const fields = this.getItems(subscriptionId);

    return field in fields ? fields[field] : null;
  },
  reset: async function() {
    sessionStorage.clear();
  }
};

export { asyncSessionStorage };
