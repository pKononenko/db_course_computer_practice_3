import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link
} from "react-router-dom";
import {login, authFetch, useAuth, logout} from "./auth";
import './App.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from 'react-modal';

Modal.setAppElement("#root");
function App() {
  const [logged] = useAuth();

  return (
    <Router>
      <div>
        <nav className="navbar navbar-expand-sm navbar-dark bg-dark" style={{backgroundColor: "#e3f2fd"}} role="navigation">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">Deadline Manager</Link>
            <div className="collapse navbar-collapse nav-items-margin" id="navbarNav">
            {!logged? <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <button type="button" className="btn btn-primary-outline" style={{color: "white"}}>Login</button>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    <button type="button" className="btn btn-primary">
                      Register
                    </button>
                  </Link>
                </li>
              </ul> :
              <button type="button" className="btn btn-danger" style={{marginLeft: "auto"}} onClick={() => logout()}>Logout</button> }
            </div>
          </div>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <PrivateRoute path="/" component={Home} />
        </Switch>
      </div>
    </Router>
  );
}

function Home() {
  //const [logged] = useAuth();
  const [subject, setSubject] = useState('');
  const [task_name, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [deadlines_list, setDeadlinesList] = useState([]);

  // Request on page loads
  useEffect((deadlines_list) => {      
    authFetch('/api/get_deadlines', {
      method: "get",
    }).then(r => r.json())
      .then(res => {
        Object.keys(res).forEach(function(key) {
          setDeadlinesList(deadlines_list => [...deadlines_list, 
            {deadline_name: res[key].deadline_name,
             deadline_id: res[key].deadline_id,
             deadline_subject: res[key].subject,
             deadline_desc: res[key].deadline_desc,
             deadline_date: res[key].deadline_date
            }]);
        });
      })
  }, []);

  const onSubmitClick = (e)=>{
    e.preventDefault()
    console.log("You pressed home")
    let data = {
      'subject': subject,
      'task_name': task_name,
      'description': description,
      'date': date
    }
    console.log(data)
    authFetch('/api/add_deadline', {
      method: 'post',
      body: JSON.stringify(data)
    }).then(r => r.json())
      .then(res => {
        if (res.message === "OK") {
          console.log("Successfuly added to db.");
          setModalAddIsOpen(false);
          
          setDeadlinesList(deadlines_list => [...deadlines_list, 
            {deadline_name: data.task_name,
             deadline_id: res.deadline_id,
             deadline_subject: data.subject,
             deadline_desc: data.description,
             deadline_date: res.deadline_date
            }]);

          setSubject('');
          setTaskName('');
          setDescription('');
          setDate(new Date());
        } else {
          alert(res.message);
        }
      })
  }

  // Delete 
  const deleteDeadline = (index) => {
    const newDeadlinesList = [...deadlines_list];
    newDeadlinesList.splice(index, 1);
    setDeadlinesList(newDeadlinesList);
  }

  // Modify
  const modifyDeadline = (props) => {
    deleteDeadline(props.index);
    setDeadlinesList(deadlines_list => [...deadlines_list, 
      {deadline_name: props.task_name,
       deadline_id: props.deadline_id,
       deadline_subject: props.subject,
       deadline_desc: props.description,
       deadline_date: props.date
      }]);
  }

  const handleSubjectChange = (e) => {
    setSubject(e.target.value)
  }

  const handleTaskNameChange = (e) => {
    setTaskName(e.target.value)
  }

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value)
  }

  // Modal
  const [modalAddIsOpen, setModalAddIsOpen] = useState(false)

  return (
    <div className = "container" style={{margin: "4% auto"}}>
      <button type="button" className="btn btn-primary" onClick={() => setModalAddIsOpen(true)}>+ Add Deadline</button>

      {/* Add deadline modal */}      
      <Modal isOpen={modalAddIsOpen}
        onRequestClose={() => setModalAddIsOpen(false)}
        style={{
          overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.75)'
          },
          content: {
            position: 'absolute',
            top: '15%',
            left: '32%',
            right: '32%',
            bottom: '15%',
            border: '1px solid #ccc',
            background: '#fff',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderRadius: '15px',
            outline: 'none',
            padding: '20px'
          }
        }}
        >
        <h2>Add Deadline</h2>
        
        <form action="#">
          <div className="mb-3">
            <label htmlFor="subject-create" className="form-label">Subject</label>
            <input type="text"
              id="subject-create"
              className="form-control"
              onChange={handleSubjectChange}
              value={subject} 
            />
          </div>
          <div className="mb-3">
            <label htmlFor="task-name-create" className="form-label">Task Name</label>
            <input type="text"
              id="task-name-create"
              className="form-control"
              onChange={handleTaskNameChange}
              value={task_name}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="description-create" className="form-label">Description</label>
            <textarea id="description-create"
              className="form-control textarea-style "
              onChange={handleDescriptionChange}
              value={description}
              rows='5'
            />
          </div>
          <div className="mb-3">
            <label htmlFor="deadline-date-create" className="form-label">Deadline Date </label>
            <DatePicker selected={date} showTimeSelect
            dateFormat="Pp" onChange={date => setDate(date)} />
          </div>

          <div>
            <button className="btn btn-primary btn-st w-100" onClick={onSubmitClick} type="submit">Add deadline</button>
          </div>
        </form>

      </Modal>

      <div className="deadlines-area">
        {deadlines_list.map((deadline, index) => (
            <DeadlineListItem key={index} index={index} 
            deadline_name={deadline.deadline_name}
            deadline_id={deadline.deadline_id}
            deadline_subject={deadline.deadline_subject}
            deadline_desc={deadline.deadline_desc}
            deadline_date={deadline.deadline_date}
            deleteDeadline={deleteDeadline}
            modifyDeadline={modifyDeadline}
             />
        ))}
      </div>
         
    </div>
  )
}

