import { useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query } from "@firebase/firestore";
import { db } from "../firebase";
import { useUserContext } from "./userContext";
import axios from "axios";
import { Button, Typography } from "@mui/material";
import { DetailComponent } from "./DetailComponent";

export const InputCrypto: React.FC = ( ) => {

    type DataCryptos = {
        forEach(arg0: (dat: any) => void): unknown; //data z api
        id: string;
        symbol: string;
        name: string;
        image: string;
        current_price: number;
    };


    type DBCryptos = { //data z databaze
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
    const [cid, setCid] = useState();


    const url =
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=200&page=1&sparkline=false';

    useEffect(() => {
        axios.get(url).then((response) => {
            setData(response.data);
            ;
        });
    }, [url]);

    useEffect(() => {
        const collectionRef = collection(db, "cryptocurrencies")
        const q = query(collectionRef); //, orderBy("value")
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            setCryptos(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id})))
        });
        return unsubscribe;
    }, [])

    cryptos.forEach(crypto => {
        data.forEach(dat => {
            if (crypto.symbol == dat.symbol) {
                crypto.current_price = dat.current_price;
            }
        }); 
    });    

    const [dtail, setDtail] = useState(false);

    const onButtonClick=(id)=>{
        setCid(id);
        setDtail(true);
    }




    const div = <div>
        {}
        {dtail ? (<DetailComponent setDtail={setDtail} cid={cid}/>) : user ? (cryptos.map(crypto => user.user.uid === crypto.userId ? (<div><Button onClick={()=>onButtonClick(crypto.id)}><img src={crypto.img} width="30"></img> {crypto.name} {crypto.value} cena je {Math.round(crypto.value * crypto.current_price * 100) / 100} Kč</Button></div>) : <div></div>)) : <Typography variant="h3">Nejsi přihlášen!</Typography>}
    </div>

    return div;
}

