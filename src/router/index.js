import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'
import Landing from '@/views/Landing.vue'
// import ThemesTest from '@/views/ThemesTest'

import User from '@/views/User/_id'
import UserIndex from '@/views/User'

import Order from '@/views/Order'
import StatisticsPanel from '@/views/StatisticsPanel.vue'

import SettingCreator from '../views/Setting/Creator'
import SettingToken from '../views/Setting/Token'

import Status from '../views/Status/_id'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: Landing
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  // {
  //   path: '/themes-test',
  //   name: 'ThemesTest',
  //   component: ThemesTest
  // },
  {
    path: '/order',
    name: 'Order',
    component: Order
  },
  {
    path: '/stats',
    name: 'StatisticsPanel',
    component: StatisticsPanel
  },
  {
    path: '/user/:id',
    component: User,
    children: [
      {
        path: '',
        name: 'User',
        component: UserIndex,
        props: true
      }
    ]
  },
  {
    path: '/@:shortname',
    component: User,
    children: [
      {
        path: '',
        name: 'Creator',
        component: UserIndex,
        props: true
      }
    ]
  },
  {
    path: '/setting/creator',
    name: 'Setting-Creator',
    component: SettingCreator
  },
  {
    path: '/setting/token',
    name: 'Setting-Token',
    component: SettingToken
  },
  {
    path: '/status/:id',
    name: 'Status',
    component: Status
  }
]

const router = new VueRouter({
  routes
})

router.afterEach((to, from, next) => {
  window.scrollTo(0, 0)
})

export default router
