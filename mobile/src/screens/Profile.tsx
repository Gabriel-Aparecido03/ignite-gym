import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { Center, Heading, ScrollView, Skeleton, Text, VStack, useToast } from "native-base";
import { useState } from "react";
import {  TouchableOpacity } from "react-native";
import defaultUserImage from '@assets/userPhotoDefault.png'
import * as yup from 'yup'

import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@hooks/useAuth";
import { yupResolver } from "@hookform/resolvers/yup";
import { AppError } from "@utils/AppError";
import { api } from "@services/api";

const PHOTO_SIZE = 33;

const profileSchema = yup.object({
  name : yup.string().required('Name is required'),
  password :  yup.string().min(6,'The password need to have 6 characters').nullable().transform((value)=> !!value ? value : null),
  confirm_password : yup.string().nullable().transform((value)=> !!value ? value : null).oneOf([yup.ref('password'),undefined],'Passwords need to match').when('password',{ is: (Field:any)=> Field, then : (schema) => schema.nullable().required('The password confirmation id required.').transform((value)=> !!value ? value : null)}),
  email : yup.string().required(''),
  old_password : yup.string()
})

type FormDataProps = {
  name: string;
  password?: string | null | undefined;
  confirm_password?: string | null | undefined;
  email: string;
  old_password?: string | undefined;
}

export function Profile() {

  const [photoIsLoading, setPhotoIsLoading] = useState(true)
  const [userPhoto, setUserPhoto] = useState('')
  const [ isSubmitting,setIsSubmitting ] = useState(false)

  const toast = useToast()
  const { user ,updateUserProfile } = useAuth()

  const { control,handleSubmit,formState : { errors } } = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email
    },
    resolver : yupResolver(profileSchema)
  })

  async function handleProfileUpdate(data : FormDataProps) {
    try {
      setIsSubmitting(true)
      const newUserProfile = user
      newUserProfile.name = data.name

      await api.put('/users',data)
      await updateUserProfile(newUserProfile)

      toast.show({
        title : 'Profile update with sucess',
        placement : 'bottom',
        bgColor : 'green.500'
      })
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Its not possible to update account , try later.'
      toast.show({
        title,
        placement : 'bottom',
        bgColor : 'red.500'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUserPhotoSelect() {
    setPhotoIsLoading(true)
    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true
      });

      if (photoSelected.canceled) return
      if (photoSelected.assets[0].uri) {
        const photoInfo = await FileSystem.getInfoAsync(photoSelected.assets[0].uri)
        if (photoInfo.exists && (photoInfo.size / 1024 / 1024 >= 5)) {
          return toast.show({
            title: 'That images size cant be pass 5 mbs',
            placement: 'bottom',
            bgColor: 'red.500'
          })
        }
        const fileExtension = photoSelected.assets[0].uri
        const photoFile = {
          name : `${user.name}.${fileExtension}`.toLowerCase(),
          uri : photoSelected.assets[0].uri,
          type : `${photoSelected.assets[0].type}/${fileExtension}`
        } as any

        const userPhotoUploadForm = new FormData()
        userPhotoUploadForm.append('avatar',photoFile)

        const avatarUpdatedResponse = await api.patch('/users/avatar',userPhotoUploadForm,{
          headers : {
            'Content-Type':'multipart/form-data'
          }
        });

        const userUpdated = user;
        userUpdated.avatar =avatarUpdatedResponse.data.avatar

        updateUserProfile(userUpdated)

        toast.show({
          title : 'Photo updated with success',
          placement : 'bottom',
          bgColor : 'green.500'
        })
      }
    } catch (error) { }
    finally {
      setPhotoIsLoading(false)
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="profile" />
      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <Center mt={6} px={10}>
          {photoIsLoading ?
            <Skeleton
              w={PHOTO_SIZE}
              h={PHOTO_SIZE}
              rounded={"full"}
              startColor={"gray.500"}
              endColor={"gray.400"}
            />
            :
            <UserPhoto alt="" size={PHOTO_SIZE} source={ user.avatar ? { uri : `${api.defaults.baseURL}/avatar/${user.avatar}`} : defaultUserImage } />
          }

          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text color="green.500" fontWeight="bold" fontSize="md" mt={12} alignSelf={"flex-start"}>Change Photo</Text>
          </TouchableOpacity>

          <Controller
            control={control}
            render={({ field: { value, onChange } }) => <Input
              placeholder="Name"
              bg={"gray.600"}
              value={value}
              onChangeText={onChange}
              errorMessage={errors.name?.message}
            />
            }
            name="name"
          />

          <Controller
            control={control}
            render={({ field: { value, onChange } }) => <Input
              placeholder="Email"
              bg={"gray.600"}
              isDisabled
              value={value}
              onChangeText={onChange}
              errorMessage={errors.email?.message}
            />
            }
            name="email"
          />
        </Center>
        <VStack px={10} mt={12} mb={9}>
          <Heading fontFamily={"heading"} color={"gray.200"} fontSize={"md"} mb={2}>change password</Heading>

          <Controller
            control={control}
            render={({ field: { value, onChange } }) => <Input
              placeholder="Old passowrd"
              bg={"gray.600"}
              value={value}
              onChangeText={onChange}
              errorMessage={errors.old_password?.message}
              secureTextEntry
            />
            }
            name="old_password"
          />

          <Controller
            control={control}
            render={({ field: { value, onChange } }) => <Input
              placeholder="New passoword"
              bg={"gray.600"}
              value={value ?? ''}
              onChangeText={onChange}
              errorMessage={errors.password?.message}
              secureTextEntry
            />
            }
            name="password"
          />

          <Controller
            control={control}
            render={({ field: { value, onChange } }) => <Input
              placeholder="Confirm passoword"
              bg={"gray.600"}
              value={value ?? ''}
              onChangeText={onChange}
              errorMessage={errors.confirm_password?.message}
              secureTextEntry
            />
            }
            name="confirm_password"
          />

        </VStack>

        <Button isLoading={isSubmitting} disabled={isSubmitting} onPress={handleSubmit(handleProfileUpdate)} title="update" mt={4} />
      </ScrollView>
    </VStack>
  )
}