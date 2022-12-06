import { Autocomplete, Box, Button, Stack, TextField, Typography, } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useUserContext } from "./userContext";
import Moment from 'moment';

export const Sidebar: React.FC = () => {

  const [data, setData] = useState<DataCryptos>([]);
  const [listItems, setListItems] = useState<Array<Listt>>([]); // useneco({ skip: !user})

  const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=200&page=1&sparkline=false';

  useEffect(() => {
    axios.get(url).then((response) => {
      setData(response.data);
    });
  }, [url]);
  useEffect(() => { //vykonana ve vicekrat
    data.forEach(dat => {
      
      //ten array data ma dve ty a ono to projede jen posledni z tech dvou arrayi
    });
  }, [data]);

  /*dat.forEach(da => {
        //listItems.push(dat.id);
        setListItems([
          ...listItems,
          createItem(
            da.image,
            da.name,
            da.id
          ),
        ]);
      });*/

console.log(data);

  type Listt = {
    img: string;
    name: string;
    id: string;
  };

  type DataCryptos = {
    forEach(arg0: (dat: any) => void): unknown; //data z api
    symbol: string;
    name: string;
    id: string;
  };

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { user, login, createUser, logout } = useUserContext();
  const [logorreg, setLogorreg] = useState<string>();
  const [numberOfCrypto, setNumberOfCrypto] = useState<number>();
  const [cryptoValue, setCryptoValue] = useState('');
  const [dateValue, setDateValue] = useState('');

  const clickHandler = () => {
    const dateV = Moment(dateValue).format('DD-MM-yyyy');
    const urlDate = `https://api.coingecko.com/api/v3/coins/${cryptoValue}/history?date=${dateV}`;
    console.log(urlDate);
  };

  const createItem = (
    img: string,
    name: string,
    id: string,
  ) => {
    return {
      img,
      name,
      id
    };
  };

console.log(listItems);
  


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
              Odhlásit
            </Button>
          )}
          {() => setLogorreg('')}
        </div>
        <br /><br />
        <Stack component="form" spacing={2}>
          <Typography variant="h5">Přidání kryptoměny</Typography>
          <Autocomplete
            id="aucomp"
            options={listItems} //vyresit ten list nejak dava names
            renderInput={(params) => <TextField {...params} label="Test" />}
            renderOption={(props, option) => (
              <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                <img
                  loading="lazy"
                  width="20"
                  src={option.img}
                  alt="ikona"
                />
                {option.name}
              </Box>
            )}
            onChange={(event, value)=> setCryptoValue(value)}
            //getOptionLabel={(option) => option.name}
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
            inputFormat="dd mm yyyy"
            onChange={(e) => setDateValue(e.target.value)}
          />
          <Button
            id="btn"
            variant="contained"
            type="submit"
            onClick={() => clickHandler()}
          >Potvrdit</Button>
        </Stack >
      </div>
    );
  }
  return div;
}

