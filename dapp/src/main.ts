import { createApp } from 'vue'
import { store, key } from './store'
import router from './router'
import App from './App.vue'

import './assets/style/index.scss'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap'

const app = createApp(App)

app.use(store, key)
app.use(router)

app.mount('#app')
