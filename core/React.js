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