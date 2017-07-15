<template>
  <v-container fluid class="main-container">
    <v-layout justify-center align-center>
      <v-flex xs12 sm10 md8 lg6 xl6>
        <v-container v-if="$store.state.user.isAuthenticated">

          <v-container class="btns-container">
            <v-btn primary dark slot="activator" @click.native.stop="openDialog('file')">File Download</v-btn>
            <v-btn primary dark slot="activator" @click.native.stop="openDialog('youtube')">Youtube Download</v-btn>
          </v-container>

          <downloads-list :downloads="downloads"></downloads-list>

          <v-layout row>
            <v-dialog v-model="dialog" width="600px" :persistent="loading">
              <form @submit.prevent="download" ref="form">
                <v-card>
                  <v-card-title>
                    <span class="headline">{{ type === 'file' ? 'File Download' : 'Youtube Download' }}</span>
                  </v-card-title>
                  <v-card-text v-if="showForm">
                    <v-text-field v-focus label="URL" type="url" required v-model="url"></v-text-field>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn class="green--text darken-1" flat="flat" @click.native="dialog = false" :disabled="loading">Cancel</v-btn>
                    <v-btn class="green--text darken-1" flat="flat" type="submit" :loading="loading" :disabled="loading">Download</v-btn>
                  </v-card-actions>
                </v-card>
              </form>
            </v-dialog>
          </v-layout>

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
import axios from '../plugins/axios';
import DownloadsList from '../components/downloads-list.vue';
import { mapMutations } from 'vuex';

export default {
  middleware: 'index-oauthed',
  data () {
    return {
      dialog: false,
      showForm: true,
      url: '',
      type: 'youtube',
      loading: false
    };
  },
  methods: {
    ...mapMutations({
      notifyFailure: 'notification/FAILURE',
      notifySuccess: 'notification/SUCCESS'
    }),
    openDialog (type) {
      this.type = type;
      this.url = '';
      this.dialog = true;

      // Reset form state trick
      this.showForm = false;
      this.$nextTick(() => {
        this.showForm = true;
      });
    },
    download () {
      this.loading = true;
      axios.post(`/downloads`, {
        [this.type === 'file' ? 'url' : 'youtube']: this.url
      })
      .then(({ data: message }) => {
        this.notifySuccess({ message });
        this.dialog = false;
      })
      .catch(() => {
        this.notifyFailure({ message: 'Download failed' });
      })
      .then(() => {
        this.loading = false;
      });
    }
  },
  async asyncData ({ store }) {
    if (store.state.user.isAuthenticated) {
      try {
        let {data: downloads} = await axios.get(`/downloads`);
        return { downloads };
      } catch (error) {
        store.commit('notification/FAILURE', { message: 'Downloads fetch failed' });
      }
    }
  },
  components: {DownloadsList},
  directives: {
    focus: {
      inserted: function (el) {
        const input = el.getElementsByTagName('input')[0];
        (input || el).focus();
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
  .main-container {
    padding: 0;
  }
  .btns-container {
    padding: 0;
    text-align: center;
    padding-bottom: 20px;
    button {
      min-width: 180px;
    }
  }
</style>
