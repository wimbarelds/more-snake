<template>
    <div class="score" v-if="show">
        <label class="score__label">Score:</label>
        <span class="score__value">{{ value }}</span>
    </div>    
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
@Component
export default class GameScore extends Vue {
    @Prop({ default: false }) public show!: boolean;
    @Prop({ default: 0 }) public value!: number;
}
</script>

<style lang="scss" scoped>
.score {
  position: fixed;
  top: 0;
  right: 10px;
  padding: 10px;
  border: solid var(--color-primary) 5px;
  border-top: 0;
  z-index: 5;

  &__value {
    color: var(--color-accent);
  }
}
</style>
