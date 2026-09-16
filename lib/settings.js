import path from 'node:path'
import { ensureDir, readJson, settingsPath, writeJson } from './storage.js'

export { settingsPath }

export const defaultSettings = {
  global: {
    botEnabled: true,
    welcome: true,
    nsfw: false,
    antiprivado: true,
    modoadmin: false,
    msgWelcome: '🌸 Hola @user~\n\nBienvenido/a a *『@group』* ✨  \nMe alegra tenerte por aquí.\n\n💬 Escribe *#menu* para ver lo que puedo hacer.\n\n📌 *Lee la descripción del grupo, ¿sí?*  \n> *@desc*\n\n🎀 Disfruta tu estancia… o te jalo las orejas 😘',
    msgBye: '👋 Adiós, @user~\n\nGracias por haber estado en *『@group』*.  \nTe deseamos lo mejor por allá.\n\n🎀 Las puertas quedan abiertas…  \npero no te olvides de nosotros 😘',
    msgBan: '🔨 @user fue expulsado/a\n\nEn *『@group』* hay reglas,  \ny no cumplirlas tiene consecuencias.\n\n🎀 Sin rencores…  \npero aquí se cuida el orden 😌'
  },
  groups: {}
}

function mergeSettings(base, incoming) {
  const source = incoming && typeof incoming === 'object' ? incoming : {}
  return {
    global: {
      ...base.global,
      ...(source.global && typeof source.global === 'object' ? source.global : {})
    },
    groups: source.groups && typeof source.groups === 'object' ? source.groups : {}
  }
}

export async function ensureSettingsFile() {
  ensureDir(path.dirname(settingsPath))
  const current = await readJson(settingsPath, defaultSettings)
  const normalized = mergeSettings(defaultSettings, current)
  await writeJson(settingsPath, normalized)
  return normalized
}

export async function loadSettings() {
  return ensureSettingsFile()
}

export async function saveSettings(settings) {
  const normalized = mergeSettings(defaultSettings, settings)
  await writeJson(settingsPath, normalized)
  return normalized
}

export async function ensureGroupSettings(groupId) {
  const settings = await loadSettings()
  if (!settings.groups[groupId]) settings.groups[groupId] = {}
  return settings
}

export async function isBotEnabledForGroup(groupId) {
  const settings = await loadSettings()
  const groupConfig = settings.groups?.[groupId] || {}
  return groupConfig.botEnabled ?? settings.global?.botEnabled ?? true
}

export async function isAdminModeForGroup(groupId) {
  const settings = await loadSettings()
  const groupConfig = settings.groups?.[groupId] || {}
  return groupConfig.modoadmin ?? settings.global?.modoadmin ?? false
}
