import { Autocomplete, Button, Stack, TextField, Typography, } from "@mui/material";
import axios from "axios";
import { addDoc, collection } from "firebase/firestore";
import { NextCookies } from "next/dist/server/web/spec-extension/cookies";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { useUserContext } from "./userContext";

export const Sidebar: React.FC = () => {

  const [data, setData] = useState<DataCryptos>([]);
  const [listItems, setListItems] = useState<Array<Listt>>([]); // useneco({ skip: !user})

  const url =
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=200&page=1&sparkline=false';


  

  useEffect(() => {
    axios.get(url).then((response) => {
      setData(response.data);
    });
  }, [url]);
  useEffect(() => { //vykonana se vicekrat
    data.map(dat => {
      listItems.push(dat.name);
    });
  }, [data])

  type Listt = {
    name: string;
  };

  type DataCryptos = {
    forEach(arg0: (dat: any) => void): unknown; //data z api
    symbol: string;
    name: string;
  };

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { user, login, createUser, logout } = useUserContext();
  const [logorreg, setLogorreg] = useState<string>();
  const [numberOfCrypto, setNumberOfCrypto] = useState<number>();
  const [cryptoName, setCryptoName] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [cryptoSymbol, setCryptoSymbol] = useState('');
  const [cryptoImg, setCryptoImg] = useState('');

  const clickHandler = () => {
    const urlDate = `https://api.coingecko.com/api/v3/coins/${cryptoName}/history?date=${dateValue}`;

    console.log(urlDate);
  };

  const neco = "neco";

  useEffect(() => {
    data.map(dat => {
      if(cryptoName == dat.name ){
        setCryptoSymbol(dat.symbol);
        setCryptoImg(dat.image);
      }
    });
  },[cryptoName]);

    const pushToDb = async () => {
      const docRef = await addDoc(collection(db, "cryptocurrencies"), {
        img: cryptoImg,
        name: cryptoName,
        symbol: cryptoSymbol,
        timestamp: dateValue,
        userId: user.user.uid,
        value: numberOfCrypto
      });

    }
  


  const div = (
    <div>
      <br />
      <Button variant="outlined" onClick={() => setLogorreg('Log')}>
        Přihlášení
      </Button>
      <Button variant="outlined" onClick={() => setLogorreg('Reg')}>
        Registrace
      </Button>
    </div>
  );
  if (!user) {
    if (logorreg === 'Log') {
      return (
        <div>
          <div>
            Login
            <br />
            <TextField
              name="email"
              label="Email"
              variant="outlined"
              type="text"
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              name="password"
              label="Heslo"
              variant="outlined"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            {user ? (
              user.user.email
            ) : (
              <Button
                variant="outlined"
                onClick={() => login?.(email, password)}
              >
                Prihlas{' '}
              </Button>
            )}
          </div>
        </div>
      );
    }
    if (logorreg === 'Reg') {
      return (
        <div>
          <div>
            Registrace
            <br />
            <TextField
              name="email"
              label="Email"
              variant="outlined"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              name="password"
              label="Heslo"
              variant="outlined"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            {user ? (
              user.user.email
            ) : (
              <Button
                variant="outlined"
                onClick={() => createUser?.(email, password)}
              >
                Zaregistruj
              </Button>
            )}
          </div>
          <br />
        </div>
      );
    }
  }
  if (user) {
    return (
      <div>
        <Typography variant="body1">
          Přihlášen uživatel<br /> {user.user.email}
        </Typography>
        <div>
          {user && (
            <Button variant="outlined" onClick={() => logout?.()}>
              Odhlaš uživatele
            </Button>
          )}
          {() => setLogorreg('')}
        </div>
        <br /><br />
        <Stack component="form" spacing={2}>
          <Typography variant="h5">Přidání kryptoměny</Typography>
          <Autocomplete
            id="aucomp"
            options={listItems} //vyresit ten list nejak dava names a na ten odkaz je potreba symbol asi
            renderInput={(params) => <TextField {...params} label="Test" />}
            onChange={(event, value)=> setCryptoName(value)}
          />
          <TextField
            name="pocet"
            label="Počet měny"
            variant="outlined"
            type="number"
            onChange={(e) => setNumberOfCrypto(e.target.value)}
          />
          <TextField
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
          >Potvrdit</Button>
        </Stack >
      </div>
    );
  }
  return div;
}

