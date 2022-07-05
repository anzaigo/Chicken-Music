<template>
    <div class="user-center" v-no-result:[noResultText]="noResult">
        <div class="back" @click="back">
            <i class="icon-back"></i>
        </div>
        <div class="switches-wrapper">
            <Switches :items="['我喜欢的', '最近播放']"
              v-model="currentIndex"
            >
            </Switches>
        </div>
        <div class="play-btn"
          v-if="currentList.length"
          @click="random"
        >
            <i class="icon-play"></i>
            <span class="text">随机播放全部</span>
        </div>
        <div class="list-wrapper">
            <Scroll class="list-scroll" v-if="currentIndex===0">
                <div class="list-inner">
                    <SongList :songs="favoriteList" @select="selectSong"></SongList>
                </div>
            </Scroll>
            <Scroll class="list-scroll" v-if="currentIndex===1">
                <div class="list-inner">
                    <SongList :songs="playHistory" @select="selectSong"></SongList>
                </div>
            </Scroll>
        </div>
    </div>
</template>

<script>
import Switches from '../components/base/switches/switches.vue'
import Scroll from '@/components/wrap-scroll'
import SongList from '../components/base/song-list/song-list.vue'

import { mapState, mapActions } from 'vuex'
export default {
    name: 'user-center',
    components: {
        Switches,
        Scroll,
        SongList
    },
    data() {
        return {
            currentIndex: 0
        }
    },
    computed: {
        noResult() { // v-no-result提示条件
            return this.currentIndex === 0 ? !this.favoriteList.length : !this.playHistory.length
        },
        noResultText() { // v-no-result提示语句
            return this.currentIndex === 0 ? '暂无收藏歌曲' : '你还没有听过歌曲'
        },
        currentList() { // 随机播放btn是否显示：存在数据显示否则不显示
            return this.currentIndex === 0 ? this.favoriteList : this.playHistory
        },
        ...mapState([
            'favoriteList', // 我的收藏
            'playHistory' // 播放历史
        ])
    },
    methods: {
        back() { // 返回上一页
            this.$router.back()
        },
        selectSong({ song }) { // 添加到播放列表并播放
            this.addSong(song)
        },
        random() { // 随机播放
            this.randomPlay(this.currentList)
        },
        ...mapActions([
            'addSong',
            'randomPlay'
        ])
    }
}
</script>

<style lang="scss" scoped>
.user-center {
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: 100;
    width: 100%;
    background: $color-background;
    .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;
        .icon-back {
            display: block;
            padding: 10px;
            font-size: $font-size-large-x;
            color: $color-theme;
        }
    }
    .switches-wrapper {
        margin: 10px 0 30px 0;
    }
    .play-btn {
        box-sizing: border-box;
        width: 135px;
        padding: 7px 0;
        margin: 0 auto;
        text-align: center;
        border: 1px solid $color-text-l;
        color: $color-text-l;
        border-radius: 100px;
        font-size: 0;
        .icon-play {
            display: inline-block;
            vertical-align: middle;
            margin-right: 6px;
            font-size: $font-size-medium-x;
        }
        .text {
            display: inline-block;
            vertical-align: middle;
            font-size: $font-size-small;
        }
    }
    .list-wrapper {
        position: absolute;
        top: 110px;
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
}
</style>
