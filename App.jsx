import React from "./core/React.js";

let count = 10;
function Component({ num }) {
  function handleClick() {
    console.log("click");
    count++;
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
      <Component num={10} />
    </div>
  );
}

export default App;
