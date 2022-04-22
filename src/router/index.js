import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { // 推荐
    path: '/',
    name: 'home',
    redirect: '/recommend' // 重定向
  },
  { // 推荐
    path: '/recommend',
    name: 'Recommend',
    component: () => import(/* webpackChunkName: "recommend" */ '@/views/recommend')
  },
  { // 歌手
    path: '/singer',
    name: 'Singer',
    component: () => import(/* webpackChunkName: "singer" */ '@/views/singer')
  },
  { // 排行
    path: '/top-list',
    name: 'Top-list',
    component: () => import(/* webpackChunkName: "top-list" */ '@/views/top-list')
  },
  { // 搜索
    path: '/search',
    name: 'Search',
    component: () => import(/* webpackChunkName: "search" */ '@/views/search')
  }
]

const router = createRouter({
  history: createWebHashHistory(), // hash路由，这里可以切换history路由（createWebHistory）
  routes
})

export default router
