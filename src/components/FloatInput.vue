<template>
    <div>
        <label :for="id" :class="{ error }">
            <IconMask size="20" class="_icon" :url="url" />
            <div class="vr"></div>
            <input :disabled="disabled" @paste="e => $emit('paste', e)" @blur="$emit('blur')" :required="required" :type="type" :id="id" :placeholder="label" :value="value" @input="updateValue" />
            <span>
                {{ label }}
            </span>
        </label>
        <div v-if="error" class="text-red mt-10">
            {{ error }}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        url: String,
        id: String,
        label: String,
        placeholder: String,
        required: {
            type: Boolean,
            default: false
        },
        error: {
            type: String,
            default: null
        },
        type: {
            type: String,
            default: "text"
        },
        value: String,
        disabled: Boolean
    },

    methods: {
        img(name) {
            return "/images/auth/" + name
        },
        updateValue(event) {
            this.$emit("input", event.target.value.trim())
        }
    }
}
</script>

<style lang="scss" scoped>
label {
    display: flex;
    height: 48px;
    position: relative;
    padding: 0 12px;
    border: 1px solid #e6e8ec;
    border-radius: 6px;
    cursor: text;
    ._icon,
    .icon {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: var(--grey2);
    }
    &.error {
        border: 1px solid var(--red);
    }
    .icon {
        &-error {
            right: 15px;
        }
    }
}

.vr {
    height: 28px;
    width: 1px;
    background: var(--grey3);

    position: absolute;
    left: 40px;
    top: 10px;
}

input {
    color: var(--grey1);
    background-color: transparent;
    font-size: 14px;
    width: 100%;
    height: 100%;
    margin-left: 40px;
    border: none;
    outline: none;
    margin-top: 5px;
}
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
    -webkit-transition-delay: 9999s;
    transition-delay: 9999s;
}
input::placeholder {
    opacity: 0;
}
span {
    position: absolute;
    top: 9px;
    left: 51px;
    transform: translateY(6px);
    font-size: 14px;
    transition-duration: 300ms;
    color: #777e90;
}

label:not(.error):focus-within {
    position: relative;
    border: 1px solid var(--green);
    background-color: #fff;
    ._icon {
        background: var(--green);
    }
}

label:focus-within > span,
input:not(:placeholder-shown) + span {
    color: #777e90;
    opacity: 0.5;
    font-weight: 500;
    font-size: 11px;
    transform: translateY(-2px);
}
</style>
