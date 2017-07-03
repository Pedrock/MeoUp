<template>
  <v-container fluid>
    <v-layout justify-center align-center>
      <v-flex xs12 sm10 md8 lg6 xl6>
        <v-container v-if="$store.state.user.isAuthenticated">
          <downloads-list :downloads="downloads"></downloads-list>
        </v-container>
        <v-container v-else align="center">
          <h3 class="text-xs-center">MeoUp</h3>
          <p>Please login</p>
        </v-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from '../plugins/axios'
import DownloadsList from '../components/downloads-list.vue'

export default {
  data() {
    return {

    }
  },
  async asyncData({ store }) {
    if (store.state.user.isAuthenticated) {
      let { data:downloads } = await axios.get(`/downloads`).catch(console.error)
      return { downloads }
    }
  },
  components: {DownloadsList},
}
</script>
