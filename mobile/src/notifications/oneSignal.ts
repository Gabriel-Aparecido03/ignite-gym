import { OneSignal } from "react-native-onesignal";

export function createTagAboutLastExerciseOfUser(date : string) {
  OneSignal.User.addTag('last_exercise',date)
}

export function removeTagAboutLastExerciseOfUser() {
  OneSignal.User.removeTag('last_exericise')
}

export function addTagUserLogged(email:string) {
  OneSignal.User.addTag('user_not_logged',email)
}

export function removeTagUserLogged() {
  OneSignal.User.removeTag('user_not_logged')
}