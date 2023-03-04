<template>
    <div :class="s.payment_step_2">
        <section :class="s.method">
            <div class="flex flex-row gap-5">
                <img :src="imgSrc('method-icon.svg')" />
                <div class="text-bold text-uppercase">Chọn phương thức thanh toán</div>
            </div>

            <div :class="s.method_items">
                <label for="method-bank" :class="[s.method_item, s.method_item_bank, { [s.selected]: pay_method == 'banking' }]">
                    <input data-checked="white" v-model="$store.state.pay_method" value="banking" type="radio" name="method" id="method-bank" />
                    <div>
                        <div class="text-bold text-16">Chuyển khoản ngân hàng</div>
                        <div style="margin-top: 3px">Thanh toán qua Internet banking</div>
                    </div>
                </label>

                <label for="method-wallet" :class="[s.method_item, s.method_item_wallet, { [s.selected]: pay_method == 'wallet', [s.disabled]: notEnoughBalance }]">
                    <input :disabled="notEnoughBalance" data-checked="white" v-model="$store.state.pay_method" value="wallet" type="radio" name="method" id="method-wallet" />
                    <div>
                        <div class="text-bold text-16">Thanh toán qua ví SMIT</div>
                        <div class="text-medium" style="margin-top: 3px"><img style="transform: translateY(2px)" :src="imgSrc('method-wallet-currency.svg')" alt="" /> Số dư {{ vnd_format(adscheck.user.balance) }} <span v-if="notEnoughBalance" class="text-red"> ( Không đủ ) </span></div>
                    </div>
                    <a href="https://dashboard.smit.vn?action=nap-tien" target="_blank" :class="s.method_charge" class="btn">+ Nạp tiền</a>
                </label>
            </div>
        </section>

        <section :class="[s.bank, { [s.disabled]: pay_method == 'wallet' }]">
            <div :class="s.bank_header">
                <div>
                    <span class="text-bold">Chọn ngân hàng</span>
                    <span style="font-size: 16px"> &#183; </span> <span class="text-grey-2"> {{ adscheck.bank.length }} ngân hàng đang khả dụng</span>
                </div>
                <div class="text-medium">
                    <img style="transform: translateY(2px)" :src="imgSrc('bitcoin-icon.svg')" alt="" />
                    Thanh toán qua Bitcoin? <a target="_blank" href="https://dashboard.smit.vn?action=nap-tien">Tại đây</a>
                </div>
            </div>

            <div :class="s.bank_items">
                <label :for="`bank-${item.bank_name}`" :class="[s.bank_item, { [s.selected]: item == bank_selected }]" v-for="item in adscheck.bank">
                    <div :class="s.bank_item_left">
                        <img :srcset="`${imgSrc(`bank-${item.bank_name.toLowerCase()}.png`) + ' 2x'}`" alt="" />
                        <div :class="s.bank_item_title">
                            {{ item.bank_title }}
                        </div>
                    </div>
                    <div class="flex flex-row gap-10 text-green">
                        <div v-if="bank_selected == item">Đang chọn</div>
                        <input type="radio" v-model="$store.state.bank_selected" :value="item" name="bank-option" :id="`bank-${item.bank_name}`" class="radio" />
                    </div>
                </label>
            </div>
        </section>

        <section :class="s.export">
            <div class="flex flex-row gap-10">
                <input v-model="$store.state.export_invoice" id="export_bill" type="checkbox" />
                <label class="text-semibold text-grey-2" for="export_bill">Tôi muốn xuất hoá đơn thanh toán</label>
            </div>

            <template v-if="export_invoice">
                <div class="text-grey-2 text-uppercase mt-20 text-semibold">1. Thông tin cá nhân</div>
                <div :class="s.export_items">
                    <FloatInput v-model="$store.state.invoice.buyer_name" :class="s.export_item" :url="imgSrc('bill-username.svg')" label="Tên khách hàng" />

                    <FloatInput v-model="$store.state.invoice.company_phone" :class="s.export_item" :url="imgSrc('bill-phone.svg')" label="Số điện thoại" />
                </div>

                <div class="text-grey-2 text-uppercase mt-20 text-semibold">2. Thông tin công ty</div>

                <div :class="s.export_items">
                    <FloatInput v-model="$store.state.invoice.company_name" :class="s.export_item" :url="imgSrc('bill-company.svg')" label="Tên công ty" />
                    <FloatInput v-model="$store.state.invoice.company_email" :class="s.export_item" :url="imgSrc('bill-email.svg')" label="Email công ty" />
                    <FloatInput v-model="$store.state.invoice.company_tax_code" :class="s.export_item" :url="imgSrc('bill-mst.svg')" label="Mã số thuế" />
                    <FloatInput v-model="$store.state.invoice.company_address" :class="s.export_item" :url="imgSrc('bill-address.svg')" label="Địa chỉ công ty" />
                </div>
            </template>
        </section>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex"
