import { writable } from "svelte/store"

export const selectedTitle = writable("New Session")
export const activeMenuItem = writable("New Session")

export type Message = { sender: "me" | "ai"; text: string }

export const messages = writable<Message[]>([])
