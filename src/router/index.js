import VueRouter from 'vue-router'
import Vue from 'vue'
import App from '../App'
import NotFound from '../components/NotFound'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: App
    },
    {
      path: '/compare',
      redirect: '/'
    },
    {
      path: '/compare/:packageNames*',
      component: App
    },
    {
      path: '*',
      component: NotFound
    }
  ]
})
