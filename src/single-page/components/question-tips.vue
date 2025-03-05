<template>
    <el-tooltip :effect="effect" :placement="placement" :popper-class="popperClass">
        <template #content>
            <slot></slot>
        </template>
        <div style="display: flex; align-items: center;">
            <el-icon class="pop-tips-icon" :style="iconStyle"><question-filled /></el-icon>
            <slot name="content"></slot>
        </div>
    </el-tooltip>
</template>

<script>
import { computed } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'

export default {
    name: 'question-tips',
    components: {
        QuestionFilled,
    },
    props: {
        gap: {
            type: Array,
            default: () => {
                return [0, 0]
            },
        },
        placement: {
            type: String,
            default: 'left',
        },
        effect: {
            type: String,
            default: 'light',
        },
        popperClass: {
            type: String,
            default: '',
        },
        style: {
            type: Object,
            default: () => {
                return {}
            },
        },
    },
    setup(props) {
        const iconStyle = computed(() => {
            return {
                marginLeft: `${props.gap[0]}px`,
                marginRight: `${props.gap[1]}px`,
                ...props.style,
            }
        })

        return {
            iconStyle,
        }
    },
}
</script>

<style scoped>
.pop-tips-icon {
    color: var(--normal-text-4);
    cursor: pointer;
}
</style>