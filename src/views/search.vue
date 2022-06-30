<template>
    <div class="search">
        <div class="search-input-wrapper">
            <SearchInput v-model="query"></SearchInput>
        </div>
        <Scroll class="search-content"
          v-show="!query"
          ref="scrollRef"
        >
            <div>
                <div class="hot-keys">
                    <h1 class="title">热门搜索</h1>
                    <ul>
                        <li class="item"
                        v-for="item in hotKeys" :key="item.id"
                        @click="addQuery(item.key)"
                        >
                            <span>{{item.key}}</span>
                        </li>
                    </ul>
                </div>
                <div class="search-history" v-show="searchHistory.length">
                    <h1 class="title">
                        <span class="text">搜索历史</span>
                        <span class="clear" @click="showConfirm">
                            <i class="icon-clear"></i>
                        </span>
                    </h1>
                    <Confirm
                      ref="confirmRef"
                      text="是否清空所有搜索历史"
                      confirm-btn-text="清空"
                      @confirm="clearSearch"
                    ></Confirm>
                    <SearchList
                    :searches="searchHistory"
                    @select="addQuery"
                    @delete="deleteSearch"
                    ></SearchList>
                </div>
            </div>
        </Scroll>
        <div class="search-result" v-show="query">
            <Suggest
              :query="query"
              @select-song="selectSong"
              @select-singer="selectSinger"
            ></Suggest>
        </div>
        <router-view v-slot="{ Component }">
            <transition appear name="slide">
                <component :is="Component" :data="selectedSinger"/>
            </transition>
        </router-view>
    </div>
</template>

<script>
import { getHotKeys } from '@/service/search'
import storage from 'good-storage'
import { SINGER_KEY } from '@/assets/js/constant'
import useSearchHistory from '@/components/search/use-search-history'

import SearchInput from '@/components/search/search-input'
import Suggest from '../components/search/suggest.vue'
import SearchList from '@/components/base/search-list/search-list'
import Confirm from '@/components/base/confirm/confirm'
import Scroll from '@/components/wrap-scroll'

import { ref, computed, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
export default {
    name: 'search',
    components: {
        SearchInput,
        Suggest,
        SearchList,
        Scroll,
        Confirm
    },
    setup() {
        // data
        const query = ref('') // 搜索内容
        const hotKeys = ref([]) // 搜索推荐
        const selectedSinger = ref(null) // 歌手详情

        const scrollRef = ref(null)
        const confirmRef = ref(null)
        // vuex
        const store = useStore()
        const searchHistory = computed(() => store.state.searchHistory)
        // router
        const router = useRouter()
        // hooks
        const { saveSearch, deleteSearch, clearSearch } = useSearchHistory()

        getHotKeys().then((result) => { // 请求搜索推荐数据
            hotKeys.value = result.hotKeys
        })
        // watch
        watch(query, async (newQuery) => { // bug：当从搜索页点击进去播放歌曲并切换mini播放器时，BS的refresh并没有在搜索页（在singer-detail二级路由）导致了BS计算失败
            if (!newQuery) {
                await nextTick()
                refreshScroll()
            }
        })
        // methods
        function addQuery(s) { // 添加搜索内容or搜索历史
            query.value = s
        }
        function selectSong(song) {
            saveSearch(query.value)
            store.dispatch('addSong', song)
        }
        function selectSinger(singer) { // 跳转到歌手详情页
            saveSearch(query.value)
            selectedSinger.value = singer
            cacheSinger(singer)
            router.push({
                path: `/search/${singer.mid}`
            })
        }
        function cacheSinger(singer) { // 刷新停留
            storage.session.set(SINGER_KEY, singer)
        }
        function refreshScroll() { // 重新计算 BetterScroll，当 DOM 结构发生变化的时候务必要调用确保滚动的效果正常
            scrollRef.value.scroll.refresh()
        }
        function showConfirm() { // 点击显示清除弹窗
            confirmRef.value.show()
        }
        return {
            scrollRef,
            confirmRef,
            query,
            hotKeys,
            selectedSinger,
            addQuery,
            selectSong,
            selectSinger,
            searchHistory,
            showConfirm,
            // searchHistory
            deleteSearch,
            clearSearch
        }
    }
}
</script>

<style lang="scss" scoped>
.search {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
    display: flex;
    flex-direction: column;
    .search-input-wrapper {
        margin: 20px;
    }
    .search-content{
        flex: 1;
        overflow: hidden;
        .hot-keys {
            margin: 0 20px 20px 20px;
            .title {
                margin-bottom: 20px;
                font-size:  $font-size-medium;
                color:  $font-size-medium;
            }
            .item {
                display: inline-block;
                padding: 5px 10px;
                margin: 0 20px 10px 0;
                border-radius: 6px;
                background: $color-highlight-background;
                font-size: $font-size-medium;
                color: $color-text-d;
            }
        }
        .search-history {
            position: relative;
            margin: 0 20px;
            .title {
                display: flex;
                align-items: center;
                height: 40px;
                font-size: $font-size-medium;
                color: $color-text-l;
            }
            .text {
                flex: 1;
            }
            .clear {
                @include extend-click();
                .icon-clear {
                    font-size: $font-size-medium;
                    color: $color-text-d;
                }
            }
        }
    }
    .search-result {
        flex: 1;
        overflow: hidden;
    }
}
</style>
