import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'play',
      component: () => import(/* webpackChunkName: "play" */ './vue-views/Play.vue'),
    },
    {
      path: '/edit',
      name: 'edit',
      component: () => import(/* webpackChunkName: "edit" */ './vue-views/Edit.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ './vue-views/About.vue'),
    },
  ],
});
