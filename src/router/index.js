import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import MemoryPage from '../views/MemoryPage.vue'
import LetterPage from '../views/LetterPage.vue'
import PhotoWall from '../views/PhotoWall.vue'
import MessageBoard from '../views/MessageBoard.vue'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/memory',
      name: 'memory',
      component: MemoryPage
    },
    {
      path: '/letter',
      name: 'letter',
      component: LetterPage
    },
    {
      path: '/photos',
      name: 'photos',
      component: PhotoWall
    },
    {
      path: '/messages',
      name: 'messages',
      component: MessageBoard
    }
  ]
})

export default router 