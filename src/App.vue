<!-- eslint-disable vue/require-v-for-key -->
<template>
    <div id="app" class="ads-check-container" :class="s['ads-check-table']">
        <div :class="s.header">
            <div :class="s['header-tabs']">
                <div @click="menu.tab = 'adaccount'" :class="[s['header-tab'], { [s.active]: menu.tab == 'adaccount' }]">TK Cá nhân</div>
                <div @click="onChangeBmTab" :class="[s['header-tab'], { [s.active]: menu.tab == 'bm' }]">TK BM</div>
            </div>

            <div :class="s['header-tools']">
                <!-- <button :class="[s['border-tool'], s['header-tool'], s['header-tool-square']]">
                    <div :class="s['header-tool-tooltip']" class="bottom" data-tooltip="Toàn màn hình">
                        <img :src="imgSrc('tool-full-screen.svg')" alt="Full screen" />
                    </div>
                </button> -->

                <InputGradient v-if="menu.tab == 'adaccount'" style="height: 36px" placeholder="Tìm kiếm" :iconSrc="imgSrc('tool-search.svg')" />
                <InputGradient v-else style="height: 36px" placeholder="Nhập tên hoặc ID" :iconSrc="imgSrc('tool-search.svg')" />

                <button @click="onRefreshData" :class="[s['border-tool'], s['header-tool'], s['header-tool-square']]">
                    <div :class="s['header-tool-tooltip']" class="bottom" data-tooltip="Tải dữ liệu">
                        <img :src="imgSrc('tool-refresh.svg')" alt="Refresh" />
                    </div>
                </button>

                <template v-if="menu.tab == 'adaccount'">
                    <CustomSelect @select="setTableCurrency" :options="['MIX', 'VND', 'USD']" :default="'MIX'">
                        <img :src="imgSrc('tool-currency.svg')" />
                        <div style="margin-left: 5px" class="text-gray-2 text-semibold">
                            {{ currency_exchange.to }}
                        </div>
                        <img :src="imgSrc('tool-arrow-down.svg')" />
                    </CustomSelect>
                </template>

                <button @click="exported.show = true" :class="[s['border-tool'], s['header-tool'], s['header-tool-square']]">
                    <div :class="s['header-tool-tooltip']" class="bottom" data-tooltip="Export">
                        <img :src="imgSrc('tool-export.svg')" alt="Export" />
                    </div>
                </button>

                <template v-if="menu.tab == 'adaccount'">
                    <button id="date_range_total" :class="[s['border-tool'], s['header-tool'], s['header-tool-square'], { 'border-gradient': date_range_total.show }]">
                        <div :class="s['header-tool-tooltip']" class="bottom" :data-tooltip="!date_range_total.show && 'Chọn ngày'">
                            <img :src="imgSrc('tool-calendar.svg')" alt="Date range" />
                        </div>
                    </button>
                </template>

                <button @click="table_customize.show = true" :class="[s['border-tool'], s['header-tool'], s['header-tool-square']]">
                    <div :class="s['header-tool-tooltip']" class="bottom" data-tooltip="Tuỳ chỉnh bảng">
                        <img :src="imgSrc('tool-table-customize.svg')" alt="Customize" />
                    </div>
                </button>

                <button class="btn-gradient font-medium" :class="[s['header-tool'], s['header-purchase']]">
                    <img :src="imgSrc('tool-purchase.svg')" />

                    Mua gói
                </button>
            </div>
        </div>

        <div :class="s.body">
            <div :class="[s.table, s['custom-scrollbar']]">
                <draggable :class="s.thead" v-model="table_config[menu.tab]" handle=".handle" :ghostClass="s['thead-ghost']" draggable=".draggble" animation="250" :style="{ width: table_width + 'px' }">
                    <template v-for="(tbl, tbl_index) in table_config[menu.tab]">
                        <div v-if="tbl.show" :class="[s.th, { draggble: !tbl.fixed }]" :style="{ 'min-width': tbl.width + 'px', left: tbl_index == 0 ? 0 : tbl_index == 1 ? table_config[menu.tab][0].width + 'px' : 'auto' }">
                            <template v-if="tbl.td == 'account_status'">
                                <img id="status_filter_toggle" @click="thead_status_filter.show = !thead_status_filter.show" class="hover-opacity cursor-pointer" :src="imgSrc('thead-status-filter.svg')" style="box-shadow: 0px 4px 9px rgba(0, 0, 0, 0.17)" />
                                <div @click="onSortTable(tbl)" style="margin-left: 2px" :class="[s['th-text'], s[`is-asc-${tbl.is_asc}`]]"></div>

                                <transition name="thead-filter-popup">
                                    <div id="status_filter_popup" :class="s['thead-status-filter']" v-if="thead_status_filter.show">
                                        <div class="flex flex-between text-12">
                                            <div class="text-bold">CHỈ HIỂN THỊ CÁC TÀI KHOẢN:</div>
                                            <div @click="thead_status_filter.selected = []" class="text-blue hover-underline text-semibold">Đặt lại</div>
                                        </div>

                                        <label :for="item.title" :class="s.item" class="flex flex-between flex-row mt-10 px-15 cursor-pointer" v-for="item in thead_status_filter_config" :key="item.title">
                                            <div>
                                                <div class="flex flex-row gap-5">
                                                    <div :class="[s['td-adaccount-status'], s[`td-adaccount-status-${item.code}`]]"></div>
                                                    <div class="text-semibold">
                                                        {{ item.title }}
                                                    </div>
                                                </div>
                                                <div class="text-gray-2 text-regular">Số lượng tài khoản: {{ item.count }}</div>
                                            </div>
                                            <input v-model="thead_status_filter.selected" :value="item.code" :id="item.title" type="checkbox" class="checkbox" />
                                        </label>
                                    </div>
                                </transition>
                            </template>
                            <template v-else>
                                <!-- Move Icon -->
                                <div :class="s['th-move']" class="handle" v-if="!tbl.fixed">
                                    <img :src="imgSrc('thead-move.svg')" />
                                </div>

                                <!-- Title -->
                                <div :class="[s['th-text'], s[`is-asc-${tbl.is_asc}`]]" @click="onSortTable(tbl)">
                                    {{ tbl.th }}
                                </div>

                                <!-- Status Filter -->

                                <!-- Shadow -->
                            </template>
                            <template v-if="tbl.td == 'account'">
                                <div :class="s.tshadow"></div>
                            </template>
                        </div>
                    </template>
                </draggable>

                <template v-if="(menu.tab == 'adaccount' && adaccount.isGettingId) || (menu.tab == 'bm' && bm.isGettingId)">
                    <div :class="[s.trow]" v-for="item in 5" :style="{ width: table_width + 'px' }">
                        <div :style="{ 'min-width': tbl.width + 'px', 'justify-content': tbl.pos }" :class="[s.td]" v-for="tbl in computed_table_config">
                            <div :class="s.skeleton"></div>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div :class="[s.trow, { [s['trow-error']]: item.error }]" v-for="item in filtered_data" :style="{ width: table_width + 'px' }">
                        <div :style="{ 'min-width': tbl.width + 'px', 'justify-content': tbl.pos, left: tbl_index == 0 ? 0 : tbl_index == 1 ? table_config[menu.tab][0].width + 'px' : 'auto' }" :class="[s.td, s[`td-${menu.tab}-${tbl.td}`], { [s.loading]: dataToHtml(tbl, item) == 'loading' }]" v-for="(tbl, tbl_index) in computed_table_config">
                            <template v-if="menu.tab == 'adaccount'">
                                <template v-if="tbl.td == 'account_status'">
                                    <div :data-tooltip="item.status_text" class="right w-full h-full flex flex-center">
                                        <div :class="[s['td-adaccount-status'], s[`td-adaccount-status-${item.account_status}`]]"></div>
                                    </div>
                                </template>

                                <template v-else-if="tbl.td == 'account'">
                                    <div :class="s['td-content']">
                                        <span class="text-semibold">{{ item.name }}</span>
                                        <br />
                                        <span class="text-12" style="padding-top: 3px; color: var(--grey3)">{{ item.account_id }}</span>
                                    </div>
                                </template>
                                <template v-else-if="dataToHtml(tbl, item) == 'loading'">
                                    <div :class="s.skeleton"></div>
                                </template>
                                <template v-else-if="tbl.td == 'main_card' && item.main_card">
                                    <div class="flex flex-row gap-5">
                                        <img :src="imgSrc(`td-card-${item.card_type}.svg`)" />
                                        <div>-</div>
                                        <div>{{ item.card_string }}</div>
                                    </div>
                                </template>
                                <template v-else>
                                    <div :class="s['td-content']">
                                        {{ dataToHtml(tbl, item) }}
                                    </div>
                                </template>
                            </template>

                            <template v-else>
                                <template v-if="dataToHtml(tbl, item) == 'loading'">
                                    <div :class="s.skeleton"></div>
                                </template>
                                <template v-else>
                                    <div :class="s['td-content']" v-html="dataToHtml(tbl, item)"></div>
                                </template>
                            </template>

                            <template v-if="tbl_index == 1">
                                <div :class="s.tshadow"></div>
                            </template>
                        </div>
                    </div>
                </template>

                <div style="height: 100%; background: #fff" :style="{ width: table_width + 'px' }"></div>

                <div v-if="menu.tab == 'adaccount' && !adaccount.isLoading" :class="s.tfoot" :style="{ width: table_width + 'px' }">
                    <div :style="{ 'min-width': tbl.width + 'px', 'justify-content': tbl.pos }" :class="[s.td, s[`tfoot-${tbl.td}`]]" v-for="tbl in computed_table_config">
                        <template v-if="tbl.td == 'account_status'">
                            <img style="width: 38px" :src="imgSrc('smit-logo.svg')" alt="" />
                        </template>

                        <template v-else-if="tbl.td == 'account'">
                            <div>{{ filtered_data.length }} Tài khoản quảng cáo</div>
                        </template>

                        <template v-else>
                            {{ calculateTotalTable(tbl) }}
                        </template>

                        <template v-if="tbl.td == 'account'">
                            <div :class="s.tshadow"></div>
                        </template>
                    </div>
                </div>
            </div>
            <footer :class="s.footer">
                <div>Một sản phẩm của <span class="text-green text-semibold">SMIT.VN</span> <span :class="s['footer-dot']"></span> được tài trợ bởi <span class="text-green text-semibold">DC Group</span></div>
                <div class="flex flex-row text-gray-2 text-semibold cursor-pointer">
                    <div style="margin-right: 6px">Số dòng</div>
                    <div id="limit_row_toggle" :class="s['footer-paging-box']" @click="limit_row.show = !limit_row.show">
                        <div style="padding-right: 8px">
                            {{ menu.tab == "adaccount" ? adaccount.limit : bm.limit }}
                        </div>
                        <button :class="s['footer-paging-btn']">
                            <img :src="imgSrc('footer-pagination-btn.svg')" alt="" />
                        </button>
                        <transition>
                            <template v-if="limit_row.show">
                                <div id="limit_row_popup" :class="s['footer-row']">
                                    <div @click="onSelectLimit(item)" v-for="item in limit_row.list" :class="s['footer-row-item']">
                                        {{ item }}
                                    </div>
                                </div>
                            </template>
                        </transition>
                    </div>
                    <div class="flex flex-row gap-5" style="margin-left: 25px">
                        <div>
                            {{ pagination_status }}
                        </div>
                        <div :class="s['footer-paging-box']">
                            <button :disabled="isPrevDisabled" @click="onPagination('previous_page')" :class="s['footer-paging-btn']">
                                <img style="transform: rotate(-90deg)" :src="imgSrc('footer-pagination-btn.svg')" alt="" />
                            </button>
                            <button :disabled="isNextDisabled" @click="onPagination('next_page')" :class="s['footer-paging-btn']">
                                <img style="transform: rotate(90deg)" :src="imgSrc('footer-pagination-btn.svg')" alt="" />
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>

        <RightDialogue @close="table_customize.show = false" :show="table_customize.show">
            <div class="p-25 flex flex-column h-full" style="width: 350px">
                <div class="flex flex-row gap-5">
                    <img :src="imgSrc('dialogue-customize-header.svg')" />
                    <div class="text-bold">Tuỳ chỉnh và sắp xếp</div>
                    <div class="text-circle">
                        {{ table_config[menu.tab].length }}
                    </div>
                </div>

                <InputGradient class="w-full mt-25" placeholder="Tìm kiếm chỉ số insights" :iconSrc="imgSrc('dialogue-customize-search.svg')" />

                <draggable :class="s['custom-scrollbar']" draggable=".customize-draggble" style="max-height: 75%; overflow: overlay" v-model="table_config[menu.tab]" handle=".handle" :ghostClass="s['customize-ghost']" animation="250">
                    <label :for="`customize-${item.th}`" :class="[s['customize-item'], { ['customize-draggble']: !item.fixed }]" class="flex flex-row gap-5 mt-10 bg-f8 bg-f8 radius-6 cursor-pointer" v-for="item in table_config[menu.tab]">
                        <div style="height: 38px; width: 38px; cursor: move" class="flex flex-center handle hover-opacity">
                            <img :src="imgSrc('thead-move.svg')" />
                        </div>

                        {{ item.th }}

                        <input :disabled="item.fixed" @change="onChangeCustomize(item, $event)" v-model="item.show" :value="item" :id="`customize-${item.th}`" type="checkbox" class="checkbox ml-auto" />
                    </label>
                </draggable>

                <button @click="table_customize.show = false" style="margin-top: auto" :class="s['close-btn']">Đóng</button>
            </div>
        </RightDialogue>

        <CenterDialogue @close="exported.show = false" :show="exported.show">
            <div class="modal" style="width: 500px; border-radius: 15px; padding: 20px 30px">
                <div class="modal-header">
                    <img :src="imgSrc('dialogue-exported-header.svg')" />
                    <div class="modal-header--title">Xuất dữ liệu bảng</div>
                    <div @click="exported.show = false" class="modal-header--close">Đóng</div>
                </div>
                <div class="modal-hr"></div>
                <div class="modal-h2">KIỂU FILE</div>

                <div class="flex gap-10 mt-5" style="position: relative; z-index: 1">
                    <div @click="exported.selected = 'txt'" :class="[s['exported-file-item'], { [s.selected]: this.exported.selected == 'txt' }]" class="cursor-pointer h-40 w-full flex flex-row gap-10 text-gray-2 text-bold border-gray-3 radius-6 px-15">
                        <img :src="imgSrc('dialogue-exported-txt.svg')" />
                        File Txt
                    </div>

                    <div @click="exported.selected = 'excel'" :class="[s['exported-file-item'], { [s.selected]: this.exported.selected == 'excel' }]" class="cursor-pointer h-40 w-full flex flex-row gap-10 text-gray-2 text-bold border-gray-3 radius-6 px-15">
                        <img :src="imgSrc('dialogue-exported-excel.svg')" />
                        File Excel
                    </div>
                </div>

                <div class="modal-h2 mt-30">TÊN FILE</div>

                <div class="flex flex-row h-40 border-gray-3 radius-6 gap-5 focus-within-gradient mt-5">
                    <input v-model="exported.file_name" placeholder="Nhập tên file bạn muốn lưu" class="h-full w-full radius-6 pl-15" type="text" style="padding-right: 45px" />
                    <img style="position: absolute; right: 15px" :src="imgSrc('dialogue-exported-edit.svg')" />
                </div>

                <button @click="onExport" class="btn-gradient h-40 radius-6 w-full text-bold mt-30">Tải xuống file</button>
            </div>
        </CenterDialogue>
    </div>
