<template>
    <div class="suggest"
      ref="rootRef"
      v-loading:[loadingText]="loading"
      v-no-result:[noResultText]="noResult"
    >
        <ul class="suggest-list">
            <li class="suggest-item"
              v-if="singer"
              @click="selectSinger(singer)"
            >
                <div class="icon">
                    <i class="icon-mine"></i>
                </div>
                <div class="name">
                    <p class="text">{{ singer.name }}</p>
                </div>
            </li>
            <li class="suggest-item"
              v-for="song in songs" :key="song.id"
              @click="selectSong(song)"
            >
                <div class="icon">
                    <i class="icon-music"></i>
                </div>
                <div class="name">
                    <p class="text">{{ song.singer }}-{{ song.name }}</p>
                </div>
            </li>
            <div class="suggest-item" v-loading:[loadingText]="pullUpLoading"></div>
        </ul>
    </div>
</template>

<script>
import { search } from '@/service/search'
import { processSongs } from '../../service/song'
import usePullUpLoad from './use-pull-load'
import { computed, ref, watch, nextTick } from 'vue'
export default {
    name: 'suggest',
    props: {
        query: String,
        showSinger: {
            type: Boolean,
            default: true
        }
    },
    emits: ['select-song', 'select-singer'],
    setup(props, { emit }) {
        // data
        const singer = ref(null) // 搜索到的歌手信息
        const songs = ref([]) // 搜索到的歌曲信息
        const hasMore = ref(true) // 是否存在多页（page）
        const page = ref(1) // 页码
        const loadingText = ref('')
        const noResultText = ref('抱歉，暂无搜索结果')
        const manualLoading = ref(false) // 标杆；阻止上拉加载和去除会员歌曲后造成的首屏不满触发加载图标两个一起出现的问题

        // watch
        watch(() => props.query, async (newQuery) => {
            if (!newQuery) {
                return
            }
            await searchFirst()
        })

        // computed
        const loading = computed(() => { // 搜索等待提示
            return !singer.value && !songs.value.length
        })
        const noResult = computed(() => { // 搜索无结果提示
            return !singer.value && !songs.value.length && !hasMore.value
        })
        const pullUpLoading = computed(() => { // 上拉加载提示
            return isPullUpLoad.value && hasMore.value
        })
        const preventPullUpLoad = computed(() => { // 当刚搜索时loading或makeItScrollable执行时用户不能手动上拉加载。
            return loading.value || manualLoading.value
        })

        // hooks
        const { rootRef, isPullUpLoad, scroll } = usePullUpLoad(searchMore, preventPullUpLoad)

        // function
        async function searchFirst() { // 搜索加载内容
            if (!props.query) { // 空内容不搜索
                return
            }
            // 清空-格式化数据
            page.value = 1
            songs.value = []
            singer.value = null
            hasMore.value = true

            const result = await search(props.query, page.value, props.showSinger)
            songs.value = await processSongs(result.songs)
            singer.value = result.singer
            hasMore.value = result.hasMore
            await nextTick()
            await makeItScrollable()
        }
        async function searchMore() { // 上拉加载更多数据
            if (!hasMore.value || !props.query) { // bug1：由于这里是异步的，当makeItScrollable过程中点击清空按钮时，就会带着一个空的字符串去请求数据，请求的数据也是空的，那makeItScrollable永远也不会满足条件会一直执行searchMore，所以加!props.value
                return
            }
            page.value++

            const result = await search(props.query, page.value, props.showSinger)
            songs.value = songs.value.concat(await processSongs(result.songs)) // 拼接搜索到的歌曲
            hasMore.value = result.hasMore // 判断是否还有分页
            await nextTick()
            await makeItScrollable()
        }
        async function makeItScrollable() { // 自动加载完全屏数据：因为后台过滤了会员歌曲，首屏（第一页）内容可能会缺失，也就是不满全屏；当还是可以继续上拉加载更多的内容。而不满全屏的话会给用户觉得数据没有了，体验不好
            if (scroll.value.maxScrollY >= -1) { // 当首屏没加载完数据，也就是可滚动距离为-1时，自动上拉加载更多数据
                manualLoading.value = true
                await searchMore()
                manualLoading.value = false
            }
        }
        function selectSong(song) {
            emit('select-song', song)
        }
        function selectSinger(singer) { // 点击进入歌手详情页
            emit('select-singer', singer)
        }
        return {
            singer,
            songs,
            loadingText,
            loading,
            noResult,
            noResultText,
            pullUpLoading,
            selectSong,
            selectSinger,
            // use-pull-load
            rootRef,
            isPullUpLoad
        }
    }
}
</script>

<style lang="scss" scoped>
.suggest {
    height: 100%;
    overflow: hidden;

    .suggest-list {
        padding: 0 30px;

        .suggest-item {
            display: flex;
            align-items: center;
            padding-bottom: 20px;

            .icon {
                flex: 0 0 30px;
                width: 30px;

                [class^="icon-"] {
                    font-size: 14px;
                    color: $color-text-d;
                }
            }

            .name {
                flex: 1;
                font-size: $font-size-medium;
                color: $color-text-d;
                overflow: hidden;

                .text {
                    @include no-wrap()
                }
            }
        }
    }
}
</style>
