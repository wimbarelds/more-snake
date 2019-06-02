<template>
  <div id="app">
    <nav-bar />
    <router-view/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NavBar from './vue-components/NavBar.vue';

@Component({
  components: {
    NavBar,
  },
})
export default class VueApp extends Vue {
}
</script>


<style lang="scss">
@import './scss/fonts';
@import './scss/alerts';
@import './scss/transitions';

* {
  box-sizing: border-box;
}
:root {
  --color-primary: #FFF;
  --color-secondary: #000;
  --color-accent: #fd5819;
  --color-accent-alt: #0ebcea;
}

html, body, #app {
  font-family: 'Arcade Normal';
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  color: var(--color-primary);
  background-color: var(--color-secondary);
  overflow: hidden;
  position: relative;
}
h1,h2,h3,h4 {
  color: var(--color-accent);
}

canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(96vw);
  height: calc(48vw);
  max-width: calc(192vh - 100px);
  max-height: calc(96vh - 50px);
  // max-width: 1280px;
  // max-height: 640px;
  transform: translate(-50%, -50%);
  // border: solid rgba(255, 255, 255, .05) 5px;
  margin-top: 25px;
  box-sizing: content-box;

  @media (max-width: 800px) and (orientation: portrait) {
    margin-top: -70px;
  }
}
</style>
