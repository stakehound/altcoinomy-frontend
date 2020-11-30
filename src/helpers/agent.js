import superagent from 'superagent';
import CommonStore from '../stores/CommonStore';
import AccountStore from '../stores/AccountStore';
import { API_ROOT } from '../config';

const tokenPlugin = req => {
  if (CommonStore.token) {
    req.set('Authorization', `Bearer ${CommonStore.token}`);
  }
};

const handleErrors = err => {
  if (err && err.response && err.response.status === 401) {
    AccountStore.logout();
  }

  throw err;
};

const responseBody = res => {
  return res.body
};

const requests = {
  del: url =>
    superagent
      .del(`${API_ROOT}${url}`)
      .use(tokenPlugin)
      .then(responseBody)
      .catch(handleErrors)
  ,
  get: url =>
    superagent
      .get(`${API_ROOT}${url}`)
      .use(tokenPlugin)
      .then(responseBody)
      .catch(handleErrors)
  ,
  getBlob: url =>
    superagent
      .get(`${API_ROOT}${url}`)
      .responseType('blob')
      .use(tokenPlugin)
      .then(responseBody)
      .catch(handleErrors)
  ,
  patch: (url, body) =>
    superagent
      .patch(`${API_ROOT}${url}`, body)
      .use(tokenPlugin)
      .then(responseBody)
      .catch(handleErrors)
  ,
  post: (url, body) =>
    superagent
      .post(`${API_ROOT}${url}`, body)
      .use(tokenPlugin)
      .then(responseBody)
      .catch(handleErrors)
};

const Accounts = {
  register: (username, email, plainPassword) =>
    requests.post('/register', { username, email, plainPassword, telephone: '', confirmBy: 'email' }),
  validate: (code) =>
    requests.post('/validate', { code }),
  validateResend: (email) =>
    requests.post('/validate/resend', { email, confirmBy: 'email' }),
  login: (username, password) =>
    requests.post('/auth_token', { username, password }),
};

const Countries = {
  list: () =>
    requests.get('/countries')
};

const Customers = {
  me: () =>
    requests.get('/customers/me'),
};

const Icos = {
  list: () =>
    requests.get('/icos'),
  logo: (id) =>
    requests.getBlob(`/icos/${id}/logo`),
  ico: (id) =>
    requests.get(`/icos/${id}`)
};

const IcoDocuments = {
  list: (icoId) =>
    requests.get(`/ico/${icoId}/extra-documents`),
  get: (documentId) =>
    requests.get(`/extra-documents/${documentId}`),
};

const Annexes = {
  postAnnex1: (subscriptionId, data) =>
    requests.post(`/subscriptions/${subscriptionId}/annex1`, data),
  postAnnex2: (subscriptionId, data) =>
    requests.post(`/subscriptions/${subscriptionId}/annex2`, data),
};

const Contribution = {
  patchContribution: (subscriptionId, data) =>
    requests.patch(`/subscriptions/${subscriptionId}/contribution`, data),
  getContributionEstimation: (subscriptionId, data) =>
    requests.post(`/subscriptions/${subscriptionId}/share-price-estimation`, data),
};

const Subscriptions = {
  list: () =>
    requests.get('/subscriptions'),
  get: (id) =>
    requests.get(`/subscriptions/${id}`),
  create: (icoId, registerAs) =>
    requests.post('/subscriptions', { ico: icoId, register_as: registerAs }),
  patch: (id, data) =>
    requests.patch(`/subscriptions/${id}`, data),
  getFillStatus: (id) =>
    requests.get(`/subscriptions/${id}/fill-status`),
  uploadFile: (id, filename, file, type) =>
    requests.post(`/subscriptions/${id}/files`, { filename, file, type }),
  extraDocument: (id, documentId, data) =>
    requests.post(`/subscriptions/${id}/extra-document/${documentId}`, data),
  finalize: (id, data) =>
    requests.post(`/subscriptions/${id}/submit`, data),
};

const VideoConference = {
  list: () =>
    requests.get('/video-conference-planning/slots'),
  book: (slotId, subscriptionId, preferredLanguage) =>
    requests.post('/video-conference-planning/slots/book', {
      slot_id: slotId,
      subscription_id: subscriptionId,
      preferred_language: preferredLanguage
    }),
};

export { Accounts, Countries, Customers, Icos, IcoDocuments, Annexes, Subscriptions, Contribution, VideoConference };
