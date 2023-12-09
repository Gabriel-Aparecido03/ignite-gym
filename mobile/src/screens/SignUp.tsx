import { VStack, Image, Text, Center, Heading, ScrollView, useToast } from "native-base";
import Backgroundimg from '@assets/background.png'
import LogoSvg from '@assets/logo.svg'
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { useNavigation } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { isLoading } from "expo-font";
import { useState } from "react";
import { useAuth } from "@hooks/useAuth";

const signUpSchema = yup.object({
  name : yup.string().required('Invalid name'),
  email : yup.string().required('Invalid email').email('Invalid email'),
  password : yup.string().required('Invalid password').min(6),
  password_confirm : yup.string().required('Invalid password').oneOf([yup.ref('password')],'The password need to be equals !'),
})

type FormDataProps = {
  name: string
  email: string
  password: string
  password_confirm: string
}

export function SignUp() {

  const [ isLoading, setIsLoading ] = useState(false)

  const toast = useToast()
  const { signIn } = useAuth()

  const navigation = useNavigation()

  function handleGoBack() {
    navigation.goBack()
  }

  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirm: ""
    },
    resolver : yupResolver(signUpSchema)
  })

  async function handleSignUp({ email,name,password }: FormDataProps) {
    setIsLoading(true)
    try {
      await api.post('/users',{ email, name, password })
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
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack px={10} flex={1}>
        <Image
          source={Backgroundimg}
          defaultSource={Backgroundimg}
          alt="People trainning"
          resizeMode="contain"
          position="absolute"
        />
        <Center my={24}>
          <LogoSvg />
          <Text>Train your body and mind</Text>
        </Center>
        <Center>
          <Heading color={"gray.100"} fontSize="xl" mb={6} fontFamily={"heading"}>
            Create yout accont
          </Heading>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) =>
              <Input
                placeholder="name"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            }
          />

          {errors.name && <Text color="white">{errors.name.message}</Text>}

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

          <Controller
            control={control}
            name="password_confirm"
            render={({ field: { onChange, value } }) =>
              <Input
                placeholder="passowrd_confirm"
                onChangeText={onChange}
                value={value}
                secureTextEntry
                onSubmitEditing={handleSubmit(handleSignUp)}
                returnKeyType="send"
                errorMessage={errors.password_confirm?.message}
              />
            }
          />
          <Button isLoading={isLoading} title="Create and access" onPress={handleSubmit(handleSignUp)} />
        </Center>
        <Button mt={12} title="Go to login screen" onPress={handleGoBack} variant={"outline"} />
      </VStack>
    </ScrollView>
  )
}