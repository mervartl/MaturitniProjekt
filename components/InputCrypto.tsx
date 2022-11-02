import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "@firebase/firestore";
import { db } from "../firebase";
import { useUserContext } from "./userContext";
import axios from "axios";
import { Typography } from "@mui/material";

export const InputCrypto: React.FC = () => {

    type DBCryptos = {
        map(arg0: (crypto: any) => JSX.Element): import("react").ReactNode;
        forEach(arg0: (crypto: any) => void): unknown;
        id: string;
        symbol: string;
        name: string;
        img: string;
        value: number;
        userId: string;
      };

      type DataCryptos = {
        forEach(arg0: (dat: any) => void): unknown;
        id: string;
        symbol: string;
        name: string;
        image: string;
        current_price: number;
      };

    const { user } = useUserContext();
    const [cryptos, setCryptos] = useState<DBCryptos>([]);
    const [data, setData] = useState<DataCryptos>([]);

    const url =
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=200&page=1&sparkline=false';

    useEffect(() => {
        axios.get(url).then((response) => {
            setData(response.data);
            ;
        });
    }, [url]);
    console.log(data);
    useEffect(() => {
        const collectionRef = collection(db, "cryptocurrencies")

        const q = query(collectionRef, orderBy("value"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            setCryptos(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, timestamp: doc.data().timestamp?.toDate().getTime() })))
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

    const div = <div>
        {user ? (cryptos.map(crypto => user.user.uid === crypto.userId ? <div>{crypto.img} {crypto.name} {crypto.value} cena je {crypto.current_price} Kč</div> : <div></div>)) : <Typography variant="h3">Nejsi přihlášen!</Typography>}
    </div>

    return div;
}

