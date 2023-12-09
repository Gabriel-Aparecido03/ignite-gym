import { VStack, Image, Text, Center, Heading, ScrollView, useToast } from "native-base";
import backgroundImg from '@assets/background.png'
import LogoSvg from '@assets/logo.svg'
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { useNavigation } from "@react-navigation/native";
import { AuthNavigatorRoutesProps } from "@routes/auth.routes";
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@hooks/useAuth";
import { AppError } from "@utils/AppError";
import { useState } from "react";

const signUpSchema = yup.object({
  email : yup.string().required('Invalid email').email('Invalid email'),
  password : yup.string().required('Invalid password').min(6),
})

type FormDataProps = {
  email: string
  password: string
}

export function SignIn() {

  const [ isLoading , setIsLoading ] = useState(false)

  const navigation = useNavigation<AuthNavigatorRoutesProps>()

  const { signIn } = useAuth()
  const toast = useToast()

  function handleNewAccount() {
    navigation.navigate("signUp")
  }

  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver : yupResolver(signUpSchema)
  })

  async function handleSignIn({ email,password }: FormDataProps) {
    try {
      setIsLoading(true)
      await signIn(email,password)
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Its not possible to create account , try later.'
      toast.show({
        title,
        placement : 'bottom',
        bgColor : 'red.500'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ScrollView 
      contentContainerStyle={{ flexGrow : 1 }} 
      showsVerticalScrollIndicator={false}
    >
      <VStack px={10} flex={1} >
        <Image
          source={backgroundImg}
          defaultSource={backgroundImg}
          alt="People trainning"
          resizeMode="contain"
          position={"absolute"}
        />
        <Center my={24}>
          <LogoSvg />
          <Text color={"white"}>Train your body and mind</Text>
        </Center>
        <Center> 
          <Heading fontFamily={"heading"} color={"gray.100"} fontSize="xl" mb={6}>
            Access your account
          </Heading>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) =>
              <Input
                placeholder="email"
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
                errorMessage={errors.email?.message}
              />
            }
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) =>
              <Input
                placeholder="password"
                onChangeText={onChange}
                value={value}
                secureTextEntry
                errorMessage={errors.password?.message}
              />
            }
          />
          <Button title="access" onPress={handleSubmit(handleSignIn)} isLoading={isLoading} />
        </Center>
        <Center mt={24}>
          <Text color={"gray.100"} fontSize={"sm"} mb={3} fontFamily={"body"}>Dont have account </Text>
          <Button onPress={handleNewAccount} title="Create your account" variant={"outline"} />
        </Center>
      </VStack>
    </ScrollView>
  )
}