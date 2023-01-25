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
  CollectionReference,
  doc,
  DocumentData,
  FieldValue,
  increment,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { useUserContext } from "./userContext";

export const Sidebar: React.FC = () => {
  const [data, setData] = useState<DataCryptos>([]);
  const [listItems, setListItems] = useState<Array<Listt>>([]); // useneco({ skip: !user})

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { user, login, createUser, logout } = useUserContext();
  const [logorreg, setLogorreg] = useState<string>();
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

  useEffect(() => {
    axios.get(url).then((response) => {
      setData(response.data);
    });
  }, []);

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
      <br />
      <Button variant="outlined" onClick={() => setLogorreg("Log")}>
        Přihlášení
      </Button>
      <Button variant="outlined" onClick={() => setLogorreg("Reg")}>
        Registrace
      </Button>
    </div>
  );
  if (!user) {
    if (logorreg === "Log") {
      return (
        <div>
          <div>
            <Button onClick={() => setLogorreg("")}>Zpět</Button>
            <Typography variant="h4">Přihlášení</Typography>
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
                Prihlas{" "}
              </Button>
            )}
          </div>
        </div>
      );
    }
    if (logorreg === "Reg") {
      return (
        <div>
          <div>
            <Button onClick={() => setLogorreg("")}>Zpět</Button>
            <Typography variant="h4">Registrace</Typography>
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
            renderInput={(params) => (
              <TextField {...params} label="Kryptoměny" />
            )}
            onChange={(event, value) => setCryptoName(value)}
          />
          <TextField
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
