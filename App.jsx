import React from "./core/React.js";

function Foo() {
  const [count, setCount] = React.useState(10);
  const [bar, setBar] = React.useState("bar");

  React.useEffect(() => {
    console.log("init");
  }, []);
  React.useEffect(() => {
    console.log("update");
    return () => {
      debugger;
      // 这里可以执行一些清理操作
      console.log("cleanup");
    };
  }, [count]);

  function handleClick() {
    setCount((c) => c + 1);
    setBar("bar");
  }
  return (
    <div>
      <p>{count}</p>
      <div>{bar}</div>
      <button onClick={handleClick}>+1</button>
    </div>
  );
}

let showBar = false;
function Component() {
  const bar = <div>bar</div>;
  const update = React.update();
  function handleClick() {
    showBar = !showBar;
    update();
  }
  return (
    <div>
      Component
      <button onClick={handleClick}>click</button>
      {showBar && bar}
    </div>
  );
}
function App() {
  return (
    <div>
      hi
      <Foo />
    </div>
  );
}

export default App;
