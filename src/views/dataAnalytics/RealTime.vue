<template>
  <div>
    <h-header-content
      :path-from="$t('menus.DataAnalytics.name')"
      :path-title="$t('menus.DataAnalytics.children.RealTime')"
    />
    <div class="box-content">
      <div ref="cardChart" class="real-time">
        <!-- {{ `id ${online.identifieds} an: ${online.anonymous}` }} -->
        <div class="card-bar-chart">
          <div class="card-chart">
            <h-streaming-bar-chart
              :chart-data="{
                labels: [],
                datasets: [],
              }"
              :event="event"
              :height="cardHeight"
              @change-company="connectStream"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import io, { Socket } from 'socket.io-client';
import { Getter } from 'vuex-class';

import { ICompany } from '@/store/modules/companies';
import { IUserLogged } from '@/store/modules/user';

@Component
export default class RealTime extends Vue {
  private socket?: Socket = undefined;
  private event = {};
  private cardHeight = 340;
  private online = {
    identifieds: 0,
    anonymous: 0,
  };

  @Getter('companies/current')
  private company!: ICompany;

  @Getter('user/profile')
  private user!: IUserLogged;

  beforeDestroy(): void {
    this.$log.debug('disconnect stream');
    if (this.socket) this.socket.disconnect();
    window.removeEventListener('resize', this.onWindowResize);
  }

  mounted(): void {
    this.onWindowResize();
    window.addEventListener('resize', this.onWindowResize);
    this.connectStream();
  }

  connectStream(): void {
    if (!process.env.VUE_APP_IDEXCHANGE_URL) return;

    this.$log.debug('connect stream');
    if (this.socket) this.socket.disconnect();

    this.socket = io(process.env.VUE_APP_IDEXCHANGE_URL, {
      transports: ['websocket'],
      query: {
        huid: this.user.huid,
        cid: this.company.CID,
      },
    });

    this.socket.on('online', event => {
      const data = JSON.parse(event);
      this.online.identifieds = data.identifieds ? data.identifieds.total : 0;
      this.online.anonymous = data.anonymous ? data.anonymous.total : 0;
    });

    this.socket.on('event', event => {
      const { EVENTTYPE, TIMESTAMP } = JSON.parse(event);
      if (EVENTTYPE) {
        this.event = {
          label: EVENTTYPE,
          timestamp: TIMESTAMP,
          event: JSON.parse(event),
        };
      }
    });
  }

  onWindowResize(): void {
    this.cardHeight = (this.$refs.cardChart as Element).clientHeight - 58;
  }
}
</script>

<style lang="scss">
.real-time {
  width: 100%;
  height: calc(100vh - 252px);
  background: #ffffff;

  .card-bar-chart {
    .card-chart {
      position: relative;
      padding: 36px 30px 30px;
      width: 100%;
    }
  }
}
</style>
