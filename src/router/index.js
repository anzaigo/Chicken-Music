import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { // 首页
    path: '/',
    name: 'home',
    redirect: '/recommend' // 重定向
  },
  { // 推荐
    path: '/recommend',
    name: 'Recommend',
    component: () => import(/* webpackChunkName: "recommend" */ '@/views/recommend'),
    children: [
      {
        path: ':id',
        component: () => import(/* webpackChunkName: "album" */'@/views/album')
      }
    ]
  },
  { // 歌手
    path: '/singer',
    name: 'Singer',
    component: () => import(/* webpackChunkName: "singer" */ '@/views/singer'),
    children: [
      {
        path: ':id',
        component: () => import(/* webpackChunkName: "singer-detail" */ '@/views/singer-detail')
      }
    ]
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
