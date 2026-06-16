import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Chart = ({ arr = [], currency, days }) => {
  const prices = [];
  const date = [];

  for (let i = 0; i < arr.length; i++) {
    if (days === "24h") date.push(new Date(arr[i][0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    else date.push(new Date(arr[i][0]).toLocaleDateString([], { month: 'short', day: 'numeric' }));
    prices.push(arr[i][1]);
  }

  const data = {
    labels: date,
    datasets: [
      {
        label: `Price (${currency})`,
        data: prices,
        borderColor: "#00e5ff",
        backgroundColor: "rgba(0, 229, 255, 0.1)",
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(18, 24, 38, 0.9)',
        titleColor: '#fff',
        bodyColor: '#00e5ff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            size: 10,
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            size: 10,
          }
        }
      }
    }
  };

  return (
    <Line
      options={options}
      data={data}
    />
  );
};

export default Chart;