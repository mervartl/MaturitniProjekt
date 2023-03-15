import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { addDoc, collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { useUserContext } from "./userContext";

export const Sidebar: React.FC = () => {
  const [listItems, setListItems] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [cryptos, setCryptos] = useState<any[]>([]);
  const { user } = useUserContext();
  const [numberOfCrypto, setNumberOfCrypto] = useState<number>();
  const [cryptoName, setCryptoName] = useState<string>();
  const [dateValue, setDateValue] = useState("");
  const [cryptoSymbol, setCryptoSymbol] = useState("");
  const [cryptoImg, setCryptoImg] = useState("");
  const [cryptoNameId, setCryptoNameId] = useState("");

  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=200&page=1&sparkline=false";

  const getCachedData = useMemo(() => {
    const cachedItem = typeof window !== "undefined" ? localStorage.getItem(url) : null;
    if (cachedItem) {
      const { data, timestamp } = JSON.parse(cachedItem);
      if (Date.now() - timestamp < 150000) {
        return data;
      }
    }
    return null;
  }, [url]);

  useEffect(() => {
    if (getCachedData) {
      setData(getCachedData);
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
  }, [url, getCachedData]);

  useEffect(() => {
    const collectionRef = collection(db, "cryptocurrencies");
    const q = query(collectionRef);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setCryptos(
        querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const items = data.map((d: any) => d.name);
    setListItems(items);
  }, [data]);

  useEffect(() => {
    const selectedCrypto = data.find((d) => d.name === cryptoName);
    if (selectedCrypto) {
      setCryptoSymbol(selectedCrypto.symbol);
      setCryptoImg(selectedCrypto.image);
      setCryptoNameId(selectedCrypto.id);
    }
  }, [cryptoName, data]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const isNotInFuture = (dateValue: string) => {
    if (dateValue !== null && dateValue !== "") {
      const inputDate = new Date(dateValue);
      const now = new Date();
      return inputDate <= now;
    }
    return false;
  };

  const isPositiveNumber = (value: number) => {
    return !isNaN(value) && value > 0;
  };

  const pushToDb = async () => {
    if (numberOfCrypto && isPositiveNumber(numberOfCrypto) && isNotInFuture(dateValue)) {
      const docRef = await addDoc(collection(db, "cryptocurrencies"), {
        img: cryptoImg,
        name: cryptoName,
        symbol: cryptoSymbol,
        timestamp: dateValue,
        userId: user?.user?.uid,
        value: numberOfCrypto,
        nameId: cryptoNameId,
      });
    } else {
      console.log("Value is not a positive number or date is in the future.");
    }
  };

  if (user) {
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
            onChange={(event, value) => setCryptoName(value ?? undefined)}
          />
          <TextField
            required
            label="Počet měny"
            variant="outlined"
            type="number"
            onChange={(e) => setNumberOfCrypto(Number(e.target.value))}
            inputProps={{
              step: "0.00001",
              min: "0.00001",
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
  } else {
    return null;
  }
};