import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const App = () => {
  const [stories, setStories] = useState([]);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [animationValue, setAnimationValue] = useState(new Animated.Value(0));

  useEffect(() => {
    fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
      .then(response => response.json())
      .then(ids =>
        Promise.all(
          ids
            .slice(0, 20)
            .map(id =>
              fetch(
                `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
              ).then(response => response.json()),
            ),
        ),
      )
      .then(stories => setStories(stories));
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('bookmarks', JSON.stringify(Array.from(bookmarks)));
  }, [bookmarks]);

  useEffect(() => {
    AsyncStorage.getItem('bookmarks').then(value =>
      setBookmarks(new Set(JSON.parse(value))),
    );
  }, []);

  const toggleBookmark = id => {
    const newBookmarks = new Set(bookmarks);
    if (bookmarks.has(id)) {
      newBookmarks.delete(id);
    } else {
      newBookmarks.add(id);
    }
    setBookmarks(newBookmarks);
    // animate the star icon when it's selected
    // Animated.sequence([
    //   Animated.timing(animationValue, {
    //     toValue: 1,
    //     duration: 250,
    //     useNativeDriver: true,
    //   }),
    //   Animated.timing(animationValue, {
    //     toValue: 0,
    //     duration: 250,
    //     useNativeDriver: true,
    //   }),
    // ]).start();
  };
  return (
    <View style={styles.container}>
      <FlatList
        data={stories}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.story}>
            <TouchableOpacity onPress={() => toggleBookmark(item.id)}>
              {stories.length > 0 && (
                <Animated.Text
                  style={{
                    color: animationValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['gray', 'gold'],
                    }),
                  }}>
                  {bookmarks.has(item.id) ? '★' : '☆'}
                </Animated.Text>
              )}
            </TouchableOpacity>
            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.author}>{item.by}</Text>
              <Text style={styles.time}>
                {new Date(item.time * 1000).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F7F7F7',
  },
  story: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  author: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 3,
  },
  time: {
    fontSize: 14,
    color: '#777777',
  },
});

export default App;
