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


//Definice typů pro uchování dat o kryptoměnách
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

  // useStates pro uchování dat, získání userContextu
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

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  //URL pro získání dat z API
  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=200&page=1&sparkline=false";

  //Získání dat z cache
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

  //Načítání kryptoměn z API případně z cache
  useEffect(() => {
    if (getCachedData) { //Pokud máme v cache data, tak je nastavíme
      setData(getCachedData);
    } else { //Jinak získáme data z API pomocí axios a uložíme je do cache
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

  //Získávání dat z databáze
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


  //Nastavení seznamu položek na základě dat
  useEffect(() => {
    const items = data.map((d) => ({ name: d.name, img: d.image }));
    setListItems(items);
  }, [data]);

  //Nastavení symbolu, obrázku a id kryptoměny podle jména
  useEffect(() => {
    const selectedCrypto = data.find((d) => d.name === cryptoName);
    if (selectedCrypto) {
      setCryptoSymbol(selectedCrypto.symbol);
      setCryptoImg(selectedCrypto.image);
      setCryptoNameId(selectedCrypto.id);
    }
  }, [cryptoName, data]);

  //Funkce pro zpracování formuláře a přidání kryptoměny do databáze
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    pushToDb();
  };

  //Funkce pro kontrolu validního datumu
  const isNotInFuture = async (dateValue: string) => {
    if (dateValue) {
      const inputDate = new Date(dateValue);
      const now = new Date();
      let localMinDate;
  
      await axios.get(`https://api.coingecko.com/api/v3/coins/${cryptoNameId}/market_chart?vs_currency=czk&days=max&interval=daily`).then((response) => {
        localMinDate = response.data.prices[0][0];
      });
  
      if (localMinDate) {
        if (inputDate > now) {
          setErrorMessage("Datum je v budoucnosti! Zadej správné datum.");
        }
        if (inputDate < localMinDate) {
          setErrorMessage("Datum je v minulosti! Zadej správné datum.");
        }
        return inputDate <= now && inputDate >= localMinDate;
      }
    }
    return false;
  };

  //Kontrola validního čísla
  const isPositiveNumber = (value: number) => {
    return !isNaN(value) && value > 0;
  };

  //Funkce pro přidání do databáze
  const pushToDb = async () => {
    console.log(dateValue);
    if (numberOfCrypto && isPositiveNumber(numberOfCrypto) && await isNotInFuture(dateValue)) {
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
      console.log("Číslo nebo datum není validní.");
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