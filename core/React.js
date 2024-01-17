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

let wipRoot = null;
let currentRoot = null;
function render(el, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [el],
    },
  };
  nextUnitOfWork = wipRoot;
}
function update() {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  };

  nextUnitOfWork = wipRoot;
}

// 模拟任务拆分和执行
let nextUnitOfWork = null;
function workLoop(deadLine) {
  let shouldYield = false; // 判断是否中断
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadLine.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

function commitRoot() {
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) return;
  let parentFilber = fiber.parent;
  while (!parentFilber.dom) {
    parentFilber = parentFilber.parent;
  }
  if (fiber.effectTag === "update") {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
  } else if (fiber.effectTag === "placement") {
    if (fiber.dom) parentFilber.dom.append(fiber.dom);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
// 任务调度器
requestIdleCallback(workLoop);

function createDom(type) {
  // 创建dom
  return type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(type);
}

function updateProps(dom, nextProps, prevProps) {
  // 处理props
  debugger;
  // 1.old 有 new 没有  删除
  Object.keys(prevProps).forEach((key) => {
    if (key !== "children") {
      if (!(key in nextProps)) {
        dom.removeAttribute(key);
      }
    }
  });
  // 2.new 有 old 没有 添加
  // 3.old new 都有 更新  2和3 可以合并成一个处理
  Object.keys(nextProps).forEach((key) => {
    // 判断一下是不是children属性 不是则直接赋值
    if (key !== "children") {
      if (nextProps[key] !== prevProps[key]) {
        if (key.startsWith("on")) {
          const eventType = key.toLowerCase().substring(2);
          dom.removeEventListener(eventType, prevProps[key]); // 卸载老的
          dom.addEventListener(eventType, nextProps[key]); // 绑定新的
        } else {
          dom[key] = nextProps[key];
        }
      }
    }
  });
}

function reconcileChildren(fiber, children) {
  // 转换链表 设置好指针
  let oldFiber = fiber.alternate?.child; // 存一下老的节点
  let prevchild = null; // 上一个孩子节点
  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type;
    let newFiber;
    if (isSameType) {
      newFiber = {
        type: child.type,
        props: child.props,
        parent: fiber,
        child: null, // 子节点
        sibling: null, // 兄弟节点
        dom: oldFiber.dom,
        effectTag: "update",
        alternate: oldFiber, // 指向老节点
      };
    } else {
      newFiber = {
        type: child.type,
        props: child.props,
        child: null, // 子节点
        parent: fiber,
        sibling: null, // 兄弟节点
        dom: null,
        effectTag: "placement",
      };
    }
    if (oldFiber) {
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
// 执行任务
function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if (!isFunctionComponent) {
    if (!fiber.dom) {
      // 创建节点 先判断一下是text类型么
      const dom = (fiber.dom = createDom(fiber.type));
      // 处理props
      updateProps(dom, fiber.props, {});
    }
  }

  const children = isFunctionComponent
    ? [fiber.type(fiber.props)]
    : fiber.props.children;
  reconcileChildren(fiber, children);

  // 返回下一个要执行的任务
  if (fiber.child) {
    // 有孩子节点 返回第一个孩子节点
    return fiber.child;
  }
  if (fiber.sibling) {
    // 没有孩子节点 返回兄弟节点
    return fiber.sibling;
  }

  // 循环向上查找 兄弟节点
  let parent = fiber;
  while (parent) {
    if (parent.sibling) return parent.sibling;
    parent = parent.parent;
  }
}

const React = {
  update,
  createElement,
  render,
};

export default React;
