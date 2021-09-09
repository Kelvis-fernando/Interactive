<template>
  <div class="companies">
    <div v-if="isLoading" class="loading-company">
      <v-progress-circular
        color="#fa4600"
        :width="3"
        :size="40"
        indeterminate
      />

      <div class="message">
        {{ `${$t('welcome')} ${user ? user.first_name : ''}` }}
      </div>
    </div>

    <div v-else :class="['content', hasAlert && 'has-alert']">
      <div class="title-header">
        {{ $t('chooseCompany.title') }}
      </div>

      <div
        :class="[
          'box-companies',
          companies.length <= screenFit ? 'static' : '',
        ]"
      >
        <div
          v-if="companies.length > screenFit"
          :class="['btn-prev', slidePosition === 0 ? 'disabled' : '']"
          @click="prevCompany"
        >
          <v-icon class="icon" size="56">hi-keyboard-arrow-left</v-icon>
        </div>

        <div
          :class="[
            'list-companies',
            companies.length <= screenFit ? 'static' : 'slide',
          ]"
          :style="`transform: translateX(${
            companies.length <= screenFit ? 0 : slidePosition
          }px)`"
        >
          <div
            v-for="company in companies"
            :key="company.id"
            class="card-company"
            @click="chooseCompany(company)"
          >
            <div class="image">
              <img v-if="company.logo" class="preview" :src="company.logo" />
              <v-icon v-else size="56" color="#00000033">hi-company</v-icon>
            </div>
            <div class="company-name">{{ company.REFERENCE }}</div>
            <div class="location">{{ company.location }}</div>
          </div>
        </div>

        <div
          v-if="companies.length > screenFit"
          :class="['btn-next', slidePosition <= slideWidth ? 'disabled' : '']"
          @click="nextCompany"
        >
          <v-icon class="icon" size="56">hi-keyboard-arrow-right</v-icon>
        </div>
      </div>

      <v-btn class="actions" depressed text to="/companies/create-company">
        <v-icon class="icon" color="#fa4600">hi-add-circle</v-icon>
        {{ $t('chooseCompany.action') }}
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Action, Getter, Mutation } from 'vuex-class';

import { ICompany } from '@/store/modules/companies';
import { IUser } from '@/store/modules/user';

@Component
export default class ChooseCompany extends Vue {
  private screenFit = Math.round((window.innerWidth - 360) / 268);
  private slidePosition = 0;
  private slideWidth = 0;

  get hasAlert(): boolean {
    return !!this.alertMessage;
  }

  @Getter('system/isLoading')
  private isLoading!: boolean;

  @Getter('user/profile')
  private user!: IUser;

  @Getter('system/alert')
  private alertMessage!: string;

  @Getter('companies/list')
  private companies!: ICompany[];

  @Mutation('system/setLoading')
  private setLoading!: (data: boolean) => void;

  @Mutation('system/setMenuOpen')
  private setMenuOpen!: (data: boolean) => void;

  @Mutation('auth/destroySession')
  private signOut!: () => void;

  @Action('companies/show')
  private setCompany!: (data: ICompany) => void;

  @Action('companies/getCompanies')
  private getCompanies!: () => Promise<ICompany[]>;

  destroyed(): void {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('wheel', this.onScroll);
  }

  mounted(): void {
    this.setLoading(true);

    this.$log.debug(`Getting companies`);

    this.getCompanies()
      .then(() => {
        this.setLoading(false);
        this.onResize();
        window.addEventListener('resize', this.onResize);
        window.addEventListener('wheel', this.onScroll);

        if (this.companies.length < 1) {
          return this.$router.push('/companies/create-company');
        }

        if (this.companies.length === 1) {
          this.chooseCompany(this.companies[0]);
        }
      })
      .catch(() => {
        this.setLoading(false);
        setTimeout(this.signOut, 3000);
      });
  }

  chooseCompany(company: ICompany): void {
    this.$log.debug(`company selected ${company.REFERENCE}`);
    this.setCompany(company);
    this.setMenuOpen(true);
  }

  prevCompany(): void {
    this.slidePosition += 268;
  }

  nextCompany(): void {
    this.slidePosition -= 268;
  }

  onResize(): void {
    this.screenFit = Math.round((window.innerWidth - 360) / 268);
    this.slideWidth = -268 * (this.companies.length - this.screenFit);
    this.companies.length - (this.slidePosition / 268) * -1 <= this.screenFit &&
      (this.slidePosition = (this.companies.length - this.screenFit) * -268);
  }

  onScroll(e: WheelEvent): void {
    e.stopPropagation();
    if (e.deltaY > 0 || e.deltaX > 0) {
      if (this.slidePosition > this.slideWidth) this.nextCompany();
      return;
    }
    if (this.slidePosition !== 0) this.prevCompany();
  }
}
</script>

<style lang="scss" scoped>
.companies {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .loading-company {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 48px);

    .message {
      margin-top: 30px;
      color: #000000;
      font-size: 2.2em;
      font-weight: 500;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    width: 100%;
    height: calc(100vh - 48px);

    &.has-alert {
      height: calc(100vh - 84px);
    }

    .title-header {
      position: relative;
      font-size: 2.8em;
      font-weight: 300;
    }

    .box-companies.static {
      padding: 0;
    }

    .box-companies {
      position: relative;
      padding: 0 155px;
      width: 100%;
      height: 200px;
      z-index: 1;

      .btn-prev.disabled,
      .btn-next.disabled {
        cursor: default;
        pointer-events: none;
      }

      .btn-prev.disabled .icon,
      .btn-next.disabled .icon {
        color: rgba(#000000, 0.1);
      }

      .btn-prev,
      .btn-next {
        position: absolute;
        min-height: 100%;
        height: 100%;
        width: 180px;
        z-index: 10000;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .icon {
          color: #000000;
        }
      }
      .btn-prev {
        left: 0px;
        background-image: linear-gradient(
          to left,
          transparent,
          rgba(240, 240, 240, 0.3),
          rgba(240, 240, 240, 1)
        );
      }
      .btn-next {
        right: 0px;
        background-image: linear-gradient(
          to right,
          transparent,
          rgba(240, 240, 240, 0.3),
          rgba(240, 240, 240, 1)
        );
      }

      .list-companies {
        position: absolute;
        height: 100%;
        display: flex;
        flex-direction: row;
        box-sizing: content-box;

        &.static {
          width: 100%;
          justify-content: center;
        }

        &.slide {
          transition-duration: 100ms;
          transition-property: transform;
        }

        .card-company {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          margin: 0 40px;
          width: 188px;
          height: 100%;
          cursor: pointer;

          .company-name {
            margin-top: 20px;
            color: #000000;
            font-size: 1.6em;
            font-weight: 500;
          }

          .location {
            color: rgba(#000000, 0.3);
          }

          .image {
            position: relative;
            display: flex;
            justify-content: center;
            width: 112px;
            height: 112px;
            border-radius: 50%;
            border: none;
            background: #e6e6e6;

            .image-preview {
              position: absolute;
              top: 0;
              height: 100%;
              width: 100%;
              border-radius: 50%;
              background: transparent;
            }
          }
        }
      }
    }
  }
  .actions {
    .icon {
      margin-right: 8px;
    }
  }
}
</style>
