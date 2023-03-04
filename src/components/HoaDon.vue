<template>
    <div :class="s.bill">
        <template v-if="isEmptyCart">
            <div :class="s.unselect">
                <Lottie :options="defaultOptions" style="height: fit-content" />
                <div class="text-16 text-bold">Chưa có thông tin hoá đơn</div>
                <div class="text-grey-2 mt-15">
                    Bạn hãy chọn ít nhất một chức năng để hiển thị <br />
                    thông tin thanh toán nhé
                </div>
            </div>
        </template>
        <template v-else>
            <section :class="s.header">
                <div class="text-24 text-bold" :class="s.header_title">Hoá đơn thanh toán</div>
                <div class="mt-10 text-grey-2 text-14">Bạn có thể mua phiên đăng nhập và tính năng trong cùng một hóa đơn nhé</div>
            </section>

            <section :class="s.cart">
                <div v-if="features.selected.length" :class="s.cart_item" class="mt-25">
                    <template v-if="features.selected_all">
                        <div class="flex flex-between mb-5">
                            <div></div>
                            <div>
                                <del class="text-grey-2">
                                    {{ vnd_format(originalSelectedFeaturePrice) }}
                                </del>
                            </div>
                        </div>
                    </template>
                    <div class="flex flex-between">
                        <div class="text-uppercase text-bold">{{ features.selected.length }} tính năng</div>
                        <div class="text-bold text-16">{{ vnd_format(featuresPrice) }} <span class="text-medium">/ tháng</span></div>
                    </div>
                    <div class="flex flex-between mt-8">
                        <div class="text-grey-2 text-16">Thời hạn</div>
                        <div class="text-grey-2 text-16">{{ durations.selected.quantity }} tháng</div>
                    </div>
                    <div style="max-height: 380px; overflow: overlay">
                        <div v-for="item in features.selected" class="mt-25 text-grey-2 flex flex-row gap-10">
                            <IconMask :url="imgSrc(`app-${item.code}.svg`)" style="background: var(--green)" />
                            {{ item.name }}
                        </div>
                    </div>
                </div>

                <template v-if="sessions.selected">
                    <div :class="s.cart_item" class="pt-20">
                        <div class="flex flex-between text-bold text-uppercase">
                            <div>{{ sessions.selected.quantity }} Phiên đăng nhập</div>
                            <div class="text-16">
                                {{ vnd_format(sessionsPrice) }}
                            </div>
                        </div>
                    </div>
                </template>

                <div :class="s.cart_item" class="pt-20">
                    <template v-if="step != 3">
                        <FloatInput :disabled="voucher.loading" :error="voucher.error" @blur="onCheckVoucher" @paste="onCheckVoucher('paste', $event)" v-model="voucher.input" :class="s.cart_voucher" :url="imgSrc('voucher-input.svg')" label="Nhập mã giảm giá" />
                        <template v-if="voucher.success">
                            <div class="text-green mt-10">Áp dụng mã giảm giá thành công</div>
                        </template>
                    </template>

                    <div class="flex flex-between mt-25">
                        <div class="text-medium">Tổng tiền</div>
                        <div class="text-grey-2">{{ vnd_format(featuresPriceWithDuration) }}</div>
                    </div>

                    <div class="flex flex-between mt-25">
                        <div class="text-medium">Thời hạn mua</div>
                        <div class="text-grey-2">- {{ vnd_format(discountAmountWithDuration) }}</div>
                    </div>

                    <template v-if="voucherDiscount > 0">
                        <div class="flex flex-between mt-25">
                            <div class="text-medium">Mã khuyến mãi</div>
                            <div class="text-grey-2">- {{ vnd_format(voucherDiscount) }}</div>
                        </div>
                    </template>
                </div>

                <div class="flex flex-between mt-20">
                    <div class="text-medium">Phải thanh toán</div>
                    <div class="text-bold text-16">{{ vnd_format(priceToPaid) }}</div>
                </div>
            </section>
            <Button :loading="loading" @click="onContinue" :class="s.cart_btn" class="btn-gradient mt-20">
                {{ btnContent }}
            </Button>

            <div class="flex flex-row gap-5 mt-10">
                <img :src="imgSrc('save-icon.svg')" alt="" />
                <div class="text-blue">
                    Bạn đã tiết kiệm <span class="text-bold"> {{ vnd_format(amountSaved) }} </span> cho lần thanh toán này
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import { Lottie, Button } from "@smit/shared"
import FloatInput from "./FloatInput.vue"

import * as animationData from "../assets/bill_animation.json"

import { mapState, mapActions, mapGetters } from "vuex"

