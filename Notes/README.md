## 实现最简单的 mini-react

react API 的引用

```
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```

### 写死渲染 dom

#### 第一步 创建 dom 元素

createElement 创建 dom 元素

```
const dom = document.createElement("div");
dom.id="app"
document.querySelector("#root").appendChild(dom);

const textNode = document.createTextNode("");
textNode.nodeValue = "app";
dom.append(textNode)

```

#### 第二步 创建虚拟 dom

react 是一个虚拟 dom 虚拟 dom 就是 js 对象

```
const element = {
    type: "div",
    props: {
        id: "app",
        children: [
            type:"TEXT_ELEMENT",
            props:{
                nodeValue:"app",
                children:[]
            }
        ]
    }
}
```

优化一下 把 TEXT_ELEMENT 虚拟 dom 抽离一下

```
const textElement = {
    type: "TEXT_ELEMENT",
    props: {
        nodeValue: "app",
        children: []
    }
}
const element = {
    type: "div",
    props: {
        id: "app",
        children: [textElement]
    }
}
```

接下来就是渲染虚拟 dom
我们把第一步的创建修改一下 可以看到页面上依然是可以展示 app 的

```
const dom = document.createElement(element.type);
dom.id=elment.props.id;
document.querySelector("#root").appendChild(dom);

const textNode = document.createTextNode("");
textNode.nodeValue = textElement.props.nodeValue;
dom.append(textNode)
```

### 动态创建 vnode

对于 textElement 虚拟 dom 来说 他的变动点就是 nodeValue
我们可以抽个函数出来 专门用来处理这个变动点

```
createTextNode(text){
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: []
        }
    }
}
```

接下来就是 element 虚拟 dom 的变动点了, 他的变动点就是 type、props、children
通过剩余参数的写法 把 children 变成数组

```
function createElement(type,props,...children){
    return {
        type,
        props:{
            ...props,
            children
        }
    }
}
```

接下来调用一下 createElement 创建一个 App
我们就可以动态的创建虚拟 dom 了

```
const textElement=createTextNode("app");
const App = createElement("div",{id:"app"},textElement)

const dom = document.createElement(App.type);
dom.id=App.props.id;
document.querySelector("#root").appendChild(dom);

const textNode = document.createTextNode("");
textNode.nodeValue = textElement.props.nodeValue;
dom.append(textNode)
```

### 动态创建 dom （动态递归生成）

我们可以先观察一下创建 dom 节点的过程
第一步 ：创建一个节点
第二步 ：设置节点的属性也就是创建 props
第三步 ：把子节点添加到父节点中

我们可以把创建节点的过程抽成一个 render 函数

```
function render(el,container){
    // 创建节点 先判断一下是text类型么
    const dom = el.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(el.type);
    // 设置节点属性 id class 等
    Object.keys(el.props).forEach((key)=>{
        // 判断一下是不是children属性 不是则直接赋值
        if(key !== "children"){
            dom[key]=el.props[key]
        }
    });
    // 把子节点添加到父节点中
    el.props.children.forEach((child)=>{
        render(child,dom)
    });
    // 添加到容器中
   container.append(dom);
}

const textElement=createTextNode("app");
const App = createElement("div",{id:"app"},textElement);
// 接下来我们就可以调用 render 函数把 App 渲染到页面上
render(App,document.querySelector("#root"));
```

### 重构 api

```
const textElement=createTextNode("app");
const App = createElement("div",{id:"app"},textElement);
```

不想通过 textElement=createTextNode("app") 来创建 app 节点，想要直接传入"app"

```
const App = createElement("div",{id:"app"},"app");
```

重构 createElement

```
function createElement(type,props,...children){
   return {
       type,
       props:{
           ...props,
           children:children.map((child)=>{
               return typeof child === "object" ? child : createTextNode(child);
           })
       }
   }
}
```

#### 实现 ReactDOM.createRoot

```
const ReactDOM = {
    createRoot(container){
        return {
            render(App){
                render(App,container);
            }
        }
    }
}

// 调用
const App = createElement("div",{id:"app"},"app");
ReactDOM.createRoot(document.querySelector("#root")).render(App);
```

