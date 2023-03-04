<template>
    <div :class="s.payment_step_3">
        <section :class="s.transfer">
            <div class="flex flex-row gap-5">
                <img :src="imgSrc('transfer-icon.svg')" />
                <div class="text-bold text-uppercase">QUÉT MÃ QR HOẶC CHUYỂN KHOẢN TỚI</div>
            </div>

            <div :class="s.transfer_items">
                <div :class="[s.transfer_item, s.transfer_item_qr]">
                    <div :class="s.qr">
                        <img :src="vietqr" />
                    </div>
                </div>
                <div :class="s.transfer_item">
                    <div :class="s.infos">
                        <div v-for="item in info_list" :class="s.info">
                            <div :class="s.info_left">
                                <img :src="imgSrc(`info-${item.opt}.svg`)" alt="" />
                                <div :class="s.info_title">{{ item.title }}</div>
                                <template v-if="item.opt == 'msg'">
                                    <div class="top" data-tooltip="Mã sẽ hết hạn sau 12 tiếng">
                                        <img :src="imgSrc('info-msg-expired.svg')" alt="" />
                                    </div>
                                </template>
                            </div>
                            <div :data-tooltip="item.copied ? 'Đã sao chép' : 'Sao chép'" class="right" @click="onCopy(item)">
                                <div :class="[s.info_value, s[`info_value_${item.opt}`]]">
                                    {{ item.opt == "amount" ? vnd_format(item.value) : item.value }}
                                    <IconMask style="transform: translateY(-1px)" size="16" :class="s.info_copy" :url="imgSrc('copy-icon.svg')" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section :class="s.note">
            <div class="flex flex-row gap-5">
                <img :src="imgSrc('transfer-note.svg')" />
                <div class="text-bold text-uppercase">Lưu ý</div>
            </div>

            <ul :class="s.texts">
                <li v-for="item in note.list">
                    {{ item }}
                </li>
            </ul>
        </section>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex"
export default {
    data() {
        return {
            s: this.$style,
            vnd_format,
            note: {
                list: ["Chuyển khoản sai nội dung sẽ mất đến 48h để xử lý", "Không hoàn lại số tiền nạp vào hệ thống bằng bất kì lý do nào", "Sau khi chuyển khoản, bấm vào nút xác nhận thanh toán để cập nhật số dư", "Hệ thống sẽ tự động cập nhật số dư khi bạn giao dịch theo đúng cú pháp"]
            },
            info_list: [
                { title: "Ngân hàng", opt: "bank", value: this.$store.state.bank_selected.bank_name, copied: false },
                { title: "Số tài khoản", opt: "number", value: this.$store.state.bank_selected.bank_number, copied: false },
                { title: "Chủ tài khoản", opt: "holder", value: this.$store.state.bank_selected.receiver_name, copied: false },
                { title: "Số tiền", opt: "amount", value: this.$store.getters.priceToPaid, copied: false },
                { title: "Nội dung CK", opt: "msg", value: this.$store.state.bank_message, copied: false }
            ]
        }
    },
    methods: {
        ...mapActions(["onSelectFeature"]),

        imgSrc(name) {
            return require("../assets/images/step3/" + name)
        },
        onCopy(item) {
            item.copied = true
            copyText(item.value)
            setTimeout(() => {
                item.copied = false
            }, 1500)
        }
    },
    computed: {
        ...mapState(["bank_selected", "bank_message"]),
        ...mapGetters(["priceToPaid"]),
        // info_list() {
        //     return [
        //         { title: "Ngân hàng", opt: "bank", value: this.bank_selected.bank_name, copied: false },
        //         { title: "Số tài khoản", opt: "number", value: this.bank_selected.bank_number, copied: false },
        //         { title: "Chủ tài khoản", opt: "holder", value: this.bank_selected.receiver_name, copied: false },
        //         { title: "Số tiền", opt: "amount", value: this.priceToPaid, copied: false },
        //         { title: "Nội dung CK", opt: "msg", value: this.bank_message, copied: false }
        //     ]
        // },
        vietqr() {
            return `https://img.vietqr.io/image/${this.bank_selected.bank_name}-${this.bank_selected.bank_number}-compact.png?amount=${this.priceToPaid}&addInfo=${this.bank_message}&accountName=${this.bank_selected.receiver_name}`
        }
    }
}
</script>

<style lang="scss" scoped module>
$url: "../assets/images/step2/";
.payment_step_3 {
    width: 100%;
    margin-top: 100px;

    .transfer {
        &_items {
            display: flex;
            margin-top: 20px;
            margin-left: -25px;
        }
        &_item {
            width: calc(50% - 25px);
            margin-left: 25px;
            background: #f8f9fa;
            border-radius: 10px;
            &_qr {
                padding: 20px;
            }
        }

        .qr {
            background: #ffffff;
            border-radius: 10px;
            height: 295px;
            img {
                max-width: 100%;
                max-height: 100%;
                display: block;
                margin: 0 auto;
            }
        }
        .infos {
            margin-top: -45px;
            padding: 30px;
        }
        .info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 45px;
            &_left {
                display: flex;
                align-items: center;
                gap: 5px;
                color: var(--grey2);
            }
            &_value {
                text-transform: uppercase;
                font-family: Bold;
                display: flex;
                align-items: center;
                &_msg {
                    background: var(--gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    text-fill-color: transparent;
                }
                &:hover {
                    cursor: copy;
                    .info_copy {
                        background: var(--green);
                    }
                }
            }
            &_copy {
                background: var(--grey2);
                transform: translateY(1px);
            }
        }
    }

    .note {
        margin-top: 50px;

        ul.texts {
            margin-top: 15px;
            background: rgba(24, 119, 242, 0.03);
            border-radius: 5px;
            padding: 20px 50px;
            li {
                color: var(--blue1);
                line-height: 36px;
                font-family: Medium;
                font-size: 16px;
            }
        }
    }
}
</style>
