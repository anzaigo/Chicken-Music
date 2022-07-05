<template>
    <teleport to="body">
        <transition name="list-fade">
            <div class="playlist" v-show="visible && playlist.length" @click="hide">
                <div class="list-wrapper" @click.stop>
                    <div class="list-header">
                        <h1 class="title">
                            <i class="icon" :class="modeIcon" @click="changeMode"></i>
                            <span class="text">{{modeText}}</span>
                            <span class="clear" @click="showConfirm">
                                <i class="icon-clear"></i>
                            </span>
                        </h1>
                        <Scroll ref="scrollRef" class="list-content">
                            <transition-group ref="listRef" name="list" tag="ul">
                                <li class="item"
                                  v-for="song in squenceList" :key="song.id"
                                  @click="selectItem(song)"
                                  >
                                    <i class="current" :class="getCurrentIcon(song)"></i>
                                    <span class="text">{{song.name}}</span>
                                    <span class="favorite" @click.stop="toggleFavorite(song)">
                                        <i :class="getFavoriteIcon(song)"></i>
                                    </span>
                                    <span class="delete"
                                      @click.stop="removeSong(song)"
                                      :class="{'disable': removing}"
                                    >
                                        <i class="icon-delete"></i>
                                    </span>
                                  </li>
                            </transition-group>
                        </Scroll>
                        <div class="list-add">
                            <div class="add" @click="showAddSong">
                                <i class="icon-add"></i>
                                <span class="text">添加歌曲到队列</span>
                            </div>
                        </div>
                        <div class="list-footer" @click="hide">
                            <span>关闭</span>
                        </div>
                    </div>
                </div>
                <Confirm
                  ref="confirmRef"
                  @confirm="confirmClear"
                  text="是否清空播放列表？"
                  confirm-btn-text="清空"
                ></Confirm>
                <AddSong ref="addSongRef"></AddSong>
            </div>
        </transition>
    </teleport>
</template>

<script>
import Scroll from '@/components/base/scroll/scroll'
import Confirm from '@/components/base/confirm/confirm'
import AddSong from '../add-song/add-song.vue'
import { ref, computed, nextTick, watch } from 'vue'
import { useStore } from 'vuex'
import useMode from './use-mode'
import useFavorite from './use-favorte'
export default {
    name: 'playlist',
    components: {
        Scroll,
        Confirm,
        AddSong
    },
    setup () {
        // Data
        const scrollRef = ref(null)
        const listRef = ref(null)
        const confirmRef = ref(null)
        const addSongRef = ref(null)

        const visible = ref(false)
        const removing = ref(false) // （保护3） 当歌曲已被删除时（不存在）不提交removeSong，并使变色提示用户不能点击
        // vuex
        const store = useStore()
        const playlist = computed(() => store.state.playlist)
        const squenceList = computed(() => store.state.squenceList)
        const currentSong = computed(() => store.getters.currentSong)
        // hooks
        const { modeIcon, modeText, changeMode } = useMode()
        const { getFavoriteIcon, toggleFavorite } = useFavorite()
        // watch
        watch(currentSong, async (newSong) => { // 在mini播放歌单中不单单是用户点击切换歌曲，也可会自己播放完自己自动切换下一首，所以不能在selectItem改变歌曲播放状态并滚动到目标元素
            if (!visible.value || !newSong.id) { // （保护1）!newSong.id当用户快速点击删除歌曲时，可能被删除的歌曲会被重复点击。对被删除的歌曲会被重复点击取消动画
                return
            }
            await nextTick()
            scrollToCurrent()
        })
        // methods
        async function show () {
            visible.value = true

            await nextTick() // 带有数据发生dom变化时有个nextTick过程。很多时候要的是dom完全更新变化后的dom
            refreshScroll()
            scrollToCurrent()
        }
        function hide() {
            visible.value = false
        }
        function getCurrentIcon(song) {
            if (song.id === currentSong.value.id) {
                return 'icon-play'
            }
        }
        function refreshScroll() {
            scrollRef.value.scroll.refresh() // 重新计算 BetterScroll，当 DOM 结构发生变化的时候务必要调用确保滚动的效果正常。
        }
        function scrollToCurrent() {
            const index = squenceList.value.findIndex((song) => {
                return currentSong.value.id === song.id
            })
            if (index === -1) { // （保护2）当歌曲已经被删除过了（不存在）时
                return
            }
            const target = listRef.value.$el.children[index]
            scrollRef.value.scroll.scrollToElement(target, 300) // 滚动到目标元素：scrollToElement(el, time, offsetX, offsetY, easing)
        }
        function selectItem(song) {
            const index = playlist.value.findIndex((item) => {
                return song.id === item.id
            })
            store.commit('setcurrentIndex', index)
            store.commit('setPlayingState', true)
        }
        function removeSong(song) { // 删除歌曲
            if (removing.value) { // (保护3) 当歌曲已被删除时（不存在）不提交removeSong，并使变色提示用户不能点击
                return
            }
            removing.value = true // (保护3)执行过一次，变成删除状态
            store.dispatch('removeSong', song)

            if (!playlist.value.length) { // 当播放列表被清空时，隐藏
                hide()
            }

            setTimeout(() => { // （保护3）因为动画是300毫秒，所以300毫秒后才能继续点击
                removing.value = false
            }, 300)
        }
        function showConfirm() {
            confirmRef.value.show()
        }
        function confirmClear() {
            store.dispatch('clearSongList')
            hide()
        }
        function showAddSong() {
            addSongRef.value.show()
        }
        return {
            visible,
            playlist,
            scrollRef,
            listRef,
            confirmRef,
            squenceList,
            currentSong,
            removing,
            addSongRef,
            getCurrentIcon,
            show,
            hide,
            selectItem,
            removeSong,
            showConfirm,
            confirmClear,
            showAddSong,
            // use-mode
            modeIcon,
            modeText,
            changeMode,
            // use-favorite
            getFavoriteIcon,
            toggleFavorite
        }
    }
}
</script>

