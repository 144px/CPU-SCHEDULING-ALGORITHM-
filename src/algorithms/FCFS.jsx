import React, { useEffect, useState } from 'react';

const FCFS = ({ arrivalTime, burstTime }) => {
  const [solved, setSolved] = useState([]);
  const [gantt, setGantt] = useState([]);

  useEffect(() => {
    if (arrivalTime.length && burstTime.length) {
      const { solvedProcessesInfo, ganttChartInfo } = fcfs(arrivalTime, burstTime);
      setSolved(solvedProcessesInfo);
      setGantt(ganttChartInfo);
    }
  }, [arrivalTime, burstTime]);

  const fcfs = (arrivalTime, burstTime) => {
    const processesInfo = arrivalTime
      .map((item, index) => {
        const job =
          arrivalTime.length > 26
            ? `P${index + 1}`
            : (index + 10).toString(36).toUpperCase();

        return {
          job,
          at: item,
          bt: burstTime[index],
        };
      })
      .sort((a, b) => a.at - b.at);

    let finishTime = [];
    let ganttChartInfo = [];

    const solvedProcessesInfo = processesInfo.map((process, index) => {
      if (index === 0 || process.at > finishTime[index - 1]) {
        finishTime[index] = process.at + process.bt;

        ganttChartInfo.push({
          job: process.job,
          start: process.at,
          stop: finishTime[index],
        });
      } else {
        finishTime[index] = finishTime[index - 1] + process.bt;

        ganttChartInfo.push({
          job: process.job,
          start: finishTime[index - 1],
          stop: finishTime[index],
        });
      }

      return {
        ...process,
        ft: finishTime[index],
        tat: finishTime[index] - process.at,
        wat: finishTime[index] - process.at - process.bt,
      };
    });

    return { solvedProcessesInfo, ganttChartInfo };
  };

  return (
    <div>
      <h2>FCFS Scheduling Result</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Job</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
            <th>Finish Time</th>
            <th>Turnaround Time</th>
            <th>Waiting Time</th>
          </tr>
        </thead>
        <tbody>
          {solved.map((p, i) => (
            <tr key={i}>
              <td>{p.job}</td>
              <td>{p.at}</td>
              <td>{p.bt}</td>
              <td>{p.ft}</td>
              <td>{p.tat}</td>
              <td>{p.wat}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Gantt Chart</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {gantt.map((g, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ border: '1px solid black', padding: '5px 10px' }}>{g.job}</div>
            <div>{g.start} - {g.stop}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FCFS;
