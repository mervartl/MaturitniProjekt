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


//Definice typů
interface DetailComponentProps {
  setDtail: (value: boolean) => void;
  cName: string;
}

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

export const DetailComponent: React.FC<DetailComponentProps> = ({ setDtail, cName }) => {

  //useStates pro získání userContextu, uchovávání dat a stavu aplikace(dtail) 
  const { user } = useUserContext()

  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [histoData, setHistoData] = useState<HistoData>();
  const [curData, setCurData] = useState<any | null>();
  const [sum, setSum] = useState<number>();

  const [curPrice, setCurPrice] = useState(null);
  const [curMCap, setCurMCap] = useState(null);
  const [curTVolume, setCurTVolume] = useState(null);
  const [curPriceChange24h, setCurPriceChange24h] = useState<number>();
  const [curPriceChange30d, setCurPriceChange30d] = useState<number>();
  const [curPriceChange1y, setCurPriceChange1y] = useState<number>();
  const [rank, setRank] = useState(null);

  const [img, setImg] = useState("");
  const [urlId, setUrlId] = useState();

  const [hPriceAssigned, setHPriceAssigned] = useState<boolean>(false);
  const [hMCapAssigned, setHMCapAssigned] = useState<boolean>(false);
  const [hTVolAssigned, setHTVolAssigned] = useState<boolean>(false);

  const [url, setUrl] = useState<string>("");
  const [hisUrl, setHisUrl] = useState(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=200&page=1&sparkline=false"
  );
  const ref = useRef(0);

  const [profitloss, setProfitloss] = useState<number>();


  //Získávání dat z databáze
  useEffect(() => {
    if (user?.user.uid) {
      const collectionRef = collection(db, "cryptocurrencies");
      const q = query(collectionRef, where("userId", "==", user.user.uid), where("name", "==", cName));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setCryptos(
          querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Crypto))
        );
        updateData();
      });
      return unsubscribe;
    }
  }, [user?.user.uid]);

  const updateData = async () => {
    getCurData();
    getHistoData();
  };

  //Nastavení id, obrázku a celkového počtu vlastněné kryptoměny
  useEffect(() => {
    cryptos.forEach((crypto) => {
      if (crypto.name == cName) {
        setUrlId(crypto.nameId);
        setImg(crypto.img);
      }
    });

    setSum(cryptos.reduce((acc, { value }) => acc + parseFloat(value), 0));
  }, [cryptos]);


  //Nastavení URL pro API
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

  //Získávání dat z cache
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

  //Získávání dat z cache
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

  //Nastavení aktuálních dat
  useEffect(() => {
    getCurData();
  }, [url, cachedData]);

  const regex = /\/(?!.*undefined)(.*)\?/;

  //Funkce pro získání a nastavení dat
  const getCurData = async () => {
    if (url.match(regex)) { //Zkontroluje jestli má URL správný formát
      if (cachedData) { //Pokud jsou v cache data, tak je nastavíme
        setCurData(cachedData);
      } else { //Pokud ne, získáme je z API a nastavíme a vložíme do cache
        await axios.get(url).then((response) => {
          setCurData(response.data);
          localStorage.setItem(
            url,
            JSON.stringify({ data: response.data, timestamp: Date.now() })
          );
        });
      }
      if (curData) { //Nastavíme aktuální data
        setCurPrice(curData.market_data.current_price["czk"]);
        setCurMCap(curData.market_data.market_cap["czk"]);
        setCurTVolume(curData.market_data.total_volume["czk"]);
        setCurPriceChange24h(curData.market_data.price_change_percentage_24h);
        setCurPriceChange30d(curData.market_data.price_change_percentage_30d);
        setCurPriceChange1y(curData.market_data.price_change_percentage_1y);
        setRank(curData.market_cap_rank);
      }
    }
  };


  //Nastavíme aktuální data
  useEffect(() => {
    if (curData) {
      setCurPrice(curData.market_data.current_price["czk"]);
      setCurMCap(curData.market_data.market_cap["czk"]);
      setCurTVolume(curData.market_data.total_volume["czk"]);
      setCurPriceChange24h(curData.market_data.price_change_percentage_24h);
      setCurPriceChange30d(curData.market_data.price_change_percentage_30d);
      setCurPriceChange1y(curData.market_data.price_change_percentage_1y);
      setRank(curData.market_cap_rank);
    }
  }, [curData]);


  //Funkce pro získání a nastavení historických dat
  const getHistoData = async () => {
    if (hisUrl.match(regex)) { //Zkontroluje jestli má URL správný formát
      if (cachedHistoData) { //Pokud jsou v cache data, tak je nastavíme
        setHistoData(cachedHistoData);
      } else { //Pokud ne, získáme je z API a nastavíme a vložíme do cache 
        await axios.get(hisUrl).then((response) => {
          setHistoData(response.data);
          localStorage.setItem(
            hisUrl,
            JSON.stringify({ data: response.data, timestamp: Date.now() })
          );
        });
      }
    }
  };

  //Zavolání funkce pro získání a nastavení dat
  useEffect(() => {
    getHistoData();
  }, [hisUrl, cachedHistoData]);

  //Funkce pro mazání kryptoměny z databáze
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

  //Nastavení historických dat
  useEffect(() => {
    if (histoData) {
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

                setHMCapAssigned(true);
                crypto.historical_mcap = val[1];
              }
            });
          }
          else if (key == "total_volumes") {
            value.forEach(val => {
              if (val[1] != null && val[0] == tstamp) {

                setHTVolAssigned(true);
                crypto.historical_tvolume = val[1];
              }
            });
          }
        });
      });
    }
  }, [histoData]);


  //Nastavení profit/loss
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
  if (hPriceAssigned && hMCapAssigned && hTVolAssigned && sum && curPrice && profitloss && curPriceChange24h && curPriceChange30d && curPriceChange1y) {
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
          <Grid item xs={1}><Typography paddingBottom="1%" variant="h5" textAlign="center">Aktuální data</Typography></Grid>
          <Grid container columns={1} spacing={2}>
            <Grid item xs={1}>
              <Typography>Rank kryptoměny: {rank}</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography>
                Změna ceny za 24h: <span style={{ color: curPriceChange24h >= 0 ? green[500] : red[900] }}>
                  {Math.round(curPriceChange24h * 1000) / 1000} %
                </span>
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography>
                Změna ceny za měsíc: <span style={{ color: curPriceChange30d >= 0 ? green[500] : red[900] }}>
                  {Math.round(curPriceChange30d * 1000) / 1000} %
                </span>
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography>
                Změna ceny za rok: <span style={{ color: curPriceChange1y >= 0 ? green[500] : red[900] }}>
                  {Math.round(curPriceChange1y * 1000) / 1000} %
                </span>
              </Typography>
            </Grid>
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
              <Chart data={histoData?.prices} profitloss={profitloss} /><Divider />
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
                <HistoricChart data={histoData?.prices} timestamp={crypto.timestamp} profitloss={(curPrice * crypto.value - crypto.historical_price * crypto.value)} /><Divider />
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

