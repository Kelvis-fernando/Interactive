import Vue from 'vue';

const requireComponent = require.context('.', true, /\.vue$/);
requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName);
  const formattedName = fileName
    .replace(/(\.\/|\.vue)/g, '')
    .split('/')
    .pop();

  if (formattedName) {
    const componentName = `h-${formattedName
      .replace(/([a-zA-Z])(?=[A-Z])/g, '$1-')
      .toLowerCase()}`;
    Vue.component(componentName, componentConfig.default || componentConfig);
  }
});
