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

//Definice typů
type Crypto = {
  id: string;
  symbol: any;
  current_price: any;
  nameId: any;
  value: any;
  historical_price: any;
};

export const MainListComponent: React.FC = () => {

    //useStates pro získání userContextu, uchovávání dat a stavu aplikace(dtail, loading)
    const { user } = useUserContext();
    const [cryptos, setCryptos] = useState<Crypto[] | undefined>(undefined);
    const [data, setData] = useState<any>();
    const [cryptoSum, setCryptoSum] = useState<number>(0);
    const [cryptoMerged, setCryptoMerged] = useState<any>();
    const [histoCryptoSum, setHistoCryptoSum] = useState<number>(0);
    const [cName, setCName] = useState<string>("");
    const [dtail, setDtail] = useState(false);
    const [profitloss, setProfitloss] = useState<number>(0);

    const [ready, setReady] = useState<boolean>(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const [dataChanged, setDataChanged] = useState(false);

    //URL pro získávání dat z API
    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=200&page=1&sparkline=false';


    //Získávání dat z cache
    const cachedData = useMemo(() => {
        if (typeof window !== "undefined") {
          const cachedItem = localStorage.getItem(url);
          if (cachedItem) {
            const { data, timestamp } = JSON.parse(cachedItem);
            if (Date.now() - timestamp < 150000) {
              return data;
            }
          }
        }
        return null;
      }, [url]);
    
      //Načítání kryptoměn z API případně z cache
      useEffect(() => {
        if (cachedData) { //Pokud máme v cache data, tak je nastavíme
          setData(cachedData);
          setDataLoading(false);
        } else { //Jinak získáme data z API pomocí axios a uložíme je do cache
          axios.get(url).then((response) => {
            setData(response.data);
            setDataLoading(false);
            if (typeof window !== "undefined") {
              localStorage.setItem(
                url,
                JSON.stringify({ data: response.data, timestamp: Date.now() })
              );
            }
          });
        }
      }, [url, cachedData]);

      //Získávání dat z databáze
      useEffect(() => {
        if (user?.user.uid) {
            const collectionRef = collection(db, "cryptocurrencies");
            const q = query(collectionRef, where("userId", "==", user.user.uid));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                setCryptos(
                    querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Crypto))
                );
                setDataChanged(prev => !prev); // Toggle the flag to trigger an update
            });
            return unsubscribe;
        } else {
            setLoading(false);
        }
    }, [user?.user.uid]);
      
      //Funkce pro získání aktuálni ceny krypta
      const getCurPrice = () => {
        if (cryptos && data) {
            let updatedCryptos = cryptos.map((crypto) => {
                const matchedData = data.find((dat: any) => crypto.symbol === dat.symbol);
                if (matchedData) {
                    crypto.current_price = matchedData.current_price;
                }
                return crypto;
            });
            setCryptos(updatedCryptos);
        }
    };

    
    //Získání aktuální ceny kryptoměny
    useEffect(() => {
      if (cryptos && data) {
          getCurPrice();
          setHistoCryptoSum(cryptos.reduce((acc: number, crypto: { value: number; historical_price: number; }) => acc + crypto.value * crypto.historical_price, 0));
      }
  }, [dataChanged]);   

    //Funkce pro spojení počtu vlastnených kryptoměn se stejným id, ale přidáné v jiný čas a její nastavení
    useEffect(() => {
      const mergeOb = (objects: any) => {
        const mergedObjects: any[] = [];
      
        objects.forEach((obj: { name: any; value: any; }) => {
          const existingObject = mergedObjects.find(o => o.name === obj.name);
          if (existingObject) {
            existingObject.value = Number(existingObject.value) + Number(obj.value);
          } else {
            mergedObjects.push({ ...obj });
          }
        });
      
        return mergedObjects;
      }

      if(cryptos)
      {
        setCryptoMerged(mergeOb(cryptos));
      }       
    }, [cryptos]);

    //Získání aktuální ceny krypta
    useEffect(()=>{
      if(!dataLoading)
      {
        getCurPrice();
        setReady(true);
      }
    },[dataLoading, data]);


    //Získání aktuální hodnoty portfolia
    useEffect(() => {
        if(cryptoMerged)
        {
          setCryptoSum(cryptoMerged.reduce((acc: number, crypto: { value: number; current_price: number; }) => acc + crypto.value * crypto.current_price, 0));
        }  
    },[cryptoMerged]);


    //Nastavení profit/loss
    useEffect(()=>{
        if(histoCryptoSum)
        {
            setProfitloss(cryptoSum - histoCryptoSum);
            setLoading(false);
        }
    },[cryptoSum]);
    
    //handler pro kliknutí na tlačítko detail a nastavení jména které se předá do komponenty DetailComponent
    const onButtonClick = (name: string) => {
        setCName(name);
        setDtail(true);
    };
    

    const div = <div>
        {loading ? <Typography variant="h5">Loading...</Typography> : (dtail ? (<DetailComponent setDtail={setDtail} cName={cName} />) :
            (user && ready && !dataLoading ? (
            <div>
            <Typography display="inline" variant="h4">Celkový P/L: </Typography> 
            <Typography display="inline" variant="h4" color={profitloss >= 0 ? green[500] : red[900]}>{profitloss > 0 ? "+" : ""}{Math.round(profitloss * 100) / 100} Kč </Typography>
            <Typography display="inline" variant="h4" color={profitloss >= 0 ? green[500] : red[900]}>{Math.round(profitloss / histoCryptoSum * 100 * 100) / 100}%</Typography><br/>
            <Typography display="inline" variant="h4">Hodnota portfolia: <NumericFormat value={cryptos ? (Math.round(cryptos.reduce((acc: number, crypto: { value: number; current_price: number; }) => acc + crypto.value * crypto.current_price, 0))) : null} displayType="text" thousandSeparator=" " decimalSeparator=","/> Kč</Typography>
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
                        {user && cryptoMerged ? (cryptoMerged.map((crypto:any) => user.user.uid === crypto.userId ? (
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
