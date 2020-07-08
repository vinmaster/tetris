import Vue from 'vue';
import App from './App.vue';
import VueSocketIOExt from 'vue-socket.io-extended';
import SocketIO from 'socket.io-client';
import VueFilterDateFormat from '@vuejs-community/vue-filter-date-format';

Vue.config.productionTip = false;

// Dev
if (process.env.NODE_ENV === 'development') {
  Vue.use(VueSocketIOExt, SocketIO(':8000'));
} else {
  Vue.use(VueSocketIOExt, SocketIO());
}
Vue.use(VueFilterDateFormat);

const app = new Vue({
  render: (h) => h(App),
}).$mount('#app');
