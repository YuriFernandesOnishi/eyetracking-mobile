import { CanvasRef, useCanvasRef } from '@shopify/react-native-skia';
import * as MediaLibrary from 'expo-media-library/legacy';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { computeContainRect } from '../src/gaze/coordinateMapping';
import { saveHeatmapSnapshot } from '../src/heatmap/exportSnapshot';
import { HeatmapCanvas } from '../src/heatmap/HeatmapCanvas';
import { useSession } from '../src/state/SessionContext';

export default function ResultsScreen() {
  const router = useRouter();
  const { selectedImage, gazePoints } = useSession();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const canvasRef: React.RefObject<CanvasRef | null> = useCanvasRef();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) {
      setStatusMessage('Permissão para acessar a galeria foi negada.');
      return;
    }
    const file = saveHeatmapSnapshot(canvasRef);
    if (!file) {
      setStatusMessage('Não foi possível gerar a imagem do mapa de calor.');
      return;
    }
    await MediaLibrary.saveToLibraryAsync(file.uri);
    setStatusMessage('Mapa de calor salvo na galeria.');
  }, [canvasRef]);

  const handleShare = useCallback(async () => {
    const file = saveHeatmapSnapshot(canvasRef);
    if (!file) {
      setStatusMessage('Não foi possível gerar a imagem do mapa de calor.');
      return;
    }
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri);
    } else {
      setStatusMessage('Compartilhamento não está disponível neste dispositivo.');
    }
  }, [canvasRef]);

  if (!selectedImage) return null;

  const rect = computeContainRect(windowWidth, windowHeight * 0.75, selectedImage.width, selectedImage.height);

  return (
    <View style={styles.container}>
      <View style={{ width: windowWidth, height: windowHeight * 0.75 }}>
        <HeatmapCanvas
          uri={selectedImage.uri}
          rect={rect}
          points={gazePoints}
          width={windowWidth}
          height={windowHeight * 0.75}
          canvasRef={canvasRef}
        />
        {gazePoints.length === 0 && (
          <Text style={styles.emptyText}>
            Nenhum ponto de olhar foi registrado nesta sessão. Tente recalibrar e repetir.
          </Text>
        )}
      </View>

      {statusMessage && <Text style={styles.statusText}>{statusMessage}</Text>}

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Salvar</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleShare}>
          <Text style={styles.buttonText}>Compartilhar</Text>
        </Pressable>
      </View>
      <View style={styles.actions}>
        <Pressable style={[styles.button, styles.secondaryButton]} onPress={() => router.replace('/session')}>
          <Text style={styles.buttonText}>Repetir sessão</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.secondaryButton]} onPress={() => router.replace('/calibration')}>
          <Text style={styles.buttonText}>Recalibrar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0f',
    alignItems: 'center',
  },
  emptyText: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  statusText: {
    color: '#ffd60a',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  secondaryButton: {
    backgroundColor: '#3a3a3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
