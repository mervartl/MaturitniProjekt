import React, { useRef, useEffect, useState } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import styles from '../styles/Home.module.css';
import { green, red } from '@mui/material/colors';


//Interface pro React.FC
interface ChartProps {
  data: any;
  timestamp: string;
  profitloss: number;
}

export const HistoricChart: React.FC<ChartProps> = ({ data, timestamp, profitloss }) => {

  //useStates pro nastavení dat a získání chartRefs
  const [chartData, setChartData] = useState();
  const [lineColor, setLineColor] = useState<string>();

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<IChartApi | undefined>(undefined);

  //Nastavení chart dat a barvy linky
  useEffect(() => {
    if (data) {
      const date = new Date(timestamp);

      setChartData(
        data
          .filter(([time, value]: [Date, number]) => time >= date)
          .map(([time, value]: [number, number]) => ({ time: time / 1000, value }))
      );
    }

    if (profitloss >= 0) {
      setLineColor(green[500]);
    } else {
      setLineColor(red[500]);
    }
  }, [data]);


  //Vytvoření grafu
  useEffect(() => {
    if (chartData && profitloss && chartRef.current) {
      chartInstanceRef.current = createChart(chartRef.current, {
        width: window.innerWidth * 0.7,
        height: 300,
        layout: {
          background: {
            color: '#282828',
          },
          textColor: '#ffffff',
        },
      });

      const lineSeries = chartInstanceRef.current.addLineSeries({
        color: lineColor,
        lineWidth: 2,
      });

      lineSeries.setData(chartData);

      const handleResize = () => {
        chartInstanceRef.current?.applyOptions({ width: window.innerWidth * 0.7 });
      };

      window.addEventListener('resize', handleResize);

      return () => {
        chartInstanceRef.current?.remove();
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [chartData]);

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartWrapper} ref={chartRef} />
    </div>
  );
};
