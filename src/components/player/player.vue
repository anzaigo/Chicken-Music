<template>
    <!-- 播放组件 -->
    <div class="player" v-show="playlist.length">
        <transition name="normal"
          @enter="enter"
          @after-enter="afterEnter"
          @leave="leave"
          @after-leave="afterLeave"
        >
            <div class="normol-player" v-show="fullScreen">
            <!-- 背景图 -->
            <div class="background">
                <img :src="currentSong.pic">
            </div>
            <!-- 顶部标题区域 -->
            <div class="top">
                <div class="back" @click="goBack">
                    <i class="icon-back"></i>
                </div>
                <h1 class="title">{{currentSong.name}}</h1>
                <h2 class="subtitle">{{currentSong.singer}}</h2>
            </div>
            <!-- cd -->
            <div class="middle"
              @touchstart.prevent="onMiddleTouchStart"
              @touchmove.prevent="onMiddleTouchMove"
              @touchend.prevent="onMiddleTouchEnd"
            >
                <div class="middle-l" :style="middleLStyle">
                    <div class="cd-wrapper" ref="cdWrapperRef">
                        <div class="cd" ref="cdRef">
                            <img class="image" :class="cdCls" ref="cdImageRef" :src="currentSong.pic">
                        </div>
                    </div>
                    <div class="playing-lyric-wrapper">
                        <div class="playing-lyric">{{playingLyric}}</div>
                    </div>
                </div>
                <Scroll class="middle-r" ref="lyricScrollRef" :style="middleRStyle">
                    <div class="lyric-wrapper">
                        <div v-if="currentLyric" ref="lyricListRef">
                            <p class="text"
                                :class="{'current': currentLineNum === index}"
                                v-for="(line, index) in currentLyric.lines" :key="line.num"
                            >
                                {{line.txt}}
                            </p>
                        </div>
                        <div class="pure-music" v-show="pureMusicLyric">
                            <p>{{pureMusicLyric}}</p>
                        </div>
                    </div>
                </Scroll>
            </div>
            <div class="bottom">
                <div class="dot-wrapper">
                    <span class="dot" :class="{'active':currentShow==='cd'}"></span>
                    <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
                </div>
                <!-- 进度条 -->
                <div class="progress-wrapper">
                    <!-- 当前播放时间 -->
                    <span class="time time-l">{{formatTime(currentTime)}}</span>
                    <div class="progress-bar-wrapper">
                        <ProgressBar
                          ref="barRef"
                          :progress="progress"
                          @progress-changing="onProgressChanging"
                          @progress-changed="onProgressChanged"
                        ></ProgressBar>
                    </div>
                    <span class="time time-r">{{formatTime(currentSong.duration)}}</span>
                </div>
                <!-- 下方歌曲控制按钮 -->
                <div class="operators">
                    <div class="icon i-left">
                        <i :class="modeIcon" @click="changeMode"></i>
                    </div>
                    <div class="icon i-left" :class="disableCls">
                        <i class="icon-prev" @click="prev"></i>
                    </div>
                    <div class="icon i-center" :class="disableCls">
                        <i :class="playIcon" @click="togglePlay"></i>
                    </div>
                    <div class="icon i-right" :class="disableCls">
                        <i class="icon-next" @click="next"></i>
                    </div>
                    <div class="icon i-right">
                        <i @click="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)"></i>
                    </div>
                </div>
            </div>
            </div>
        </transition>
        <MiniPlayer :progress="progress" :toggle-play="togglePlay"></MiniPlayer>
        <audio ref="audioRef"
            @pause="pause"
            @canplay="ready"
            @error="error"
            @timeupdate="updataTime"
            @ended="end"
        >
        </audio>
    </div>
</template>

<script>
import { useStore } from 'vuex'
import { computed, watch, ref, nextTick } from 'vue'
import useMode from './use-mode'
import useFavorite from './use-favorte'
import ProgressBar from './progress-bar.vue'
import useLyric from './use-lyric'
import useMiddleInteractive from './use-middle-interactive'
import useCd from './use-cd'
import Scroll from '@/components/base/scroll/scroll'
import MiniPlayer from './mini-player'
import { formatTime } from '@/assets/js/util'
import { PLAY_MODE } from '../../assets/js/constant'
import useAnimation from './use-animation'
import usePlayHistory from './use-play-history'

