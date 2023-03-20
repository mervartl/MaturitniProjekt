import { Button, Divider, Grid, Typography } from "@mui/material";
import axios from "axios";
import { collection, query, onSnapshot, where, doc, deleteDoc } from "firebase/firestore";
import moment from "moment";
import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../firebase";
import { NumericFormat } from 'react-number-format';
import { green, red } from "@mui/material/colors";
import { isEmpty } from "@firebase/util";
import { CryptoChart } from "./Chart";

export const DetailComponent: React.FC = ({ setDtail, cName }) => {
  const [cryptos, setCryptos] = useState<DBCryptos>([]);
  const [histoData, setHistoData] = useState<Data[]>();
  const [curData, setCurData] = useState<any | null>();
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
  const ref = useRef(0);

  const [profitloss, setProfitloss] = useState<number>();

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

    setSum(cryptos.reduce((acc, { value }) => acc + parseFloat(value), 0));
  }, [cryptos]);

  useEffect(() => {
    if (urlId != null) {
      setHisUrl(
        `https://api.coingecko.com/api/v3/coins/${urlId}/market_chart?vs_currency=czk&days=max&interval=daily`
      );
      setUrl(
        `https://api.coingecko.com/api/v3/coins/${urlId}?market_data=true&community_data=false&developer_data=false`
      );
    }
  }, [urlId]);


  const regex = /\/(?!.*undefined)(.*)\?/;


  const cachedData = useMemo(() => {
    const cachedItem = localStorage.getItem(url);
    if (cachedItem) {
      const { data, timestamp } = JSON.parse(cachedItem);
      if (Date.now() - timestamp < 150000) {
        return data;
      }
    }
    return null;
  }, [url]);


  const cachedHistoData = useMemo(() => {
    const cachedItem = localStorage.getItem(hisUrl);
    if (cachedItem) {
      const { data, timestamp } = JSON.parse(cachedItem);
      if (Date.now() - timestamp < 150000) {
        return data;
      }
    }
    return null;
  }, [hisUrl]);





  useEffect(() => {
    getCurData();
  }, [url, cachedData]);

  const getCurData = async () => {
    if (url.match(regex)) {
      if (cachedData) {
        setCurData(cachedData);
      } else {
        console.log("necuzuuunmdasfdsf");
        await axios.get(url).then((response) => {
          setCurData(response.data);
          localStorage.setItem(
            url,
            JSON.stringify({ data: response.data, timestamp: Date.now() })
          );
        });
      }
      if(curData)
      {
      setCurPrice(curData.market_data.current_price["czk"]);
      setCurMCap(curData.market_data.market_cap["czk"]);
      setCurTVolume(curData.market_data.total_volume["czk"]);  
      }
                 
    }
  };


  useEffect(() => {
    if (curData) {
      setCurPrice(curData.market_data.current_price["czk"]);
      setCurMCap(curData.market_data.market_cap["czk"]);
      setCurTVolume(curData.market_data.total_volume["czk"]);  
    }
  }, [curData]);


  useEffect(() => {
    if (hisUrl.match(regex)) {
      if (cachedHistoData) {
        setHistoData(cachedHistoData);
      } else {
        axios.get(hisUrl).then((response) => {
          setHistoData(response.data);
          localStorage.setItem(
            hisUrl,
            JSON.stringify({ data: response.data, timestamp: Date.now() })
          );
        });
      }
    }
  }, [hisUrl, cachedHistoData]);


  const deleteFromDb = async (id: string) => {
    const docRef = doc(db, "cryptocurrencies", id);
    deleteDoc(docRef)
      .then(() => {
        if (isEmpty(cryptos)) //pokud se smazou vsechny, musi to hodit zpatky na list, zatim to dela brikule
        {
          setDtail(false);
        }
        console.log("Kryptoměny byla odstraněna");
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
      cryptos.forEach(crypto => {
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



  useEffect(() => {
    console.log("curpice " + curPrice);

    getCurData();

    console.log("curpice " + curPrice);

    if (sum && hPriceAssigned && curPrice) {
      cryptos.forEach(crypto => {
        ref.current = ref.current + (crypto.value * crypto.historical_price);
      });

      setProfitloss((curPrice * sum) - ref.current);
    }


  }, [hPriceAssigned, curPrice]);

  console.log("profitloss " + profitloss);
  


  const back = <><Button onClick={() => setDtail(false)}>Zpet na seznam</Button>
    <br /></>;
  if (hPriceAssigned && sum && curPrice && profitloss) {
    return (
      <div>
        {back}
        <Typography variant="h2"><img src={img} height="30px"></img> {cName} <img src={img} height="30px"></img></Typography>

        <Typography>Celkový počet vlastněné kryptoměny: {sum}</Typography>
        <Divider />

        <Grid container columns={1} spacing={1} paddingTop="2%">
          <Grid item xs={1}><Typography variant="h5" textAlign="center">Profit/Lose</Typography></Grid>
          <Grid container columns={1} spacing={2}>
            <Grid item xs={1}>
              <Typography color={profitloss >= 0 ? green[500] : red[900]} variant="h4" paddingBottom="0.5%"><NumericFormat value={Math.round(profitloss * 100) / 100} displayType="text" thousandSeparator=" " decimalSeparator="," /> Kč</Typography>
              <Typography color={profitloss >= 0 ? green[500] : red[900]} variant="h4" paddingBottom="2%"><NumericFormat value={Math.round(profitloss / ref.current * 100 * 100) / 100} displayType="text" thousandSeparator=" " decimalSeparator="," /> %</Typography><Divider />
            </Grid>
          </Grid>
          <Grid item xs={1}><Typography variant="h5" textAlign="center">Aktuální data</Typography></Grid>
          <Grid container columns={1} spacing={2}>
            <Grid item xs={1}>
              <Typography paddingTop="2%">Price for one: <NumericFormat value={curPrice} displayType="text" thousandSeparator=" " decimalSeparator="," />  Kč</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography>Price vlastněných total: <NumericFormat value={Math.round(curPrice * sum * 100) / 100} displayType="text" thousandSeparator=" " decimalSeparator="," />  Kč</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography>Market cap: <NumericFormat value={curMCap} displayType="text" thousandSeparator=" " decimalSeparator="," />  Kč</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography paddingBottom="2%">Total volume: <NumericFormat value={curTVolume} displayType="text" thousandSeparator=" " decimalSeparator="," />  Kč</Typography><Divider />
            </Grid>
          </Grid>
        </Grid>   
        {cryptos.map(crypto =>
        (<Grid container columns={1} spacing={1}>
          <Grid item xs={1} textAlign="center">
            <Typography variant="h5" paddingTop="2%">{crypto.value} {cName} koupený dne {moment(crypto.timestamp).format("D MMMM YYYY")}</Typography><Button onClick={() => deleteFromDb(crypto.id)}>Delete</Button>
            <Grid container columns={1} spacing={2}>
              <Grid item xs={1} >
                <Typography paddingTop="2%">Price for one v den koupě: <NumericFormat value={Math.round(crypto.historical_price * 100) / 100} displayType="text" thousandSeparator=" " decimalSeparator="," /> Kč</Typography>
              </Grid>
              <Grid item xs={1} >
                <Typography>Price vlastněných total v den koupě: <NumericFormat value={Math.round(crypto.historical_price * crypto.value * 100) / 100} displayType="text" thousandSeparator=" " decimalSeparator="," /> Kč</Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography paddingTop="2%" paddingBottom="4%">Price vlastněných total dnes: <NumericFormat value={Math.round(curPrice * crypto.value * 100) / 100} displayType="text" thousandSeparator=" " decimalSeparator="," /> Kč</Typography><Divider />
              </Grid>
              <Grid>
                <CryptoChart data={histoData}/>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        ))}
      </div>
    );
  }
  else {
    return back;
  }
};