import FloatInput from "./FloatInput.vue"
export default {
    components: {
        FloatInput
    },
    data() {
        return {
            s: this.$style,
            method: {
                selected: "bank"
            },

            buyer_name: null,
            vnd_format
        }
    },
    methods: {
        ...mapActions(["onSelectFeature", "updateSelectedBank"]),
        imgSrc(name) {
            return require("../assets/images/step2/" + name)
        }
    },
    computed: {
        ...mapState(["feature", "pay_method", "export_invoice", "bank_selected", "error_invoice"]),
        ...mapGetters(["priceToPaid"]),
        feature_selected_all: {
            get() {
                return this.feature.list ? this.feature.list.length == this.feature.selected.length : false
            },
            set(value) {
                let list = value ? this.feature.list : []
                return (this.feature.selected = list)
            }
        },

        notEnoughBalance() {
            return this.adscheck.user.balance < this.priceToPaid
        }
    },
    mounted() {
        this.updateSelectedBank(this.adscheck.bank[0])
    }
}
</script>

<style lang="scss" scoped module>
$url: "../assets/images/step2/";
.payment_step_2 {
    width: 100%;
    margin-top: 70px;

    .method {
        &_items {
            display: flex;
            margin-left: -20px;
            margin-top: 25px;
        }
        &_item {
            width: calc(50% - 20px);
            background: #f8f8f8;
            border-radius: 10px;
            height: 85px;
            padding: 0 30px;
            margin-left: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            input {
                height: 26px;
                width: 26px;
            }
            &_bank {
                &.selected {
                    color: #fff;
                    background-image: url($url + "method-bank-selected.svg");
                }
            }
            &_wallet {
                &.selected {
                    color: #fff;
                    background-image: url($url + "method-wallet-selected.svg");
                }
                &.disabled {
                    cursor: not-allowed;
                }
            }
        }
        &_charge {
            margin-left: auto;
            background: linear-gradient(104.07deg, #ffcc48 3.99%, #e8a802 104.05%);
            box-shadow: 0px 11px 36px rgba(240, 177, 13, 0.17);
            border-radius: 6px;
            height: 36px;
            color: #fff;
            padding: 0 13px;
            font-family: Bold;
            transition: all 0.2s;
            &:hover {
                opacity: 0.8;
            }
            &:active {
                color: #ffcc48;
            }
        }
    }

    .bank {
        margin-top: 50px;
        &.disabled {
            opacity: 0.5;
        }
        &_header {
            display: flex;
            justify-content: space-between;
        }
        &_item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border: 1px solid #e6e8ec;
            border-radius: 10px;
            height: 50px;
            padding: 0 15px;
            margin-top: 20px;
            font-family: Semibold;
            transition: background-color 0.2s;
            color: var(--grey2);

            &:hover {
                background: rgba(0, 0, 0, 0.02);
            }
            &_left {
                display: flex;
                align-items: center;
            }
            &_title {
                margin-left: 14px;
                padding-left: 14px;
                border-left: 1px solid #777e90;
            }
            &.selected {
                background: #e7faf4;
                color: var(--grey1);
            }
        }
    }

    .export {
        margin-top: 45px;
        padding-top: 25px;
        border-top: 1px dashed var(--grey3);
        &_items {
            display: flex;
            margin-left: -20px;
            margin-top: 10px;
        }
        &_item {
            width: calc(25% - 20px);
            margin-left: 20px;
        }
    }
}
</style>