export default {
    name: 'player',
    components: {
        MiniPlayer,
        ProgressBar,
        Scroll
    },
    setup () {
        const audioRef = ref(null)
        const barRef = ref(null)
        const songReady = ref(false) // 歌曲播放是流式播放（边缓冲边播放），一点也没缓冲（歌曲不可播放状态）时点击播放等按钮应无效
        const currentTime = ref(0) // 播放时间
        let progressChanging = false // 优先级（滑动时不能实时更新播放时间）
        // vuex
        const store = useStore()
        // 点击进来时 或 初次播放时 变全屏
        const fullScreen = computed(() => store.state.fullScreen)
        // 点击进来时拿到被点击的歌曲
        const currentSong = computed(() => store.getters.currentSong)
        // 判断是否在播放
        const playing = computed(() => store.state.playing)
        // 拿到歌曲播放列表
        const playlist = computed(() => store.state.playlist)
        // 拿到当前播放歌曲的索引
        const currentIndex = computed(() => store.state.currentIndex)
        // 获取播放方式，默认顺序播放
        const playMode = computed(() => store.state.playMode)

        // hooks
        const { modeIcon, changeMode } = useMode()
        const { getFavoriteIcon, toggleFavorite } = useFavorite()
        const { cdCls, cdImageRef, cdRef } = useCd()
        const { currentLyric, currentLineNum, playLyric, pureMusicLyric, playingLyric, lyricScrollRef, lyricListRef, stopLyric } = useLyric({ songReady, currentTime })
        const { currentShow, middleLStyle, middleRStyle, onMiddleTouchStart, onMiddleTouchMove, onMiddleTouchEnd } = useMiddleInteractive()
        const { cdWrapperRef, enter, afterEnter, leave, afterLeave } = useAnimation()
        const { savePlay } = usePlayHistory()
        // computed
        const playIcon = computed(() => { // 播放 or 暂停 图标
            return playing.value ? 'icon-pause' : 'icon-play'
        })
        const disableCls = computed(() => { // 当歌曲没准备好时，添加样式时按钮变暗
            return songReady.value ? '' : 'disable'
        })
        const progress = computed(() => { // 0~1：播放进度
            return currentTime.value / currentSong.value.duration
        })
        // watch
        watch(currentSong, (newSong) => { // 点击进来时播放歌曲
            if (!newSong.id || !newSong.url) {
                return
            }
            currentTime.value = 0 // 将播放时间变成（重置）0
            songReady.value = false
            const audioEl = audioRef.value
            audioEl.src = newSong.url
            audioEl.play()
            store.commit('setPlayingState', true)
        })
        watch(playing, (newPlaying) => { // 点击播放 or 暂停歌曲
            if (!songReady.value) { // 当歌曲没有缓冲好时，播放无效，也解决了播放报错The play() request was interrupted by a new load request
                return
            }
            const audioEl = audioRef.value
            if (newPlaying) {
                audioEl.play()
                playLyric() // 歌词跳转
            } else {
                audioEl.pause()
                stopLyric() // 暂停歌词
            }
        })
        watch(fullScreen, async(newFullScreen) => { // 当从mini播放后点全屏时触发dom更新进度条（如果用户在全屏播放暂停后，在mini播放，在回到全屏会出现进度条bug）
            if (newFullScreen) {
                await nextTick()
                barRef.value.setOffset(progress.value)
            }
        })

        // methods
        function goBack() { // 退出全屏
            store.commit('setFullScreen', false)
        }
        function togglePlay() { // 点击切换 播放 or 暂停 图标
            if (!songReady.value) { // 歌曲没准备好时，不能进行点击操作
                return
            }
            store.commit('setPlayingState', !playing.value)
        }
        function pause() { // 待机、睡眠时触发暂停机制
            store.commit('setPlayingState', false)
        }
        function prev() { // 上一首（后退）
            const list = playlist.value
            if (!songReady.value || !list.length) {
                return
            }
            if (list.length === 1) {
                loop()
            } else {
                let index = currentIndex.value - 1
                if (index === -1) {
                    index = list.length - 1
                }
                store.commit('setcurrentIndex', index)
            }
        }
        function next() { // 下一首（前进）
            const list = playlist.value
            if (!songReady.value || !list.length) {
                return
            }
            if (list.length === 1) {
                loop()
            } else {
                let index = currentIndex.value + 1
                if (index === list.length) {
                    index = 0
                }
                store.commit('setcurrentIndex', index)
            }
        }
        function loop() { // 循环播放当前歌曲
            const audioEl = audioRef.value
            audioEl.currentTime = 0
            audioEl.play()
            store.commit('setPlayingState', true)
        }
        function ready() { // 开始（可以）播放时
            if (songReady.value) { // 第一次缓冲时可以执行，多次缓冲时退出
                return
            }
            songReady.value = true
            playLyric() // 可能先获取到歌词再ready，也可能先ready再获取到歌词，为了保证事件同步，这里也要执行
            savePlay(currentSong.value) // 添加播放记录到本地
        }
        function error() { // 当遇到歌曲播放出错时
            songReady.value = true // 为了出错误时，能让用户可以继续点击切换歌曲
        }
        function updataTime(e) { // 当前播放时间
            if (!progressChanging) { // 滑动时不更新时间
                currentTime.value = e.target.currentTime
            }
        }
        function onProgressChanging(progress) { // 滑动时（拖动时）
            progressChanging = true // 滑动时不更新时间
            currentTime.value = currentSong.value.duration * progress // 正在滑动时的播放时间
            playLyric() // 滑动时更新歌词的位置（同步到歌曲播放的位置）
            stopLyric() // 更新歌词的位置后暂停(不希望滑动时歌词还在继续跳动，跳的位置也不准)，滑动结束时再播放歌曲时再播放歌词
        }
        function onProgressChanged(progress) { // 滑动结束时
            progressChanging = false // 滑动完了实时更新播放时间
            audioRef.value.currentTime = currentTime.value = currentSong.value.duration * progress
            if (!playing.value) { // 移动后如果是暂停的就给他播放
                store.commit('setPlayingState', true)
            }
            playLyric() // 滑动结束时继续播放歌词
        }
        function end() { // 歌曲播放完时
            currentTime.value = 0
            if (playMode.value === PLAY_MODE.loop) {
                loop()
            } else {
                next()
            }
        }
        return {
            audioRef,
            barRef,
            goBack,
            fullScreen,
            currentTime,
            currentSong,
            playlist,
            playIcon,
            disableCls,
            progress,
            togglePlay,
            pause,
            prev,
            next,
            ready,
            error,
            updataTime,
            formatTime,
            onProgressChanging,
            onProgressChanged,
            end,
            // mode
            modeIcon,
            changeMode,
            // favorite
            getFavoriteIcon,
            toggleFavorite,
            // cd
            cdCls,
            cdImageRef,
            cdRef,
            // lyric
            currentLyric,
            currentLineNum,
            pureMusicLyric,
            playingLyric,
            lyricScrollRef,
            lyricListRef,
            // middle-interactive
            currentShow,
            middleLStyle,
            middleRStyle,
            onMiddleTouchStart,
            onMiddleTouchMove,
            onMiddleTouchEnd,
            // use-animation
            cdWrapperRef,
            enter,
            afterEnter,
            leave,
            afterLeave
        }
    }
}
</script>

