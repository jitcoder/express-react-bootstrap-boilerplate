import React from 'react';
import ReactDOM from 'react-dom';
import * as bsn from 'bootstrap.native';

class App extends React.Component{
  constructor(props){
    super(props);
  }
  
  render(){
    return <button className="btn btn-warning">Hello</button>;
  }
}

ReactDOM.render(<App/>,document.getElementById('contents'));
