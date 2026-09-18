import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SAMPLE_IMAGES } from '../src/assets/sample-images';
import { useSession } from '../src/state/SessionContext';

export default function SelectImageScreen() {
  const router = useRouter();
  const { setSelectedImage } = useSession();

  const choosePicture = useCallback(
    (uri: string, width: number, height: number) => {
      setSelectedImage({ uri, width, height });
      router.push('/calibration');
    },
    [setSelectedImage, router]
  );

  const pickFromGallery = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (result.canceled || result.assets.length === 0) return;

    const asset = result.assets[0];
    choosePicture(asset.uri, asset.width, asset.height);
  }, [choosePicture]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha uma imagem</Text>
      <FlatList
        data={SAMPLE_IMAGES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => choosePicture(item.uri, item.width, item.height)}>
            <Image source={{ uri: item.uri }} style={styles.thumbnail} resizeMode="cover" />
            <Text style={styles.cardLabel}>{item.label}</Text>
          </Pressable>
        )}
      />
      <Pressable style={styles.button} onPress={pickFromGallery}>
        <Text style={styles.buttonText}>Escolher da galeria</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0f',
    padding: 16,
    gap: 16,
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },
  grid: {
    gap: 12,
  },
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1c1c1e',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  cardLabel: {
    color: 'white',
    padding: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ff3b30',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