<style lang="scss" scoped>
.player{
    .normol-player{
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        z-index: 150;
        background: $color-background;
        .background{
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.6;
            filter: blur(20px);
            img{
                width: 100%;
                height: 100%;
            }
        }
        .top{
            position: relative;
            margin-bottom: 25px;
            .back{
                position: absolute;
                top: 0;
                left: 6px;
                z-index: 50;
                .icon-back{
                    display: block;
                    padding: 9px;
                    font-size: $font-size-large-x;
                    color: $color-theme;
                    transform: rotate(-90deg);
                }
            }
            .title{
                width: 70%;
                margin: 0 auto;
                line-height: 40px;
                text-align: center;
                @include no-wrap();
                font-size: $font-size-large;
                color: $color-text;
            }
            .subtitle{
                line-height: 20px;
                text-align: center;
                font-size: $font-size-medium;
                color: $color-text;
            }
        }
        .middle{
            position: fixed;
            width: 100%;
            top: 80px;
            bottom: 170px;
            white-space: nowrap;
            font-size: 0;
            .middle-l{
                display: inline-block;
                vertical-align: top;
                position: relative;
                width: 100%;
                height: 0;
                padding-top: 80%;
                .cd-wrapper{
                    position: absolute;
                    left: 10%;
                    top: 0;
                    width: 80%;
                    box-sizing: border-box;
                    height: 100%;
                    .cd{
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                        img {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            box-sizing: border-box;
                            border-radius: 50%;
                            border: 10px solid rgba(255, 255, 255, 0.1);
                        }
                        .playing {
                            animation: rotate 20s linear infinite;
                        }
                    }
                }
                .playing-lyric-wrapper{
                    width: 80%;
                    margin: 30px auto 0 auto;
                    overflow: hidden;
                    text-align: center;
                    .playing-lyric{
                        height: 20px;
                        line-height: 20px;
                        font-size: $font-size-medium;
                        color: $color-text-l;
                    }
                }
            }
            .middle-r {
                display: inline-block;
                vertical-align: top;
                width: 100%;
                height: 100%;
                overflow: hidden;
                .lyric-wrapper {
                    width: 80%;
                    margin: 0 auto;
                    overflow: hidden;
                    text-align: center;
                    .text {
                        line-height: 32px;
                        color: $color-text-l;
                        font-size: $font-size-medium;
                        &.current {
                            color: $color-text;
                        }
                    }
                    .pure-music{
                        padding-top: 50%;
                        line-height: 32px;
                        color: $color-text-l;
                        font-size: $font-size-medium;
                    }
                }
            }
        }
        .bottom{
            position: absolute;
            bottom: 50px;
            width: 100%;
            .dot-wrapper{
                text-align: center;
                font-size: 0;
                .dot{
                    display: inline-block;
                    vertical-align: middle;
                    margin: 0 4px;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: $color-text-l;
                    &.active{
                        width: 20px;
                        border-radius: 5px;
                        background: $color-text-ll;
                    }
                }
            }
            .progress-wrapper{
                display: flex;
                align-items: center;
                width: 80%;
                margin: 0 auto;
                padding: 10px 0;
                .time{
                    color: $color-text;
                    font-size: $font-size-small;
                    flex: 0 0 40px;
                    line-height: 30px;
                    width: 40px;
                    &.time-l {
                        text-align: left;
                    }
                    &.time-r {
                        text-align: right;
                    }
                }
                .progress-bar-wrapper{
                    flex: 1;
                }
            }
            .operators{
                display: flex;
                align-items: center;
                .icon{
                    flex: 1;
                    color: $color-theme;
                    &.disable{
                        color: $color-theme-d;
                    }
                    i{
                        font-size: 30px;
                    }
                }
                .i-left{
                    text-align: right;
                }
                .i-center{
                    padding: 0 20px;
                    text-align: center;
                    i{
                        font-size: 40px;
                    }
                }
                .i-right{
                    text-align: left;
                }
            }
        }
        &.normal-enter-active, &.normal-leave-active {
            transition: all .6s;
            .top, .bottom {
                transition: all .6s cubic-bezier(0.45, 0, 0.55, 1);
            }
        }
        &.normal-enter-from, &.normal-leave-to {
            opacity: 0;
            .top {
                transform: translate3d(0, -100px, 0);
            }
            .bottom {
                transform: translate3d(0, 100px, 0);
            }
        }
    }
}
</style>
