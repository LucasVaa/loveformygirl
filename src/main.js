import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './assets/main.css'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import VueLazyload from 'vue-lazyload'

const app = createApp(App)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(VueLazyload, {
  preLoad: 1.3,
  loading: '/images/loading.svg',
  error: 'data:image/svg+xml;base64,PHN2ZyB0PSIxNjkwMjgyODk3NDg5IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjM2NTIiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNNTEyIDY0cTEzMiAwIDI0NCA2NnQxNzYgMTc2IDY2IDI0NC02NiAyNDQtMTc2IDE3NlQ1MTIgMTAzNHEtMTMyIDAtMjQ0LTY2VDkyIDc5MnQtNjYtMjQ0IDY2LTI0NCAxNzYtMTc2VDUxMiA2NHogbTAgODk2cTEwNCAwIDE5OS0zMHQxNzMtOTAgMTIwLTE1MiA0NC0xODgtNDQtMTg4LTEyMC0xNTItMTczLTkwLTE5OS0zMC0xOTkgMzAtMTczIDkwLTEyMCAxNTItNDQgMTg4IDQ0IDE4OCAxMjAgMTUyIDE3MyA5MCAxOTkgMzB6IiBmaWxsPSIjY2NjY2NjIiBwLWlkPSIzNjUzIj48L3BhdGg+PHBhdGggZD0iTTUxMiAzNTJxMTMgMCAyMi41IDkuNXQ5LjUgMjIuNXY0MzJxMCAxMy05LjUgMjIuNVQ1MTIgODQ4cS0xMyAwLTIyLjUtOS41VDQ4MCA4MTZWMzg0cTAtMTMgOS41LTIyLjVUNTEyIDM1MnpNNTEyIDE5MnExMyAwIDIyLjUgOS41dDkuNSAyMi41LTkuNSAyMi41VDUxMiAyNTZxLTEzIDAtMjIuNS05LjVUNDgwIDIyNHQ5LjUtMjIuNVQ1MTIgMTkyelxcXCIgZmlsbD1cXFwiI2NjY2NjY1xcXCIgcC1pZD1cXFwiMzY1NFxcXCI+PC9wYXRoPjwvc3ZnPg==',
  attempt: 1,
  lazyComponent: true
})
app.mount('#app')
