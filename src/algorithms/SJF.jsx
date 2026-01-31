import React, { useEffect, useState } from 'react';

const SJF = ({ arrivalTime, burstTime }) => {
  const [solved, setSolved] = useState([]);
  const [gantt, setGantt] = useState([]);

  useEffect(() => {
    if (arrivalTime.length && burstTime.length) {
      const { solvedProcessesInfo, ganttChartInfo } = sjf(arrivalTime, burstTime);
      setSolved(solvedProcessesInfo);
      setGantt(ganttChartInfo);
    }
  }, [arrivalTime, burstTime]);

  const sjf = (arrivalTime, burstTime) => {
    const processes = arrivalTime.map((at, index) => ({
      job: `P${index + 1}`,
      at,
      bt: burstTime[index],
      originalIndex: index
    }));

    const ganttChartInfo = [];
    const completed = [];
    const remaining = [...processes];
    let currentTime = 0;

    while (remaining.length > 0) {
      const available = remaining.filter(p => p.at <= currentTime);
      
      if (available.length === 0) {
        currentTime = Math.min(...remaining.map(p => p.at));
        continue;
      }

      const shortest = available.reduce((min, p) => p.bt < min.bt ? p : min);
      const start = currentTime;
      const finish = start + shortest.bt;

      ganttChartInfo.push({
        job: shortest.job,
        start,
        stop: finish
      });

      completed.push({
        job: shortest.job,
        at: shortest.at,
        bt: shortest.bt,
        ft: finish,
        tat: finish - shortest.at,
        wat: finish - shortest.at - shortest.bt
      });

      currentTime = finish;
      remaining.splice(remaining.indexOf(shortest), 1);
    }

    return { solvedProcessesInfo: completed, ganttChartInfo };
  };

  return (
    <div>
      <h2>SJF Scheduling</h2>
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

export default SJF;