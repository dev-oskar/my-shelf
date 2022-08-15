// Core imports
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

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
  const [book, setBook] = useState({
    title: "",
    author: "",
    description: "",
    isRead: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => writeToDatabase(data);

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
  const writeToDatabase = (data) => {
    const uidd = uid();
    data.uidd = uidd;

    set(ref(db, `/${auth.currentUser.uid}/${uidd}`), data);

    // setBook("");
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
    <div className="w-full h-full">
      <ul
        className="nav nav-tabs flex flex-col md:flex-row flex-wrap list-none border-b-0 pl-0 mb-4 absolute bottom-0 left-0 right-0"
        id="tabs-tabFill"
        role="tablist"
      >
        <li className="nav-item flex-auto text-center" role="presentation">
          <a
            href="#tabs-readBooks"
            className="
              w-full
              block
              font-medium
              text-xs
              leading-tight
              uppercase
              border-x-0 border-t-0 border-b-2 border-transparent
              px-6
              py-3
              my-2
              active
              text-white
              hover:border-transparent hover:bg-white hover:bg-opacity-40 hover:backdrop-blur-md hover:rounded hover:drop-shadow-lg
              focus:border-transparent
            "
            id="tabs-home-tabFill"
            data-bs-toggle="pill"
            data-bs-target="#tabs-readBooks"
            role="tab"
            aria-controls="tabs-readBooks"
            aria-selected="true"
          >
            {/* #READ */}
            Read Books
          </a>
        </li>
        <li className="nav-item flex-auto text-center" role="presentation">
          <a
            href="#tabs-unreadBooks"
            className="
              text-white
              w-full
              block
              font-medium
              text-xs
              leading-tight
              uppercase
              border-x-0 border-t-0 border-b-2 border-transparent
              px-6
              py-3
              my-2
              hover:border-transparent hover:bg-white hover:bg-opacity-40 hover:backdrop-blur-md hover:rounded hover:drop-shadow-lg
              focus:border-transparent
            "
            id="tabs-profile-tabFill"
            data-bs-toggle="pill"
            data-bs-target="#tabs-unreadBooks"
            role="tab"
            aria-controls="tabs-unreadBooks"
            aria-selected="false"
          >
            {/* #UNREAD */}
            Unread Books
          </a>
        </li>
        <li className="nav-item flex-auto text-center" role="presentation">
          <a
            href="#tabs-addNew"
            className="
              text-white
              w-full
              block
              font-medium
              text-xs
              leading-tight
              uppercase
              border-x-0 border-t-0 border-b-2 border-transparent
              px-6
              py-3
              my-2
              hover:border-transparent hover:bg-white hover:bg-opacity-40 hover:backdrop-blur-md hover:rounded hover:drop-shadow-lg
              focus:border-transparent
            "
            id="tabs-messages-tabFill"
            data-bs-toggle="pill"
            data-bs-target="#tabs-addNew"
            role="tab"
            aria-controls="tabs-addNew"
            aria-selected="false"
          >
            {/* #ADDNEW */}
            Add new
          </a>
        </li>
      </ul>
      <div className="tab-content" id="tabs-tabContentFill">
        <div
          className="tab-pane fade show active"
          id="tabs-readBooks"
          role="tabpanel"
          aria-labelledby="tabs-home-tabFill"
        >
          <p className="font-bold text-center w-full text-3xl uppercase text-white pt-4">
            Read books
          </p>
          <div className="w-2/3 h-2/3 bg-white bg-opacity-20 backdrop-blur-lg rounded drop-shadow-lg mx-auto my-20">
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
          </div>
        </div>
        <div
          className="tab-pane fade"
          id="tabs-unreadBooks"
          role="tabpanel"
          aria-labelledby="tabs-profile-tabFill"
        >
          <p className="font-bold text-center w-full text-3xl uppercase text-white pt-4">
            Unread books
          </p>
        </div>
        <div
          className="tab-pane fade"
          id="tabs-addNew"
          role="tabpanel"
          aria-labelledby="tabs-profile-tabFill"
        >
          <p className="font-bold text-center w-full text-3xl uppercase text-white pt-4">
            Add new
          </p>
          <div className="max-w-md h-auto p-4 bg-white bg-opacity-20 backdrop-blur-lg rounded drop-shadow-lg mx-auto my-20">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group mb-6 h-auto">
                <input
                  type="text"
                  className="form-control block
                    w-full
                    px-3
                    py-1.5
                    text-base
                    font-normal
                    text-gray-700
                    bg-white bg-clip-padding
                    border border-solid border-gray-300
                    rounded
                    transition
                    ease-in-out
                    m-0
                    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                  id="idBookTitle"
                  {...register("title", { required: true, minLength: 3 })}
                  placeholder="Title"
                />
                {errors.title && <span>This field is required</span>}
              </div>
              <div className="form-group mb-6">
                <input
                  className="form-control block
                    w-full
                    px-3
                    py-1.5
                    text-base
                    font-normal
                    text-gray-700
                    bg-white bg-clip-padding
                    border border-solid border-gray-300
                    rounded
                    transition
                    ease-in-out
                    m-0
                    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                  id="idBookAuthor"
                  placeholder="Author"
                  {...register("author", { required: true, minLength: 3 })}
                />
                {errors.author && <span>This field is required</span>}
              </div>
              <div className="form-group mb-6">
                <textarea
                  className="
                    form-control
                    block
                    w-full
                    px-3
                    py-1.5
                    text-base
                    font-normal
                    text-gray-700
                    bg-white bg-clip-padding
                    border border-solid border-gray-300
                    rounded
                    transition
                    ease-in-out
                    m-0
                    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
                  "
                  id="idBookDescription"
                  rows="3"
                  placeholder="Description (optional)"
                  {...register("description", {
                    minLength: 3,
                  })}
                ></textarea>
                {errors.description && (
                  <span>Minimum 3 characters required</span>
                )}
              </div>
              <div className="form-group form-check text-center mb-6">
                <input
                  type="checkbox"
                  {...register("isRead")}
                  className="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain mr-2 cursor-pointer"
                  id="idIsRead"
                />
                <label
                  className="form-check-label inline-block text-gray-800 cursor-pointer"
                  htmlFor="idIsRead"
                >
                  Is the book read?
                </label>
              </div>
              <button
                type="submit"
                className="
                  w-full
                  px-6
                  py-2.5
                  bg-blue-600
                  text-white
                  font-medium
                  text-xs
                  leading-tight
                  uppercase
                  rounded
                  shadow-md
                  hover:bg-blue-700 hover:shadow-lg
                  focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0
                  active:bg-blue-800 active:shadow-lg
                  transition
                  duration-150
                ease-in-out"
              >
                Add
              </button>
            </form>
            {/* <input
              type="text"
              placeholder="Add book..."
              value={book}
              onChange={(e) => setBook(e.target.value)}
            /> */}
          </div>
        </div>
      </div>
      {/* {isEdit ? (
        <div>
          <CheckIcon onClick={handleEditConfirm} className="add-confirm-icon" />
        </div>
      ) : (
        <div>
          <AddIcon onClick={writeToDatabase} className="add-confirm-icon" />
        </div>
      )} */}
      {/* <LogoutIcon onClick={handleSignOut} className="logout-icon" /> */}
    </div>
  );
}
