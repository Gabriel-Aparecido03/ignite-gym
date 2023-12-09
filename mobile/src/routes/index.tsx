import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { AuthRoutes } from "./auth.routes";
import { Box, useTheme } from "native-base";
import { AppRoutes } from "./app.routes";
import { useAuth } from "@hooks/useAuth";
import { Loading } from "@components/Loading";
import { useEffect, useState } from "react";
import { NotificationWillDisplayEvent, OSNotification, OneSignal } from "react-native-onesignal";
import { Notification } from "@components/Notification";

export function Routes() {

  const { colors } = useTheme()

  const { user, isLoadingUserStorageData } = useAuth()

  const theme = DefaultTheme
  theme.colors.background = colors.gray[700]

  const [ notification , setNotification ] = useState<OSNotification | null >(null)

  useEffect(()=>{
    const unsubscribe = OneSignal.Notifications.addEventListener('foregroundWillDisplay',(e : NotificationWillDisplayEvent )=>{
      const response =  e.getNotification()
      setNotification(response)
    })

    return unsubscribe
  },[])

  if(isLoadingUserStorageData) return <Loading />

  return (
    <Box flex={1} bg="red.700">
      <NavigationContainer theme={theme}>
        { user.id ? <AppRoutes />  : <AuthRoutes /> }
        { notification?.title && <Notification data={notification} onClose={() => setNotification(null)}/>}
      </NavigationContainer>
    </Box>
  )
}