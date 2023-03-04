<template>
    <div :class="s.payment_step_1">
        <section :class="s.tab">
            <div @click="tab.selected = 'feature'" :class="[s.tab_item, { [s.selected]: tab.selected == 'feature' }]">
                <IconMask :class="s._icon" size="16" :url="imgSrc('tab-features.svg')" />
                <div>TÍNH NĂNG</div>
            </div>
            <div @click="tab.selected = 'session'" :class="[s.tab_item, { [s.selected]: tab.selected == 'session' }]">
                <IconMask :class="s._icon" size="16" :url="imgSrc('tab-session.svg')" />
                <div>PHIÊN ĐĂNG NHẬP</div>
            </div>
        </section>

        <div v-show="tab.selected == 'feature'">
            <section :class="s.duration">
                <div class="flex flex-row gap-5">
                    <img :src="imgSrc('option-duration.svg')" />
                    <div class="text-bold text-uppercase">Bạn muốn mua thời hạn bao lâu?</div>
                </div>

                <div :class="s.duration_items">
                    <label :for="item.code" :class="[s.duration_item, { [s.selected]: item.code == durations.selected.code }]" v-for="item in durations.list">
                        <input v-model="durations.selected" :value="item" :id="item.code" type="radio" style="width: 26px; height: 26px" data-checked="white" />
                        <div>
                            <div class="text-bold mb-5">{{ item.quantity }} tháng</div>
                            <div>Giảm giá {{ item.percent }}% tổng hoá đơn</div>
                        </div>
                    </label>
                </div>
            </section>

            <section :class="s.feature">
                <div class="flex flex-row gap-5">
                    <img :src="imgSrc('option-features.svg')" />
                    <div class="text-bold text-uppercase">Chọn tính năng bạn muốn mua</div>
                </div>

                <div :class="s.feature_items">
                    <label for="feature-all" :class="[s.feature_item, s.feature_all]">
                        <input v-model="feature_selected_all" id="feature-all" type="checkbox" />
                        <div>Chọn tất cả {{ features.list.length }} tính năng</div>
                        <span :class="s.feature_all_badge"> Giảm giá {{ features.discount_all.percent }}% </span>
                        <div style="margin-left: auto">
                            <span style="color: #f0b10d">{{ vnd_format(allFeaturesPriceDiscounted) }}</span> <span class="text-regular text-13">mỗi tháng</span>
                        </div>
                    </label>

                    <label :for="`feature-${item.code}`" :class="s.feature_item" v-for="item in features.list">
                        <input :id="`feature-${item.code}`" :value="item" type="checkbox" v-model="$store.state.features.selected" />
                        <div>
                            {{ item.name }}
                        </div>
                        <div style="margin-left: auto">{{ vnd_format(item.price) }} <span class="text-regular text-13">mỗi tháng</span></div>
                    </label>
                </div>

                <div class="flex flex-row text-medium gap-5 mt-25">
                    <img :src="imgSrc('tip.svg')" alt="" />
                    <span style="color: #f0b10d">Hãy chọn ít nhất một chức năng để hiện hoá đơn</span>
                </div>
            </section>
        </div>
        <div v-show="tab.selected == 'session'">
            <section :class="s.session">
                <div class="flex flex-row gap-5">
                    <img :src="imgSrc('option-session.svg')" />
                    <div class="text-bold text-uppercase">Bạn muốn nâng cấp tài khoản lên bao nhiêu phiên</div>
                </div>

                <div :class="s.feature_items" class="mt-25">
                    <label :for="item.code" :class="[s.feature_item, { disabled: item.quantity <= adscheck.manager.session_limited }]" v-for="item in sessions.list">
                        <input :disabled="item.quantity <= adscheck.manager.session_limited" v-model="sessions.selected" :id="item.code" :value="item" type="radio" name="session" />
                        <div>{{ item.name }}</div>
                        <div style="margin-left: auto">{{ vnd_format(item.price) }} <span class="text-regular text-13">/ 1 phiên</span></div>
                    </label>

                    <label for="session-null" :class="s.feature_item">
                        <input v-model="sessions.selected" id="session-null" :value="null" type="radio" name="session" />
                        <div>Không nâng phiên</div>
                    </label>
                </div>

                <div :class="s.session_current">
                    <span class="text-gradient text-medium text-15"
                        >Số phiên tài khoản bạn đang có là: <b> {{ adscheck.manager.session_limited }} </b> ( Số phiên nâng cấp không thể nhỏ hơn số phiên hiện tại)</span
                    >
                </div>
            </section>

            <section :class="s.explain">
                <div class="flex flex-row gap-5">
                    <img :src="imgSrc('option-explain.svg')" />
                    <div class="text-bold text-uppercase">Phiên đăng nhập đồng thời</div>
                </div>

                <div style="line-height: 22px" :class="s.explain_desc">Số phiên đăng nhập là số lượng trình duyệt mà bạn được phép đăng nhập tài khoản SMIT để sử dụng đồng thời. Mỗi trình duyệt đã đăng nhập đều có thể sử dụng tất cả mọi chức năng đã mua cùng một lúc.</div>
                <div :class="s.explain_warn">
                    <img :src="imgSrc('explain-warn.svg')" alt="" />
                    Lưu ý: Bạn cần duy trì liên tục tối thiểu 1 chức năng nâng cao để giữ được số phiên đăng nhập đồng thời đã mua trước đó. Nếu tất cả các chức năng nâng cao đều hết hạn thì số phiên đăng nhập đồng thời này sẽ giảm về mặc định là 5.
                </div>
            </section>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from "vuex"
