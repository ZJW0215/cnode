import React from 'react'
import {
  observer,
  inject,
} from 'mobx-react'
import PropTypes from 'prop-types'
/* Helmet使得相应页面的title在相应页面定义 */
import Helmet from 'react-helmet'
import queryString from 'query-string'
// import Button from 'material-ui/Button'
import Tabs, { Tab } from 'material-ui/Tabs'
import List from 'material-ui/List'
import { CircularProgress } from 'material-ui/Progress'

import { AppState } from '../../store/app-state'
import Container from '../layout/container'
import TopicListItem from './list-item'
import { tabs } from '../../util/variable-define'

@inject((stores) => {
  return {
    appState: stores.appState,
    topicStore: stores.topicStore,
  }
}) @observer

export default class TopicList extends React.Component {
  /* 获取路由对象 */
  static contextTypes = {
    router: PropTypes.object,
  }

  constructor() {
    super()
    this.changeTab = this.changeTab.bind(this)
    this.listItemClick = this.listItemClick.bind(this)
  }

  componentDidMount() {
    const tab = this.getTab()
    this.props.topicStore.fetchTopics(tab)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      this.props.topicStore.fetchTopics(this.getTab(nextProps.location.search))
    }
  }

  asyncBootstrap() {
    const query = queryString.parse(this.props.location.search)
    const { tab } = query
    return this.props.topicStore.fetchTopics(tab || 'all').then(() => {
      return true
    }).catch(() => {
      return false
    })
  }

  getTab(search) {
    search = search || this.props.location.search
    const query = queryString.parse(search)
    return query.tab || 'all'
  }

  changeTab(event, value) {
    this.context.router.history.push({
      pathname: '/index',
      search: `?tab=${value}`,
    })
  }

  listItemClick(topic) {
    this.context.router.history.push(`/detail/${topic.id}`)
  }

  render() {
    const {
      topicStore,
    } = this.props
    const topicList = topicStore.topics
    const {
      createdTopics,
    } = topicStore
    const syncingTopics = topicStore.syncing
    const tab = this.getTab()
    const {
      user,
    } = this.props.appState

    return (
      <Container>
        <Helmet>
          <title>this is topic list</title>
          <meta name="description" content="this is a description" />
        </Helmet>
        <Tabs value={tab} onChange={this.changeTab}>
          {
            Object.keys(tabs).map(t => (
              <Tab key={t} label={tabs[t]} value={t} />
            ))
          }
        </Tabs>
        {
          (createdTopics && createdTopics.length > 0) ?
            <List>
              {
                createdTopics.map((topic) => {
                  topic = Object.assign({}, topic, {
                    author: user.info,
                  })
                  return (
                    <TopicListItem
                      key={topic.id}
                      onClick={() => this.listItemClick(topic)}
                      topic={topic}
                    />
                  )
                })
              }
            </List> :
            null
        }
        <List>
          {
            topicList.map(topic => (
              <TopicListItem
                key={topic.id}
                onClick={() => this.listItemClick(topic)}
                topic={topic}
              />
            ))
          }
        </List>
        {
          syncingTopics ?
            (
              <div
                style={{
                display: 'flex',
                justifyContent: 'space-around',
                padding: '40px 0',
              }}
              >
                <CircularProgress color="primary" size={100} />
              </div>
            ) : null
        }
      </Container>
    )
  }
}

TopicList.wrappedComponent.propTypes = {
  appState: PropTypes.instanceOf(AppState).isRequired,
  topicStore: PropTypes.object.isRequired,
}

TopicList.propTypes = {
  location: PropTypes.object.isRequired,
}
