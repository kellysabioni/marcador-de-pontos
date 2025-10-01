import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import MapView, { Marker } from "react-native-maps";

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("A permissão para acessar o local foi negada");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

  return (
    <>
      <View style={estilos.container}>
        <View style={estilos.fundo}>
          <Text style={estilos.titulo}>Meu histórico de localização</Text>
          <StatusBar style="auto" />

          <MapView
            style={estilos.mapa}
            initialRegion={{
              latitude: location ? location.coords.latitude : -23.55052, // fallback SP
              longitude: location ? location.coords.longitude : -46.633308,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {location && (
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="Você está aqui"
              />
            )}
          </MapView>
        </View>

        <View style={estilos.semicirculo}>
          <Text style={estilos.data}>11:22 - 30/09/2025</Text>
        </View>

        <Pressable style={estilos.botaoMarcar}>
          <Text style={{ color: "white", fontSize: 20 }}>
            Marcar minha posição
          </Text>
        </Pressable>
      </View>
    </>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start", // Alinha o conteúdo ao topo
    width: "100%", // Preenche a largura da tela
  },
  fundo: {
    width: "100%", // Preenche a largura da tela
    backgroundColor: "#47d7c7",
  },
  titulo: {
    width: "100%", // Preenche a largura da tela
    paddingTop: 100, // Espaço do topo
    backgroundColor: "#47d7c7",
    textAlign: "center",
    fontSize: 28,
    color: "#222",
    fontWeight: "bold",
  },
  semicirculo: {
    width: "100%",
    height: 160,
    backgroundColor: "#47d7c7",
    borderBottomLeftRadius: 160,
    borderBottomRightRadius: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  data: {
    fontSize: 18,
    color: "#222",
  },
  botaoMarcar: {
    color: "#fff",
    backgroundColor: "#47d7c7",
    fontSize: 20,
    fontFamily: "Arial",
    fontWeight: "400",
    borderRadius: 10,
    marginTop: 50,
    alignItems: "center",
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  mapa: {
    width: "95%",
    height: 300,    
    overflow: "hidden", // Garante que o mapa respeite o borderRadius
    alignSelf: "center", // Centraliza horizontalmente
    marginVertical: 30, // Espaço vertical para centralizar melhor
  },
});
 