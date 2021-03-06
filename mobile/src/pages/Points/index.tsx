import React, { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { Feather as Icon } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import { 
    View, 
    StyleSheet, 
    Text,
    Image, 
    TouchableOpacity, 
    ScrollView,
    Alert 
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location';
import api from '../../services/api';

// Formato do vetor armazenado no estado
interface Item {
    id: number;
    title: string;
    image: string;
}

const Points = () => {
    // Estados
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    const navigation = useNavigation();

    useEffect( () => {
        async function loadPosition() {
          const { status } = await Location.requestPermissionsAsync();
    
          if (status !== 'granted') {
            Alert.alert(
              'Ooooops...',
              'Precisamos de sua permissão para obter a localização',
            );
            return;
          }
    
          const location = await Location.getCurrentPositionAsync();
    
          const { latitude, longitude } = location.coords;
          console.log(latitude + ', ' + longitude);
          setInitialPosition([latitude, longitude]);
          //setInitialPosition([-22.7161901, -46.7962328]);
        }
    
        loadPosition();
    }, []);

    useEffect( () => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    }, []);

    function handleNavigateBack() {
        navigation.goBack();
    }

    function handleNavigateToDetail() {
        navigation.navigate('Detail');
    }

    /**
     * Funcao para definir os itens de coleta selecionados pelo usuario
     * Se o item estiver selecionado, o spread operator, garante que se id
     * nao sera sobrescrito qdo o estado for alterado. Caso um item for 
     * desmarcado, atraves do metodo filter, garantimos que os demais itens
     * nao sejam sobrescritos na alteracao do estado.
     * @param id 
     */
    function handleSelectedItem(id: number) {
        let alreadySelected = selectedItems.findIndex(item => item === id);
        if (alreadySelected >= 0) {
            let filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([ ...selectedItems, id ]);
        }
    }

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigateBack}>
                    <Icon name="chevron-left" size={20} color="#34cb79" />
                </TouchableOpacity>

                <Text style={styles.title}>Bem vindo!</Text>
                <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

                <View style={styles.mapContainer}>
                    {initialPosition[0] !== 0 && (
                        <MapView 
                            style={styles.map} 
                            initialRegion={{
                                latitude: initialPosition[0],
                                longitude: initialPosition[1],
                                latitudeDelta: 0.009,
                                longitudeDelta: 0.009,
                            }} 
                        >

                            <Marker 
                                style={styles.mapMarker}
                                onPress={handleNavigateToDetail}
                                coordinate={{
                                    latitude: -22.7132641,
                                    longitude: -46.7923724,
                                }}
                            >
                                <View style={styles.mapMarkerContainer}>
                                    <Image 
                                        style={styles.mapMarkerImage} 
                                        source={{ uri: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60" }} 
                                    />
                                    <Text style={styles.mapMarkerTitle}>Mercado</Text>
                                </View>
                            </Marker>
                        </MapView>
                    )}
                </View>
            </View>

            <View style={styles.itemsContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={ {paddingHorizontal: 20} }
                >
                    {items.map(item => (
                        <TouchableOpacity 
                            key={String(item.id)} 
                            style={[
                                styles.item,
                                selectedItems.includes(item.id) ? styles.selectedItem : {}
                            ]} 
                            onPress={ () => handleSelectedItem(item.id) } 
                            activeOpacity={0.6}
                        >
                        <SvgUri width={42} height={42} uri={item.image} />
                        <Text style={styles.itemTitle}>{item.title}</Text>
                    </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20 + Constants.statusBarHeight,
    },
    
    title: {
      fontSize: 20,
      fontFamily: "Ubuntu_700Bold",
      marginTop: 24,
    },
  
    description: {
      color: "#6C6C80",
      fontSize: 16,
      marginTop: 4,
      fontFamily: "Roboto_400Regular",
    },
  
    mapContainer: {
      flex: 1,
      width: "100%",
      borderRadius: 10,
      overflow: "hidden",
      marginTop: 16,
      borderStyle: "solid",
      borderColor: "#DDD",
      borderWidth: 1
    },
  
    map: {
      width: "100%",
      height: "100%",
    },
  
    mapMarker: {
      width: 90,
      height: 80,
    },
  
    mapMarkerContainer: {
      width: 90,
      height: 70,
      backgroundColor: "#34CB79",
      flexDirection: "column",
      borderRadius: 5,
      overflow: "hidden",
      alignItems: "center",
    },
  
    mapMarkerImage: {
      width: 90,
      height: 45,
      resizeMode: "cover",
    },
  
    mapMarkerTitle: {
      flex: 1,
      fontFamily: "Roboto_400Regular",
      color: "#FFF",
      fontSize: 13,
      lineHeight: 23,
    },
  
    itemsContainer: {
      flexDirection: "row",
      marginTop: 16,
      marginBottom: 32,
    },
  
    item: {
      backgroundColor: "#fff",
      borderWidth: 2,
      borderColor: "#eee",
      height: 120,
      width: 120,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
      marginRight: 8,
      alignItems: "center",
      justifyContent: "space-between",
  
      textAlign: "center",
    },
  
    selectedItem: {
      borderColor: "#34CB79",
      borderWidth: 2,
    },
  
    itemTitle: {
      fontFamily: "Roboto_400Regular",
      textAlign: "center",
      fontSize: 13,
    },
  });

export default Points;
