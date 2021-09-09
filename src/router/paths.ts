export interface Path {
  name: string;
  path: string;
  component: string;
  meta?: Record<string, boolean>;
  children?: Path[];
}

const paths: Path[] = [
  {
    name: 'public',
    path: '/',
    component: '/layouts/Public',
    children: [
      {
        name: 'emailUnsubscription',
        path: '/email/unsubscribe',
        component: '/customerEngagement/email/Unsubscribe',
        meta: {
          guest: true,
          public: true,
        },
      },
    ],
  },

  /* AUTH */
  {
    name: 'auth',
    path: '/auth',
    component: '/layouts/LoginSide',
    children: [
      /* LOGIN */
      {
        name: 'login',
        path: 'login',
        component: '/auth/Login',
        meta: {
          guest: true,
        },
      },
      /* FORGOT PASSWORD */
      {
        name: 'forgotPassword',
        path: 'forgot-password',
        component: '/auth/ForgotPassword',
        meta: {
          guest: true,
        },
      },
    ],
  },
  {
    name: 'authSignup',
    path: '/auth',
    component: '/layouts/Auth',
    children: [
      /* SIGN UP */
      {
        name: 'signUp',
        path: 'sign-up',
        component: '/auth/SignUp',
        meta: {
          guest: true,
        },
      },
      /* VERIFY EMAIL */
      {
        name: 'verifyEmail',
        path: 'verify-email',
        component: '/auth/VerifyEmail',
        meta: {
          guest: true,
        },
      },
    ],
  },

  /* DEFAULT */
  {
    name: 'default',
    path: '/',
    component: '/layouts/Default',
    children: [
      /* COMPANIES */

      // Choose Company
      {
        name: 'chooseCompany',
        path: 'companies/choose-company',
        component: '/companies/ChooseCompany',
      },

      // Create Company
      {
        name: 'createCompany',
        path: 'companies/create-company',
        component: '/companies/CreateCompany',
      },

      // Company Settings
      {
        name: 'companySettings',
        path: 'companies/settings',
        component: '/companies/Settings',
      },
      /* DATA ANALYTICS */

      /* Overview */
      {
        name: 'overview',
        path: 'data-analytics/overview',
        component: '/dataAnalytics/Overview',
      },

      /* Real Time */
      {
        name: 'realTime',
        path: 'data-analytics/real-time',
        component: '/dataAnalytics/RealTime',
      },

      /* Target Audience */
      {
        name: 'targetAudience',
        path: 'data-analytics/target-audience',
        component: '/dataAnalytics/TargetAudience',
      },

      /* Dashboards */

      // list
      {
        name: 'dashboards',
        path: 'data-analytics/dashboards',
        component: '/dataAnalytics/dashboards/List',
      },

      // create
      {
        name: 'CreateDashboard',
        path: 'data-analytics/dashboards/view',
        component: '/dataAnalytics/dashboards/View',
      },

      // view
      {
        name: 'viewDashboards',
        path: 'data-analytics/dashboards/view/:ID',
        component: '/dataAnalytics/dashboards/View',
      },

      /* INFORMATION MANAGEMENT */

      /* Data Engineering */

      // list
      {
        name: 'dataEngineering',
        path: 'information-management/data-engineering',
        component: '/informationManagement/dataEngineering/List',
      },

      // create
      {
        name: 'createEngineering',
        path: 'information-management/data-engineering/view',
        component: '/informationManagement/dataEngineering/View',
      },

      // view
      {
        name: 'viewEngineering',
        path: 'information-management/data-engineering/view/:ID',
        component: '/informationManagement/dataEngineering/View',
      },

      /* Databases */

      // list
      {
        name: 'databases',
        path: 'information-management/databases',
        component: '/informationManagement/database/List',
      },

      // view
      {
        name: 'viewDatabase',
        path: 'information-management/databases/:ID',
        component: '/informationManagement/database/View',
      },

      /* Contact List */

      // list
      {
        name: 'contactLists',
        path: 'information-management/contact-lists',
        component: '/informationManagement/contactList/List',
      },

      // view
      {
        name: 'viewContactList',
        path: 'information-management/contact-lists/:ID',
        component: '/informationManagement/contactList/View',
      },
      /* Relational Table */

      // list
      {
        name: 'relationalTable',
        path: 'information-management/relational-tables',
        component: '/informationManagement/relationalTable/List',
      },

      // view
      {
        name: 'viewRelationalTable',
        path: 'information-management/relational-tables/:ID',
        component: '/informationManagement/relationalTable/View',
      },

      /* Segments */

      // list
      {
        name: 'segments',
        path: 'information-management/segments',
        component: '/informationManagement/segments/List',
      },

      // view
      {
        name: 'viewSegments',
        path: 'information-management/segments/:ID',
        component: '/informationManagement/segments/View',
      },

      /* Compliance */

      // list
      {
        name: 'compliance',
        path: 'information-management/compliance',
        component: '/informationManagement/compliance/List',
      },

      /* CUSTOMER ENGAGEMENT */

      /* websites */

      // list
      {
        name: 'websites',
        path: 'customer-engagement/websites',
        component: '/customerEngagement/web/List',
      },

      // view
      {
        name: 'viewWebsites',
        path: 'customer-engagement/websites/:ID',
        component: '/customerEngagement/web/View',
      },

      /* web - forms */

      // create
      {
        name: 'createWebForms',
        path: 'customer-engagement/websites/:DOMAIN_ID/forms',
        component: '/customerEngagement/web/Forms',
      },

      // view
      {
        name: 'viewWebForms',
        path: 'customer-engagement/websites/:DOMAIN_ID/forms/:ID',
        component: '/customerEngagement/web/Forms',
      },

      /* apps */

      // list
      {
        name: 'apps',
        path: 'customer-engagement/apps',
        component: '/customerEngagement/apps/List',
      },

      // view - configure platforms
      {
        name: 'viewApps',
        path: 'customer-engagement/apps/view/:ID',
        component: '/customerEngagement/apps/View',
      },

      /* email */

      // list
      {
        name: 'email',
        path: 'customer-engagement/email',
        component: '/customerEngagement/email/List',
      },

      // create
      {
        name: 'createEmail',
        path: 'customer-engagement/email/view',
        component: '/customerEngagement/email/View',
      },

      // view
      {
        name: 'viewEmail',
        path: 'customer-engagement/email/view/:ID',
        component: '/customerEngagement/email/View',
      },

      // create template
      {
        name: 'createEmailTemplate',
        path: 'customer-engagement/email/template',
        component: '/customerEngagement/email/EmailTemplate',
      },

      // view template
      {
        name: 'viewEmailTemplate',
        path: 'customer-engagement/email/template/:ID',
        component: '/customerEngagement/email/EmailTemplate',
      },

      // resume
      {
        name: 'resumeEmail',
        path: 'customer-engagement/email/resume/:ID',
        component: '/customerEngagement/email/Resume',
      },

      /* push */

      // list
      {
        name: 'push',
        path: 'customer-engagement/push',
        component: '/customerEngagement/push/List',
      },

      // create
      {
        name: 'createPush',
        path: 'customer-engagement/push/view',
        component: '/customerEngagement/push/View',
      },

      // view
      {
        name: 'viewPush',
        path: 'customer-engagement/push/view/:ID',
        component: '/customerEngagement/push/View',
      },

      // resume
      {
        name: 'resumePush',
        path: 'customer-engagement/push/resume/:ID',
        component: '/customerEngagement/push/Resume',
      },

      /* SMS */

      // list
      {
        name: 'sms',
        path: 'customer-engagement/sms',
        component: '/customerEngagement/sms/List',
      },

      // create
      {
        name: 'createSms',
        path: 'customer-engagement/sms/view',
        component: '/customerEngagement/sms/View',
      },

      // view
      {
        name: 'viewSms',
        path: 'customer-engagement/sms/view/:ID',
        component: '/customerEngagement/sms/View',
      },

      // resume
      {
        name: 'resumeSms',
        path: 'customer-engagement/sms/resume/:ID',
        component: '/customerEngagement/sms/Resume',
      },

      /* Experiments */

      // list
      {
        name: 'experiments',
        path: 'customer-engagement/experiments',
        component: '/customerEngagement/experiments/List',
      },

      // create
      {
        name: 'createExperiment',
        path: 'customer-engagement/experiments/view',
        component: '/customerEngagement/experiments/View',
      },

      // view
      {
        name: 'viewExperiment',
        path: 'customer-engagement/experiments/view/:ID',
        component: '/customerEngagement/experiments/View',
      },

      /* Automation */

      // list
      {
        name: 'automation',
        path: 'customer-engagement/automation',
        component: '/customerEngagement/automation/List',
      },

      // create
      {
        name: 'createAutomation',
        path: 'customer-engagement/automation/view',
        component: '/customerEngagement/automation/View',
      },

      // view
      {
        name: 'viewAutomation',
        path: 'customer-engagement/automation/view/:ID',
        component: '/customerEngagement/automation/View',
      },

      /* Personalization */

      // list
      {
        name: 'personalization',
        path: 'customer-engagement/personalization',
        component: '/customerEngagement/personalization/List',
      },

      // create
      {
        name: 'createPersonalization',
        path: 'customer-engagement/personalization/view',
        component: '/customerEngagement/personalization/View',
      },

      // view
      {
        name: 'viewPersonalization',
        path: 'customer-engagement/personalization/view/:ID',
        component: '/customerEngagement/personalization/View',
      },

      /* CONTENT MANAGER */

      /* Content Types */

      // list
      {
        name: 'contentTypes',
        path: 'content-manager/content-types',
        component: '/contentManager/contentTypes/List',
      },

      // view
      {
        name: 'viewContentTypes',
        path: 'content-manager/content-types/:ID',
        component: '/contentManager/contentTypes/View',
      },

      /* Groups */

      // list
      {
        name: 'groups',
        path: 'content-manager/groups',
        component: '/contentManager/groups/List',
      },

      // view
      {
        name: 'viewGroups',
        path: 'content-manager/groups/:ID',
        component: '/contentManager/groups/View',
      },

      /* Assets */

      // list
      {
        name: 'assets',
        path: 'content-manager/assets',
        component: '/contentManager/assets/List',
      },

      // view
      {
        name: 'viewAssets',
        path: 'content-manager/assets/:ID',
        component: '/contentManager/assets/View',
      },

      /* User */

      // settings
      {
        name: 'userSettings',
        path: 'user/settings',
        component: '/user/Settings',
      },
    ],
  },
];

export default paths;
