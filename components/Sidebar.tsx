import {
  Autocomplete,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { useUserContext } from "./userContext";

export const Sidebar: React.FC = () => {
  const [data, setData] = useState<DataCryptos>([]);
  const [listItems, setListItems] = useState<Array<Listt>>([]); // useneco({ skip: !user})

  const { user } = useUserContext();
  const [numberOfCrypto, setNumberOfCrypto] = useState<number>();
  const [cryptoName, setCryptoName] = useState<string>();
  const [dateValue, setDateValue] = useState("");
  const [cryptoSymbol, setCryptoSymbol] = useState("");
  const [cryptoImg, setCryptoImg] = useState("");
  const [cryptoNameId, setCryptoNameId] = useState("");

  const [cryptos, setCryptos] = useState<DBCryptos>([]);

  type Listt = {
    name: string;
  };

  type DataCryptos = {
    map(arg0: (dat: any) => void): unknown;
    symbol: string;
    name: string;
  };

  type DBCryptos = {
    //data z databaze
    map(arg0: (crypto: any) => JSX.Element): import("react").ReactNode;
    id: string;
    name: string;
  };

  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=200&page=1&sparkline=false";

    const cachedData = useMemo(() => {
      if (typeof window !== "undefined") {
        const cachedItem = localStorage.getItem(url);
        if (cachedItem) {
          const { data, timestamp } = JSON.parse(cachedItem);
          if (Date.now() - timestamp < 150000) {
            return data;
          }
        }
      }
      return null;
    }, [url]);
  
    useEffect(() => {
      if (cachedData) {
        setData(cachedData);
      } else {
        axios.get(url).then((response) => {
          setData(response.data);
          if (typeof window !== "undefined") {
            localStorage.setItem(
              url,
              JSON.stringify({ data: response.data, timestamp: Date.now() })
            );
          }
        });
      }
    }, [url, cachedData]);

  useEffect(() => {
    const collectionRef = collection(db, "cryptocurrencies");
    const q = query(collectionRef); //, orderBy("value")
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setCryptos(
        querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    //vykonana se vicekrat [data] nebo vubec [cokoliv]
    data.map((dat) => {
      listItems.push(dat.name);
      console.log("data se pushli");
    });
  }, [data]);

  useEffect(() => {
    data.map((dat) => {
      if (cryptoName == dat.name) {
        setCryptoSymbol(dat.symbol);
        setCryptoImg(dat.image);
        setCryptoNameId(dat.id);
      }
    });
  }, [cryptoName]);

  const onSubmit = (e: any) => {
    e.preventDefault();
  };

  const isNotInFuture = (dateValue: string) => {
    if (dateValue != null && dateValue != "") {
      const inputDate = new Date(dateValue);
      const now = new Date();

      if (inputDate > now) {
        console.log("Datum je v budoucnu");
        return false;
      } else {
        return true;
      }
    }
  };

  const div = (
    <div>
    </div>
  );

  if (user) {
    const pushToDb = async () => {
      if (!isNaN(numberOfCrypto) && numberOfCrypto > 0 && isNotInFuture(dateValue)) {

        const docRef = await addDoc(collection(db, "cryptocurrencies"), {
          img: cryptoImg,
          name: cryptoName,
          symbol: cryptoSymbol,
          timestamp: dateValue,
          userId: user.user.uid,
          value: numberOfCrypto,
          nameId: cryptoNameId,
        });

      } else {
        console.log("value neni cislo nebo je zaporne nebo nula nebo je datum v budoucnu");
      }
    };

    return (
      <div>
        <br />
        <Stack
          component="form"
          spacing={2}
          margin="0 0.7rem"
          onSubmit={onSubmit}
        >
          <Typography variant="h5">Přidání kryptoměny</Typography>
          <Autocomplete
            id="aucomp"
            options={listItems}
            autoComplete={true}
            renderInput={(params) => (
              <TextField {...params} label="Kryptoměny" />
            )}
            onChange={(event, value) => setCryptoName(value)}
          />
          <TextField
            required
            label="Počet měny"
            variant="outlined"
            type="number"
            onChange={(e) => setNumberOfCrypto(e.target.value)}
            
            inputProps={{
              step: "0.00001",
              min: "0.00001"
            }}
          />
          <TextField
            required
            id="date"
            label="Datum zakoupení"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(e) => setDateValue(e.target.value)}
          />
          <Button
            id="btn"
            variant="contained"
            type="submit"
            onClick={() => pushToDb()}
          >
            Potvrdit
          </Button>
        </Stack>
      </div>
    );
  } else return div;
};
