<template>
  <transition name="slide">
    <div class="backdrop" v-if="show">
      <div class="menu">
        <h2>Pick a level</h2>
        <div class="menu-items">
          <button
            type="button"
            v-for="level in levels"
            :key="level"
            @click="$emit('set-level', level)"
          >{{ level }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import Axios from "axios";
import { ServerResult } from "./GameHighscores.vue";
import { Alert } from "../../alerts/alerts";
@Component
export default class GameLevelPicker extends Vue {
  @Prop({ default: false }) public show!: boolean;
  public levels: string[] = [];

  @Watch("show")
  private async updateLevelList() {
    const response = await Axios.get<ServerResult<string[]>>("/level-list");
    if (!response.data.success) {
      Alert(response.data.message);
    } else {
      this.levels = response.data.data;
    }
  }
}
</script>

<style lang="scss" scoped>
.backdrop {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}
.menu {
  h2 {
    text-shadow: 1px 1px var(--color-primary);
  }
}

.menu-items {
  max-width: 80vw;
  max-height: calc(80vh - 100px);
  overflow-y: auto;
  padding: 0 10px 0 0;

  &::-webkit-scrollbar {
    width: 5px;
  }

  /* Track */
  &::-webkit-scrollbar-track {
    background: transparent;
  }

  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: var(--color-accent);
  }
}

button {
  display: block;
  color: var(--color-primary);
  background-color: rgba(0, 0, 0, 0.5);
  width: 100%;
  padding: 10px;
  text-align: left;
  border: 0;
  font-family: "Arcade Normal";
  border: solid var(--color-accent) 1px;
  cursor: pointer;
  box-shadow: 0px 0px var(--color-accent);
  transition: box-shadow 0.4s ease-in-out;
  outline: 0;

  &:hover {
    box-shadow: 5px 5px var(--color-accent);
  }
}

button + button {
    margin-top: 20px;
}
</style>
