import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'
import Landing from '@/views/Landing.vue'
import ThemesTest from '@/views/ThemesTest'

import User from '@/views/User/_id'
import UserIndex from '@/views/User'

import Flow from '@/views/Flow'

import SettingCreator from '../views/Setting/Creator'

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
  {
    path: '/themes-test',
    name: 'ThemesTest',
    component: ThemesTest
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
    path: '/setting/creator',
    name: 'Setting-Creator',
    component: SettingCreator
  },
  {
    path: '/flow',
    name: 'Flow',
    component: Flow
  }
]

const router = new VueRouter({
  routes
})

export default router