function Login() {
  const [logged] = useAuth();
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitClick = (e)=>{
    e.preventDefault()
    let data = {
      'username': username,
      'password': password
    }
    console.log(data)
    fetch('/api/login', {
      method: 'post',
      body: JSON.stringify(data)
    }).then(r => r.json())
      .then(token_json => {
        if (token_json.access_token){
          login(token_json);
          console.log(token_json);
        } else {
          //alert(token.message);
          //console.log("Please type in correct username/password");
          setModalErrorMessage(token_json.message);
          setModalIsOpen(true);
        }
      })
  }

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
  }

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState('');

  return (
    <div className="container centered-div-form">
      <h2>Login</h2>
      {!logged? <form action="#">
        <div className="mb-3">
          <label htmlFor="username-login" className="form-label">Username</label>
          <input type="text"
            id="username-login"
            className="form-control"
            onChange={handleUsernameChange}
            value={username}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password-login" className="form-label">Password</label>
          <input
            type="password"
            id="password-login"
            className="form-control"
            onChange={handlePasswordChange}
            value={password}
            required
          />
        </div>
        <button onClick={onSubmitClick} className="btn btn-primary btn-st w-100" type="submit">
          Login
        </button>
      </form>
      : <Redirect to="/"/>}

      <Modal isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          content: {
            top: '39%',
            left: '30%',
            right: '30%',
            bottom: '39%'
          }
        }}
        >
        <h3 style={{color: "red"}}>{modalErrorMessage}</h3>
        <button className="btn btn-primary btn-st btn-bt-r" onClick={() => setModalIsOpen(false)} type="submit">Close</button>
      </Modal>
    </div>
  )
}

function Register() {
  const [logged] = useAuth();
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password_confirm, setPasswordConfirm] = useState('')

  const onSubmitClick = (e)=>{
    e.preventDefault()
    console.log("You pressed register")
    let data = {
      'username': username,
      'password': password,
      'password_confirm': password_confirm
    }
    console.log(data)
    fetch('/api/register', {
      method: 'post',
      body: JSON.stringify(data)
    }).then(r => r.json())
      .then(token_json => {
        if (token_json.access_token){
          login(token_json)
          console.log(token_json)          
        } else {
          //alert(token.message);
          //console.log(token.message);
          setModalErrorMessage(token_json.message);
          setModalIsOpen(true);
        }
      })
  }

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
  }

  const handlePasswordConfirmChange = (e) => {
    setPasswordConfirm(e.target.value)
  }

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState('');

  return (
    <div className="container centered-div-form">
      <h2>Register</h2>
      {!logged? <form action="#">
        <div className="mb-3">
          <label htmlFor="username-register" className="form-label">Username</label>
          <input type="text" 
            id="username-register"
            className="form-control"
            onChange={handleUsernameChange}
            value={username} 
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password-register" className="form-label">Password</label>
          <input type="password"
            id="password-register"
            className="form-control"
            onChange={handlePasswordChange}
            value={password}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password-confirm-register" className="form-label">Password Confirm</label>
          <input type="password"
            id="password-confirm-register"
            className="form-control"
            onChange={handlePasswordConfirmChange}
            value={password_confirm}
          />
        </div>
        <button className="btn btn-primary btn-block btn-st w-100" onClick={onSubmitClick} type="submit">
          Register
        </button>
      </form>
      : <Redirect to="/"/>}

      <Modal isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          content: {
            top: '39%',
            left: '30%',
            right: '30%',
            bottom: '39%'
          }
        }}
        >
        <h3 style={{color: "red"}}>{modalErrorMessage}</h3>
        <button className="btn btn-primary btn-st btn-bt-r" onClick={() => setModalIsOpen(false)} type="submit">Close</button>
      </Modal>
    </div>
  )
}

