import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "@firebase/firestore";
import { db } from "../firebase";
import { useUserContext } from "./userContext";
import axios from "axios";
import { Button, Paper,  TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import dynamic from 'next/dynamic'
const Table = dynamic(() => import("@mui/material/Table"), {
ssr: false,
});
import { DetailComponent } from "./DetailComponent";
import { NumericFormat } from 'react-number-format';


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


    const url =
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=200&page=1&sparkline=false';

    useEffect(() => {
        axios.get(url).then((response) => {
            setData(response.data);
        });
    }, [url]);

    useEffect(() => {
        const collectionRef = collection(db, "cryptocurrencies")
        const q = query(collectionRef); //, orderBy("value")
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            setCryptos(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })))
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

    const [cryptoObj, setCryptoObj] = useState();

    useEffect(() => {
        setCryptoObj(mergeOb(cryptos));
    }, [cryptos]);

    const mergeOb = (objects: DBCryptos) => {
        const mergedObjects: MergedCryptos = [];

        objects.forEach(obj => {
            const existingObject = mergedObjects.find(o => o.name === obj.name);
            if (existingObject) {
                existingObject.value = parseFloat(existingObject.value) + parseFloat(obj.value);
            } else {
                mergedObjects.push(obj);
            }
        });

        return mergedObjects;
    }


    const [cName, setCName] = useState<string>();
    const [dtail, setDtail] = useState(false);

    const onButtonClick = (name: string) => {
        setCName(name);
        setDtail(true);
    }


    const div = <div>
        {dtail ? (<DetailComponent setDtail={setDtail} cName={cName} />) : 
        ( user ? (<TableContainer component={Paper}>
            <Table >
                <TableHead>
                    <TableRow>
                        <TableCell align="right"></TableCell>
                        <TableCell>Název měny</TableCell>
                        <TableCell>Zakoupený počet měny</TableCell>
                        <TableCell>Momentální price</TableCell>
                        <TableCell>Detail měny</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {user && cryptoObj ? (cryptoObj.map(crypto => user.user.uid === crypto.userId ? (
                        <TableRow key={crypto.name}>          
                            <TableCell><img src={crypto.img}alt={crypto.name}width="30"/></TableCell>       
                            <TableCell>{crypto.name}</TableCell>
                            <TableCell><NumericFormat value={crypto.value} displayType="text" thousandSeparator=" " decimalSeparator=","/> </TableCell>
                            <TableCell><NumericFormat value={Math.round(crypto.value * crypto.current_price * 100) / 100} displayType="text" thousandSeparator=" " decimalSeparator=","/>  Kč</TableCell>
                            <TableCell><Button onClick={()=>onButtonClick(crypto.name)}>Detail</Button></TableCell>   
                        </TableRow>) : null)): null}
                </TableBody>
            </Table>
        </TableContainer>) : <Typography variant="h3">Nejsi přihlášen!</Typography>)}
    </div>

    return div;
}
