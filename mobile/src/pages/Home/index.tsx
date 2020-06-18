import React from 'react';
import { 
    View, 
    Text, 
    Image, 
    StyleSheet 
} from 'react-native';
import { AppLoading } from 'expo';
import {
    useFonts,
    Roboto_400Regular,
    Roboto_500Medium
} from '@expo-google-fonts/roboto';
import { Ubuntu_700Bold } from '@expo-google-fonts/ubuntu';

const Home = () => {

    let [fontsLoaded] = useFonts({
        Roboto_400Regular,
        Roboto_500Medium,
        Ubuntu_700Bold,
    });

    if (!fontsLoaded) return <AppLoading />

    return (
        <View style={styles.container}>
            <View style={styles.main}>
                <Image source={require('../../assets/logo.png')} />
                <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
                <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
      backgroundColor: '#F0F0F5',
    },
  
    main: {
      flex: 1,
      justifyContent: "center",
    },
  
    title: {
      color: "#322153",
      fontSize: 32,
      fontFamily: "Ubuntu_700Bold",
      maxWidth: 260,
      marginTop: 64,
    },
  
    description: {
      color: "#6C6C80",
      fontSize: 16,
      marginTop: 16,
      fontFamily: "Roboto_400Regular",
      maxWidth: 260,
      lineHeight: 24,
    },
  
    footer: {},
  
    select: {},
  
    input: {
      height: 60,
      backgroundColor: "#FFF",
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  
    button: {
      backgroundColor: "#34CB79",
      height: 60,
      flexDirection: "row",
      borderRadius: 10,
      overflow: "hidden",
      alignItems: "center",
      marginTop: 8,
    },
  
    buttonIcon: {
      height: 60,
      width: 60,
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      justifyContent: "center",
      alignItems: "center",
    },
  
    buttonText: {
      flex: 1,
      justifyContent: "center",
      textAlign: "center",
      color: "#FFF",
      fontFamily: "Roboto_500Medium",
      fontSize: 16,
    },
  });

export default Home;