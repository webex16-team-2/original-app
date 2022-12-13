import { createRouter, createWebHistory } from "vue-router"
import HomeView from "@/views/HomeView.vue"
import BaseBoard from "@/views/BaseBoard.vue"

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/match",
    name: "BaseBoard",
    component: BaseBoard,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
