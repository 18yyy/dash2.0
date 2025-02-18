import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format } from 'date-fns';
import { LineChart, Plus, Activity, Hash, Calculator, DollarSign } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DataPoint {
  value: number;
  timestamp: string;
}

// Função para obter o timestamp de expiração (12 horas a partir de agora)
const getExpirationTime = () => {
  const now = new Date();
  return new Date(now.getTime() + 12 * 60 * 60 * 1000).getTime(); // 12 horas em milissegundos
};

// Função para verificar se os dados expiraram
const hasDataExpired = (expirationTime: number) => {
  return new Date().getTime() > expirationTime;
};

// Função para salvar dados nos cookies
const saveDataToCookies = (data: DataPoint[], expirationTime: number) => {
  const cookieData = {
    data,
    expirationTime,
  };
  document.cookie = `graphData=${JSON.stringify(cookieData)}; path=/; max-age=${60 * 60 * 12}`; // 12 horas
};

// Função para carregar dados dos cookies
const loadDataFromCookies = (): { data: DataPoint[], expirationTime: number } | null => {
  const cookies = document.cookie.split(';');
  const graphCookie = cookies.find(cookie => cookie.trim().startsWith('graphData='));
  
  if (graphCookie) {
    try {
      const cookieValue = graphCookie.split('=')[1];
      const cookieData = JSON.parse(decodeURIComponent(cookieValue));
      
      if (hasDataExpired(cookieData.expirationTime)) {
        document.cookie = 'graphData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        return null;
      }
      
      return cookieData;
    } catch (error) {
      return null;
    }
  }
  return null;
};

function App() {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [newValue, setNewValue] = useState<string>('');
  const [expirationTime, setExpirationTime] = useState<number>(getExpirationTime());

  // Carregar dados dos cookies ao iniciar
  useEffect(() => {
    const savedData = loadDataFromCookies();
    if (savedData) {
      setDataPoints(savedData.data);
      setExpirationTime(savedData.expirationTime);
    } else {
      setExpirationTime(getExpirationTime());
    }
  }, []);

  // Salvar dados nos cookies quando houver alterações
  useEffect(() => {
    if (dataPoints.length > 0) {
      saveDataToCookies(dataPoints, expirationTime);
    }
  }, [dataPoints, expirationTime]);

  const addDataPoint = async (value: number) => {
    const newDataPoint = {
      value,
      timestamp: new Date().toISOString(),
    };
    setDataPoints(prev => [...prev, newDataPoint]);
    setNewValue('');
  };

  const totalSum = dataPoints.reduce((sum, point) => sum + point.value, 0);
  const realProfit = totalSum * 0.9; // Desconta 10% da soma total

  // Calcula o tempo restante para expiração
  const timeUntilExpiration = Math.max(0, expirationTime - new Date().getTime());
  const hoursRemaining = Math.floor(timeUntilExpiration / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeUntilExpiration % (1000 * 60 * 60)) / (1000 * 60));

  const chartData = {
    labels: dataPoints.map(point => format(new Date(point.timestamp), 'HH:mm:ss')),
    datasets: [
      {
        label: 'Valor ao Longo do Tempo',
        data: dataPoints.map(point => point.value),
        fill: true,
        borderColor: 'rgb(56, 189, 248)',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: 'rgb(56, 189, 248)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(56, 189, 248)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e2e8f0',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      title: {
        display: true,
        text: 'Gráfico de Dados em Tempo Real',
        color: '#e2e8f0',
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: 'bold',
        },
        padding: 20,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(56, 189, 248, 0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        titleFont: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          size: 12,
          family: "'Inter', sans-serif",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: "'Inter', sans-serif",
          },
        },
      },
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: "'Inter', sans-serif",
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500/10 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Visualização de Dados</h1>
              <p className="text-gray-400 text-sm">Painel de monitoramento em tempo real</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Reinicia em: <span className="font-medium text-sky-400">{hoursRemaining}h {minutesRemaining}m</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/10 p-2 rounded-lg">
                <Hash className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total de Registros</p>
                <p className="text-2xl font-bold text-white">{dataPoints.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Calculator className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Soma Total</p>
                <p className="text-2xl font-bold text-white">{totalSum.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="bg-rose-500/10 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Lucro Real (-10%)</p>
                <p className="text-2xl font-bold text-white">{realProfit.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Desconto: {(totalSum * 0.1).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Input Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex gap-4">
              <input
                type="number"
                step="0.01"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Digite um valor (ex: 1,80)"
                className="flex-1 px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
              />
              <button
                onClick={() => addDataPoint(Number(newValue))}
                disabled={!newValue}
                className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Adicionar
              </button>
            </div>
          </div>

          {/* Graph Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="h-[400px]">
              {dataPoints.length > 0 ? (
                <Line data={chartData} options={options} />
              ) : (
                <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-700 rounded-lg">
                  <div className="text-center">
                    <LineChart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Adicione pontos para visualizar o gráfico</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Table Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Histórico</h2>
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Horário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {dataPoints.map((point, index) => (
                    <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {format(new Date(point.timestamp), 'HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-sky-400">
                        {point.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dataPoints.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  Nenhum dado adicionado ainda
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;