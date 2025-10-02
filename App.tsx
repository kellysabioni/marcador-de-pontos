import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View, ScrollView, Modal, FlatList } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from "react-native-maps";

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [pontosSalvos, setPontosSalvos] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false); // Novo estado para o modal

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

  useEffect(() => {
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
    carregarPontosSalvos();
  }, []);

  async function getEndereco(latitude: number, longitude: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
        {
          headers: {
            "User-Agent": "MeuApp/1.0 (contato@meuemail.com)",
          },
        }
      );
      const data = await response.json();
      return (
        data?.address?.road || data?.display_name || "Endereço não encontrado"
      );
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      return "Erro ao buscar endereço";
    }
  }

  async function carregarPontosSalvos() {
    try {
      const pontosSalvosJSON = await AsyncStorage.getItem('pontos');
      const pontos = pontosSalvosJSON ? JSON.parse(pontosSalvosJSON) : [];
      setPontosSalvos(pontos);
    } catch (error) {
      console.error("Erro ao carregar os pontos:", error);
    }
  }

  const marcarPosicao = async () => {
    if (!location) {
      Alert.alert("Erro", "Localização ainda não carregada.");
      return;
    }
    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;
    const rua = await getEndereco(latitude, longitude);

    const novoPonto = {
      latitude: latitude,
      longitude: longitude,
      rua: rua,
      dataHora: new Date().toISOString(),
    };

    try {
      const pontos = [...pontosSalvos, novoPonto];
      await AsyncStorage.setItem('pontos', JSON.stringify(pontos));
      setPontosSalvos(pontos);
      
      const mensagem = `Ponto registrado com sucesso!\n\n📍 Localização:\nLatitude: ${latitude}\nLongitude: ${longitude}\nEnd.: ${rua}\n\n🕒 Data e Hora: ${currentDateTime}`;
      Alert.alert("Confirmação", mensagem);
    } catch (error) {
      console.error("Erro ao salvar o ponto:", error);
      Alert.alert("Erro", "Não foi possível salvar o ponto. Tente novamente.");
    }
  };

  const alternarModal = () => {
    setModalVisible(!modalVisible);
  };

  type PontoSalvo = {
    latitude: number;
    longitude: number;
    rua: string;
    dataHora: string;
  };

  const renderItem = ({ item }: { item: PontoSalvo }) => (
    <View style={estilos.itemHistorico}>
      <Text style={estilos.itemTexto}>**Data/Hora:** {new Date(item.dataHora).toLocaleDateString()} - {new Date(item.dataHora).toLocaleTimeString()}</Text>
      <Text style={estilos.itemTexto}>**Endereço:** {item.rua}</Text>
      <Text style={estilos.itemTexto}>**Lat/Lon:** {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}</Text>
    </View>
  );

  return (
    <>
      <ScrollView contentContainerStyle={estilos.container}>
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
          <Text style={estilos.textoBotaoMarcar}>Marcar minha posição</Text>
        </Pressable>

        <Pressable 
          style={estilos.botaoHistorico}
          onPress={alternarModal}
        >
          <Text style={estilos.textoBotaoHistorico}>Mostrar Histórico</Text>
        </Pressable>

      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={alternarModal}
      >
        <View style={estilos.modalContainer}>
          <View style={estilos.modalContent}>
            <Text style={estilos.historicoTitulo}>Pontos Registrados</Text>
            {pontosSalvos.length > 0 ? (
              <FlatList
          data={[...pontosSalvos].sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
              />
            ) : (
              <Text style={estilos.historicoVazio}>Nenhum ponto registrado ainda.</Text>
            )}
            <Pressable 
              style={estilos.botaoFechar} 
              onPress={alternarModal}
            >
              <Text style={estilos.textoBotaoFechar}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const estilos = StyleSheet.create({
  container: {
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
  botaoHistorico: {
    backgroundColor: '#337ab7',
    borderRadius: 10,
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  textoBotaoHistorico: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Estilos do Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  historicoTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'center',
  },
  historicoVazio: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  itemHistorico: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  itemTexto: {
    fontSize: 14,
    marginBottom: 5,
  },
  botaoFechar: {
    backgroundColor: '#337ab7',
    borderRadius: 10,
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
  },
  textoBotaoFechar: {
    color: '#fff',
    fontWeight: 'bold',
  }
});