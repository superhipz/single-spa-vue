import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        step: 1,
        slide_name: "slide-left",
        features: {
            list: [],
            selected: [],
            selected_all: false
        },

        sessions: {
            list: [],
            selected: null,
            current: 5
        },

        check_bill: {
            show: false,
            status: "pending"
        },

        durations: {
            discount_all: null,
            first_list: [],
            list: [],
            selected: {}
        },

        pay_method: "banking",

        bank_selected: null,
        bank_message: null,

        voucher: {},

        export_invoice: false,
        invoice: {
            company_name: null,
            company_tax_code: null,
            company_address: null,
            company_email: null,
            company_phone: null,
            buyer_name: null
        },

        wallet: {
            show: false
        }
    },
    getters: {
        /* Giá nếu mua toàn bộ chức năng | Giảm 10% */
        allFeaturesPriceDiscounted(state) {
            let total_price = state.features.list.reduce((curr, item) => curr + item.price, 0)
            let discounted = (total_price * state.features.discount_all.percent) / 100
            return total_price - discounted
        },

        /* Giá nguyên bản của các chức năng đã chọn chưa giảm giá */
        originalSelectedFeaturePrice(state) {
            return state.features.selected.reduce((curr, item) => curr + item.price, 0)
        },

        /* Giá chức năng theo tuỳ chọn của người dùng */
        featuresPrice(state, getters) {
            return state.features.selected_all ? getters.allFeaturesPriceDiscounted : getters.originalSelectedFeaturePrice
        },

        /* Tổng tiền nguyên bản của chức năng + thời hạn khi chưa giảm giá */
        originalPriceWithDuration(state, getters) {
            return getters.originalSelectedFeaturePrice * state.durations.selected.quantity
        },

        /* Tổng tiền theo chức năng + thời hạn tính cả khuyến mãi mua all */
        featuresPriceWithDuration(state, getters) {
            return getters.featuresPrice * state.durations.selected.quantity
        },

        /* Số tiền được giảm theo thời hạn */
        discountAmountWithDuration(state, getters) {
            return (getters.featuresPriceWithDuration * state.durations.selected.percent) / 100
        },

        /* Số tiền mua phiên */
        sessionsPrice(state, a, b, c, d) {
            if (!state.sessions.selected) return 0
            let session_to_buy = state.sessions.selected.quantity - state.sessions.current
            return session_to_buy * state.sessions.selected.price
        },

        /* Số tiền cần thanh toán khi chưa có mã giảm giá */

        totalPrice(state, getters) {
            return getters.featuresPriceWithDuration - getters.discountAmountWithDuration + getters.sessionsPrice
        },

        voucherDiscount(state, getters) {
            let { voucher } = state
            let voucher_discount = 0
            if (voucher.success) {
                if (voucher.type == "bill-discount-money") voucher_discount = voucher.discount.total
                else if (voucher.type == "bill-discount-percent") voucher_discount = (getters.totalPrice * voucher.discount.percent) / 100
            }
            return voucher_discount
        },

        /* Số tiền cần thanh toán */
        priceToPaid(state, getters) {
            return getters.totalPrice - getters.voucherDiscount
        },

        /* Số tiền tiết kiệm được */
        amountSaved(state, getters) {
            return getters.originalPriceWithDuration - getters.priceToPaid + getters.sessionsPrice
        }
    },
    mutations: {
        onChangeStep(state, step) {
            state.slide_name = step > state.step ? "slide-left" : "slide-right"
            state.step = step
        },
        onUpdateProduct(state, data) {
            state.features.list = data.features
            state.sessions.list = data.sessions
            state.features.discount_all = data.durations[0]
            data.durations.splice(0, 1)
            state.durations.list = data.durations
            state.durations.first_list = data.durations
            state.durations.selected = data.durations[0]
        },
        onUpdateSelectAllFeature(state, value) {
            state.features.selected_all = value
        },
        onUpdateCurrentSession(state, value) {
            state.sessions.current = value
        },
        updateSelectedBank: (state, value) => (state.bank_selected = state.bank_selected || value),

        updateBankMessage: (state, value) => (state.bank_message = value),

        onUpdateVoucher: (state, value) => {
            state.voucher = value
        },
        onUpdateDurations: (state, value) => {
            state.durations.list = value
            state.durations.selected = value.find(x => x.code == state.durations.selected.code)
        },

        resetCart: state => {
            state.step = 1
            state.features.selected = []
            state.features.selected_all = false
            state.sessions.selected = null
            state.durations.list = state.durations.first_list
            state.durations.selected = state.durations.first_list[0]
            state.bank_message = null
            state.voucher = {}
            state.export_invoice = false
            state.invoice = {
                company_name: null,
                company_tax_code: null,
                company_address: null,
                company_email: null,
                company_phone: null,
                buyer_name: null
            }
        },
        updateCheckBill: (state, value) => (state.check_bill.status = value)
    },
    actions: {
        onChangeStep: ({ commit }, step) => commit("onChangeStep", step),
        onSelectFeature: ({ commit }, list) => commit("onSelectFeature", list),
        onUpdateProduct: ({ commit }, data) => commit("onUpdateProduct", data),
        onUpdateSelectAllFeature: ({ commit }, value) => commit("onUpdateSelectAllFeature", value),
        updateSelectedBank: ({ commit }, value) => commit("updateSelectedBank", value),
        onUpdateCurrentSession: ({ commit }, value) => commit("onUpdateCurrentSession", value),
        /* Cập nhật thời hạn */
        onUpdateDurations: ({ commit }, value) => commit("onUpdateDurations", value),
        /* Cập nhật nội dung chuyển khoản */
        updateBankMessage: ({ commit }, value) => commit("updateBankMessage", value),

        /* Cập nhật trạng thái mã giảm giá */
        onUpdateVoucher: ({ commit, dispatch, state, getters }, { item, input }) => {
            /* Nếu item là null sẽ khởi tạo lại dữ liệu từ trước khi nhập mã */
            if (!item) {
                dispatch("onUpdateDurations", state.durations.first_list)
                return commit("onUpdateVoucher", {})
            }
            if (item.type == "bill-discount-monthly") {
                let new_durations = state.durations.list.map(x => ({
                    ...x,
                    percent: item.discount[x.quantity] ?? x.percent
                }))

                /* Nếu mã giảm theo thời hạn -> Update array thời hạn mới */
                return dispatch("onUpdateDurations", new_durations)
            }

            /* Nếu mã giảm tiền -> Update số tiền giảm giá */
            return commit("onUpdateVoucher", { ...item, input })
        },

        async onPayment({ commit, dispatch, state, getters }, method) {
            let payload = Object()

            let features = state.features.selected.map(x => ({
                type: "features",
                code: x.code
            }))

            let durations = [
                {
                    type: "discount-features-time",
                    code: state.durations.selected.code
                }
            ]

            let sessions = []

            if (state.sessions.selected) {
                sessions.push({
                    type: "sessions",
                    code: state.sessions.selected.code
                })
            }

            payload.cart = [...features, ...durations, ...sessions]
            payload.method = method || state.pay_method

            if (state.export_invoice) {
                payload.export_invoice = true
                Object.assign(payload, state.invoice)
            }

            if (state.voucher.success) {
                payload.discount_code = state.voucher.input
            }

            let res = await this.adscheck.api({
                path: "/product/buy",
                method: "POST",
                data: payload
            })

            return res
        },

        resetCart: ({ commit }) => commit("resetCart"),
        updateCheckBill: ({ commit }, status) => {
            commit("updateCheckBill", status)
        }
    },
    modules: {}
})

export default store
