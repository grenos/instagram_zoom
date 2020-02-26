/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
/* global requestAnimationFrame */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import ReactNative, { View, Animated, PanResponder, Easing, Image } from 'react-native';
import { ListItem } from 'react-native-elements';


import { getDistance, getScale, measureNode } from './InstaZoomHelpers';


const RESTORE_ANIMATION_DURATION = 200;

export default class PhotoComponent extends Component {

  static contextTypes = {
    gesturePosition: PropTypes.object,
    scaleValue: PropTypes.object,
    getScrollPosition: PropTypes.func,
  };

  constructor() {
    super(...arguments);
    autoBind(this);

    this._generatePanHandlers();
    this._initialTouches = [];
    this._opacity = new Animated.Value(1);
  }

  render() {
    let { data } = this.props;

    return (
      <View ref={(parentNode) => (this._parent = parentNode)}>
        <View>
          <ListItem
            roundAvatar
            avatar={{ uri: data.avatar.uri }}
            title={`${data.name}`}
            subtitle="example of subtitle"
          />
        </View>
        <Animated.View
          ref={(node) => (this._photoComponent = node)}
          {...this._gestureHandler.panHandlers}
          style={{ opacity: this._opacity }}
        >
          <Image source={{ uri: data.photo.uri }} style={{ width: '100%', height: 260 }} />
        </Animated.View>
      </View>
    );
  }

  _generatePanHandlers() {
    this._gestureHandler = PanResponder.create({
      onStartShouldSetResponderCapture: () => true,
      onStartShouldSetPanResponderCapture: (event) => {
        return event.nativeEvent.touches.length === 2;
      },
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: (event) => {
        return event.nativeEvent.touches.length === 2;
      },
      onPanResponderGrant: this._startGesture,
      onPanResponderMove: this._onGestureMove,
      onPanResponderRelease: this._onGestureRelease,
      onPanResponderTerminationRequest: () => {
        return this._gestureInProgress == null;
      },
      onPanResponderTerminate: (event, gestureState) => {
        return this._onGestureRelease(event, gestureState);
      },
    });
  }

  async _startGesture(event, gestureState) {
    // Sometimes gesture start happens two or more times rapidly.
    if (this._gestureInProgress) {
      return;
    }

    this._gestureInProgress = gestureState.stateID;
    let { data, onGestureStart } = this.props;
    let { gesturePosition, getScrollPosition } = this.context;
    let { touches } = event.nativeEvent;

    this._initialTouches = touches;

    let selectedPhotoMeasurement = await this._measureSelectedPhoto();
    this._selectedPhotoMeasurement = selectedPhotoMeasurement;


    onGestureStart({
      photoURI: data.photo.uri,
      measurement: selectedPhotoMeasurement,
    });

    gesturePosition.setValue({
      x: 0,
      y: 0,
    });

    gesturePosition.setOffset({
      x: 0,
      y: selectedPhotoMeasurement.y - getScrollPosition(),
    });

    Animated.timing(this._opacity, {
      toValue: 0,
      duration: 200,
    }).start();
  }

  _onGestureMove(event, gestureState) {
    let { touches } = event.nativeEvent;
    if (!this._gestureInProgress) {
      return;
    }
    if (touches.length < 2) {
      // Trigger a realease
      this._onGestureRelease(event, gestureState);
      return;
    }

    // for moving photo around
    let { gesturePosition, scaleValue } = this.context;
    let { dx, dy } = gestureState;
    gesturePosition.x.setValue(dx);
    gesturePosition.y.setValue(dy);

    // for scaling photo
    let currentDistance = getDistance(touches);
    let initialDistance = getDistance(this._initialTouches);
    let newScale = getScale(currentDistance, initialDistance);
    scaleValue.setValue(newScale < 1 ? 1 : newScale);
  }

  _onGestureRelease(event, gestureState) {
    if (this._gestureInProgress !== gestureState.stateID) {
      return;
    }

    this._gestureInProgress = null;
    this._initialTouches = [];
    let { onGestureRelease } = this.props;
    let { gesturePosition, scaleValue, getScrollPosition } = this.context;

    // set to initial position and scale
    Animated.parallel([
      Animated.timing(gesturePosition.x, {
        toValue: 0,
        duration: RESTORE_ANIMATION_DURATION,
        easing: Easing.ease,
        // useNativeDriver: true,
      }),
      Animated.timing(gesturePosition.y, {
        toValue: 0,
        duration: RESTORE_ANIMATION_DURATION,
        easing: Easing.ease,
        // useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: RESTORE_ANIMATION_DURATION,
        easing: Easing.ease,
        // useNativeDriver: true,
      }),
    ]).start(() => {
      gesturePosition.setOffset({
        x: 0,
        y:
          (this._selectedPhotoMeasurement &&
            this._selectedPhotoMeasurement.y) ||
          0 - getScrollPosition(),
      });

      this._opacity.setValue(1);

      requestAnimationFrame(() => {
        onGestureRelease();
      });
    });
  }

  async _measureSelectedPhoto() {
    let parent = ReactNative.findNodeHandle(this._parent);
    let photoComponent = ReactNative.findNodeHandle(this._photoComponent);

    let [parentMeasurement, photoMeasurement] = await Promise.all([
      measureNode(parent),
      measureNode(photoComponent),
    ]);

    return {
      x: photoMeasurement.x,
      y: parentMeasurement.y + photoMeasurement.y + this.props.headerHeight,
      w: photoMeasurement.w,
      h: photoMeasurement.h,
    };
  }
}
