<template>
  <v-tooltip content-class="helper" v-bind="$attrs" v-on="$listeners">
    <template #activator="{ on, attrs }">
      <v-icon
        class="helper-activator"
        :class="activatorClass"
        v-bind="attrs"
        :color="iconColor"
        :size="iconSize"
        v-on="on"
      >
        {{ icon }}
      </v-icon>
    </template>

    <span class="helper-box-message" :class="messageClass">
      {{ message }}
    </span>
  </v-tooltip>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class Helper extends Vue {
  @Prop({ type: String, default: '' })
  private activatorClass!: string;

  @Prop({ type: String, default: '' })
  private messageClass!: string;

  @Prop({ type: String, default: 'rgba(0, 0, 0, 0.6)' })
  private iconColor!: string;

  @Prop({ type: String, default: 'hi-help-circle-outlined' })
  private icon!: string;

  @Prop({ type: String, default: '16px' })
  private iconSize!: string;

  @Prop({ type: String, default: '', required: true })
  private message!: string;
}
</script>

<style lang="scss">
.helper-activator {
  margin-left: 4px;
}

.helper {
  color: #222;
  font-size: inherit;
  background-color: #fff;
  box-shadow: 1px 2px 5px 0px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12) !important;

  span.helper-box-message {
    font-size: 1.2em;
  }
}
</style>