为了更接近 react 的 api 我们拆分一下 分成两个 js
React.js

```

function createElement(type,props,...children){
    return {
        type,
        props:{
            ...props,
            children:children.map((child)=>{
                return typeof child === "object" ? child : createTextNode(child);
            })
        }
    }
}

function createTextNode(text){
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: []
        }
    }
}

function render(el,container){
    // 创建节点 先判断一下是text类型么
    const dom = el.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(el.type);
    // 设置节点属性 id class 等
    Object.keys(el.props).forEach((key)=>{
        // 判断一下是不是children属性 不是则直接赋值
        if(key !== "children"){
            dom[key]=el.props[key]
        }
    });
    // 把子节点添加到父节点中
    el.props.children.forEach((child)=>{
        render(child,dom)
    });
    // 添加到容器中
   container.append(dom);
}

const React = {
    createElement,
    render
}

export default React;
```

ReactDOM.js

```
import React from "./React.js";
const ReactDOM = {
    createRoot(container){
        return {
            render(App){
                React.render(App,container);
            }
        }
    }
}
export default ReactDOM;
```

App.js

```
import React from "./core/React.js";
const App = React.createElement("div",{id:"app"},"app");

export default App;
```

main.js

```
import ReactDOM from "./core/ReactDOM.js";
import App from "./App.js";

ReactDOM.createRoot(document.querySelector("#root")).render(App);
```

### 使用 jsx 代替掉 js 写法

#### 借助 vite 实现 jsx 的解析

创建一个 vite 项目 选择最普通的 Vanilla + js

```
pnpm create vite
```

把无用的代码先删除，然后把之前写好的 main.js 中的代码复制过来
再把 App.js 改成 App.jsx 复制过来
再把 core 文件夹 复制过来
index.html 文件中的是 app 我们修改成 root 页面就可以正常访问了
没用安装任何的依赖 就可以直接使用 jsx 了

很神奇 竟然两种写法都是调用 React.createElement 创建 App

```
import React from "./core/React.js";
// const App = React.createElement("div",{id:"app"},"app-hhh");
const App = <div>app-hhh</div>

export default App;
```

## 实现任务调度器

### 为什么我们需要调度器？

卡顿演示 demo:

```
const el=document.createElement("div");
el.innerText="1";
document.body.appendChild(el);
let i=0;
while(i<100000000){  // 模拟大量任务
    i++;
}
```

js 是单线程，如果我们在主线程中执行大量任务，会导致主线程阻塞，从而导致卡顿。

react 的 render 函数也是同样的道理，如果我们在 render 函数中执行大量任务(dom 树过大的时候)，也会导致卡顿，所以我们需要对任务进行拆分，拆分成一个个小任务，然后依次执行，从而避免卡顿。

因为 React 是一个异步的框架，它需要一个任务调度器来控制任务的执行顺序和优先级。

#### 思考：vue 会出现卡顿吗？

vue 中的任务调度器是基于微任务实现的，nextTick 它使用 Promise 来创建微任务，并将任务添加到微任务队列中。

React 中的任务调度器是基于宏任务实现的，它使用 setTimeout 来创建宏任务，并将任务添加到宏任务队列中。

vue 中的任务调度器是 Vue.js 中的一个核心概念，它负责协调和调度 Vue 组件的更新、渲染和交互等。React 中的任务调度器是 ReactFiber 中的一个核心概念，它负责协调和调度 React 组件的更新、渲染和交互等。

#### 拆分成一个个小任务，然后依次执行，从而避免卡顿

我们可以利用分支的思想，把一个大任务拆分成一个个小任务，然后依次执行这些小任务，从而避免卡顿。

比如每个分支只渲染两个 dom ，这样我们就不会有过多的逻辑去执行，就不会堵塞后续的渲染了。

我们可以先借助浏览器提供的 requestIdleCallback 方法，来模拟任务的拆分和执行。

timeRemaining 方法返回当前帧还剩余多少时间，单位是毫秒。

官网文档：develper.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback
![Alt text](image-1.png)
requestIdleCallback demo 演示：

