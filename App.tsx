import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
// Importa biblioteca de localização do Expo
import * as Location from "expo-location";
// Importa o mapa e marcador da lib react-native-maps
import MapView, { Marker } from "react-native-maps";

export default function App() {
  // Estado para armazenar a localização atual do usuário (ou null caso não tenha)
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  // Estado para armazenar mensagens de erro (ex: permissão negada)
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estado que guarda a string formatada de data/hora
  const [currentDateTime, setCurrentDateTime] = useState<string>("");

  useEffect(() => {
    // Função assíncrona para solicitar permissão e pegar localização
    async function getCurrentLocation() {
      // Pede permissão para acessar a localização em primeiro plano
      let { status } = await Location.requestForegroundPermissionsAsync();

      // Caso a permissão seja negada, mostra erro e sai da função
      if (status !== "granted") {
        setErrorMsg("A permissão para acessar o local foi negada");
        return;
      }

      // Obtém a posição atual do usuário (latitude e longitude)
      let location = await Location.getCurrentPositionAsync({});
      // Atualiza o estado com a localização obtida
      setLocation(location);
    }

    // Executa a função
    getCurrentLocation();
  }, 
  []); // [] garante que só roda uma vez, quando o componente é montado

  
  useEffect(() => {
    // Cria um intervalo que será executado a cada 1 segundo (1000ms)
    const interval = setInterval(() => {
      const now = new Date(); // Pega a data/hora atual

      // Formata para o padrão brasileiro: HH:MM:SS - DD/MM/AAAA
      const formatted =
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit", // Mostra os segundos também
        }) +
        " - " +
        now.toLocaleDateString("pt-BR");

      // Atualiza o estado com a string formatada
      setCurrentDateTime(formatted);
    }, 1000); // Intervalo de 1 segundo

    // Retorna uma função que limpa o intervalo quando o componente desmonta
    return () => clearInterval(interval);
  }, 
  []); // [] garante que o relógio começa a rodar apenas uma vez

  // Função que será chamada ao clicar no botão
  const marcarPosicao = () => {
    if (!location) {
      Alert.alert("Erro", "Localização ainda não carregada.");
      return;
    }
 
    const dataAtual = new Date();
    const mensagem = `Ponto registrado com sucesso!\n\n📍 Localização:\nLatitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}\n\n🕒 Data: ${dataAtual.toLocaleDateString()}\nHora: ${dataAtual.toLocaleTimeString()}`;
 
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
              location ? {
                    latitude: location.coords.latitude, // Latitude atual
                    longitude: location.coords.longitude, // Longitude atual
                    latitudeDelta: 0.01, // Zoom no eixo Y
                    longitudeDelta: 0.01, // Zoom no eixo X
                  }
                : {
                    latitude: -23.55052, // Fallback: Localização padrão São Paulo
                    longitude: -46.633308,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }
            }
            showsUserLocation={true} // Mostra o ponto azul de localização 
          >
            {/* Marcador que aparece apenas se tiver localização */}
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

        {/* Exibe data e hora atualizada */}
        <View style={estilos.semicirculo}>
          <Text style={estilos.data}>{currentDateTime}</Text>
        </View>

        {/* Botão (sem função ainda) */}
        <Pressable style={estilos.botaoMarcar} onPress={marcarPosicao} >
          <Text style={estilos.textoBotaoMarcar} > Marcar minha posição </Text>
        </Pressable>
      </View>
    </>
  );
}

// Estilos
const estilos = StyleSheet.create({
  container: {
    flex: 1, // Ocupa a tela toda
    backgroundColor: "#fff",
    alignItems: "center", // Centraliza horizontalmente
    justifyContent: "flex-start", // Começa do topo
    width: "100%",
  },
  fundo: {
    width: "100%",
    backgroundColor: "#47d7c7",
  },
  titulo: {
    width: "100%",
    paddingTop: 100, // Espaço no topo
    backgroundColor: "#47d7c7",
    textAlign: "center", // Centraliza o texto
    fontSize: 28,
    color: "#222",
    fontWeight: "bold",
  },
  semicirculo: {
    width: "100%",
    height: 160,
    backgroundColor: "#47d7c7",
    borderBottomLeftRadius: 160, // Faz canto arredondado
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
    borderRadius: 10, // Borda arredondada
    marginTop: 50, // Espaço do topo
    alignItems: "center",
    padding: 25, // Espaçamento interno
    shadowColor: "#000", // Sombra
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4, // Sombra no Android
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
    overflow: "hidden", // Garante que respeite o arredondamento
    alignSelf: "center", // Centraliza
    marginVertical: 30, // Espaço acima/abaixo
  },
});
