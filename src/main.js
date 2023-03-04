import Vue from "vue"
import singleSpaVue from "single-spa-vue"

import App from "./App.vue"
import router from "./router"
import store from "./store"
import { Toast, IconMask } from "@smit/shared"

Vue.config.productionTip = false
Vue.use(Toast)
Vue.component("IconMask", IconMask)

const vueLifecycles = singleSpaVue({
    Vue,
    appOptions: {
        render(h) {
            Vue.prototype.adscheck = this.adscheck
            Vue.prototype.eventBus = this.eventBus
            store.adscheck = this.adscheck
            return h(App, {})
        },
        router,
        store
    }
})

export const bootstrap = vueLifecycles.bootstrap
export const mount = vueLifecycles.mount
export const unmount = vueLifecycles.unmount