```
let taskId=1；
function workLoop(deadLine){
    taskId++;
    let shouldYield=false;// 判断是否中断
    while(!shouldYield){
        // run task
        console.log("taskId:",taskId);
        // dom
        shouldYield=deadLine.timeRemaining()<1;
    }
    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);
```

转换到 react 中的实现：

React.js

```
let nextUnitOfWork=null;
function workLoop(deadLine){
    let shouldYield=false;// 判断是否中断
    while(nextUnitOfWork && !shouldYield){
        // 执行任务并返回下一个任务
        nextUnitOfWork=performWorkOfUnit(nextUnitOfWork);
        shouldYield=deadLine.timeRemaining()<1;// 剩余时间
    }
    if(nextUnitOfWork){
        requestIdleCallback(workLoop);
    }
}
// 任务调度器
requestIdleCallback(workLoop);
```

### 实现 filber 架构

问题：如何做到每次之渲染几个节点尼？下次执行的时候依然从之前的位置执行？

思路：把树结构转变成链表结构

如何把树转变成链表结构？

1.child(子节点) 先看当前节点有没有 child，如果有 child，那么 child 就是下一个节点

2.sibling(兄弟节点) 如果当前节点没有 child，那么就找当前节点的 sibling，如果当前节点没有 sibling，那么就找当前节点的 parent 的 sibling

3.parent 如果当前节点没有 sibling，那么就找当前节点的 parent，如果当前节点没有 parent，那么就结束
![Alt text](image-2.png)

#### 实现转换链表

1.创建一个 performWorkOfUnit 函数，该函数接收一个节点作为参数，并转换链表 设置好指针 2.在 performWorkOfUnit 函数中，返回下一个要执行的任务

React.js

```
// 转换链表
function performWorkOfUnit(work){
    // render的时候已经给了dom  所以判断如果没有dom的时候再创建dom
    if(!work.dom){
        // 1. 创建 dom
        const dom = (work.dom = work.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(work.type));

        // 父级容器
        work.parent.dom.append(dom);

        // 2. 处理 props
        Object.keys(work.props).forEach((key)=>{
            // 判断一下是不是children属性 不是则直接赋值
            if(key !== "children"){
                dom[key]=work.props[key]
            }
        });
    }
    // 3. 转换链表 设置好指针
    const children = work.props.children || [];
    let prevchild = null;// 上一个孩子节点
    children.forEach((child,index)=>{
        const newWork={// 为了不破坏 vnode (child) 所以新写一个
            type:child.type,
            props:child.props,
            parent:work,
            sibling:null,
            dom:null,
        }
        if(index===0){ // 如果是第一个 就直接放到child 中
            work.child=newWork;
        }else{
            prevchild.sibling=newWork; // 这样就 指向了 C
        }
        prevchild=newWork;
    });

    // 4. 返回下一个要执行的任务
    if(work.child){ // 有孩子节点 返回第一个孩子节点
        return work.child;
    }
    if(work.sibling){ // 没有孩子节点 返回兄弟节点
        return work.sibling;
    }
    return work.parent?.sibling || null;// 没有兄弟节点 返回父节点的兄弟节点
}
```

修改一下 render 函数
React.js

```
function render(el,container){
    // 创建一个根节点 作为任务执行的dom
    nextUnitOfWork={
        dom:container,
        props:{
            children:[el]
        }
    }
}
```

#### 重构代码

创建一个 createDom 函数来创建 dom

再创建一个 updateProps 函数来处理 props

再创建一个 initChildren 函数来处理子节点

并在 performWorkOfUnit 中使用

React.js

