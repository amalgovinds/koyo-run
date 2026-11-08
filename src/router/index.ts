import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', redirect: '/today' },
    { path: '/flights', name: 'flights', component: () => import('@/views/FlightsView.vue') },
    { path: '/journal', name: 'journal', component: () => import('@/views/JournalView.vue') },
    { path: '/map', name: 'map', component: () => import('@/views/MapView.vue') },
    { path: '/stays', name: 'stays', component: () => import('@/views/StaysView.vue') },
    { path: '/tickets', name: 'tickets', component: () => import('@/views/TicketsView.vue') },
    { path: '/today', name: 'today', component: () => import('@/views/TodayView.vue') },
    { path: '/trains', name: 'trains', component: () => import('@/views/TrainsView.vue') },
  ],
})

export default router
