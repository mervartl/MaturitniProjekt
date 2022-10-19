import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "@firebase/firestore";
import { db } from "../firebase";

export const InputCrypto:React.FC = () => {
    const [todos, setTodos] = useState([]);
    useEffect(() => {
        const collectionRef = collection(db, "todos")

        const q = query(collectionRef, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            setTodos(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, timestamp: doc.data().timestamp?.toDate().getTime()})))
        });
        return unsubscribe;
    }, [])
    const div = <div>
        {todos.map(todo=><div key={todo.id}>{todo.title}</div>)}
    </div>

    return div;
}
