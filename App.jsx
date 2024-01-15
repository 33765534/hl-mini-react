import React from "./core/React.js";
// const App = React.createElement("div",{id:"app"},"app-hhh");

function Component({ num }) {
  return <div>count:{num}</div>;
}
function App() {
  return (
    <div>
      <div>aaa</div>
      <Component num={10} />
      <Component num={20} />
      <div>
        bbb
        <div>CCC</div>
        <div>DDD</div>
      </div>
    </div>
  );
}

export default App;
