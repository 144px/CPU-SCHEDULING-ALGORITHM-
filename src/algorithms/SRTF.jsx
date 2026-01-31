import React, { useEffect, useState } from 'react';

const SRTF = ({ arrivalTime, burstTime }) => {
  const [solved, setSolved] = useState([]);
  const [gantt, setGantt] = useState([]);

  useEffect(() => {
    if (arrivalTime.length && burstTime.length) {
      const { solvedProcessesInfo, ganttChartInfo } = srtf(arrivalTime, burstTime);
      setSolved(solvedProcessesInfo);
      setGantt(ganttChartInfo);
    }
  }, [arrivalTime, burstTime]);

  const srtf = (arrivalTime, burstTime) => {
    const processes = arrivalTime.map((at, index) => ({
      job: `P${index + 1}`,
      at,
      bt: burstTime[index],
      originalIndex: index
    }));

    const ganttChartInfo = [];
    const completed = [];
    const remaining = processes.map(p => ({ ...p, remainingTime: p.bt }));
    let currentTime = 0;

    while (remaining.length > 0) {
      const available = remaining.filter(p => p.at <= currentTime);
      
      if (available.length === 0) {
        currentTime = Math.min(...remaining.map(p => p.at));
        continue;
      }

      const shortest = available.reduce((min, p) => 
        p.remainingTime < min.remainingTime ? p : min
      );

      const nextArrival = remaining
        .filter(p => p.at > currentTime)
        .map(p => p.at)
        .sort((a, b) => a - b)[0];

      const executeTime = nextArrival ? 
        Math.min(shortest.remainingTime, nextArrival - currentTime) : 
        shortest.remainingTime;

      ganttChartInfo.push({
        job: shortest.job,
        start: currentTime,
        stop: currentTime + executeTime
      });

      shortest.remainingTime -= executeTime;
      currentTime += executeTime;

      if (shortest.remainingTime === 0) {
        completed.push({
          job: shortest.job,
          at: shortest.at,
          bt: shortest.bt,
          ft: currentTime,
          tat: currentTime - shortest.at,
          wat: currentTime - shortest.at - shortest.bt
        });
        remaining.splice(remaining.indexOf(shortest), 1);
      }
    }

    return { solvedProcessesInfo: completed, ganttChartInfo };
  };

  return (
    <div>
      <h2>SRTF Scheduling</h2>
      <div>
        <h3>Process Information</h3>
        <table>
          <thead>
            <tr>
              <th>Process ID</th>
              <th>Arrival Time</th>
              <th>Burst Time</th>
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

export default SRTF;