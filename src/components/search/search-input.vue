<template>
    <div class="search-input">
        <i class="icon-search"></i>
        <input type="text" class="input-inner" v-model="query" :placeholder="placeholder"/>
        <i class="icon-dismiss" v-show="query" @click="clear"></i>
    </div>
</template>

<script>
    import { debounce } from 'throttle-debounce'
    export default {
        name: 'search-input',
        props: {
            modelValue: String,
            placeholder: {
                type: String,
                default: '搜索歌曲、歌手'
            }
        },
        emits: [
            'update:modelValue'
        ],
        data() {
            return {
                query: this.modelValue
            }
        },
        created() {
            this.$watch('query', debounce(300, (newQuery) => { // 用户输入限制回掉函数的执行频率为300ms延迟触发
                this.$emit('update:modelValue', newQuery.trim())
            }))

            this.$watch('modelValue', (newVal) => { // 当通过关键字触发input实现双向绑定
                this.query = newVal
            })
        },
        methods: {
            clear() { // 清空
                this.query = ''
            }
        }
    }
</script>

<style lang="scss" scoped>
.search-input {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    padding: 0 6px;
    height: 32px;
    background: $color-highlight-background;
    border-radius: 6px;
    .icon-search {
        font-size: 24px;
        color: $color-text-d;
    }
    .input-inner {
        flex: 1;
        margin: 0 5px;
        line-height: 18px;
        background: $color-highlight-background;
        color: $color-text;
        font-size: $font-size-medium;
        outline: 0;
        &::placeholder {
            color: $color-text-d;
        }
    }
    .icon-dismiss {
        font-size: 16px;
        color: $color-text-d;
    }
}
</style>
