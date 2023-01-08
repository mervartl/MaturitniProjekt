import { Button, Grid, Typography } from "@mui/material";
import axios from "axios";
import { collection, query, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import Moment from 'moment';

export const DetailComponent : React.FC = ({setDtail, cid}) => {

    const [cryptos, setCryptos] = useState<DBCryptos>([]);
    const [histoData, setHistoData] = useState();
    const [curData, setCurData] = useState();

    const [name, setName] = useState("");
    const [img, setImg] = useState("");
    const [value, setValue] = useState("");
    const [tstamp, setTstamp] = useState("");
    const [urlId, setUrlId] = useState("");

    const [url, setUrl] = useState("");
    const [hisUrl, setHisUrl] = useState("https://api.coingecko.com/api/v3/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=200&page=1&sparkline=false");
    
    type DBCryptos = { //data z databaze
        map(arg0: (crypto: any) => JSX.Element): import("react").ReactNode;
        forEach(arg0: (crypto: any) => void): unknown;
        id: string;
        name: string;
        img: string;
        value: number;
        timestamp: string;
        nameId: string;
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
        cryptos.forEach(crypto => { //data z db
            if(crypto.id == cid)
            {
                setName(crypto.name);
                setUrlId(crypto.nameId);
                setImg(crypto.img);
                setValue(crypto.value);
                setTstamp(Moment(crypto.timestamp).format('DD-MM-yyyy'));
            }
        });
    },[cryptos])

    useEffect(() => {
        setHisUrl(`https://api.coingecko.com/api/v3/coins/${urlId}/history?date=${tstamp}`);
        setUrl(`https://api.coingecko.com/api/v3/coins/${urlId}?market_data=true&community_data=false&developer_data=false`);
    },[urlId]);

    const regex = /date=(\d+)/;
    const match = hisUrl.match(regex);

    useEffect(() => {
        axios.get(url).then((response) => {
            setCurData(response.data);
        });
        if(match)
        {
            axios.get(hisUrl).then((response) => {
                setHistoData(response.data);
            });
        } 
    }, [hisUrl]);


    return(       
        <div>
            <Button onClick={() => setDtail(false)}>Zpet na seznam</Button><br/>
            <Typography>Počet kryptoměny: {value}</Typography><br/>
            <Grid container columns={2} spacing={1}>
                <Grid item xs={1} textAlign="center"><Typography variant="h5">Data v době zakoupení</Typography>
                    <Grid container spacing={2}>
                        <Grid item>

                        </Grid>
                        <Grid item>

                        </Grid>
                        <Grid item>

                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={1} textAlign="center"><Typography variant="h5">Data dnes</Typography>
                    <Grid container spacing={2}>
                        <Grid item>

                        </Grid>
                        <Grid item>

                        </Grid>
                        <Grid item>

                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    )
}

