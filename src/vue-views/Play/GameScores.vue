<template>
    <div class="score" v-if="show">
        <label class="score__label">{{ labelText }}</label>
        <span class="score__value">{{ valueText }}</span>
    </div>    
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
@Component
export default class GameScore extends Vue {
    @Prop({ default: false }) public show!: boolean;
    @Prop({ default: [ 0 ] }) public values!: number[];

    public get labelText(): string {
      return this.values.length < 2 ? 'Score:' : 'Scores:'
    }

    public get valueText(): string {
      return this.values.join(' | ');
    }
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
