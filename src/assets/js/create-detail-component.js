import MusicList from '@/components/music-list/music-list'
import storage from 'good-storage'
import { processSongs } from '@/service/song'

export default function createDetailComponent(name, key, fetch) {
    return {
        name,
        props: {
            data: Object
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
            computedData() { // 判断是否是一级路由歌手列表点进来的
                let ret = null
                const data = this.data
                if (data) { // 如果是歌手列表点进来的，就用父组件传来的数据
                    ret = data
                } else { // 如果是手动刷新的，就用浏览器缓存的数据
                    const cached = storage.session.get(key)
                    if (cached && (cached.mid || cached.id + '') === this.$route.params.id) { // album这里是字符串的cached.id
                        ret = cached
                    }
                }
                return ret
            },
            pic() {
                const data = this.computedData
                return data && data.pic
            },
            title() {
                const data = this.computedData
                return data && (data.name || data.title) // album的数据是title不是name
            }
        },
        async created() {
            const data = this.computedData // 性能优化（响应式数据每次重新访问）
            if (!data) { // 如果不是一级路由歌手列表点进来的，浏览器缓存路径也不对，就返回一级路由歌手列表页
                const path = this.$route.matched[0].path // 拿到一级路由
                this.$router.push({
                    path
                })
                return
            }
            const result = await fetch(data) // 获取歌手列表数据
            this.songs = await processSongs(result.songs) // 获取被点击的歌手歌单
            this.loading = false // 数据加载完毕后关闭v-loading（给子组件使用）
        }
    }
}
