<template>
  <div class="card-default" @click="$emit('show', data)">
    <div class="content">
      <div class="circle">
        <v-icon>{{ icon }}</v-icon>
      </div>

      <div class="details">
        <slot name="details" v-bind="data" />
      </div>
      <div class="more-v">
        <v-icon @click.stop="showActions = !showActions">more_vert</v-icon>
      </div>
    </div>

    <div class="footer">
      <slot name="footer" v-bind="data" />
      <div :class="['actions', showActions ? 'show' : '']">
        <slot name="actions" v-bind="data" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class CardDefault extends Vue {
  @Prop({ type: String, default: 'hi-list' })
  private icon!: string;

  @Prop({ type: Object, default: () => ({}) })
  private data!: Record<string, any>;

  private showActions = false;
}
</script>

<style lang="scss">
.card-default {
  margin: 5px;
  width: 100%;
  max-width: 342px;
  background: #ffffff;
  cursor: pointer;

  .content {
    position: relative;
    padding: 16px;
    min-height: 110px;
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid rgba(#000000, 0.1);

    .circle {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      margin-right: 28px;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: 1px solid rgba(#000000, 0.1);

      i {
        color: rgba(#000000, 0.3);
      }
    }

    .details {
      .name {
        margin-right: 20px;
        width: 180px;
        color: #000000;
        font-size: 1.6em;
        font-weight: 600;
        text-overflow: ellipsis;
        line-height: 1.4;
      }

      .description {
        color: rgba(#000000, 0.6);
        font-size: 1.1em;
        font-weight: 500;
      }
    }

    .more-v {
      position: absolute;
      top: 3px;
      right: 3px;

      i {
        border-radius: 50%;
        padding: 5px;

        &:hover {
          background: #f5f5f5;
        }
      }
    }
  }

  .footer {
    position: relative;
    padding: 10px 12px;
    height: 40px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .detail {
      align-self: center;
      font-size: 1.2em;
      font-weight: 500;
      color: rgba(#000000, 0.6);
    }

    .actions {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 0;
      display: flex;
      flex-direction: row;
      font-size: 1.2em;
      font-weight: 700;
      color: rgba(#000000, 0.6);
      transition: 0.3s;

      &.show {
        height: 40px;

        .action {
          opacity: 1;
        }
      }

      .action {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        background: #ffffff;
        opacity: 0;
        transition: 0.3s;

        &:hover {
          background: #f5f5f5;

          color: #000000;
        }
      }
    }
  }
}
</style>
