import { terser } from "rollup-plugin-terser";

export default {
  input: 'localforage.js', // 入口文件
  output: {
    file: 'dist/localforage.js', // 输出文件
    format: 'es', // 输出为 ES6 模块
  },
  plugins: [terser()] // 使用 Terser 插件进行压缩
};
