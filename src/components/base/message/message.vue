<template>
    <teleport to="body">
        <transition name="slide-down">
            <div class="message" v-show="visible" @click="hide">
                <slot></slot>
            </div>
        </transition>
    </teleport>
</template>

<script>
    export default {
        name: 'message',
        props: {
            delay: {
                type: Number,
                default: 2000
            }
        },
        data() {
            return {
                visible: false
            }
        },
        methods: {
            show() { // 显示提示
                this.visible = true
                clearTimeout(this.timer) // 防止被用户多次点击导致的多次执行，每次执行前清除掉
                this.timer = setTimeout(() => {
                    this.hide()
                }, this.delay)
            },
            hide() { // 隐藏提示
                clearTimeout(this.timer)
                this.visible = false
            }
        }
    }
</script>

<style lang="scss" scoped>
.message {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 400;
    background: $color-dialog-background;
    &.slide-down-enter-active, &.slide-down-leave-active {
        transition: all 0.3s;
    }
    &.slide-down-enter-from, &.slide-down-leave-to {
        transform: translate3d(0, -100%, 0);
    }
}
</style>
