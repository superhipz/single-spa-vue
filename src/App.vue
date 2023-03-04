<!-- eslint-disable vue/require-v-for-key -->
<template>
    <div id="app" class="web-container" :class="s['wrapper']">
        <div :class="s['container-left']">
            <div :class="s.container">
                <div :class="s.header">
                    <div :class="s.title">
                        <div @click="onGoBack" v-if="step > 1" :class="s.title_back" class="hover-underline">
                            <img :src="imgSrc('header-back.svg')" alt="" />
                            Back
                        </div>
                        Trung tâm thanh toán
                    </div>
                    <div :class="s.steps">
                        <div @click="_onChangeStep(item.step)" :class="[s.step, { [s.selected]: item.step == step, [s.finished]: item.step < step }]" v-for="item in steps.list">
                            <div :class="s.step_circle">
                                {{ item.step }}
                            </div>
                            <div :class="s.step_title">
                                {{ item.title }}
                            </div>
                        </div>
                    </div>
                </div>
                <div :class="s.body">
                    <transition :name="slide_name">
                        <div v-if="feature_loading" style="margin-top: 80px">
                            <Loader size="25px" color="#1ca64d" />
                        </div>
                        <template v-else>
                            <PaymentStep1 v-if="step == 1" />
                            <PaymentStep2 v-else-if="step == 2" />
                            <PaymentStep3 v-else-if="step == 3" />
                        </template>
                    </transition>
                </div>
            </div>
        </div>
        <div :class="s['container-right']">
            <div :class="s.container">
                <HoaDon />
            </div>
        </div>

        <CenterDialogue :show="wallet.show">
            <div style="width: 410px" class="modal">
                <img :class="s.bill_wallet_background" :src="imgSrc('bill-wallet-background.svg')" alt="" />
                <div style="border-bottom: 1px solid #e6e8ec" class="px-30 py-15 flex flex-row gap-10 text-bold"><img :src="imgSrc('bill-wallet-icon.svg')" alt="" /> Thanh toán qua ví SMIT</div>

                <div class="px-30 py-15">
                    <div style="line-height: 21px">
                        Bạn đang chuẩn bị thực hiện một giao dịch với số tiền cần thanh toán là <b>{{ vnd_format(priceToPaid) }}</b>
                    </div>
                    <div :class="s.bill_wallet_detail" class="mt-30 flex flex-row text-uppercase text-semibold text-grey-2">Chi tiết giao dịch</div>

                    <div class="flex flex-between py-15">
                        <div>Số dư ví SMIT</div>
                        <b>{{ vnd_format(adscheck.user.balance) }}</b>
                    </div>

                    <div class="flex flex-between pb-15">
                        <div>Số tiền giao dịch</div>
                        <b>{{ vnd_format(priceToPaid) }}</b>
                    </div>

                    <div class="flex flex-between pt-15" style="border-top: 1px dashed #e6e8ec">
                        <div>Số dư ví còn lại</div>
                        <b>{{ vnd_format(adscheck.user.balance - priceToPaid) }}</b>
                    </div>

                    <Button :loading="payment_loading" @click="onConfirmPaymentWallet" style="height: 44px" class="btn-gradient w-full radius-6 mt-25 text-bold">Xác nhận thanh toán</Button>

                    <button @click="wallet.show = false" class="border-grey-3 w-full py-13 radius-6 text-grey-2 mt-10 text-medium">Huỷ</button>
                </div>
            </div>
        </CenterDialogue>

        <CenterDialogue :show="check_bill.show">
            <div class="modal px-20 py-15">
                <template v-if="check_bill.status == 'pending'">
                    <div class="flex flex-row">
                        <div class="loadingio-spinner-spinner-4re3hfwg07">
                            <div class="ldio-w3scz7smqw">
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                        </div>
                        <div>
                            <b class="text-16">Đang xác nhận thanh toán</b>
                            <div class="text-grey-2">Vui lòng đợi trong giây lát ...</div>
                        </div>
                    </div>
                </template>
                <template v-else-if="check_bill.status == 'completed'">
                    <img style="border-radius: 20px" :src="imgSrc('bill-completed-background.svg')" alt="" />
                    <div class="text-center" style="margin-top: -45px">
                        <div class="text-bold text-16 text-green">Thanh toán thành công</div>
                        <!-- <div class="text-grey-2">Bấm xác nhận để quay lại trang chủ</div> -->
                        <button @click="onFinishCheckBill" style="height: 44px" class="btn-gradient radius-6 mt-15 w-full text-bold">Xác nhận</button>
                    </div>
                </template>
            </div>
        </CenterDialogue>
    </div>
</template>

