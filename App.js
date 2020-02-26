/* eslint-disable prettier/prettier */
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, ScrollView, Animated, Text } from 'react-native';

import Photo from './src/Photo';
import SelectedPhoto from './src/SelectedPhoto';


const MARGIN_FROM_BOTTOM = 200;
let photos = [
  {
    name: 'Audy Tanudjaja',
    avatar: {
      uri:
        'https://cdn-images-1.medium.com/fit/c/240/240/1*GoIqFr7G3SXXf62i6hdrog.jpeg',
    },
    photo: {
      uri:
        'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F27714985%2F33790035043%2F1%2Foriginal.jpg?w=1000&rect=295%2C0%2C3214%2C1607&s=fb087ad58b8596660f243dc4523acbca',
    },
  },
  {
    name: 'Katelyn Friedson',
    avatar: {
      uri: 'https://s3.amazonaws.com/uifaces/faces/twitter/kfriedson/128.jpg',
    },
    photo: {
      uri:
        'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F33376779%2F119397753453%2F1%2Foriginal.jpg?w=1000&rect=0%2C57%2C7220%2C3610&s=c439fda7b39fc1d98a23f5cf1b4dfd8e',
    },
  },
  {
    name: 'Adham Dannaway',
    avatar: {
      uri:
        'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
    },
    photo: {
      uri:
        'https://mm.creativelive.com/fit/https%3A%2F%2Fagc.creativelive.com%2Fagc%2Fcourses%2F5222-1.jpg/1200',
    },
  },
  {
    name: 'Brynn',
    avatar: {
      uri: 'https://s3.amazonaws.com/uifaces/faces/twitter/brynn/128.jpg',
    },
    photo: {
      uri:
        'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F31079558%2F50958620730%2F1%2Foriginal.jpg?w=1000&rect=148%2C418%2C2360%2C1180&s=2f48e3d424143273cb5f98a7342bd1ee',
    },
  },
  {
    name: 'Other',
    avatar: {
      uri: `https://www.mautic.org/media/images/default_avatar.png`,
    },
    photo: {
      uri:
        'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F32179220%2F214666330784%2F1%2Foriginal.jpg?w=1000&rect=357%2C293%2C2326%2C1163&s=6ccee5095fbfd4a7b9aead2c2d355e3d',
    },
  },
];

export default class App extends React.Component {

  constructor() {
    super(...arguments);

    this._scrollValue = new Animated.Value(0);
    this._scaleValue = new Animated.Value(1);
    this._gesturePosition = new Animated.ValueXY();
    this.state = {
      isDragging: false,
    };
  }

  static childContextTypes = {
    gesturePosition: PropTypes.object,
    getScrollPosition: PropTypes.func,
    scaleValue: PropTypes.object,
  };

  getChildContext() {
    return {
      gesturePosition: this._gesturePosition,
      scaleValue: this._scaleValue,
      getScrollPosition: () => {
        return this._scrollValue.__getValue();
      },
    };
  }


  isCloseToBottom({ layoutMeasurement, contentOffset, contentSize }) {
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - MARGIN_FROM_BOTTOM;
  }

  fakeAPI = () => {
    console.log('FAKE API IS CALLED');
    setTimeout(() => {
      this.setState({ isBottom: false }, () => console.log(this.state.isBottom, 'STATE IS FALSE'));
    }, 5000);
  }


  render() {
    let { isDragging, selectedPhoto } = this.state;

    let onScroll = (event) => {
      if (this.isCloseToBottom(event.nativeEvent) && !this.state.isBottom) {
        this.setState({ isBottom: true }, () => {
          console.log(this.state.isBottom, 'STATE IS TRUE');
          this.fakeAPI();
        });
      }

      return Animated.event([
        { nativeEvent: { contentOffset: { y: this._scrollValue } } },
      ])(event);
    };

    return (
      <View style={styles.container}>

        <ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isDragging}
        >

          <Text onLayout={(event) => {
            var { height } = event.nativeEvent.layout;
            this.headerHeight = height;
          }}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum velit dolor iusto quisquam minus eius est accusamus! Animi ad laudantium illo architecto eaque repellendus deleniti nulla asperiores! Vitae, non harum.
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed nostrum accusamus dignissimos iure distinctio hic dolores aut, in repellendus, laborum debitis neque at! Aspernatur tenetur suscipit ut rerum explicabo culpa?
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam ipsum numquam, quod maxime esse magnam! Neque distinctio ipsum aliquid corrupti illum dolor eos nulla velit placeat, quidem culpa animi numquam.
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolore earum, tenetur, expedita asperiores nam porro officia veniam nisi sit alias nulla? Commodi adipisci architecto aperiam nam dicta repellat blanditiis provident?
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            scrollEventThrottle={16}
            onScroll={onScroll}
            scrollEnabled={!isDragging}
          >
            {photos.map((photo, key) => {
              return (
                <Photo
                  data={photo}
                  key={key}
                  isDragging={isDragging}
                  headerHeight={this.headerHeight}
                  onGestureStart={(selectedPhoto) => {
                    this.setState({
                      selectedPhoto,
                      isDragging: true,
                    });
                  }}
                  onGestureRelease={() => this.setState({ isDragging: false })}
                />
              );
            })}
          </ScrollView>

        </ScrollView>

        {isDragging ? (
          <SelectedPhoto
            key={selectedPhoto ? selectedPhoto.photoURI : ''}
            selectedPhoto={selectedPhoto}
            headerHeight={this.headerHeight}
          />
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
