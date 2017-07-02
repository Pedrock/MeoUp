<template>
  <v-container fluid>
    <v-layout justify-center align-center>
      <v-flex xs12 sm10 md8 lg6 xl6>
        <v-container v-if="$store.state.user.isAuthenticated">
          Main page
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
export default {
  data() {
    return {

    }
  }
}
</script>
