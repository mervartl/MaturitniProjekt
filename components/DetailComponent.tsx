import { Button, Divider, Grid, Typography } from "@mui/material";
import axios from "axios";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import Moment from "moment";

export const DetailComponent: React.FC = ({ setDtail, cName }) => {
  const [cryptos, setCryptos] = useState<DBCryptos>([]);
  const [histoData, setHistoData] = useState();
  const [curData, setCurData] = useState();
  const [mergedValue, setMergedValue] = useState<number>();
  const [merged, setMerged] = useState();

  const [curPrice, setCurPrice] = useState(null);
  const [curMCap, setCurMCap] = useState(null);
  const [curTVolume, setCurTVolume] = useState(null);

  const [name, setName] = useState("");
  const [img, setImg] = useState("");
  const [value, setValue] = useState("");
  const [tstamp, setTstamp] = useState("");
  const [urlId, setUrlId] = useState();

  const [url, setUrl] = useState<string>("");
  const [hisUrl, setHisUrl] = useState(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=200&page=1&sparkline=false"
  );

  type DBCryptos = {
    //data z databaze
    map(arg0: (crypto: any) => JSX.Element): import("react").ReactNode;
    forEach(arg0: (crypto: any) => void): unknown;
    id: string;
    name: string;
    img: string;
    value: number;
    timestamp: string;
    nameId: string;
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

  useEffect(() => {
    const collectionRef = collection(db, "cryptocurrencies");
    const q = query(collectionRef, where("name", "==", cName));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setCryptos(
        querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    });
    return unsubscribe;
  }, []);

  console.log(cryptos);

  useEffect(() => {
    cryptos.forEach((crypto) => {
      //data z db
      if (crypto.name == cName) {
        setName(crypto.name);
        setUrlId(crypto.nameId);
        setImg(crypto.img);
        setValue(crypto.value);
        setTstamp(Moment(crypto.timestamp).format("DD-MM-yyyy"));
      }
    });
  }, [cryptos]);

  useEffect(() => {
    setHisUrl(
      `https://api.coingecko.com/api/v3/coins/${urlId}/history?date=${tstamp}`
    );
    setUrl(
      `https://api.coingecko.com/api/v3/coins/${urlId}?market_data=true&community_data=false&developer_data=false`
    );
  }, [urlId]);



  const regex = /date=(\d+)/;
  const regex2 = /\/(?!.*undefined)(.*)\?/;

  useEffect(() => {
    if(url.match(regex2))
    {
      axios.get(url).then((response) => {
        setCurData(response.data);
      });
    }   
    if (hisUrl.match(regex)) {
      axios.get(hisUrl).then((response) => {
        setHistoData(response.data);
      });
    }
  }, [hisUrl]);




  const mergeOb = (objects: DBCryptos) => { //tady to do prvniho hazi celou hodnotu - opravit
    const mergedObjects: MergedCryptos = [];

    objects.forEach((obj) => {
      const existingObject = mergedObjects.find((o) => o.name === obj.name);
      if (existingObject) {
        existingObject.value = parseInt(existingObject.value) + parseInt(obj.value);
      } else {
        mergedObjects.push(obj);
      }
    });

    return mergedObjects;
  };

  useEffect(() => {
    setMerged(mergeOb(cryptos));
  }, [cryptos]);

  useEffect(() => {
    if (!merged) return;
    merged.forEach((obj) => {
      if (obj.name == cName) {
        setMergedValue(obj.value);
      }
    });
  }, [merged]);



  useEffect(() => {
    if (!curData) return;
    setCurPrice(curData.market_data.current_price["czk"]);
    setCurMCap(curData.market_data.market_cap["czk"]);
    setCurTVolume(curData.market_data.total_volume["czk"]);
  }, [curData]);



  return (
    <div>
      <Button onClick={() => setDtail(false)}>Zpet na seznam</Button>
      <br />
      <Typography variant="h3"><img src={img} height="30px"></img> {cName} <img src={img} height="30px"></img></Typography>
      
      <Typography>Celkový počet vlastněné kryptoměny: {mergedValue}</Typography>
      <Divider />
      <br />
      <Grid container columns={1} spacing={1}>
      <Grid item xs={1}><Typography variant="h5" textAlign="center">Aktuální data</Typography></Grid>
        <Grid container columns={1} spacing={2}> 
          <Grid item xs={1}>
            <Typography paddingTop="2%">Price for one: {curPrice} Kč</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>Price vlastněných total: {Math.round(curPrice * mergedValue * 100) / 100} Kč</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>Market cap: {curMCap} Kč</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography paddingBottom="2%">Total volume: {curTVolume} Kč</Typography><Divider />
          </Grid>
        </Grid>
      </Grid>
      {}
      <Grid container columns={1} spacing={1}>
        <Grid item xs={1} textAlign="center">
          <Typography variant="h5" paddingTop="2%">Data v době zakoupení</Typography>
          <Grid container columns={1} spacing={2}>
            <Grid item xs={1} >
              <Typography paddingTop="2%">Price: {}</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography>Market cap: {}</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography paddingBottom="4%">Total volume: {}</Typography><Divider />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};
