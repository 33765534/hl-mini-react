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

function createDom(type) {
  // 创建dom
  return type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(type);
}

function updateProps(dom, props) {
  // 处理props
  Object.keys(props).forEach((key) => {
    // 判断一下是不是children属性 不是则直接赋值
    if (key !== "children") {
      dom[key] = props[key];
    }
  });
}

function initChildren(fiber) {
  // 转换链表 设置好指针
  const children = fiber.props.children || [];
  let prevchild = null; // 上一个孩子节点
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      sibling: null, // 兄弟节点
      dom: null,
    };
    if (index === 0) {
      fiber.child = newFiber; // 如果是第一个 就直接放到child 中
    } else {
      prevchild.sibling = newFiber; // 不是第一个 就放到上一个的sibling中
    }
    prevchild = newFiber;
  });
}
// 执行任务
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    // 创建节点 先判断一下是text类型么
    const dom = (fiber.dom = createDom(fiber.type));

    // 存放 父级容器
    fiber.parent.dom.append(dom);
    // 处理props
    updateProps(dom, fiber.props);
  }

  initChildren(fiber)

  // 返回下一个要执行的任务
  if (fiber.child) {
    // 有孩子节点 返回第一个孩子节点
    return fiber.child;
  }
  if (fiber.sibling) {
    // 没有孩子节点 返回兄弟节点
    return fiber.sibling;
  }
  return fiber.parent?.sibling || null; // 没有兄弟节点 返回父节点的兄弟节点
}

const React = {
  createElement,
  render,
};

export default React;
