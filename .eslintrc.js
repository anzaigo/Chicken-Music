module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    indent: 0, // 不对空格缩进排查
    'space-before-function-paren': 0, // 函数括号前缺少空格不排查
    'vue/multi-word-component-names': 0 // 不对文件进行驼峰命名和-连接命名法进行排查报错
  }
}
