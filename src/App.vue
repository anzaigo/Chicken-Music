<template>
  <m-header></m-header>
  <Tab></Tab>
  <router-view :style="viewStyle"></router-view>
  <player></player>
</template>
<script>
import Header from '@/components/header/header.vue'
import Tab from '@/components/tab/tab.vue'
import Player from './components/player/player.vue'
import { mapState } from 'vuex'
export default {
  components: {
    MHeader: Header,
    Tab,
    Player
  },
  computed: {
    viewStyle() { // // 撑开mini播放器的高度
      const bottom = this.playlist.length ? '60px' : '0'
      return {
        bottom
      }
    },
    ...mapState([
    'playlist'
  ])
}
  }
</script>
