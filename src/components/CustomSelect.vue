<template>
    <div class="custom-select" tabindex="0" @blur="open = false">
        <div class="selected" :class="{ open: open }" @click="open = !open">
            <slot></slot>
        </div>
        <div class="items" v-if="open">
            <div
                v-for="(option, i) of options"
                :key="i"
                @click="
                    selected = option
                    open = false
                    $emit('select', option)
                ">
                {{ option }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        options: {
            type: Array,
            required: true
        },
        default: {
            type: String,
            required: false,
            default: null
        }
    },
    data() {
        return {
            selected: this.default ? this.default : this.options.length > 0 ? this.options[0] : null,
            open: false
        }
    },
    mounted() {
        this.$emit("select", this.selected)
    }
}
</script>

<style lang="scss" scoped>
.custom-select {
    position: relative;
    width: 85px;
    text-align: left;
    outline: none;
    height: 36px;
}

.custom-select .selected {
    height: 100%;
    background: #fff;
    border-radius: 6px;
    border: 1px solid #e6e8ec;
    color: var(--grey2);
    padding: 0 6px;
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.custom-select .selected.open {
    border-color: transparent;
    &::before {
        z-index: -1;
        content: "";
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        background: var(--gradient);
    }
}

.custom-select .items {
    color: var(--grey2);
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #e6e8ec;
    position: absolute;
    padding: 5px;
    background-color: #fff;
    margin-top: 5px;
    left: 0;
    right: 0;
    z-index: 1;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.29);
}

.custom-select .items div {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    color: var(--grey2);
    cursor: pointer;
    user-select: none;
    font-family: Semibold;
}

.custom-select .items div:hover {
    background: #e6e8ec;
    border-radius: 5px;
}

.selectHide {
    display: none;
}
</style>