<script>
import { CenterDialogue, Loader, Button } from "@smit/shared"
import PaymentStep1 from "./components/PaymentStep1"
import PaymentStep2 from "./components/PaymentStep2"
import PaymentStep3 from "./components/PaymentStep3"
import HoaDon from "./components/HoaDon"

import { mapActions, mapGetters, mapState } from "vuex"

export default {
    components: {
        PaymentStep1,
        PaymentStep2,
        PaymentStep3,
        CenterDialogue,
        HoaDon,
        Loader,
        Button
    },
    data() {
        return {
            s: this.$style,
            steps: {
                list: [
                    { step: 1, title: "Lựa chọn" },
                    { step: 2, title: "Thanh toán" },
                    { step: 3, title: "Xác nhận" }
                ],
                selected: this.$store.state.step
            },
            payment_loading: false,
            feature_loading: true,
            vnd_format
        }
    },
    methods: {
        ...mapActions(["onChangeStep", "onUpdateProduct", "onUpdateCurrentSession", "onPayment", "resetCart"]),
        imgSrc(name) {
            return require("./assets/images/app/" + name)
        },
        onFinishCheckBill() {
            this.check_bill.show = false
            this.check_bill.status = "pending"
        },
        _onChangeStep(item) {
            if (item >= this.step) return
            this.onGoBack()
        },
        onGoBack() {
            this.slide_name = "slide-right"
            this.onChangeStep(this.step - 1)
        },
        async loadFeaturesData() {
            this.feature_loading = true
            let res = await this.adscheck.api({
                path: "/product"
            })
            if (res.success) {
                this.onUpdateProduct({
                    features: res.features,
                    sessions: res.sessions,
                    durations: res.discount
                })
                return (this.feature_loading = false)
            }
            return this.$toast.error(res.message, {
                position: "top-center"
            })
        },
        async onConfirmPaymentWallet() {
            this.payment_loading = true
            let res = await this.onPayment()
            this.payment_loading = false

            if (res.success) {
                this.$toast.success("Thanh toán thành công", {
                    position: "top-center"
                })

                await this.adscheck.authentication()
                this.onUpdateCurrentSession(this.adscheck.manager.session_limited)
                this.resetCart()
                this.eventBus.$emit("resetVoucher")
                this.wallet.show = false
                return
            }

            this.$toast.error(res.message, {
                position: "top-center"
            })
        }
    },
    computed: {
        ...mapGetters(["priceToPaid"]),
        ...mapState(["step", "wallet", "slide_name", "check_bill"])
    },
    created() {
        this.loadFeaturesData()
        this.onUpdateCurrentSession(this.adscheck.manager.session_limited)
    },

    mounted() {}
}
</script>

<style lang="scss" module>
@mixin Screen($Size) {
    @media only screen and (max-width: $Size) {
        @content;
    }
}

@mixin border-gradient {
    background-clip: padding-box;
    position: relative;
    border: 1px solid transparent;
    &::before {
        z-index: -1;
        content: "";
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        background: var(--gradient);
    }
}

$url: "./assets/images/app/";

.wrapper {
    background: #fff;
    border-radius: 10px;
    height: calc(100vh - 12px);
    display: flex;
}

