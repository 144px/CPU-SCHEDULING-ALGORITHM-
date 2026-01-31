import React, { useEffect, useState } from 'react';

const PP = ({ arrivalTime, burstTime, priorities }) => {
  const [solved, setSolved] = useState([]);
  const [gantt, setGantt] = useState([]);

  useEffect(() => {
    if (arrivalTime.length && burstTime.length && priorities.length) {
      const { solvedProcessesInfo, ganttChartInfo } = pp(arrivalTime, burstTime, priorities);
      setSolved(solvedProcessesInfo);
      setGantt(ganttChartInfo);
    }
  }, [arrivalTime, burstTime, priorities]);

  const pp = (arrivalTime, burstTime, priorities) => {
    const processes = arrivalTime.map((at, index) => ({
      job: `P${index + 1}`,
      at,
      bt: burstTime[index],
      priority: priorities[index],
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

      const highest = available.reduce((max, p) => 
        p.priority < max.priority ? p : max
      );

      const nextArrival = remaining
        .filter(p => p.at > currentTime)
        .map(p => p.at)
        .sort((a, b) => a - b)[0];

      const executeTime = nextArrival ? 
        Math.min(highest.remainingTime, nextArrival - currentTime) : 
        highest.remainingTime;

      ganttChartInfo.push({
        job: highest.job,
        start: currentTime,
        stop: currentTime + executeTime
      });

      highest.remainingTime -= executeTime;
      currentTime += executeTime;

      if (highest.remainingTime === 0) {
        completed.push({
          job: highest.job,
          at: highest.at,
          bt: highest.bt,
          ft: currentTime,
          tat: currentTime - highest.at,
          wat: currentTime - highest.at - highest.bt
        });
        remaining.splice(remaining.indexOf(highest), 1);
      }
    }

    return { solvedProcessesInfo: completed, ganttChartInfo };
  };

  return (
    <div>
      <h2>Preemptive Priority Scheduling</h2>
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

export default PP;