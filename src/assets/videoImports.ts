// Импорты всех видео файлов для корректной сборки
import idle from './idle.mp4'

// Русские видео
import home_ru from './video/home_new_ru-0.mp4'
import language_ru from './video/language_ru.mp4'
import doctors_authorized_paid_ru from './video/doctors_authorized_paid_ru.mp4'
import doctors_authorized_ru from './video/doctors-authorized_ru.mp4'
import IDcheck_ru from './video/IDcheck_ru.mp4'
import info_about_services_charters_ru from './video/info_about_services_charters_ru.mp4'
import info_about_services_questions_ru from './video/info_about_services_questions_ru.mp4'
import registration_confirmation_ru from './video/registration_confirmation_ru.mp4'
import registration_paid_ru from './video/registration_paid_ru.mp4'
import registration_ru from './video/registration_ru.mp4'
import search_ru from './video/search_ru.mp4'
import search_result_pay_ru from './video/search_result_pay_ru.mp4'
import services_ru from './video/services_ru.mp4'
import services_authorized_ru from './video/services-authorized_ru.mp4'
import talon_ru from './video/talon_ru.mp4'


// Казахские видео
import home_kz from './video/home_new_kz-1.mp4'
import language_kz from './video/language_kz.mp4'
import doctors_authorized_paid_kz from './video/doctors_authorized_paid_kz.mp4'
import doctors_authorized_kz from './video/doctors-authorized_kz.mp4'
import IDcheck_kz from './video/IDcheck_kz.mp4'
import info_about_services_charters_kz from './video/info_about_services_charters_kz.mp4'
import info_about_services_questions_kz from './video/info_about_services_questions_kz.mp4'
import registration_confirmation_kz from './video/registration_confirmation_kz.mp4'
import registration_paid_kz from './video/registration_paid_kz.mp4'
import registration_kz from './video/registration_kz.mp4'
import search_kz from './video/search_kz.mp4'
import search_result_pay_kz from './video/search_result_pay_kz.mp4'
import services_kz from './video/services_kz.mp4'
import services_authorized_kz from './video/services-authorized_kz.mp4'
import talon_kz from './video/talon_kz.mp4'


export const videoAssets = {
  idle,
  ru: [
    home_ru,
    language_ru,
    doctors_authorized_paid_ru,
    doctors_authorized_ru,
    IDcheck_ru,
    info_about_services_charters_ru,
    info_about_services_questions_ru,
    registration_confirmation_ru,
    registration_paid_ru,
    registration_ru,
    search_ru,
    search_result_pay_ru,
    services_ru,
    services_authorized_ru,
    talon_ru
  ],
  kk: [
    home_kz,
    language_kz,
    doctors_authorized_paid_kz,
    doctors_authorized_kz,
    IDcheck_kz,
    info_about_services_charters_kz,
    info_about_services_questions_kz,
    registration_confirmation_kz,
    registration_paid_kz,
    registration_kz,
    search_kz,
    search_result_pay_kz,
    services_kz,
    services_authorized_kz,
    talon_kz
  ],
  // Специфичные видео для каждой страницы
  pageSpecific: {
    main: {
      ru: [idle],
      kk: [idle]
    },
    home: {
      ru: [home_ru],
      kk: [home_kz]
    },
    language: {
      ru: [language_ru, language_kz, idle],
      kk: [language_kz, language_ru, idle]
    },
    doctors: {
      ru: [doctors_authorized_paid_ru, doctors_authorized_ru],
      kk: [doctors_authorized_paid_kz, doctors_authorized_kz]
    },
    services: {
      ru: [services_ru, services_authorized_ru],
      kk: [services_kz, services_authorized_kz]
    },
    search: {
      ru: [search_ru, search_result_pay_ru],
      kk: [search_kz, search_result_pay_kz]
    },
    registration: {
      ru: [registration_ru, registration_paid_ru, registration_confirmation_ru],
      kk: [registration_kz, registration_paid_kz, registration_confirmation_kz]
    },
    info: {
      ru: [info_about_services_charters_ru, info_about_services_questions_ru],
      kk: [info_about_services_charters_kz, info_about_services_questions_kz]
    },
    infoService: {
      ru: [info_about_services_charters_ru],
      kk: [info_about_services_charters_kz]
    },
    infoDetails: {
      ru: [info_about_services_questions_ru],
      kk: [info_about_services_questions_kz]
    },
    talon: {
      ru: [talon_ru],
      kk: [talon_kz]
    },
    checkin: {
      ru: [IDcheck_ru],
      kk: [IDcheck_kz]
    },
    chat: {
      ru: [idle],
      kk: [idle]
    }
  }
}