<style lang="scss" scoped>
.playlist {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 200;
    background-color: $color-background-d;
    &.list-fade-enter-active, &.list-fade-leave-active {
        transition: opacity .3s;
        .list-wrapper {
            transition: all .3s;
        }
    }
    &.list-fade-enter-from, &.list-fade-leave-to {
        opacity: 0;
        .list-wrapper {
        transform: translate3d(0, 100%, 0);
      }
    }
    .list-wrapper {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
        z-index: 210;
        background-color: $color-highlight-background;
        .list-header {
            position: relative;
            padding: 20px 30px 10px 20px;
            .title {
                display: flex;
                align-items: center;
                .icon {
                    margin-right: 10px;
                    font-size: 24px;
                    color: $color-theme-d;
                }
                .text {
                    flex: 1;
                    font-size: $font-size-medium;
                    color: $color-text-l;
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
        .list-content {
            max-height: 240px;
            overflow: hidden;
            .item {
                display: flex;
                align-items: center;
                height: 40px;
                padding: 0 30px 0 20px;
                overflow: hidden;
                .current {
                    flex: 0 0 20px;
                    width: 20px;
                    font-size: $font-size-small;
                    color: $color-theme-d;
                }
                .text {
                    flex: 1;
                    @include no-wrap();
                    font-size: $font-size-medium;
                    color: $color-text-d;
                }
                .favorite {
                    @include extend-click();
                    margin-right: 15px;
                    font-size: $font-size-small;
                    color: $color-theme;
                    .icon-favorite {
                        color: $color-sub-theme;
                    }
                }
                .delete {
                    @include extend-click();
                    font-size: $font-size-small;
                    color: $color-theme;
                    &.disable {
                        color: $color-theme-d;
                    }
                }
            }
        }
        .list-add {
            width: 140px;
            margin: 20px auto 30px auto;
            .add {
                display: flex;
                align-items: center;
                padding: 8px 16px;
                border: 1px solid $color-text-l;
                border-radius: 100px;
                color: $color-text-l;
                .icon-add {
                    margin-right: 5px;
                    font-size: $font-size-small-s;
                }
                .text {
                    font-size: $font-size-small;
                }
            }
        }
        .list-footer {
            text-align: center;
            line-height: 50px;
            background: $color-background;
            font-size: $font-size-medium-x;
            color: $color-text-l;
        }
    }
}
</style>
