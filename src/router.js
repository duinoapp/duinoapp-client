import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/code',
      name: 'code',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "code" */ './views/Code.vue'),
    },
    {
      path: '/tools',
      component: () => import(/* webpackChunkName "tools" */ './views/Tools.vue'),
      children: [
        {
          path: 'projects',
          name: 'projects',
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import(/* webpackChunkName: "projects" */ './views/tools/Projects.vue'),
        },
        {
          path: 'boards',
          name: 'boards',
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import(/* webpackChunkName: "boards" */ './views/tools/Boards.vue'),
        },
        {
          path: 'libraries',
          name: 'libraries',
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import(/* webpackChunkName: "libs" */ './views/tools/Libraries.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import(/* webpackChunkName: "settings" */ './views/tools/Settings.vue'),
        },
        {
          path: 'servers',
          name: 'servers',
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import(/* webpackChunkName: "servers" */ './views/tools/Servers.vue'),
        },
        {
          path: 'about',
          name: 'about',
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
        },
      ],
    },
  ],
});
