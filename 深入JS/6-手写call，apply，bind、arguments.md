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

## 认识 arguments
### 特点
1. arguments是一个类数组对象，它包含传入函数中的所有参数
2. arguments 不是一个数组类型，但是它拥有数组的一些属性，例如 length，比如可以通过index索引来访问，但是它没有数组的一些方法，例如 forEach、map 等
3. arguments 对象还有一些属性，例如 callee 表示当前执行的函数，caller 表示调用当前函数的函数


### 箭头函数中没有arguments
注：如果箭头函数中写了arguments，那么会去上层作用域找，如果找到最高层的全局作用域，在node环境中全局作用域是有arguments，浏览器的全局作用域中是没有arguments

### arguments转数组
1. 自己遍历
```
function foo(num1,num2){
    var newArray = [];
    for(var i=0;i<arguments.length;i++){
        newArray.push(arguments[i]);
    }
}
```
2. Array.prototype.slice 将 arguments 转换成数组
```
var newArray = Array.prototype.slice.call(arguments);

var newArray2 = [].slice.call(arguments);
``` 
3. ES6 语法 Array.from 将 arguments 转换成数组
```
var newArray3 = Array.from(arguments);
var newArray4 = [...arguments];// 扩展运算符
```
### 手写数组的slice方法
```
Array.prototype.mySlice = function(start,end){
    var arr = this
    start = start || 0;
    end = end || arr.length;
    var newArray = [];
    for(var i=start;i<end;i++){
        newArray.push(arr[i]);
    }
    return newArray;
}

var newArray = [1,2,3,4,5].mySlice(0,3);
console.log(newArray);
```