## 柯里化函数的特点
柯里化（Currying）是把接受多个参数的函数变换成接受一个单一参数(最初函数的第一个参数)的函数，并且返回接受余下的参数且返回结果的新函数的技术。
1. 参数复用
2. 业务解耦，调用时机灵活
3. 延迟执行，部分求值

示例：
```
function sum(num1,num2,num3,num4) {
    console.log(num1,num2,num3,num4);
}

var newSum = sum.bind("aaa",10);
newSum(20,30,40);
```

## 实现手写 call
```
// 给所有的函数添加一个 hycall 方法
Function.prototype.myCall = function(thisArg, ...args) {
    // 在这里可以去执行调用的哪个函数（sum）
    // 这里的 this 就是调用 myCall 的函数，即 sum
    // 1.获取需要被执行的函数
    let fn = this;

    // 2. 对thisArg 转成对象类型（防止传入的是非对象类型）
    thisArg = thisArg ? Object(thisArg) : window;

    // 3. 将调用函数的this 指向thisArg
    thisArg.fn = fn;

    // 4. 执行函数
    let result = thisArg.fn(...args);

    // 5. 删除fn
    delete thisArg.fn;
    // 6. 返回结果
    return result;
}


function sum(num1,num2,num3,num4) {
    console.log(num1,num2,num3,num4);
}

var newSum = sum.myCall("aaa",10,20,30,40);
```

## 实现手写 apply
```
// 给所有的函数添加一个 hyapply 方法
Function.prototype.myApply = function(thisArg,argArray){
    // thisArg 如果是null 或者 undefined，那么默认指向window
    thisArg = thisArg!==null && thisArg!==undefined ? Object(thisArg) : window;

    // 将当前this == 当前函数赋值给thisArg的fn 属性
    // 这样thisArg 就可以调用当前函数了
    thisArg.fn = this;

    // 当参宿和没有传的情况下 需要非空判断
    argArray = argArray ? argArray : [];
    let result = thisArg.fn(...argArray);

    // 删除fn
    delete thisArg.fn;
    return result;
}

function sum(num1,num2,num3,num4) {
    console.log(num1,num2,num3,num4);
}

var newSum = sum.myApply("aaa",[10,20,30,40]);
```
## 实现手写 bind
```
// 给所有的函数添加一个 myBind 方法
Function.prototype.myBind = function(thisArg, ...argArray) {
    // thisArg 如果是null 或者 undefined，那么默认指向window
    thisArg = thisArg ? Object(thisArg) : window;
    // 1. 获取调用bind的函数
    thisArg.fn = this;
    // 2. 返回一个函数
    return function F(...arg) {
        // 3. thisArg 执行函数并传入参数
        var res=thisArg.fn(...[...argArray,...arg]);
        delete thisArg.fn;
        return res;
    }
}

function sum(num1,num2,num3,num4) {
    console.log(num1,num2,num3,num4);
}

var newSum = sum.myBind("aaa",10);
newSum(20,30,40);

```