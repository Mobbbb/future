import { computed, watch } from 'vue'
import { useStore } from 'vuex'

export function useWatchUserSwitch(fun) {
    const store = new useStore()
    const switchUserFlag = computed(() => store.state.app.switchUserFlag)
    
    watch(switchUserFlag, () => {
        fun()
    })
}
