import { Button, Divider, Grid, Typography } from "@mui/material";
import axios from "axios";
import { collection, query, onSnapshot, where, doc, deleteDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";

export const DetailComponent: React.FC = ({ setDtail, cName }) => {
  const [cryptos, setCryptos] = useState<DBCryptos>([]);
  const [histoData, setHistoData] = useState<Data[]>();
  const [curData, setCurData] = useState();
  const [sum, setSum] = useState<number>();

  const [curPrice, setCurPrice] = useState(null);
  const [curMCap, setCurMCap] = useState(null);
  const [curTVolume, setCurTVolume] = useState(null);

  const [img, setImg] = useState("");
  const [urlId, setUrlId] = useState();

  const [hPriceAssigned, setHPriceAssigned] = useState<boolean>(false);

  const [url, setUrl] = useState<string>("");
  const [hisUrl, setHisUrl] = useState(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=200&page=1&sparkline=false"
  );

  interface Data {
    forEach(arg0: (val: any) => void): unknown;
    prices: [number, number][],
    market_caps: [number, number][],
  }


  type DBCryptos = {
    reduce(arg0: (acc: any, { value }: { value: any; }) => any, arg1: number): import("react").SetStateAction<number | undefined>;
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

  useEffect(() => {
    cryptos.forEach((crypto) => {
      //data z db
      if (crypto.name == cName) {
        setUrlId(crypto.nameId);
        setImg(crypto.img);
      }
    });

    setSum(cryptos.reduce((acc, {value}) => acc + parseInt(value), 0));
  }, [cryptos]);

  useEffect(() => {
    if(urlId != null)
    {
      setHisUrl(
        `https://api.coingecko.com/api/v3/coins/${urlId}/market_chart?vs_currency=czk&days=max&interval=daily`
      );
      setUrl(
        `https://api.coingecko.com/api/v3/coins/${urlId}?market_data=true&community_data=false&developer_data=false`
      );
    }   
  }, [urlId]);


  const regex = /\/(?!.*undefined)(.*)\?/;

  useEffect(() => {
    if(url.match(regex))
    {
      axios.get(url).then((response) => {
        setCurData(response.data);
      });
    }   
  }, [url]);


  useEffect(()=>{
    if (hisUrl.match(regex)) {
      axios.get(hisUrl).then((response) => {
        setHistoData(response.data);
      });
    }
  },[hisUrl])

  useEffect(() => {
    if (!curData) return;
    setCurPrice(curData.market_data.current_price["czk"]);
    setCurMCap(curData.market_data.market_cap["czk"]);
    setCurTVolume(curData.market_data.total_volume["czk"]);
  }, [curData]);


  const deleteFromDb = async (id: string) => {
    const docRef = doc(db, "cryptocurrencies", id);
    deleteDoc(docRef)
      .then(() => {
        console.log("Entire Document has been deleted successfully.")
      })
      .catch(error => {
        console.log(error);
      })
  };

  
  useEffect(() => {
    if (!histoData) {
      console.log("nejsou histoData");
    }
    else {
      cryptos.map(crypto => {
        const date = new Date(crypto.timestamp);
        const tstamp = date.getTime();
        Object.entries(histoData).forEach(([key, value]) => {
          if (key == "prices") {
            value.forEach(val => {
              if (val[1] != null && val[0] == tstamp) {
                
                  setHPriceAssigned(true);
                  crypto.historical_price = val[1];
                
              }
            });
          }
          else if (key == "market_caps") {
            value.forEach(val => {
              if (val[1] != null && val[0] == tstamp) {
                
                  setHPriceAssigned(true);
                  crypto.historical_mcap = val[1];
                
              }
            });
          }
          else if (key == "total_volumes") {
            value.forEach(val => {
              if (val[1] != null && val[0] == tstamp) {
                
                  setHPriceAssigned(true);
                  crypto.historical_tvolume = val[1];
                
              }
            });
          }
        });
      });
    }
  }, [histoData]);

  console.log(cryptos);



  if (hPriceAssigned) {
    return (
      <div>
        <Button onClick={() => setDtail(false)}>Zpet na seznam</Button>
        <br />
        <Typography variant="h3"><img src={img} height="30px"></img> {cName} <img src={img} height="30px"></img></Typography>

        <Typography>Celkový počet vlastněné kryptoměny: {sum}</Typography>
        <Divider />
        <br />
        <Grid container columns={1} spacing={1}>
          <Grid item xs={1}><Typography variant="h5" textAlign="center">Aktuální data</Typography></Grid>
          <Grid container columns={1} spacing={2}>
            <Grid item xs={1}>
              <Typography paddingTop="2%">Price for one: {curPrice} Kč</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography>Price vlastněných total: {Math.round(curPrice * sum * 100) / 100} Kč</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography>Market cap: {curMCap} Kč</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography paddingBottom="2%">Total volume: {curTVolume} Kč</Typography><Divider />
            </Grid>
          </Grid>
        </Grid>
        {cryptos.map(crypto =>
        (<Grid container columns={1} spacing={1}>
          <Grid item xs={1} textAlign="center">
            <Typography variant="h5" paddingTop="2%">{crypto.value} {cName} koupený v {crypto.timestamp}</Typography><Button onClick={() => deleteFromDb(crypto.id)}>Delete</Button>
            <Grid container columns={1} spacing={2}>
              <Grid item xs={1} >
                <Typography paddingTop="2%">Price for one: {Math.round(crypto.historical_price * 100) / 100} Kč</Typography>
              </Grid>
              <Grid item xs={1} >
                <Typography>Price vlastněných total: {Math.round(crypto.historical_price * sum * 100) / 100} Kč</Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography>Market cap: {Math.round(crypto.historical_mcap* 100) / 100} Kč</Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography paddingBottom="4%">Total volume: {Math.round(crypto.historical_tvolume* 100) / 100} Kč</Typography><Divider />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        ))}
      </div>
    );
  }
};

