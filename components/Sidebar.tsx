import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { addDoc, collection, onSnapshot, query, Timestamp } from "firebase/firestore";
import moment from "moment";
import React, { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import { useUserContext } from "./userContext";
import Alert from '@mui/material/Alert';

type CryptoData = {
  id: string;
  name: string;
  symbol: string;
  image: string;
  img: string;
};

type ListItem = {
  name: string;
  img: string;
};


type Crypto = {
  id: string;
  symbol: any;
  current_price: any;
  nameId: any;
  value: any;
  historical_price: any;
};

export const Sidebar: React.FC = () => {
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [data, setData] = useState<CryptoData[]>([]);
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const { user } = useUserContext();
  const [numberOfCrypto, setNumberOfCrypto] = useState<number>();
  const [cryptoName, setCryptoName] = useState<string>();
  const [dateValue, setDateValue] = useState(moment().format("YYYY-MM-DD"));
  const [cryptoSymbol, setCryptoSymbol] = useState("");
  const [cryptoImg, setCryptoImg] = useState("");
  const [cryptoNameId, setCryptoNameId] = useState("");

  const [minDate, setMinDate] = useState();
  const [errorMessage, setErrorMessage] = useState<string>();
  

  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=200&page=1&sparkline=false";

  const getCachedData = useMemo(() => {
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
        querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Crypto))
      );
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const items = data.map((d) => ({ name: d.name, img: d.image }));
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    pushToDb();
  };

  const isNotInFuture = (dateValue: string) => {
    if (dateValue) {
      const inputDate = new Date(dateValue);
      const now = new Date();

      axios.get(`https://api.coingecko.com/api/v3/coins/${cryptoNameId}/market_chart?vs_currency=czk&days=max&interval=daily`).then((response) => {
        const dat = response;
        setMinDate(dat.data.prices[0][0]);
      });
      if(minDate)
      {
        if(inputDate > now)
        {
          setErrorMessage("Datum je budoucnosti.");
        }
        if(inputDate < minDate)
        {
          setErrorMessage("Datum je v minulosti.");
        }

        return inputDate <= now && inputDate >= minDate;
      }     
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

  return user ? (
    <div>
      <br />
      <Stack
        component="form"
        spacing={2}
        margin="0 0.7rem"
        onSubmit={handleSubmit}
      >
        <Typography variant="h5">Přidání kryptoměny</Typography>
        <Autocomplete
          id="aucomp"
          options={listItems}
          autoComplete={true}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Kryptoměny"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    {cryptoName &&
                      listItems.find((item) => item.name === cryptoName)
                        ?.img && (
                        <img
                          src={
                            listItems.find((item) => item.name === cryptoName)
                              ?.img
                          }
                          alt={cryptoName}
                          style={{ width: "25px", marginRight: "8px" }}
                        />
                      )}
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <img
                src={option.img}
                alt={option.name}
                style={{ width: "25px", marginRight: "8px" }}
              />
              {option.name}
            </li>
          )}
          getOptionLabel={(option) => option.name}
          onChange={(event, value) => setCryptoName(value?.name ?? undefined)}
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
          value={dateValue}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(e) => setDateValue(e.target.value)}
        />
        <Button id="btn" variant="contained" type="submit">
          Potvrdit
        </Button>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
      </Stack>
    </div>
  ) : null;
};