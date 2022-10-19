import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "@firebase/firestore";
import { db } from "../firebase";
import { useUserContext } from "./userContext";
import axios from "axios";

export const InputCrypto: React.FC = () => {

    const { user } = useUserContext();
    const [cryptos, setCryptos] = useState([]);
    const [data, setData] = useState([]);

    const url =
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=250&page=1&sparkline=false';

    useEffect(() => {
        axios.get(url).then((response) => {
            setData(response.data);
            ;
        });
    }, [url]);

    useEffect(() => {
        const collectionRef = collection(db, "cryptocurrencies")

        const q = query(collectionRef, orderBy("value"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            setCryptos(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, timestamp: doc.data().timestamp?.toDate().getTime() })))
        });
        return unsubscribe;
    }, [])
    const div = <div>
        {cryptos.map(crypto => user.user.uid === crypto.userId ? <div>{crypto.symbol} {crypto.name} {crypto.value} cena je {crypto.value * data.current_price}</div> : <div></div>)}
    </div>

    return div;
}

