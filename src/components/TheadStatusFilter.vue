<template>
    <transition name="thead-filter-popup">
        <div :class="s['thead-status-filter']" v-if="show">
            <div class="flex flex-between text-12">
                <div class="text-bold">CHỈ HIỂN THỊ CÁC TÀI KHOẢN:</div>
                <div class="text-blue hover-underline text-semibold">Đặt lại</div>
            </div>

            <label :for="item.title" :class="s.item" class="flex flex-between flex-row mt-10 px-15 cursor-pointer" v-for="item in status" :key="item.title">
                <div>
                    <div class="flex flex-row gap-5">
                        <div :class="['td-status', `td-status-${item.code}`]"></div>
                        <div class="text-semibold">
                            {{ item.title }}
                        </div>
                    </div>
                    <div class="text-gray-2 text-regular">Số lượng tài khoản: {{ item.count }}</div>
                </div>
                <input @change="$emit('on-change-status-filter', updated_checkbox)" v-model="updated_checkbox" :value="item.code" :id="item.title" type="checkbox" class="checkbox" />
            </label>
        </div>
    </transition>
</template>

<script>
export default {
    data() {
        return {
            s: this.$style
        }
    },
    props: {
        show: Boolean,
        data: Array,
        facebook: Object,
        checkbox: Array
    },
    computed: {
        status() {
            let arr = [1, 2, 3, 7, 9]
            return [...arr, 0].map(x => ({
                code: x,
                title: this.facebook.getAccountStatus(x),
                count: this.data.filter(item => (x != 0 ? item.account_status == x : !arr.includes(item.account_status))).length
            }))
        },
        updated_checkbox() {
            return this.checkbox
        }
    }
}
</script>

<style lang="scss" scoped module>
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
</style>

<style></style>