```
function createDom(type){
    return type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(type);
}

function updateProps(dom,props){
    Object.keys(props).forEach((key)=>{
        // 判断一下是不是children属性 不是则直接赋值
        if(key !== "children"){
            dom[key]=props[key]
        }
    });
}

function initChildren(fiber){
    // 3. 转换链表 设置好指针
    const children = fiber.props.children || [];
    let prevchild = null;// 上一个孩子节点
    children.forEach((child,index)=>{
        const newFiber={// 为了不破坏 vnode (child) 所以新写一个
            type:child.type,
            props:child.props,
            parent:fiber,
            sibling:null,
            dom:null,
        }
        if(index===0){ // 如果是第一个 就直接放到child 中
            fiber.child=newFiber;
        }else{
            prevchild.sibling=newFiber; // 这样就 指向了 C
        }
        prevchild=newFiber;
    });
}

function performWorkOfUnit(fiber){
    // render的时候已经给了dom  所以判断如果没有dom的时候再创建dom
    if(!fiber.dom){
        // 1. 创建 dom
        const dom = (fiber.dom = createDom(fiber.type));
        // 父级容器
        fiber.parent.dom.append(dom);
        // 2. 处理 props
        updateProps(dom,fiber.props);
    }

    // 3. 转换链表 设置好指针
    initChildren(fiber);

    // 4. 返回下一个要执行的任务
    if(fiber.child){ // 有孩子节点 返回第一个孩子节点
        return fiber.child;
    }
    if(fiber.sibling){ // 没有孩子节点 返回兄弟节点
        return fiber.sibling;
    }
    return fiber.parent?.sibling;// 没有兄弟节点 返回父节点的兄弟节点
}
```

## 统一提交到页面中

问题：我们是使用 requestIdleCallback 来实现的，只有等待浏览器有空闲时间才会执行任务，如果任务很多，那页面渲染就只能看到一半渲染。

解决思路：

计算结束后统一添加到页面中

1. 需要知道链表什么时候结束，当 nextUnitOfWork 为 null 的时候链表就结束了。
2. 需要知道链表的第一个节点，因为需要从第一个节点开始 append。也就是 redner 赋的值，我们用 root 记录这个值。

React.js

```
let root = null;
function render(el, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [el],
    },
  };

  root = nextUnitOfWork;
}

function workLoop(deadline){
    let shouldYield=false;
    while(nextUnitOfWork && !shouldYield){
        nextUnitOfWork=performWorkOfUnit(nextUnitOfWork);
        shouldYield=deadline.timeRemaining()<1;
    }
    // 链表结束之后调用 append 添加到页面中
    if(!nextUnitOfWork && root){
        commitRoot();
    }
    requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);

function commitRoot(){
    commitWork(root.child);
    root=null;
}
function commitWork(fiber){
    if(!fiber) return;
    // 找到父级把当前dom添加进去
    filber.parent.dom.append(fiber.dom);
    // 递归添加子节点
    commitWork(fiber.child);
    // 递归添加兄弟节点
    commitWork(fiber.sibling);
}
```

同时把之前在 performWorkOfUnit 中的 append 方法删除
React.js

```
function performWorkOfUnit(fiber){
    // 省略...
    // filber.parent.dom.append(dom);
    // 省略...
}
```

## 实现支持 function component

#### 实现 function component

在 react 中创建一个组件是非常容易的
demo:

```
import React from './core/React';
function MyComponent() {
    return <div>Hello, world!</div>;
}

const App = (
    <div>
    hi-mini-react
    <MyComponent />
    </div>
);

export default App;
```

当前这个例子运行起来会报错，type name 是 function，当前不支持 function component
![Alt text](image-3.png)
我们怎么才能得到 counter 下的节点尼？
需要调用 function（开箱）
![Alt text](image-4.png)
我们在 createWorkInProgress 中添加一个判断，如果 type 是 function 则调用该函数

```
function performWorkOnUnit(fiber){
    const isFunctionComponent = fiber.type instanceof Function;
    if(isFunctionComponent){
        console.log(fiber.type());
    }
    // 省略...
}
```

可以看到我们得到的是一个对象
![Alt text](image-5.png)

1. 对于我们程序来说 initChildren 需要的是一个数组，可以包裹一下，我们把 initChildren 中处理 children 的提取出来,当作参数传入
2. 对于 function 而言我们不需要创建 dom，所以不是 function 的时候才需要创建 dom

