<template>
    <div class="recommend" v-loading:[loadingText]="loading"> <!-- loading为true时触发v-loading自定义指令 -->
        <Scroll class="recommend-content" ref="rootRef">
            <div>  <!-- BetterScroll 默认处理容器（wrapper）的第一个子元素（content）的滚动，其它的元素都会被忽略。所以这里加个div -->
                <!-- 轮播图区域 -->
                <div class="slider-wrapper">
                    <div class="slider-content">
                        <!-- v-if="sliders.length"->有数据在加载组件 因为better-scroll的slide要求必须有一条以上的数据。这里是异步获取数据的当第一次加载时还没有获取到数据会报错slide need at least one slide page to be initialised.please check your DOM layout -->
                        <Slider v-if="sliders.length" :sliders = "sliders"></Slider>
                    </div>
                </div>
                <!-- 歌单推荐列表 -->
                <div class="recommend-list">
                    <h1 class="list-title" v-show="!loading">热门歌单推荐</h1><!-- v-show="!loading"---数据加载完在显示 -->
                    <ul>
                        <li class="item"
                          v-for="item in albums" :key="item.id"
                          @click="selectItem(item)"
                        >
                            <div class="icon">
                                <img width="60" height="60" v-lazy="item.pic">
                            </div>
                            <div class="text">
                                <h2 class="name">{{item.username}}</h2>
                                <p class="title">{{item.title}}</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </Scroll>
        <router-view v-slot="{ Component }">
            <transition appear name="slide">
                <component :is="Component" :data="selectedAlbum"/>
            </transition>
        </router-view>
    </div>
</template>

<script>
import { getRecommend } from '@/service/recommend'
import Slider from '@/components/base/slider/slider'
import Scroll from '@/components/wrap-scroll'
import storage from 'good-storage'
import { ALBUM_KEY } from '@/assets/js/constant'

export default {
    name: 'recommend',
    components: {
        Slider,
        Scroll
    },
    data() {
        return {
            sliders: [], // 轮播图相关数据
            albums: [], // 歌单列表数据
            loadingText: '正在载入...', // v-loading的动态传参
            selectedAlbum: null
        }
    },
    computed: {
        loading() {
            return !this.sliders.length && !this.albums.length
        }
    },
    async created() {
        const result = await getRecommend() // 获取轮播图&歌单相关数据
        this.sliders = result.sliders
        this.albums = result.albums
    },
    methods: {
        selectItem(album) {
            this.selectedAlbum = album
            this.caheAlbum(album)
            this.$router.push({
                path: `/recommend/${album.id}`
            })
        },
        caheAlbum(album) {
            storage.session.set(ALBUM_KEY, album)
        }
    }
}
</script>

<style lang="scss" scoped>
.recommend{
    position: fixed;
    top: 88px;
    bottom: 0;
    width: 100%;
    overflow: scroll;
    .recommend-content{
        height: 100%;
        overflow: hidden;
    }
    .slider-wrapper{ // 轮播图区域
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 40%;
        overflow: hidden;
        .slider-content{
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
        }
    }
    .recommend-list{ //歌单推荐列表
        .list-title{
            text-align: center;
            height: 65px;
            line-height: 65px;
            font-size: $font-size-medium;
            color: $color-theme;
        }
        .item{
            display: flex;
            box-sizing: border-box;
            padding: 0 20px 20px 20px;
            align-items: center;
            .icon{
                flex: 0 0 60px;
                // width: 60px;
                padding-right: 20px;
            }
            .text{
                flex: 1;
                font-size: $font-size-medium;
                overflow: hidden;
                .name{
                    margin-bottom: 10px;
                    color: $color-text;
                }
                .title{
                    color: $color-text-d;
                }
            }
        }
    }
}

</style>
