import React, { useEffect, useState } from 'react';

const NPP = ({ arrivalTime, burstTime, priorities }) => {
  const [solved, setSolved] = useState([]);
  const [gantt, setGantt] = useState([]);

  useEffect(() => {
    if (arrivalTime.length && burstTime.length && priorities.length) {
      const { solvedProcessesInfo, ganttChartInfo } = npp(arrivalTime, burstTime, priorities);
      setSolved(solvedProcessesInfo);
      setGantt(ganttChartInfo);
    }
  }, [arrivalTime, burstTime, priorities]);

  const npp = (arrivalTime, burstTime, priorities) => {
    const processes = arrivalTime.map((at, index) => ({
      job: `P${index + 1}`,
      at,
      bt: burstTime[index],
      priority: priorities[index],
      originalIndex: index
    }));

    const sorted = [...processes].sort((a, b) => {
      if (a.at !== b.at) return a.at - b.at;
      return a.priority - b.priority;
    });

    const ganttChartInfo = [];
    let currentTime = 0;

    const solvedProcessesInfo = sorted.map(process => {
      const start = Math.max(currentTime, process.at);
      const finish = start + process.bt;
      
      ganttChartInfo.push({
        job: process.job,
        start,
        stop: finish
      });

      currentTime = finish;
      
      return {
        job: process.job,
        at: process.at,
        bt: process.bt,
        ft: finish,
        tat: finish - process.at,
        wat: finish - process.at - process.bt
      };
    });

    return { solvedProcessesInfo, ganttChartInfo };
  };

  return (
    <div>
      <h2>Non-Preemptive Priority Scheduling</h2>
      <div>
        <h3>Process Information</h3>
        <table>
          <thead>
            <tr>
              <th>Process ID</th>
              <th>Arrival Time</th>
              <th>Burst Time</th>
              <th>Priority</th>
              <th>End Time</th>
              <th>Turnaround Time</th>
              <th>Waiting Time</th>
            </tr>
          </thead>
          <tbody>
            {solved.map((process, index) => (
              <tr key={index}>
                <td>{process.job}</td>
                <td>{process.at}</td>
                <td>{process.bt}</td>
                <td>{process.priority}</td>
                <td>{process.ft}</td>
                <td>{process.tat}</td>
                <td>{process.wat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3>Gantt Chart</h3>
        <div style={{ display: 'flex', border: '1px solid #ccc' }}>
          {gantt.map((item, index) => (
            <div key={index} style={{ border: '1px solid #000', padding: '10px' }}>
              {item.job}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex' }}>
          {gantt.map((item, index) => (
            <div key={index} style={{ padding: '10px' }}>
              {item.start}
            </div>
          ))}
          <div style={{ padding: '10px' }}>
            {gantt[gantt.length - 1]?.stop}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NPP;