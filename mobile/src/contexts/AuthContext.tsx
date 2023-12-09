import { UserDTO } from "@dtos/UserDTO";
import { ReactNode, createContext, useEffect, useState } from "react";
import { api } from "@services/api";
import { storageUserGet, storageUserRemove, storageUserSave } from "@storage/storageUser";
import { storageAuthTokenGet, storageAuthTokenRemove, storageAuthTokenSave } from "@storage/storageAuthToken";
import { addTagUserLogged, removeTagUserLogged } from "src/notifications/oneSignal";

export type AuthContextDataProps = {
  user : UserDTO
  signIn: ( email :string , password : string  ) => Promise<void>
  isLoadingUserStorageData : boolean
  signOut: () => Promise<void>,
  updateUserProfile: (userUpdated:UserDTO) => Promise<void>
}

type AuthContextProviderProps = {
  children : ReactNode
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps)

export function AuthContextProvider({ children }: AuthContextProviderProps ) {

  const [ user,setUser ] = useState({} as UserDTO)
  const [ isLoadingUserStorageData, setIsLoadingUserStorageData ] = useState(false)

  async function userAndTokenUpdate(userData:UserDTO , token:string) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
  }

  async function userAndTokenSaveAtStorage(userData:UserDTO , token:string ,refresh_token:string) {
    try {
      await storageAuthTokenSave(token,refresh_token)
      await storageUserSave(userData)
    } catch (error) {}
  }

  async function signIn(email :string , password : string ) {
    setIsLoadingUserStorageData(true)
    try {
      const { data } = await api.post('/sessions',{ email ,password }) 
      if(data.user && data.token && data.refresh_token) {
        await userAndTokenUpdate(data.user,data.token)
        await userAndTokenSaveAtStorage(data.user,data.token,data.refresh_token)
        addTagUserLogged(email)
      }
    } catch (error) {}
    finally {
      setIsLoadingUserStorageData(false)
    }
  }

  async function signOut() {
    try {
      setIsLoadingUserStorageData(true)
      setUser({} as UserDTO)
      await storageUserRemove()
      await storageAuthTokenRemove()
      removeTagUserLogged()
    } catch (error) {}
    finally {
      setIsLoadingUserStorageData(false)
    }
  }

  async function updateUserProfile(userUpdated : UserDTO) {
    try {
      setUser(userUpdated)
      await storageUserSave(userUpdated)
    } catch (error) {}
  }

  async function loadUserData() {
    try {
      setIsLoadingUserStorageData(true)
      const userLogged = await storageUserGet()
      const { token } = await storageAuthTokenGet()

      if(userLogged) {
        userAndTokenUpdate(userLogged,token)
      }
    } catch (error) {
      
    } finally {
      setIsLoadingUserStorageData(false)
    }
  }

  useEffect(()=>{
    loadUserData()
  },[])

  useEffect(()=>{
    const subscribe = () => api.registerInterceptorsManager(signOut)

    return ()=> {
      subscribe()
    }
  },[])

  return (
    <AuthContext.Provider 
      value={{
        user,
        signIn,
        isLoadingUserStorageData,
        signOut,
        updateUserProfile
      }}
    >
      { children }
    </AuthContext.Provider>
  )
}