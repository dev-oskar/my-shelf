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
import BookIcon from "@mui/icons-material/AutoStories";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckIcon from "@mui/icons-material/Check";

import BooksSVG from "../assets/undraw_books.svg";

export default function Home() {
  const [book, setBook] = useState({
    title: "",
    author: "",
    description: "",
    isRead: false,
  });

  // Handler for Add New form
  const onSubmit = (data) => writeToDatabase(data, false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  // Handler for Edit Modal form
  const onSubmitEdit = (data) => writeToDatabase(data, true);
  const {
    register: registerTemp,
    formState: { errors: errorsTemp },
    handleSubmit: handleSubmitTemp,
    reset: resetTemp,
    setValue: setTempValue,
  } = useForm();

  const [readBooks, setReadBooks] = useState([]);
  const [unreadBooks, setUnreadBooks] = useState([]);
  const [tempBook, setTempBook] = useState({
    title: "",
    author: "",
    description: "",
    isRead: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // read from the database
        onValue(ref(db, `/${auth.currentUser.uid}`), (snapshot) => {
          setReadBooks([]);
          setUnreadBooks([]);
          const data = snapshot.val();
          if (data !== null) {
            Object.values(data).map((book) => {
              if (book.isRead) {
                setReadBooks((oldArray) => [...oldArray, book]);
              } else {
                setUnreadBooks((oldArray) => [...oldArray, book]);
              }
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

  // book clicked
  const onBookClicked = (book) => {
    setTempBook(book);
    setTempValue("title", book.title, { shouldTouch: true });
    setTempValue("author", book.author, { shouldTouch: true });
    setTempValue("description", book.description, { shouldTouch: true });
    setTempValue("isRead", book.isRead, { shouldTouch: true });
  };

  // create an entry
  const writeToDatabase = (data, isUpdating) => {
    let uidd = "";
    if (isUpdating == false) {
      uidd = uid();
      data.uidd = uidd;

      // do the set request
      if (uidd) {
        try {
          set(ref(db, `/${auth.currentUser.uid}/${uidd}`), data);
        } catch (error) {
          console.error(error);
        } finally {
          // additionaly reset form after save to database
          reset();
        }
      } else {
        console.error("Invalid tempBook.uidd provided");
      }
    } else {
      uidd = tempBook.uidd;
      data.uidd = uidd;

      if (uidd) {
        try {
          update(ref(db, `/${auth.currentUser.uid}/${uidd}`), data);
        } catch (error) {
          console.error(error);
        } finally {
          // additionaly reset form after save to database
          resetTemp();
          document.getElementById("idModalCloseBtn").click();
        }
      } else {
        console.error("Invalid tempBook.uidd provided");
      }
    }
  };

  // delete
  const handleDelete = (tempBook) => {
    if (tempBook.uidd) {
      let uid = tempBook.uidd;
      remove(ref(db, `/${auth.currentUser.uid}/${uid}`));
    }
  };

  return (
    <div className="w-full h-full">
      <div
        className="modal fade fixed top-0 left-0 hidden w-full h-full outline-none overflow-x-hidden overflow-y-auto"
        id="idModal"
        tabIndex="-1"
        aria-labelledby="idModal"
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable relative w-auto pointer-events-none">
          <div className="modal-content border-none shadow-lg relative flex flex-col w-full pointer-events-auto bg-white bg-clip-padding rounded-md outline-none text-current">
            <div className="modal-header flex flex-shrink-0 items-center justify-between p-4 border-b border-gray-200 rounded-t-md">
              <h5
                className="text-xl font-medium leading-normal text-gray-800"
                id="idModalLabel"
              >
                Editing book
              </h5>
              <button
                type="button"
                id="idModalCloseBtn"
                className="btn-close box-content w-4 h-4 p-1 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body relative p-4">
              <form onSubmit={handleSubmitTemp(onSubmitEdit)}>
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
                    id="idTempBookTitle"
                    {...registerTemp("title", { required: true, minLength: 3 })}
                    placeholder="Title"
                  />
                  {errorsTemp.title && <span>This field is required</span>}
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
                    id="idBookAuthorTemp"
                    placeholder="Author"
                    {...registerTemp("author", {
                      required: true,
                      minLength: 3,
                    })}
                  />
                  {errorsTemp.author && <span>This field is required</span>}
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
                    id="idBookDescriptionTemp"
                    rows="3"
                    placeholder="Description (optional)"
                    {...registerTemp("description", {
                      minLength: 3,
                    })}
                  ></textarea>
                  {errorsTemp.description && (
                    <span>Minimum 3 characters required</span>
                  )}
                </div>
                <div className="form-group form-check text-center">
                  <input
                    type="checkbox"
                    {...registerTemp("isRead")}
                    className="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain mr-2 cursor-pointer"
                    id="idIsReadTemp"
                  />
                  <label
                    className="form-check-label inline-block text-gray-800 cursor-pointer"
                    htmlFor="idIsReadTemp"
                  >
                    Is the book read?
                  </label>
                </div>
                <div className="modal-footer flex flex-shrink-0 flex-wrap items-center justify-end p-4 border-t border-gray-200 rounded-b-md">
                  {/* <button
                    onClick={handleDelete(tempBook)}
                    type="button"
                    className="inline-block px-6 py-2.5 bg-red-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-red-700 hover:shadow-lg focus:bg-red-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-800 active:shadow-lg transition duration-150 ease-in-out"
                  >
                    Delete
                  </button> */}
                  <button
                    type="button"
                    className="inline-block px-6 py-2.5 bg-purple-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-purple-700 hover:shadow-lg focus:bg-purple-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-purple-800 active:shadow-lg transition duration-150 ease-in-out"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out ml-1"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ul
        className="nav nav-tabs flex flex-col md:flex-row flex-wrap list-none border-b-0 pl-0 absolute bottom-0 left-0 right-0 p-4 bg-white bg-opacity-20 backdrop-blur-lg rounded drop-shadow-lg"
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
              text-slate-800
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
              text-slate-800
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
              text-slate-800
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
          {/* <div className=""> */}
          {/* <div className="grow-0 shrink-1 md:shrink-0 basis-auto xl:w-6/12 lg:w-6/12 md:w-9/12 mb-12 md:mb-0">
            <img className="w-72 h-72" src={BooksSVG} />
          </div> */}
          <p className="font-medium leading-tight text-5xl mt-0 mb-2 text-slate-800 pt-4 text-center">
            Read books
          </p>
          <div className="w-2/3 h-2/3 bg-violet-500 shadow-lg p-2 bg-opacity-20 backdrop-blur-lg rounded drop-shadow-lg mx-auto my-10 overflow-auto">
            {readBooks.map((book) => (
              <div
                className="m-2
                  p-2
                  bg-white
                  bg-opacity-20 
                  backdrop-blur-lg
                  drop-shadow-lg 
                  mx-auto 
                  cursor-pointer
                  hover:bg-dark 
                  hover:bg-opacity-40
                  hover:border
                  hover:border-slate-800
                  font-medium text-xs leading-tight uppercase rounded shadow-md hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out
                  "
                data-bs-toggle="modal"
                data-bs-target="#idModal"
                key={book.uidd}
                onClick={() => onBookClicked(book)}
              >
                <div className="w-full inline-flex">
                  <BookIcon fontSize="large" className="mr-2 text-slate-800" />
                  <p className="text-2xl font-semibold tracking-wider text-slate-800">
                    {book.title}
                  </p>
                </div>
                <p className="w-full text-lg text-slate-700">{book.author}</p>
                <p className="w-full text-md text-slate-600 h-6 text-ellipsis overflow-hidden whitespace-nowrap">
                  {book.description}
                </p>
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
          <p className="font-medium leading-tight drop-shadow-md text-5xl mt-0 mb-2 text-slate-800 pt-4 text-center">
            Unread books
          </p>
          <div className="w-2/3 h-2/3 bg-violet-500 shadow-lg p-2 bg-opacity-20 backdrop-blur-lg rounded drop-shadow-lg mx-auto my-10 overflow-auto">
            {unreadBooks.map((book) => (
              <div
                className="m-2
                  p-2
                  bg-white
                  bg-opacity-20 
                  backdrop-blur-lg
                  drop-shadow-lg 
                  mx-auto 
                  cursor-pointer
                  hover:bg-dark 
                  hover:bg-opacity-40
                  hover:border
                  hover:border-slate-800
                  font-medium text-xs leading-tight uppercase rounded shadow-md hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out
                  "
                data-bs-toggle="modal"
                data-bs-target="#idModal"
                key={book.uidd}
                onClick={() => onBookClicked(book)}
              >
                <div className="w-full inline-flex">
                  <BookIcon fontSize="large" className="mr-2 text-slate-800" />
                  <p className="text-2xl font-semibold tracking-wider text-slate-800">
                    {book.title}
                  </p>
                </div>
                <p className="w-full text-lg text-slate-700">{book.author}</p>
                <p className="w-full text-md text-slate-600 h-6 text-ellipsis overflow-hidden whitespace-nowrap">
                  {book.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div
          className="tab-pane fade"
          id="tabs-addNew"
          role="tabpanel"
          aria-labelledby="tabs-profile-tabFill"
        >
          <p className="font-medium leading-tight text-5xl mt-0 mb-2 text-slate-800 pt-4 text-center">
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
                  text-slate-800
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
      <LogoutIcon onClick={handleSignOut} className="logout-icon" />
    </div>
  );
}
