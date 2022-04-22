import { createApp } from 'vue'
import Loading from './loading.vue'
import { addClass, removeClass } from '@/assets/js/dom'

const relativeCls = 'g-relative' // 定义一个样式名变量，g-relative已经在base.scss全局样式中定义了position: relative;
const loadingDirective = {
    mounted(el, binding) {
        const app = createApp(Loading) // app的根组件就是import进来的loading组件
        const instance = app.mount(document.createElement('div')) // 动态创建（插入）一个元素节点div挂载在app实例上
        el.instance = instance // el：指令所绑定的元素，可以用来直接操作 DOM。

        const title = binding.arg // arg：传给指令的参数，可选。例如 v-my-directive:foo 中，参数为 "foo"
        if (typeof title !== 'undefined') { // 当有动态指令arg时，调用Loading组件的setTitle函数
            instance.setTitle(title)
        }
        console.log(title)
        if (binding.value) { // binding.value的值是外部作用在dom上的v-loading="loading"的loading的值
            append(el)
        }
    },
    updated(el, binding) {
        // arg动态参数
        const title = binding.arg
        if (typeof title !== 'undefined') {
            el.instance.setTitle(title)
        }

        // 删除/添加el节点
        if (binding.value !== binding.oldValue) {
            binding.value ? append(el) : remove(el)
        }
    }
}

function append(el) {
    const style = getComputedStyle(el) // 获取该节点的使用样式
    if (['absolute', 'fixed', 'relative'].indexOf(style.position) === -1) { // 因为loading组件是通过定位的样式absolute来布局的，如果被绑定的节点没有定位属性样式，则自己动态添加一个
       addClass(el, relativeCls)
    }

    el.appendChild(el.instance.$el) // appendChild() 方法向节点的子节点列表的末尾添加新的子节点，$el作用是绑定在v-loading="loading"自定义指令的dom节点上
}

function remove(el) {
    removeClass(el, relativeCls)
    el.removeChild(el.instance.$el) // removeChild() 方法从子节点列表中删除某个节点，$el作用是绑定在v-loading="loading"自定义指令的dom节点上
}

export default loadingDirective
