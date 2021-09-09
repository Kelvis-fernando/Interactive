<template>
  <div class="overview">
    <h-header-content
      :path-from="$t('menus.DataAnalytics.name')"
      :path-title="$t('overview.title')"
    />

    <div class="box-content">
      <div class="content">
        <div class="cards-number">
          <div class="card-number">
            <div class="card-title">
              {{ $t('overview.cards.databaseContacts') }}
            </div>
            <div class="card-value">132.322</div>
            <div class="card-stats">
              <v-icon color="#2EC871" size="16">hi-arrow-increase</v-icon>
              1.342 new identified users
            </div>
          </div>

          <div class="card-number">
            <div class="card-title">
              {{ $t('overview.cards.identifiedContacts') }}
            </div>
            <div class="card-value">30.351</div>
            <div class="card-stats">
              <v-icon color="#2EC871" size="16">hi-arrow-increase</v-icon>
              1.342 new users
            </div>
          </div>

          <div class="card-number">
            <div class="card-title">
              {{ $t('overview.cards.capturedDevices') }}
            </div>
            <div class="card-value">500.000</div>
            <div class="card-stats">
              <v-icon color="#2EC871" size="16">hi-arrow-increase</v-icon>
              300 new devices
            </div>
          </div>
        </div>

        <div class="card-bar-chart">
          <div class="card-title">
            {{ $t('overview.cards.behaviors') }}
          </div>
          <div class="card-chart">
            <h-vertical-bar-chart
              :chart-data="behaviors"
              :options="{
                plugins: {
                  tooltip: {
                    mode: 'point',
                    intersect: true,
                  },
                },
                scales: {
                  x: {
                    type: 'time',
                    time: {
                      tooltipFormat: 'MMM',
                      displayFormats: {
                        month: 'MMM',
                      },
                      minUnit: 'month',
                    },
                    offset: true,
                    stacked: true,
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    stacked: true,
                    grid: {
                      display: false,
                    },
                  },
                },
              }"
            />
          </div>
        </div>

        <div class="cards-accepts">
          <div class="card-accept">
            <div class="card-chart">
              <h-doughnut-chart
                :chart-data="optIns.email"
                :options="doughnutOpts"
              />

              <div class="card-percentual">
                {{ `${Math.round((16 / 100) * 100)}%` }}
              </div>
            </div>

            <div class="card-value">
              <div class="card-title">Email</div>
              <div class="card-subtitle">Opt-ins</div>
            </div>
          </div>

          <div class="card-accept">
            <div class="card-chart">
              <h-doughnut-chart
                :chart-data="optIns.sms"
                :options="doughnutOpts"
              />

              <div class="card-percentual">
                {{ `${Math.round((20 / 100) * 100)}%` }}
              </div>
            </div>

            <div class="card-value">
              <div class="card-title">Sms</div>
              <div class="card-subtitle">Opt-ins</div>
            </div>
          </div>

          <div class="card-accept">
            <div class="card-chart">
              <h-doughnut-chart
                :chart-data="optIns.push"
                :options="doughnutOpts"
              />

              <div class="card-percentual">
                {{ `${Math.round((47 / 100) * 100)}%` }}
              </div>
            </div>

            <div class="card-value">
              <div class="card-title">Push</div>
              <div class="card-subtitle">Opt-ins</div>
            </div>
          </div>

          <div class="card-accept">
            <div class="card-chart">
              <h-doughnut-chart
                :chart-data="optIns.omni"
                :options="doughnutOpts"
              />

              <div class="card-percentual">
                {{ `${Math.round((8 / 100) * 100)}%` }}
              </div>
            </div>

            <div class="card-value">
              <div class="card-title">Omni</div>
              <div class="card-subtitle">Opt-ins</div>
            </div>
          </div>
        </div>

        <div class="cards-top">
          <div class="card-top">
            <div class="card-title">Top Lead Sources</div>

            <div class="card-table">
              <v-list>
                <v-list-item v-for="(item, i) in topLeadSources" :key="i">
                  <div class="top-list-position">
                    {{ i + 1 }}
                  </div>

                  <v-list-item-title>
                    <v-icon v-if="item.icon" size="21" color="#000000">
                      {{ item.icon }}
                    </v-icon>
                    {{ item.name }}
                  </v-list-item-title>

                  <v-list-item-action>
                    {{ item.value }}
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </div>
          </div>

          <div class="card-top">
            <div class="card-title">Top Lead Sources</div>

            <div class="card-table">
              <v-list>
                <v-list-item v-for="(item, i) in topForms" :key="i">
                  <div class="top-list-position">
                    {{ i + 1 }}
                  </div>

                  <v-list-item-title>
                    <v-icon v-if="item.icon" size="21" color="#000000">
                      {{ item.icon }}
                    </v-icon>
                    {{ item.name }}
                  </v-list-item-title>

                  <v-list-item-action>
                    {{ item.value }}
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </div>
          </div>

          <div class="card-top">
            <div class="card-title">Top Lead Sources</div>

            <div class="card-table">
              <v-list>
                <v-list-item v-for="(item, i) in topLeadSources" :key="i">
                  <div class="top-list-position">
                    {{ i + 1 }}
                  </div>

                  <v-list-item-title>
                    <v-icon v-if="item.icon" size="21" color="#000000">
                      {{ item.icon }}
                    </v-icon>
                    {{ item.name }}
                  </v-list-item-title>

                  <v-list-item-action>
                    {{ item.value }}
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </div>
          </div>
        </div>

        <div class="cards-top" style="margin-top: 24px">
          <div class="card-top">
            <div class="card-title">Top Lead Sources</div>

            <div class="card-table">
              <v-list>
                <v-list-item v-for="(item, i) in topForms" :key="i">
                  <div class="top-list-position">
                    {{ i + 1 }}
                  </div>

                  <v-list-item-title>
                    <v-icon v-if="item.icon" size="21" color="#000000">
                      {{ item.icon }}
                    </v-icon>
                    {{ item.name }}
                  </v-list-item-title>

                  <v-list-item-action>
                    {{ item.value }}
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </div>
          </div>

          <div class="card-top">
            <div class="card-title">Top Lead Sources</div>

            <div class="card-table">
              <v-list>
                <v-list-item v-for="(item, i) in topLeadSources" :key="i">
                  <div class="top-list-position">
                    {{ i + 1 }}
                  </div>

                  <v-list-item-title>
                    <v-icon v-if="item.icon" size="21" color="#000000">
                      {{ item.icon }}
                    </v-icon>
                    {{ item.name }}
                  </v-list-item-title>

                  <v-list-item-action>
                    {{ item.value }}
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </div>
          </div>

          <div class="card-top">
            <div class="card-title">Top Lead Sources</div>

            <div class="card-table">
              <v-list>
                <v-list-item v-for="(item, i) in topForms" :key="i">
                  <div class="top-list-position">
                    {{ i + 1 }}
                  </div>

                  <v-list-item-title>
                    <v-icon v-if="item.icon" size="21" color="#000000">
                      {{ item.icon }}
                    </v-icon>
                    {{ item.name }}
                  </v-list-item-title>

                  <v-list-item-action>
                    {{ item.value }}
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Overview extends Vue {
  private doughnutOpts = {
    plugins: {
      tooltip: {
        enabled: false,
      },
    },
    cutout: '70%',
    rotation: 270,
    circumference: 180,
  };

  private optIns = {
    email: {
      labels: [],
      datasets: [
        {
          data: [16, 84],
          backgroundColor: ['#4b8dff', '#e5e5e5'],
        },
      ],
    },
    sms: {
      labels: [],
      datasets: [
        {
          data: [20, 80],
          backgroundColor: ['#4b8dff', '#e5e5e5'],
        },
      ],
    },
    push: {
      labels: [],
      datasets: [
        {
          data: [47, 53],
          backgroundColor: ['#4b8dff', '#e5e5e5'],
        },
      ],
    },
    omni: {
      labels: [],
      datasets: [
        {
          data: [8, 92],
          backgroundColor: ['#4b8dff', '#e5e5e5'],
        },
      ],
    },
  };

  private behaviors = {
    labels: [
      new Date('2021-01-01 00:00:00'),
      new Date('2021-02-01 00:00:00'),
      new Date('2021-03-01 00:00:00'),
      new Date('2021-04-01 00:00:00'),
      new Date('2021-05-01 00:00:00'),
      new Date('2021-06-01 00:00:00'),
      new Date('2021-07-01 00:00:00'),
      new Date('2021-08-01 00:00:00'),
      new Date('2021-09-01 00:00:00'),
      new Date('2021-10-01 00:00:00'),
      new Date('2021-11-01 00:00:00'),
      new Date('2021-12-01 00:00:00'),
    ],

    datasets: [
      {
        backgroundColor: '#435591',
        barPercentage: 0.5,
        label: 'Behavior 1',
        data: [
          {
            x: new Date('2021-01-01 00:00:00'),
            y: 20007,
          },
          {
            x: new Date('2021-02-01 00:00:00'),
            y: 63006,
          },
          {
            x: new Date('2021-03-01 00:00:00'),
            y: 32003,
          },
          {
            x: new Date('2021-04-01 00:00:00'),
            y: 78010,
          },
          {
            x: new Date('2021-05-01 00:00:00'),
            y: 23020,
          },
          {
            x: new Date('2021-06-01 00:00:00'),
            y: 44010,
          },
          {
            x: new Date('2021-07-01 00:00:00'),
            y: 50062,
          },
          {
            x: new Date('2021-08-01 00:00:00'),
            y: 44040,
          },
          {
            x: new Date('2021-09-01 00:00:00'),
            y: 28400,
          },
          {
            x: new Date('2021-10-01 00:00:00'),
            y: 36001,
          },
          {
            x: new Date('2021-11-01 00:00:00'),
            y: 49006,
          },
          {
            x: new Date('2021-12-01 00:00:00'),
            y: 84009,
          },
        ],
      },
      {
        backgroundColor: '#3ca1e3',
        barPercentage: 0.5,
        label: 'Behavior 2',
        data: [
          {
            x: new Date('2021-01-01 00:00:00'),
            y: 42030,
          },
          {
            x: new Date('2021-02-01 00:00:00'),
            y: 40320,
          },
          {
            x: new Date('2021-03-01 00:00:00'),
            y: 20010,
          },
          {
            x: new Date('2021-04-01 00:00:00'),
            y: 80020,
          },
          {
            x: new Date('2021-05-01 00:00:00'),
            y: 50073,
          },
          {
            x: new Date('2021-06-01 00:00:00'),
            y: 53600,
          },
          {
            x: new Date('2021-07-01 00:00:00'),
            y: 35200,
          },
          {
            x: new Date('2021-08-01 00:00:00'),
            y: 12003,
          },
          {
            x: new Date('2021-09-01 00:00:00'),
            y: 76040,
          },
          {
            x: new Date('2021-10-01 00:00:00'),
            y: 14032,
          },
          {
            x: new Date('2021-11-01 00:00:00'),
            y: 11520,
          },
          {
            x: new Date('2021-12-01 00:00:00'),
            y: 89010,
          },
        ],
      },
      {
        backgroundColor: '#fa4616',
        barPercentage: 0.5,
        label: 'Behavior 3',
        data: [
          {
            x: new Date('2021-01-01 00:00:00'),
            y: 76100,
          },
          {
            x: new Date('2021-02-01 00:00:00'),
            y: 62002,
          },
          {
            x: new Date('2021-03-01 00:00:00'),
            y: 20043,
          },
          {
            x: new Date('2021-04-01 00:00:00'),
            y: 65030,
          },
          {
            x: new Date('2021-05-01 00:00:00'),
            y: 90230,
          },
          {
            x: new Date('2021-06-01 00:00:00'),
            y: 25100,
          },
          {
            x: new Date('2021-07-01 00:00:00'),
            y: 45100,
          },
          {
            x: new Date('2021-08-01 00:00:00'),
            y: 93200,
          },
          {
            x: new Date('2021-09-01 00:00:00'),
            y: 10600,
          },
          {
            x: new Date('2021-10-01 00:00:00'),
            y: 12200,
          },
          {
            x: new Date('2021-11-01 00:00:00'),
            y: 40045,
          },
          {
            x: new Date('2021-12-01 00:00:00'),
            y: 50069,
          },
        ],
      },
      {
        backgroundColor: '#ffb610',
        barPercentage: 0.5,
        label: 'Behavior 4',
        data: [
          {
            x: new Date('2021-01-01 00:00:00'),
            y: 26080,
          },
          {
            x: new Date('2021-02-01 00:00:00'),
            y: 40703,
          },
          {
            x: new Date('2021-03-01 00:00:00'),
            y: 52600,
          },
          {
            x: new Date('2021-04-01 00:00:00'),
            y: 65300,
          },
          {
            x: new Date('2021-05-01 00:00:00'),
            y: 90020,
          },
          {
            x: new Date('2021-06-01 00:00:00'),
            y: 25005,
          },
          {
            x: new Date('2021-07-01 00:00:00'),
            y: 85500,
          },
          {
            x: new Date('2021-08-01 00:00:00'),
            y: 83004,
          },
          {
            x: new Date('2021-09-01 00:00:00'),
            y: 96030,
          },
          {
            x: new Date('2021-10-01 00:00:00'),
            y: 90030,
          },
          {
            x: new Date('2021-11-01 00:00:00'),
            y: 75200,
          },
          {
            x: new Date('2021-12-01 00:00:00'),
            y: 10019,
          },
        ],
      },
      {
        backgroundColor: '#00b592',
        barPercentage: 0.5,
        label: 'Behavior 5',
        data: [
          {
            x: new Date('2021-01-01 00:00:00'),
            y: 87600,
          },
          {
            x: new Date('2021-02-01 00:00:00'),
            y: 80050,
          },
          {
            x: new Date('2021-03-01 00:00:00'),
            y: 23060,
          },
          {
            x: new Date('2021-04-01 00:00:00'),
            y: 0,
          },
          {
            x: new Date('2021-05-01 00:00:00'),
            y: 56030,
          },
          {
            x: new Date('2021-06-01 00:00:00'),
            y: 30038,
          },
          {
            x: new Date('2021-07-01 00:00:00'),
            y: 35030,
          },
          {
            x: new Date('2021-08-01 00:00:00'),
            y: 10303,
          },
          {
            x: new Date('2021-09-01 00:00:00'),
            y: 56300,
          },
          {
            x: new Date('2021-10-01 00:00:00'),
            y: 40300,
          },
          {
            x: new Date('2021-11-01 00:00:00'),
            y: 30052,
          },
          {
            x: new Date('2021-12-01 00:00:00'),
            y: 20039,
          },
        ],
      },
      {
        backgroundColor: '#ac61d4',
        barPercentage: 0.5,
        label: 'Behavior 6',
        data: [
          {
            x: new Date('2021-01-01 00:00:00'),
            y: 20030,
          },
          {
            x: new Date('2021-02-01 00:00:00'),
            y: 60023,
          },
          {
            x: new Date('2021-03-01 00:00:00'),
            y: 32005,
          },
          {
            x: new Date('2021-04-01 00:00:00'),
            y: 70084,
          },
          {
            x: new Date('2021-05-01 00:00:00'),
            y: 23001,
          },
          {
            x: new Date('2021-06-01 00:00:00'),
            y: 40043,
          },
          {
            x: new Date('2021-07-01 00:00:00'),
            y: 90062,
          },
          {
            x: new Date('2021-08-01 00:00:00'),
            y: 40043,
          },
          {
            x: new Date('2021-09-01 00:00:00'),
            y: 28004,
          },
          {
            x: new Date('2021-10-01 00:00:00'),
            y: 60015,
          },
          {
            x: new Date('2021-11-01 00:00:00'),
            y: 96006,
          },
          {
            x: new Date('2021-12-01 00:00:00'),
            y: 89007,
          },
        ],
      },
    ],
  };

  private topLeadSources = [
    {
      icon: 'hi-desktop',
      name: 'Website',
      value: 5657,
    },
    {
      icon: 'hi-mobile',
      name: 'Mobile',
      value: 5657,
    },
    {
      icon: 'hi-tablet',
      name: 'Facebook',
      value: 5657,
    },
    {
      icon: 'hi-tablet',
      name: 'Twitter',
      value: 5657,
    },
    {
      icon: 'hi-import',
      name: 'Import',
      value: 5657,
    },
  ];

  private topForms = [
    {
      name: 'Meus Dados',
      value: 5657,
    },
    {
      name: 'Perfil Econônico',
      value: 5657,
    },
    {
      name: 'Newsletter',
      value: 5657,
    },
    {
      name: 'Form 4',
      value: 5657,
    },
    {
      name: 'Form 5',
      value: 5657,
    },
  ];
}
</script>

