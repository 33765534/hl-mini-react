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
第二步 ：设置节点的属性也就是创建props
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
不想通过textElement=createTextNode("app") 来创建app节点，想要直接传入"app"
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
### 实现 ReactDOM.createRoot
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
为了更接近 react的api 我们拆分一下 分成两个js
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
## 使用 jsx
### 使用jsx 代替掉 js写法
### 借助 vite 实现 jsx 的解析
创建一个 vite 项目  选择最普通的 Vanilla +  js
```
pnpm create vite
```
把无用的代码先删除，然后把之前写好的 main.js 中的代码复制过来
再把 App.js 改成App.jsx 复制过来
再把 core 文件夹 复制过来
index.html 文件中的是app 我们修改成 root  页面就可以正常访问了
没用安装任何的依赖 就可以直接使用jsx了

很神奇 竟然两种写法都是调用 React.createElement创建App
```
import React from "./core/React.js";
// const App = React.createElement("div",{id:"app"},"app-hhh");
const App = <div>app-hhh</div>

export default App;
```