const PrivateRoute = ({ component: Component, ...rest }) => {
  const [logged] = useAuth();

  return <Route {...rest} render={(props) => (
    logged
      ? <Component {...props} />
      : <Redirect to='/login' />
  )} />
}

function DeadlineListItem(props) {
  const [subject, setSubject] = useState(props.deadline_subject);
  const [task_name, setTaskName] = useState(props.deadline_name);
  const [description, setDescription] = useState(props.deadline_desc);
  const [date, setDate] = useState(new Date());

  const [modalErrorIsOpen, setModalErrorIsOpen] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const [modalModifyIsOpen, setModalModifyIsOpen] = useState(false);

  // Delete item from db and list
  const onDeleteClick = (e)=>{
    e.preventDefault()
    let data = {
      'deadline_id': props.deadline_id
    }
    authFetch('/api/delete_deadline', {
      method: 'post',
      body: JSON.stringify(data)
    }).then(r => r.json())
      .then(res => {
        if (res.message === "Successfuly deleted") {
          props.deleteDeadline(props.index);
          console.log("Successfuly deleted from db and list");
        } else {
          setModalErrorMessage(res.message);
          setModalErrorIsOpen(true);
        }
      })
  }

  // Update data in deadline
  const onModifyClick = (e) => {
    e.preventDefault();
    let data = {
      'deadline_id': props.deadline_id,
      'subject': subject,
      'task_name': task_name,
      'description': description,
      'date': date
    }
    authFetch('/api/update_deadline', {
      method: 'post',
      body: JSON.stringify(data)
    }).then(r => r.json())
      .then(res => {
        if (res.message === "OK") {
          props.modifyDeadline({
            'deadline_id': props.deadline_id,
            'subject': subject,
            'task_name': task_name,
            'description': description,
            'date': res.deadline_date,
            'index': props.index
          });
          setModalModifyIsOpen(false);
        } else {
          //setModalErrorMessage(res.message);
          //setModalErrorIsOpen(true);
          alert(res.message);
        }
      })
  }

  const handleSubjectChange = (e) => {
    setSubject(e.target.value)
  }

  const handleTaskNameChange = (e) => {
    setTaskName(e.target.value)
  }

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value)
  }

  return (    
      <div className="card w-75">
        <h5 className="card-header card-header-color-g">{props.deadline_name}</h5>
        <div className="card-body">
          <h5 className="card-title">{props.deadline_subject}</h5>
          <h6 className="card-subtitle mb-2 text-muted">{props.deadline_date}</h6>
          <p className="card-text">{props.deadline_desc}</p>
          <button type="button" className="btn btn-primary" style={{marginRight: "1%"}} onClick={() => setModalModifyIsOpen(true)}>Modify</button>
          <button type="button" className="btn btn-danger" onClick={onDeleteClick}>Delete</button>
        </div>

        <Modal isOpen={modalModifyIsOpen}
          ariaHideApp={false}
          onRequestClose={() => setModalModifyIsOpen(false)}
          style={{
            overlay: {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.75)'
            },
            content: {
              position: 'absolute',
              top: '15%',
              left: '32%',
              right: '32%',
              bottom: '15%',
              border: '1px solid #ccc',
              background: '#fff',
              overflow: 'auto',
              WebkitOverflowScrolling: 'touch',
              borderRadius: '15px',
              outline: 'none',
              padding: '20px'
            }
          }}
          >
          <h2>Modify Deadline</h2>
          
          <form action="#">
            <div className="mb-3">
              <label htmlFor="subject-create" className="form-label">Subject</label>
              <input type="text"
                id="subject-create"
                className="form-control"
                onChange={handleSubjectChange}
                value={subject}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="task-name-create" className="form-label">Task Name</label>
              <input type="text"
                id="task-name-create"
                className="form-control"
                onChange={handleTaskNameChange}
                value={task_name}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="description-create" className="form-label">Description</label>
              <textarea id="description-create"
                className="form-control textarea-style "
                onChange={handleDescriptionChange}
                value={description}
                rows='5'
              />
            </div>
            <div className="mb-3">
              <label htmlFor="deadline-date-create" className="form-label">Deadline Date </label>
              <DatePicker selected={date} showTimeSelect
              dateFormat="Pp" onChange={date => setDate(date)} />
            </div>

            <div>
              <button className="btn btn-primary btn-st w-100" onClick={onModifyClick} type="submit">Modify deadline</button>
            </div>
          </form>

        </Modal>

        <Modal isOpen={modalErrorIsOpen}
          onRequestClose={() => setModalErrorIsOpen(false)}
          style={{
            content: {
              top: '39%',
              left: '30%',
              right: '30%',
              bottom: '39%'
            }
          }}
          >
          <h3 style={{color: "red"}}>{modalErrorMessage}</h3>
          <button className="btn btn-primary btn-st btn-bt-r" onClick={() => setModalErrorIsOpen(false)} type="submit">Close</button>
        </Modal>

      </div>
  );
}

export default App;
