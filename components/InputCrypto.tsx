import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "@firebase/firestore";
import { db } from "../firebase";
import { useUserContext } from "./userContext";
import axios from "axios";
import { Typography } from "@mui/material";

export const InputCrypto: React.FC = () => {

    const { user } = useUserContext();
    const [cryptos, setCryptos] = useState([]);
    const [data, setData] = useState([]);

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