```
function performWorkOnUnit(fiber){
    const isFunctionComponent = fiber.type instanceof Function;
    if(!isFunctionComponent){
        if (!fiber.dom) {
        // 创建节点 先判断一下是text类型么
        const dom = (fiber.dom = createDom(fiber.type));

        // 存放 父级容器
        // fiber.parent.dom.append(dom);
        // 处理props
        updateProps(dom, fiber.props);
        }
    }

    const children=isFunctionComponent?[fiber.type()]:fiber.props.children;
    initChildren(fiber,children);
    // 省略...
}
```

到此我们的页面可以渲染出 hi-mini-react 了，function 的组件还没有展示出来还报了一个错，这是因为我们 function 是没有父级的，子节点没办法 append 挂载
![Alt text](image-6.png)
那么怎么解决尼？父类没有是不是可以继续往上找，然后挂载，在统一提交的函数中处理

```
function commitWork(fiber){
    if(!fiber) return;
    let fiberParent=fiber.parent;
    if(!fiberParent.dom){
        fiberParent=fiberParent.parent;
    }
    // 找到父级把当前dom添加进去
    fiberParent.dom.append(fiber.dom);
    // 递归添加子节点
    commitWork(fiber.child);
    // 递归添加兄弟节点
    commitWork(fiber.sibling);
}
```

到这我们可以渲染 function 的组件了，但是还打印了个 null
是因为我们在 append 的时候 把空的也添加进去了
![Alt text](image-7.png)
那么怎么处理呢？
我们在 append 的时候 判断一下是不是空的，如果是空的就不添加了

```
// 找到父级把当前dom添加进去
    if(fiber.dom)fiberParent.dom.append(fiber.dom);
```

如果我们的 function component 是嵌套的，那么怎么处理呢？

```
import React from './core/React';
function MyComponent() {
    return <div>Hello, world!</div>;
}
function Component(){
    return (
        <div>
        <MyComponent />
        </div>
    );
}

const App = (
    <div>
    hi-mini-react
    <Component />
    </div>
);

export default App;
```

可以看到报错了，在 append 的时候找不到父级挂载
![Alt text](image-8.png)
我们在找父级的时候要调整一下,利用 while 循环找到父级,这样就解决嵌套的问题了

```
function commitWork(fiber){
    if(!fiber) return;
    let fiberParent=fiber.parent;
    // 循环找到父级
    while(!fiberParent.dom){
        fiberParent=fiberParent.parent;
    }
    // 找到父级把当前dom添加进去
    fiberParent.dom.append(fiber.dom);
    // 递归添加子节点
    commitWork(fiber.child);
    // 递归添加兄弟节点
    commitWork(fiber.sibling);
}
```

到这，我们就可以愉快的使用 function component 了

App.jsx

```
import React from './core/React';
function MyComponent() {
    return <div>Hello, world!</div>;
}
function Component(){
    return (
        <div>
        <MyComponent />
        </div>
    );
}

function App(){
    <div>
    hi-mini-react
    <Component />
    </div>
};

export default App;
```

main.js 修改成 main.jsx  
以及 index.html 中的main.jsx引用

```
import ReactDOM from "./core/ReactDOM.js";
import React from "./core/React.js";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(<App></App>);

```

#### function component 支持 props

App.jsx

```
import React from './core/React';

function Component({num}){
    return (
        <div>
        count:{num}
        </div>
    );
}

function App(){
    <div>
    hi-mini-react
    <Component num={10}/>
    </div>
};

export default App;
```

可以看到目前的实现没有传 props
![Alt text](image-9.png)

接下来我们实现一下

```
function performWorkOnUnit(fiber){
    // 省略...
    const children=isFunctionComponent?[fiber.type(fiber.props)]:fiber.props.children;
    initChildren(fiber,children);
    // 省略...
}
```

给完之后可以看到还是报错

![Alt text](image-10.png)
我们之前只处理 string 现在我们传入的是 number 类型，所以把我们传入的 props 当成 child 处理了

![Alt text](image-11.png)
在增加一个 number 类型的判断

![Alt text](image-12.png)

接下来我们调用多个 Component 组件

结构如下
![Alt text](image-13.png)

App.jsx

```
import React from './core/React';

function Component({num}){
    return (
        <div>
        count:{num}
        </div>
    );
}

function App(){
    <div>
    hi-mini-react
    <Component num={10}/>
    <Component num={20}/>
    </div>
};

export default App;
```

