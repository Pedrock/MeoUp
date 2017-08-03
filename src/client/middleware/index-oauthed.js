import axios from '../plugins/axios';

export default async function ({ store, redirect }) {
  if (store.state.user.isAuthenticated && !store.state.user.oauthed) {
    try {
      const oauthed = (await axios.get('/users/oauth/check')).data;
      if (oauthed) {
        store.state.user.oauthed = true;
      } else {
        return redirect('/oauth');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        store.state.user.isAuthenticated = false;
      } else {
        throw error;
      }
    }
  }
}