.container {
    &-left {
        height: 100%;
        width: 75%;
        border-right: 1px solid rgba(10, 182, 129, 0.8);
        overflow: hidden;

        display: flex;
        align-items: center;
        .container {
            height: 100%;
            max-height: 950px;
            margin: 0 auto;
            flex-basis: 1100px;
            padding: 60px 0;
            position: relative;
        }
    }
    &-right {
        overflow: hidden;
        width: 25%;

        display: flex;
        align-items: center;
        .container {
            max-height: 950px;
            position: relative;
            flex-basis: 360px;
            margin: 0 auto;
            height: 100%;
        }
    }
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .title {
        font-family: Bold;
        font-size: 24px;
        position: relative;
        &_back {
            position: absolute;
            left: -65px;
            font-size: 16px;
            bottom: 4px;
            font-family: Medium;
        }
    }

    .steps {
        display: flex;
        align-items: center;
    }

    .step {
        display: flex;
        align-items: center;
        gap: 5px;
        &_title {
            color: var(--grey2);
            font-family: Semibold;
        }

        &_circle {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #f8f8f8;
            border: 1px solid var(--grey3);
            color: var(--grey2);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        &:not(:first-child):before {
            content: "";
            display: inline-block;
            height: 1px;
            width: 30px;
            background: rgba(0, 0, 0, 0.1);
            margin: 0 9px;
        }

        &:not(.selected) {
            cursor: pointer;
        }

        &.selected {
            &:before {
                background: var(--gradient);
            }
            .step {
                &_circle {
                    border: 1px solid var(--green);
                    color: var(--green);
                    background: #fff;
                }
                &_title {
                    color: var(--grey1);
                }
            }
        }

        &.finished {
            &:before {
                background: var(--gradient);
            }
            .step {
                &_circle {
                    font-size: 0;
                    background: var(--gradient);
                    &:after {
                        content: url($url + "header-step-check.svg");
                    }
                }
                &_title {
                    color: var(--grey1);
                }
            }
        }
    }
}

.bill_wallet {
    &_detail {
        &:before {
            content: "";
            width: 7px;
            height: 12px;
            background: #7ceec5;
            border-radius: 1px;
            margin-right: 5px;
        }
    }
    &_background {
        position: absolute;
        right: 0;
    }
}
</style>

<style scoped>
.slide-left-enter {
    transition: all 0.2s;
    transform: translateX(500px);
    opacity: 0;
    position: absolute;
    overflow: hidden;
}
.slide-left-leave-to {
    transition: all 0.2s;
    transform: translateX(-500px);
    opacity: 0;
    position: absolute;
    overflow: hidden;
}
.slide-left-enter-to,
.slide-left-leave {
    transition: all 0.2s;
    position: absolute;
    overflow: hidden;
}

.slide-right-enter {
    transition: all 0.2s;
    transform: translateX(-500px);
    opacity: 0;
    position: absolute;
    overflow: hidden;
}
.slide-right-leave-to {
    transition: all 0.2s;
    transform: translateX(500px);
    opacity: 0;
    position: absolute;
    overflow: hidden;
}
.slide-right-enter-to,
.slide-right-leave {
    transition: all 0.2s;
    opacity: 1;
    position: absolute;
    overflow: hidden;
}
/* .slide-leave {
    transition: all 0.3s;
    position: absolute;
    overflow: hidden;
    transition: all 0.3s;
    transform: translateX(0);
    opacity: 1;
    position: absolute;
    overflow: hidden;
} */
</style>

<style>
@keyframes ldio-w3scz7smqw {
    0% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
}
.ldio-w3scz7smqw div {
    left: 47px;
    top: 24px;
    position: absolute;
    animation: ldio-w3scz7smqw linear 1s infinite;
    background: #1ca64d;
    width: 6px;
    height: 12px;
    border-radius: 3px / 6px;
    transform-origin: 3px 26px;
}
.ldio-w3scz7smqw div:nth-child(1) {
    transform: rotate(0deg);
    animation-delay: -0.9166666666666666s;
    background: #1ca64d;
}
.ldio-w3scz7smqw div:nth-child(2) {
    transform: rotate(30deg);
    animation-delay: -0.8333333333333334s;
    background: #1ca64d;
}
.ldio-w3scz7smqw div:nth-child(3) {
    transform: rotate(60deg);
    animation-delay: -0.75s;
    background: #1ca64d;
}
.ldio-w3scz7smqw div:nth-child(4) {
    transform: rotate(90deg);
    animation-delay: -0.6666666666666666s;
    background: #1ca64d;
}
.ldio-w3scz7smqw div:nth-child(5) {
    transform: rotate(120deg);
    animation-delay: -0.5833333333333334s;
    background: #1ca64d;
}
.ldio-w3scz7smqw div:nth-child(6) {
    transform: rotate(150deg);
    animation-delay: -0.5s;
    background: #1ca64d;
}
.ldio-w3scz7smqw div:nth-child(7) {
    transform: rotate(180deg);
    animation-delay: -0.4166666666666667s;
    background: #1ca64d;
}
.ldio-w3scz7smqw div:nth-child(8) {
    transform: rotate(210deg);
    animation-delay: -0.3333333333333333s;
    background: #1ca64d;
}
.ldio-w3scz7smqw div:nth-child(9) {
    transform: rotate(240deg);
    animation-delay: -0.25s;
    background: #1ca64d;
}
.ldio-w3scz7smqw div:nth-child(10) {
    transform: rotate(270deg);
    animation-delay: -0.16666666666666666s;
    background: #1ca64d;
}
.ldio-w3scz7smqw div:nth-child(11) {
    transform: rotate(300deg);
    animation-delay: -0.08333333333333333s;
    background: #1ca64d;
}
.ldio-w3scz7smqw div:nth-child(12) {
    transform: rotate(330deg);
    animation-delay: 0s;
    background: #1ca64d;
}
.loadingio-spinner-spinner-4re3hfwg07 {
    width: 40px;
    height: 40px;
    display: inline-block;
    overflow: hidden;
    background: transparent;
}
.ldio-w3scz7smqw {
    width: 100%;
    height: 100%;
    position: relative;
    transform: translateZ(0) scale(0.4);
    backface-visibility: hidden;
    transform-origin: 0 0; /* see note above */
}
.ldio-w3scz7smqw div {
    box-sizing: content-box;
}
</style>
