import React from 'react'
import ReactDOM from 'react-dom'
import { message } from 'antd'
import { isMobile } from 'hym-utils-js'
import App from './App'
import reportWebVitals from './reportWebVitals'
import zoomerang from 'utils/zoomerang'
import './cesium.config'
import 'antd/dist/antd.css'
import 'assets/style/base.css'

window.isMobile = isMobile()

message.config({
  maxCount: 1
})

zoomerang.config({
  bgColor: '#000',
  maxWidth: 375
})

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();