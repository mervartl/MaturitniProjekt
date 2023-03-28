import { Button, Divider, Grid, Typography } from "@mui/material";
import axios from "axios";
import { collection, query, onSnapshot, where, doc, deleteDoc } from "firebase/firestore";
import { useUserContext } from "./userContext";
import moment from "moment";
import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../firebase";
import { NumericFormat } from 'react-number-format';
import { green, red } from "@mui/material/colors";
import { HistoricChart } from "./HistoricChart";
import { Chart } from "./Chart";

interface DetailComponentProps {
  setDtail: (value: boolean) => void;
  cName: string;
}

export const DetailComponent: React.FC<DetailComponentProps> = ({ setDtail, cName }) => {
  const { user } = useUserContext()

  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [histoData, setHistoData] = useState<HistoData>();
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

  type HistoData = {
    prices: [number, number | null][];
    market_caps: [number, number | null][];
    total_volumes: [number, number | null][];
  };
  

  type Crypto = {
    id: string;
    name?: string;
    userId?: string;
    nameId: any;
    img: any;
    value: any;
    timestamp: any;
    historical_price?: any;
    historical_tvolume?: any;
    historical_mcap?: any;
  };

  useEffect(() => {
    if (user?.user.uid) {
      console.log(user.user.uid);
      const collectionRef = collection(db, "cryptocurrencies");
      const q = query(collectionRef, where("userId", "==", user.user.uid), where("name", "==", cName));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setCryptos(
          querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Crypto))
        );
      });
      return unsubscribe;
    }
  }, [user?.user.uid]);

  useEffect(() => {
    cryptos.forEach((crypto) => {
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
        await axios.get(`/api/proxy?url=${encodeURIComponent(url)}`).then((response) => {
          setCurData(response.data);
          localStorage.setItem(
            url,
            JSON.stringify({ data: response.data, timestamp: Date.now() })
          );
        });
      }
      if(curData) {
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

  const getHistoData = async () => {
    if (hisUrl.match(regex)) {
      if (cachedHistoData) {
        setHistoData(cachedHistoData);
      } else {
        await axios.get(`/api/proxy?url=${encodeURIComponent(hisUrl)}`).then((response) => {
          setHistoData(response.data);
          localStorage.setItem(
            hisUrl,
            JSON.stringify({ data: response.data, timestamp: Date.now() })
          );
        });
      }
    }
  };

  
  useEffect(() => {
    getHistoData();
  }, [hisUrl, cachedHistoData]);


  const deleteFromDb = async (id: string) => {
    const docRef = doc(db, "cryptocurrencies", id);
    deleteDoc(docRef)
      .then(() => {
        console.log("Kryptoměny byla odstraněna");
        setDtail(false);
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
    if (sum && hPriceAssigned && curPrice) {
      cryptos.forEach(crypto => {
        ref.current = ref.current + (crypto.value * crypto.historical_price);
      });

      setProfitloss((curPrice * sum) - ref.current);
    }
  }, [hPriceAssigned, curPrice]);


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
          <Grid item xs={1}><Typography variant="h5" textAlign="center">Celkový Profit/Lose</Typography></Grid>
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
              <Typography>Total volume: <NumericFormat value={curTVolume} displayType="text" thousandSeparator=" " decimalSeparator="," />  Kč</Typography>
            </Grid>
            <Grid item xs={1} paddingBottom="2%">
              <Chart data={histoData?.prices} profitloss={profitloss}/><Divider />
            </Grid>
          </Grid>
        </Grid>   
        {cryptos.map(crypto =>
        (<Grid container columns={1} spacing={1} key={crypto.id}>
          <Grid item xs={1} textAlign="center">
            <Typography variant="h5" paddingTop="2%" >{crypto.value} {cName} <img src={img} height="20px"></img> koupený dne {moment(crypto.timestamp).format("D MMMM YYYY")}</Typography><Button onClick={() => deleteFromDb(crypto.id)}>Delete</Button>
            <Grid container columns={1} spacing={2}>
              <Grid item xs={1}>
              <Typography variant="h5" textAlign="center">Profit/Lose</Typography>
                <Typography color={(curPrice * crypto.value - crypto.historical_price * crypto.value) >= 0 ? green[500] : red[900]} variant="h4" paddingBottom="0.5%"><NumericFormat value={Math.round((curPrice * crypto.value - crypto.historical_price * crypto.value) * 100) / 100} displayType="text" thousandSeparator=" " decimalSeparator="," /> Kč</Typography>
                <Typography color={(curPrice * crypto.value - crypto.historical_price * crypto.value) >= 0 ? green[500] : red[900]} variant="h4"><NumericFormat value={Math.round((curPrice * crypto.value - crypto.historical_price * crypto.value) / (crypto.value * crypto.historical_price) * 100 * 100) / 100} displayType="text" thousandSeparator=" " decimalSeparator="," /> %</Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography paddingTop="1%">Price for one v den koupě: <NumericFormat value={Math.round(crypto.historical_price * 100) / 100} displayType="text" thousandSeparator=" " decimalSeparator="," /> Kč</Typography>
              </Grid>
              <Grid item xs={1} >
                <Typography>Price vlastněných total v den koupě: <NumericFormat value={Math.round(crypto.historical_price * crypto.value * 100) / 100} displayType="text" thousandSeparator=" " decimalSeparator="," /> Kč</Typography>
              </Grid>
              <Grid item xs={1} paddingTop="2%">
                <Typography>Price vlastněných total dnes: <NumericFormat value={Math.round(curPrice * crypto.value * 100) / 100} displayType="text" thousandSeparator=" " decimalSeparator="," /> Kč</Typography>
              </Grid>
              <Grid item xs={1} paddingBottom="4%">
                <HistoricChart data={histoData?.prices} timestamp={crypto.timestamp} profitloss={(curPrice * crypto.value - crypto.historical_price * crypto.value)}/><Divider />
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

