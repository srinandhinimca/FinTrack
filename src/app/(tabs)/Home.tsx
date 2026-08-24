import { useAuth } from '@/context/AuthProvider';
import { Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Home = () => {
  const{signOut}=useAuth();

  const handleSignOut=async()=>{
     try{
        await signOut();
     } catch(error:any){
      alert(error.message)
     }
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        <Text style={styles.Text}>Welcome User!!!</Text>
      </View>
      <View>
            <Button title='Logout' onPress={handleSignOut} />
      </View>


    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({
  headerArea: {
    flex: 0.4,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center'
  },
  contentArea: {
    flex: 0.6,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center'
  },
  Text: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white'
  }
})