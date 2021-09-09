<template>
  <div class="public-wrapper">
    <v-app-bar app clipped-left color="#000" dark flat dense />

    <v-main>
      <router-view />
    </v-main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Public extends Vue {}
</script>
