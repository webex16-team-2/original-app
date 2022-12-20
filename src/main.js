import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import "./firebase.js"

import { library } from "@fortawesome/fontawesome-svg-core"
import { fas } from "@fortawesome/free-solid-svg-icons"
import { fab } from "@fortawesome/free-brands-svg-icons"
import { far } from "@fortawesome/free-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"

library.add(fas, far, fab)

createApp(App).component("fa", FontAwesomeIcon).use(router).mount("#app")
