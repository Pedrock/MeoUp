<template>
  <v-app>
    <v-toolbar class="indigo darken-4" light fixed>
      <v-toolbar-title>{{name}}</v-toolbar-title>
      <v-menu bottom left>
        <v-btn icon="icon" slot="activator" light>
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-item>
            <v-list-tile ripple router to="/users/auth/sign-in" v-if="!$store.state.user.isAuthenticated">
              <v-list-tile-title>Sign In</v-list-tile-title>
            </v-list-tile>
          </v-list-item>
          <v-list-item>
            <v-list-tile ripple router to="/users/auth/sign-up" v-if="!$store.state.user.isAuthenticated">
              <v-list-tile-title>Sign Up</v-list-tile-title>
            </v-list-tile>
          </v-list-item>
          <v-list-item>
            <v-list-tile ripple router to="/users/auth/sign-out" v-if="$store.state.user.isAuthenticated">
              <v-list-tile-title>Sign Out</v-list-tile-title>
            </v-list-tile>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
    <main>
      <v-container fluid>
        <nuxt></nuxt>
      </v-container>
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
      <v-btn light flat @click.native="$store.state.notification.snackbar = false">Close</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
  // search icons: https://material.io/icons/
  import vueniverseLogo from '~assets/img/vueniverse_logo.svg'

  export default {
    data () {
      return {
        name: 'MeoUp'
      }
    }
  }
</script>