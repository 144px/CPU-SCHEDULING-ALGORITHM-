import React from "react";
import FCFS from "./algorithms/FCFS.jsx"; // Make sure FCFS.jsx exists in the same directory
import CPUScheduler from './components/CPUScheduler';

function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <CPUScheduler />
    </div>
  );
}

export default App;
