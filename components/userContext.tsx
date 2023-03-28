import { initializeApp } from "firebase/app";
import {
  Auth,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";

export type User = {
  user: FirebaseUser;
  data: any;
};

const firebaseConfig = {
  apiKey: "AIzaSyDUt8qU8081Wri5TRLAaxUnRNG4nPz_3fA",
  authDomain: "crypto-mat-bc6e4.firebaseapp.com",
  projectId: "crypto-mat-bc6e4",
  storageBucket: "crypto-mat-bc6e4.appspot.com",
  messagingSenderId: "404842140518",
  appId: "1:404842140518:web:92f2454cf9e84fe1f12ea7",
  measurementId: "G-VFEFLQKNXP",
};

type UserResult = { user: User; error?: string } | { error: string; user?: undefined };

export type UserContextProps = {
  user?: User | null;
  loading: boolean;
  logout?: () => Promise<void>;
  login?: (username: string, password: string) => Promise<UserResult>
  createUser?: (username: string, password: string) => Promise<UserResult>;
  userExists?: (username: string) => Promise<boolean>;
  deleteUser?: (password: string) => Promise<void>;
};

export let auth: Auth;

const UserContext = React.createContext<UserContextProps>({
  user: null,
  loading: false,
});



const login = async (username: string, password: string): Promise<UserResult> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, username, password);
      return { user: createFullUser(cred.user) };
    } catch (error) {
      return { error: (error as Error).message };
    }
  };

const logout = async () => {
  return signOut(auth);
};

const createUser = async (username: string, password: string): Promise<UserResult> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, username, password);
      return { user: createFullUser(cred.user) };
    } catch (error) {
      return { error: (error as Error).message };
    }
  };

const deleteUser = async (password: string) => {
  const email = auth?.currentUser?.email;
  if (!email) {
    throw new Error("Action has failed");
  }
  await signInWithEmailAndPassword(auth, email, password);
  await auth!.currentUser?.delete();
};

const userExists = async (email: string) => {
  try {
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    return signInMethods.length > 0;
  } catch (error) {
    if ((error as Error).message !== "auth/invalid-email") {
      throw error;
    }
    return false;
  }
};

const initializeFirebase = () => {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
};

const defaultState: Pick<UserContextProps, "user" | "loading"> = {
  loading: true,
};

const createFullUser = (user: FirebaseUser): User => {
  return {
    user,
    data: {
      /* any data */
    },
  };
};

interface UserContProps {
    children: any;
  }

export const UserContextProvider: React.FC<UserContProps> = ({ children }) => {
  const [{ loading, user }, setUser] = useState(defaultState);

  useEffect(() => {
    initializeFirebase();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser({ loading: false, user: user ? createFullUser(user) : null });
      // @ts-ignore - for dev purposes
      window.dpdLogout = user
        ? () => logout().then(() => console.log("User has logout."))
        : () => console.log("No one was here..");
    });
    return () => unsubscribe();
  }, []);
  const hasUser = !loading && !!user;
  return (
    <UserContext.Provider
      value={{
        user,
        logout: hasUser ? logout : undefined,
        login: hasUser ? undefined : login,
        createUser: hasUser ? undefined : createUser,
        userExists: hasUser ? undefined : userExists,
        deleteUser: hasUser ? deleteUser : undefined,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  // during SSR rendering, when componenet is probed in getDataFromTree() useContext may return null;
  return useContext(UserContext) ?? (defaultState as UserContextProps);
};
