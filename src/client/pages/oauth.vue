<template>
  <v-container fluid>
    <v-layout row justify-center>
      <v-flex xs12 sm10 md8 lg6 xl6 class="text-xs-center">
        <v-btn :href="authorizeURL" tabindex="1" tag="a" target="_blank" @click.native="clicked = true">Get Pin</v-btn>
        <form @submit.prevent="submit()">
          <v-text-field v-model="pin" label="Pin"></v-text-field>
          <input type="submit" style="display: none" :disabled="disabledSubmit">
          <v-btn :loading="false" :disabled="disabledSubmit" tabindex="3" @click.native="submit()">Submit</v-btn>
        </form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { mapMutations } from 'vuex';
  import axios from '../plugins/axios';

  export default {
    middleware: 'authenticated',
    data () {
      return {
        authorizeURL: null,
        clicked: false,
        pin: '',
        loading: false
      };
    },
    async asyncData ({ store }) {
      try {
        let { authorizeURL } = (await axios.get(`/users/oauth`)).data;
        return { authorizeURL };
      } catch (error) {
        store.commit('notification/FAILURE', { message: 'Oauth request failed. Please refresh this page and try again.' });
      }
    },
    computed: {
      disabledSubmit () {
        return this.pin.length === 0 || !this.clicked;
      }
    },
    methods: {
      ...mapMutations({
        notifyFailure: 'notification/FAILURE',
        notifySuccess: 'notification/SUCCESS'
      }),
      submit () {
        this.loading = true;
        axios.post(`/users/oauth`, { pin: this.pin })
        .then(() => {
          this.$router.replace('/');
        }).catch(() => {
          this.notifyFailure({ message: 'Oauth failed. Please try again.' });
        });
      }
    }
  };
</script>

<style>
  input.btn--dark:hover:not(:disabled) {
    background-color: rgba(0,0,0,0.24);
  }
</style>
