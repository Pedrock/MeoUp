import axios from '../plugins/axios';

export default async function ({ store, redirect }) {
  if (store.state.user.isAuthenticated && !store.state.user.oauthed) {
    const oauthed = (await axios.get('/users/oauth/check')).data;
    if (oauthed) {
      store.state.user.oauthed = true;
    } else {
      return redirect('/oauth');
    }
  }
}
