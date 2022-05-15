<template>
    <!--  歌手详情页 -->
    <div class="music-list">
        <!-- 后退按钮 -->
        <div class="back" @click="goBack">
            <i class="icon-back"></i>
        </div>
        <h1 class="tltie">{{title}}</h1>
        <!-- 背景图 -->
        <div class="bg-image" :style="bgImageStyle" ref="bgImage">
            <!-- 随机播放按钮 -->
            <div class="play-btn-wrapper" :style="playBtnStyle">
                <div class="play-btn" v-show="songs.length > 0" @click="random">
                    <i class="icon-play"></i>
                    <span class="text">随机播放全部</span>
                </div>
            </div>
            <!-- 背景遮罩&模糊 -->
            <div class="filter" :style="filterStyle"></div>
        </div>
        <Scroll
          class="list"
          :style="scrollStyle"
          v-loading="loading"
          v-no-result="noResult"
          :probe-type="3"
          @scroll="onScroll"
        >
            <div class="song-list-wrapper">
                <SongList :songs="songs" @select="selectItem"></SongList>
            </div>
        </Scroll>
    </div>
</template>

<script>
import Scroll from '@/components/base/scroll/scroll'
import SongList from '@/components/base/song-list/song-list'
import { mapActions } from 'vuex'

const RESEVED_HEIGHT = 40 // 顶部区域title的高度

export default {
    name: 'music-list',
    components: {
        Scroll,
        SongList
    },
    props: {
        songs: {
            type: Array,
            default() {
                return []
            }
        },
        title: String, // 歌手名字
        pic: String, // 图片
        loading: Boolean // 数据是否加载完毕
    },
    data() {
        return {
            imageHeight: 0, // 背景图片高度
            scrollY: 0, // 滚动高度
            maxTranslateY: 0 // 向上可以滚动的最大的距离
        }
    },
    computed: {
        noResult() { // 当loading为false和歌手列表数据为空时，才加载v-no-result指令
            return !this.loading && !this.songs.length
        },
        bgImageStyle() { // 动态背景图样式
            const scrollY = this.scrollY
            let zIndex = 0
            let paddingTop = '70%'
            let height = 0
            let translateZ = 0 // 为了兼容iPhone设备zIndex无效

            // 当滚动到title区域时，改变背景图大小和title区域一样大，并层级比scroll高
            if (scrollY > this.maxTranslateY) {
                zIndex = 10
                paddingTop = 0
                height = `${RESEVED_HEIGHT}px`
                translateZ = 1 // 为了兼容iPhone设备zIndex无效
            }

            // 下拉放大背景图
            let scale = 1
            if (scrollY < 0) {
                scale = 1 + Math.abs(scrollY / this.imageHeight)
            }

            return {
                zIndex,
                paddingTop,
                height,
                backgroundImage: `url(${this.pic})`, // 动态获取背景图
                transform: `scale(${scale})translateZ(${translateZ}px)`
            }
        },
        playBtnStyle() { // 滚动到标题隐藏随机播放按钮
            let display = ''
            if (this.scrollY >= this.maxTranslateY) {
                display = 'none'
            }
            return {
                display
            }
        },
        scrollStyle() {
            return {
                top: `${this.imageHeight}px` // 固定scroll组件的高度
            }
        },
        filterStyle() { // 向上滚动背景逐渐模糊
            let blur = 0
            const scrollY = this.scrollY
            const imageHeight = this.imageHeight
            if (scrollY >= 0) {
                blur = Math.min(this.maxTranslateY / imageHeight, scrollY / imageHeight) * 20
            }
            return {
                backdropFilter: `blur(${blur}px)`
            }
        }
    },
    mounted() {
        this.imageHeight = this.$refs.bgImage.clientHeight // 获取背景图片高度
        this.maxTranslateY = this.imageHeight - RESEVED_HEIGHT // 计算出向上可以滚动的最大的距离
    },
    methods: {
        goBack() { // 点击返回上一页
            this.$router.back()
        },
        onScroll(pos) { // 拿到滚动高度
            this.scrollY = -pos.y
        },
        random() {
            this.randomPlay(this.songs)
        },
        ...mapActions([
            'selectPlay',
            'randomPlay'
        ]),
        selectItem({ song, index }) {
            this.selectPlay({
                list: this.songs,
                index
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.music-list{
    position: relative;
    height: 100%;
    .back{
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 20;
        transform: translateZ(2px);
        .icon-back{
            display: block;
            padding: 10px;
            font-size: $font-size-large-x;
            color: $color-theme;
        }
    }
    .tltie{
        position: absolute;
        top: 0;
        left: 10%;
        width: 80%;
        z-index: 20;
        transform: translateZ(2px);
        @include no-wrap();
        text-align: center;
        line-height: 40px;
        font-size: $font-size-large;
        color: $color-text;
    }
    .bg-image{
        position: relative;
        width: 100%;
        transform-origin: top; // 对元素进行原点位置改变
        background-size: cover; // 按照图片的比例放大或者缩小至充满容器
        .play-btn-wrapper{
            position: absolute;
            bottom: 20px;
            z-index: 10;
            width: 100%;
            .play-btn{
                box-sizing: border-box;
                width: 135px;
                padding: 7px 0;
                margin: 0 auto;
                text-align: center;
                border: 1px solid $color-theme;
                border-radius: 100px;
                color: $color-theme;
                .icon-play{
                    display: inline-block;
                    vertical-align: middle;
                    margin-right: 6px;
                    font-size: $font-size-medium-x;
                }
                .text{
                    display: inline-block;
                    vertical-align: middle;
                    font-size: $font-size-small;
                }
            }
        }
        .filter{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(7, 17, 27, 0.4);
        }
    }
    .list{
        position: absolute;
        bottom: 0;
        width: 100%;
        z-index: 0;
        .song-list-wrapper{
            padding: 20px 30px;
            background: $color-background;
        }
    }
}
</style>
