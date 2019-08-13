/*!

=========================================================
* Vuetify Material Dashboard - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/vuetify-material-dashboard
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/vuetify-material-dashboard/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
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
    apiKey: "AIzaSyDk2IGa9mkv3tW0KHpBC3VSOWILyee2AuQ",
    authDomain: "attendedsystem.firebaseapp.com",
    databaseURL: "https://attendedsystem.firebaseio.com",
    projectId: "attendedsystem",
    storageBucket: "attendedsystem.appspot.com",
    messagingSenderId: "447212926331",
    appId: "1:447212926331:web:ec721171e863d72d"
};

firebase.initializeApp(firebaseConfig)
// Sync store with router
sync(store, router)

Vue.config.productionTip = false
Vue.component(VImageInput.name, VImageInput)
/* eslint-disable no-new */
new Vue({
    i18n,
    router,
    store,
    render: h => h(App)
}).$mount('#app')
