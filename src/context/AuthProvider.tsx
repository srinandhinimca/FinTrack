import { Session, User } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean

  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)
export const AuthProvider = ( { children }: { children: React.ReactNode } ) => {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        const initializeSession = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
    }

    initializeSession()

    const {data: { subscription }} = supabase.auth.onAuthStateChange(
        (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
    })
    return ()=> {
        subscription.unsubscribe()
    }
    },[])

    const signUp = async (email: string, password: string) => {
        setLoading(true)
        const { error } = await supabase.auth.signUp({ email, password })
        setLoading(false)
        if (error) throw error
    }

    const signIn = async (email: string, password: string) => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        setLoading(false)
        if (error) throw error
    }

    const signOut = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signOut()
        setLoading(false)
        if (error) throw error
    }

    return (
        <AuthContext.Provider
         value={{ session, user, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}