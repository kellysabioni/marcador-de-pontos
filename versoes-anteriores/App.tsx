import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
// Importa biblioteca de localização do Expo
import * as Location from "expo-location";
// Importa o mapa e marcador da lib react-native-maps
import MapView, { Marker } from "react-native-maps";

export default function App() {
  // Estado para armazenar a localização atual do usuário (ou null caso não tenha)
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );

  // Estado que guarda a string formatada de data/hora
  const [currentDateTime, setCurrentDateTime] = useState<string>("");

  useEffect(() => {
    // Função assíncrona para solicitar permissão e pegar localização
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Erro", "A permissão para acessar o local foi negada");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formatted =
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) +
        " - " +
        now.toLocaleDateString("pt-BR");

      setCurrentDateTime(formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Função que busca endereço na API Nominatim
  async function getEndereco(latitude: number, longitude: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
        {
          headers: {
            "User-Agent": "MeuApp/1.0 (contato@meuemail.com)", // importante para não ser bloqueado
          },
        }
      );

      const data = await response.json();
      // Pega o nome da rua se existir, senão usa "Endereço não encontrado"
      return (
        data?.address?.road || data?.display_name || "Endereço não encontrado"
      );
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      return "Erro ao buscar endereço";
    }
  }

  // Função que será chamada ao clicar no botão
  const marcarPosicao = async () => {
    if (!location) {
      Alert.alert("Erro", "Localização ainda não carregada.");
      return;
    }

    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;

    // Busca o endereço na API
    const rua = await getEndereco(latitude, longitude);

    const dataAtual = new Date();
    const mensagem = `Ponto registrado com sucesso!\n\n📍 Localização:\nLatitude: ${latitude}\nLongitude: ${longitude}\nEnd.: ${rua}\n\n🕒 Data: ${dataAtual.toLocaleDateString()}\nHora: ${dataAtual.toLocaleTimeString()}`;

    Alert.alert("Confirmação", mensagem);
  };

  return (
    <>
      <View style={estilos.container}>
        <View style={estilos.fundo}>
          <Text style={estilos.titulo}>Meu histórico de localização</Text>
          <StatusBar style="auto" />

          <MapView
            style={estilos.mapa}
            region={
              location
                ? {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }
                : {
                    latitude: -23.55052,
                    longitude: -46.633308,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }
            }
            showsUserLocation={true}
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
          <Text style={estilos.data}>{currentDateTime}</Text>
        </View>

        <Pressable style={estilos.botaoMarcar} onPress={marcarPosicao}>
          <Text style={estilos.textoBotaoMarcar}> Marcar minha posição </Text>
        </Pressable>
      </View>
    </>
  );
}

// Estilos
const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  fundo: {
    width: "100%",
    backgroundColor: "#47d7c7",
  },
  titulo: {
    width: "100%",
    paddingTop: 100,
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
    backgroundColor: "#47d7c7",
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
  textoBotaoMarcar: {
    color: "#f0f0f0",
    fontSize: 20,
    fontFamily: "Arial",
    fontWeight: "bold",
  },
  mapa: {
    width: "95%",
    height: 300,
    overflow: "hidden",
    alignSelf: "center",
    marginVertical: 30,
  },
});
 