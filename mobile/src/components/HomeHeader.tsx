import {  Heading, Text, Icon, VStack, HStack } from "native-base";
import { UserPhoto } from "./UserPhoto";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons"
import { TouchableOpacity } from "react-native";
import { useAuth } from "@hooks/useAuth";
import defaultUserImage from '@assets/userPhotoDefault.png'
import { api } from "@services/api";
export function HomeHeader() {

  const { user,singOut } = useAuth()

  return (
    <HStack bg="gray.600" pt={16} pb={5} px={8} alignItems="center" justifyContent="space-between" >
      <HStack alignItems="center">
        <UserPhoto
          size={16}
          source={ user.avatar ? { uri : `${api.defaults.baseURL}/avatar/${user.avatar}`} : defaultUserImage }
          alt="user photo profile"
          mr={4}
        />
        <VStack>
          <Text color="gray.100" fontSize="md">Hello</Text>
          <Heading color="gray.100" fontSize="md" fontFamily={"heading"}>{ user.name }</Heading>
        </VStack>
      </HStack>
      <TouchableOpacity onPress={singOut}>
        <Icon as={MaterialIcons} name="logout" color={"gray.200"} size={7} />
      </TouchableOpacity>
    </HStack>
  )
}