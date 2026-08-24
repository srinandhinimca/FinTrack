import AsyncStorage from "@react-native-async-storage/async-storage"
import {createClient} from "@supabase/supabase-js"
import { Platform } from "react-native"

const supabaseUrl=process.env.EXPO_PUBLIC_SUPABASE_URL
const supabasePublishableKey=process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if(!supabaseUrl ||!supabasePublishableKey){
    throw new Error("Please provide the secret keys")
}
export const supabase=createClient(supabaseUrl,supabasePublishableKey,{
    auth:{
        storage: Platform.OS !== "web" ? AsyncStorage : undefined,
        persistSession:true,
        autoRefreshToken:true,
        detectSessionInUrl:false
    }
})