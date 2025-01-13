import React from "react";
import { CommunityPostEditor } from "../dist";
import "./style.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>테스트 앱</h1>
      </header>
      <main>
        <CommunityPostEditor containerClassName="w-full h-full border red" />
      </main>
    </div>
  );
}

export default App;
