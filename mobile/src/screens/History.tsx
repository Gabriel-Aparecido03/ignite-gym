import { HistoryCard } from "@components/HistoryCard";
import { Loading } from "@components/Loading";
import { ScreenHeader } from "@components/ScreenHeader";
import { HistoryByDayDTO } from "@dtos/HistoryByDayDTO";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { Heading, VStack, SectionList, Text, useToast } from "native-base";
import { useCallback, useState } from "react";

export function History() {

  const [ isLoading, setIsLoading ] = useState(false)
  const [ exercices, setExercises ] = useState<HistoryByDayDTO[]>([])

  const toast = useToast()

  async function fetchHistory() {
    try {
      setIsLoading(true)
      const response = await api.get('/history')
      setExercises(response.data)
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

  useFocusEffect(useCallback(()=>{
    fetchHistory() 
  },[]))

  return (
    <VStack flex={1}>
      <ScreenHeader title="lorem" />
      { isLoading ? <Loading /> : <SectionList 
        sections={exercices} 
        keyExtractor={item => item.id}
        renderItem={({ item }) =>(
          <HistoryCard data={item} /> 
        )}
        renderSectionHeader={({ section}) => (
          <Heading color={"gray.200"} fontSize={"md"} mt={10} mb={3}>
            { section.title}
          </Heading>
        )} 
        px={8}
        ListEmptyComponent={()=>( 
          <Text color="gray.100" textAlign="center">There is any exercises in your history</Text>
        )}
        contentContainerStyle={[].length === 0 && { flex : 1 ,justifyContent : 'center',alignItems: 'center'} }
        showsVerticalScrollIndicator={false}
      />}
    </VStack>
  )
}