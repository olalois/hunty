import { View, Text, Button, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';

export default function DetailsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details Screen</Text>
      <Link href="/nested" asChild>
        <Button title="Go to Nested Screen" />
      </Link>
      <View style={styles.spacer} />
      <Button title="Go Back Programmatically" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  spacer: {
    height: 16,
  },
});
