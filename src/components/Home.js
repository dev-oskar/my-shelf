// Core imports
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Firebase imports
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase.js";
import { uid } from "uid";
import { set, ref, onValue, remove, update } from "firebase/database";

// Style related imports
import "./home.css";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckIcon from "@mui/icons-material/Check";

export default function Home() {
  const [book, setBook] = useState("");
  const [books, setBooks] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempUidd, setTempUidd] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // read from the database
        onValue(ref(db, `/${auth.currentUser.uid}`), (snapshot) => {
          setBooks([]);
          const data = snapshot.val();
          if (data !== null) {
            Object.values(data).map((book) => {
              setBooks((oldArray) => [...oldArray, book]);
            });
          }
        });
        // if user is not logged in then navigate to landing page
      } else if (!user) {
        navigate("/");
      }
    });
  }, []);

  // signout
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  // create an entry
  const writeToDatabase = () => {
    const uidd = uid();
    set(ref(db, `/${auth.currentUser.uid}/${uidd}`), {
      book: book,
      uidd: uidd,
    });

    setBook("");
  };

  // update
  const handleUpdate = (book) => {
    setIsEdit(true);
    setBook(book.book);
    setTempUidd(book.uidd);
  };

  const handleEditConfirm = () => {
    update(ref(db, `/${auth.currentUser.uid}/${tempUidd}`), {
      book: book,
      tempUidd: tempUidd,
    });

    setBook("");
    setIsEdit(false);
  };

  // delete
  const handleDelete = (uid) => {
    remove(ref(db, `/${auth.currentUser.uid}/${uid}`));
  };

  return (
    <div className="home">
      <input
        className="add-edit-input"
        type="text"
        placeholder="Add book..."
        value={book}
        onChange={(e) => setBook(e.target.value)}
      />

      <h1 class="text-3xl font-bold italic">Books read:</h1>
      {books.map((book, index) => (
        <div className="book" key={book.uidd}>
          <h1>{book.book}</h1>
          <EditIcon
            fontSize="large"
            onClick={() => handleUpdate(book)}
            className="edit-button"
          />
          <DeleteIcon
            fontSize="large"
            onClick={() => handleDelete(book.uidd)}
            className="delete-button"
          />
        </div>
      ))}

      {isEdit ? (
        <div>
          <CheckIcon onClick={handleEditConfirm} className="add-confirm-icon" />
        </div>
      ) : (
        <div>
          <AddIcon onClick={writeToDatabase} className="add-confirm-icon" />
        </div>
      )}

      <h1>Books unread</h1>

      <LogoutIcon onClick={handleSignOut} className="logout-icon" />
    </div>
  );
}
