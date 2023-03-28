import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query } from "@firebase/firestore";
import { db } from "../firebase";
import { useUserContext } from "./userContext";
import axios from "axios";
import { Button, Divider, Paper, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import dynamic from 'next/dynamic'
import { DetailComponent } from "./DetailComponent";
import { NumericFormat } from 'react-number-format';
import { green, red } from "@mui/material/colors";
import { where } from "firebase/firestore";
const Table = dynamic(() => import("@mui/material/Table"), {
    ssr: false,
});



export const InputCrypto: React.FC = () => {

    type DataCryptos = {
        forEach(arg0: (dat: any) => void): unknown; //data z api
        id: string;
        symbol: string;
        name: string;
        image: string;
        current_price: number;
    };

    type MergedCryptos = {
        push(obj: any): unknown;
        find(arg0: (o: any) => boolean): unknown;
        current_price: number
        id: string
        img: string
        name: string
        nameId: string
        symbol: string
        timestamp: string
        userId: string
        value: number
    };


    type DBCryptos = {
        reduce(arg0: (acc: number, crypto: { value: number; historical_price: number; }) => number, arg1: number): import("react").SetStateAction<number>; //data z databaze
        map(arg0: (crypto: any) => JSX.Element): import("react").ReactNode;
        forEach(arg0: (crypto: any) => void): unknown;
        id: string;
        symbol: string;
        name: string;
        img: string;
        value: number;
        userId: string;
        timestamp: string;
    };


    const { user } = useUserContext();
    const [cryptos, setCryptos] = useState<DBCryptos>([]);
    const [data, setData] = useState<DataCryptos>([]);
    const [cryptoSum, setCryptoSum] = useState<number>(0);
    const [cryptoObj, setCryptoObj] = useState<any>();
    const [histoCryptoSum, setHistoCryptoSum] = useState<number>(0);
    const [cName, setCName] = useState<string>();
    const [dtail, setDtail] = useState(false);
    const [profitloss, setProfitloss] = useState<number>(0);

    const [loading, setLoading] = useState(true);


    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=200&page=1&sparkline=false';

    const cachedData = useMemo(() => {
        if (typeof window !== "undefined") {
          const cachedItem = localStorage.getItem(url);
          if (cachedItem) {
            const { data, timestamp } = JSON.parse(cachedItem);
            if (Date.now() - timestamp < 15000) {
              return data;
            }
          }
        }
        return null;
      }, [url]);
    
      useEffect(() => {
        if (cachedData) {
          setData(cachedData);
        } else {
          axios.get(url).then((response) => {
            setData(response.data);
            if (typeof window !== "undefined") {
              localStorage.setItem(
                url,
                JSON.stringify({ data: response.data, timestamp: Date.now() })
              );
            }
          });
        }
      }, [url, cachedData]);

      useEffect(() => {
        if (user?.user.uid) {
          const collectionRef = collection(db, "cryptocurrencies");
          const q = query(collectionRef, where("userId", "==", user.user.uid));
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            setCryptos(
              querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
            );
          });
          return unsubscribe;
        }
        else
        {
          setLoading(false);
        }
      }, [user?.user.uid]);




    const histoDataCache = useMemo(() => ({}), []);

    useEffect(() => {
        if(cryptos)
        {
            getCrypto();
        }
    }, [cryptos, histoDataCache]);


    const getCrypto = () => {
        if (cryptos) {
            cryptos.forEach(crypto => {
                const hisUrl = `https://api.coingecko.com/api/v3/coins/${crypto.nameId}/market_chart?vs_currency=czk&days=max&interval=daily`;

                if (histoDataCache[hisUrl]) {
                    const histoData = histoDataCache[hisUrl];
                    updateCryptoHistoricalPrice(crypto, histoData);
                    setHistoCryptoSum(cryptos.reduce((acc: number, crypto: { value: number; historical_price: number; }) => acc + crypto.value * crypto.historical_price, 0));
                } else {
                    axios.get(hisUrl).then(response => {
                        const histoData = response.data;
                        if (histoData) {
                            histoDataCache[hisUrl] = histoData;
                            updateCryptoHistoricalPrice(crypto, histoData);
                            setHistoCryptoSum(cryptos.reduce((acc: number, crypto: { value: number; historical_price: number; }) => acc + crypto.value * crypto.historical_price, 0));
                        }
                    });
                }
            });
        }
    };

    const updateCryptoHistoricalPrice = (crypto: any, histoData: any) => {
        const date = new Date(crypto.timestamp);
        const tstamp = date.getTime();

        Object.entries(histoData).forEach(([key, value]) => {
            if (key === "prices") {
                value.forEach((val: any[]) => {
                    if (val[1] !== null && val[0] === tstamp) {
                        crypto.historical_price = val[1];
                    }
                });
            }
        });
    }

    cryptos.forEach(crypto => {
        data.forEach(dat => {
            if (crypto.symbol == dat.symbol) {
                crypto.current_price = dat.current_price;
            }
        });
    });


    useEffect(() => {
        setCryptoObj(mergeOb(cryptos));
    }, [cryptos]);

    const mergeOb = (objects: DBCryptos) => {
        const mergedObjects: MergedCryptos = [];
      
        objects.forEach(obj => {
          const existingObject = mergedObjects.find(o => o.name === obj.name);
          if (existingObject) {
            existingObject.value = Number(existingObject.value) + Number(obj.value);
          } else {
            mergedObjects.push({ ...obj });
          }
        });
      
        return mergedObjects;
      }


    useEffect(() => {
        if(cryptoObj)
        {
            setCryptoSum(cryptoObj.reduce((acc: number, crypto: { value: number; current_price: number; }) => acc + crypto.value * crypto.current_price, 0));
        }  
    },[cryptoObj]);


    useEffect(()=>{
        if(histoCryptoSum)
        {
            setProfitloss(cryptoSum - histoCryptoSum);
            setLoading(false);
        }
    },[histoCryptoSum]);
    

    const onButtonClick = (name: string) => {
        setCName(name);
        setDtail(true);
    };
    

    const div = <div>
        {loading ? <Typography variant="h5">Loading...</Typography> : (dtail ? (<DetailComponent setDtail={setDtail} cName={cName} />) :
            (user ? (
            <div>
            <Typography display="inline" variant="h4">Celkový P/L: </Typography> 
            <Typography display="inline" variant="h4" color={profitloss >= 0 ? green[500] : red[900]}>{profitloss > 0 ? "+" : ""}{Math.round(profitloss * 100) / 100} Kč </Typography>
            <Typography display="inline" variant="h4" color={profitloss >= 0 ? green[500] : red[900]}>{Math.round(profitloss / histoCryptoSum * 100 * 100) / 100}%</Typography><br/>
            <Typography display="inline" variant="h4">Hodnota portfolia: <NumericFormat value={Math.round(cryptos.reduce((acc: number, crypto: { value: number; current_price: number; }) => acc + crypto.value * crypto.current_price, 0))} displayType="text" thousandSeparator=" " decimalSeparator=","/> Kč</Typography>
            <Divider sx={{paddingBottom: "2%"}}/>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="right"></TableCell>
                            <TableCell><Typography><strong>Název</strong></Typography></TableCell>
                            <TableCell><Typography><strong>Počet</strong></Typography></TableCell>
                            <TableCell><Typography><strong>Price</strong></Typography></TableCell>
                            <TableCell><Typography><strong>Total</strong></Typography></TableCell>
                            <TableCell><Typography><strong>Detail</strong></Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {user && cryptoObj ? (cryptoObj.map(crypto => user.user.uid === crypto.userId ? (
                            <TableRow key={crypto.name}>
                                <TableCell><img src={crypto.img} alt={crypto.name} width="30" /></TableCell>
                                <TableCell>{crypto.name}</TableCell>
                                <TableCell><NumericFormat value={parseFloat(crypto.value)} displayType="text" thousandSeparator=" " decimalSeparator="," /> </TableCell>
                                <TableCell><NumericFormat value={Math.round(crypto.current_price * 100) / 100} displayType="text" thousandSeparator=" " decimalSeparator="," />  Kč</TableCell>
                                <TableCell><NumericFormat value={Math.round(crypto.value * crypto.current_price) * 100 / 100} displayType="text" thousandSeparator=" " decimalSeparator="," />  Kč</TableCell>
                                <TableCell><Button onClick={() => onButtonClick(crypto.name)}>Detail</Button></TableCell>
                            </TableRow>) : null)) : null}
                    </TableBody>
                </Table>
            </TableContainer></div>) : <Typography variant="h3">Nejsi přihlášen!</Typography>))}
    </div>

    return div;
}
