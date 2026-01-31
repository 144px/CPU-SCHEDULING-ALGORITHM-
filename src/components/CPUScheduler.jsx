import React, { useState } from 'react';
import './CPUScheduler.css';

// Scheduling Algorithms Implementation
const solve = (algorithm, arrivalTime, burstTime, timeQuantum = 0, priorities = []) => {
  const processes = arrivalTime.map((at, index) => ({
    job: `P${index + 1}`,
    at,
    bt: burstTime[index],
    priority: priorities[index] || 0,
    originalIndex: index
  }));

  switch (algorithm) {
    case 'FCFS':
      return solveFCFS(processes);
    case 'SJF':
      return solveSJF(processes);
    case 'SRTF':
      return solveSRTF(processes);
    case 'RR':
      return solveRR(processes, timeQuantum);
    case 'NPP':
      return solveNPP(processes);
    case 'PP':
      return solvePP(processes);
    default:
      return { solvedProcessesInfo: [], ganttChartInfo: [] };
  }
};

// First Come First Serve
const solveFCFS = (processes) => {
  const sorted = [...processes].sort((a, b) => a.at - b.at);
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

// Shortest Job First
const solveSJF = (processes) => {
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

// Shortest Remaining Time First
const solveSRTF = (processes) => {
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

// Round Robin
const solveRR = (processes, timeQuantum) => {
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

    if (current.remainingTime === 0) {
      completed.push({
        job: current.job,
        at: current.at,
        bt: current.bt,
        ft: currentTime,
        tat: currentTime - current.at,
        wat: currentTime - current.at - current.bt
      });
    } else {
      queue.push(current);
    }
  }

  return { solvedProcessesInfo: completed, ganttChartInfo };
};

// Non-Preemptive Priority
const solveNPP = (processes) => {
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

    const highest = available.reduce((max, p) => 
      p.priority < max.priority ? p : max // Lower number = higher priority
    );

    const start = currentTime;
    const finish = start + highest.bt;

    ganttChartInfo.push({
      job: highest.job,
      start,
      stop: finish
    });

    completed.push({
      job: highest.job,
      at: highest.at,
      bt: highest.bt,
      ft: finish,
      tat: finish - highest.at,
      wat: finish - highest.at - highest.bt
    });

    currentTime = finish;
    remaining.splice(remaining.indexOf(highest), 1);
  }

  return { solvedProcessesInfo: completed, ganttChartInfo };
};

// Preemptive Priority
const solvePP = (processes) => {
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

// Algorithm Select Component
const AlgoSelect = ({ selectedAlgo, onAlgoChange }) => {
  const algorithmOptions = [
    { value: 'FCFS', label: 'First Come First Serve (FCFS)' },
    { value: 'SJF', label: 'Shortest Job First (SJF)' },
    { value: 'SRTF', label: 'Shortest Remaining Time First (SRTF)' },
    { value: 'RR', label: 'Round Robin (RR)' },
    { value: 'NPP', label: 'Non-Preemptive Priority' },
    { value: 'PP', label: 'Preemptive Priority' },
  ];

  return (
    <div className="form-group">
      <label htmlFor="algorithm">Algorithm:</label>
      <select 
        id="algorithm"
        value={selectedAlgo}
        onChange={(e) => onAlgoChange(e.target.value)}
        className="form-control"
      >
        {algorithmOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Input Component
const Input = ({ onSubmit }) => {
  const [selectedAlgo, setSelectedAlgo] = useState('FCFS');
  const [arrivalTime, setArrivalTime] = useState('0 2 4 6');
  const [burstTime, setBurstTime] = useState('7 4 1 4');
  const [timeQuantum, setTimeQuantum] = useState('3');
  const [priorities, setPriorities] = useState('2 1 4 3');

  const validateInput = () => {
    const arrivalTimeArr = arrivalTime.trim().split(/\s+/).map(Number);
    const burstTimeArr = burstTime.trim().split(/\s+/).map(Number);

    if (arrivalTimeArr.length !== burstTimeArr.length) {
      alert('Number of arrival times and burst times must match');
      return null;
    }

    if (arrivalTimeArr.some(isNaN) || burstTimeArr.some(isNaN)) {
      alert('Please enter valid numbers only');
      return null;
    }

    if (arrivalTimeArr.some(t => t < 0) || burstTimeArr.some(t => t < 0)) {
      alert('Negative numbers are not allowed');
      return null;
    }

    if (burstTimeArr.some(t => t === 0)) {
      alert('Burst time cannot be zero');
      return null;
    }

    return { arrivalTimeArr, burstTimeArr };
  };

  const handleSubmit = () => {
    const validation = validateInput();
    if (!validation) return;

    const { arrivalTimeArr, burstTimeArr } = validation;
    
    const data = {
      selectedAlgo,
      arrivalTime: arrivalTimeArr,
      burstTime: burstTimeArr,
    };

    if (selectedAlgo === 'RR') {
      const tq = parseInt(timeQuantum);
      if (isNaN(tq) || tq <= 0) {
        alert('Please enter a valid time quantum');
        return;
      }
      data.timeQuantum = tq;
    }

    if (selectedAlgo === 'NPP' || selectedAlgo === 'PP') {
      if (priorities.trim()) {
        const prioritiesArr = priorities.trim().split(/\s+/).map(Number);
        if (prioritiesArr.length !== arrivalTimeArr.length) {
          alert('Number of priorities must match number of processes');
          return;
        }
        data.priorities = prioritiesArr;
      } else {
        data.priorities = arrivalTimeArr.map(() => 0);
      }
    }

    onSubmit(data);
  };

  return (
    <div className="input-panel">
      <h2>Input</h2>
      <div>
        <AlgoSelect selectedAlgo={selectedAlgo} onAlgoChange={setSelectedAlgo} />
        
        <div className="form-group">
          <label htmlFor="arrival-time">Arrival Times:</label>
          <input
            type="text"
            id="arrival-time"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            placeholder="e.g. 0 2 4 6"
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="burst-time">Burst Times:</label>
          <input
            type="text"
            id="burst-time"
            value={burstTime}
            onChange={(e) => setBurstTime(e.target.value)}
            placeholder="e.g. 7 4 1 4"
            className="form-control"
            required
          />
        </div>

        {selectedAlgo === 'RR' && (
          <div className="form-group">
            <label htmlFor="time-quantum">Time Quantum:</label>
            <input
              type="number"
              id="time-quantum"
              value={timeQuantum}
              onChange={(e) => setTimeQuantum(e.target.value)}
              placeholder="e.g. 3"
              className="form-control"
              min="1"
              required
            />
          </div>
        )}

        {(selectedAlgo === 'NPP' || selectedAlgo === 'PP') && (
          <div className="form-group">
            <label htmlFor="priorities">Priorities (optional):</label>
            <input
              type="text"
              id="priorities"
              value={priorities}
              onChange={(e) => setPriorities(e.target.value)}
              placeholder="Lower number = higher priority"
              className="form-control"
            />
          </div>
        )}

        <button type="button" onClick={handleSubmit} className="btn-primary">
          Calculate
        </button>
      </div>
    </div>
  );
};

// Gantt Chart Component
const GanttChart = ({ ganttChartInfo }) => {
  if (!ganttChartInfo || ganttChartInfo.length === 0) {
    return <div>No data to display</div>;
  }

  const jobs = [];
  const times = [];

  ganttChartInfo.forEach((item, index) => {
    if (index === 0) {
      jobs.push(item.job);
      times.push(item.start, item.stop);
    } else if (times[times.length - 1] === item.start) {
      jobs.push(item.job);
      times.push(item.stop);
    } else {
      jobs.push('_', item.job);
      times.push(item.start, item.stop);
    }
  });

  return (
    <div className="gantt-chart">
      <h3>Gantt Chart</h3>
      <div className="chart-container">
        <div className="jobs-row">
          {jobs.map((job, index) => (
            <div key={index} className="job-cell">
              {job === '_' ? '' : job}
            </div>
          ))}
        </div>
        <div className="times-row">
          {times.map((time, index) => (
            <div key={index} className="time-cell">
              {time}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Table Component
const Table = ({ solvedProcessesInfo }) => {
  if (!solvedProcessesInfo || solvedProcessesInfo.length === 0) {
    return <div>No data to display</div>;
  }

  const totalTAT = solvedProcessesInfo.reduce((sum, process) => sum + process.tat, 0);
  const totalWAT = solvedProcessesInfo.reduce((sum, process) => sum + process.wat, 0);
  const avgTAT = (totalTAT / solvedProcessesInfo.length).toFixed(2);
  const avgWAT = (totalWAT / solvedProcessesInfo.length).toFixed(2);

  return (
    <div className="results-table">
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
          {solvedProcessesInfo.map((process, index) => (
            <tr key={index}>
              <td>{process.job}</td>
              <td>{process.at}</td>
              <td>{process.bt}</td>
              <td>{process.ft}</td>
              <td>{process.tat}</td>
              <td>{process.wat}</td>
            </tr>
          ))}
          <tr className="average-row">
            <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold' }}>
              Average:
            </td>
            <td>{avgTAT}</td>
            <td>{avgWAT}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// Output Component
const Output = ({ selectedAlgo, solvedProcessesInfo, ganttChartInfo }) => {
  const hasData = solvedProcessesInfo && solvedProcessesInfo.length > 0;

  return (
    <div className="output-panel">
      <div className="output-header">
        <h2>Output</h2>
        {hasData && (
          <span className="algo-badge">
            {selectedAlgo}
          </span>
        )}
      </div>
      
      {hasData ? (
        <>
          <GanttChart ganttChartInfo={ganttChartInfo} />
          <Table solvedProcessesInfo={solvedProcessesInfo} />
        </>
      ) : (
        <p>Gantt chart and table will be shown here</p>
      )}
    </div>
  );
};

// Main CPU Scheduler Component
const CPUScheduler = () => {
  const [selectedAlgo, setSelectedAlgo] = useState('FCFS');
  const [solvedProcessesInfo, setSolvedProcessesInfo] = useState([]);
  const [ganttChartInfo, setGanttChartInfo] = useState([]);

  const handleInputSubmit = (data) => {
    setSelectedAlgo(data.selectedAlgo);
    
    try {
      const result = solve(
        data.selectedAlgo,
        data.arrivalTime,
        data.burstTime,
        data.timeQuantum || 0,
        data.priorities || []
      );
      
      setSolvedProcessesInfo(result.solvedProcessesInfo);
      setGanttChartInfo(result.ganttChartInfo);
    } catch (error) {
      console.error('Error solving:', error);
      alert('Error calculating schedule. Please check your inputs.');
    }
  };

  return (
    <div className="cpu-scheduler">
      <Input onSubmit={handleInputSubmit} />
      <Output
        selectedAlgo={selectedAlgo}
        solvedProcessesInfo={solvedProcessesInfo}
        ganttChartInfo={ganttChartInfo}
      />
    </div>
  );
};

export default CPUScheduler;