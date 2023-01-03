import { Button, Typography } from "@mui/material";
import axios from "axios";
import { collection, query, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import Moment from 'moment';

export const DetailComponent : React.FC = ({setDtail, cid}) => {

    const [cryptos, setCryptos] = useState<DBCryptos>([]);

    const [symbol, setSymbol] = useState("");
    const [name, setName] = useState("");
    const [img, setImg] = useState("");
    const [value, setValue] = useState("");
    const [tstamp, setTstamp] = useState("");
    const [urlId, setUrlId] = useState("");
    
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

    useEffect(() => {
        const collectionRef = collection(db, "cryptocurrencies")
        const q = query(collectionRef); //, orderBy("value")
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            setCryptos(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id})))
        });
        return unsubscribe;
    }, [])

    useEffect(() => {
        cryptos.forEach(crypto => {
            if(crypto.id == cid)
            {
                setSymbol(crypto.name);
                setName(crypto.name);
                setUrlId(crypto.name.toLowerCase());
                setImg(crypto.img);
                setValue(crypto.value);
                setTstamp(Moment(crypto.timestamp).format('DD-MM-yyyy'));
            }
        });
    },[cryptos])

    

    

    /*useEffect(() => {
        axios.get(url).then((response) => {
            setData(response.data);
            ;
        });
    }, [url]);*/

    const cus = () =>{
        const url = `https://api.coingecko.com/api/v3/coins/${urlId}/history?date=${tstamp}`;
        console.log(url)
    }
    

    return(       
        <div>
            <Button onClick={() => setDtail(false)}>Zpet na seznam</Button>
            <Button onClick={() => cus()}>link</Button>
            {cid} {name}
        </div>
    )
}

