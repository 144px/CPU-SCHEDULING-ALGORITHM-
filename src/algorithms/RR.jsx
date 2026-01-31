import React, { useEffect, useState } from 'react';

const RR = ({ arrivalTime, burstTime, timeQuantum }) => {
  const [solved, setSolved] = useState([]);
  const [gantt, setGantt] = useState([]);

  useEffect(() => {
    if (arrivalTime.length && burstTime.length && timeQuantum) {
      const { solvedProcessesInfo, ganttChartInfo } = rr(arrivalTime, burstTime, timeQuantum);
      setSolved(solvedProcessesInfo);
      setGantt(ganttChartInfo);
    }
  }, [arrivalTime, burstTime, timeQuantum]);

  const rr = (arrivalTime, burstTime, timeQuantum) => {
    const processes = arrivalTime.map((at, index) => ({
      job: `P${index + 1}`,
      at,
      bt: burstTime[index],
      originalIndex: index
    }));

    const ganttChartInfo = [];
    const completed = [];
    const queue = [];
    const remaining = processes.map(p => ({ ...p, remainingTime: p.bt }));
    let currentTime = 0;

    // Add initial processes to queue
    remaining.forEach(p => {
      if (p.at <= currentTime) {
        queue.push(p);
      }
    });

    while (queue.length > 0 || remaining.some(p => p.at > currentTime)) {
      if (queue.length === 0) {
        currentTime = Math.min(...remaining.filter(p => p.at > currentTime).map(p => p.at));
        remaining.forEach(p => {
          if (p.at <= currentTime && !queue.includes(p)) {
            queue.push(p);
          }
        });
        continue;
      }

      const current = queue.shift();
      const executeTime = Math.min(current.remainingTime, timeQuantum);

      ganttChartInfo.push({
        job: current.job,
        start: currentTime,
        stop: currentTime + executeTime
      });

      current.remainingTime -= executeTime;
      currentTime += executeTime;

      // Add newly arrived processes
      remaining.forEach(p => {
        if (p.at <= currentTime && !queue.includes(p) && p.remainingTime > 0) {
          queue.push(p);
        }
      });

      if (current.remainingTime > 0) {
        queue.push(current);
      } else {
        completed.push({
          job: current.job,
          at: current.at,
          bt: current.bt,
          ft: currentTime,
          tat: currentTime - current.at,
          wat: currentTime - current.at - current.bt
        });
      }
    }

    return { solvedProcessesInfo: completed, ganttChartInfo };
  };

  return (
    <div>
      <h2>Round Robin Scheduling</h2>
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

export default RR;