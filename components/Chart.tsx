import React, { useRef, useEffect, useState } from 'react';
import { createChart } from 'lightweight-charts';
import styles from '../styles/Home.module.css'

export const CryptoChart: React.FC = ({ data }) => {

    const [chartData, setChartData] = useState();

    const chartRef = useRef();



    useEffect(() => {
        setChartData(data.prices.map(([time, value]) => ({ time: time / 1000, value })));
    }, [data]);


    useEffect(() => {
        if(chartData)
        {
            const chart = createChart(chartRef.current, {
                width: window.innerWidth * 0.7,
                height: 300,
                layout: {
                    background: {
                        color: '#282828',
                    },
                    textColor: '#ffffff',
                },
            });
    
            const lineSeries = chart.addLineSeries({
                color: '#00ff00',
                lineWidth: 2,
            });
    
            lineSeries.setData(chartData);
    
            return () => {
                chart.remove();
            };
        }
    }, [chartData]);

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartWrapper} ref={chartRef} />
        </div>
    );
};