import Vue from "vue"
import singleSpaVue from "single-spa-vue"

import App from "./App.vue"
import router from "./router"
import store from "./store"
import { Toast } from "@smit/shared"

Vue.config.productionTip = false
Vue.use(Toast)

const vueLifecycles = singleSpaVue({
    Vue,
    appOptions: {
        render(h) {
            return h(App, {
                props: {
                    facebook: this.facebook
                }
            })
        },
        router,
        store
    }
})

export const bootstrap = vueLifecycles.bootstrap
export const mount = vueLifecycles.mount
export const unmount = vueLifecycles.unmount
