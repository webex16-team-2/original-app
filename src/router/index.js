import { createRouter, createWebHistory } from "vue-router"
import HomeView from "@/views/HomeView.vue"
import BaseBoard from "@/views/BaseBoard.vue"
import RuleView from "@/views/RuleView.vue"
import RoomSelect from "@/views/RoomSelect.vue"


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
  {
    path: "/rule",
    name: "rule",
    component: RuleView,
  },
  {
    path: "/lobby",
    name: "lobby",
    component: RoomSelect,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
