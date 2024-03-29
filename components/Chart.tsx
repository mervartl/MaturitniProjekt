import React, { useRef, useEffect, useState } from 'react';
import { createChart } from 'lightweight-charts';
import styles from '../styles/Home.module.css';
import { green, red} from "@mui/material/colors";


//Interface pro React.FC
interface ChartProps {
  data: any;
  profitloss: number;
}

export const Chart: React.FC<ChartProps> = ({ data, profitloss }) => {

  //useStates pro nastavení dat a získání chartRefs
  const [chartData, setChartData] = useState<{ time: number; value: number }[]>();
  const [lineColor, setLineColor] = useState<string>();

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>();


  //Nastavení chart dat a barvy linky
  useEffect(() => {
    if (data) {
      setChartData(data.map(([time, value]: [number, number]) => ({ time: time / 1000, value })));
    }

    if (profitloss >= 0) {
      setLineColor(green[500])
    } else {
      setLineColor(red[500])
    }
  }, [data]);


  //Vytvoření grafu
  useEffect(() => {
    if (chartData && chartData.length > 0 && profitloss !== undefined) {
      chartInstanceRef.current = createChart(chartRef.current!, {
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

      const filteredChartData = chartData.filter(point => point.value !== null && point.value !== undefined);
      lineSeries.setData(filteredChartData);

      const handleResize = () => {
        chartInstanceRef.current.applyOptions({ width: window.innerWidth * 0.7 });
      };

      window.addEventListener('resize', handleResize);

      return () => {
        chartInstanceRef.current.remove();
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [chartData, lineColor, profitloss]);

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartWrapper} ref={chartRef} />
    </div>
  );
};
