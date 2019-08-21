
import Vue from 'vue'

// Components
import './components'

// Plugins
import './plugins'

// Sync router with store
import { sync } from 'vuex-router-sync'

// Application imports
import App from './App'
import i18n from '@/i18n'
import router from '@/router'
import store from '@/store'
import firebase from 'firebase'
import VImageInput from 'vuetify-image-input'

const firebaseConfig = {
  apiKey: 'AIzaSyDk2IGa9mkv3tW0KHpBC3VSOWILyee2AuQ',
  authDomain: 'attendedsystem.firebaseapp.com',
  databaseURL: 'https://attendedsystem.firebaseio.com',
  projectId: 'attendedsystem',
  storageBucket: 'attendedsystem.appspot.com',
  messagingSenderId: '447212926331',
  appId: '1:447212926331:web:ec721171e863d72d'
}

firebase.initializeApp(firebaseConfig)
// Sync store with router
sync(store, router)

Vue.config.productionTip = true
Vue.component(VImageInput.name, VImageInput)
/* eslint-disable no-new */
new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
