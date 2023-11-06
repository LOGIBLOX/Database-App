import React, { Component } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ReactComponent as LBXLogo } from './logo.svg';
import { v4 as uuidv4 } from 'uuid';

// Access the environment variables
const apiUrl = process.env.REACT_APP_LOGIBLOX_API_URL;
const apiKey = process.env.REACT_APP_LOGIBLOX_API_KEY;

class App extends Component {
  record = {
    leadID: '',
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    dealSize: '',
  };

  state = {
    data: [],
    editingRowId: null,
    update: { ...this.record },
    create: { ...this.record },
  };

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    axios.get(apiUrl, {
      headers: {
        'apiKey': apiKey,
      },
    })
      .then(response => {
        // Update the state with the response data
        this.setState({ data: response.data });
        // setResponseData(JSON.stringify(response.data, null, 2));
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleUpdateInputChange = (e) => {
    this.setState((prevState) => ({
      update: {
        ...prevState.update,
        [e.target.name]: e.target.value,
      },
    }));
  };

  handleAddInputChange = (e) => {
    this.setState((prevState) => ({
      create: {
        ...prevState.create,
        [e.target.name]: e.target.value,
      },
    }));
  };

  handleAdd = () => {
    const data = {
      "Company": this.state.create.company,
      "E-Mail": this.state.create.email,
      "First Name": this.state.create.firstName,
      "Last Name": this.state.create.lastName,
      "Deal Size": this.state.create.dealSize,
      "Lead ID": uuidv4()
    };

    axios.post(apiUrl, data, {
      headers: {
        'apiKey': apiKey,
      }
    }).then(() => {
      this.getData();
      const emptyState = { ...this.record }; // Create a new object with empty strings
      this.setState((prevState) => ({
        create: { ...emptyState }, // Set 'create' state to the empty object
        data: prevState.data, // Preserve the 'data' property
        update: prevState.update, // Preserve the 'update' state
      }));
    });
  };

  handleDelete = (id) => {
    const deleteRoute = apiUrl + `/${id}`;
    axios.delete(deleteRoute, {
      headers: {
        'apiKey': apiKey,
      }
    }).then(() => {
      this.getData();
    });
  };

  handleUpdate = (id) => {
    // Make sure that if we edit one row, that we only can press OK on that row
    if (this.state.editingRowId !== id) {
      return
    }
    const data = {
      "Company": this.state.update.company !== "" ? this.state.update.company : null,
      "E-Mail": this.state.update.email !== "" ? this.state.update.email : null,
      "First Name": this.state.update.firstName !== "" ? this.state.update.firstName : null,
      "Last Name": this.state.update.lastName !== "" ? this.state.update.lastName : null,
      "Deal Size": this.state.update.dealSize !== "" ? this.state.update.dealSize : null,
      "Lead ID": id,
    };

    axios.put(apiUrl, data, {
      headers: {
        'apiKey': apiKey,
      }
    }).then(() => {
      this.getData();
      const emptyState = { ...this.record }; // Create a new object with empty strings
      this.setState((prevState) => ({
        update: { ...emptyState }, // Set 'update' state to the empty object
        data: prevState.data, // Preserve the 'data' property
        create: prevState.create, // Preserve the 'create' state
        editingRowId: null,
      }));
    });
  };

  handleEdit = (id) => {
    this.setState({ editingRowId: id });
    const emptyState = { ...this.record }; // Create a new object with empty strings
    this.setState((prevState) => ({
      update: { ...emptyState }, // Set 'update' state to the empty object
      data: prevState.data, // Preserve the 'data' property
      create: prevState.create, // Preserve the 'create' state
    }));
  };

  renderTextOrInput = (item, stateKey, labelKey, placeholder) => {
    const { editingRowId } = this.state;
    const isEditing = editingRowId === item['Lead ID'];
    return (
      isEditing ? (
        <input
          type="text"
          className="form-control"
          value={this.state.update[stateKey]}
          name={stateKey}
          placeholder={placeholder || item[labelKey]}
          onChange={this.handleUpdateInputChange}
        />
      ) : (
        <p>{item[labelKey]}</p>
      )
    );
  }

  render() {
    const { data, editingRowId } = this.state;
    return (
      <div className="container mt-5">
        <LBXLogo style={{ width: '20%', height: '20%', marginLeft: '1000px' }} />
        <h1>CRUD* Front-End for LOGIBLOX Back-End</h1>
        <h6>* CRUD = Create / Read / Update / Delete</h6>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Company</th>
              <th>E-Mail</th>
              <th>Deal Size</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item['Lead ID']}>
                <td>{this.renderTextOrInput(item, 'firstName', 'First Name')}</td>
                <td>{this.renderTextOrInput(item, 'lastName', 'Last Name')}</td>
                <td>{this.renderTextOrInput(item, 'company', 'Company')}</td>
                <td>{this.renderTextOrInput(item, 'email', 'E-Mail')}</td>
                <td>{this.renderTextOrInput(item, 'dealSize', 'Deal Size')}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => this.handleDelete(item['Lead ID'])}
                  >
                    Delete
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-info"
                    onClick={() =>
                      editingRowId === item['Lead ID']
                        ? this.handleUpdate(item['Lead ID'])
                        : this.handleEdit(item['Lead ID'])
                    }
                  >
                    {editingRowId === item['Lead ID'] ? 'OK' : 'Update'}
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
        <div className="form-group" style={{ display: 'flex' }}>
          <input
            type="text"
            className="form-control"
            placeholder="First Name"
            name="firstName"
            value={this.state.create.firstName}
            onChange={this.handleAddInputChange}
            style={{ marginRight: '10px' }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Last Name"
            name="lastName"
            value={this.state.create.lastName}
            onChange={this.handleAddInputChange}
            style={{ marginRight: '10px' }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Company"
            name="company"
            value={this.state.create.company}
            onChange={this.handleAddInputChange}
            style={{ marginRight: '10px' }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="E-Mail"
            name="email"
            value={this.state.create.email}
            onChange={this.handleAddInputChange}
            style={{ marginRight: '10px' }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Deal Size"
            name="dealSize"
            value={this.state.create.dealSize}
            onChange={this.handleAddInputChange}
            style={{ marginRight: '10px' }}
          />
          <button className="btn btn-primary" onClick={this.handleAdd}>
            Add
          </button>
        </div>
        <br></br>
      </div>
    );
  }
}

export default App;
