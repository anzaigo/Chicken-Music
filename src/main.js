import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// 引入图片懒在家自定义指令插件
import lazyPlugin from 'vue3-lazy'
import loadingDirective from '@/components/base/loading/directive'
import noResultDirective from '@/components/base/no-result/directive'

import { load, saveAll } from '@/assets/js/array-store'
import { FAVORITE_KEY, PLAT_KEY } from '@/assets/js/constant'
import { processSongs } from '@/service/song'

// 引入全局样式文件
import '@/assets/scss/index.scss'

// 本地存储的歌曲url会过期，所以在应用程序初始化的时候就读到这个歌曲列表获取新的url
const favoriteSongs = load(FAVORITE_KEY)
if (favoriteSongs.length > 0) { // 有歌曲
    processSongs(favoriteSongs).then((songs) => { // 重新获取新的歌曲url
        store.commit('setFavorteList', songs) // 收藏
        saveAll(songs, FAVORITE_KEY)
    })
}
const historySongs = load(PLAT_KEY)
if (historySongs.length > 0) {
    processSongs(historySongs).then((songs) => {
        store.commit('setPlayHistory', songs) // 播放历史
        saveAll(songs, PLAT_KEY)
    })
}

createApp(App).use(store).use(router).use(lazyPlugin, {
    loading: require('@/assets/images/default.png')
}).directive('loading', loadingDirective).directive('no-result', noResultDirective).mount('#app')
