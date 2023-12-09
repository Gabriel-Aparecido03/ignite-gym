import { Group } from "@components/Group";
import { HomeHeader } from "@components/HomeHeader";
import { FlatList, HStack, Heading, Text, VStack, useToast } from "native-base";
import React, { useCallback, useEffect, useState } from "react";
import { Exercise } from "./Exercise";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { AppError } from "@utils/AppError";
import { api } from "@services/api";
import { ExerciseCard } from "@components/ExerciseCard";
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { Loading } from "@components/Loading";

export function Home() {

  const [isLoading, setIsLoading ] = useState(false)
  const [groupSelected, setGroupSelected] = useState('back')
  const [groups, setGroups] = useState<string[]>([])
  const [exercise, setExercise] = useState<ExerciseDTO[]>([])

  const toast = useToast()

  const navigation = useNavigation<AppNavigatorRoutesProps>()

  function handleOpenExercisesDetails(exerciseId: string) {
    navigation.navigate('exercise',{ exerciseId })
  }

  async function fetchGroups() {
    try {
      const response = await api.get('/groups')
      setGroups([...response.data])
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Unmapped error , try later.'
      toast.show({
        title,
        placement : 'bottom',
        bgColor : 'red.500'
      })
    }
  }

  async function fetchExercisesByGroup() {
    try {
      setIsLoading(true)
      const response = await api.get(`/exercises/bygroup/${groups}`)
      setExercise([...response.data])
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Unmapped error , try later.'
      toast.show({
        title,
        placement : 'bottom',
        bgColor : 'red.500'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(()=>{
    fetchGroups()
  },[])

  useFocusEffect(useCallback(()=>{
    fetchExercisesByGroup()
  },[groupSelected]))

  return (
    <VStack flex={1}>
      <HomeHeader />
      <FlatList
        data={groups}
        keyExtractor={item => item}
        renderItem={({ item }) => <Group
          name={item}
          isActive={groupSelected.toUpperCase() === item.toUpperCase()}
          onPress={() => { setGroupSelected(item) }}
        />}
        horizontal
        showsHorizontalScrollIndicator={false}
        _contentContainerStyle={{ px: 8 }}
        my={10}
        maxH={10}
        minH={10}
      />
      { isLoading ? <Loading /> :
      <VStack flex={1} px={8}>
      <HStack justifyContent="space-between" mb={5} >
        <Heading
          fontFamily={"heading"}
          color="gray.200"
          fontSize="md"
        >
          Exercises
        </Heading>
        <Text color="gray.200" fontSize="sm">{exercise.length}</Text>
      </HStack>

      <FlatList
        data={exercise}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ExerciseCard data={item} onPress={()=>{handleOpenExercisesDetails(item.id)}}/>}
        showsVerticalScrollIndicator={false}
        _contentContainerStyle={{ paddingBottom: 20 }}
      />
    </VStack> }
    </VStack>
  )
}