通过断点调试可以找到 当 function component 的节点都处理完之后，去找父级的父级的兄弟节点时出现的错误。

```
function performWorkOnUnit(fiber){
    // 省略...
    // 返回下一个要执行的任务
  if (fiber.child) {
    // 有孩子节点 返回第一个孩子节点
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
        // 没有孩子节点 返回兄弟节点
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  return null;
}
```

#### 重构代码

抽离一下 处理 function component 的逻辑 以及 非 function component 的逻辑

```
// 处理 function component
function updateFunctionComponent(fiber){
    const children=[filber.type(filber.props)]
    initChildren(fiber,children);
}

// 非 function component
function updateHostComponent(fiber){
    if(!filber.dom){
        const dom = (filber.dom = createDom(fiber.type));

        updateProps(dom,fiber.props);
    }
    const children = fiber.props.children;
    initChildren(fiber,children);
}

function performUnitOfWork(fiber){
    const isFunctionComponent = fiber.type instanceof Function;

    if(isFunctionComponent){
        updateFunctionComponent(fiber);
    }else{
        updateHostComponent(fiber);
    }

    // 省略 ...
}
```

## 实现绑定事件
在 App.jsx 中，添加一个按钮，并绑定点击事件。
```
function Component({ num }) {
  function handleClick(){
    console.log(num);
  }
  return (
    <div>
      count:{num}
      <button onClick={handleClick}>click</button>
    </div>
  );
}
```
我们在 initChildren 函数中打印一下fiber 看看按钮生成的结构

![Alt text](image-14.png)

可以看到，按钮生成的 fiber 结构中，找到button结构，它下面的props中还有一个 onClick 属性。

我们可以根据 on 开头的属性名，来确认它是一个事件，然后再绑定到dom上

React.js
```
function updateProps(dom,props){
    Object.keys(props).forEach(key=>{
        if(key.startsWith('on')){
            // 事件名
            const eventName = key.slice(2).toLowerCase();// 或.substring(2);
            dom.addEventListener(eventName,props[key]);
        }else{
            dom[key] = props[key];
        }
    })
}
```

## 实现更新->props
核心：

对比 new vdom tree VS old vdom tree，找出差异，更新dom

1. 如何得到新的 dom 树？
   创建 update 函数，拿到根节点，根节点怎么拿尼？之前我们创建了一个root 变量来存放根节点的，但是不能直接用它，它是处理commitWork(统一提交)时候用的，所以我们创建一个currentRoot变量来存放当前的根节点，在root 被清除之前给它赋值，也就是初始化完页面就赋值了，保证下次更新之前它就有值。
```
let currentRoot=null;

function commitRoot(){
    commitWork(root.child);
    currentRoot=root; // 保证下次更新之前它就有值
    root=null;
}

function update(){
    nextWorkOfUnit={
        dom:currentRoot.dom,
        props:currentRoot.props
    }
    root = nextWorkOfUnit
}
```
2. 如何找到老的节点
    之前我们是把树转变成了链表，新链表的时候我们创建一个属性来指向老俩表的节点，那么我们什么时候构建 新链表尼？在创建链表的时候
   ![Alt text](image-15.png)
   ![Alt text](image-16.png)
    ```
    function update(){
        nextWorkOfUnit={
            dom:currentRoot.dom,
            props:currentRoot.props,
            alternate:currentRoot  // 指向老链表root
        }
        root = nextWorkOfUnit
    }

    function initChildren(fiber, children) {
        let oldFiber = fiber.alternate?.child;// 存一下老的节点
        // 转换链表 设置好指针
        let prevchild = null; // 上一个孩子节点
        children.forEach((child, index) => {
            const isSameType = oldFiber && child && oldFiber.type === child.type;
            let newFiber;
            if(isSameType){
                 newFiber = {
                    type: child.type,
                    props: child.props,
                    parent: fiber,
                    sibling: null, // 兄弟节点
                    dom: oldFiber.dom,// 更新到老节点上不创建新节点
                    effectTag:'udpate',
                    alternate:oldFiber // 指向老节点
                };
            }else{
                 newFiber = {
                    type: child.type,
                    child:null,
                    props: child.props,
                    parent: fiber,
                    sibling: null, // 兄弟节点
                    dom: null,
                    effectTag:'placement'
                };
            }
            
            if(oldFiber){
                // 指针处理兄弟节点
                oldFiber = oldFiber.sibling;
            }
            if (index === 0) {
             fiber.child = newFiber; // 如果是第一个 就直接放到child 中
            } else {
                prevchild.sibling = newFiber; // 不是第一个 就放到上一个的sibling中
            }
            prevchild = newFiber;
        });
        }

    ```
