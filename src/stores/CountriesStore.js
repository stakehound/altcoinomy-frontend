import { decorate, observable, action, computed } from 'mobx';
import { Countries } from '../helpers/agent';

class CountriesStore {

  loadingCount = 0;
  countriesRegistry;

  get loading() {
    return this.loadingCount > 0;
  }

  get countries() {
    return Array.isArray(this.countriesRegistry) ? this.countriesRegistry : [];
  }

  loadCountries({ acceptCached = true } = {}) {
    if (acceptCached) {
      if (this.countriesRegistry !== undefined) {
        return Promise.resolve(this.countriesRegistry);
      }
    }

    this.loadingCount++;

    return Countries.list()
      .then(action(countries => {
        this.countriesRegistry = countries;

        return this.countriesRegistry;
      }))
      .catch(action(err => { this.countriesRegistry = []; }))
      .finally(action(() => { this.loadingCount--; }))
    ;
  }

}
decorate(CountriesStore, {
  loadingCount: observable,
  countriesRegistry: observable,
  loading: computed,
  countries: computed,
  loadCountries: action,
});

export default new CountriesStore();
