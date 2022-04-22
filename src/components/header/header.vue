<template>
    <div class="header">
        <span class="icon"></span>
        <h1 class="text">Chicken Music</h1>
    </div>
</template>

<script>
export default {
    name: 'm-header'
}
</script>

<style lang="scss" scoped>
.header{
    height: 44px;
    text-align: center;
    color: $color-theme;
    .icon{
        display: inline-block;
        vertical-align: top;
        width: 30px;
        height: 32px;
        margin-top: 6px;
        margin-right: 9px;
        @include bg-image('logo');
        background-size: 30px 32px;
    }
    .text{
        display: inline-block;
        font-size: $font-size-large;
        line-height: 44px;
    }
}
</style>
