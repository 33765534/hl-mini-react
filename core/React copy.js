function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === "object" ? child : createTextNode(child);
      }),
    },
  };
}

function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function render(el, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [el],
    },
  };
}

// 模拟任务拆分和执行
let nextUnitOfWork = null;
function workLoop(deadLine) {
  let shouldYield = false; // 判断是否中断
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadLine.timeRemaining() < 1;
  }
  if (nextUnitOfWork) {
    requestIdleCallback(workLoop);
  }
}
// 任务调度器
requestIdleCallback(workLoop);

// 执行任务
function performUnitOfWork(work) {
  if (!work.dom) {
    // 创建节点 先判断一下是text类型么
    const dom = (work.dom =
      work.type === "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(work.type));

    // 存放 父级容器
    work.parent.dom.append(dom);
    // 处理props
    Object.keys(work.props).forEach((key) => {
      // 判断一下是不是children属性 不是则直接赋值
      if (key !== "children") {
        dom[key] = work.props[key];
      }
    });
  }

  // 转换链表 设置好指针
  const children = work.props.children || [];
  let prevchild = null; // 上一个孩子节点
  debugger;
  children.forEach((child, index) => {
    const newWork = {
      type: child.type,
      props: child.props,
      parent: work,
      sibling: null, // 兄弟节点
      dom: null,
    };
    if (index === 0) {
      work.child = newWork; // 如果是第一个 就直接放到child 中
    } else {
      prevchild.sibling = newWork; // 不是第一个 就放到上一个的sibling中
    }
    prevchild = newWork;
  });

  // 返回下一个要执行的任务
  if (work.child) {
    // 有孩子节点 返回第一个孩子节点
    return work.child;
  }
  if (work.sibling) {
    // 没有孩子节点 返回兄弟节点
    return work.sibling;
  }
  return work.parent?.sibling || null; // 没有兄弟节点 返回父节点的兄弟节点
}

const React = {
  createElement,
  render,
};

export default React;
