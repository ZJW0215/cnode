import React from 'react'
import PropTypes from 'prop-types'
import {
  inject,
  observer,
} from 'mobx-react'

import TextField from 'material-ui/TextField'
import { withStyles } from 'material-ui/styles'
import Radio from 'material-ui/Radio'
import Button from 'material-ui/Button'
import IconReply from 'material-ui-icons/Reply'
import SnackBar from 'material-ui/Snackbar'
import SimpleMDE from 'react-simplemde-editor'

import Container from '../layout/container'
import createStyles from './styles'
import { tabs } from '../../util/variable-define'

@inject((stores) => {
  return {
    topicStore: stores.topicStore,
  }
}) @observer

class TopicCreate extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
  }
  constructor() {
    super()
    this.state = {
      title: '',
      content: '',
      tab: 'dev',
      message: '',
      open: false,
    }
    this.handleTitleChange = this.handleTitleChange.bind(this)
    this.handleContentChange = this.handleContentChange.bind(this)
    this.handleChangeTab = this.handleChangeTab.bind(this)
    this.handleCreate = this.handleCreate.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleTitleChange(e) {
    this.setState({
      title: e.target.value.trim(),
    })
  }

  handleContentChange(value) {
    this.setState({
      content: value,
    })
  }

  handleChangeTab(e) {
    this.setState({
      tab: e.currentTarget.value,
    })
  }

  showMessage(message) {
    this.setState({
      open: true,
      message,
    })
  }

  /* eslint-disable */
  handleCreate() {
    const {
      title,
      content,
      tab,
    } = this.state
    if (!title) {
      this.showMessage('title必须填写')
      return
    }
    if (!content) {
      this.showMessage('内容必须填写')
      return
    }
    return this.props.topicStore.createTopic(title, tab, content)
      .then(() => {
        this.context.router.history.push('/index')
      })
      .catch((err) => {
        this.showMessage(err.message)
      })
  }
  /* eslint-enable */

  handleClose() {
    this.setState({
      open: false,
    })
  }

  render() {
    const { classes } = this.props
    const {
      message,
      open,
    } = this.state
    return (
      <Container>
        <SnackBar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          key={message}
          message={message}
          open={open}
          onClose={this.handleClose}
        />
        <div className={classes.root}>
          <TextField
            className={classes.title}
            label="标题"
            value={this.state.title}
            onChange={this.handleTitleChange}
            fullWidth
          />
          <SimpleMDE
            onChange={this.handleContentChange}
            value={this.state.newReply}
            options={{
              toolbar: false,
              spellChecker: false,
              placeholder: '发表你的精彩意见',
            }}
          />
          <div>
            {
              Object.keys(tabs).map((tab) => {
                if (tab !== 'all' && tab !== '精品') {
                  return (
                    <span className={classes.selectItem} key={tab}>
                      <Radio
                        value={tab}
                        checked={tab === this.state.tab}
                        onChange={this.handleChangeTab}
                      />
                      {tabs[tab]}
                    </span>
                  )
                }
                return null
              })
            }
          </div>
          <Button
            fab
            style={{ backgroundColor: 'blue', color: '#fff' }}
            onClick={this.handleCreate}
            className={classes.replyButton}
          >
            <IconReply />
          </Button>
        </div>
      </Container>
    )
  }
}

TopicCreate.propTypes = {
  classes: PropTypes.object.isRequired,
}

TopicCreate.wrappedComponent.propTypes = {
  topicStore: PropTypes.object.isRequired,
}

export default withStyles(createStyles)(TopicCreate)