<style lang="scss">
.overview {
  .content {
    .cards-number {
      display: flex;
      margin-bottom: 14px;

      .card-number {
        width: 100%;
        padding: 20px 24px;
        background: #fff;

        &:not(:first-child) {
          margin-left: 14px;
        }

        .card-title {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 1.2em;
          font-weight: 400;
          color: #000000;

          i {
            margin-left: 8px;
            margin-bottom: 4px;
          }
        }

        .card-value {
          overflow: hidden;
          white-space: nowrap;
          margin-top: 12px;
          font-size: 3.5em;
          font-weight: 600;
          color: #000000;
        }

        .card-stats {
          font-size: 1.2em;
          color: rgba(#000000, 0.6);
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }

    .card-bar-chart {
      margin-bottom: 14px;
      background: #ffffff;

      .card-title {
        padding: 16px 24px;
        font-size: 1.4em;
        font-weight: 600;
        line-height: 0;
        color: #000000;
        border-bottom: 1px solid rgba(#000, 0.1);
      }

      .card-chart {
        position: relative;
        padding: 30px 24px 20px;
        width: 100%;
      }
    }

    .cards-accepts {
      display: flex;
      margin-bottom: 14px;

      .card-accept {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        padding: 4px 24px;
        background: #fff;

        &:not(:first-child) {
          margin-left: 24px;
        }

        .card-chart {
          position: relative;
          width: 100px;

          .card-percentual {
            position: absolute;
            left: 0;
            bottom: 18px;
            width: 100%;
            display: flex;
            justify-content: center;
            font-size: 1.8em;
            font-weight: 600;
            color: #000000;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }

        .card-value {
          margin-left: 24px;

          .card-title {
            font-size: 1.8em;
            font-weight: 600;
            color: #000000;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .card-subtitle {
            font-size: 1.2em;
            font-weight: 400;
            color: rgba(#000000, 0.6);
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }
    }

    .cards-top {
      display: flex;

      .card-top {
        width: 100%;
        background: #fff;

        &:not(:first-child) {
          margin-left: 24px;
        }

        .card-title {
          padding: 16px 24px;
          font-size: 1.4em;
          font-weight: 600;
          line-height: 0;
          color: #000000;
          border-bottom: 1px solid rgba(#000, 0.1);
        }

        .card-table {
          .v-list {
            .v-list-item {
              padding: 0 24px;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: center;

              &:first-child {
                background: #fafafa;
              }

              &:hover {
                .top-list-position,
                .v-list-item__title,
                .v-list-item__action {
                  color: #000000;
                }
              }

              .top-list-position {
                width: 12px;
                font-size: 2em;
                font-weight: 600;
                color: #000000c1;
                cursor: default;
              }
              .v-list-item__title {
                font-size: 1.2em;
                margin-left: 16px;
                color: #000000c1;
                cursor: default;

                i {
                  margin: 0 16px 4px 0;
                }
              }

              .v-list-item__action {
                padding-right: 8px;
                font-size: 1.4em;
                font-weight: 500;
                color: #000000c1;
              }
            }
          }
        }
      }
    }
  }
}
</style>