</template>

<script>
import CustomSelect from "./components/CustomSelect.vue"

import {
    // Component
    RightDialogue,
    InputGradient,
    CenterDialogue,
    GradientRadio,
    draggable,
    _fetch,
    Icon

    // Function
    // Facebook
} from "@smit/shared"

import USD from "./usd"
import VND from "./vnd"

export default {
    props: ["facebook"],
    components: {
        draggable,
        CustomSelect,
        RightDialogue,
        InputGradient,
        CenterDialogue,
        GradientRadio,
        Icon
    },
    data() {
        return {
            menu: {
                tab: "adaccount"
            },
            date_range_total: {
                show: false
            },
            table_customize: {
                show: false
            },
            exported: {
                show: false,
                selected: "txt",
                file_name: "Download"
            },
            adaccount: {
                isLoading: false,
                isGettingId: true,
                data: [],
                previous_page: null,
                next_page: null,
                current_page: 1,
                total_count: 1,
                ranges: {
                    start: null,
                    end: null
                },
                limit: 50
            },

            bm: {
                isLoading: false,
                isGettingId: false,
                data: [],
                previous_page: null,
                next_page: null,
                current_page: 1,
                total_count: 1,
                limit: 50
            },

            limit_row: {
                show: false,
                selected: 20,
                list: [1, 10, 50, 100, 200, 500, "Max"]
            },

            show: false,
            s: this.$style,

            thead_status_filter: {
                show: false,
                selected: []
            },

            table_config: {
                adaccount: [
                    {
                        th: "Trạng thái",
                        td: "account_status",
                        fixed: true,
                        width: 50,
                        pos: "center",
                        is_asc: null,
                        show: true,
                        export_by: "status_text"
                    },
                    {
                        th: "Tài khoản",
                        td: "account",
                        fixed: true,
                        width: 250,
                        sort_by: "name",
                        is_asc: null,
                        show: true,
                        export_by: "name"
                    },
                    {
                        th: "Số dư",
                        td: "balance",
                        width: 180,
                        pos: "right",
                        is_asc: null,
                        show: true,
                        is_money: true
                    },
                    {
                        th: "Ngưỡng",
                        td: "thresh",
                        width: 180,
                        pos: "right",
                        is_asc: null,
                        show: true,
                        is_money: true
                    },
                    {
                        th: "Limit",
                        td: "limit",
                        width: 180,
                        pos: "right",
                        is_asc: null,
                        show: true,
                        is_money: true
                    },
                    {
                        th: "Tổng tiêu",
                        td: "tong_tieu",
                        width: 180,
                        pos: "right",
                        is_asc: null,
                        show: true,
                        is_money: true
                    },
                    {
                        th: "Tiền tệ",
                        td: "currency_text",
                        width: 150,
                        pos: "right",
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "Role",
                        td: "user_role_text",
                        width: 180,
                        pos: "right",
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "Số lượng thẻ",
                        td: "main_card",
                        width: 200,
                        pos: "right",
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "Ngày lập hoá đơn",
                        td: "ngay_lap_hoa_don",
                        width: 210,
                        pos: "right",
                        is_asc: null,
                        show: true,
                        sort_by: "ngay_lap_hoa_don_unix"
                    },
                    {
                        th: "Số ngày đến kỳ TT",
                        td: "so_ngay_den_ky_tt",
                        width: 210,
                        pos: "right",
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "Lý do disable",
                        td: "disable_reason_text",
                        width: 210,
                        pos: "right",
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "Ngày tạo TKQC",
                        td: "ngay_tao_tai_khoan",
                        width: 200,
                        pos: "right",
                        is_asc: null,
                        show: true,
                        sort_by: "ngay_tao_tai_khoan_unix"
                    },
                    {
                        th: "Loại TK",
                        td: "loai_tk",
                        width: 170,
                        pos: "right",
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "Timezone",
                        td: "timezone",
                        width: 230,
                        pos: "right",
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "Tạo từ BM",
                        td: "tao_tu_bm",
                        width: 200,
                        pos: "right",
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "Quốc gia TKQC",
                        td: "quoc_gia",
                        width: 200,
                        pos: "right",
                        is_asc: null,
                        show: true
                    }
                ],
                bm: [
                    {
                        th: "Trạng thái",
                        td: "status",
                        fixed: true,
                        width: 120,
                        pos: "center",
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "Tên BM",
                        td: "name",
                        fixed: true,
                        width: 250,
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "Loại BM",
                        td: "bm_type",
                        width: 180,
                        pos: "right",
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "Role",
                        td: "role",
                        width: 180,
                        pos: "right",
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "Limit",
                        td: "limit",
                        width: 180,
                        pos: "right",
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "Admin ẩn",
                        td: "hide_admin",
                        width: 180,
                        pos: "right",
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "Verified",
                        td: "verify_status",
                        width: 150,
                        pos: "right",
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "Created",
                        td: "created",
                        width: 180,
                        pos: "right",
                        is_asc: null,
                        show: true,
                        sort_by: "created_unix"
                    },
                    {
                        th: "ID BM",
                        td: "id",
                        width: 200,
                        pos: "right",
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "SL Admin",
                        td: "admin_count",
                        width: 210,
                        pos: "right",
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "SL Adaccount",
                        td: "adaccount_count",
                        width: 210,
                        pos: "right",
                        is_asc: null,
                        show: true
                    },
                    {
                        th: "Chất lượng BM",
                        td: "bm_quality",
                        width: 210,
                        pos: "start",
                        is_asc: null,
                        show: true
                    }
                ]
            },

            test: 5,

            currency_exchange: {
                to: "MIX",
                USD,
                VND
            }
        }
    },
    methods: {
        imgSrc(name) {
            return require("./assets/images/table/" + name)
        },

        /* Quy đổi tiền tệ */
        setTableCurrency(e) {
            if (this.currency_exchange.to == e) return
            this.currency_exchange.to = e
        },

        /* Tính tổng chỉ số */
        calculateTotalTable(tbl) {
            let mix = "MIX"

            const { td } = tbl
            let data = this.filtered_data

            /* Nếu cột nào là tiền thì tính tổng  */
            if (tbl.is_money) {
                if (this.is_mixed_tong_tieu) return mix
                let total = data.reduce((a, b) => {
                    if (b[td] != -5) return a + this.calculateTdByCurrency(tbl, b)
                    return a
                }, 0)
                /* Hàm global dùng để format tiền */
                return formatMoney.format(total)
            }

            /* Những cột không hiển thị tổng trả về null */
            return null
        },

        /* Hiển thị dữ liệu theo Quy đổi tiền tệ */
        calculateTdByCurrency(tbl, item) {
            const { td } = tbl
            let { to } = this.currency_exchange
            if (to == "MIX") return item[td]
            let rate = this.currency_exchange[to][item.currency]

            if (item[td] > 0) {
                let value = item[td] / +rate
                /* toFixed(5) để chuyển qua lại giữa VND và USD số tiền không bị chênh lệch */
                return to == "USD" ? +value.toFixed(5) : +value.toFixed(0)
            }
            return item[td]
        },

        /* Hiển thị dữ liệu ra bảng */
        dataToHtml(tbl, item) {
            const { td, is_money } = tbl
            if (item[td] === undefined) return "loading"
            if (item[td] == null || item[td] == -5) return "-"
            if (td == "limit" && item[td] == -1) return "No limit"

            if (is_money) {
                let value = this.calculateTdByCurrency(tbl, item)
                return formatMoney.format(value)
            }

            return item[td]
        },

        /* Sắp xếp bảng khi click icon sắp xếp ở thead */
        onSortTable(tbl) {
            /* Hàm sort global sử dụng thư viện fast-sort */

            let opt = tbl.sort_by || tbl.td

            /* Nếu sắp xếp cột chưa từng sắp xếp sẽ xoá trạng thái sắp xếp ở cột cũ */
            if (tbl.is_asc == null) {
                let sortedIndex = this.table_config[this.menu.tab].findIndex(x => x.is_asc !== null)
                if (sortedIndex != -1) this.$set(this.table_config[this.menu.tab][sortedIndex], "is_asc", null)
            }

            let data = this.menu.tab == "adaccount" ? this.adaccount.data : this.bm.data

            if (tbl.is_asc) {
                tbl.is_asc = false
                data = sort(data).by([{ desc: u => u[opt] }])
            } else {
                tbl.is_asc = true
                data = sort(data).by([{ asc: u => u[opt] }])
            }
            if (this.menu.tab == "adaccount") this.adaccount.data = data
            else this.bm.data = data
        },

        /* Custom bảng: Hàm chặn khi người dùng F12 cố tắt checkbox của các trường cố định */
        onChangeCustomize(item, e) {
            if (item.fixed) {
                e.preventDefault()
                return (item.show = true)
            }
        },

        /*  Tính toán lại tổng tiêu theo date_range */
        async updateAdDateRange() {
            let { start, end } = this.adaccount.ranges
            start = start.format("YYYY-MM-DD")
            end = end.format("YYYY-MM-DD")
            const FIELDS = this.is_maximum_range ? "date_preset(maximum)" : `time_range({since: '${start}',until:'${end}'})`

            /* Set cột tổng tiêu về Undefined để hiển thị Loading */
            this.adaccount.data = this.adaccount.data.map(x => ({
                ...x,
                tong_tieu: undefined
            }))

            let payloads = this.adaccount.data.map(item => {
                let relative_url = `/act_${item.account_id}?fields=account_id,insights.${FIELDS}{spend}`
                let method = "GET"

                return {
                    id: item.account_id,
                    relative_url,
                    method
                }
            })

            let payloads_chunk = _.chunk(payloads, 50)

            await Promise.all(
                payloads_chunk.map(async payload => {
                    let responses = await this.facebook.graph("", {
                        params: {
                            method: "POST",
                            batch: JSON.stringify(payload),
                            include_headers: false
                        }
                    })

                    responses.map((res, res_index) => {
                        let { id } = payload[res_index]
                        let user_index = this.adaccount.data.findIndex(x => x.account_id == id)
                        let item = JSON.parse(res.body)

                        if (item.error) return this.$set(this.adaccount.data[user_index], "tong_tieu", -5)

                        let tong_tieu = +item?.insights?.data?.[0]?.spend || 0
                        this.$set(this.adaccount.data[user_index], "tong_tieu", tong_tieu)
                    })
                })
            )
        },

        /* START - Load adaccount Data */
        async loadAdAccountIdAndRole(next = null) {
            /* Đang get ID -> Hiển thị loading bảng  */
            this.adaccount.isGettingId = true

            let limit = this.adaccount.limit == "Max" ? 500 : this.adaccount.limit

            do {
                let res = await this.facebook.graph(next || "/me/adaccounts", {
                    params: {
                        limit,
                        fields: `name,account_id,account_status,user_role`,
                        summary: 1
                    }
                })
                if (res.error) {
                    return this.$toast.error(res.error.message, {
                        position: "top-center"
                    })
                }

                let data = res.data.map(item => {
                    /* Trạng thái tài khoản + Role khi get sẽ ra Integer -> Convert sang Text để sử dụng */
                    item.status_text = this.facebook.getAccountStatus(item.account_status)
                    item.user_role_text = this.facebook.getUserRole(item.user_role)
                    return { ...item }
                })

                this.adaccount.data = [...this.adaccount.data, ...data]

                next = res?.paging?.next || null
                /* Nếu Row hiển thị không phải max sẽ dừng lại để hiển thị next trang */
                if (res?.summary?.total_count) this.adaccount.total_count = res?.summary?.total_count
                if (limit != "Max") {
                    this.adaccount.previous_page = res?.paging?.previous || null
                    this.adaccount.next_page = next
                    next = null
                }
            } while (next)

            /* Get xong ID -> Hiển thị loading các cột chỉ số */
            this.adaccount.isGettingId = false
        },
        async loadAdaccountData() {
            /* Role Integer do Facebook trả về đủ quyền gọi field Admin */
            const ADMIN_NUMBER = [281423141961500, 461336843905730, 610690166001223]

            // const TONG_TIEU_FIELDS = let total_field = isDay ? `,insights.time_range({since: '${start}',until:'${end}'}){spend}` : `,insights.date_preset(maximum){spend}`
            const TONG_TIEU_FIELDS = `,insights.date_preset(maximum){spend}`

            /* Field không cần quyền Admin */
            const BASIC_FIELDS = ["account_id", "owner_business", "created_time", "next_bill_date", "currency", "adtrust_dsl", "timezone_name", "timezone_offset_hours_utc", "business_country_code", "disable_reason", "adspaymentcycle{threshold_amount}", "balance", "owner"]

            /* Field cần quyền Admin */
            const ADMIN_FIELDS = ["is_prepay_account,total_prepay_balance,all_payment_methods{pm_credit_card{display_string},payment_method_direct_debits{address,display_string,status},payment_method_paypal{email_address},payment_method_tokens{current_balance,original_balance,time_expire,type}}"]

            let payloads = this.adaccount.data.map(item => {
                /* Nếu get được user_role và user_role là Admin ? Get toàn bộ fields : Gọi field thường  */
                let fields = (item.user_role && ADMIN_NUMBER.includes(+item.user_role) ? [...BASIC_FIELDS, ...ADMIN_FIELDS].join(",") : BASIC_FIELDS.join(",")) + TONG_TIEU_FIELDS
                return {
                    id: item.account_id,
                    relative_url: `/act_${item.account_id}?fields=${fields}`,
                    method: "GET"
                }
            })

            /* Dùng Lodash để chia array to thành array của 50 array nhỏ */
            let payloads_chunk = _.chunk(payloads, 50)

            await Promise.all(
                payloads_chunk.map(async payload => {
                    let responses = await this.facebook.graph("", {
                        params: {
                            method: "POST",
                            batch: JSON.stringify(payload),
                            include_headers: false
                        }
                    })

                    responses.map((res, res_index) => {
                        let { id } = payload[res_index]
                        let item = JSON.parse(res.body)
                        let user_index = this.adaccount.data.findIndex(x => x.account_id == id)
                        if (item.error) return this.$set(this.adaccount.data, user_index, { ...this.adaccount.data[user_index], error: item.error })

                        /* Tự custom dữ liệu để có thể Sắp xếp + Export + Hiển thị */
                        let currency = item.currency
                        let pay_type = item.is_prepay_account !== undefined ? (item.is_prepay_account == true ? "TT" : "TS") : null
                        let balance = pay_type == "TT" ? +item?.total_prepay_balance?.amount ?? -5 : item.balance != undefined ? this.facebook.exchangeCurrency(item.balance, currency) : -5
                        let loai_tai_khoan_ca_nhan = this.facebook.isUserID(item.owner) == true ? "thường" : "tách"
                        let thresh = item?.adspaymentcycle?.data ? this.facebook.exchangeCurrency(item.adspaymentcycle?.data?.[0]?.threshold_amount, currency) : -5
                        let limit = item?.adtrust_dsl || -5
                        let tong_tieu = +item?.insights?.data?.[0]?.spend || 0
                        let nguong_con_lai = -5
                        if (pay_type === "TS" && thresh !== -5 && balance !== -5) nguong_con_lai = Math.round(thresh - balance)
                        let ngay_lap_hoa_don = item.next_bill_date ? moment(item.next_bill_date).format("DD-MM-YYYY") : null
                        let ngay_lap_hoa_don_unix = item.next_bill_date ? moment(item.next_bill_date).unix() : -5

                        let so_ngay_den_ky_tt = item.next_bill_date ? moment(item.next_bill_date).diff(moment(), "days") : null

                        let main_card = item?.all_payment_methods?.pm_credit_card?.data?.[0]?.display_string?.toLowerCase() || null

                        let [card_type, card_string] = main_card ? main_card.split("·").map(x => x.trim()) : []

                        let extend = {
                            ...item,
                            balance,
                            thresh,
                            limit,
                            tong_tieu,
                            nguong_con_lai,
                            currency_text: `${currency}-${pay_type || ""}`,
                            // số lượng thẻ: Hỏi a Bách
                            main_card,
                            card_type,
                            card_string,
                            ngay_lap_hoa_don,
                            ngay_lap_hoa_don_unix,
                            so_ngay_den_ky_tt,
                            disable_reason_text: this.facebook.getAdaccountDisabledReason(item.disable_reason),
                            timezone: `${item.timezone_name} | ${item.timezone_offset_hours_utc >= 0 ? `+${item.timezone_offset_hours_utc}` : item.timezone_offset_hours_utc}`,
                            ngay_tao_tai_khoan: item.created_time ? moment(item.created_time).format("DD-MM-YYYY") : null,
                            ngay_tao_tai_khoan_unix: item.created_time ? moment(item.created_time).unix() : -5,
                            loai_tk: item.owner_business ? "Business" : `Cá nhân ${loai_tai_khoan_ca_nhan}`,
                            tao_tu_bm: +item?.owner_business?.id || -5,
                            quoc_gia: item?.business_country_code || null
                        }

                        this.$set(this.adaccount.data, user_index, { ...this.adaccount.data[user_index], ...extend })
                    })
                })
            )

            /* Adaccount Load hoàn thành -> Hiển thị dữ liệu */
        },
        async onLoadAdAccount(next) {
            this.adaccount.data = []
            this.adaccount.isLoading = true

            /* Get ID và Role của tài khoản để gửi field tương ứng */
            await this.loadAdAccountIdAndRole(next)

            /* Tải chỉ số tài khoản theo role đã get được */
            await this.loadAdaccountData()
            this.adaccount.isLoading = false
        },
        /* End - Load adaccount Data */

        /* Export dữ liệu bảng */
        onExport() {
            let list = []
            for (let item of this.adaccount.data) {
                let obj = Object()
                for (let tbl of this.export_list) {
                    let value = item[tbl.td]
                    if (value == null || value == -5) value = "-"
                    else if (tbl.td == "limit" && value == -1) value = "No limit"
                    else if (tbl.is_money) value = this.calculateTdByCurrency(tbl, item)
                    obj[tbl.th] = value
                }
                list.push(obj)
            }
            exportFile(this.exported.selected, list, this.exported.file_name)
        },

        /* Tải lại dữ liệu bảng */
        onRefreshData() {
            let { tab } = this.menu
            this[tab].data = []
            this[tab].current_page = 1
            if (tab == "adaccount") return this.onLoadAdAccount()
            return this.onLoadBmData()
        },

        /* Set limit và gọi lại bảng dữ liệu */

        onChangeBmTab() {
            this.menu.tab = "bm"
            if (!this.bm.data.length) this.onLoadBmData()
        },

        /* START - Load BM Data */

        async onLoadBmData(next) {
            this.bm.isLoading = true
            this.bm.data = []
            await this.onGetBmGraph(next)
            await Promise.all([this.onGetBmType(), this.onGetBmQuality(), this.onGetBmHideAdmin()])
            this.bm.isLoading = false
        },

        async onGetBmGraph(next) {
            this.bm.isGettingId = true

            let limit = this.bm.limit == "Max" ? 500 : this.bm.limit
            do {
                let res = await this.facebook.graph(next || "/me/businesses", {
                    params: {
                        fields: "name,id,verification_status,business_users,allow_page_management_in_www,sharing_eligibility_status,created_time,permitted_roles,client_ad_accounts.summary(1),owned_ad_accounts.summary(1)",
                        limit,
                        summary: 1
                    }
                })

                if (res.error) return this.$toast.error(res.error.message, { position: "top-center" })

                let data = res.data.map(item => {
                    let obj = Object()
                    obj.name = item.name
                    obj.id = +item.id
                    obj.status = item.allow_page_management_in_www === true ? "Live".fontcolor("green") : "Die".fontcolor("red")
                    obj.limit = item.sharing_eligibility_status === "enabled" ? "BM350" : "BM50"
                    obj.verify_status = item.verification_status.replace(/_/g, " ").toUpperCase()
                    obj.created = moment(item.created_time).format("DD-MM-YYYY")
                    obj.created_unix = moment(item.created_time).unix()
                    obj.role = item.permitted_roles?.find(x => x == "ADMIN" || x == "EMPLOYEE") || "Khác"
                    obj.adaccount_count = item.client_ad_accounts?.summary?.total_count || 0 + item?.owned_ad_accounts?.summary?.total_count || 0
                    obj.admin_count = item?.business_users?.data?.length || 0
                    obj.bm_type = undefined
                    obj.hide_admin = undefined
                    obj.bm_quality = undefined
                    return obj
                })

                this.bm.data = [...this.bm.data, ...data]

                next = res?.paging?.next || null
                /* Nếu Row hiển thị không phải max sẽ dừng lại để hiển thị next trang */
                if (res?.summary?.total_count) this.adaccount.total_count = res?.summary?.total_count
                if (limit != "Max") {
                    this.bm.previous_page = res?.paging?.previous || null
                    this.bm.next_page = next
                    next = null
                }
            } while (next)

            this.bm.isGettingId = false
        },

        async onGetBmType() {
            console.log("Start bm type")
            let { fb_dtsg, lsd } = this.facebook
            let data = this.bm.data

            let chunks = _.chunk(data, 10)

            await Promise.all(
                chunks.map(async chunk => {
                    return chunk.map(async item => {
                        let res = await this.facebook.fetch({
                            url: `https://business.facebook.com/business/adaccount/limits/?business_id=${item.id}&__a=1&fb_dtsg=${fb_dtsg}&lsd=${lsd}`
                        })
                        let bm_index = data.findIndex(x => item.id == x.id)
                        if (res.error) this.$set(this.bm.data[bm_index], "bm_type", res.msg)
                        else {
                            let limit = res?.payload?.adAccountLimit
                            let result = limit ? `BM${limit}` : null
                            this.$set(this.bm.data[bm_index], "bm_type", result)
                        }
                    })
                })
            )

            console.log("Finish bm type")
        },

        async onGetBmQuality() {
            console.log("Start bm quality")
            let data = this.bm.data

            let chunks = _.chunk(data, 10)

            await Promise.all(
                chunks.map(async (chunk, index) => {
                    if (index != 0) await wait(index * 2000)
                    return chunk.map(async item => {
                        let res = await this.facebook.graphql({
                            dpr: 1,
                            variables: JSON.stringify({ entity_id: item.id, action: null }),
                            doc_id: 3920367411328805
                        })
                        let bm_index = data.findIndex(x => item.id == x.id)
                        if (res.error) this.$set(this.bm.data[bm_index], "bm_quality", res.msg)
                        else {
                            let is_restricted = res?.data.data?.isRestricted || false
                            this.$set(this.bm.data[bm_index], "bm_quality", is_restricted ? "✅ Tốt" : "⛔️ Hạn chế")
                        }
                    })
                })
            )

            console.log("Finish bm quality")
        },

        async onGetBmHideAdmin() {
            console.log("Start get hide admin")
            let chunks = _.chunk(this.bm.data, 10)
            await Promise.all(
                chunks.map(async (chunk, index) => {
                    if (index > 0) await wait(index * 1000)
                    return chunk.map(async item => {
                        let [admin_people, admin_latest] = await Promise.all([this.onGetBmAdminPeople(item.id), this.onGetBmLatest(item.id)])

                        let bm_index = this.bm.data.findIndex(x => x.id == item.id)
                        if (admin_people.error || admin_latest.error) return this.$set(this.bm.data[bm_index], "hide_admin", null)

                        let hide_admin_count = Math.abs(admin_people.length - admin_latest.length)
                        this.$set(this.bm.data[bm_index], "hide_admin", hide_admin_count)
                    })
                })
            )
            console.log("Finish get hide admin")
        },

        async onGetBmAdminPeople(bm_id) {
            let list = []
            let next = null
            do {
                let res = await this.facebook.graph(next || `/${bm_id}/business_users`, {
                    params: {
                        fields: "id",
                        limit: 300
                    }
                })

                if (!res.data) {
                    return {
                        error: true
                    }
                }

                if (res?.data?.length) {
                    list = [...list, ...res.data]
                }
                next = res?.paging?.next || null
                if (next) await wait(500)
            } while (next)
            return list
        },

        async onGetBmLatest(bm_id) {
            let list = []
            let cursor = ""
            do {
                let res = await this.facebook.graphql({
                    doc_id: "5337841202999126",
                    variables: JSON.stringify({
                        count: 300,
                        cursor,
                        asset_types: ["PAGE"],
                        orderBy: null,
                        searchTerm: null,
                        permissions: [],
                        id: bm_id
                    })
                })

                if (!res?.data?.node?.business_users_and_invitations?.edges) {
                    return {
                        error: true
                    }
                }

                let users = res?.data?.node?.business_users_and_invitations?.edges || []

                users.map(x => {
                    if (x?.nameColumn?.__typename === "BusinessUser") {
                        list.push({ id: x?.nameColumn?.id || null })
                    }
                })

                if (res?.data?.node?.business_users_and_invitations?.page_info?.has_next_page) {
                    cursor = res?.data?.node?.business_users_and_invitations?.page_info?.end_cursor
                    await wait(1000)
                } else cursor = null
            } while (cursor)

            return list
        },

        /* END - Load BM Data */

        /* Đóng popup khi clickout */
        onListenClickOut(event, condition, toggle, container) {
            if (this[condition].show) {
                let toggle_element = document.getElementById(toggle)
                if (toggle_element.contains(event.target)) return
                let container_element = document.getElementById(container)
                if (!container_element.contains(event.target)) this[condition].show = false
            }
        },

        onSelectLimit(item) {
            let { tab } = this.menu
            this[tab].limit = item
            this[tab].current_page = 1
            this[tab].total_page = null

            if (tab == "adaccount") return this.onLoadAdAccount()
            return this.onLoadBmData()
        },

        onPagination(opt) {
            let { tab } = this.menu
            let url = this[tab][opt]
            if (!url) return
            if (opt == "next_page") this[tab].current_page++
            else this[tab].current_page--
            return tab == "adaccount" ? this.onLoadAdAccount(url) : this.onLoadBmData(url)
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

.ads-check-table {
    .header {
        .border-tool {
            border: 1px solid #e6e8ec;
            border-radius: 6px;
        }

        height: 60px;
        background: #fff;
        width: 100%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-right: 15px;
        border-radius: 0 10px 0 0;
        z-index: 2;
        &::before {
            content: "";
            width: 20px;
            height: 20px;
            position: absolute;
            bottom: -20px;
            background-image: radial-gradient(circle at 100% 100%, transparent 0%, transparent 26px, #fff 20px);
        }

        &-tabs {
            display: flex;
            height: 36px;
            padding: 3px;
            width: fit-content;
            background: #f8f8f8;
            border-radius: 4px;
        }
        &-tab {
            height: 100%;
            width: 95px;
            color: var(--grey2);
            font-family: Medium;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            &.active {
                background: #ffffff;
                box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.09);
                color: var(--grey);
                font-family: Semibold;
            }
            &:not(.active) {
                transition: all 0.2s;
                &:hover {
                    cursor: pointer;
                    opacity: 0.8;
                }
            }
        }

        &-tools {
            display: flex;
            gap: 10px;
            z-index: 1;
        }
        &-tool {
            cursor: pointer;
            transition: background-color 0.2s;
            flex-shrink: 0;
            height: 36px;
            position: relative;
            background-color: #ffffff;

            display: flex;
            align-items: center;
            justify-content: center;
            &:not(.locked):hover {
                background-color: #f8f8f8;
            }
            &:not(.locked):active {
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
            &-square {
                width: 36px;
            }
            &-tooltip {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                width: 100%;
                background: transparent;
            }
        }

        &-select {
            padding: 0 8px;
            &--title {
            }
        }

        &-purchase {
            padding: 0 8px;
            gap: 3px;
            color: #fff;
            border: 1px solid transparent;
            border-radius: 6px;
        }
    }

    .body {
        padding-left: 3px;
        padding-top: 3px;
        height: calc(100vh - 73px - 48px);
    }

    .table {
        display: flex;
        flex-direction: column;
        position: relative;
        width: 100%;
        height: 100%;

        // border-bottom: 3px solid transparent;
        overflow: overlay;
        z-index: 1;

        .thead {
            position: sticky;
            top: 0;
            z-index: 4;
            display: flex;
            height: 40px;
            .th {
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 40px;
                background: #fff;
                padding-right: 15px;
                font-family: Bold;
                border-bottom: 1px solid #e6e8ec;

                &:first-child {
                    border-radius: 6px 0 0 0;
                    position: sticky;
                    top: 0;
                    padding-left: 15px;
                    // z-index: 4;
                }
                &:nth-child(2) {
                    position: sticky;
                    top: 0;
                    padding-left: 15px;
                }

                &:not(:last-child) {
                    border-right: 1px solid rgba(230, 232, 236, 0.5);
                }
                &-text {
                    cursor: pointer;
                    &:after {
                        content: url($url + "thead-sort.svg");
                        border-radius: 2px;
                        transition: background-color 0.2s;
                    }
                    &:hover {
                        &:after {
                            background: #e6e8ec;
                        }
                    }

                    &.is-asc {
                        &-true {
                            &:after {
                                content: url($url + "thead-sort-asc.svg");
                            }
                        }
                        &-false {
                            &:after {
                                content: url($url + "thead-sort-desc.svg");
                            }
                        }
                    }
                }
                &-move {
                    height: 40px;
                    width: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: move;
                }
            }

            &-ghost {
                // background: rgba(27, 155, 72, 0.07) !important;
                // border: 0.5px dashed #fff !important;
            }
        }

        .trow {
            display: flex;
            background: #fff;
            &:nth-child(odd) {
                // background: #f8fdfc;
            }
            &:hover {
                background: #e0fff5;
            }
            &-error {
                background: red !important;
            }
        }

        .td {
            padding: 0 15px;
            height: 50px;
            display: flex;
            align-items: center;
            position: relative;
            &:not(:last-child) {
                border-bottom: 1px solid rgba(230, 232, 236, 0.5);
                border-right: 1px solid rgba(230, 232, 236, 0.5);
            }

            &:first-child {
                position: sticky;
                left: 0;
                z-index: 3;
                background: inherit;
            }
            &:nth-child(2) {
                position: sticky;
                left: 50px;
                z-index: 2;
                background: inherit;
            }

            &-content {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                color: var(--grey);
            }
            &-adaccount {
                &-status {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: var(--grey2);
                    &-1 {
                        background: var(--green);
                    }
                    &-2 {
                        background: var(--red);
                    }
                    &-3 {
                        background: #f0b10d;
                    }
                    &-7 {
                        background: #6b18f2;
                    }
                    &-9 {
                        background: #1877f2;
                    }
                }

                &-account_status {
                    padding: 0;
                }
            }
            &-bm {
                &-bm_quality {
                    justify-content: start;
                    padding-left: 90px;
                }
            }

            // &.loading {
            //     padding: 0;
            // }
        }

        .tshadow {
            box-shadow: 3px 4px 12px rgba(0, 0, 0, 0.26);
            height: calc(100% + 1px);
            width: 0.5px;
            position: absolute;
            right: 0;
        }

        .tfoot {
            display: flex;
            position: sticky;
            bottom: 0px;
            z-index: 3;
            font-family: Bold;
            background: #ffffff;
            box-shadow: 0px -4px 4px rgba(0, 0, 0, 0.03);
            border-bottom: 1px solid transparent;
            border-top: 1px solid transparent;
            .td {
                height: 50px;
                &:first-child {
                    border-right: 1px solid transparent;
                }
            }
        }
    }

    .custom-scrollbar {
        &::-webkit-scrollbar {
            width: 4px;
            height: 6px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        &::-webkit-scrollbar-thumb {
            background: rgba(119, 126, 144, 0.4);
            border-radius: 5px;
        }

        &::-webkit-scrollbar-thumb:hover {
            background: #abb5ce;
        }
    }

    .facebook-status {
        border-radius: 22px;
        font-family: Medium;
        height: 21px;
        padding: 0 6px;
        line-height: 21px;
    }

    .footer {
        margin-top: 3px;
        height: 45px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 0 0 10px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 30px;
        &-dot {
            display: inline-block;
            width: 4px;
            height: 4px;
            background: #777e90;
            border-radius: 50%;
            transform: translateY(-2px);
            margin: 0 5px;
        }

        &-paging {
            &-box {
                background: #ffffff;
                border: 0.5px solid #e6e8ec;
                border-radius: 5px;
                height: 24px;
                display: flex;
                align-items: center;
                padding: 0 2px;
                gap: 2px;
                position: relative;
                z-index: 4;
            }
            &-btn {
                transition: opacity 0.2s;
                &:not(:disabled):hover {
                    opacity: 0.8;
                }
                &:disabled {
                    user-select: none;
                    cursor: not-allowed;
                    opacity: 0.5;
                }
            }
        }

        &-row {
            position: absolute;
            width: 100%;
            bottom: calc(100% + 5px);
            background: #fff;
            left: 0;
            border-radius: 6px;
            border: 1px solid #e6e8ec;
            color: var(--grey2);
            padding: 6px;
            box-shadow: 0px 1px 10px rgb(0 0 0 / 20%);
            &-item {
                width: 100%;
                border-radius: 5px;
                height: 23px;
                display: flex;
                align-items: center;
                padding: 0 5px;
                &:hover {
                    background: #e6e8ec;
                }
            }
        }
    }

    .customize {
        &-item {
            padding-right: 15px;
            height: 38px;
        }
        &-ghost {
            background: rgba(27, 155, 72, 0.07);
            /* Green - Shade 1 */

            border: 0.5px dashed #27e4a0;
        }
    }

    .close-btn {
        border: 1px solid #e6e8ec;
        border-radius: 6px;
        height: 40px;
        width: 100%;
        font-family: Semibold;
        font-size: 13px;
        background: transparent;
        transition: all 0.2s;
        &:hover {
            color: red;
        }
    }

    .exported {
        &-file {
            &-item {
                &:not(.selected):hover {
                    background: rgba(247, 247, 247, 0.6);
                }
                &.selected {
                    background: #e7faf4;
                    box-shadow: 0px 7px 28px rgba(27, 155, 94, 0.08);
                    color: var(--blue1);
                    @include border-gradient;
                }
            }
        }
    }

    .locked {
        // opacity: 0.6 !important;
        cursor: not-allowed !important;
        position: relative;
        background: #f6f6f6 !important;
        img {
            opacity: 0.5 !important;
        }
        &:after {
            content: url($url + "feature-locked.svg");
            position: absolute;
            top: -7px;
            right: -7px;
        }
    }

    .thead-status-filter {
        position: absolute;
        left: 0;
        top: calc(100% + 1px);
        background: #ffffff;
        box-shadow: 0px 24px 49px -12px rgba(0, 0, 0, 0.21);
        border-radius: 0px 0px 10px 10px;
        width: 280px;
        padding: 20px;

        .status-icon {
            width: 7px;
            height: 7px;
            border-radius: 50%;
        }

        .item {
            background: #f8f8f8;
            border-radius: 6px;
            height: 50px;
            transition: all 0.3s;
            &:hover {
                background: #f0f0f0;
            }
        }
    }

    @keyframes moving-gradient {
        0% {
            background-position: -250px 0;
        }
        100% {
            background-position: 250px 0;
        }
    }
    .skeleton {
        display: block;
        height: 10px;
        width: 70%;
        background: linear-gradient(to right, #eee 20%, #ddd 50%, #eee 80%);
        background-size: 500px 100px;
        animation: moving-gradient 1s linear infinite;
        border-radius: 5px;
    }
}
</style>

<style scoped>
.thead-filter-popup-enter {
    transition: all 0.4s ease;
    opacity: 0;
    transform: scale(0, 0);
    transform-origin: 10px -30px;
}

.thead-filter-popup-enter-to {
    transition: all 0.4s ease;
    opacity: 1;
    transform: scale(1, 1);
    transform-origin: 10px -30px;
}

.thead-filter-popup-leave-to {
    transition: all 0.4s ease-in-out;
    opacity: 0;
    transform: scale(0, 0);
    transform-origin: 10px -50px;
}
</style>
