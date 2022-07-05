<template>
    <teleport to="body">
        <transition name="slide">
            <div class="add-song" v-show="visible">
                <div class="header">
                    <h1 class="title">添加歌曲到列表</h1>
                    <div class="close" @click="hide">
                        <i class="icon-close"></i>
                    </div>
                </div>
                <div class="search-input-wrapper">
                    <SearchInput v-model="query" placeholder="搜索歌曲"></SearchInput>
                </div>
                <div v-show="!query">
                  <Switches
                    :items="['最近播放', '搜索历史']"
                    v-model="currentIndex"
                  ></Switches>
                  <div class="list-wrapper">
                    <Scroll class="list-scroll"
                      v-if="currentIndex===0"
                      ref="scrollRef"
                    >
                      <div class="list-inner">
                        <SongList
                          :songs="playHistory"
                          @select="selectSongBySongList"
                        ></SongList>
                      </div>
                    </Scroll>
                    <Scroll class="list-scroll"
                      v-if="currentIndex===1"
                      ref="scrollRef"
                    >
                      <div class="list-inner">
                        <SearchList
                          :searches="searchHistory"
                          :show-delete="false"
                          @select="addQuery"
                        ></SearchList>
                      </div>
                    </Scroll>
                  </div>
                </div>
                <div class="search-result" v-show="query">
                    <Suggest
                      :query="query"
                      :show-singer="false"
                      @select-song="selectSongBySuggest"
                    ></Suggest>
                </div>
                <Message ref="messageRef">
                  <div class="message-title">
                    <i class="icon-ok"></i>
                    <span class="text">1首歌曲已经添加到播放列表</span>
                  </div>
                </Message>
            </div>
        </transition>
    </teleport>
</template>

<script>
import { ref, computed, nextTick, watch } from 'vue'
import { useStore } from 'vuex'

import SearchInput from '../search/search-input.vue'
import Suggest from '../search/suggest.vue'
import Switches from '@/components/base/switches/switches'
import Scroll from '@/components/base/scroll/scroll'
import SongList from '@/components/base/song-list/song-list'
import SearchList from '@/components/base/search-list/search-list'
import Message from '@/components/base/message/message'
import useSearchHistory from '@/components/search/use-search-history'

export default {
    name: 'add-song',
    components: {
        SearchInput,
        Suggest,
        Switches,
        Scroll,
        SongList,
        SearchList,
        Message
    },
    setup() {
        // data
        const scrollRef = ref(null)
        const messageRef = ref(null)

        const visible = ref(false) // 控制显示隐藏
        const query = ref('') // 搜索内容
        const currentIndex = ref(0) // btn索引

        // vuex
        const store = useStore()
        const searchHistory = computed(() => store.state.searchHistory)
        const playHistory = computed(() => store.state.playHistory)

        // hooks
        const { saveSearch } = useSearchHistory()

        // watch
        watch(query, async () => { // bug2：在搜索时该BS的style为display：none；refresh会计算高度不对。所以搜索后返回会出现滚动不了的情况。解决方案：监听query（搜索内容），并refresh
          await nextTick()
          refreshScroll()
        })

        // methods
        async function show() { // 显示
            visible.value = true

            await nextTick()
            refreshScroll()
        }
        function hide() { // 隐藏
            visible.value = false
        }
        function addQuery(s) { // 点击搜索历史的某一些添加到搜索框中
          query.value = s
        }
        function selectSongBySongList({ song }) { // 点击播放歌曲
          addSong(song)
        }
        function selectSongBySuggest(song) { // 进入歌手详情页
          addSong(song)
          saveSearch(query.value)
        }
        function addSong(song) { // 添加到歌曲播放列表
          store.dispatch('addSong', song)
          showMessage()
        }
        function refreshScroll() { // 重新计算BSscroll高度：bug1-DOM渲染时，该BS的style为display：none；所以BS在渲染时的高度是不对的，第一次进入时会出现滚动不了的情况。解决方案：在进入时重新计算（show）
          scrollRef.value.scroll.refresh()
        }
        function showMessage() { // 提示添加成功
          messageRef.value.show()
        }

        return {
            visible,
            query,
            scrollRef,
            messageRef,
            currentIndex,
            searchHistory,
            playHistory,
            show,
            hide,
            addQuery,
            selectSongBySongList,
            selectSongBySuggest
        }
    }
}
</script>

<style lang="scss" scoped>
  .add-song {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    z-index: 300;
    background: $color-background;
    .header {
      position: relative;
      height: 44px;
      text-align: center;
      .title {
        line-height: 44px;
        font-size: $font-size-large;
        color: $color-text;
      }
      .close {
        position: absolute;
        top: 0;
        right: 8px;
        .icon-close {
          display: block;
          padding: 12px;
          font-size: 20px;
          color: $color-theme;
        }
      }
    }
    .search-input-wrapper {
      margin: 20px
    }
    .list-wrapper {
      position: absolute;
      top: 165px;
      bottom: 0;
      width: 100%;
      .list-scroll {
        height: 100%;
        overflow: hidden;
        .list-inner {
          padding: 20px 30px;
        }
      }
    }
    .search-result {
      position: fixed;
      top: 124px;
      bottom: 0;
      width: 100%;
    }
  }

  .message-title {
    text-align: center;
    padding: 18px 0;
    font-size: 0;
    .icon-ok {
      font-size: $font-size-medium;
      color: $color-theme;
      margin-right: 4px;
    }
    .text {
      font-size: $font-size-medium;
      color: $color-text;
    }
  }
</style>
