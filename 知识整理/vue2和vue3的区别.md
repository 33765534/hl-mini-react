### 一、选项式Api与组合式Api
选项式api是将data和mathods方法放在一个对象中包括watch和computed选项，而组合式api是将相关逻辑放到一起(类似于原生js开发)，setup函数是组合式api的入口函数。使用setup语法糖可以让变量和方法直接暴露给模板，从而在模板中使用。
### 二、响应式的创建
1. 在vue2 中 data函数的数据都具有响应式，在vue3中需要使用ref和reactive来创建响应式数据。
2. ref和reactive的区别：ref用来处理基本数据类型，reactive用来处理对象类型。

3. 在vue2中使用Object.defineProperty()来创建响应式数据，在vue3中使用Proxy来创建响应式数据。
4. proxy可以监听数组的变化以及属性删除等操作，而defineProperty()只能监听对象属性的变化。
5. defineProperty需要循环遍历对象的所有属性，而proxy只需要监听对象本身即可。

6. 他们都是通过get方法来收集响应式数据的依赖，利用set的去重的功能来存储每次得到的effects，从而实现依赖收集，再通过set方法来触发依赖，实现通知依赖更新。

### 三、生命周期的变化
1. vue2中的生命周期钩子函数在vue3中已经被移除，取而代之的是组合式api中的生命周期钩子函数。
2. 组合式API采用hook函数引入生命周期钩子函数,不止生命周期采用hook函数引入，像watch和computed也采用hook函数引入。

3. vue3的生命周期相对于vue2做了一些调整，命名上发生了变化，并且去除了beforeCreate和created这两个生命周期钩子函数。因为setup函数在组件创建之前就已经执行了，所以这两个生命周期钩子函数已经没有存在的必要。

|  | 阶段 | 触发阶段 | Vue2 | Vue3 | 描述 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| <td rowspan="4">创建阶段</td> | 实例创建前 | onBeforeCreate | - | 组件创建前调用 |
|  | 实例创建后 | created | - | 组件创建后调用 |
|  | DOM挂载前 | beforeMount | onBeforeMount | DOM挂载前调用 |
|  | DOM挂载完成 | mounted | onMounted | DOM挂载完成调用 |
| <td rowspan="2">更新阶段</td> | 数据更新之前 | beforeUpdate | onBeforeUpdate | 数据更新之前被调用 |
|  | 数据更新之后 | updated | onUpdated | 数据更新之后被调用 |
| <td rowspan="2">销毁阶段</td> | 组件销毁前 | beforeDestroy | onBeforeUnmount | 组件销毁前调用 |
|  | 组件销毁完成 | destroyed | onUnmounted | 组件销毁完成调用 |

父子组件之间生命周期的执行顺序：

父setup->父onBeforeMount->父onMounted->

子setup->子onBeforeMount->子onMounted->

父onBeforeUpdate->

子onBeforeUpdate->子onUpdated->

父onUpdated->

父onBeforeUnmount->

子onBeforeUnmount->子onUnmounted->

父onUnmounted

### 四、组件的创建
vue3中组件的创建方式发生了变化，vue2中组件的创建方式是通过Vue.extend()方法来创建的，vue3中组件的创建方式是通过createApp()方法来创建的。
createApp()方法接收两个参数，第一个参数是根组件的选项，第二个参数是全局配置。

### 五、watchEffect
watchEffect()函数是vue3中新增的一个函数，它可以自动收集依赖。
watchEffect()函数的参数是一个函数，该函数中可以访问到响应式的数据，并且当响应式的数据发生变化时，会自动重新执行该函数。
watchEffect()函数的返回值是一个函数，该函数可以用来停止监听。
computed和watch所依赖的数据必须是响应式的，watchEffect相当于将watch的依赖源和回调函数合并，不同于 watch的是 watchEffect 的回调函数会被立即执行，即({immediate:true})

### 六、组件通信
vue中组件通信方式有很多,vue2和vue3中组件通信方式也有所不同。

