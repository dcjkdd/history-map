import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import './styles/main.css'
import './styles/map.css'

createApp(App).use(createPinia()).mount('#app')
