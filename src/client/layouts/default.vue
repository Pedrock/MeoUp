<template>
  <v-app>
    <v-toolbar class="indigo darken-4" dark>
      <v-toolbar-title>
        <v-btn flat slot="activator" light exact active-class="active" to="/">
          {{name}}
        </v-btn>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu bottom :nudge-right="40">
        <v-btn icon="icon" slot="activator" light>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 18 18">
            <path fill="#fff" d="M9 5.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm0 2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
          </svg>
        </v-btn>
        <v-list>
          <v-list-item>
            <v-list-tile ripple to="/users/auth/sign-in" v-if="!$store.state.user.isAuthenticated">
              <v-list-tile-title>Sign In</v-list-tile-title>
            </v-list-tile>
          </v-list-item>
          <v-list-item>
            <v-list-tile ripple to="/users/auth/sign-up" v-if="!$store.state.user.isAuthenticated">
              <v-list-tile-title>Sign Up</v-list-tile-title>
            </v-list-tile>
          </v-list-item>
          <v-list-item>
            <v-list-tile ripple to="/users/auth/sign-out" v-if="$store.state.user.isAuthenticated">
              <v-list-tile-title>Sign Out</v-list-tile-title>
            </v-list-tile>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
    <main>
      <div fluid>
        <nuxt></nuxt>
      </div>
    </main>
    <v-snackbar
            :timeout="3000"
            :bottom="true"
            :right="true"
            :multi-line="true"
            :success="$store.state.notification.context === 'success'"
            :info="$store.state.notification.context === 'info'"
            :warning="$store.state.notification.context === 'warning'"
            :error="$store.state.notification.context === 'error'"
            :primary="$store.state.notification.context === 'primary'"
            :secondary="$store.state.notification.context === 'secondary'"
            v-model="$store.state.notification.snackbar"
    >
      {{ $store.state.notification.text }}
      <v-btn light flat @click="$store.state.notification.snackbar = false">Close</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
  export default {
    data () {
      return {
        name: 'MeoUp'
      };
    }
  };
</script>

<style lang="stylus">
  .toolbar__content {
    height: 48px !important;
  }
  .toolbar__title {
    margin-left: 0 !important;

    a.active:hover, a.active:focus {
      .btn__content:before, .ripple__container {
        display: none;
      }
      cursor: default;
    }
  }
</style>
