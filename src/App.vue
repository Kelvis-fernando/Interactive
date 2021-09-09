<template>
  <v-app>
    <div v-if="isLoading" class="loading-page">
      <div class="progress-circle">
        <v-progress-circular
          color="#00000099"
          :width="3"
          :size="100"
          indeterminate
        />
      </div>
    </div>
    <router-view />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

@Component
export default class MainApp extends Vue {
  @Getter('auth/isLoadingSession') isLoading!: boolean;
}
</script>

<style lang="scss">
* {
  font-family: 'Axiforma';
  outline: 0;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  box-shadow: none !important;

  &:focus {
    outline: 0;
  }

  &::-webkit-scrollbar {
    height: 5px;
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    border-radius: 50%;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(200, 200, 200);
    opacity: 0.4;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(190, 190, 190);
  }
}

html {
  height: 100%;
  background-color: #f0f0f0 !important;
}

body {
  height: 100%;
  width: 100%;
  font-size: 62.5%;
  background: #f0f0f0;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
  text-rendering: optimizeLegibility !important;
  letter-spacing: 0 !important;
}

#app {
  position: relative;

  .loading-page {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100%;
    z-index: 10000;

    .progress-circle {
      position: fixed;
      top: calc(50% - 50px);
      left: calc(50% - 50px);
    }
  }
}

.v-application {
  background: #f0f0f0 !important;
}

a {
  text-decoration: none;
  text-transform: none !important;
  cursor: pointer;
  font-size: 1.2em !important;
  letter-spacing: 0 !important;
  line-height: 1 !important;

  &:not(.router-link-active):hover {
    opacity: 0.8;
  }
}

p {
  font-size: 1.2em !important;
  letter-spacing: 0 !important;
}

.hi:active,
.hi:focus,
.hi:focus:active {
  background-image: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.v-overlay {
  .v-overlay__scrim {
    opacity: 0;
  }

  &.v-overlay--active {
    .v-overlay__scrim {
      opacity: 0.8 !important;
    }
  }
}

.v-label {
  font-size: inherit !important;
  letter-spacing: 0 !important;
}

.v-input {
  font-size: 1.2em !important;
  letter-spacing: 0 !important;

  .v-input__slot {
    margin-bottom: 4px;

    input {
      padding: 4px 0 0;
    }

    .v-input__append-inner {
      .v-icon {
        margin-top: 0 !important;
      }
    }
  }

  .v-messages {
    font-size: 0.8em !important;
  }
}

.input-date-picker {
  &.v-input--is-readonly:not(.v-input--is-disabled) {
    input {
      cursor: pointer;
    }
  }

  &:not(.v-input--is-disabled) {
    .open-datepicker {
      cursor: pointer;
    }
  }

  &.v-input--is-disabled {
    cursor: default;

    .open-datepicker {
      cursor: default;
    }
  }

  .open-datepicker {
    i {
      font-size: 1.4em;
    }
  }
}

button {
  outline: none !important;
  cursor: pointer;

  &:active,
  &:hover {
    outline: none !important;
  }
}

.v-btn {
  text-transform: none !important;
  padding: 0 20px !important;
  font-size: 1.2em !important;
  letter-spacing: 0 !important;
  line-height: 1 !important;
  outline: none !important;
  cursor: pointer;

  &:hover {
    &::before {
      background-color: transparent !important;
    }
  }

  &:focus {
    &::before {
      background-color: transparent !important;
    }
  }
}

.v-dialog {
  border-radius: 0 !important;

  &.v-dialog--persistent {
    min-width: 448px;
    width: auto !important;
  }
}

.v-divider {
  border-color: rgba(#000000, 0.1) !important;
}

.v-menu__content {
  border-radius: 0;
  border: 1px solid rgba(#000000, 0.3);
  background-color: #fafafa !important;

  .v-card:not(.v-sheet--tile):not(.v-card--shaped) {
    border-radius: 0;
  }

  .v-select-list {
    border-radius: 0 !important;

    .v-list {
      padding: 0px;
      border-radius: 0;

      .v-list-item {
        min-height: 32px;

        .v-list-item__content {
          .v-list-item__title {
            font-size: 1.2em !important;
            color: rgba(#000000, 0.6) !important;
          }
        }

        &.v-list-item--active {
          .v-list-item__content {
            .v-list-item__title {
              color: #000000 !important;
            }
          }
        }
      }
    }
  }
}

.v-autocomplete__content {
  .v-select-list {
    border-radius: 0 !important;
    background-color: #fafafa;

    .v-list {
      padding: 0px;
      border-radius: 0;

      .v-list-item {
        min-height: 32px;

        .v-list-item__content {
          .v-list-item__title {
            font-size: 1.2em !important;
            color: rgba(#000000, 0.6) !important;
          }
        }
        &.v-list-item--active {
          .v-list-item__content {
            .v-list-item__title {
              color: #000000 !important;
            }
          }
        }
      }
    }
  }
}

.v-text-field--solo,
.v-text-field--outlined {
  border-radius: 0px;

  &.v-input--is-focused,
  &.error--text {
    fieldset {
      border: 1px solid currentColor;
    }
  }
}
.v-text-field--solo.v-input--dense {
  .v-input__control {
    min-height: 32px;
  }
}

.v-input--switch__thumb {
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2),
    0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12) !important;
}

.datepicker {
  .v-input__control {
    min-height: 32px;

    .v-input__slot {
      padding: 0 0 0 12px !important;

      .v-input__append-inner {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin-top: 0 !important;
        width: 40px;
        height: 40px;
        cursor: pointer;

        &:hover {
          i {
            color: #000000;
          }
        }
      }
    }
  }
}

.v-list {
  .v-list-item__action:first-child,
  .v-list-item__icon:first-child {
    margin-right: 10px !important;
  }
}
</style>
