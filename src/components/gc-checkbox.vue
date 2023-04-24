<template>
    <div class="gc-checkbox" :class="check ? 'is-checked' : ''" @click="clickHandle">
        <span class="gc-checkbox__inner" v-show="check"></span>
        <span class="triangle-block"></span>
        <span class="gc-checkbox__label"><slot></slot></span>
    </div>
</template>

<script>
import { computed, toRefs } from 'vue'
import { Cellphone, EditPen, Loading } from '@element-plus/icons-vue'

export default {
    name: 'gc-checkbox',
    components: {
        Cellphone,
        EditPen,
        Loading,
    },
    props: {
        check: {
            type: Boolean,
            default: false,
        },
    },
    setup() {

    },
}
</script>

<style scoped>
.gc-checkbox {
    color: #409eff;
    font-size: 12px;
    position: relative;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    user-select: none;
    width: 100px;
    height: 26px;
    text-align: center;
    position: relative;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    overflow: hidden;
}
.gc-checkbox:last-of-type {
    margin-right: 0;
}
.gc-checkbox.is-checked {
    border-color: #409eff;
}
.gc-checkbox__inner {
    position: absolute;
    background-color: #409eff;
    display: inline-block;
    box-sizing: border-box;
    width: 21px;
    height: 21px;
    transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46),outline .25s cubic-bezier(.71,-.46,.29,1.46);
    right: 0;
    bottom: 0;
    border-top-left-radius: 50%;
    z-index: 1;
}
.gc-checkbox__inner::after {
    box-sizing: content-box;
    content: "";
    border: 1px solid #ffffff;
    border-left: 0;
    border-top: 0;
    height: 6px;
    position: absolute;
    right: 3px;
    bottom: 3px;
    transform: rotate(45deg) scaleY(0);
    width: 2px;
    transition: transform .15s ease-in .05s;
    transform-origin: center;
}
.triangle-block {
    position: absolute;
    display: inline-block;
    width: 15px;
    height: 30px;
    background: #fff;
    bottom: -1px;
    right: 6px;
    transform: rotate(45deg);
    box-sizing: border-box;
    z-index: 2;
}
.gc-checkbox.is-checked .gc-checkbox__inner:after {
    transform: rotate(45deg) scaleY(1);
}
.gc-checkbox__label {
    position: absolute;
    display: inline-block;
    line-height: 1;
    width: 100%;
    z-index: 3;
    color: #606266;
}
.gc-checkbox.is-checked .gc-checkbox__label {
    color: #409eff;
}
</style>