3. 如何diff props
   对于更新逻辑来说需要得到之前的props 才能进行比较
   ```
   function commitWork(fiber){
        if(!fiber) return;
        let fiberParent=fiber.parent;
        // 循环找到父级
        while(!fiberParent.dom){
            fiberParent=fiberParent.parent;
        }
        // 判断是更新还是创建
        if(fiber.effectTag==='update'){
            updateProps(fiber.dom,fiber.props,fiber.alternate?.props);
        }else if(fiber.effectTag==='placement' && fiber.dom){
            // 找到父级把当前dom添加进去
            fiberParent.dom.append(fiber.dom);
        }
        
        // 递归添加子节点
        commitWork(fiber.child);
        // 递归添加兄弟节点
        commitWork(fiber.sibling);
      }
    // 重构updateProps
    function updateProps(dom,nextProps,prevProps){
        // 1.old 有 new 没有  删除
        // 2.new 有 old 没有 添加
        // 3.old new 都有 更新  2和3 可以合并成一个处理
        // 删除
        Object.keys(prevProps).forEach(key=>{
            if(key!=="children"){
                if(!(key in nextProps)){
                    dom.removeAttribute(key);
                }
            }
        })
        // 更新
        Object.keys(nextProps).forEach(key=>{
            if(key!=="children"){
                if(prevProps[key]!==nextProps[key]){
                    if(key.startsWith('on')){
                        const eventType=key.toLowerCase().substring(2);
                        dom.addEventListener(eventType,nextProps[key]);
                    }else{
                        dom[key]=nextProps[key];
                    }
                }
            }
        })
    } 
   ```
   修改一下 updateProps 调用的地方，然后再添加个count  来更新一下props ,同时别忘记导出 update 函数

   App.jsx
   ```
    import React from "./core/React.js";

    let count=10;
    function Component({ num }) {
    function handleClick(){
        console.log('click');
        count+++
        React.update();
    }
    return (
        <div>
        count:{count}
        <button onClick={handleClick}>click</button>
        </div>
    );
    }
    function App() {
    return (
        <div>
        <div>aaa</div>
        <Component num={10} />
        <Component num={20} />
        <div>
            bbb
            <div>CCC</div>
            <div>DDD</div>
        </div>
        </div>
    );
    }

    export default App;
   ```
测试一下，每次点击 click会掉用很多次
![Alt text](image-17.png)
update 的时候 我们只要更新了就给他添加一个addEventListener 事件,每次都挂载到dom上 老的也没有卸载
```
function updateProps(dom,nextProps,prevProps){
       // 省略...
        // 更新
        Object.keys(nextProps).forEach(key=>{
            if(key!=="children"){
                if(prevProps[key]!==nextProps[key]){
                    if(key.startsWith('on')){
                        const eventType=key.toLowerCase().substring(2);
                        dom.removeEventListener(eventType,prevProps[key]);
                        dom.addEventListener(eventType,nextProps[key]);
                    }else{
                        dom[key]=nextProps[key];
                    }
                }
            }
        })
    } 
```

## 重构代码
root 的命名不太合适，正在工作中的root 我们叫它一个 wipRoot
以及 update 函数中的赋值,render 的也换一下
```
function update(){
     wipRoot={
        dom:currentRoot.dom,
        props:currentRoot.props
    }
     nextWorkOfUnit=wipRoot
}
```

initChildren 命名也不太合适，我们叫他一个reconcileChildren


