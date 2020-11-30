import { decorate, observable, action, computed } from 'mobx';
import { Subscriptions } from '../helpers/agent';
import ContributionStore from './ContributionStore';

class SubscriptionStore {

  loadingCount = 0;
  finalizingCount = 0;
  subscriptionRegistry = observable.map();
  fillStatus = null;
  globalErrors = [];
  terms = false;
  modified = {};
  errors = {}

  get loading() {
    return this.loadingCount > 0;
  }

  get finalizing() {
    return this.finalizingCount > 0;
  }

  get subscriptions() {
    return Array.from(this.subscriptionRegistry.values());
  };

  getSubscription(id) {
    return this.subscriptionRegistry.get(id);
  }

  setGlobalErrors(globalErrors) {
    this.globalErrors = globalErrors;
  }

  getGlobalErrors() {
    return this.globalErrors;
  }

  setFillStatus(fillStatus) {
    this.fillStatus = fillStatus;
  }

  setTerms(terms) {
    this.terms = terms;
  }

  getTerms() {
    return this.terms;
  }

  isSubmitted(subscriptionId) {
    return !!sessionStorage.getItem(`submitted-${subscriptionId}`);
  }

  finalize(id, acceptedTerms) {
    this.finalizingCount++;
    sessionStorage.setItem(`submitted-${id}`, true);

    return Subscriptions.finalize(id, { terms_accepted: acceptedTerms })
      .then(action(fillStatus => {
        return fillStatus;
      }))
      .catch(action(err => {
        throw err;
      }))
      .finally(action(() => { this.finalizingCount--; }))
      ;
  }

  loadSubscriptions() {
    this.loadingCount++;

    return Subscriptions.list()
      .then(action(subscriptions => {
        this.subscriptionRegistry.clear();

        subscriptions.forEach(subscription => {
          this.subscriptionRegistry.set(subscription.id, subscription);
        });
      }))
      .finally(action(() => { this.loadingCount--; }))
      ;
  }

  loadSubscription(id, { acceptCached = false } = {}) {
    if (acceptCached) {
      const subscription = this.getSubscription(id);

      if (subscription) {
        return Promise.resolve(subscription);
      }
    }

    this.loadingCount++;

    return Subscriptions.get(id)
      .then(action(subscription => {
        this.subscriptionRegistry.set(subscription.id, subscription);

        return subscription;
      }))
      .finally(action(() => { this.loadingCount--; }))
      ;
  }

  createSubscription(icoId, registerAs) {
    this.loadingCount++;

    return Subscriptions.create(icoId, registerAs)
      .then(subscription => {
        this.subscriptionRegistry.set(subscription.id, subscription);

        return subscription;
      })
      .finally(action(() => { this.loadingCount--; }))
      ;
  }

  isStepModified(groupName, fieldName = null) {
    if (!this.modified[groupName]) {
      return false;
    }
    if (fieldName) {
      return fieldName in this.modified[groupName];
    }

    return Object.keys(this.modified[groupName]).length > 0;
    // return computed(() => {return this.modified[name] && Object.keys(this.modified[name]).length > 0}).get();
  }

  setModified(groupName, fieldName, value) {
    if (!this.modified[groupName]) {
      this.modified[groupName] = {};
    }
    if (!this.modified[groupName][fieldName]) {
      this.modified[groupName][fieldName] = {};
    }

    this.modified[groupName][fieldName]['value'] = value;
  }

  removeModified(groupName, fieldName) {
    if (this.modified[groupName] && this.modified[groupName][fieldName]) {
      delete this.modified[groupName][fieldName];
    }
  }

  addFieldError(field, error) {
    if (this.errors && !this.errors.fields) {
      this.errors.fields = {};
    }
    this.errors.fields[field] = error;
  }

  hasFieldError(field) {
    return !!(this.errors && this.errors.fields && this.errors.fields[field]);
  }

  patchSubscription(groupName, fieldsName = 'fields') {
    this.setGlobalErrors(null);
    const subscriptionId = this.fillStatus.subscription_id;
    const data = {
      subscription_id: subscriptionId,
      groups: {
        [groupName]: {
          [fieldsName]: this.modified[groupName]
        }
      }
    }

    this.loadingCount++;

    this.errors = {};

    return Subscriptions.patch(subscriptionId, data)
      .then(action(fillStatus => {
        this.resetFillStatus();
        this.fillStatus = fillStatus;
      }))
      .catch(err => {
        this.errors = err.response.body;
      })
      .finally(action(() => { this.loadingCount--; }))
      ;
  }

  loadFillStatus(id) {
    this.loadingCount++;

    this.resetFillStatus();
    this.setGlobalErrors(null);

    return Subscriptions.getFillStatus(id)
      .then(action(fillStatus => {
        this.fillStatus = fillStatus;
        ContributionStore.setInitialData(this.fillStatus.groups.finalization.fields.contribution.value);
      }))
      .finally(action(() => { this.loadingCount--; }))
      ;
  }

  resetFillStatus() {
    this.fillStatus = null;
    this.modified = {};
  }

  uploadFile(fileName, fileBase64, fileType) {
    return Subscriptions.uploadFile(this.fillStatus.subscription_id, fileName, fileBase64, fileType);
  }

  patchPaymentStatus(subscriptionId, currencies) {
    this.loadingCount++;

    this.errors = {};

    return Subscriptions.patchPaymentStatus(subscriptionId, currencies)
      .then()
      .catch(err => {
        this.errors = err.response.body;
      })
      .finally(action(() => { this.loadingCount--; }))
    ;
  }

}
decorate(SubscriptionStore, {
  loadingCount: observable,
  finalizingCount: observable,
  subscriptionRegistry: observable,
  fillStatus: observable,
  globalErrors: observable,
  terms: observable,
  modified: observable,
  loading: computed,
  subscriptions: computed,
  loadSubscriptions: action,
  loadSubscription: action,
  createSubscription: action,
  setModified: action,
  removeModified: action,
  patchSubscription: action,
  loadFillStatus: action,
  resetFillStatus: action,
  patchPaymentStatus: action,
});

export default new SubscriptionStore();
