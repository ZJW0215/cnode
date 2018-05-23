import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'mobx-react'
import { AppContainer } from 'react-hot-loader'   //eslint-disable-line

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'
import { lightBlue, green } from 'material-ui/colors'

import App from './views/App'
import { AppState, TopicStore } from './store/store'

const theme = createMuiTheme({
  palette: {
    primary: lightBlue,
    accent: green,
    type: 'light',
  },
})

// ReactDom.render(<App />, document.getElementById('root'))

const initialState = window.__INITIAL__STATE__ || {}  //eslint-disable-line

const createApp = (TheApp) => {
  class Main extends React.Component {
    /* remove jss-server-side injected css */
    componentDidMount() {
      const jssStyles = document.getElementById('jss-server-side')
      if (jssStyles && jssStyles.parentNode) {
        jssStyles.parentNode.removeChild(jssStyles)
      }
    }

    render() {
      return <TheApp />
    }
  }
  return Main
}

const appState = new AppState(initialState.appState)
// appState.init()
const topicStore = new TopicStore(initialState.topicStore)

const root = document.getElementById('root')
const render = (Component) => {
  /* 有服务端渲染时在客户端渲染用hydrate，没有服务端渲染的时候用render */
  ReactDOM.render(
    <AppContainer>
      <Provider appState={appState} topicStore={topicStore}>
        <BrowserRouter>
          <MuiThemeProvider theme={theme}>
            <Component />
          </MuiThemeProvider>
        </BrowserRouter>
      </Provider>
    </AppContainer>,
    root,
  )
}

render(createApp(App));

if (module.hot) {
  module.hot.accept('./views/App', () => {
    const NextApp = require('./views/App').default   //eslint-disable-line
    // ReactDom.render(<NextApp />, document.getElementById("root"))
    render(createApp(NextApp))
  })
}