| 方式 | Vue2 | Vue3|
| ---- | ---- | ---- | 
| 父传子 | props | props |
| 子传父 | $emit | emits |
| 父传子 | $attrs | attrs |
| 子传父 | $listeners | 无(合并到 attrs方式) |
| 父传子 | provide | provide |
| 子传父 | inject | inject |
| 子组件访问父组件 | $parent | 无 |
| 父组件访问子组件 | $children | 无 |
| 父组件访问子组件 | $ref | expose&ref |
| 兄弟传值 | EventBus | mitt |

### 七、v-model 和 syns
vue3中移除了syns的写法，取而代之的是v-model:event的形式

其v-model:changePval="msg"或者:changePval.sync="msg"的完整写法为 :msg="msg" @update:changePval="msg=$event"。

所以子组件需要发送update:changePval事件进行修改父组件的值

### 八、快速 diff 算法
Vue2和Vue3的diff算法在实现上有所不同，主要体现在以下几个方面：

1. Vue2采用了递归比较整个虚拟DOM树的方式，而Vue3采用了基于栈的表格算法，这使得diff过程更快。使用最长子序列算法可以更高效地处理列表的更新。

2. Vue3中增加了Push/Patch flags的概念，可以更精确地表示节点的变化类型，减少了不必要的比较，进一步提高了diff的效率。例如：
   1. childOnly：如果设置，表示 patch 函数只更新当前节点的子节点。例如，当更新文本节点时。

   2. text：如果设置，表示 patch 函数更新当前节点的文本内容。

   3. html：如果设置，表示 patch 函数更新整个节点，包括文本内容、子节点等。
3. Vue3中对于静态节点进行了优化，可以共享相同的DOM节点，减少了DOM操作次数，提高了性能。

4. Vue3中的diff会在比较过程中考虑节点类型，如果节点类型不同，会直接替换节点，而不是比较子节点。

5. Vue3中的diff算法对于动态节点的处理也进行了优化，比如在相同类型的组件间进行移动操作时，会更精确地定位到移动的节点。
   
6. vue3中的diff算法还考虑了key的作用，在更新列表时，会根据key来判断节点是否需要更新，从而减少DOM操作次数。

7.  Vue3中的diff算法还考虑了Fragment的优化，可以更高效地处理多个子节点。

8.  Vue3中的diff算法还包括了对Composition API和Teleport等特性的支持。

### 六、Teleport
Teleport 用于将我们的组件html结构移动到指定的标签下。
它允许你将一个元素从一个位置移动到另一个位置，从而实现动画效果。Teleport 是一个与元素位置相关的组件，它可以被用在任何需要进行位置跳转的 Vue 应用程序中。

### 七、Suspense
Suspense 是一个用于控制渲染顺序的 Vue 3 组件。它允许你控制具有多个依赖关系的组件的渲染顺序，从而实现动画效果。Suspense 是一个基于依赖追踪的组件，它可以被用在任何需要控制渲染顺序的 Vue 应用程序中。

### 八、Fragment
Fragment 允许你根据组件的嵌套层级来渲染或省略部分组件。这可以帮助你减少页面内容的渲染，从而提高页面加载速度。Fragment 基于 Vue 的依赖注入和组件渲染机制，可以被用在任何需要优化性能的 Vue 应用程序中。

### 静态提升
在 Vue 3 中，我们使用了静态编译器（如 Webpack 或 Rollup）来优化代码。在编译过程中，Vue 使用了静态编译器的优化技术，比如内联样式、纯函数组件、代码压缩等，从而提高了应用程序的性能。

1. 内联样式：Vue 3 会将组件的样式内联到 JavaScript 代码中，这样浏览器就可以直接通过 JavaScript 解析样式，而不需要额外的 HTML 标签。这有助于减少额外的网络请求和渲染时间。

2. 纯函数组件：Vue 3 要求所有的组件都是纯函数。这意味着组件的状态、逻辑和 DOM 操作都是纯的，这有助于避免不必要的 DOM 操作和提高性能。

3. 代码压缩：静态编译器会自动对 JavaScript 代码进行压缩。压缩后的代码通常更小，浏览器需要 fewer bytes to download and execute，从而提高浏览器的性能。

4. 其他优化：静态编译器还会进行其他优化，比如自动优化、代码重用、最小化包的大小等，从而提高应用程序的性能。

总之，Vue 3 的静态提升主要是通过内联样式、纯函数组件、代码压缩等的技术，来减少不必要的 DOM 操作和提高浏览器性能。

