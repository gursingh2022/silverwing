import React, { Component } from 'react';
import { Grid, Button, Typography } from '@material-ui/core';
import CreateRoom from './CreateRoom';

export default class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      guestCanPause: false,
      votesToSkip: 2,
      isHost: false,
      showSettings: false,
      spotifyAuthenticated: false,
    };
    this.roomCode = this.props.match.params.roomCode;
    this.getRoomDetails = this.getRoomDetails.bind(this);
    this.getRoomDetails();
    this.leaveButtonClick = this.leaveButtonClick.bind(this);
    this.updateShowSettings = this.updateShowSettings.bind(this);
    this.renderSettingsButton = this.renderSettingsButton.bind(this);
    this.renderSettings = this.renderSettings.bind(this);
    this.authenticateSpotify = this.authenticateSpotify.bind(this);
  }

  getRoomDetails() {
    return fetch('/api/get-room' + '?code=' + this.roomCode)
      .then((response) => {
        if (!response.ok) {
          this.props.leaveRoomCallback();
          this.props.history.push('/');
        }
        return response.json();
      })
      .then((data) => {
        this.setState({
          guestCanPause: data.guest_can_pause,
          votesToSkip: data.votes_to_skip,
          isHost: data.is_host,
        });
        if (this.state.isHost) {
          this.authenticateSpotify();
        }
      });
  }

  leaveButtonClick() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };
    fetch('/api/leave-room', requestOptions).then((response) => {
      this.props.leaveRoomCallback();
      this.props.history.push('/');
    });
  }

  updateShowSettings(value) {
    this.setState({
      showSettings: value,
    });
  }

  authenticateSpotify() {
    fetch('/spotify/is-authenticated')
      .then((response) => response.json())
      .then((data) => {
        this.setState({ spotifyAuthenticated: data.status });
        if (!data.status) {
          fetch('/spotify/get-auth-url')
            .then((response) => response.json())
            .then((data) => {
              window.location.replace(data.url);
            });
        }
      });
  }

  renderSettingsButton() {
    return (
      <Grid item xs={12} align='center'>
        <Button
          variant='contained'
          color='primary'
          onClick={() => this.updateShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  }

  renderSettings() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align='center'>
          <CreateRoom
            update={true}
            guestCanPause={this.state.guestCanPause}
            votesToSkip={this.state.votesToSkip}
            roomCode={this.roomCode}
            updateCallback={this.getRoomDetails}
          />
        </Grid>
        <Grid item xs={12} align='center'>
          <Button
            variant='contained'
            color='secondary'
            onClick={() => this.updateShowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  }

  render() {
    if (this.state.showSettings) {
      return this.renderSettings();
    }
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align='center'>
          <Typography variant='h4' component='h4'>
            Code: {this.roomCode}
          </Typography>
        </Grid>
        <Grid item xs={12} align='center'>
          <Typography variant='h6' component='h6'>
            Votes: {this.state.votesToSkip}
          </Typography>
        </Grid>
        <Grid item xs={12} align='center'>
          <Typography variant='h6' component='h6'>
            Guest Can Pause: {this.state.guestCanPause.toString()}
          </Typography>
        </Grid>
        <Grid item xs={12} align='center'>
          <Typography variant='h6' component='h6'>
            Host: {this.state.isHost.toString()}
          </Typography>
        </Grid>
        {this.state.isHost ? this.renderSettingsButton() : null}
        <Grid item xs={12} align='center'>
          <Button
            variant='contained'
            color='secondary'
            onClick={this.leaveButtonClick}
          >
            Leave Room
          </Button>
        </Grid>
      </Grid>
    );
  }
}
