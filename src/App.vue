<!-- eslint-disable vue/require-v-for-key -->
<template>
    <div id="app" class="ads-check-container" :class="s['ads-check-table']"></div>
</template>

<script>
import { Icon } from "@smit/shared"

export default {
    props: ["facebook"],
    components: {
        Icon
    },
    data() {
        return {
            s: this.$style
        }
    },
    methods: {
        imgSrc(name) {
            return require("./assets/images/table/" + name)
        }
    },
    computed: {
        thead_status_filter_config() {
            let arr = [1, 2, 3, 7, 9]
            return [...arr, 0].map(x => ({
                code: x,
                title: this.facebook.getAccountStatus(x),
                count: this.adaccount.data.filter(item => (x != 0 ? item.account_status == x : !arr.includes(item.account_status))).length
            }))
        },
        table_width() {
            return this.computed_table_config.reduce((a, b) => a + b.width, 0)
        },
        filtered_data() {
            if (this.menu.tab == "adaccount") {
                /* Logic lọc tài khoản hiển thị theo Trạng thái tài khoản */
                let arr = [1, 2, 3, 7, 9]
                let selected_status = this.thead_status_filter.selected
                return this.adaccount.data.filter(item => {
                    if (!selected_status.length) return true
                    if (selected_status.includes(0)) return !arr.includes(item.account_status) || selected_status.includes(item.account_status)
                    return selected_status.includes(item.account_status)
                })
            }

            return this.bm.data
        },
        computed_table_config() {
            return this.table_config[this.menu.tab].filter(x => x.show)
        },
        is_mixed_tong_tieu() {
            return this.currency_exchange.to == "MIX" && [...new Set(this.adaccount.data.map(x => x.currency))].length > 1
        },
        is_money_list() {
            return this.table_config[this.menu.tab].reduce((a, b) => {
                if (b.is_money) a.push(b.td)
                return a
            }, [])
        },
        is_maximum_range() {
            let { start, end } = this.adaccount.ranges
            let is_not_set_range = start == null && end == null
            let is_maximum = moment(min_date_range).isSame(start) && moment().isSame(end, "day")
            return is_not_set_range || is_maximum
        },
        export_list() {
            let list = []
            this.table_config[this.menu.tab].forEach(tbl => {
                let { td, th, export_by } = tbl
                list.push({
                    th,
                    td: export_by || td,
                    is_money: tbl.is_money
                })
                if (td == "account") {
                    list.push({
                        th: "ID",
                        td: "account_id"
                    })
                }
            })
            return list
        },

        isNextDisabled() {
            return !this[this.menu.tab].next_page
        },

        isPrevDisabled() {
            return !this[this.menu.tab].previous_page
        },

        pagination_status() {
            let { tab } = this.menu
            if (tab == "bm") return null /* API /me/business không đếm được số lượng BM */
            let { total_count, limit, current_page } = this[tab]
            let total_page
            if (limit == "Max") total_page = 1
            else total_page = total_count < limit ? 1 : Math.ceil(total_count / limit)
            return `${current_page} / ${total_page}`
        }
    },
    created() {
        console.log(this.facebook)

        /* Lắng nghe sự kiện click ngoài của popup để đóng lại */
        document.addEventListener("click", e => {
            this.onListenClickOut(e, "thead_status_filter", "status_filter_toggle", "status_filter_popup")
            this.onListenClickOut(e, "limit_row", "limit_row_toggle", "limit_row_popup")
        })

        /* Load tài khoản Cá nhân */
        // this.$toast
        this.onLoadAdAccount()
    },

    mounted() {
        $("#date_range_total")
            .daterangepicker(
                {
                    ...daterange_option,
                    opens: "left"
                },
                (start, end, label) => {
                    this.adaccount.ranges.start = start
                    this.adaccount.ranges.end = end
                    this.updateAdDateRange()
                }
            )
            .on("show.daterangepicker", () => {
                this.date_range_total.show = true
            })
            .on("hide.daterangepicker", () => {
                this.date_range_total.show = false
            })
    }
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

$url: "./assets/images/table/";
</style>