export default {
    components: {
        Lottie,
        FloatInput,
        Button
    },
    data() {
        return {
            defaultOptions: { animationData: animationData },
            s: this.$style,
            vnd_format,
            loading: false,
            voucher: {
                input: null,
                inputed: null,
                loading: false,
                result: null,
                error: null,
                success: false
            }
        }
    },
    computed: {
        ...mapGetters(["featuresPrice", "originalSelectedFeaturePrice", "featuresPriceWithDuration", "discountAmountWithDuration", "priceToPaid", "amountSaved", "sessionsPrice", "voucherDiscount"]),
        ...mapState(["features", "sessions", "durations", "step", "pay_method", "wallet", "export_invoice", "invoice", "bank_message"]),
        isEmptyCart() {
            return !this.features.selected.length && !this.sessions.selected
        },
        btnContent() {
            let step = {
                1: "Tiếp tục",
                2: "Tiến hành thanh toán",
                3: "Tôi đã chuyển khoản"
            }

            return step[this.step]
        }
    },
    methods: {
        ...mapActions(["onChangeStep", "updateBankMessage", "onUpdateVoucher", "onPayment", "updateCheckBill", "resetCart"]),
        imgSrc(name) {
            return require("../assets/images/bill/" + name)
        },
        async onContinue() {
            if (this.step == 1) {
                return this.onChangeStep(2)
            }
            if (this.step == 2) {
                if (this.pay_method == "banking") {
                    this.loading = true
                    let res = await this.onPayment()
                    this.loading = false
                    if (res.success) {
                        this.updateBankMessage(res.recharge_code)
                        return this.onChangeStep(3)
                    }
                    return this.$toast.error(res.message, {
                        position: "top-center"
                    })
                }
                return (this.wallet.show = true)
            }
            if (this.step == 3) {
                this.$store.state.check_bill.show = true
                this.onCheckBill()
            }
        },

        async onCheckVoucher(action, event) {
            if (this.voucher.loading) return
            if (action == "paste") {
                await wait(0)
                this.voucher.input = event.target.value
            }

            if (this.voucher.input !== null && this.voucher.input == this.voucher.inputed) return
            /* Nếu đã nhập mã mà mã giống với mã vừa nhập sẽ không check */

            /* Xoá trạng thái khi nhập mã mới */
            this.voucher.error = null
            this.voucher.success = false
            this.voucher.inputed = null

            /* Nếu mã để trống sẽ update về trạng thái ban đầu */
            this.onUpdateVoucher({ item: null })
            if (!this.voucher.input) return

            this.voucher.loading = true
            let res = await this.adscheck.api({
                path: "/product/discount?code=" + this.voucher.input
            })
            this.voucher.loading = false

            /* Lưu tạm thời mã user đã nhập để check mã có giống mã vừa nhập không */
            this.voucher.inputed = this.voucher.input
            if (res.success) {
                this.voucher.success = true

                /* Cập nhật mã giảm giá */

                return this.onUpdateVoucher({ item: res, input: this.voucher.inputed })
            }

            this.onUpdateVoucher({ item: null })
            this.voucher.error = res.message
        },

        async onCheckBill(bank_message) {
            let msg = bank_message || this.bank_message
            let res = await this.adscheck.api({
                path: "/product/buyer?code=" + msg
            })
            if (res.success) {
                this.updateCheckBill(res.status)
                if (res.status == "completed") {
                    await this.adscheck.authentication()
                    this.onUpdateCurrentSession(this.adscheck.manager.session_limited)
                    this.resetCart()
                    this.voucher = {
                        input: null,
                        inputed: null,
                        loading: false,
                        result: null,
                        error: null,
                        success: false
                    }
                    return
                }
                await wait(5000)
                return this.onCheckBill(msg)
            }
            return this.$toast.error(res.message, {
                position: "top-center"
            })
        }
    },
    created() {
        this.eventBus.$on("resetVoucher", () => {
            this.voucher = {
                input: null,
                inputed: null,
                loading: false,
                result: null,
                error: null,
                success: false
            }
        })
    },
    beforeDestroy() {
        this.eventBus.$off("resetVoucher")
    }
}
</script>

<style lang="scss" module>
.bill {
    height: 100%;
    width: 100%;
    padding: 45px 0;
    display: flex;
    flex-direction: column;

    .unselect {
        height: 100%;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .cart {
        &_item {
            border-bottom: 1px dashed var(--grey3);
            padding-bottom: 20px;
        }
        &_btn {
            height: 45px;
            width: 100%;
            border-radius: 6px;
            margin-top: auto;
            font-family: Bold;
        }
        &_voucher {
            input {
                text-transform: uppercase;
                font-family: Semibold;
            }
        }
    }
}
</style>
