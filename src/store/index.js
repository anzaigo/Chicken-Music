import { createStore, createLogger } from 'vuex' // createLogger是日志调试插件
import state from './state'
import mutations from './mutations'
import * as getters from './getters'
import * as actions from './actions'

const debug = process.env.NODE_ENV !== 'production' // 开发环境

export default createStore({
  state,
  getters,
  mutations,
  actions,
  strict: debug, // 严格模式
  plugins: debug ? [createLogger()] : []
})
