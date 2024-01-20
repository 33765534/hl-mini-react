function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === "string" || typeof child === "number"
          ? createTextNode(child)
          : child;
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
  let currentFiber = wipFiber;
  return () => {
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };

    nextUnitOfWork = wipRoot;
  };
}

let stateHooks;
let stateHookIndex;
function useState(init) {
  let currentFiber = wipFiber;
  let oldStateHook = currentFiber?.alternate?.stateHooks[stateHookIndex];
  const stateHook = {
    state: oldStateHook ? oldStateHook.state : init,
    queue: oldStateHook ? oldStateHook.queue : [],
  };

  stateHook.queue.forEach((action) => {
    stateHook.state = action(stateHook.state);
  });
  stateHook.queue = [];
  // 这里需要一个全局的变量来记录当前的stateHookIndex
  stateHookIndex++;
  stateHooks.push(stateHook);
  currentFiber.stateHooks = stateHooks;
  function setState(action) {
    const egerState =
      typeof action === "function" ? action(stateHook.state) : action;
    if (egerState === stateHook.state) return;

    stateHook.queue.push(typeof action === "function" ? action : () => action);

    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };

    nextUnitOfWork = wipRoot;
  }

  return [stateHook.state, setState];
}

// 模拟任务拆分和执行
let nextUnitOfWork = null;
function workLoop(deadLine) {
  let shouldYield = false; // 判断是否中断
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    if (wipRoot?.sibling?.type === nextUnitOfWork?.type) {
      nextUnitOfWork = undefined;
    }
    shouldYield = deadLine.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

function commitRoot() {
  deletions.forEach(commitDeletion);
  commitWork(wipRoot.child);
  commitEffectHooks();
  currentRoot = wipRoot;
  wipRoot = null;
  deletions = [];
}

function commitEffectHooks() {
  function run(fiber) {
    if (!fiber) return;

    if (fiber.alternate) {
      // update

      fiber.effectHooks?.forEach((newHook, index) => {
        if (newHook.deps.length > 0) {
          const oldStateHook = fiber.alternate.effectHooks[index];
          const needUpdate = oldStateHook.deps.some(
            (deps, i) => deps !== newHook.deps[i]
          );
          needUpdate && (newHook.cleanup = newHook.callback());
        }
      });
    } else {
      // init
      fiber.effectHooks?.forEach((hook) => (hook.cleanup = hook.callback()));
    }

    run(fiber.child);
    run(fiber.sibling);
  }

  function runCleanup(fiber) { 
    if (!fiber) return;
    fiber.alternate?.effectHooks?.forEach((hook) => {
      if (hook.deps.length > 0) {
        hook.cleanup && hook.cleanup();
      }
    });
    runCleanup(fiber.child);
    runCleanup(fiber.sibling);
  }

  runCleanup(wipFiber);
  run(wipFiber);
}

function commitDeletion(fiber) {
  if (fiber.dom) {
    let parentFilber = fiber.parent;
    while (!parentFilber.dom) {
      parentFilber = parentFilber.parent;
    }
    parentFilber.dom.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child);
  }
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

let deletions = [];
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
      if (child) {
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
        deletions.push(oldFiber);
      }
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      fiber.child = newFiber; // 如果是第一个 就直接放到child 中
    } else {
      prevchild.sibling = newFiber; // 不是第一个 就放到上一个的sibling中
    }
    if (newFiber) prevchild = newFiber;
  });

  while (oldFiber) {
    deletions.push(oldFiber);
    oldFiber = oldFiber.sibling;
  }
}

let wipFiber;
function updateFunctionComponent(fiber) {
  stateHooks = [];
  stateHookIndex = 0;
  effectHooks = [];
  wipFiber = fiber;
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

// 非 function component
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));

    updateProps(dom, fiber.props, {});
  }
  const children = fiber.props.children;
  reconcileChildren(fiber, children);
}

// 执行任务
function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

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

let effectHooks;
function useEffect(callback, deps) {
  const effectHook = {
    callback,
    deps,
    cleanup: undefined,
  };
  effectHooks.push(effectHook);
  wipFiber.effectHooks = effectHooks;
}

const React = {
  useEffect,
  useState,
  createElement,
  render,
};

export default React;
