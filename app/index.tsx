import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eye Tracking</Text>
      <Text style={styles.description}>
        Este app usa a câmera frontal para estimar para onde você está olhando enquanto uma imagem é exibida na
        tela, e gera um mapa de calor ao final mostrando onde seu olhar se concentrou.
      </Text>
      <Text style={styles.description}>
        Antes de começar, você vai calibrar o rastreamento olhando para alguns pontos na tela.
      </Text>
      {Platform.OS === 'web' && (
        <Text style={styles.webNotice}>
          Rodando no navegador: não há câmera real disponível aqui, então o gaze é simulado pela posição do
          mouse — útil para testar o fluxo do app, não a precisão do rastreamento.
        </Text>
      )}
      <Pressable style={styles.button} onPress={() => router.push('/select-image')}>
        <Text style={styles.buttonText}>Começar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
  },
  description: {
    color: '#c7c7cc',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 21,
  },
  webNotice: {
    color: '#ffd60a',
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#ff3b30',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
});