export default {
    data() {
        return {
            s: this.$style,
            tab: {
                selected: "feature"
            },
            vnd_format,
            sessions_selected: []
        }
    },
    methods: {
        ...mapActions(["onSelectFeature", "onUpdateSelectAllFeature", "updateSelectedSession"]),
        imgSrc(name) {
            return require("../assets/images/step1/" + name)
        }
    },
    computed: {
        ...mapState(["features", "sessions", "durations"]),
        ...mapGetters(["allFeaturesPriceDiscounted"]),
        feature_selected_all: {
            get() {
                return this.features.list ? this.features.list.length == this.features.selected.length : false
            },
            set(value) {
                let list = value ? this.features.list : []
                return (this.features.selected = list)
            }
        }
    },
    watch: {
        feature_selected_all(e) {
            this.onUpdateSelectAllFeature(e)
        }
    }
}
</script>

<style lang="scss" scoped module>
$url: "../assets/images/step1/";
.payment_step_1 {
    width: 100%;
    margin-top: 30px;
    .tab {
        height: 43px;
        background: #f8f8f8;
        border-radius: 6px;
        padding: 0 7px;
        width: fit-content;
        display: flex;
        align-items: center;
        &_item {
            width: 180px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            height: 33px;
            border-radius: 6px;
            color: var(--grey2);
            font-family: Bold;
            cursor: pointer;
            &.selected {
                background: #ffffff;
                border: 0.5px solid #ffffff;
                color: var(--grey1);
                box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.09);
                ._icon {
                    background: var(--gradient);
                }
            }
        }
    }

    .duration {
        margin-top: 70px;
        &_items {
            display: flex;
            margin-left: -25px;
            margin-top: 15px;
        }
        &_item {
            width: calc(100% / 3 - 25px);
            margin-left: 25px;
            height: 85px;
            border-radius: 10px;
            border: 1px solid rgba(0, 193, 100, 0.2);
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 0 20px;
            background-image: url($url + "duration-item.svg");
            background-size: cover;

            &.selected {
                border: 0px solid rgba(0, 193, 100, 0.8);
                background-image: url($url + "duration-item-selected.svg");
                color: #fff;
            }
            &:not(.selected) {
                cursor: pointer;
                &:hover {
                    border: 1px solid rgba(0, 193, 100, 0.8);
                }
            }
        }
    }

    .feature {
        margin-top: 50px;
        &_item {
            display: flex;
            align-items: center;
            border: 1px solid #e6e8ec;
            border-radius: 10px;
            height: 50px;
            padding: 0 20px;
            gap: 20px;
            margin-top: 15px;

            font-family: Semibold;
            font-size: 15px;
            color: var(--grey);
            transition: background-color 0.2s;

            &:hover {
                background: rgba(0, 0, 0, 0.025);
            }
        }
        &_all {
            color: var(--grey1);
            background: #fafae7;
            border: none;
            &:hover {
                background: #ffffe2;
            }
            &_badge {
                background: linear-gradient(93.36deg, #f0b10d -2.15%, #f0d90d 26.64%, #ffd02b 52.43%, #f0b10d 113.01%);
                border: 1px solid #ffffff;
                border-radius: 6px;
                display: inline-block;
                color: #ffffff;
                font-size: 12px;
                padding: 4px 10px;
                margin-left: -10px;
            }
        }
    }

    .session {
        margin-top: 70px;
        &_current {
            margin-top: 25px;
            line-height: 21px;
            padding: 10px 15px;
            background: linear-gradient(90deg, rgba(141, 222, 169, 0.18) 22.47%, rgba(255, 255, 255, 0) 93.74%);
            border-radius: 4px;
            border-left: 2px solid var(--green);
        }
    }

    .explain {
        margin-top: 40px;
        padding-top: 40px;
        border-top: 1px dashed var(--grey3);
        &_desc {
            margin-top: 20px;
        }
        &_warn {
            img {
                transform: translateY(5px);
            }
            display: flex;
            align-items: baseline;
            gap: 10px;
            background: rgba(253, 210, 101, 0.12);
            color: #f0b10d;
            font-size: 16px;
            border-radius: 6px;
            padding: 10px;
            margin-top: 20px;
            line-height: 20px;
        }
    }
}
</style>
