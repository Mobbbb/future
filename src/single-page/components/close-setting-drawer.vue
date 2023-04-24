<template>
    <el-drawer v-model="drawerShowStatus" :append-to-body="true" direction="rtl" :size="260">
        <template #title>
            <h4>优先平今</h4>
        </template>
        <template #default>
            <div class="check-wrap">
                <GcCheckbox :destroy-on-close="true"
                    :check="checkList.includes(item.name)"
                    v-for="item in closeSettingfuturesList"
                    :key="item.id"
                    @click="checkHandle(item)">{{item.chName}}
                </GcCheckbox>
            </div>
            <div class="btn-wrap">
                <gc-button type="active" @on-click="saveHandle" :width="70" :loading="isLoading">保存</gc-button>
            </div>
        </template>
    </el-drawer>
</template>

<script>
import { mapState, mapGetters ,mapMutations } from 'vuex'
import { updateUserInDayFirstLists } from '@/api'
import GcButton from '@/components/gc-button.vue'
import GcCheckbox from '@/components/gc-checkbox.vue'

export default {
    name: 'login-drawer',
    components: {
        GcButton,
        GcCheckbox,
    },
    data() {
        return {
            isLoading: false,
            checkList: [],
        }
    },
    watch: {
        drawerShowStatus(value) {
            if (value) {
                const inDayFirstLists = this.USER_INFO.inDayFirstLists || []
                this.checkList = [...inDayFirstLists]
            }
        },
    },
    computed: {
        drawerShowStatus: {
            get() {
                return this.closeSettingShowStatus
            },
            set(value) {
                this.setCloseSettingShowStatus(value)
            },
        },
        ...mapState('app', [
            'closeSettingShowStatus',
            'USER_INFO',
        ]),
        ...mapGetters('order', [
            'closeSettingfuturesList',
        ]),
    },
    methods: {
        ...mapMutations('app', [
            'setCloseSettingShowStatus',
            'setInDayFirstLists',
        ]),
        checkHandle(item) {
            const index = this.checkList.indexOf(item.name)
            if (index > -1) {
                this.checkList.splice(index, 1)
            } else {
                this.checkList.push(item.name)
            }
        },
        async saveHandle() {
            this.isLoading = true
            const res = await updateUserInDayFirstLists(this.checkList.join(','))
            this.isLoading = false
            if (res.success) {
                this.$message.success('保存成功')
                this.setInDayFirstLists(this.checkList)
                this.setCloseSettingShowStatus(false)
            }
        },
    },
}
</script>

<style scoped>
.btn-wrap {
    margin-top: 12px;
}
.check-wrap {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}
.check-wrap .gc-checkbox {
    margin-bottom: 12px;
}
</style>
