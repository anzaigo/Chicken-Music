<template>
    <div class="singer-detail">
        <music-List :songs="songs" :title="title" :pic="pic" :loading="loading"></music-List>
    </div>
</template>

<script>
import { getSingerDetail } from '@/service/singer'
import { processSongs } from '@/service/song'
import MusicList from '@/components/music-list/music-list'
import storage from 'good-storage'
import { SINGER_KEY } from '@/assets/js/constant.js'
export default {
    name: 'singer-detail',
    props: {
        singer: Object
    },
    components: {
        MusicList
    },
    data() {
        return {
            songs: [],
            loading: true // 给子组件判断是否加载完毕数据显示控制加载指令
        }
    },
    computed: {
        computedSinger() { // 判断是否是一级路由歌手列表点进来的
            let ret = null
            const singer = this.singer
            if (singer) { // 如果是歌手列表点进来的，就用父组件传来的数据
                ret = singer
            } else { // 如果是手动刷新的，就用浏览器缓存的数据
                const cacheSinger = storage.session.get(SINGER_KEY)
                if (cacheSinger && cacheSinger.mid === this.$route.params.id) {
                    ret = cacheSinger
                }
            }
            return ret
        },
        pic() {
            const singer = this.computedSinger
            return singer && singer.pic
        },
        title() {
            const singer = this.computedSinger
            return singer && singer.name
        }
    },
    async created() {
        if (!this.computedSinger) { // 如果不是一级路由歌手列表点进来的，浏览器缓存路径也不对，就返回一级路由歌手列表页
            const path = this.$route.matched[0].path // 拿到一级路由
            this.$router.push({
                path
            })
            return
        }
        const result = await getSingerDetail(this.computedSinger) // 获取歌手列表数据
        this.songs = await processSongs(result.songs) // 获取被点击的歌手歌单
        this.loading = false // 数据加载完毕后关闭v-loading（给子组件使用）
    }
}
</script>

<style lang="scss" scoped>
.singer-detail{
    position: fixed;
    z-index: 10;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: $color-background;
}
</style>
